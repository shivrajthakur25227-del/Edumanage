Student Management System with Frontend
A modern, responsive, and robust Student Management System developed in Python using the Flask web framework and SQLite3 relational database. This project was developed as a comprehensive submission for a college Python programming course.

📋 Table of Contents
Project Overview
Key Features
Technologies Used
Project Structure
System Requirements
Installation & Setup
1. Clone or Extract the Project
2. Create a Python Virtual Environment
3. Activate Virtual Environment
4. Install Dependencies
5. Run the Application
Database Schema & Architecture
Grading Rubric & Calculation
Security & Validation
Screenshots & UI Walkthrough
Future Enhancements
License & Academic Integrity
🎯 Project Overview
Managing student academic records, demographics, courses, and examination performance can be tedious when handled manually or via disjointed spreadsheets.

This Student Management System provides a centralized, secure, and intuitive web application that allows college faculty and administrators to:

Maintain real-time student demographic and enrollment information.
Search, filter, and view student directories seamlessly.
Record subject-wise examination marks.
Automatically compute cumulative totals, percentages, and grade letters.
Export or view comprehensive report cards.
The application adheres strictly to standard Python development practices, runs completely offline from the command line, uses zero paid APIs or cloud dependencies, and utilizes parameterized SQLite operations for data safety.

🚀 Key Features
1. Interactive Faculty Dashboard
Real-time stat cards displaying:
Total Students enrolled.
Male Students and Female Students distribution count.
Total Academic Courses offered.
Course enrollment breakdown chart & distribution.
Recent Registrations list with direct action links.
Quick navigation shortcuts for adding students and viewing directories.
2. Comprehensive Student Directory (View, Search & Filter)
Responsive tabular view displaying ID, Full Name, Roll Number, Email, Course, Department, and Semester.
Real-time Multi-field Search: Search instantly by student name or roll number.
Dynamic Filters: Filter students by Course and Semester.
Direct row action shortcuts: View Details, Edit Record, and Delete Student.
3. Student Registration & Validation (Add Student)
Form fields: Student Full Name, Roll Number, Email, Phone Number, Gender, Date of Birth, Degree Course, Academic Department, Semester (1–12), and Residential Address.
Frontend & Backend Validation:
Enforces mandatory fields.
Validates email regex syntax (user@domain.com).
Restricts semester values to integers between 1 and 12.
Validates phone number formats.
Duplicate Roll Number Prevention: Verifies uniqueness in the database before saving.
4. Detailed Student Profile & Performance Sheet
Individual student profile cards with avatar badges and contact info.
Full academic marks section:
Subject name, Marks Obtained, Maximum Marks, and Percentage per subject.
Cumulative calculation: Total Marks Obtained, Maximum Possible Marks, Overall Percentage, and Letter Grade.
Pass / Fail status indicator.
Ability to add new subject marks and delete individual records.
5. Academic Results & Marksheet Hub
Dedicated college results page compiling performance for all students.
Filter results by Course or Semester.
Color-coded grade indicators (A+, A, B, C, D, F).
6. Edit & Delete with Confirmation Safeguards
Edit pre-populated form allowing instant updates with duplicate roll-number safety checks.
Delete action with modal confirmation prevents accidental data loss, accompanied by cascading deletion of related marks.
🛠️ Technologies Used
Layer	Technology	Purpose
Backend Language	Python 3 (3.8+)	Core application logic and routing
Web Framework	Flask (v3.0.3)	Lightweight WSGI web framework and request handling
Database	SQLite3	Embedded, zero-configuration SQL database
Templating Engine	Jinja2 (v3.1.4)	Dynamic HTML template rendering and template inheritance
Frontend Markup	HTML5	Semantic page structures
Styling	CSS3	Custom responsive grid/flexbox UI (No external paid dependencies)
Client Scripting	JavaScript (ES6)	Client-side validation, mobile drawer toggle, and modal controls
📂 Project Structure
Student-Management-System/
│
├── app.py                  # Main Flask application with routes, database operations & logic
├── database.db             # SQLite3 database file (auto-created on startup)
├── requirements.txt        # Python package dependencies
├── README.md               # Comprehensive project documentation
│
├── templates/              # Jinja2 HTML templates
│   ├── base.html           # Main master layout (sidebar, topbar, flash messages)
│   ├── index.html          # Dashboard with statistics and recent students
│   ├── add_student.html    # Form to register a new student
│   ├── students.html       # Student directory table with search and filters
│   ├── student_details.html# Comprehensive profile & subject marksheet view
│   ├── edit_student.html   # Update student information form
│   ├── add_marks.html      # Add subject examination scores form
│   ├── results.html        # Academic results and ranking sheet
│   └── about.html          # Project architecture, rubric, and developer notes
│
└── static/                 # Static web assets
    ├── css/
    │   └── style.css       # Clean, modern college management styling
    └── js/
        └── script.js       # UI interactions, form validation, and confirm modals
💻 System Requirements
Operating System: Windows 10/11, macOS (10.15+), or Linux (Ubuntu, Debian, Fedora, Arch)
Python: Python 3.8, 3.9, 3.10, 3.11, or 3.12
Web Browser: Any modern browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari)
Terminal/Command Prompt: Standard shell access
⚙️ Installation & Setup
Follow these step-by-step commands to set up and run the application locally.

1. Clone or Extract the Project
Open your command line/terminal and navigate to the project directory:

cd Student-Management-System
2. Create a Python Virtual Environment
Creating an isolated virtual environment ensures clean dependency management:

# On Windows, macOS, or Linux:
python3 -m venv venv

# If python3 is mapped to python on your system:
python -m venv venv
3. Activate Virtual Environment
On Windows (Command Prompt):

venv\Scripts\activate.bat
On Windows (PowerShell):

venv\Scripts\Activate.ps1
On macOS / Linux:

source venv/bin/activate
(When activated, your terminal prompt will display (venv) at the beginning).

4. Install Dependencies
Install all required dependencies using pip:

pip install -r requirements.txt
5. Run the Application
Start the Flask development server:

python app.py
You will see terminal output similar to:

==================================================
 Student Management System - Flask Application
==================================================
 Database: /path/to/Student-Management-System/database.db
 Running at: http://127.0.0.1:5000
 Press CTRL+C to stop the server.
==================================================
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000 (Press CTRL+C to quit)
6. Open in Browser
Open your browser and navigate to:

http://127.0.0.1:5000
or

http://localhost:5000
🗄️ Database Schema & Architecture
The database is built on SQLite3 and enforces relational integrity using foreign keys.

1. students Table
Stores student demographic and college registration data.

Column	Data Type	Constraints	Description
id	INTEGER	PRIMARY KEY, AUTOINCREMENT	Unique student identifier
name	TEXT	NOT NULL	Full name of the student
roll_number	TEXT	NOT NULL, UNIQUE	University assigned roll number (e.g. CS202601)
email	TEXT	NOT NULL	Student contact email
phone	TEXT	NOT NULL	Contact telephone number
gender	TEXT	NOT NULL	Male / Female / Other
dob	TEXT	NOT NULL	Date of Birth (YYYY-MM-DD)
course	TEXT	NOT NULL	Enrolled degree (e.g. B.Tech Computer Science)
department	TEXT	NOT NULL	Department Name
semester	INTEGER	NOT NULL	Current semester (1 to 12)
address	TEXT	NOT NULL	Residential address
created_at	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP	Record creation timestamp
2. marks Table
Stores subject-wise examination scores linked to the respective student.

Column	Data Type	Constraints	Description
id	INTEGER	PRIMARY KEY, AUTOINCREMENT	Unique mark record identifier
student_id	INTEGER	NOT NULL, FOREIGN KEY	References students(id) ON DELETE CASCADE
subject	TEXT	NOT NULL	Academic subject name (e.g. Python Programming)
marks_obtained	REAL	NOT NULL	Marks scored by student
max_marks	REAL	NOT NULL, DEFAULT 100.0	Maximum marks for the exam
📊 Grading Rubric & Calculation
The system calculates total marks, percentage, and letter grades automatically using the formula:

Percentage
=
(
∑
Marks Obtained
∑
Maximum Marks
)
×
100

Grading Table:
Percentage Range	Grade	Academic Performance
90% – 100%	A+	Outstanding Distinction
80% – 89%	A	Excellent
70% – 79%	B	Very Good
60% – 69%	C	Good
50% – 59%	D	Satisfactory / Pass
Below 50%	F	Fail / Needs Improvement
🔒 Security & Validation
SQL Injection Prevention: All queries in app.py strictly utilize parameterized queries with placeholders (?) rather than direct string interpolation or concatenation.
Duplicate Protection: Roll numbers are verified both via SQLite unique constraints and pre-check validation logic before saving.
Cascading Relational Deletion: Removing a student record cleanly deletes associated marks via ON DELETE CASCADE pragma.
Input Sanitization: All form inputs are trimmed and checked against empty string conditions, negative values, and non-numeric characters.
No Exposure of Stack Traces: Friendly flash banners notify users of issues without exposing sensitive server internals.
📸 Screenshots & UI Walkthrough
Screen	Description
Dashboard	Stat counters, course distribution bars, quick action shortcuts, recent registrations table.
Student Directory	Search by name/roll, filter by semester/course, responsive action buttons.
Add / Edit Student	Grid-based clean form with validation feedback.
Student Details & Marksheet	Card profile, aggregate score statistics, subject-wise breakdown, add marks button.
Results Sheet	Consolidated marksheet with grade badges and pass/fail indicators.
🔮 Future Enhancements
 Export student marksheets and directories to PDF and CSV/Excel.
 User authentication (Admin, Teacher, and Student login portals).
 Attendance tracking module with monthly percentage calculations.
 Profile photo upload integration using local storage.
 Email notifications to students when results are published.
🎓 Academic Integrity & Submission
This project was built from scratch for college coursework. It contains clean, well-commented Python code adhering to PEP 8 standards, modular routing, and clean MVC separation between data (SQLite), presentation (Jinja2 / CSS), and controller logic (Flask routes).
