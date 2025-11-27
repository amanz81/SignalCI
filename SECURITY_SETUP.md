# Security Setup Guide

This guide walks you through setting up the security features implemented in SignalCI.

## Prerequisites

1. **Database Migration**: Update your Prisma schema
2. **Upstash Redis**: Set up rate limiting
3. **Environment Variables**: Configure secrets

## Step 1: Database Migration

The schema has been updated with:
- `signalSecret` field on Pipeline (optional)
- `ApiKey` model for encrypted key storage

Run the migration:

```bash
npx prisma migrate dev --name add_security_features
```

Or if using Supabase:

```bash
npx prisma db push
```

## Step 2: Install Dependencies

New packages have been added for rate limiting:

```bash
yarn add @upstash/ratelimit @upstash/redis
# or
npm install @upstash/ratelimit @upstash/redis
```

## Step 3: Set Up Upstash Redis

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the REST URL and Token
4. Add to your `.env` file:

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

**Note**: For local development, you can use Upstash's free tier.

## Step 4: Environment Variables

Add these to your `.env` file (or use Doppler/Infisical for production):

```bash
# Database
DATABASE_URL=your-supabase-connection-string

# Inngest
INNGEST_SIGNING_KEY=your-inngest-signing-key

# Upstash (for rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# App URL (for webhook URLs in UI)
NEXT_PUBLIC_APP_URL=https://your-domain.com
# For local dev: http://localhost:3000
```

## Step 5: Supabase Vault (Optional - For Production)

To enable encrypted API key storage:

1. Enable the Vault extension in your Supabase database:
   ```sql
   CREATE EXTENSION IF NOT EXISTS supabase_vault;
   ```

2. Update `src/lib/vault.ts` with actual Supabase Vault API calls
3. See Supabase Vault documentation for implementation details

## Step 6: Test the Security Features

### Test Rate Limiting

```bash
# Should succeed (first 10 requests)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/webhook/v1/{your-token} \
    -H "Content-Type: application/json" \
    -d '{"price": 100}'
done

# Should return 429 (rate limit exceeded)
curl -X POST http://localhost:3000/api/webhook/v1/{your-token} \
  -H "Content-Type: application/json" \
  -d '{"price": 100}'
```

### Test Payload Secret

1. Create a pipeline with `signalSecret: "test-secret"`
2. Try webhook without secret (should fail):
   ```bash
   curl -X POST http://localhost:3000/api/webhook/v1/{token} \
     -d '{"price": 100}'
   ```
3. Try with correct secret (should succeed):
   ```bash
   curl -X POST http://localhost:3000/api/webhook/v1/{token} \
     -d '{"price": 100, "auth_secret": "test-secret"}'
   ```

### Test Token Rotation

```bash
# Rotate token (requires authentication in production)
curl -X POST http://localhost:3000/api/pipelines/{pipeline-id}/rotate-token
```

## What Changed

### Webhook URLs

**Old Format** (insecure):
```
/api/webhook/{pipelineId}
```

**New Format** (secure):
```
/api/webhook/v1/{64-character-hex-token}
```

All existing pipelines will need new tokens generated. The frontend automatically displays the new format.

### API Changes

1. **Pipeline Creation**: Now generates secure random tokens automatically
2. **Webhook Endpoint**: Moved from `/api/webhook/[pipelineId]` to `/api/webhook/v1/[token]`
3. **New Endpoint**: `POST /api/pipelines/{id}/rotate-token` for token rotation

### Database Changes

- `Pipeline.signalSecret` (optional string) - for payload validation
- `ApiKey` model - for encrypted key storage (requires Vault setup)

## Troubleshooting

### Rate Limiting Not Working

- Check that `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set
- Verify Upstash Redis database is active
- Check network connectivity to Upstash

### Webhook Returns 404

- Ensure you're using the new URL format: `/api/webhook/v1/{token}`
- Verify the token matches what's in the database
- Check that the pipeline exists and is active

### Tenant Isolation Errors

- Ensure `userId` is included in Inngest event data
- Verify the userId matches the pipeline owner
- Check that authentication is properly implemented

## Next Steps

1. **Authentication**: Implement proper user authentication (currently using placeholder `userId`)
2. **Supabase Vault**: Complete the Vault integration for API key encryption
3. **Monitoring**: Set up alerts for rate limit violations and security events
4. **Documentation**: Update API documentation with new webhook format

## Support

For issues or questions, refer to:
- [SECURITY.md](./SECURITY.md) - Full security architecture
- [Upstash Documentation](https://upstash.com/docs)
- [Supabase Vault Documentation](https://supabase.com/docs/guides/database/vault)

