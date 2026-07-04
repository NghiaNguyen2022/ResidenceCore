# Architecture Diagram - ResidenceCare

## System Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Frontend (React 19 + Tailwind 4)"]
        UI["UI Components<br/>Pages, Forms, Tables"]
        State["State Management<br/>React Query, Context"]
        tRPCClient["tRPC Client<br/>Type-safe API calls"]
    end

    subgraph Server["⚙️ Backend (Express 4 + tRPC 11)"]
        Auth["🔐 Authentication<br/>Manus OAuth 2.0"]
        Routers["tRPC Routers<br/>residents, rooms, fees, etc."]
        Services["Business Logic<br/>notificationService<br/>cronJobService"]
        RBAC["Role-Based Access<br/>Manager, Supervisor<br/>Accountant"]
    end

    subgraph Database["💾 Database (MySQL/TiDB)"]
        Users["users"]
        Residents["residents"]
        Rooms["rooms"]
        Schools["schools"]
        Programs["programs"]
        Attendance["attendance"]
        Tasks["tasks"]
        Fees["fees"]
        Debts["debts"]
        Payments["payments"]
        Notifications["notifications"]
        Logs["cronJobLogs"]
    end

    subgraph External["🌐 External Services"]
        OAuth["Manus OAuth<br/>Authentication"]
        Email["Email Service<br/>Notifications"]
        Storage["S3 Storage<br/>File uploads"]
    end

    Client -->|HTTP/tRPC| Server
    Server -->|SQL| Database
    Server -->|OAuth| OAuth
    Server -->|Email| Email
    Server -->|S3| Storage
    
    UI --> State
    State --> tRPCClient
    tRPCClient --> Server
    
    Auth --> RBAC
    RBAC --> Routers
    Routers --> Services
    Services --> Database
    
    Database --> Users
    Database --> Residents
    Database --> Rooms
    Database --> Schools
    Database --> Programs
    Database --> Attendance
    Database --> Tasks
    Database --> Fees
    Database --> Debts
    Database --> Payments
    Database --> Notifications
    Database --> Logs
```

---

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant User as User (Browser)
    participant Frontend as Frontend (React)
    participant Backend as Backend (tRPC)
    participant DB as Database
    participant Service as External Service

    User->>Frontend: Click "Thêm Cư dân"
    Frontend->>Frontend: Show form
    User->>Frontend: Fill form & Submit
    Frontend->>Backend: trpc.residents.create()
    Backend->>Backend: Validate input
    Backend->>Backend: Check permissions (RBAC)
    Backend->>DB: INSERT INTO residents
    DB-->>Backend: Return new resident
    Backend-->>Frontend: Return response
    Frontend->>Frontend: Update state
    Frontend-->>User: Show success toast
    Backend->>Service: Send notification (async)
    Service-->>Backend: Notification sent
```

---

## Component Architecture

```mermaid
graph LR
    subgraph Pages["Pages"]
        Home["Home"]
        Dashboard["Dashboard"]
        Residents["Residents"]
        Rooms["Rooms"]
        Attendance["Attendance"]
        Tasks["Tasks"]
        Fees["Fees"]
        Schedules["Schedules"]
        Notifications["Notifications"]
    end

    subgraph Layouts["Layouts"]
        ResidenceCareLayout["ResidenceCareLayout<br/>Sidebar + Content"]
    end

    subgraph Components["Components"]
        Forms["Forms<br/>ResidentForm<br/>RoomForm<br/>etc."]
        Tables["Tables<br/>ResidentTable<br/>RoomTable<br/>etc."]
        Charts["Charts<br/>OccupancyChart<br/>DebtChart"]
        Dialogs["Dialogs<br/>ConfirmDialog<br/>FormDialog"]
    end

    subgraph UI["UI Library"]
        ShadcnUI["shadcn/ui<br/>Button, Card, Dialog<br/>Form, Table, etc."]
    end

    Pages --> ResidenceCareLayout
    ResidenceCareLayout --> Components
    Components --> ShadcnUI
    Components --> Forms
    Components --> Tables
    Components --> Charts
    Components --> Dialogs
```

---

## Database Schema Diagram

```mermaid
erDiagram
    USERS ||--o{ RESIDENTS : creates
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ TASKASSIGNMENTS : "assigned to"
    
    SCHOOLS ||--o{ PROGRAMS : has
    SCHOOLS ||--o{ RESIDENTS : "has students"
    PROGRAMS ||--o{ RESIDENTS : "has students"
    
    ROOMS ||--o{ RESIDENTS : contains
    
    RESIDENTS ||--o{ ATTENDANCE : records
    RESIDENTS ||--o{ TASKASSIGNMENTS : "assigned to"
    RESIDENTS ||--o{ DEBTS : owes
    
    TASKASSIGNMENTS }o--|| TASKTYPES : "assigned type"
    
    DEBTS }o--|| FEETYPES : "is type of"
    DEBTS ||--o{ PAYMENTS : receives
    
    SCHEDULES ||--o{ ATTENDANCE : "follows"
    
    CRONLOGS ||--o{ DEBTS : "generates"

    USERS : int id PK
    USERS : string openId UK
    USERS : string name
    USERS : string email
    USERS : enum role

    RESIDENTS : int id PK
    RESIDENTS : string fullName
    RESIDENTS : string email
    RESIDENTS : int schoolId FK
    RESIDENTS : int programId FK
    RESIDENTS : int roomId FK
    RESIDENTS : enum status

    ROOMS : int id PK
    ROOMS : string roomNumber UK
    ROOMS : int capacity
    ROOMS : string description

    SCHOOLS : int id PK
    SCHOOLS : string name
    SCHOOLS : string city
    SCHOOLS : string address

    PROGRAMS : int id PK
    PROGRAMS : int schoolId FK
    PROGRAMS : string name
    PROGRAMS : string academicYear

    ATTENDANCE : int id PK
    ATTENDANCE : int residentId FK
    ATTENDANCE : date date
    ATTENDANCE : time checkInTime
    ATTENDANCE : time checkOutTime
    ATTENDANCE : enum status

    SCHEDULES : int id PK
    SCHEDULES : string name
    SCHEDULES : enum type
    SCHEDULES : time scheduledTime
    SCHEDULES : boolean isDaily

    TASKTYPES : int id PK
    TASKTYPES : string name
    TASKTYPES : string description

    TASKASSIGNMENTS : int id PK
    TASKASSIGNMENTS : int taskTypeId FK
    TASKASSIGNMENTS : int assignedTo FK
    TASKASSIGNMENTS : date dueDate
    TASKASSIGNMENTS : enum status

    FEETYPES : int id PK
    FEETYPES : string name
    FEETYPES : string code UK
    FEETYPES : decimal amount
    FEETYPES : enum billingCycle
    FEETYPES : boolean isActive

    DEBTS : int id PK
    DEBTS : int residentId FK
    DEBTS : int feeTypeId FK
    DEBTS : decimal amount
    DEBTS : string billingMonth
    DEBTS : date dueDate
    DEBTS : enum status

    PAYMENTS : int id PK
    PAYMENTS : int debtId FK
    PAYMENTS : decimal amount
    PAYMENTS : date paymentDate
    PAYMENTS : enum paymentMethod

    NOTIFICATIONS : int id PK
    NOTIFICATIONS : int recipientId FK
    NOTIFICATIONS : enum type
    NOTIFICATIONS : string title
    NOTIFICATIONS : string content
    NOTIFICATIONS : boolean isRead

    CRONLOGS : int id PK
    CRONLOGS : string jobName
    CRONLOGS : timestamp executionDate
    CRONLOGS : enum status
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph CDN["CDN / Static Assets"]
        CSS["Stylesheets"]
        JS["JavaScript Bundles"]
        Images["Images & Media"]
    end

    subgraph LoadBalancer["Load Balancer"]
        LB["Nginx / HAProxy"]
    end

    subgraph AppServers["Application Servers"]
        App1["Node.js Instance 1"]
        App2["Node.js Instance 2"]
        App3["Node.js Instance 3"]
    end

    subgraph Database["Database Cluster"]
        Primary["MySQL Primary"]
        Replica1["MySQL Replica 1"]
        Replica2["MySQL Replica 2"]
    end

    subgraph Cache["Cache Layer"]
        Redis["Redis Cache"]
    end

    subgraph Storage["Storage"]
        S3["S3 / Object Storage"]
    end

    subgraph Monitoring["Monitoring & Logging"]
        Prometheus["Prometheus"]
        ELK["ELK Stack"]
    end

    User["👥 Users"]
    
    User -->|HTTPS| CDN
    User -->|HTTPS| LB
    LB -->|Round Robin| App1
    LB -->|Round Robin| App2
    LB -->|Round Robin| App3
    
    App1 -->|Read/Write| Primary
    App2 -->|Read/Write| Primary
    App3 -->|Read/Write| Primary
    
    Primary -->|Replication| Replica1
    Primary -->|Replication| Replica2
    
    App1 -->|Cache| Redis
    App2 -->|Cache| Redis
    App3 -->|Cache| Redis
    
    App1 -->|Upload/Download| S3
    App2 -->|Upload/Download| S3
    App3 -->|Upload/Download| S3
    
    App1 -->|Metrics| Prometheus
    App2 -->|Metrics| Prometheus
    App3 -->|Metrics| Prometheus
    
    App1 -->|Logs| ELK
    App2 -->|Logs| ELK
    App3 -->|Logs| ELK
```

---

## Cron Job Flow

```mermaid
graph TD
    Start["🕐 Trigger: 1st of month at 00:00 UTC"]
    
    Start --> GetResidents["Get all active residents"]
    GetResidents --> GetFees["Get all active fee types"]
    GetFees --> Loop["For each resident & fee combination"]
    
    Loop --> CheckExist["Check if debt already exists<br/>for this month"]
    CheckExist -->|Exists| Skip["Skip"]
    CheckExist -->|Not Exists| CreateDebt["Create debt record"]
    
    CreateDebt --> SendNotif["Send notification to resident"]
    SendNotif --> LogJob["Log job execution"]
    
    Skip --> Next["Next combination"]
    Next --> Loop
    
    Loop -->|Done| Success["✅ Job completed"]
    Success --> End["End"]
    
    style Start fill:#90EE90
    style Success fill:#90EE90
    style End fill:#FFB6C6
```

---

## Notification Flow

```mermaid
graph LR
    Event["📢 Event Triggered"]
    
    Event -->|Debt Created| NotifService["Notification Service"]
    Event -->|Payment Made| NotifService
    Event -->|Task Assigned| NotifService
    Event -->|Attendance Alert| NotifService
    
    NotifService --> CreateRecord["Create notification record"]
    CreateRecord --> SendInApp["Send in-app notification"]
    SendInApp --> SendEmail["Send email (async)"]
    SendEmail --> LogNotif["Log notification"]
    
    LogNotif --> Done["✅ Notification sent"]
    
    style Event fill:#87CEEB
    style Done fill:#90EE90
```

---

## Technology Stack Layers

```mermaid
graph TB
    subgraph Presentation["Presentation Layer"]
        React["React 19"]
        Tailwind["Tailwind CSS 4"]
        ShadcnUI["shadcn/ui"]
    end

    subgraph API["API Layer"]
        tRPC["tRPC 11"]
        Express["Express 4"]
    end

    subgraph Business["Business Logic Layer"]
        Services["Services<br/>notificationService<br/>cronJobService"]
        RBAC["RBAC<br/>Role-based procedures"]
    end

    subgraph Data["Data Access Layer"]
        Drizzle["Drizzle ORM"]
        QueryHelpers["Query Helpers"]
    end

    subgraph Database["Database Layer"]
        MySQL["MySQL 8.0+"]
    end

    subgraph Infrastructure["Infrastructure"]
        Docker["Docker"]
        Nginx["Nginx"]
        PM2["PM2"]
    end

    Presentation --> API
    API --> Business
    Business --> Data
    Data --> Database
    API --> Infrastructure
```

---

**Diagram Version:** 1.0  
**Last Updated:** May 2026  
**Status:** Production Ready
