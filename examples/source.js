export const source = `[client] Customer
  [ui] Web Application
    > POST /api/events
    flow: Validate request body
    link: GET /api/reports
    [flow] Publish domain event
    [link] Refresh dashboard data
    # Authenticated browser requests
    note: Retries transient failures
    [note] Edge cache keeps read paths fast
    (Parenthesized lines become notes)
    [gateway] Edge Gateway
      (authentication, rate limiting, request routing)
      [service] Application Service
        [database] Write -> Database <- Read
          event records
        [queue] Message Queue
          [worker] Worker
            [store] Process -> Search Index
        [observability] Observability
  [admin] Admin Console
    [flow] GET /api/admin/audit
    [audit] Audit Service
      [store] Audit Log

[service] Operations
  [scheduler] Scheduler
    flow: POST /internal/jobs
    [worker] Worker Pool
      [queue] Job Queue -> Worker <- Secrets Store`;
