
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = () => {
  const { session, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
