"""
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
                "Mechanical Engineering", 6, "15 Industrial Colony, East"
            )
        ]

        cursor.executemany('''
            INSERT INTO students (
                name, roll_number, email, phone, gender, dob,
                course, department, semester, address
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', sample_students)

        # Retrieve inserted IDs
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

    # Populate course and semester options for filter dropdowns
    cursor.execute("SELECT DISTINCT course FROM students ORDER BY course ASC")
    all_courses = [row['course'] for row in cursor.fetchall()]

    cursor.execute("SELECT DISTINCT semester FROM students ORDER BY semester ASC")
    all_semesters = [row['semester'] for row in cursor.fetchall()]

    # Build parameterized query dynamically
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

        # Validation: Check required fields
        if not (name and roll_number and email and phone and gender and dob and course and department and semester_raw and address):
            flash('All fields are required. Please fill out the entire form.', 'danger')
            return render_template('add_student.html', form=request.form)

        # Validate semester is integer
        try:
            semester = int(semester_raw)
            if semester < 1 or semester > 12:
                flash('Semester must be a number between 1 and 12.', 'danger')
                return render_template('add_student.html', form=request.form)
        except ValueError:
            flash('Semester must be a valid integer.', 'danger')
            return render_template('add_student.html', form=request.form)

        # Validate email format
        if '@' not in email or '.' not in email:
            flash('Please enter a valid email address.', 'danger')
            return render_template('add_student.html', form=request.form)

        # Database insertion with duplicate check
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

        except sqlite3.Error as e:
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

        # Check roll number collision with another student
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

    # Compile result cards
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


# ==========================================
# Error Handlers
# ==========================================

@app.errorhandler(404)
def not_found(e):
    return render_template('base.html', not_found=True), 404


@app.errorhandler(500)
def server_error(e):
    return "<h3>An unexpected error occurred. Please return to the <a href='/'>Dashboard</a>.</h3>", 500


# ==========================================
# Application Bootstrap
# ==========================================

if __name__ == '__main__':
    # Initialize SQLite database and tables automatically on first run
    init_db()
    # Seed sample records so the application starts with demonstration data
    seed_sample_data()

    print("\n" + "=" * 50)
    print(" Student Management System - Flask Application")
    print("=" * 50)
    print(f" Database: {DATABASE}")
    print(" Running at: http://127.0.0.1:5000")
    print(" Press CTRL+C to stop the server.")
    print("=" * 50 + "\n")

    app.run(debug=True, host='0.0.0.0', port=5000)
