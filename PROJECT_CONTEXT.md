# Project Context: SignalCI

This file provides context for AI coding assistants working on SignalCI.

## Project Vision

We are building a "CI/CD for Trading." Users define pipelines that wait, check, and verify market conditions before alerting.

## Technology Stack

- **Frontend:** Next.js (App Router), React Flow, Tailwind CSS, shadcn/ui.
- **Backend:** Inngest (Event orchestration), Next.js API Routes.
- **Database:** Supabase (PostgreSQL), Prisma ORM.

## Architecture Guidelines

### 1. Separation of Concerns (CRITICAL)

- **Frontend (Visuals):** React Flow manages the UI `nodes` and `edges`. It does NOT run logic.
- **Transformer:** A specific utility function (`transformFlowToLogic.ts`) must exist to convert the messy React Flow JSON into a clean, linear "Step Configuration" for the backend.
- **Backend (Logic):** Inngest functions execute the logic based on the *clean* configuration, not the UI state.

### 2. The Inngest Workflow

- The main function `executePipeline` is triggered by an event `pipeline.triggered`.
- It performs `step.sleep()` for wait times (do not use `setTimeout`).
- It performs `step.run()` for API checks (Coingecko/Binance).
- It logs every step result to the database so the user can debug "Why did my trade fail?".

### 3. Data Schema (Prisma)

```prisma
model Pipeline {
  id           String   @id @default(uuid())
  userId       String
  name         String
  triggerToken String   @unique // Webhook slug
  flowConfig   Json     // UI State (React Flow)
  logicConfig  Json     // Execution State (Clean JSON)
  isActive     Boolean  @default(true)
  executions   Execution[]
}

model Execution {
  id          String   @id @default(uuid())
  pipelineId  String
  status      String   // PENDING, SUCCESS, FAILED
  logs        Json     // Array of step results
  createdAt   DateTime @default(now())
  pipeline    Pipeline @relation(fields: [pipelineId], references: [id])
}
```

### 4. Developer Rules

- Use zod for all data validation.
- Create modular "Nodes" in React Flow (e.g., WaitNode, ConditionNode).
- Ensure the Mobile view uses a different component (List/Card view) than the Web view (Canvas view).

## Key Principles

### Data Flow

1. **User creates pipeline** → React Flow generates `flowConfig` (UI state)
2. **On save** → `transformFlowToLogic()` converts to `logicConfig` (execution state)
3. **Webhook triggers** → API route receives trigger, emits Inngest event
4. **Inngest executes** → Reads `logicConfig`, executes steps sequentially
5. **Results logged** → Each step result saved to `Execution.logs`

### Error Handling

- All condition evaluations must catch and log errors
- Failed conditions should not crash the pipeline
- Execution status should reflect partial success scenarios
- User should see clear error messages in execution logs

### Code Quality

- Use TypeScript strictly (no `any` types)
- Follow Next.js App Router conventions
- Use React Server Components where appropriate
- Implement proper error boundaries
- Add comprehensive logging for debugging

## Component Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── webhook/        # Webhook trigger endpoints
│   │   └── pipelines/      # Pipeline CRUD operations
│   ├── builder/            # Visual pipeline builder (Web)
│   ├── dashboard/          # Pipeline list & status (Web)
│   └── pipelines/[id]/     # Individual pipeline view
├── components/
│   ├── editor/             # React Flow components
│   │   ├── PipelineEditor.tsx
│   │   ├── nodes/          # Node type components
│   │   └── NodeConfigPanel.tsx
│   └── ui/                 # shadcn/ui components
├── inngest/
│   ├── client.ts           # Inngest client setup
│   └── functions.ts        # Pipeline execution logic
├── lib/
│   ├── compiler.ts         # transformFlowToLogic()
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Shared utilities
└── store/
    └── pipelineStore.ts    # State management
```

## Development Workflow

### Adding a New Node Type

1. Create component in `components/editor/nodes/`
2. Add node type to `PipelineEditor` node types
3. Update `transformFlowToLogic()` to handle new node
4. Add execution logic in `inngest/functions.ts`
5. Update Prisma schema if new fields needed

### Adding a New Condition Type

1. Create evaluator function in `lib/conditions/`
2. Register in condition evaluation switch
3. Add UI controls in `ConditionNode.tsx`
4. Update validation schema (zod)

### Adding a New Action Type

1. Create handler function in `lib/actions/`
2. Register in action execution switch
3. Add UI controls in `ActionNode.tsx`
4. Update validation schema (zod)

