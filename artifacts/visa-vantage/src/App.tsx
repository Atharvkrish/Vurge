import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { useEffect } from "react";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import JobsList from "@/pages/jobs/index";
import JobDetail from "@/pages/jobs/id";
import MicroInternshipsList from "@/pages/micro-internships/index";
import MicroInternshipDetail from "@/pages/micro-internships/id";
import StudentDashboard from "@/pages/student/dashboard";
import EmployerDashboard from "@/pages/employer/dashboard";
import AdminDashboard from "@/pages/admin/index";
import ApplicationsPage from "@/pages/applications/index";
import ProfilePage from "@/pages/profile/index";
import PostJobPage from "@/pages/employer/post-job";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/login');
    } else if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      if (user.role === 'ADMIN') setLocation('/admin');
      else if (user.role === 'EMPLOYER') setLocation('/employer/dashboard');
      else setLocation('/student/dashboard');
    }
  }, [user, isLoading, allowedRoles, setLocation]);

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center p-4">Loading session...</div>;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <Component />;
}

function DashboardRedirect() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) setLocation('/login');
      else if (user.role === 'ADMIN') setLocation('/admin');
      else if (user.role === 'EMPLOYER') setLocation('/employer/dashboard');
      else setLocation('/student/dashboard');
    }
  }, [user, isLoading, setLocation]);

  return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      <Route path="/jobs" component={JobsList} />
      <Route path="/jobs/:id" component={JobDetail} />

      <Route path="/micro-internships" component={MicroInternshipsList} />
      <Route path="/micro-internships/:id" component={MicroInternshipDetail} />

      <Route path="/dashboard" component={DashboardRedirect} />

      <Route path="/student/dashboard" component={() => <ProtectedRoute component={StudentDashboard} allowedRoles={['STUDENT']} />} />
      <Route path="/employer/dashboard" component={() => <ProtectedRoute component={EmployerDashboard} allowedRoles={['EMPLOYER']} />} />
      <Route path="/employer/post-job" component={() => <ProtectedRoute component={PostJobPage} allowedRoles={['EMPLOYER']} />} />
      <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboard} allowedRoles={['ADMIN']} />} />

      <Route path="/applications" component={() => <ProtectedRoute component={ApplicationsPage} allowedRoles={['STUDENT', 'EMPLOYER']} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={ProfilePage} allowedRoles={['STUDENT', 'EMPLOYER']} />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
