# ResidenceCare - Project TODO

## Phase 1: Database Schema & Architecture
- [x] Design complete database schema (residents, rooms, schools, attendance, tasks, fees, debts)
- [x] Define role-based access control model
- [x] Create Drizzle ORM schema file
- [x] Generate and apply database migrations

## Phase 2: Backend Infrastructure
- [x] Implement query helpers in server/db.ts
- [x] Set up tRPC procedures for authentication and core operations
- [x] Configure environment variables and secrets
- [x] Implement role-based procedure wrappers (managerProcedure, supervisorProcedure, etc.)

## Phase 3: Resident & Room Management
- [x] Create resident CRUD operations (add, edit, deactivate, list)
- [x] Create room CRUD operations (add, edit, list with occupancy)
- [x] Implement room assignment logic
- [x] Implement resident transfer between rooms
- [x] Add validation for room capacity constraints
- [x] Create tRPC procedures for resident and room management
- [x] Build UI pages for resident management
- [x] Build UI pages for room management

## Phase 4: School & Attendance Management
- [x] Create school/program management CRUD
- [x] Implement academic year tracking
- [x] Create attendance/check-in-out tracking
- [x] Create shared activity schedule management (meals, curfew, study hours)
- [x] Build tRPC procedures for attendance and schedule
- [x] Build UI pages for attendance tracking
- [x] Build UI pages for schedule management

## Phase 5: Task Assignment & Fee Management
- [x] Create household task types and templates
- [x] Implement task assignment logic with status tracking
- [x] Create fee type definitions
- [x] Implement monthly debt auto-generation logic
- [x] Create payment recording system
- [x] Build tRPC procedures for tasks and fees
- [x] Build UI pages for task management
- [x] Build UI pages for fee and debt management

## Phase 6: Notifications & Cron Jobs
- [x] Set up email notification system
- [x] Implement in-app notification system
- [x] Create monthly debt generation cron job
- [x] Create overdue debt notification job
- [x] Implement notification templates for Vietnamese language
- [x] Test cron job execution
- [x] Build notification preferences UI

## Phase 7: Dashboard & Analytics
- [x] Create dashboard data aggregation procedures
- [x] Implement total residents metric
- [x] Implement room occupancy metric
- [x] Implement today's attendance metric
- [x] Implement pending tasks metric
- [x] Implement unpaid debts metric
- [x] Build charts using Recharts
- [x] Build dashboard UI with metrics and charts

## Phase 8: UI/UX - Editorial Design
- [x] Design color palette (cream background, high-contrast typography)
- [x] Set up Didone serif font for headlines
- [x] Configure Tailwind CSS with editorial design tokens
- [x] Implement DashboardLayout with sidebar navigation
- [x] Ensure responsive design for mobile and desktop
- [x] Build navigation menu with role-based visibility
- [x] Add geometric lines and fine details
- [x] Implement asymmetrical balance and generous negative space
- [x] Add Vietnamese language support throughout UI

## Phase 9: Testing & Deployment
- [x] Write vitest unit tests for core procedures
- [x] Write vitest tests for role-based access control
- [x] Create seed data script with sample residents, rooms, schools
- [x] Test all CRUD operations
- [x] Test role-based access restrictions
- [x] Test cron job execution
- [x] Test notification system
- [x] Perform end-to-end testing
- [x] Create checkpoint and prepare for deployment

## Known Issues & Bugs
(None yet - to be updated as issues are discovered)

## Notes
- All timestamps stored as UTC Unix timestamps (milliseconds)
- Vietnamese language support required throughout
- Role-based access control enforced at procedure level, not just UI
- Sidebar navigation must remain accessible on mobile
- Monthly cron job runs server-side automatically
- Email notifications require SMTP configuration
