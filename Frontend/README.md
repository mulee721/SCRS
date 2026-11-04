# Campus Enrollment Companion

PROJECT: SCRS – Student Course Registration System
Act as a senior UI/UX designer and full-stack product designer. Design and build a premium, modern, responsive University Student Course Registration System (SCRS) with three separate role-based dashboards: Student, Lecturer, and Administrator.
The system should look like a professional university SaaS platform with excellent usability, consistent design, clean layouts, smooth animations, and intuitive navigation.
1. DESIGN REQUIREMENTS
Use:
Navy blue: #142B4A
Royal blue: #3B82F6
Background: #F5F7FB
White cards with subtle shadows
Green for success, orange for warnings, red for errors
Inter or Plus Jakarta Sans typography
Design principles:
Modern SaaS dashboard aesthetic.
Consistent sidebar and top navigation.
Rounded cards (12–16px).
Clear spacing and visual hierarchy.
Professional icons from Lucide.
Beautiful tables, charts, status badges, and empty states.
Smooth hover effects and subtle transitions.
Fully responsive on desktop, tablet, and mobile.
Light and dark mode.
Avoid cluttered layouts, excessive gradients, oversized headings, and unnecessary animations.
2. PUBLIC WEBSITE
Create a professional landing page with:
University logo and SCRS branding.
Navigation: Home, About, Features, Contact, Sign In.
Hero section: "Smart Course Registration. Simpler University Life."
Short description explaining the system.
Clear Get Started and Sign In buttons.
Feature cards for Students, Lecturers, and Administrators.
How It Works section.
Benefits and statistics section.
Professional footer with contact information.
3. AUTHENTICATION
Create one shared login page for all three roles.
Include:
Email or username.
Password with show/hide option.
Remember me.
Forgot password.
Form validation.
Loading and error states.
Role-based redirection after successful login.
Students should be able to register using the approved student registration process. Lecturer and Admin accounts should be created or managed by administrators.
Protect all dashboards based on user roles.
4. STUDENT DASHBOARD
Create a student dashboard with:
Sidebar:
Overview
Browse Courses
My Registrations
My Timetable
Academic Results
Profile
Notifications
Settings
Logout
Overview:
Welcome message with student name.
Student ID, department, and academic year.
Registered courses.
Total credit hours.
Registration status.
Upcoming classes.
Recent notifications.
Browse Courses:
Search courses by code or name.
Filter by department, semester, and credit hours.
Display course code, title, lecturer, credits, and available seats.
Register and drop courses with confirmation dialogs.
Prevent duplicate registrations and registration beyond credit limits.
My Registrations:
Display registered courses.
Registration status.
Credit-hour summary.
Drop course action.
My Timetable:
Weekly timetable.
Course name, classroom, lecturer, and schedule.
Detect and prevent timetable conflicts.
Academic Results:
Course grades.
Credit hours.
GPA summary.
5. LECTURER DASHBOARD
Sidebar:
Overview
My Courses
Enrolled Students
Attendance
Grade Management
Timetable
Announcements
Profile
Settings
Logout
Overview:
Welcome message.
Assigned courses.
Total enrolled students.
Upcoming classes.
Recent activities.
My Courses:
Display assigned courses.
Course information and enrolled student counts.
Enrolled Students:
Search and filter students.
View student details and registration information.
Grade Management:
Enter and update grades.
View course performance.
Validate grade input.
Announcements:
Publish announcements for assigned courses.
6. ADMIN DASHBOARD
Sidebar:
Overview
Student Management
Lecturer Management
Course Management
Department Management
Semester Management
Registration Management
Reports and Analytics
Announcements
System Settings
Logout
Overview:
Total students.
Total lecturers.
Total courses.
Active registrations.
Registration statistics.
Enrollment charts.
Recent system activities.
Student Management:
Add, edit, view, search, and deactivate students.
Assign departments and academic years.
Lecturer Management:
Add, edit, view, and deactivate lecturer accounts.
Assign lecturers to courses.
Course Management:
Create, update, and delete courses.
Set course code, title, description, credit hours, department, and capacity.
Semester Management:
Create semesters.
Set registration opening and closing dates.
Activate and close semesters.
Registration Management:
Monitor registrations.
Approve or reject requests if approval is enabled.
View enrollment statistics.
Reports:
Student enrollment reports.
Course registration reports.
Department statistics.
Export reports.
7. INTERACTION AND FUNCTIONALITY
Every button, sidebar link, search, filter, modal, and form must work.
Include:
Confirmation dialogs for destructive actions.
Toast notifications.
Form validation.
Loading skeletons.
Empty states.
Error handling.
Pagination and search.
Responsive mobile sidebar.
Realistic sample data for UI previews.
8. TECHNICAL REQUIREMENTS
Use clean, reusable, component-based architecture.
Use React and Tailwind CSS for the frontend if starting a new project.
Keep the design organized with reusable:
Sidebar
Navbar
Dashboard cards
Data tables
Form components
Modal dialogs
Charts
Notification components
Important:
Do not build three unrelated applications.
Use one consistent design system and shared components.
Keep Student, Lecturer, and Admin dashboards visually consistent while giving each role its own features.
Do not expose admin functionality to students or lecturers.
Do not put database credentials or secret keys in frontend code.
First build the complete UI and navigation for all three dashboards. Then connect the existing backend and database without destroying existing project functionality.
The final result should look like a premium, production-quality university management SaaS application.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://campus-enrollment-companion.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6e47701e-a6e7-4db1-90d5-52f9c295b643).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
