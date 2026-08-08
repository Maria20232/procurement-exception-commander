# Representative Demo Guide

## Before arriving

- Bring the laptop with Docker Desktop running.
- Confirm `.env` contains the Supabase URL/key and Supervity workflow endpoint.
- Run `docker compose up --build` and open `http://localhost:3001`.
- Keep the Supervity Auto workflow open in a second tab as backend evidence.
- Test `DN-5000` once and keep screenshots as a fallback.

## Five-minute judge demo

1. **Dashboard (45 sec):** Explain that Supabase is the live system of record. Show open exceptions, critical cases, inventory and PO exposure.
2. **Run the AI Employee (60 sec):** Enter `DN-5000` and click **Run agent**. Explain that Supervity Auto runs the extractor, impact assessor, four parallel analysts, orchestrator and recommender.
3. **Workbench (90 sec):** Show the disruption, supplier/item evidence, inventory, alternatives, contracts and cost trade-off. Click **Approve recovery** to demonstrate the human control point and audit trail.
4. **AI Policies (60 sec):** Show all three editable policies. Change a threshold, save it, evaluate DN-5000 and show that the decision route changes without code.
5. **Insights + Data Manager (45 sec):** Show live cross-record insights and integration health.

## Key judge message

“The Command Center is the business interface. Supervity Auto supplies the
multi-agent intelligence and workflow orchestration; Supabase supplies the live
operational data. High-risk or incomplete cases stop for human approval, and
every policy change and decision is logged.”

## If live execution fails

- Do not rebuild during judging.
- Show the live Supabase dashboard and the last successful Supervity run.
- Demonstrate Workbench approval, editable policies, and Data Manager health.
- Say clearly that the failure is an execution connectivity issue, not a mocked workflow.

## Questions the representative must be able to answer

- Why eight operators? Two core assessment operators, four parallel specialists, an orchestrator, and a recovery recommender.
- Why human approval? High severity, policy threshold breach, or missing evidence.
- What is contention? Two disruptions attempt to consume the same safety stock or alternative-supplier capacity; the orchestrator prevents double allocation.
- What changes dynamically? Risk routing, financial approval limit, and safety-stock protection policies.
- What is stored where? Operational records in Supabase; intelligence/orchestration in Supervity Auto; approvals and policy audit events in the Command Center.
