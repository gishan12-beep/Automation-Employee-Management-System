# System Functionality Report: Automation Employee Management System

This report provides a definitive list of functionalities currently implemented in the system, based on an audit of the frontend React components and backend API controllers.

## 1. Functional Use Cases by Actor

### **Actor: Manager**
The Manager role is designed for administrative oversight and operational management.

| Use Case ID | Name | Actors | Description |
| :--- | :--- | :--- | :--- |
| **UC-M01** | **Employee Lifecycle Management** | Manager | Create, update, and deactivate employee profiles. Supports managing personal details, bank info, and salary types. |
| **UC-M02** | **Manual Attendance Override** | Manager | Manually record attendance for any employee (Present, Absent, Late, Half-Day) via the Manager Dashboard. |
| **UC-M03** | **Leave Approval Workflow** | Manager | Review all pending leave requests. Access to approve or reject requests with automated status updates. |
| **UC-M04** | **Issue Resolution & Tracking** | Manager | View a centralized log of all technical or HR issues reported by staff. Move issues to "Resolved" state. |
| **UC-M05** | **Settlement Finalization** | Manager | Calculate final dues for exiting employees. Includes basic pay, leave encashment, and gratuity calculations. |
| **UC-M06** | **Operational Dashboard** | Manager | Real-time tracking of active headcount, today's attendance count, and pending administrative tasks. |
| **UC-M07** | **Management Reporting** | Manager | Generate and view reports for Attendance trends, Leave history, and Departmental issue logs. |

---

### **Actor: Employee**
The Employee role focuses on self-service and daily workplace interactions.

| Use Case ID | Name | Actors | Description |
| :--- | :--- | :--- | :--- |
| **UC-E01** | **Daily Check-In/Check-Out** | Employee | Self-service attendance recording with time-tracking for start and end of shifts. |
| **UC-E02** | **Leave Application** | Employee | Submit requests for various leave types (Annual, Casual, Sick). View current status and history. |
| **UC-E03** | **Self-Reporting (Issues)** | Employee | Directly report workplace issues or technical bugs to the management team. |
| **UC-E04** | **Salary & Payslip Access** | Employee | Securely view monthly payslip details, salary breakdowns, and historical earnings. |
| **UC-E05** | **Profile & Security** | Employee | Change personal passwords and view basic profile information. |
| **UC-E06** | **Final Settlement View** | Employee | View the preview of terminal benefits and settlement status during the offboarding process. |

---

### **Actor: Accountant**
The Accountant role manages financial compliance and payroll execution.

| Use Case ID | Name | Actors | Description |
| :--- | :--- | :--- | :--- |
| **UC-A01** | **Bulk Payroll Processing** | Accountant, Admin | Execute company-wide payroll calculations for a specific month and year. |
| **UC-A02** | **Individual Payroll Adjustment** | Accountant | Fine-tune incentives and deductions for specific employees before payroll finalization. |
| **UC-A03** | **Financial Summaries** | Accountant, Manager | View total company expenditure reports, net pay totals, and departmental costs. |
| **UC-A04** | **Bank Transfer Management** | Accountant | Generate bank-ready withdrawal lists for distributing salaries to employee bank accounts. |
| **UC-A05** | **Statutory Compliance (EPF/ETF)** | Accountant | Generate government-mandated reports for EPF (Employees' Provident Fund) and ETF contributions. |

---

## 2. Implied but Not Fully Documented Features
These features exist in the code (Controllers/Routes) but may have limited visibility in the UI:
- **Work Logs (Daily Tasks)**: The backend supports creating and viewing daily work logs (`workLogController.js`), but the UI primary focuses on Attendance rather than specific task descriptions.
- **Departmental Management**: A `getDepartments` API exists to organize employees, though a dedicated "Department Management" CRUD page is secondary to the Employee list.
- **Settlement Persistence**: The "Save" action for settlements in the UI is currently a simulation/alert, though a `final_settlements` table exists in the database.

---

## 3. Key Differences from Standard EMS
- **Heavy Focus on Local Compliance**: Strong emphasis on EPF/ETF and LKR (Sri Lankan Rupee) formatting, reflecting a localized business focus.
- **Direct Manager-Employee Issue Loop**: Most standard EMS systems use ticket-based helpdesks; this system integrates "Issues" directly into the Management dashboard.
- **Offboarding Priority**: The "Final Settlement" module is more robust and prominent than in many typical platforms.
- **No Recruitment Module**: Unlike broad HR suites, this system focuses entirely on *active* and *exiting* employees, with no recruitment/hiring pipeline.

---

## 4. Suggested Roadmap Improvements
> [!TIP]
> **Priority 1: Notification System**
> Add a websocket or polling-based notification badge for managers to see new "Issues" or "Leave Requests" without refreshing.

> [!NOTE]
> **Priority 2: Document Storage**
> Implement cloud storage (S3/Cloudinary) for "Leave Medical Certificates" and "Employee ID documents" which are currently just data entries.

> [!IMPORTANT]
> **Priority 3: Performance Reviews**
> The current system lacks a feedback loop. Adding a simple quarterly rating system for employees would complete the HR lifecycle.
