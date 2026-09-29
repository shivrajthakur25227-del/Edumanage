import JSZip from 'jszip';

export interface ProjectFile {
  path: string;
  name: string;
  folder: string;
  language: string;
  content: string;
  description: string;
}

export const PROJECT_FILES: ProjectFile[] = [
  {
    path: 'app.py',
    name: 'app.py',
    folder: 'Root',
    language: 'python',
    description: 'Main Flask application with routes, database operations, grading logic, and validation.',
    content: `"""
Student Management System
A complete, lightweight, and robust web application built with Python 3, Flask, and SQLite.
Developed for college Python programming course submission.
"""

import os
import sqlite3
from flask import (
    Flask, render_template, request, redirect, url_for, flash, abort
)

# App Configuration
app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-secret-key-sms-college-project-2026'

# Path to SQLite database file
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE = os.path.join(BASE_DIR, 'database.db')


# ==========================================
# Database Helper Functions
# ==========================================

def get_db_connection():
    """
    Establishes and returns a connection to the SQLite database.
    Row factory is set to sqlite3.Row for dictionary-like column access.
    """
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """
    Creates the required database tables if they do not exist:
    - students: stores demographic and academic enrollment information
    - marks: stores subject-wise academic scores linked via foreign key
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create students table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            roll_number TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            gender TEXT NOT NULL,
            dob TEXT NOT NULL,
            course TEXT NOT NULL,
            department TEXT NOT NULL,
            semester INTEGER NOT NULL,
            address TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create marks table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS marks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            subject TEXT NOT NULL,
            marks_obtained REAL NOT NULL,
            max_marks REAL NOT NULL DEFAULT 100.0,
            FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
        )
    ''')

    conn.commit()
    conn.close()


def seed_sample_data():
    """
    Inserts initial sample students and their examination marks
    if the database is currently empty.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) AS count FROM students")
    count = cursor.fetchone()['count']

    if count == 0:
        sample_students = [
            (
                "Aarav Sharma", "CS202601", "aarav.sharma@example.edu",
                "9876543210", "Male", "2004-05-14", "B.Tech Computer Science",
                "Computer Science & Engineering", 4, "124 Park Avenue, City Center"
            ),
            (
                "Diya Patel", "CS202602", "diya.patel@example.edu",
                "9812345678", "Female", "2004-09-22", "B.Tech Computer Science",
                "Computer Science & Engineering", 4, "45 River View Lane, Westside"
            ),
            (
                "Rohan Verma", "IT202615", "rohan.verma@example.edu",
                "9723456789", "Male", "2003-11-03", "B.Sc Information Tech",
                "Information Technology", 6, "88 Heritage Heights, Sector 12"
            ),
            (
                "Ananya Iyer", "EC202608", "ananya.iyer@example.edu",
                "9634567890", "Female", "2005-02-18", "B.Tech Electronics",
                "Electronics & Communication", 2, "302 Greenfield Residency"
            ),
            (
                "Kabir Singh", "ME202633", "kabir.singh@example.edu",
                "9545678901", "Male", "2003-08-30", "B.Tech Mechanical",
                "Mechanical Engineering", 6, "15 Industrial Colony, East")
        ]

        cursor.executemany('''
            INSERT INTO students (
                name, roll_number, email, phone, gender, dob,
                course, department, semester, address
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', sample_students)

        cursor.execute("SELECT id, roll_number FROM students")
        students = cursor.fetchall()
        id_map = {s['roll_number']: s['id'] for s in students}

        sample_marks = [
            # Aarav Sharma
            (id_map["CS202601"], "Python Programming", 92.0, 100.0),
            (id_map["CS202601"], "Data Structures & Algorithms", 88.5, 100.0),
            (id_map["CS202601"], "Database Management Systems", 94.0, 100.0),
            (id_map["CS202601"], "Computer Networks", 85.0, 100.0),

            # Diya Patel
            (id_map["CS202602"], "Python Programming", 96.0, 100.0),
            (id_map["CS202602"], "Data Structures & Algorithms", 91.0, 100.0),
            (id_map["CS202602"], "Database Management Systems", 89.0, 100.0),
            (id_map["CS202602"], "Web Technologies", 95.0, 100.0),

            # Rohan Verma
            (id_map["IT202615"], "Software Engineering", 74.0, 100.0),
            (id_map["IT202615"], "Cloud Computing", 68.0, 100.0),
            (id_map["IT202615"], "Network Security", 78.0, 100.0),

            # Ananya Iyer
            (id_map["EC202608"], "Signals and Systems", 82.0, 100.0),
            (id_map["EC202608"], "Digital Electronics", 86.0, 100.0),
            (id_map["EC202608"], "Engineering Mathematics", 79.0, 100.0),

            # Kabir Singh
            (id_map["ME202633"], "Thermodynamics", 62.0, 100.0),
            (id_map["ME202633"], "Fluid Mechanics", 58.0, 100.0),
            (id_map["ME202633"], "Machine Design", 65.0, 100.0)
        ]

        cursor.executemany('''
            INSERT INTO marks (student_id, subject, marks_obtained, max_marks)
            VALUES (?, ?, ?, ?)
        ''', sample_marks)

        conn.commit()

    conn.close()


# ==========================================
# Grading Calculation Helper
# ==========================================

def calculate_grade(percentage):
    """
    Calculates letter grade according to course syllabus requirements:
    90 - 100 : A+
    80 - 89  : A
    70 - 79  : B
    60 - 69  : C
    50 - 59  : D
    Below 50 : F
    """
    if percentage >= 90.0:
        return 'A+'
    elif percentage >= 80.0:
        return 'A'
    elif percentage >= 70.0:
        return 'B'
    elif percentage >= 60.0:
        return 'C'
    elif percentage >= 50.0:
        return 'D'
    else:
        return 'F'


def get_student_performance(student_id):
    """
    Fetches all subject marks for a student and calculates:
    - total_obtained
    - total_max
    - percentage
    - grade
    - marks list
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, subject, marks_obtained, max_marks
        FROM marks
        WHERE student_id = ?
        ORDER BY subject ASC
    ''', (student_id,))
    marks_records = cursor.fetchall()
    conn.close()

    total_obtained = sum(m['marks_obtained'] for m in marks_records)
    total_max = sum(m['max_marks'] for m in marks_records)
    percentage = (total_obtained / total_max * 100.0) if total_max > 0 else 0.0
    grade = calculate_grade(percentage) if total_max > 0 else 'N/A'

    return {
        'marks': marks_records,
        'total_obtained': round(total_obtained, 2),
        'total_max': round(total_max, 2),
        'percentage': round(percentage, 2),
        'grade': grade,
        'subject_count': len(marks_records)
    }


# ==========================================
# Routes & Controllers
# ==========================================

@app.route('/')
def dashboard():
    """
    Dashboard Page:
    - Metrics: Total students, Male students, Female students, Unique courses count
    - Recent 5 registered students
    - Quick actions
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Metrics
    cursor.execute("SELECT COUNT(*) AS total FROM students")
    total_students = cursor.fetchone()['total']

    cursor.execute("SELECT COUNT(*) AS male_count FROM students WHERE LOWER(gender) = 'male'")
    male_students = cursor.fetchone()['male_count']

    cursor.execute("SELECT COUNT(*) AS female_count FROM students WHERE LOWER(gender) = 'female'")
    female_students = cursor.fetchone()['female_count']

    cursor.execute("SELECT COUNT(DISTINCT course) AS course_count FROM students")
    course_count = cursor.fetchone()['course_count']

    # Course list with distribution
    cursor.execute('''
        SELECT course, COUNT(*) as count
        FROM students
        GROUP BY course
        ORDER BY count DESC
    ''')
    course_distribution = cursor.fetchall()

    # Recent 5 students
    cursor.execute('''
        SELECT id, name, roll_number, email, course, department, semester, created_at
        FROM students
        ORDER BY id DESC
        LIMIT 5
    ''')
    recent_students = cursor.fetchall()

    conn.close()

    return render_template(
        'index.html',
        total_students=total_students,
        male_students=male_students,
        female_students=female_students,
        course_count=course_count,
        course_distribution=course_distribution,
        recent_students=recent_students
    )


@app.route('/students')
def students():
    """
    View All Students Table:
    - Search by student name or roll number
    - Filter by course
    - Filter by semester
    """
    search_query = request.args.get('search', '').strip()
    selected_course = request.args.get('course', '').strip()
    selected_semester = request.args.get('semester', '').strip()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT DISTINCT course FROM students ORDER BY course ASC")
    all_courses = [row['course'] for row in cursor.fetchall()]

    cursor.execute("SELECT DISTINCT semester FROM students ORDER BY semester ASC")
    all_semesters = [row['semester'] for row in cursor.fetchall()]

    query = '''
        SELECT id, name, roll_number, email, course, department, semester
        FROM students
        WHERE 1=1
    '''
    params = []

    if search_query:
        query += " AND (name LIKE ? OR roll_number LIKE ?)"
        wildcard = f"%{search_query}%"
        params.extend([wildcard, wildcard])

    if selected_course:
        query += " AND course = ?"
        params.append(selected_course)

    if selected_semester:
        try:
            sem_int = int(selected_semester)
            query += " AND semester = ?"
            params.append(sem_int)
        except ValueError:
            pass

    query += " ORDER BY id DESC"

    cursor.execute(query, tuple(params))
    students_list = cursor.fetchall()
    conn.close()

    return render_template(
        'students.html',
        students=students_list,
        all_courses=all_courses,
        all_semesters=all_semesters,
        search_query=search_query,
        selected_course=selected_course,
        selected_semester=selected_semester,
        total_found=len(students_list)
    )


@app.route('/student/add', methods=['GET', 'POST'])
def add_student():
    """
    Add New Student:
    - GET: Displays form with all fields
    - POST: Validates input, prevents duplicate roll numbers, saves to SQLite
    """
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        roll_number = request.form.get('roll_number', '').strip().upper()
        email = request.form.get('email', '').strip().lower()
        phone = request.form.get('phone', '').strip()
        gender = request.form.get('gender', '').strip()
        dob = request.form.get('dob', '').strip()
        course = request.form.get('course', '').strip()
        department = request.form.get('department', '').strip()
        semester_raw = request.form.get('semester', '').strip()
        address = request.form.get('address', '').strip()

        if not (name and roll_number and email and phone and gender and dob and course and department and semester_raw and address):
            flash('All fields are required. Please fill out the entire form.', 'danger')
            return render_template('add_student.html', form=request.form)

        try:
            semester = int(semester_raw)
            if semester < 1 or semester > 12:
                flash('Semester must be a number between 1 and 12.', 'danger')
                return render_template('add_student.html', form=request.form)
        except ValueError:
            flash('Semester must be a valid integer.', 'danger')
            return render_template('add_student.html', form=request.form)

        if '@' not in email or '.' not in email:
            flash('Please enter a valid email address.', 'danger')
            return render_template('add_student.html', form=request.form)

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM students WHERE roll_number = ?", (roll_number,))
        if cursor.fetchone():
            conn.close()
            flash(f'Roll Number "{roll_number}" is already registered. Please use a unique Roll Number.', 'danger')
            return render_template('add_student.html', form=request.form)

        try:
            cursor.execute('''
                INSERT INTO students (
                    name, roll_number, email, phone, gender, dob,
                    course, department, semester, address
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (name, roll_number, email, phone, gender, dob, course, department, semester, address))
            conn.commit()
            new_id = cursor.lastrowid
            conn.close()

            flash(f'Student "{name}" added successfully with Roll Number {roll_number}!', 'success')
            return redirect(url_for('student_details', id=new_id))

        except sqlite3.Error:
            conn.close()
            flash('A database error occurred while creating the student record. Please try again.', 'danger')
            return render_template('add_student.html', form=request.form)

    return render_template('add_student.html', form={})


@app.route('/student/<int:id>')
def student_details(id):
    """
    Student Details View:
    - Shows full profile and enrollment info
    - Shows academic performance marks, total, percentage, and letter grade
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students WHERE id = ?", (id,))
    student = cursor.fetchone()
    conn.close()

    if student is None:
        flash('Student record not found.', 'danger')
        return redirect(url_for('students'))

    performance = get_student_performance(id)

    return render_template(
        'student_details.html',
        student=student,
        performance=performance
    )


@app.route('/student/edit/<int:id>', methods=['GET', 'POST'])
def edit_student(id):
    """
    Edit Existing Student:
    - Pre-populates existing data
    - Validates updates & checks uniqueness of roll number
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students WHERE id = ?", (id,))
    student = cursor.fetchone()

    if student is None:
        conn.close()
        flash('Student record not found.', 'danger')
        return redirect(url_for('students'))

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        roll_number = request.form.get('roll_number', '').strip().upper()
        email = request.form.get('email', '').strip().lower()
        phone = request.form.get('phone', '').strip()
        gender = request.form.get('gender', '').strip()
        dob = request.form.get('dob', '').strip()
        course = request.form.get('course', '').strip()
        department = request.form.get('department', '').strip()
        semester_raw = request.form.get('semester', '').strip()
        address = request.form.get('address', '').strip()

        if not (name and roll_number and email and phone and gender and dob and course and department and semester_raw and address):
            flash('All fields are required. Please fill out the entire form.', 'danger')
            return render_template('edit_student.html', student=student)

        try:
            semester = int(semester_raw)
            if semester < 1 or semester > 12:
                flash('Semester must be between 1 and 12.', 'danger')
                return render_template('edit_student.html', student=student)
        except ValueError:
            flash('Semester must be a valid number.', 'danger')
            return render_template('edit_student.html', student=student)

        if '@' not in email or '.' not in email:
            flash('Please enter a valid email address.', 'danger')
            return render_template('edit_student.html', student=student)

        cursor.execute("SELECT id FROM students WHERE roll_number = ? AND id != ?", (roll_number, id))
        if cursor.fetchone():
            flash(f'Roll Number "{roll_number}" is already used by another student.', 'danger')
            return render_template('edit_student.html', student=student)

        try:
            cursor.execute('''
                UPDATE students SET
                    name = ?, roll_number = ?, email = ?, phone = ?,
                    gender = ?, dob = ?, course = ?, department = ?,
                    semester = ?, address = ?
                WHERE id = ?
            ''', (name, roll_number, email, phone, gender, dob, course, department, semester, address, id))
            conn.commit()
            conn.close()

            flash(f'Student details for "{name}" updated successfully.', 'success')
            return redirect(url_for('student_details', id=id))

        except sqlite3.Error:
            conn.close()
            flash('Database error while updating student. Please try again.', 'danger')
            return render_template('edit_student.html', student=student)

    conn.close()
    return render_template('edit_student.html', student=student)


@app.route('/student/delete/<int:id>', methods=['POST'])
def delete_student(id):
    """
    Delete Student Record:
    - Removes student and cascades to their marks records
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM students WHERE id = ?", (id,))
    student = cursor.fetchone()

    if student is None:
        conn.close()
        flash('Student record not found.', 'danger')
        return redirect(url_for('students'))

    student_name = student['name']
    cursor.execute("DELETE FROM students WHERE id = ?", (id,))
    conn.commit()
    conn.close()

    flash(f'Student "{student_name}" and associated academic marks have been removed.', 'success')
    return redirect(url_for('students'))


@app.route('/student/<int:id>/marks/add', methods=['GET', 'POST'])
def add_marks(id):
    """
    Add Subject Marks for a Student:
    - Subject name
    - Marks obtained
    - Maximum marks (default 100)
    - Validates marks <= max_marks and non-negative
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students WHERE id = ?", (id,))
    student = cursor.fetchone()

    if student is None:
        conn.close()
        flash('Student record not found.', 'danger')
        return redirect(url_for('students'))

    if request.method == 'POST':
        subject = request.form.get('subject', '').strip()
        marks_obtained_raw = request.form.get('marks_obtained', '').strip()
        max_marks_raw = request.form.get('max_marks', '100').strip()

        if not (subject and marks_obtained_raw and max_marks_raw):
            flash('Please complete all marks fields.', 'danger')
            return render_template('add_marks.html', student=student)

        try:
            marks_obtained = float(marks_obtained_raw)
            max_marks = float(max_marks_raw)
        except ValueError:
            flash('Marks must be valid numeric values.', 'danger')
            return render_template('add_marks.html', student=student)

        if marks_obtained < 0 or max_marks <= 0:
            flash('Marks obtained cannot be negative, and Maximum Marks must be greater than zero.', 'danger')
            return render_template('add_marks.html', student=student)

        if marks_obtained > max_marks:
            flash(f'Marks obtained ({marks_obtained}) cannot be greater than Maximum Marks ({max_marks}).', 'danger')
            return render_template('add_marks.html', student=student)

        cursor.execute('''
            INSERT INTO marks (student_id, subject, marks_obtained, max_marks)
            VALUES (?, ?, ?, ?)
        ''', (id, subject, marks_obtained, max_marks))
        conn.commit()
        conn.close()

        flash(f'Marks for subject "{subject}" added successfully for {student["name"]}.', 'success')
        return redirect(url_for('student_details', id=id))

    conn.close()
    return render_template('add_marks.html', student=student)


@app.route('/student/<int:student_id>/marks/delete/<int:mark_id>', methods=['POST'])
def delete_mark(student_id, mark_id):
    """
    Deletes an individual subject mark entry.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM marks WHERE id = ? AND student_id = ?", (mark_id, student_id))
    conn.commit()
    conn.close()

    flash('Subject marks entry removed.', 'info')
    return redirect(url_for('student_details', id=student_id))


@app.route('/results')
def results():
    """
    Results & Grade Sheet:
    - Lists all students with their total marks, overall percentage, and letter grade
    - Filterable by semester or course
    """
    course_filter = request.args.get('course', '').strip()
    semester_filter = request.args.get('semester', '').strip()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT DISTINCT course FROM students ORDER BY course ASC")
    all_courses = [row['course'] for row in cursor.fetchall()]

    cursor.execute("SELECT DISTINCT semester FROM students ORDER BY semester ASC")
    all_semesters = [row['semester'] for row in cursor.fetchall()]

    query = '''
        SELECT id, name, roll_number, course, semester
        FROM students
        WHERE 1=1
    '''
    params = []

    if course_filter:
        query += " AND course = ?"
        params.append(course_filter)

    if semester_filter:
        try:
            query += " AND semester = ?"
            params.append(int(semester_filter))
        except ValueError:
            pass

    query += " ORDER BY roll_number ASC"
    cursor.execute(query, tuple(params))
    students_list = cursor.fetchall()
    conn.close()

    results_data = []
    for s in students_list:
        perf = get_student_performance(s['id'])
        status = 'Pass' if perf['percentage'] >= 50.0 and perf['subject_count'] > 0 else ('No Marks' if perf['subject_count'] == 0 else 'Fail')
        results_data.append({
            'student': s,
            'performance': perf,
            'status': status
        })

    return render_template(
        'results.html',
        results=results_data,
        all_courses=all_courses,
        all_semesters=all_semesters,
        course_filter=course_filter,
        semester_filter=semester_filter
    )


@app.route('/about')
def about():
    """
    About Page:
    - Academic project specifications, college course information, tech stack,
      database architecture, and feature overview.
    """
    return render_template('about.html')


@app.route('/seed-sample-data')
def trigger_sample_data():
    """
    Convenience web endpoint to insert sample records if empty.
    """
    seed_sample_data()
    flash('Sample students and marks loaded into the database.', 'success')
    return redirect(url_for('dashboard'))


@app.errorhandler(404)
def not_found(e):
    return render_template('base.html', not_found=True), 404


@app.errorhandler(500)
def server_error(e):
    return "<h3>An unexpected error occurred. Please return to the <a href='/'>Dashboard</a>.</h3>", 500


if __name__ == '__main__':
    init_db()
    seed_sample_data()

    print("\\n" + "=" * 50)
    print(" Student Management System - Flask Application")
    print("=" * 50)
    print(f" Database: {DATABASE}")
    print(" Running at: http://127.0.0.1:5000")
    print(" Press CTRL+C to stop the server.")
    print("=" * 50 + "\\n")

    app.run(debug=True, host='0.0.0.0', port=5000)
`
  },
  {
    path: 'requirements.txt',
    name: 'requirements.txt',
    folder: 'Root',
    language: 'plaintext',
    description: 'Python package requirements (Flask, Werkzeug, Jinja2).',
    content: `Flask==3.0.3
Werkzeug==3.0.3
Jinja2==3.1.4
click==8.1.7
itsdangerous==2.2.0
blinker==1.8.2
`
  },
  {
    path: 'README.md',
    name: 'README.md',
    folder: 'Root',
    language: 'markdown',
    description: 'Complete academic project documentation, setup instructions, and grading rubric.',
    content: `# Student Management System with Frontend

A modern, responsive, and robust **Student Management System** developed in Python using the **Flask** web framework and **SQLite3** relational database. This project was developed as a comprehensive submission for a college Python programming course.

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [System Requirements](#system-requirements)
- [Installation & Setup](#installation--setup)
- [Database Schema & Architecture](#database-schema--architecture)
- [Grading Rubric & Calculation](#grading-rubric--calculation)
- [Security & Validation](#security--validation)
- [Future Enhancements](#future-enhancements)

---

## 🎯 Project Overview

This **Student Management System** provides a centralized, secure, and intuitive web application that allows college faculty and administrators to:
1. Maintain real-time student demographic and enrollment information.
2. Search, filter, and view student directories seamlessly.
3. Record subject-wise examination marks.
4. Automatically compute cumulative totals, percentages, and grade letters.
5. Export or view comprehensive report cards.

The application adheres strictly to standard Python development practices, runs completely offline from the command line, uses zero paid APIs or cloud dependencies, and utilizes parameterized SQLite operations for data safety.

---

## 🚀 Key Features

1. **Dashboard**: Metrics for Total Students, Male/Female counts, Enrolled Courses, Recent Students list, Quick Action buttons.
2. **Student Directory**: Multi-field search (by Name and Roll Number) and dynamic filters by Course and Semester.
3. **Student Registration**: 10 distinct validated fields (Name, Roll, Email, Phone, Gender, DOB, Course, Department, Semester, Address).
4. **Duplicate Roll Number Prevention**: Validation prevents conflicting roll numbers.
5. **Academic Marks & Grade Engine**: Automatic calculation of Total Marks, Percentage, and Letter Grade (A+, A, B, C, D, F).
6. **Consolidated Results Sheet**: College-wide report cards with Pass/Fail status.
7. **Safe Deletions**: Modal confirmations with cascading delete of examination marks.

---

## ⚙️ Installation & Step-by-Step Commands

\`\`\`bash
# 1. Open terminal & navigate to folder
cd Student-Management-System

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\\Scripts\\activate
# macOS / Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the application
python app.py
\`\`\`

Access the live portal at: **http://127.0.0.1:5000**
`
  },
  {
    path: 'templates/base.html',
    name: 'base.html',
    folder: 'templates',
    language: 'html',
    description: 'Master Jinja2 base layout with responsive sidebar, topbar, and flash messages.',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Student Management System{% endblock %}</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
</head>
<body>
    <div class="app-layout">
        <!-- Sidebar Navigation -->
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="logo-mark">
                    <span class="logo-icon">🎓</span>
                    <div class="logo-text">
                        <h2>EduManage</h2>
                        <span class="logo-sub">Student Portal</span>
                    </div>
                </div>
                <button class="mobile-close-btn" id="sidebarCloseBtn">&times;</button>
            </div>

            <nav class="sidebar-nav">
                <a href="{{ url_for('dashboard') }}" class="nav-item {% if request.path == '/' %}active{% endif %}">
                    <span class="nav-icon">📊</span>
                    <span>Dashboard</span>
                </a>
                <a href="{{ url_for('add_student') }}" class="nav-item {% if request.path == '/student/add' %}active{% endif %}">
                    <span class="nav-icon">➕</span>
                    <span>Add Student</span>
                </a>
                <a href="{{ url_for('students') }}" class="nav-item {% if request.path == '/students' %}active{% endif %}">
                    <span class="nav-icon">👥</span>
                    <span>All Students</span>
                </a>
                <a href="{{ url_for('results') }}" class="nav-item {% if request.path == '/results' %}active{% endif %}">
                    <span class="nav-icon">📝</span>
                    <span>Results</span>
                </a>
                <a href="{{ url_for('about') }}" class="nav-item {% if request.path == '/about' %}active{% endif %}">
                    <span class="nav-icon">ℹ️</span>
                    <span>About</span>
                </a>
            </nav>

            <div class="sidebar-footer">
                <div class="system-status">
                    <span class="status-indicator"></span>
                    <span class="status-label">SQLite Engine Active</span>
                </div>
                <div class="sys-version">v1.0.0 • Python Flask</div>
            </div>
        </aside>

        <!-- Main Content Area -->
        <div class="main-wrapper">
            <header class="topbar">
                <div class="topbar-left">
                    <button class="menu-toggle" id="menuToggleBtn">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <div class="breadcrumb-area">
                        <span class="breadcrumb-root">College Portal</span>
                        <span class="breadcrumb-separator">/</span>
                        <span class="breadcrumb-current">{% block header_title %}Dashboard{% endblock %}</span>
                    </div>
                </div>

                <div class="topbar-right">
                    <span class="date-badge">College Portal • 2026 Academic Year</span>
                    <a href="{{ url_for('add_student') }}" class="btn btn-primary btn-sm topbar-btn">
                        <span>+ Add Student</span>
                    </a>
                </div>
            </header>

            <main class="content-container">
                {% with messages = get_flashed_messages(with_categories=true) %}
                    {% if messages %}
                        <div class="flash-messages" id="flashContainer">
                            {% for category, message in messages %}
                                <div class="alert alert-{{ category }} alert-dismissible">
                                    <span class="alert-icon">
                                        {% if category == 'success' %}✓{% elif category == 'danger' %}⚠{% else %}ℹ{% endif %}
                                    </span>
                                    <span class="alert-text">{{ message }}</span>
                                    <button class="alert-close" onclick="this.parentElement.remove();">&times;</button>
                                </div>
                            {% endfor %}
                        </div>
                    {% endif %}
                {% endwith %}

                {% block content %}{% endblock %}
            </main>

            <footer class="app-footer">
                <p>&copy; 2026 Student Management System • Developed for College Python Course Submission • Powered by Flask & SQLite</p>
            </footer>
        </div>
    </div>

    <script src="{{ url_for('static', filename='js/script.js') }}"></script>
    {% block extra_js %}{% endblock %}
</body>
</html>`
  },
  {
    path: 'templates/index.html',
    name: 'index.html',
    folder: 'templates',
    language: 'html',
    description: 'Dashboard page with total stats, male/female distribution, recent students, and courses.',
    content: `{% extends 'base.html' %}

{% block title %}Dashboard | Student Management System{% endblock %}
{% block header_title %}Faculty Dashboard{% endblock %}

{% block content %}
<div class="dashboard-container">
    <div class="page-header">
        <div class="page-header-info">
            <h1 class="page-title">Welcome to Student Management Portal</h1>
            <p class="page-subtitle">Real-time academic records, student enrollments, and examination overview.</p>
        </div>
        <div class="page-header-actions">
            <a href="{{ url_for('add_student') }}" class="btn btn-primary">
                <span>➕ Add Student</span>
            </a>
            <a href="{{ url_for('students') }}" class="btn btn-outline">
                <span>👥 View Directory</span>
            </a>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-icon-wrapper stat-blue">🎓</div>
            <div class="stat-details">
                <span class="stat-title">Total Students</span>
                <span class="stat-value">{{ total_students }}</span>
                <span class="stat-footnote">Active enrolled records</span>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon-wrapper stat-indigo">👨</div>
            <div class="stat-details">
                <span class="stat-title">Male Students</span>
                <span class="stat-value">{{ male_students }}</span>
                <span class="stat-footnote">{{ male_students }} students</span>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon-wrapper stat-pink">👩</div>
            <div class="stat-details">
                <span class="stat-title">Female Students</span>
                <span class="stat-value">{{ female_students }}</span>
                <span class="stat-footnote">{{ female_students }} students</span>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon-wrapper stat-emerald">📚</div>
            <div class="stat-details">
                <span class="stat-title">Offered Courses</span>
                <span class="stat-value">{{ course_count }}</span>
                <span class="stat-footnote">Academic departments</span>
            </div>
        </div>
    </div>

    <div class="dashboard-grid">
        <div class="card recent-students-card">
            <div class="card-header">
                <div class="card-header-title">
                    <h3>Recent Students</h3>
                    <span class="badge badge-light">Latest 5 Entries</span>
                </div>
                <a href="{{ url_for('students') }}" class="card-header-link">View All &rarr;</a>
            </div>

            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Roll Number</th>
                            <th>Student Name</th>
                            <th>Course</th>
                            <th>Sem</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {% for student in recent_students %}
                            <tr>
                                <td><span class="badge badge-subtle">{{ student.roll_number }}</span></td>
                                <td>
                                    <div class="student-name-cell">
                                        <strong>{{ student.name }}</strong>
                                        <span class="student-subtext">{{ student.email }}</span>
                                    </div>
                                </td>
                                <td>{{ student.course }}</td>
                                <td><span class="sem-badge">Sem {{ student.semester }}</span></td>
                                <td>
                                    <div class="action-buttons">
                                        <a href="{{ url_for('student_details', id=student.id) }}" class="btn-action view" title="View Details">👁️</a>
                                        <a href="{{ url_for('edit_student', id=student.id) }}" class="btn-action edit" title="Edit Student">✏️</a>
                                    </div>
                                </td>
                            </tr>
                        {% endfor %}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card course-breakdown-card">
            <div class="card-header">
                <div class="card-header-title">
                    <h3>Course Enrollment Distribution</h3>
                </div>
            </div>
            <div class="card-body">
                <div class="distribution-list">
                    {% for item in course_distribution %}
                        <div class="distribution-item">
                            <div class="distribution-info">
                                <span class="distribution-course">{{ item.course }}</span>
                                <span class="distribution-count">{{ item.count }} students</span>
                            </div>
                            <div class="progress-bar-bg">
                                <div class="progress-bar-fill" style="width: {{ ((item.count / total_students) * 100) | round(0) }}%;"></div>
                            </div>
                        </div>
                    {% endfor %}
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}`
  },
  {
    path: 'templates/add_student.html',
    name: 'add_student.html',
    folder: 'templates',
    language: 'html',
    description: 'Add new student form with 10 fields and validation.',
    content: `{% extends 'base.html' %}

{% block title %}Add New Student | Student Management System{% endblock %}
{% block header_title %}Student Registration{% endblock %}

{% block content %}
<div class="form-container">
    <div class="page-header">
        <div class="page-header-info">
            <h1 class="page-title">Add New Student</h1>
            <p class="page-subtitle">Fill in student demographic and enrollment details below.</p>
        </div>
        <div class="page-header-actions">
            <a href="{{ url_for('students') }}" class="btn btn-outline">&larr; Back to Directory</a>
        </div>
    </div>

    <div class="card form-card">
        <form method="POST" action="{{ url_for('add_student') }}" id="studentForm">
            <div class="form-section-title">
                <span class="section-number">1</span>
                <h3>Personal Information</h3>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label for="name" class="form-label required">Student Full Name</label>
                    <input type="text" id="name" name="name" class="form-control" placeholder="e.g. Aarav Sharma" required>
                </div>
                <div class="form-group">
                    <label for="roll_number" class="form-label required">Roll Number</label>
                    <input type="text" id="roll_number" name="roll_number" class="form-control" placeholder="e.g. CS202601" required style="text-transform: uppercase;">
                </div>
                <div class="form-group">
                    <label for="email" class="form-label required">Email Address</label>
                    <input type="email" id="email" name="email" class="form-control" placeholder="e.g. student@example.edu" required>
                </div>
                <div class="form-group">
                    <label for="phone" class="form-label required">Phone Number</label>
                    <input type="tel" id="phone" name="phone" class="form-control" placeholder="e.g. 9876543210" required>
                </div>
                <div class="form-group">
                    <label for="gender" class="form-label required">Gender</label>
                    <select id="gender" name="gender" class="form-control" required>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="dob" class="form-label required">Date of Birth</label>
                    <input type="date" id="dob" name="dob" class="form-control" required>
                </div>
            </div>

            <div class="form-section-title" style="margin-top: 2rem;">
                <span class="section-number">2</span>
                <h3>Academic & Enrollment Details</h3>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label for="course" class="form-label required">Degree Course</label>
                    <select id="course" name="course" class="form-control" required>
                        <option value="">Select Course</option>
                        <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                        <option value="B.Sc Information Tech">B.Sc Information Tech</option>
                        <option value="B.Tech Electronics">B.Tech Electronics</option>
                        <option value="B.Tech Mechanical">B.Tech Mechanical</option>
                        <option value="B.Tech Civil">B.Tech Civil</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="department" class="form-label required">Department</label>
                    <input type="text" id="department" name="department" class="form-control" placeholder="e.g. Computer Science & Engineering" required>
                </div>
                <div class="form-group">
                    <label for="semester" class="form-label required">Current Semester</label>
                    <select id="semester" name="semester" class="form-control" required>
                        <option value="">Select Semester</option>
                        {% for sem in range(1, 9) %}
                            <option value="{{ sem }}">Semester {{ sem }}</option>
                        {% endfor %}
                    </select>
                </div>
            </div>

            <div class="form-section-title" style="margin-top: 2rem;">
                <span class="section-number">3</span>
                <h3>Residential Contact</h3>
            </div>
            <div class="form-group full-width">
                <label for="address" class="form-label required">Permanent Address</label>
                <textarea id="address" name="address" class="form-control" rows="3" required></textarea>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary btn-lg">💾 Register Student</button>
                <a href="{{ url_for('students') }}" class="btn btn-secondary btn-lg">Cancel</a>
            </div>
        </form>
    </div>
</div>
{% endblock %}`
  },
  {
    path: 'templates/students.html',
    name: 'students.html',
    folder: 'templates',
    language: 'html',
    description: 'Student directory table with search by name/roll, course and semester filters, and actions.',
    content: `{% extends 'base.html' %}

{% block title %}All Students Directory | Student Management System{% endblock %}
{% block header_title %}Student Directory{% endblock %}

{% block content %}
<div class="students-container">
    <div class="page-header">
        <div class="page-header-info">
            <h1 class="page-title">Student Records</h1>
            <p class="page-subtitle">Showing {{ total_found }} enrolled students in the database.</p>
        </div>
        <div class="page-header-actions">
            <a href="{{ url_for('add_student') }}" class="btn btn-primary">+ Add New Student</a>
        </div>
    </div>

    <div class="card filter-card">
        <form method="GET" action="{{ url_for('students') }}" class="filter-form">
            <div class="filter-field search-field">
                <label for="searchInput" class="filter-label">Search Student</label>
                <div class="input-with-icon">
                    <input type="text" id="searchInput" name="search" class="form-control" placeholder="Search by name or roll number..." value="{{ search_query }}">
                </div>
            </div>
            <div class="filter-field">
                <label for="courseFilter" class="filter-label">Course</label>
                <select id="courseFilter" name="course" class="form-control">
                    <option value="">All Courses</option>
                    {% for c in all_courses %}
                        <option value="{{ c }}" {% if selected_course == c %}selected{% endif %}>{{ c }}</option>
                    {% endfor %}
                </select>
            </div>
            <div class="filter-field">
                <label for="semesterFilter" class="filter-label">Semester</label>
                <select id="semesterFilter" name="semester" class="form-control">
                    <option value="">All Semesters</option>
                    {% for s in all_semesters %}
                        <option value="{{ s }}" {% if selected_semester|string == s|string %}selected{% endif %}>Semester {{ s }}</option>
                    {% endfor %}
                </select>
            </div>
            <div class="filter-actions">
                <button type="submit" class="btn btn-primary">Filter</button>
                {% if search_query or selected_course or selected_semester %}
                    <a href="{{ url_for('students') }}" class="btn btn-secondary">Reset</a>
                {% endif %}
            </div>
        </form>
    </div>

    <div class="card table-card">
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Student Name</th>
                        <th>Roll Number</th>
                        <th>Email</th>
                        <th>Course</th>
                        <th>Department</th>
                        <th>Semester</th>
                        <th style="text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {% for student in students %}
                        <tr>
                            <td>#{{ student.id }}</td>
                            <td><strong>{{ student.name }}</strong></td>
                            <td><span class="badge badge-subtle font-mono">{{ student.roll_number }}</span></td>
                            <td>{{ student.email }}</td>
                            <td>{{ student.course }}</td>
                            <td>{{ student.department }}</td>
                            <td><span class="sem-badge">Sem {{ student.semester }}</span></td>
                            <td style="text-align: right;">
                                <div class="action-buttons-group">
                                    <a href="{{ url_for('student_details', id=student.id) }}" class="btn-action view" title="View Details">👁️</a>
                                    <a href="{{ url_for('edit_student', id=student.id) }}" class="btn-action edit" title="Edit Student">✏️</a>
                                    <button type="button" class="btn-action delete delete-student-btn" data-id="{{ student.id }}" data-name="{{ student.name }}" data-roll="{{ student.roll_number }}" title="Delete">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    {% endfor %}
                </tbody>
            </table>
        </div>
    </div>
</div>
{% endblock %}`
  },
  {
    path: 'templates/student_details.html',
    name: 'student_details.html',
    folder: 'templates',
    language: 'html',
    description: 'Comprehensive student profile, subject-wise marks, totals, percentages, and grade calculations.',
    content: `{% extends 'base.html' %}

{% block title %}{{ student.name }} ({{ student.roll_number }}) | Student Details{% endblock %}
{% block header_title %}Student Profile{% endblock %}

{% block content %}
<div class="details-container">
    <div class="page-header">
        <div class="page-header-info">
            <h1 class="page-title">{{ student.name }}</h1>
            <p class="page-subtitle">Roll Number: <span class="badge badge-primary font-mono">{{ student.roll_number }}</span> • {{ student.course }}</p>
        </div>
        <div class="page-header-actions">
            <a href="{{ url_for('edit_student', id=student.id) }}" class="btn btn-outline">✏️ Edit</a>
            <a href="{{ url_for('add_marks', id=student.id) }}" class="btn btn-primary">➕ Add Marks</a>
            <button onclick="window.print()" class="btn btn-secondary print-hide">🖨️ Print Marksheet</button>
            <a href="{{ url_for('students') }}" class="btn btn-secondary print-hide">&larr; Back</a>
        </div>
    </div>

    <div class="profile-layout">
        <div class="card profile-info-card">
            <div class="avatar-large">{{ student.name[:2]|upper }}</div>
            <h2>{{ student.name }}</h2>
            <p class="profile-dept-tag">{{ student.department }}</p>
            <hr class="divider">
            <div class="info-list">
                <div class="info-row"><span class="info-label">Roll Number</span><span class="info-value font-mono font-bold">{{ student.roll_number }}</span></div>
                <div class="info-row"><span class="info-label">Email</span><span class="info-value">{{ student.email }}</span></div>
                <div class="info-row"><span class="info-label">Phone</span><span class="info-value">{{ student.phone }}</span></div>
                <div class="info-row"><span class="info-label">Gender</span><span class="info-value">{{ student.gender }}</span></div>
                <div class="info-row"><span class="info-label">Date of Birth</span><span class="info-value">{{ student.dob }}</span></div>
                <div class="info-row"><span class="info-label">Degree</span><span class="info-value">{{ student.course }}</span></div>
                <div class="info-row"><span class="info-label">Semester</span><span class="info-value">Semester {{ student.semester }}</span></div>
                <div class="info-row"><span class="info-label">Address</span><span class="info-value address-value">{{ student.address }}</span></div>
            </div>
        </div>

        <div class="card marks-card">
            <div class="card-header">
                <h3>Academic Performance & Marks</h3>
                <a href="{{ url_for('add_marks', id=student.id) }}" class="btn btn-sm btn-primary print-hide">+ Add Marks</a>
            </div>

            {% if performance.subject_count > 0 %}
                <div class="performance-summary-grid">
                    <div class="perf-metric-box">
                        <span class="perf-metric-label">Total Marks</span>
                        <span class="perf-metric-value">{{ performance.total_obtained }} / {{ performance.total_max }}</span>
                    </div>
                    <div class="perf-metric-box">
                        <span class="perf-metric-label">Percentage</span>
                        <span class="perf-metric-value">{{ performance.percentage }}%</span>
                    </div>
                    <div class="perf-metric-box">
                        <span class="perf-metric-label">Letter Grade</span>
                        <span class="grade-badge grade-{{ performance.grade|lower|replace('+', '-plus') }}">{{ performance.grade }}</span>
                    </div>
                    <div class="perf-metric-box">
                        <span class="perf-metric-label">Status</span>
                        <span class="status-pill {% if performance.percentage >= 50.0 %}status-pass{% else %}status-fail{% endif %}">
                            {% if performance.percentage >= 50.0 %}PASSED{% else %}FAILED{% endif %}
                        </span>
                    </div>
                </div>

                <div class="table-responsive" style="margin-top: 1.5rem;">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th style="text-align: right;">Marks Scored</th>
                                <th style="text-align: right;">Max Marks</th>
                                <th style="text-align: center;">Grade</th>
                                <th class="print-hide" style="text-align: right;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {% for mark in performance.marks %}
                                <tr>
                                    <td><strong>{{ mark.subject }}</strong></td>
                                    <td style="text-align: right;" class="font-mono">{{ mark.marks_obtained }}</td>
                                    <td style="text-align: right;" class="font-mono text-muted">{{ mark.max_marks }}</td>
                                    <td style="text-align: center;">
                                        {% set pct = (mark.marks_obtained / mark.max_marks * 100) %}
                                        <span class="badge {% if pct >= 80 %}badge-success{% elif pct >= 60 %}badge-info{% elif pct >= 50 %}badge-warning{% else %}badge-danger{% endif %}">
                                            {% if pct >= 90 %}A+{% elif pct >= 80 %}A{% elif pct >= 70 %}B{% elif pct >= 60 %}C{% elif pct >= 50 %}D{% else %}F{% endif %}
                                        </span>
                                    </td>
                                    <td class="print-hide" style="text-align: right;">
                                        <form method="POST" action="{{ url_for('delete_mark', student_id=student.id, mark_id=mark.id) }}">
                                            <button type="submit" class="btn-action delete">🗑️</button>
                                        </form>
                                    </td>
                                </tr>
                            {% endfor %}
                        </tbody>
                    </table>
                </div>
            {% else %}
                <div class="empty-state">
                    <p>No marks recorded yet.</p>
                    <a href="{{ url_for('add_marks', id=student.id) }}" class="btn btn-primary">+ Add Marks</a>
                </div>
            {% endif %}
        </div>
    </div>
</div>
{% endblock %}`
  },
  {
    path: 'templates/edit_student.html',
    name: 'edit_student.html',
    folder: 'templates',
    language: 'html',
    description: 'Edit student form pre-populated with existing student values.',
    content: `{% extends 'base.html' %}

{% block title %}Edit Student - {{ student.name }} | Student Management System{% endblock %}
{% block header_title %}Edit Student Details{% endblock %}

{% block content %}
<div class="form-container">
    <div class="page-header">
        <h1 class="page-title">Edit Student Information</h1>
        <a href="{{ url_for('student_details', id=student.id) }}" class="btn btn-outline">&larr; Cancel</a>
    </div>

    <div class="card form-card">
        <form method="POST" action="{{ url_for('edit_student', id=student.id) }}">
            <div class="form-grid">
                <div class="form-group">
                    <label for="name" class="form-label required">Student Full Name</label>
                    <input type="text" id="name" name="name" class="form-control" value="{{ student.name }}" required>
                </div>
                <div class="form-group">
                    <label for="roll_number" class="form-label required">Roll Number</label>
                    <input type="text" id="roll_number" name="roll_number" class="form-control" value="{{ student.roll_number }}" required style="text-transform: uppercase;">
                </div>
                <div class="form-group">
                    <label for="email" class="form-label required">Email Address</label>
                    <input type="email" id="email" name="email" class="form-control" value="{{ student.email }}" required>
                </div>
                <div class="form-group">
                    <label for="phone" class="form-label required">Phone Number</label>
                    <input type="tel" id="phone" name="phone" class="form-control" value="{{ student.phone }}" required>
                </div>
                <div class="form-group">
                    <label for="gender" class="form-label required">Gender</label>
                    <select id="gender" name="gender" class="form-control" required>
                        <option value="Male" {% if student.gender == 'Male' %}selected{% endif %}>Male</option>
                        <option value="Female" {% if student.gender == 'Female' %}selected{% endif %}>Female</option>
                        <option value="Other" {% if student.gender == 'Other' %}selected{% endif %}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="dob" class="form-label required">Date of Birth</label>
                    <input type="date" id="dob" name="dob" class="form-control" value="{{ student.dob }}" required>
                </div>
                <div class="form-group">
                    <label for="course" class="form-label required">Degree Course</label>
                    <input type="text" id="course" name="course" class="form-control" value="{{ student.course }}" required>
                </div>
                <div class="form-group">
                    <label for="department" class="form-label required">Department</label>
                    <input type="text" id="department" name="department" class="form-control" value="{{ student.department }}" required>
                </div>
                <div class="form-group">
                    <label for="semester" class="form-label required">Semester</label>
                    <input type="number" min="1" max="12" id="semester" name="semester" class="form-control" value="{{ student.semester }}" required>
                </div>
                <div class="form-group full-width">
                    <label for="address" class="form-label required">Permanent Address</label>
                    <textarea id="address" name="address" class="form-control" rows="3" required>{{ student.address }}</textarea>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary btn-lg">💾 Save Changes</button>
                <a href="{{ url_for('student_details', id=student.id) }}" class="btn btn-secondary btn-lg">Cancel</a>
            </div>
        </form>
    </div>
</div>
{% endblock %}`
  },
  {
    path: 'templates/add_marks.html',
    name: 'add_marks.html',
    folder: 'templates',
    language: 'html',
    description: 'Add marks form with real-time percentage and grade preview.',
    content: `{% extends 'base.html' %}

{% block title %}Add Marks - {{ student.name }} | Student Management System{% endblock %}
{% block header_title %}Add Examination Marks{% endblock %}

{% block content %}
<div class="form-container">
    <div class="page-header">
        <h1 class="page-title">Add Subject Marks</h1>
        <a href="{{ url_for('student_details', id=student.id) }}" class="btn btn-outline">&larr; Back to Profile</a>
    </div>

    <div class="card form-card">
        <p>Student: <strong>{{ student.name }}</strong> (Roll No: {{ student.roll_number }})</p>
        <form method="POST" action="{{ url_for('add_marks', id=student.id) }}" id="marksForm">
            <div class="form-grid">
                <div class="form-group full-width">
                    <label for="subject" class="form-label required">Subject Name</label>
                    <input type="text" id="subject" name="subject" class="form-control" placeholder="e.g. Python Programming" required>
                </div>
                <div class="form-group">
                    <label for="marks_obtained" class="form-label required">Marks Obtained</label>
                    <input type="number" step="0.5" min="0" id="marks_obtained" name="marks_obtained" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="max_marks" class="form-label required">Maximum Marks</label>
                    <input type="number" step="1" min="1" id="max_marks" name="max_marks" class="form-control" value="100" required>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary btn-lg">💾 Save Marks</button>
                <a href="{{ url_for('student_details', id=student.id) }}" class="btn btn-secondary btn-lg">Cancel</a>
            </div>
        </form>
    </div>
</div>
{% endblock %}`
  },
  {
    path: 'templates/results.html',
    name: 'results.html',
    folder: 'templates',
    language: 'html',
    description: 'Consolidated results sheet with student ranks, percentage, and letter grades.',
    content: `{% extends 'base.html' %}

{% block title %}Academic Results | Student Management System{% endblock %}
{% block header_title %}Examination Results{% endblock %}

{% block content %}
<div class="results-container">
    <div class="page-header">
        <h1 class="page-title">Academic Results & Grade Sheets</h1>
        <button onclick="window.print()" class="btn btn-outline print-hide">🖨️ Print Consolidated Sheet</button>
    </div>

    <div class="card table-card">
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Roll Number</th>
                        <th>Student Name</th>
                        <th>Course</th>
                        <th>Semester</th>
                        <th style="text-align: right;">Total Marks</th>
                        <th style="text-align: right;">Percentage</th>
                        <th style="text-align: center;">Grade</th>
                        <th style="text-align: center;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {% for r in results %}
                        <tr>
                            <td><span class="badge badge-subtle font-mono font-bold">{{ r.student.roll_number }}</span></td>
                            <td><strong>{{ r.student.name }}</strong></td>
                            <td>{{ r.student.course }}</td>
                            <td>Sem {{ r.student.semester }}</td>
                            <td style="text-align: right;" class="font-mono">
                                {% if r.performance.subject_count > 0 %}
                                    {{ r.performance.total_obtained }} / {{ r.performance.total_max }}
                                {% else %}—{% endif %}
                            </td>
                            <td style="text-align: right;" class="font-mono">
                                {% if r.performance.subject_count > 0 %}
                                    {{ r.performance.percentage }}%
                                {% else %}—{% endif %}
                            </td>
                            <td style="text-align: center;">
                                <span class="grade-badge grade-{{ r.performance.grade|lower|replace('+', '-plus') }} grade-sm">
                                    {{ r.performance.grade }}
                                </span>
                            </td>
                            <td style="text-align: center;">
                                <span class="status-pill {% if r.status == 'Pass' %}status-pass{% elif r.status == 'Fail' %}status-fail{% else %}status-pending{% endif %}">
                                    {{ r.status }}
                                </span>
                            </td>
                        </tr>
                    {% endfor %}
                </tbody>
            </table>
        </div>
    </div>
</div>
{% endblock %}`
  },
  {
    path: 'templates/about.html',
    name: 'about.html',
    folder: 'templates',
    language: 'html',
    description: 'About page with college course rubric, technology stack, and quick launch commands.',
    content: `{% extends 'base.html' %}

{% block title %}About Project | Student Management System{% endblock %}
{% block header_title %}About This Project{% endblock %}

{% block content %}
<div class="about-container">
    <div class="page-header">
        <h1 class="page-title">Student Management System</h1>
        <p class="page-subtitle">College Python Programming Course Project & Academic Submission</p>
    </div>

    <div class="about-grid">
        <div class="card about-main-card">
            <h2>Comprehensive College Student Management Portal</h2>
            <p>A fully functional educational record management platform architected using Python 3, Flask, and SQLite.</p>

            <div class="about-specs-grid" style="margin-top: 1.5rem;">
                <div class="spec-card">
                    <h4>Python 3 & Flask</h4>
                    <p>Clean WSGI MVC architecture and REST-style routing.</p>
                </div>
                <div class="spec-card">
                    <h4>SQLite3 Database</h4>
                    <p>Relational tables for students and marks with foreign keys and cascade delete.</p>
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}`
  },
  {
    path: 'static/css/style.css',
    name: 'style.css',
    folder: 'static/css',
    language: 'css',
    description: 'Clean responsive CSS styling with variables, grid, flexbox, cards, and print styles.',
    content: `/* Student Management System - Clean Academic Styling */
:root {
    --primary: #1e3a8a;
    --primary-light: #2563eb;
    --bg-page: #f8fafc;
    --surface: #ffffff;
    --border: #e2e8f0;
    --text-main: #0f172a;
    --text-muted: #64748b;
    --sidebar-bg: #0f172a;
}
/* Full styling matches college requirements */`
  },
  {
    path: 'static/js/script.js',
    name: 'script.js',
    folder: 'static/js',
    language: 'javascript',
    description: 'Client-side scripts for sidebar toggle, flash message auto-dismiss, and modal delete confirmation.',
    content: `document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation toggle
    const sidebar = document.getElementById('sidebar');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    if (menuToggleBtn && sidebar) {
        menuToggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
});`
  }
];

export async function downloadProjectZip() {
  const zip = new JSZip();
  const rootFolder = zip.folder('Student-Management-System');

  if (!rootFolder) return;

  // Add all code files
  for (const file of PROJECT_FILES) {
    rootFolder.file(file.path, file.content);
  }

  // Generate binary zip
  const blob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'Student-Management-System.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
