# SignalCI MVP Roadmap
## Programmable Observability for Crypto Market Signals

### Vision
Turn "signals" into open-source software rather than black-box gambling. An open platform where users build "Detection Pipelines" visually for transparent, verified signal logic.

---

## ✅ Phase 0: Foundation (Current State)

### Completed
- [x] Visual pipeline builder (React Flow)
- [x] Node types: Trigger, Wait, Condition, Action
- [x] Connection validation logic
- [x] Dark mode support
- [x] Expanded condition types (Market, Macro, On-chain, Custom)
- [x] Basic pipeline save/load
- [x] Database schema (Pipeline, Execution)

### Current Capabilities
- Users can build detection pipelines visually
- Validation ensures pipelines are logically sound
- Pipelines can be saved to database
- Basic webhook trigger endpoint exists

---

## 🎯 Phase 1: Core Detection Engine (MVP - 2-3 weeks)

### 1.1 Pipeline Execution Engine
**Priority: CRITICAL**

- [ ] **Inngest Function Enhancement**
  - Load pipeline logic from database
  - Execute step-by-step: Trigger → Conditions → Actions
  - Handle condition branches (true/false)
  - Support Wait nodes (delays)
  - Error handling and logging

- [ ] **Data Source Integration**
  - Webhook trigger (already exists, needs enhancement)
  - API polling for conditions (price, volume, etc.)
  - WebSocket support for real-time data
  - External API connectors (CoinGecko, Helius, etc.)

- [ ] **Condition Evaluators**
  - Market metrics: Volume, Price, RSI, MACD, Moving Average
  - Macro: Google Trends API integration
  - On-chain: Helius API, blockchain explorers
  - Custom: Webhook response parsing, expression evaluator

### 1.2 Action System
**Priority: CRITICAL**

- [ ] **Notification Channels**
  - Telegram bot integration
  - Email (SMTP/SendGrid)
  - Webhook callbacks
  - Discord webhooks
  - Slack integration

- [ ] **Message Templating**
  - Variable substitution: `{symbol}`, `{price}`, `{timestamp}`
  - Rich formatting (Markdown support)
  - Include condition results in alerts

### 1.3 Execution Tracking
**Priority: HIGH**

- [ ] **Execution Logs**
  - Step-by-step execution tracking
  - Condition evaluation results
  - Action success/failure
  - Error messages and stack traces
  - Execution duration metrics

- [ ] **Dashboard Enhancements**
  - Real-time execution feed
  - Filter by status (SUCCESS, FAILED, PENDING)
  - Execution details modal
  - Pipeline health metrics

---

## 🚀 Phase 2: Open Source & Reputation (3-4 weeks)

### 2.1 Pipeline Sharing
**Priority: HIGH**

- [ ] **Public Pipeline Library**
  - Mark pipelines as "Public" or "Private"
  - Public pipeline gallery/explorer
  - Search and filter by category
  - Pipeline preview (read-only view)

- [ ] **Fork & Clone**
  - "Fork" button on public pipelines
  - Clone pipeline with all configuration
  - Edit forked pipeline independently
  - Attribution to original creator

- [ ] **Pipeline Metadata**
  - Description field
  - Tags/categories
  - Use case examples
  - Creator attribution
  - Fork count

### 2.2 Trust Score System
**Priority: HIGH**

- [ ] **Execution Tracking**
  - Track successful vs failed executions
  - Calculate accuracy rate
  - False positive/negative tracking
  - Execution frequency metrics

- [ ] **Reputation Algorithm**
  - Trust score calculation:
    - Accuracy rate (weighted by recency)
    - Execution count (more = more reliable)
    - User verification (optional)
    - Community ratings
  - Display trust score on pipelines
  - Leaderboard of trusted creators

- [ ] **Verification Badges**
  - "Verified" badge for high-trust creators
  - "Popular" badge for frequently forked
  - "Reliable" badge for high accuracy

### 2.3 Community Features
**Priority: MEDIUM**

- [ ] **Pipeline Ratings**
  - Star/upvote system
  - Comments on public pipelines
  - Report inappropriate content

- [ ] **Pipeline Collections**
  - User-created collections
  - "Best of" curated lists
  - Category collections (DeFi, NFTs, etc.)

---

## 🔧 Phase 3: Advanced Features (4-6 weeks)

### 3.1 Enhanced Builder
**Priority: MEDIUM**

- [ ] **Condition Logic Operators**
  - AND/OR gates for multiple conditions
  - Nested condition groups
  - NOT operator

- [ ] **Data Transformations**
  - Math operations node
  - Data aggregation (sum, avg, etc.)
  - Time-based windows (rolling averages)

- [ ] **Sub-pipelines**
  - Reference other pipelines
  - Pipeline composition
  - Reusable logic blocks

### 3.2 Advanced Integrations
**Priority: MEDIUM**

- [ ] **More Data Sources**
  - Twitter/X sentiment API
  - Reddit sentiment
  - News API integration
  - On-chain analytics (Dune, Flipside)

- [ ] **Condition Enhancements**
  - Multi-asset comparisons
  - Cross-chain data
  - Historical data lookups

### 3.3 Performance & Scale
**Priority: MEDIUM**

- [ ] **Pipeline Optimization**
  - Execution caching
  - Parallel condition evaluation
  - Rate limiting per pipeline

- [ ] **Monitoring & Alerts**
  - Pipeline health dashboard
  - Alert when pipeline fails
  - Usage analytics

---

## 📊 Phase 4: Enterprise Features (Future)

### 4.1 Team Collaboration
- [ ] Team workspaces
- [ ] Role-based access control
- [ ] Pipeline sharing within teams
- [ ] Audit logs

### 4.2 Advanced Analytics
- [ ] Pipeline performance analytics
- [ ] Market correlation analysis
- [ ] Signal backtesting
- [ ] Historical accuracy reports

### 4.3 API & Integrations
- [ ] Public API for pipeline management
- [ ] Webhook triggers from external systems
- [ ] Zapier/Make.com integration
- [ ] CLI tool for pipeline management

---

## 🎯 MVP Success Criteria

### Must Have (Phase 1)
1. ✅ Visual pipeline builder (DONE)
2. ⏳ Pipeline execution engine (Inngest)
3. ⏳ At least 3 data source integrations
4. ⏳ At least 2 notification channels (Telegram, Email)
5. ⏳ Execution logging and dashboard

### Should Have (Phase 2)
1. ⏳ Public pipeline sharing
2. ⏳ Fork functionality
3. ⏳ Basic trust score calculation
4. ⏳ Pipeline search/discovery

### Nice to Have (Phase 3+)
1. Advanced condition logic
2. More integrations
3. Performance optimizations

---

## 🛠️ Technical Stack Decisions Needed

### Data Sources
- **Price/Volume**: CoinGecko API (free tier) or CoinMarketCap
- **On-chain**: Helius API (Solana), Alchemy (Ethereum)
- **Google Trends**: Google Trends API or scraping (legal considerations)
- **Social Sentiment**: Twitter API v2, Reddit API

### Notification Services
- **Telegram**: Bot API (free)
- **Email**: SendGrid (free tier) or Resend
- **Discord**: Webhooks (free)
- **Slack**: Webhooks (free)

### Infrastructure
- **Current**: Vercel (hosting), Inngest (workflows), PostgreSQL (database)
- **Consider**: Redis for caching, S3 for logs storage

---

## 📝 Next Immediate Steps (This Week)

1. **Enhance Inngest Function** (`src/inngest/functions.ts`)
   - Load pipeline from database
   - Execute logic steps sequentially
   - Handle condition evaluation
   - Call action handlers

2. **Build Condition Evaluators**
   - Start with simple ones: Volume, Price
   - Create evaluator interface/pattern
   - Add API integrations (CoinGecko)

3. **Build Action Handlers**
   - Telegram bot setup
   - Email service integration
   - Message templating system

4. **Enhance Execution Logging**
   - Update Execution model with more fields
   - Log each step execution
   - Display in dashboard

5. **Add Pipeline Validation on Save**
   - Run validation before saving
   - Show errors to user
   - Prevent saving invalid pipelines

---

## 🎨 UI/UX Improvements Needed

1. **Pipeline Builder**
   - [ ] Real-time validation feedback
   - [ ] Pipeline templates/starter kits
   - [ ] Undo/redo functionality
   - [ ] Keyboard shortcuts

2. **Dashboard**
   - [ ] Pipeline cards with status indicators
   - [ ] Quick actions (enable/disable, duplicate)
   - [ ] Search and filter
   - [ ] Pipeline analytics preview

3. **Execution View**
   - [ ] Visual execution flow (highlight active step)
   - [ ] Timeline view
   - [ ] Export logs
   - [ ] Retry failed executions

---

## 🔐 Security & Privacy

- [ ] API key management (encrypted storage)
- [ ] Rate limiting per user
- [ ] Input sanitization for conditions
- [ ] Webhook signature verification
- [ ] User authentication (NextAuth.js)
- [ ] Pipeline access control

---

## 📈 Metrics to Track

1. **User Engagement**
   - Pipelines created
   - Pipelines forked
   - Active pipelines
   - Execution frequency

2. **Platform Health**
   - Execution success rate
   - Average execution time
   - Error rate
   - API quota usage

3. **Trust Score**
   - Accuracy per pipeline
   - Creator reputation
   - Most trusted pipelines
   - Community adoption

---

## 🚨 Risks & Mitigations

1. **API Rate Limits**
   - Implement caching
   - Queue system for API calls
   - User quotas

2. **Execution Failures**
   - Retry logic
   - Error notifications
   - Graceful degradation

3. **Spam/Abuse**
   - Rate limiting
   - User verification
   - Content moderation

4. **Data Accuracy**
   - Source verification
   - Data freshness indicators
   - Multiple source validation

---

## 📚 Resources Needed

- API keys for data sources
- Telegram bot token
- Email service account
- Domain for webhooks
- Monitoring tools (Sentry, LogRocket)

---

**Last Updated**: 2025-01-25
**Status**: Phase 0 Complete, Starting Phase 1


