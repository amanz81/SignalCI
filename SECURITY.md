# SignalCI Security Architecture (v1.0)

This document outlines the security measures implemented in SignalCI to protect webhooks, user data, and system resources.

## 1. The Perimeter: Protecting the Webhook (Ingestion)

### 1.1 Secure Token URLs

**Problem**: Sequential IDs like `/api/webhook/pipeline-1` are easily guessable by attackers.

**Solution**: Capability URLs with 32-byte random hex tokens.

- **Format**: `/api/webhook/v1/{64-character-hex-token}`
- **Generation**: Cryptographically secure random bytes (32 bytes = 64 hex chars)
- **Example**: `/api/webhook/v1/a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

**Implementation**:
- Tokens are generated using `crypto.randomBytes(32)` in `src/lib/security.ts`
- Each pipeline gets a unique, unguessable token
- Token rotation endpoint: `POST /api/pipelines/{id}/rotate-token`

### 1.2 Payload Secret Validation

**Problem**: TradingView (Standard Plan) doesn't sign requests with HMAC.

**Solution**: Optional payload secret that must be included in the webhook payload.

**User Setup**:
1. User sets a "Signal Secret" in the pipeline configuration (e.g., "MoonLanding2024")
2. User must add `{"auth_secret": "MoonLanding2024"}` to their TradingView alert message
3. Backend validates the secret before processing

**Implementation**:
- Stored in `Pipeline.signalSecret` (optional field)
- Validated in `src/app/api/webhook/v1/[token]/route.ts`
- If no secret is set, validation is skipped (backward compatible)

### 1.3 Rate Limiting (Anti-DDoS)

**Problem**: Trading algorithms can spiral, or attackers can flood endpoints.

**Solution**: Upstash Ratelimit with Redis backend.

**Policy**: 10 requests per 10 seconds per identifier (IP + Token combination)

**Implementation**:
- Uses `@upstash/ratelimit` and `@upstash/redis`
- Sliding window algorithm
- Returns `429 Too Many Requests` when exceeded
- Rate limit headers included in responses

**Environment Variables Required**:
```bash
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## 2. The Fortress: Protecting User Keys (Data)

### 2.1 Supabase Vault Integration

**Problem**: Plain text API keys in database = company-ending security breach.

**Solution**: Supabase Vault with transparent column encryption (AES-256-GCM).

**Architecture**:
- API keys are encrypted using Supabase Vault
- Database stores only a `keyId` reference
- Decryption key never leaves Supabase's secure environment
- Write-only: UI cannot read keys back to users

**Implementation**:
- `ApiKey` model in Prisma schema with `keyId` field
- Vault functions in `src/lib/vault.ts`:
  - `storeApiKey()` - Encrypt and store
  - `retrieveApiKey()` - Decrypt (only during execution)
  - `deleteApiKey()` - Remove from Vault

**Status**: Placeholder implementation. Production requires:
1. Enable Supabase Vault extension in database
2. Implement actual Vault API calls
3. Never log or expose decrypted keys

### 2.2 Write-Only Key Storage

**Rule**: Once a key is saved, it cannot be read back by the UI.

- Users can only: Replace, Delete, or Test (which doesn't return the key)
- Keys are only decrypted during pipeline execution
- No "View Key" functionality

## 3. The Engine: Securing the Logic (Inngest)

### 3.1 Tenant Isolation

**Problem**: Bug could cause User A's API key to execute trades for User B's pipeline.

**Solution**: Strict userId validation at the start of every Inngest function.

**Implementation**:
```typescript
// In src/inngest/functions.ts
const { pipeline, executionId } = await step.run("validate-tenant", async () => {
    const pipeline = await prisma.pipeline.findUnique({
        where: { id: pipelineId }
    });

    // CRITICAL: Tenant isolation check
    if (pipeline.userId !== userId) {
        throw new Error("Tenant isolation violation");
    }
    // ... rest of logic
});
```

**Rule**: Every Inngest event must include `userId`, and it must match the pipeline owner.

### 3.2 Function Timeouts

**Problem**: Hacked or buggy loops can drain server resources.

**Solution**: Strict execution timeouts at function and step levels.

**Configuration**:
- Function-level: 5 minutes maximum
- Step-level: 30 seconds per step (implicit via Inngest's step.run)

**Implementation**:
```typescript
export const pipelineTriggered = inngest.createFunction(
    { 
        id: "pipeline-triggered",
        timeouts: {
            start: "5m",
            finish: "5m",
        },
    },
    // ...
);
```

## 4. Local & Internal Security (Anti-Hacking)

### 4.1 Environment Variable Protection

**Rule**: Never store production secrets in local `.env` files.

**Solution**:
- `.gitignore` excludes all `.env*` files
- Use Doppler, Infisical, or similar for local secret injection
- Production secrets should only exist in deployment environment

**Protected Variables**:
- `DATABASE_URL`
- `INNGEST_SIGNING_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4.2 Branch Protection

**Recommendation**: Configure on GitHub:
- Require pull request reviews
- Require signed commits (GPG/SSH keys)
- Prevent force pushes to main
- Require status checks to pass

### 4.3 Admin Panel Security

**Future**: If building an admin dashboard:
- Protect behind VPN or Cloudflare Zero Trust
- Do not expose `admin.signalci.com` to public internet
- Use role-based access control (RBAC)

## Security Checklist

### ✅ Implemented

- [x] Secure random token generation for webhooks
- [x] Payload secret validation
- [x] Rate limiting with Upstash
- [x] Tenant isolation in Inngest functions
- [x] Function timeouts
- [x] Token rotation endpoint
- [x] `.gitignore` for sensitive files
- [x] Database schema for encrypted keys

### 🔄 Pending Production Implementation

- [ ] Enable Supabase Vault extension
- [ ] Implement actual Vault encryption/decryption
- [ ] Set up Upstash Redis instance
- [ ] Configure GitHub branch protection
- [ ] Set up Doppler/Infisical for local secrets
- [ ] Add authentication middleware (currently placeholder `userId`)
- [ ] Implement admin panel with VPN/Zero Trust

## Testing Security

### Test Rate Limiting
```bash
# Should succeed
curl -X POST https://api.signalci.com/api/webhook/v1/{token}

# After 10 requests in 10 seconds, should return 429
for i in {1..15}; do curl -X POST ...; done
```

### Test Payload Secret
```bash
# Should fail (missing secret)
curl -X POST https://api.signalci.com/api/webhook/v1/{token} \
  -d '{"price": 100}'

# Should succeed (correct secret)
curl -X POST https://api.signalci.com/api/webhook/v1/{token} \
  -d '{"price": 100, "auth_secret": "MoonLanding2024"}'
```

### Test Tenant Isolation
- Create pipeline for User A
- Try to trigger with User B's userId in event
- Should throw tenant isolation error

## Incident Response

If a security breach is suspected:

1. **Token Leak**: User clicks "Rotate Token" → old token immediately invalid
2. **Key Compromise**: User deletes and re-adds API key → old keyId removed from Vault
3. **Rate Limit Bypass**: Check Upstash logs, block IP at edge (Cloudflare/Vercel)
4. **Database Breach**: Rotate all Supabase Vault keys, force all users to re-enter API keys

## References

- [Supabase Vault Documentation](https://supabase.com/docs/guides/database/vault)
- [Upstash Ratelimit](https://upstash.com/docs/ratelimit/quickstart)
- [Inngest Timeouts](https://www.inngest.com/docs/reference/functions/timeouts)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

