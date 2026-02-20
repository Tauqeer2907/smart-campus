import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_PATHS, UserRole } from '@/lib/index';
import { Layout } from '@/components/Layout';

import Login from '@/pages/Login';
import StudentDashboard from '@/pages/StudentDashboard';
import Academics from '@/pages/Academics';
import Attendance from '@/pages/Attendance';
import Assignments from '@/pages/Assignments';
import Placements from '@/pages/Placements';
import Library from '@/pages/Library';
import Hostel from '@/pages/Hostel';
import Finance from '@/pages/Finance';
import Feedback from '@/pages/Feedback';
import FacultyDashboard from '@/pages/FacultyDashboard';
import FacultyAttendance from '@/pages/FacultyAttendance';
import Grading from '@/pages/Grading';
import Resources from '@/pages/Resources';
import RecommendationLetters from '@/pages/RecommendationLetters';
import AdminDashboard from '@/pages/AdminDashboard';
import PlacementManagement from '@/pages/PlacementManagement';
import LibraryManagement from '@/pages/LibraryManagement';
import FinanceLedger from '@/pages/FinanceLedger';
import FeedbackAnalytics from '@/pages/FeedbackAnalytics';
import FacultyOversight from '@/pages/FacultyOversight';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles?: UserRole[] 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
          <p className="text-muted-foreground font-medium animate-pulse">Initializing UniCampus 2026...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const fallbackDashboard = 
      user.role === 'student' ? ROUTE_PATHS.STUDENT_DASHBOARD : 
      user.role === 'faculty' ? ROUTE_PATHS.FACULTY_DASHBOARD : 
      ROUTE_PATHS.ADMIN_DASHBOARD;
    
    return <Navigate to={fallbackDashboard} replace />;
  }

  return <Layout>{children}</Layout>;
};

const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) return <Navigate to={ROUTE_PATHS.LOGIN} replace />;

  switch (user?.role) {
    case 'student': return <Navigate to={ROUTE_PATHS.STUDENT_DASHBOARD} replace />;
    case 'faculty': return <Navigate to={ROUTE_PATHS.FACULTY_DASHBOARD} replace />;
    case 'admin': return <Navigate to={ROUTE_PATHS.ADMIN_DASHBOARD} replace />;
    default: return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" expand={false} richColors />
        <Router>
          <Routes>
            <Route path={ROUTE_PATHS.LOGIN} element={<Login />} />
            
            {/* Student Routes */}
            <Route path={ROUTE_PATHS.STUDENT_DASHBOARD} element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.ACADEMICS} element={<ProtectedRoute allowedRoles={['student']}><Academics /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.ATTENDANCE} element={<ProtectedRoute allowedRoles={['student']}><Attendance /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.ASSIGNMENTS} element={<ProtectedRoute allowedRoles={['student']}><Assignments /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.PLACEMENTS} element={<ProtectedRoute allowedRoles={['student']}><Placements /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.LIBRARY} element={<ProtectedRoute allowedRoles={['student']}><Library /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.HOSTEL} element={<ProtectedRoute allowedRoles={['student']}><Hostel /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.FINANCE} element={<ProtectedRoute allowedRoles={['student']}><Finance /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.FEEDBACK} element={<ProtectedRoute allowedRoles={['student']}><Feedback /></ProtectedRoute>} />

            {/* Faculty Routes */}
            <Route path={ROUTE_PATHS.FACULTY_DASHBOARD} element={<ProtectedRoute allowedRoles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.FACULTY_ATTENDANCE} element={<ProtectedRoute allowedRoles={['faculty']}><FacultyAttendance /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.GRADING} element={<ProtectedRoute allowedRoles={['faculty']}><Grading /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.RESOURCES} element={<ProtectedRoute allowedRoles={['faculty']}><Resources /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.RECOMMENDATIONS} element={<ProtectedRoute allowedRoles={['faculty']}><RecommendationLetters /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path={ROUTE_PATHS.ADMIN_DASHBOARD} element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.PLACEMENT_MGMT} element={<ProtectedRoute allowedRoles={['admin']}><PlacementManagement /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.LIBRARY_MGMT} element={<ProtectedRoute allowedRoles={['admin']}><LibraryManagement /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.FINANCE_LEDGER} element={<ProtectedRoute allowedRoles={['admin']}><FinanceLedger /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.FEEDBACK_ANALYTICS} element={<ProtectedRoute allowedRoles={['admin']}><FeedbackAnalytics /></ProtectedRoute>} />
            <Route path={ROUTE_PATHS.FACULTY_OVERSIGHT} element={<ProtectedRoute allowedRoles={['admin']}><FacultyOversight /></ProtectedRoute>} />

            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;