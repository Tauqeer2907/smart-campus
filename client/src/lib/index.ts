/**
 * UniCampus Core Library
 * Year: 2026
 */

export type UserRole = 'student' | 'faculty' | 'admin';

export const ROUTE_PATHS = {
  LOGIN: '/login',
  // Student Routes
  STUDENT_DASHBOARD: '/student/dashboard',
  ACADEMICS: '/student/academics',
  ATTENDANCE: '/student/attendance',
  ASSIGNMENTS: '/student/assignments',
  PLACEMENTS: '/student/placements',
  LIBRARY: '/student/library',
  HOSTEL: '/student/hostel',
  FINANCE: '/student/finance',
  FEEDBACK: '/student/feedback',
  STUDENT_EVENTS: '/student/events',
  // Faculty Routes
  FACULTY_DASHBOARD: '/faculty/dashboard',
  FACULTY_ATTENDANCE: '/faculty/attendance',
  GRADING: '/faculty/grading',
  RESOURCES: '/faculty/resources',
  RECOMMENDATIONS: '/faculty/recommendations',
  FACULTY_EVENTS: '/faculty/events',
  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  PLACEMENT_MGMT: '/admin/placements',
  LIBRARY_MGMT: '/admin/library',
  FINANCE_LEDGER: '/admin/finance',
  FEEDBACK_ANALYTICS: '/admin/feedback',
  FACULTY_OVERSIGHT: '/admin/faculty-oversight',
  ADMIN_EVENTS: '/admin/events',
} as const;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  branch?: string;
  year?: number;
  semester?: number;
  studentId?: string;
  facultyId?: string;
  cgpa?: number;
}

export interface AttendanceData {
  subject: string;
  attended: number;
  total: number;
  percentage: number;
  trend: number[];
  lastUpdated: string;
  faculty: string;
  credits: number;
  prediction?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  branch: string;
  module: string;
  timestamp: string;
}

export interface PlacementDrive {
  id: string;
  company: string;
  logo?: string;
  role: string;
  ctc: string;
  cutoffCgpa: number;
  deadline: string;
  applicants: number;
  status: 'open' | 'closed' | 'shortlisted' | 'interview' | 'offer';
}

/**
 * Parse Student ID: "COMP_101" → { branch: "COMP", year: 1 }
 */
export function parseStudentId(id: string) {
  const parts = id.split('_');
  if (parts.length < 2) return null;
  return {
    branch: parts[0].toUpperCase(),
    year: parseInt(parts[1][0]) || 1,
  };
}

/**
 * Format date for campus feed
 */
export function formatCampusDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
