# ResidenceCare Database Schema Design

## Overview

This document outlines the complete database schema for the ResidenceCare boarding house management system. The schema is designed to support multi-role access control, comprehensive resident management, room allocation, academic tracking, attendance, task assignment, and financial management.

---

## Core Tables

### 1. Users (Extended from Template)

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| openId | varchar | Manus OAuth identifier |
| name | text | User full name |
| email | varchar | Email address |
| loginMethod | varchar | OAuth method |
| role | enum | admin, manager, supervisor, accountant, resident |
| createdAt | timestamp | Account creation |
| updatedAt | timestamp | Last update |
| lastSignedIn | timestamp | Last login |

**Notes:** Role enum extended to support manager, supervisor, accountant, and resident roles.

---

### 2. Residents

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| userId | int | Foreign key to users (nullable for non-registered residents) |
| fullName | varchar | Resident full name |
| dateOfBirth | date | Birth date |
| gender | enum | male, female, other |
| idNumber | varchar | National ID/passport number |
| permanentAddress | text | Home address |
| phoneNumber | varchar | Contact phone |
| status | enum | active, inactive, transferred_out |
| currentRoomId | int | Foreign key to rooms (current room assignment) |
| admissionDate | timestamp | Date admitted to residence |
| departureDate | timestamp | Date departed (nullable) |
| notes | text | Additional notes |
| createdAt | timestamp | Record creation |
| updatedAt | timestamp | Last update |

**Relationships:** One resident can have many room assignments (history), one user can be one resident.

---

### 3. Schools

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| name | varchar | School name |
| type | enum | high_school, college, university |
| address | text | School address |
| phoneNumber | varchar | School contact |
| createdAt | timestamp | Record creation |
| updatedAt | timestamp | Last update |

---

### 4. Programs

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| schoolId | int | Foreign key to schools |
| name | varchar | Program/major name |
| code | varchar | Program code |
| createdAt | timestamp | Record creation |
| updatedAt | timestamp | Last update |

**Relationships:** One school has many programs.

---

### 5. ResidentAcademicInfo

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| residentId | int | Foreign key to residents |
| schoolId | int | Foreign key to schools |
| programId | int | Foreign key to programs |
| class | varchar | Class/year designation |
| academicYear | varchar | Academic year (e.g., 2024-2025) |
| enrollmentDate | timestamp | Enrollment date |
| status | enum | enrolled, graduated, transferred, suspended |
| createdAt | timestamp | Record creation |
| updatedAt | timestamp | Last update |

**Relationships:** One resident can have multiple academic records (for transfers/changes).

---

### 6. Rooms

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| roomCode | varchar | Unique room identifier |
| roomName | varchar | Room display name |
| floor | int | Floor number |
| zone | varchar | Zone/wing designation |
| gender | enum | male, female, mixed |
| capacity | int | Maximum occupancy |
| currentOccupancy | int | Current number of residents |
| status | enum | available, full, maintenance, closed |
| createdAt | timestamp | Record creation |
| updatedAt | timestamp | Last update |

---

### 7. RoomAssignmentHistory

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| residentId | int | Foreign key to residents |
| roomId | int | Foreign key to rooms |
| assignmentDate | timestamp | Date assigned |
| releaseDate | timestamp | Date released (nullable if current) |
| reason | varchar | Reason for assignment/transfer |
| assignedBy | int | Foreign key to users (who made assignment) |
| createdAt | timestamp | Record creation |

**Relationships:** Tracks complete history of room assignments for each resident.

---

### 8. AttendanceSchedule

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| name | varchar | Activity name (e.g., "Morning Check-in", "Curfew") |
| type | enum | check_in, check_out, meal, study_hour, curfew, activity |
| scheduledTime | time | Scheduled time of day |
| tolerance | int | Tolerance in minutes (for late arrivals) |
| isDaily | boolean | Whether this repeats daily |
| daysOfWeek | varchar | JSON array of days (0-6) if not daily |
| createdAt | timestamp | Record creation |
| updatedAt | timestamp | Last update |

---

### 9. Attendance

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| residentId | int | Foreign key to residents |
| scheduleId | int | Foreign key to AttendanceSchedule |
| attendanceDate | date | Date of attendance |
| status | enum | present, absent, excused, late |
| checkInTime | timestamp | Actual check-in time (nullable) |
| checkOutTime | timestamp | Actual check-out time (nullable) |
| notes | varchar | Notes or reason |
| recordedBy | int | Foreign key to users (who recorded) |
| createdAt | timestamp | Record creation |
| updatedAt | timestamp | Last update |

---

### 10. TaskTypes

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| name | varchar | Task type name (e.g., "Cooking", "Shopping") |
| description | text | Task description |
| estimatedHours | decimal | Estimated hours to complete |
| createdAt | timestamp | Record creation |
| updatedAt | timestamp | Last update |

---

### 11. TaskAssignments

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| taskTypeId | int | Foreign key to TaskTypes |
| residentId | int | Foreign key to residents |
| assignmentDate | date | Date task assigned |
| dueDate | date | Due date |
| status | enum | pending, in_progress, completed, overdue, cancelled |
| completionDate | timestamp | When completed (nullable) |
| notes | varchar | Additional notes |
| assignedBy | int | Foreign key to users |
| verifiedBy | int | Foreign key to users (nullable) |
| createdAt | timestamp | Record creation |
| updatedAt | timestamp | Last update |

---

### 12. FeeTypes

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| name | varchar | Fee name (e.g., "Monthly Rent", "Food") |
| code | varchar | Fee code for identification |
| amount | decimal | Amount in currency |
| billingCycle | enum | monthly, quarterly, yearly |
| description | text | Fee description |
| isActive | boolean | Whether fee is currently active |
| createdAt | timestamp | Record creation |
| updatedAt | timestamp | Last update |

---

### 13. Debts

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| residentId | int | Foreign key to residents |
| feeTypeId | int | Foreign key to FeeTypes |
| billingMonth | varchar | Billing month (YYYY-MM) |
| amount | decimal | Amount owed |
| dueDate | date | Payment due date |
| status | enum | unpaid, partially_paid, paid, overdue, waived |
| createdAt | timestamp | Record creation |
| updatedAt | timestamp | Last update |

**Notes:** Auto-generated monthly by cron job based on active residents and fee types.

---

### 14. Payments

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| debtId | int | Foreign key to Debts |
| amount | decimal | Payment amount |
| paymentDate | timestamp | Date payment received |
| paymentMethod | enum | cash, bank_transfer, check, other |
| reference | varchar | Payment reference/receipt number |
| notes | varchar | Additional notes |
| recordedBy | int | Foreign key to users |
| createdAt | timestamp | Record creation |

**Relationships:** One debt can have multiple payments (partial payments).

---

### 15. Notifications

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| recipientId | int | Foreign key to users |
| type | enum | fee_generated, debt_overdue, task_assigned, attendance_alert |
| title | varchar | Notification title |
| content | text | Notification content |
| relatedEntityType | varchar | Entity type (debt, task, etc.) |
| relatedEntityId | int | ID of related entity |
| isRead | boolean | Whether notification has been read |
| sentAt | timestamp | When notification was sent |
| readAt | timestamp | When notification was read (nullable) |
| createdAt | timestamp | Record creation |

---

### 16. CronJobLogs

| Field | Type | Purpose |
|-------|------|---------|
| id | int | Primary key |
| jobName | varchar | Name of cron job |
| executionDate | timestamp | When job executed |
| status | enum | success, failure, partial |
| recordsProcessed | int | Number of records processed |
| errorMessage | text | Error details if failed (nullable) |
| createdAt | timestamp | Record creation |

**Notes:** Tracks execution history of automated jobs for debugging and monitoring.

---

## Access Control Model

### Role Definitions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, system configuration |
| **Manager** | Resident management, room assignment, view all data, generate reports |
| **Supervisor** | Attendance tracking, task assignment, view resident data, limited reporting |
| **Accountant** | Fee management, payment recording, debt tracking, financial reports |
| **Resident** | View own profile, view own academic info, view own tasks, view own attendance |

### Procedure-Level Access Control

All tRPC procedures will implement role checks using middleware:
- `adminProcedure` - Admin only
- `managerProcedure` - Manager or Admin
- `supervisorProcedure` - Supervisor or Admin
- `accountantProcedure` - Accountant or Admin
- `protectedProcedure` - Any authenticated user

---

## Key Constraints & Validations

1. **Room Capacity:** Current occupancy cannot exceed capacity
2. **Resident Status:** Only active residents can be assigned to rooms
3. **Academic Info:** Each resident must have at least one academic record
4. **Debt Generation:** Only for residents with status = "active"
5. **Payment:** Payment amount cannot exceed remaining debt balance
6. **Task Assignment:** Can only assign to active residents
7. **Attendance:** Can only record for residents with active room assignment

---

## Indexes for Performance

- `residents.userId` - For user-resident lookups
- `residents.currentRoomId` - For room occupancy queries
- `roomAssignmentHistory.residentId` - For history lookups
- `attendance.residentId, attendance.attendanceDate` - For daily reports
- `taskAssignments.residentId, taskAssignments.status` - For task queries
- `debts.residentId, debts.status` - For debt tracking
- `debts.billingMonth` - For monthly debt queries
- `payments.debtId` - For payment lookups
- `notifications.recipientId, notifications.isRead` - For notification queries

---

## Cron Job Specifications

### Monthly Debt Generation Job

**Trigger:** First day of each month at 00:00 UTC

**Process:**
1. Query all residents with status = "active"
2. Query all FeeTypes with isActive = true
3. For each resident-fee combination, check if debt already exists for current month
4. Create new Debt records for missing combinations
5. Send notifications to residents about new fees
6. Log job execution in CronJobLogs

### Overdue Debt Notification Job

**Trigger:** Daily at 08:00 UTC

**Process:**
1. Query all debts with status = "unpaid" or "partially_paid" and dueDate < today
2. For each overdue debt, create notification for resident and manager
3. Update debt status to "overdue"
4. Log job execution

---

## Vietnamese Language Support

All text fields support UTF-8 encoding for Vietnamese characters. UI will provide Vietnamese translations for all labels, error messages, and notifications.

---

## Data Retention Policy

- Attendance records: Retained indefinitely
- Payment records: Retained indefinitely
- Room assignment history: Retained indefinitely
- Notifications: Retained for 90 days
- Cron job logs: Retained for 1 year
- Inactive residents: Soft delete (status = "inactive"), data retained

