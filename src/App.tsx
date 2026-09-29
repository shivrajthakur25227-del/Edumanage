/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { 
  Users, UserPlus, BookOpen, Award, Info, Search, Trash2, Edit3, 
  Eye, Download, Copy, Check, Terminal, ExternalLink, Printer, 
  RotateCcw, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2,
  ChevronRight, ArrowLeft, PlusCircle, GraduationCap, School,
  Calendar, Phone, Mail, MapPin, Hash, BarChart3, Layers, X, RefreshCw
} from 'lucide-react';
import { PROJECT_FILES, ProjectFile, downloadProjectZip } from './projectFiles';

// ==========================================
// Safe Storage Helper (Handles Sandbox iFrame)
// ==========================================
const memoryStorage = new Map<string, string>();

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Fallback to memory
    }
    return memoryStorage.get(key) || null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Fallback to memory
    }
    memoryStorage.set(key, value);
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Fallback
    }
    memoryStorage.delete(key);
  }
};

// ==========================================
// Data Models & Initial Seed
// ==========================================
export interface StudentRecord {
  id: number;
  name: string;
  roll_number: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  course: string;
  department: string;
  semester: number;
  address: string;
  created_at: string;
}

export interface MarkRecord {
  id: number;
  student_id: number;
  subject: string;
  marks_obtained: number;
  max_marks: number;
}

const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 1,
    name: 'Aarav Sharma',
    roll_number: 'CS202601',
    email: 'aarav.sharma@example.edu',
    phone: '9876543210',
    gender: 'Male',
    dob: '2004-05-14',
    course: 'B.Tech Computer Science',
    department: 'Computer Science & Engineering',
    semester: 4,
    address: '124 Park Avenue, City Center',
    created_at: '2026-02-10 10:30:00'
  },
  {
    id: 2,
    name: 'Diya Patel',
    roll_number: 'CS202602',
    email: 'diya.patel@example.edu',
    phone: '9812345678',
    gender: 'Female',
    dob: '2004-09-22',
    course: 'B.Tech Computer Science',
    department: 'Computer Science & Engineering',
    semester: 4,
    address: '45 River View Lane, Westside',
    created_at: '2026-02-11 11:15:00'
  },
  {
    id: 3,
    name: 'Rohan Verma',
    roll_number: 'IT202615',
    email: 'rohan.verma@example.edu',
    phone: '9723456789',
    gender: 'Male',
    dob: '2003-11-03',
    course: 'B.Sc Information Tech',
    department: 'Information Technology',
    semester: 6,
    address: '88 Heritage Heights, Sector 12',
    created_at: '2026-02-12 09:45:00'
  },
  {
    id: 4,
    name: 'Ananya Iyer',
    roll_number: 'EC202608',
    email: 'ananya.iyer@example.edu',
    phone: '9634567890',
    gender: 'Female',
    dob: '2005-02-18',
    course: 'B.Tech Electronics',
    department: 'Electronics & Communication',
    semester: 2,
    address: '302 Greenfield Residency',
    created_at: '2026-02-14 14:20:00'
  },
  {
    id: 5,
    name: 'Kabir Singh',
    roll_number: 'ME202633',
    email: 'kabir.singh@example.edu',
    phone: '9545678901',
    gender: 'Male',
    dob: '2003-08-30',
    course: 'B.Tech Mechanical',
    department: 'Mechanical Engineering',
    semester: 6,
    address: '15 Industrial Colony, East',
    created_at: '2026-02-15 16:00:00'
  }
];

const INITIAL_MARKS: MarkRecord[] = [
  // Aarav Sharma
  { id: 1, student_id: 1, subject: 'Python Programming', marks_obtained: 92, max_marks: 100 },
  { id: 2, student_id: 1, subject: 'Data Structures & Algorithms', marks_obtained: 88.5, max_marks: 100 },
  { id: 3, student_id: 1, subject: 'Database Management Systems', marks_obtained: 94, max_marks: 100 },
  { id: 4, student_id: 1, subject: 'Computer Networks', marks_obtained: 85, max_marks: 100 },

  // Diya Patel
  { id: 5, student_id: 2, subject: 'Python Programming', marks_obtained: 96, max_marks: 100 },
  { id: 6, student_id: 2, subject: 'Data Structures & Algorithms', marks_obtained: 91, max_marks: 100 },
  { id: 7, student_id: 2, subject: 'Database Management Systems', marks_obtained: 89, max_marks: 100 },
  { id: 8, student_id: 2, subject: 'Web Technologies', marks_obtained: 95, max_marks: 100 },

  // Rohan Verma
  { id: 9, student_id: 3, subject: 'Software Engineering', marks_obtained: 74, max_marks: 100 },
  { id: 10, student_id: 3, subject: 'Cloud Computing', marks_obtained: 68, max_marks: 100 },
  { id: 11, student_id: 3, subject: 'Network Security', marks_obtained: 78, max_marks: 100 },

  // Ananya Iyer
  { id: 12, student_id: 4, subject: 'Signals and Systems', marks_obtained: 82, max_marks: 100 },
  { id: 13, student_id: 4, subject: 'Digital Electronics', marks_obtained: 86, max_marks: 100 },
  { id: 14, student_id: 4, subject: 'Engineering Mathematics', marks_obtained: 79, max_marks: 100 },

  // Kabir Singh
  { id: 15, student_id: 5, subject: 'Thermodynamics', marks_obtained: 62, max_marks: 100 },
  { id: 16, student_id: 5, subject: 'Fluid Mechanics', marks_obtained: 58, max_marks: 100 },
  { id: 17, student_id: 5, subject: 'Machine Design', marks_obtained: 65, max_marks: 100 }
];

// Grade Calculator
export function calculateGrade(percentage: number): { grade: string; color: string; bg: string } {
  if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200' };
  if (percentage >= 80) return { grade: 'A', color: 'text-green-700', bg: 'bg-green-100 border-green-200' };
  if (percentage >= 70) return { grade: 'B', color: 'text-sky-700', bg: 'bg-sky-100 border-sky-200' };
  if (percentage >= 60) return { grade: 'C', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200' };
  if (percentage >= 50) return { grade: 'D', color: 'text-orange-700', bg: 'bg-orange-100 border-orange-200' };
  return { grade: 'F', color: 'text-red-700', bg: 'bg-red-100 border-red-200' };
}

// Error Boundary to prevent blank screen
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App Error Caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto text-center mt-12 bg-white rounded-xl shadow-lg border border-red-200">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-600 mb-4">{this.state.error?.message || 'Failed to render component'}</p>
          <button
            onClick={() => {
              memoryStorage.clear();
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <StudentManagementSystemApp />
    </ErrorBoundary>
  );
}

function StudentManagementSystemApp() {
  // Top-level Navigation Mode:
  // 'frontend': Live college portal interface
  // 'code': Interactive Source Code & File Inspector (.ZIP)
  // 'guide': CLI & Setup Instructions
  const [activeTab, setActiveTab] = useState<'frontend' | 'code' | 'guide'>('frontend');

  // Active page inside the Frontend college portal:
  // 'dashboard' | 'add_student' | 'students' | 'student_details' | 'results' | 'about'
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'add_student' | 'students' | 'student_details' | 'results' | 'about'>('dashboard');

  // Selected student ID for details
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(1);

  // Mobile sidebar open state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Student database state
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    try {
      const saved = safeStorage.getItem('sms_students_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_STUDENTS;
  });

  // Marks database state
  const [marks, setMarks] = useState<MarkRecord[]>(() => {
    try {
      const saved = safeStorage.getItem('sms_marks_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_MARKS;
  });

  // Save changes to safe storage
  useEffect(() => {
    try {
      safeStorage.setItem('sms_students_data', JSON.stringify(students));
    } catch {}
  }, [students]);

  useEffect(() => {
    try {
      safeStorage.setItem('sms_marks_data', JSON.stringify(marks));
    } catch {}
  }, [marks]);

  // Flash alert banner
  const [flashMessage, setFlashMessage] = useState<{ text: string; type: 'success' | 'danger' | 'info' } | null>(null);

  const showFlash = (text: string, type: 'success' | 'danger' | 'info' = 'success') => {
    setFlashMessage({ text, type });
    setTimeout(() => {
      setFlashMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  };

  // Search & Filter state for students directory
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Modals state
  const [studentToDelete, setStudentToDelete] = useState<StudentRecord | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<StudentRecord | null>(null);
  const [isAddingMarks, setIsAddingMarks] = useState(false);
  const [markToDelete, setMarkToDelete] = useState<{ id: number; subject: string } | null>(null);

  // Add Student Form State
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    email: '',
    phone: '',
    gender: 'Male' as const,
    dob: '',
    course: 'B.Tech Computer Science',
    department: 'Computer Science & Engineering',
    semester: 1,
    address: ''
  });

  // Add Marks Form State
  const [markSubject, setMarkSubject] = useState('');
  const [markObtained, setMarkObtained] = useState('');
  const [markMax, setMarkMax] = useState('100');

  // Code Explorer Active File
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PROJECT_FILES[0]);
  const [copiedCode, setCopiedCode] = useState(false);

  // Current active student
  const activeStudent = useMemo(() => {
    if (!selectedStudentId) return students[0] || null;
    return students.find((s) => s.id === selectedStudentId) || students[0] || null;
  }, [students, selectedStudentId]);

  // Marks for active student
  const activeStudentMarks = useMemo(() => {
    if (!activeStudent) return [];
    return marks.filter((m) => m.student_id === activeStudent.id);
  }, [marks, activeStudent]);

  // Performance calculations for active student
  const activeStudentPerformance = useMemo(() => {
    const totalObtained = activeStudentMarks.reduce((sum, m) => sum + (Number(m.marks_obtained) || 0), 0);
    const totalMax = activeStudentMarks.reduce((sum, m) => sum + (Number(m.max_marks) || 0), 0);
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    const gradeData = totalMax > 0 ? calculateGrade(percentage) : { grade: 'N/A', color: 'text-slate-400', bg: 'bg-slate-100 border-slate-200' };

    return {
      count: activeStudentMarks.length,
      totalObtained: Math.round(totalObtained * 10) / 10,
      totalMax,
      percentage: Math.round(percentage * 10) / 10,
      gradeData
    };
  }, [activeStudentMarks]);

  // Overall statistics for Dashboard
  const stats = useMemo(() => {
    const total = students.length;
    const male = students.filter((s) => (s.gender || '').toLowerCase() === 'male').length;
    const female = students.filter((s) => (s.gender || '').toLowerCase() === 'female').length;
    const courses = Array.from(new Set(students.map((s) => s.course || ''))).filter(Boolean);
    const semesters = Array.from(new Set(students.map((s) => s.semester || 1))).sort((a, b) => a - b);

    // Distribution
    const distribution = courses.map((c) => ({
      course: c,
      count: students.filter((s) => s.course === c).length
    })).sort((a, b) => b.count - a.count);

    return { total, male, female, courseCount: courses.length, courses, semesters, distribution };
  }, [students]);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (s.name || '').toLowerCase().includes(q) || (s.roll_number || '').toLowerCase().includes(q);
      const matchCourse = !selectedCourse || s.course === selectedCourse;
      const matchSem = !selectedSemester || s.semester?.toString() === selectedSemester;
      return matchSearch && matchCourse && matchSem;
    });
  }, [students, searchQuery, selectedCourse, selectedSemester]);

  // Add Student Handler
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.roll_number.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.dob || !formData.address.trim()) {
      showFlash('All fields are mandatory. Please complete the entire registration form.', 'danger');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      showFlash('Please enter a valid email address.', 'danger');
      return;
    }

    const rollUpper = formData.roll_number.trim().toUpperCase();
    if (students.some((s) => (s.roll_number || '').toUpperCase() === rollUpper)) {
      showFlash(`Roll Number "${rollUpper}" is already registered. Roll numbers must be unique.`, 'danger');
      return;
    }

    const newId = students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1;
    const newStudent: StudentRecord = {
      id: newId,
      name: formData.name.trim(),
      roll_number: rollUpper,
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      gender: formData.gender,
      dob: formData.dob,
      course: formData.course,
      department: formData.department,
      semester: Number(formData.semester),
      address: formData.address.trim(),
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setStudents([newStudent, ...students]);
    showFlash(`Student "${newStudent.name}" enrolled successfully with Roll No ${newStudent.roll_number}!`, 'success');

    // Reset Form
    setFormData({
      name: '',
      roll_number: '',
      email: '',
      phone: '',
      gender: 'Male',
      dob: '',
      course: 'B.Tech Computer Science',
      department: 'Computer Science & Engineering',
      semester: 1,
      address: ''
    });

    setSelectedStudentId(newId);
    setCurrentPage('student_details');
  };

  // Edit Student Handler
  const handleEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToEdit) return;

    if (!studentToEdit.name.trim() || !studentToEdit.roll_number.trim() || !studentToEdit.email.trim() || !studentToEdit.phone.trim() || !studentToEdit.address.trim()) {
      showFlash('All fields are required.', 'danger');
      return;
    }

    const rollUpper = studentToEdit.roll_number.trim().toUpperCase();
    const collision = students.some((s) => s.id !== studentToEdit.id && (s.roll_number || '').toUpperCase() === rollUpper);
    if (collision) {
      showFlash(`Roll Number "${rollUpper}" is already used by another student.`, 'danger');
      return;
    }

    setStudents(students.map((s) => (s.id === studentToEdit.id ? { ...studentToEdit, roll_number: rollUpper } : s)));
    showFlash(`Student "${studentToEdit.name}" updated successfully.`, 'success');
    setStudentToEdit(null);
  };

  // Confirm Delete Student
  const handleConfirmDeleteStudent = () => {
    if (!studentToDelete) return;
    const { id, name } = studentToDelete;

    setStudents(students.filter((s) => s.id !== id));
    setMarks(marks.filter((m) => m.student_id !== id));
    setStudentToDelete(null);
    showFlash(`Student "${name}" and all examination records have been removed.`, 'info');

    if (currentPage === 'student_details' && selectedStudentId === id) {
      setCurrentPage('students');
      setSelectedStudentId(null);
    }
  };

  // Add Subject Mark Handler
  const handleAddMark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;

    const subject = markSubject.trim();
    const obtained = parseFloat(markObtained);
    const max = parseFloat(markMax);

    if (!subject) {
      showFlash('Subject name is required.', 'danger');
      return;
    }

    if (isNaN(obtained) || isNaN(max)) {
      showFlash('Please enter valid numeric values for marks.', 'danger');
      return;
    }

    if (obtained < 0 || max <= 0) {
      showFlash('Marks obtained cannot be negative, and Maximum Marks must be greater than zero.', 'danger');
      return;
    }

    if (obtained > max) {
      showFlash(`Marks obtained (${obtained}) cannot exceed Maximum Marks (${max})!`, 'danger');
      return;
    }

    const newMarkId = marks.length > 0 ? Math.max(...marks.map((m) => m.id)) + 1 : 1;
    const newMark: MarkRecord = {
      id: newMarkId,
      student_id: activeStudent.id,
      subject,
      marks_obtained: obtained,
      max_marks: max
    };

    setMarks([...marks, newMark]);
    showFlash(`Marks for "${subject}" added successfully!`, 'success');
    setMarkSubject('');
    setMarkObtained('');
    setMarkMax('100');
    setIsAddingMarks(false);
  };

  // Confirm Delete Mark
  const handleConfirmDeleteMark = () => {
    if (!markToDelete) return;
    setMarks(marks.filter((m) => m.id !== markToDelete.id));
    showFlash(`Marks for "${markToDelete.subject}" removed.`, 'info');
    setMarkToDelete(null);
  };

  // Reset to initial sample data
  const handleResetData = () => {
    setStudents(INITIAL_STUDENTS);
    setMarks(INITIAL_MARKS);
    safeStorage.removeItem('sms_students_data');
    safeStorage.removeItem('sms_marks_data');
    showFlash('Database restored to 5 sample students and 17 examination scores.', 'success');
  };

  // Copy code helper
  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Banner Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & College Portal Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className="w-full h-0.5 bg-current rounded-full"></span>
                <span className="w-full h-0.5 bg-current rounded-full"></span>
                <span className="w-full h-0.5 bg-current rounded-full"></span>
              </div>
            </button>

            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">EduManage</span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Flask & SQLite
                </span>
              </div>
              <span className="text-xs text-slate-400 block -mt-0.5">Student Management Portal</span>
            </div>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="bg-slate-800 p-1 rounded-lg border border-slate-700/80 flex items-center">
              <button
                onClick={() => setActiveTab('frontend')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'frontend'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Live Portal</span>
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'code'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Project Files</span>
                <span className="sm:hidden">Files</span>
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'guide'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span className="hidden sm:inline">CLI Guide</span>
                <span className="sm:hidden">Guide</span>
              </button>
            </div>

            <button
              onClick={downloadProjectZip}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition"
              title="Download Student-Management-System.zip"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Flash Alert Banner */}
      {flashMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`p-4 rounded-xl shadow-xl border flex items-start gap-3 ${
              flashMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : flashMessage.type === 'danger'
                ? 'bg-red-50 border-red-300 text-red-950'
                : 'bg-sky-50 border-sky-300 text-sky-950'
            }`}
          >
            {flashMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {flashMessage.type === 'danger' && <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
            {flashMessage.type === 'info' && <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />}
            <div className="flex-1 text-xs sm:text-sm font-semibold">{flashMessage.text}</div>
            <button
              onClick={() => setFlashMessage(null)}
              className="text-slate-400 hover:text-slate-700 text-lg leading-none"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: LIVE COLLEGE FRONTEND PORTAL                                      */}
      {/* ========================================================================= */}
      {activeTab === 'frontend' && (
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Sidebar Navigation */}
          <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto md:w-64 flex flex-col border-r border-slate-800 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Navigation</span>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="md:hidden text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-3 space-y-1 flex-1">
              <button
                onClick={() => {
                  setCurrentPage('dashboard');
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setCurrentPage('add_student');
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                  currentPage === 'add_student'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span>Add Student</span>
              </button>

              <button
                onClick={() => {
                  setCurrentPage('students');
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                  currentPage === 'students'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>All Students</span>
                <span className="ml-auto text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                  {students.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setCurrentPage('results');
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                  currentPage === 'results'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>Results & Grades</span>
              </button>

              <button
                onClick={() => {
                  setCurrentPage('about');
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                  currentPage === 'about'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Info className="w-4 h-4 shrink-0" />
                <span>About System</span>
              </button>
            </nav>

            {/* Sidebar Bottom Status */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-slate-200">SQLite3 Connected</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">{students.length} Students • {marks.length} Exam Marks</p>
              <button
                onClick={handleResetData}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 py-1.5 rounded transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Sample Data</span>
              </button>
            </div>
          </aside>

          {/* Main Working View */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto overflow-y-auto">
            {/* 1. DASHBOARD VIEW */}
            {currentPage === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Faculty Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Real-time student academic metrics, gender distribution, and recent registrations.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage('add_student')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add Student</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage('students')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold transition"
                    >
                      <Users className="w-4 h-4" />
                      <span>View Students</span>
                    </button>
                  </div>
                </div>

                {/* Dashboard Metric Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold shrink-0">
                      🎓
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Students</span>
                      <div className="text-2xl font-black text-slate-900 leading-tight">{stats.total}</div>
                      <span className="text-xs text-slate-400">Enrolled records</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold shrink-0">
                      👨
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Male Students</span>
                      <div className="text-2xl font-black text-slate-900 leading-tight">{stats.male}</div>
                      <span className="text-xs text-slate-400">
                        {stats.total > 0 ? Math.round((stats.male / stats.total) * 100) : 0}% of class
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center text-xl font-bold shrink-0">
                      👩
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Female Students</span>
                      <div className="text-2xl font-black text-slate-900 leading-tight">{stats.female}</div>
                      <span className="text-xs text-slate-400">
                        {stats.total > 0 ? Math.round((stats.female / stats.total) * 100) : 0}% of class
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold shrink-0">
                      📚
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Academic Courses</span>
                      <div className="text-2xl font-black text-slate-900 leading-tight">{stats.courseCount}</div>
                      <span className="text-xs text-slate-400">Degree programs</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Two-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Students Table Card */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h2 className="font-bold text-slate-900">Recent Students</h2>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">Latest 5 Entries</span>
                        </div>
                        <button
                          onClick={() => setCurrentPage('students')}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <span>View Directory</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                            <tr>
                              <th className="px-4 py-3">Roll No</th>
                              <th className="px-4 py-3">Student Name</th>
                              <th className="px-4 py-3">Course</th>
                              <th className="px-4 py-3">Sem</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {students.slice(0, 5).map((student) => (
                              <tr key={student.id} className="hover:bg-slate-50 transition">
                                <td className="px-4 py-3 font-mono font-semibold text-slate-700">{student.roll_number}</td>
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-slate-900">{student.name}</div>
                                  <div className="text-xs text-slate-400">{student.email}</div>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-600">{student.course}</td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                                    Sem {student.semester}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        setSelectedStudentId(student.id);
                                        setCurrentPage('student_details');
                                      }}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setStudentToEdit({ ...student })}
                                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                                      title="Edit Student"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Total Registered: <strong>{students.length} students</strong></span>
                      <button
                        onClick={() => setCurrentPage('add_student')}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        + Enroll New Student
                      </button>
                    </div>
                  </div>

                  {/* Course Distribution Card */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
                    <div>
                      <h2 className="font-bold text-slate-900 mb-1">Course Distribution</h2>
                      <p className="text-xs text-slate-500 mb-4">Enrollment distribution by degree program</p>

                      <div className="space-y-4">
                        {stats.distribution.map((item) => {
                          const percentage = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;
                          return (
                            <div key={item.course}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-semibold text-slate-800 truncate max-w-[180px]">{item.course}</span>
                                <span className="text-slate-500 font-mono">{item.count} student(s)</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-4 rounded-b-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-800">Academic Grading</div>
                          <div className="text-[11px] text-slate-500">Automatic grades calculation</div>
                        </div>
                        <button
                          onClick={() => setCurrentPage('results')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm transition"
                        >
                          Check Results
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ALL STUDENTS VIEW */}
            {currentPage === 'students' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Student Directory</h1>
                    <p className="text-sm text-slate-500 mt-1">
                      Showing {filteredStudents.length} of {students.length} registered students in college records.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentPage('add_student')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add New Student</span>
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2 relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by student name or roll number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">All Courses</option>
                      {stats.courses.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">All Semesters</option>
                      {stats.semesters.map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>

                    {(searchQuery || selectedCourse || selectedSemester) && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCourse('');
                          setSelectedSemester('');
                        }}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3.5">ID</th>
                          <th className="px-4 py-3.5">Student</th>
                          <th className="px-4 py-3.5">Roll No</th>
                          <th className="px-4 py-3.5">Email</th>
                          <th className="px-4 py-3.5">Course</th>
                          <th className="px-4 py-3.5">Department</th>
                          <th className="px-4 py-3.5">Semester</th>
                          <th className="px-4 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-slate-50/70 transition">
                              <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">#{student.id}</td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                                    {(student.name || 'ST').substring(0, 2).toUpperCase()}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setSelectedStudentId(student.id);
                                      setCurrentPage('student_details');
                                    }}
                                    className="font-semibold text-slate-900 hover:text-blue-600 text-left transition"
                                  >
                                    {student.name}
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200">
                                  {student.roll_number}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-slate-500 text-xs">{student.email}</td>
                              <td className="px-4 py-3.5 text-slate-700 text-xs font-medium">{student.course}</td>
                              <td className="px-4 py-3.5 text-slate-500 text-xs">{student.department}</td>
                              <td className="px-4 py-3.5">
                                <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                  Sem {student.semester}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setSelectedStudentId(student.id);
                                      setCurrentPage('student_details');
                                    }}
                                    title="View Profile & Marks"
                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setStudentToEdit({ ...student })}
                                    title="Edit Student"
                                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setStudentToDelete(student)}
                                    title="Delete Student"
                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                              <p className="font-semibold text-slate-700">No students matched your search</p>
                              <p className="text-xs text-slate-400 mt-1">Try resetting your filters or search keywords</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ADD STUDENT FORM VIEW */}
            {currentPage === 'add_student' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Add New Student</h1>
                    <p className="text-sm text-slate-500 mt-1">Enroll a new student into the college database with complete validation.</p>
                  </div>
                  <button
                    onClick={() => setCurrentPage('students')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Directory</span>
                  </button>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
                  <form onSubmit={handleAddStudent} className="space-y-6">
                    {/* Section 1 */}
                    <div>
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">1</span>
                        <h2 className="font-bold text-slate-900">Personal Information</h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Student Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Diya Patel"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Roll Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. CS202699"
                            value={formData.roll_number}
                            onChange={(e) => setFormData({ ...formData, roll_number: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                          <span className="text-[11px] text-slate-400">Must be unique across college records</span>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="student@example.edu"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="9876543210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Gender <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Date of Birth <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.dob}
                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2 */}
                    <div>
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">2</span>
                        <h2 className="font-bold text-slate-900">Academic & Department Details</h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Course / Degree <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.course}
                            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          >
                            <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                            <option value="B.Sc Information Tech">B.Sc Information Tech</option>
                            <option value="B.Tech Electronics">B.Tech Electronics</option>
                            <option value="B.Tech Mechanical">B.Tech Mechanical</option>
                            <option value="B.Tech Civil">B.Tech Civil</option>
                            <option value="MCA">MCA</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Department <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Computer Science"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Semester (1–12) <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.semester}
                            onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                              <option key={sem} value={sem}>Semester {sem}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 3 */}
                    <div>
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">3</span>
                        <h2 className="font-bold text-slate-900">Residential Address</h2>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Permanent Residential Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Complete residential address, city, and pincode..."
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition"
                      >
                        Register Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentPage('students')}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 4. STUDENT DETAILS VIEW */}
            {currentPage === 'student_details' && activeStudent && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{activeStudent.name}</h1>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                        {activeStudent.roll_number}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{activeStudent.course} • Semester {activeStudent.semester}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAddingMarks(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm transition"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Subject Marks</span>
                    </button>
                    <button
                      onClick={() => setStudentToEdit({ ...activeStudent })}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold transition"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage('students')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-slate-800 text-xs sm:text-sm font-semibold transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Directory</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Student Bio */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-500 text-white font-bold text-2xl flex items-center justify-center shadow-md mb-3">
                        {(activeStudent.name || 'ST').substring(0, 2).toUpperCase()}
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">{activeStudent.name}</h2>
                      <span className="text-xs text-slate-500">{activeStudent.department}</span>
                    </div>

                    <div className="space-y-3 text-xs border-t border-slate-100 pt-4">
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Roll Number:</span>
                        <span className="font-mono font-bold text-slate-900">{activeStudent.roll_number}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Email Address:</span>
                        <span className="text-slate-800 font-medium">{activeStudent.email}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Contact Phone:</span>
                        <span className="text-slate-800 font-medium">{activeStudent.phone}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Gender:</span>
                        <span className="text-slate-800 font-medium">{activeStudent.gender}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Date of Birth:</span>
                        <span className="text-slate-800 font-medium">{activeStudent.dob}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Degree Program:</span>
                        <span className="font-semibold text-slate-800">{activeStudent.course}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Current Semester:</span>
                        <span className="text-slate-800 font-semibold">Semester {activeStudent.semester}</span>
                      </div>
                      <div className="py-1">
                        <span className="text-slate-500 font-medium block mb-1">Residential Address:</span>
                        <span className="text-slate-700 leading-relaxed">{activeStudent.address}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setStudentToDelete(activeStudent)}
                        className="w-full text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 py-2 rounded-lg font-semibold transition"
                      >
                        Delete Student Record
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Academic Marks & Performance */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Performance Summary Cards */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-900 text-sm sm:text-base">Academic Examination Performance</h2>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                          {activeStudentPerformance.count} Subject(s)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-[11px] text-slate-500 font-semibold block uppercase">Total Marks</span>
                          <span className="text-lg font-bold text-slate-900 mt-1 block">
                            {activeStudentPerformance.totalObtained} / {activeStudentPerformance.totalMax}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-[11px] text-slate-500 font-semibold block uppercase">Percentage</span>
                          <span className="text-lg font-bold text-slate-900 mt-1 block">
                            {activeStudentPerformance.percentage}%
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-[11px] text-slate-500 font-semibold block uppercase">Letter Grade</span>
                          <span className={`inline-block text-base font-black mt-1 px-3 py-0.5 rounded ${activeStudentPerformance.gradeData.color} ${activeStudentPerformance.gradeData.bg}`}>
                            {activeStudentPerformance.gradeData.grade}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-[11px] text-slate-500 font-semibold block uppercase">Status</span>
                          <span className={`inline-block text-xs font-bold mt-1 px-2.5 py-1 rounded-full ${
                            activeStudentPerformance.percentage >= 50 && activeStudentPerformance.count > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : activeStudentPerformance.count === 0
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {activeStudentPerformance.count === 0
                              ? 'NO MARKS'
                              : activeStudentPerformance.percentage >= 50
                              ? 'PASSED'
                              : 'FAILED'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Subject Marks Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm">Subject Scores</h3>
                        <button
                          onClick={() => setIsAddingMarks(true)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          + Add Marks
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                            <tr>
                              <th className="px-4 py-3">Subject Name</th>
                              <th className="px-4 py-3 text-right">Marks Scored</th>
                              <th className="px-4 py-3 text-right">Max Marks</th>
                              <th className="px-4 py-3 text-right">Percentage</th>
                              <th className="px-4 py-3 text-center">Grade</th>
                              <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {activeStudentMarks.length > 0 ? (
                              activeStudentMarks.map((m) => {
                                const pct = m.max_marks > 0 ? Math.round((m.marks_obtained / m.max_marks) * 1000) / 10 : 0;
                                const subGrade = calculateGrade(pct);
                                return (
                                  <tr key={m.id} className="hover:bg-slate-50 transition">
                                    <td className="px-4 py-3 font-semibold text-slate-900">{m.subject}</td>
                                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">{m.marks_obtained}</td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-400">{m.max_marks}</td>
                                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-700">{pct}%</td>
                                    <td className="px-4 py-3 text-center">
                                      <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${subGrade.color} ${subGrade.bg}`}>
                                        {subGrade.grade}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <button
                                        onClick={() => setMarkToDelete({ id: m.id, subject: m.subject })}
                                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                                        title="Delete Mark"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                                  No marks recorded yet for this student. Click "Add Subject Marks" to record exam scores.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Grading Scale Rubric */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">University Grading Criteria:</span>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1"><span className="px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">A+</span> 90–100%</span>
                        <span className="inline-flex items-center gap-1"><span className="px-1.5 py-0.5 rounded font-bold bg-green-100 text-green-800">A</span> 80–89%</span>
                        <span className="inline-flex items-center gap-1"><span className="px-1.5 py-0.5 rounded font-bold bg-sky-100 text-sky-800">B</span> 70–79%</span>
                        <span className="inline-flex items-center gap-1"><span className="px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-800">C</span> 60–69%</span>
                        <span className="inline-flex items-center gap-1"><span className="px-1.5 py-0.5 rounded font-bold bg-orange-100 text-orange-800">D</span> 50–59%</span>
                        <span className="inline-flex items-center gap-1"><span className="px-1.5 py-0.5 rounded font-bold bg-red-100 text-red-800">F</span> &lt; 50% (Fail)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. RESULTS SHEET VIEW */}
            {currentPage === 'results' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Academic Results & Ranking Sheet</h1>
                    <p className="text-sm text-slate-500 mt-1">Consolidated report card with percentage, letter grade, and pass/fail indicators.</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3.5">Roll No</th>
                          <th className="px-4 py-3.5">Student Name</th>
                          <th className="px-4 py-3.5">Course</th>
                          <th className="px-4 py-3.5">Sem</th>
                          <th className="px-4 py-3.5 text-center">Subjects</th>
                          <th className="px-4 py-3.5 text-right">Total Marks</th>
                          <th className="px-4 py-3.5 text-right">Percentage</th>
                          <th className="px-4 py-3.5 text-center">Grade</th>
                          <th className="px-4 py-3.5 text-center">Status</th>
                          <th className="px-4 py-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.map((student) => {
                          const sMarks = marks.filter((m) => m.student_id === student.id);
                          const totalObt = sMarks.reduce((acc, m) => acc + (Number(m.marks_obtained) || 0), 0);
                          const totalMax = sMarks.reduce((acc, m) => acc + (Number(m.max_marks) || 0), 0);
                          const pct = totalMax > 0 ? Math.round((totalObt / totalMax) * 1000) / 10 : 0;
                          const grade = totalMax > 0 ? calculateGrade(pct) : null;
                          const status = sMarks.length === 0 ? 'Pending' : pct >= 50 ? 'Pass' : 'Fail';

                          return (
                            <tr key={student.id} className="hover:bg-slate-50 transition">
                              <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-800">{student.roll_number}</td>
                              <td className="px-4 py-3.5 font-semibold text-slate-900">{student.name}</td>
                              <td className="px-4 py-3.5 text-slate-600 text-xs">{student.course}</td>
                              <td className="px-4 py-3.5 text-xs text-slate-600">Sem {student.semester}</td>
                              <td className="px-4 py-3.5 text-center font-mono text-xs text-slate-500">{sMarks.length}</td>
                              <td className="px-4 py-3.5 text-right font-mono text-xs">
                                {sMarks.length > 0 ? `${totalObt} / ${totalMax}` : '—'}
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono font-bold text-sm">
                                {sMarks.length > 0 ? `${pct}%` : '—'}
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                {grade ? (
                                  <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${grade.color} ${grade.bg}`}>
                                    {grade.grade}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-xs">N/A</span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                  status === 'Pass'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : status === 'Fail'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {status.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedStudentId(student.id);
                                    setCurrentPage('student_details');
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                                >
                                  Details &rarr;
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 6. ABOUT SYSTEM VIEW */}
            {currentPage === 'about' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="pb-2 border-b border-slate-200">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">About Student Management System</h1>
                  <p className="text-sm text-slate-500 mt-1">College Python Programming Course Project Specifications</p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Project Architecture & Technologies</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      A real-world, complete educational record management platform designed using Python 3, Flask, and SQLite. Implements clean Model-View-Controller architecture with zero third-party cloud dependencies or API keys.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-1">Backend Framework</span>
                      <p className="text-slate-600">Python 3 with Flask WSGI framework and Jinja2 templating.</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-1">Database Engine</span>
                      <p className="text-slate-600">Embedded SQLite3 with foreign keys and parameterized SQL queries.</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-1">Frontend Layer</span>
                      <p className="text-slate-600">Pure HTML5, CSS3 Variables, vanilla JavaScript, and responsive design.</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="font-bold text-slate-900 text-sm mb-2">College Grading Rubric</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 font-semibold text-slate-600">
                          <tr>
                            <th className="p-2">Score Range</th>
                            <th className="p-2">Grade Letter</th>
                            <th className="p-2">Academic Standing</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr><td className="p-2 font-mono">90% – 100%</td><td className="p-2 font-bold text-emerald-700">A+</td><td className="p-2">Outstanding Distinction</td></tr>
                          <tr><td className="p-2 font-mono">80% – 89%</td><td className="p-2 font-bold text-green-700">A</td><td className="p-2">First Class with Distinction</td></tr>
                          <tr><td className="p-2 font-mono">70% – 79%</td><td className="p-2 font-bold text-sky-700">B</td><td className="p-2">First Class</td></tr>
                          <tr><td className="p-2 font-mono">60% – 69%</td><td className="p-2 font-bold text-amber-700">C</td><td className="p-2">Higher Second Class</td></tr>
                          <tr><td className="p-2 font-mono">50% – 59%</td><td className="p-2 font-bold text-orange-700">D</td><td className="p-2">Pass Class</td></tr>
                          <tr><td className="p-2 font-mono">Below 50%</td><td className="p-2 font-bold text-red-700">F</td><td className="p-2">Fail / Remedial Required</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROJECT CODE FILES EXPLORER & ZIP EXPORTER                        */}
      {/* ========================================================================= */}
      {activeTab === 'code' && (
        <div className="flex-1 flex flex-col md:flex-row bg-slate-900 text-slate-100 overflow-hidden">
          {/* File Tree Sidebar */}
          <aside className="w-full md:w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Project Files</span>
                <p className="text-xs text-slate-500 font-mono">Student-Management-System/</p>
              </div>
              <button
                onClick={downloadProjectZip}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.ZIP</span>
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-1 flex-1">
              {PROJECT_FILES.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs text-left transition font-mono ${
                    selectedFile.path === file.path
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{file.path}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{file.language}</span>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/60">
              <button
                onClick={downloadProjectZip}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Entire Project (.ZIP)</span>
              </button>
              <p className="text-[11px] text-slate-500 text-center mt-2">Ready to submit for college assignments</p>
            </div>
          </aside>

          {/* Code Viewer */}
          <main className="flex-1 flex flex-col min-w-0 bg-slate-900">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-white">{selectedFile.path}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {selectedFile.language}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{selectedFile.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium border border-slate-700 transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-auto">
              <pre className="font-mono text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre font-normal bg-slate-950 p-4 rounded-xl border border-slate-800">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CLI SETUP & INSTRUCTIONS                                           */}
      {/* ========================================================================= */}
      {activeTab === 'guide' && (
        <div className="flex-1 p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Command Line Execution & Setup Guide</h1>
            <p className="text-slate-600 mt-2 text-sm">
              Follow these standard commands on Windows, macOS, or Linux to execute the Flask application completely offline.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>Open Terminal & Navigate to Project Folder</span>
              </h2>
              <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-xs sm:text-sm">
                cd Student-Management-System
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>Create & Activate Virtual Environment</span>
              </h2>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500">On Windows (Command Prompt / PowerShell):</span>
                <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-xs sm:text-sm">
                  python -m venv venv<br />
                  venv\Scripts\activate
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500">On macOS / Linux:</span>
                <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-xs sm:text-sm">
                  python3 -m venv venv<br />
                  source venv/bin/activate
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>Install Dependencies</span>
              </h2>
              <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-xs sm:text-sm">
                pip install -r requirements.txt
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                <span>Start the Flask Application</span>
              </h2>
              <div className="bg-slate-900 text-sky-300 p-3 rounded-lg font-mono text-xs sm:text-sm">
                python app.py
              </div>
              <p className="text-xs text-slate-500">
                The database (<code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">database.db</code>) initializes and seeds automatically on first launch!
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">5</span>
                <span>Open in Web Browser</span>
              </h2>
              <div className="bg-slate-100 p-3 rounded-lg text-sm text-slate-800 font-mono">
                http://127.0.0.1:5000
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Student Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900">{studentToDelete.name}</strong> ({studentToDelete.roll_number})?
            </p>
            <div className="bg-red-50 text-red-800 text-xs p-3 rounded-lg border border-red-200">
              ⚠️ This will remove the student record and all associated subject marks from the SQLite database.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteStudent}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Mark Modal */}
      {markToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-slate-900">Remove Marks Entry</h3>
            </div>
            <p className="text-sm text-slate-600">
              Remove the examination marks for <strong className="text-slate-900">{markToDelete.subject}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setMarkToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteMark}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {studentToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Edit Student Record</h3>
              <button onClick={() => setStudentToEdit(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleEditStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={studentToEdit.name}
                    onChange={(e) => setStudentToEdit({ ...studentToEdit, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={studentToEdit.roll_number}
                    onChange={(e) => setStudentToEdit({ ...studentToEdit, roll_number: e.target.value.toUpperCase() })}
                    className="w-full p-2 border border-slate-300 rounded text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={studentToEdit.email}
                    onChange={(e) => setStudentToEdit({ ...studentToEdit, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={studentToEdit.phone}
                    onChange={(e) => setStudentToEdit({ ...studentToEdit, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Course</label>
                  <input
                    type="text"
                    required
                    value={studentToEdit.course}
                    onChange={(e) => setStudentToEdit({ ...studentToEdit, course: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={studentToEdit.semester}
                    onChange={(e) => setStudentToEdit({ ...studentToEdit, semester: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Permanent Address</label>
                <textarea
                  rows={2}
                  required
                  value={studentToEdit.address}
                  onChange={(e) => setStudentToEdit({ ...studentToEdit, address: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStudentToEdit(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Marks Modal */}
      {isAddingMarks && activeStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Subject Marks</h3>
                <p className="text-xs text-slate-500">For {activeStudent.name} ({activeStudent.roll_number})</p>
              </div>
              <button onClick={() => setIsAddingMarks(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddMark} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subject Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Python Programming"
                  value={markSubject}
                  onChange={(e) => setMarkSubject(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Marks Obtained <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    placeholder="e.g. 88.5"
                    value={markObtained}
                    onChange={(e) => setMarkObtained(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Marks <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={markMax}
                    onChange={(e) => setMarkMax(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-sm font-mono"
                  />
                </div>
              </div>

              {/* Real-time Calculation Preview */}
              {markObtained && markMax && Number(markMax) > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                  <div className="text-emerald-800 font-semibold">Live Preview:</div>
                  <div className="flex justify-between text-emerald-900 font-mono">
                    <span>Percentage: {Math.round((Number(markObtained) / Number(markMax)) * 1000) / 10}%</span>
                    <span className="font-bold">Grade: {calculateGrade((Number(markObtained) / Number(markMax)) * 100).grade}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingMarks(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm"
                >
                  Save Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
