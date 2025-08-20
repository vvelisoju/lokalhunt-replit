import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BranchAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('BranchAdminRoute - Loading:', loading, 'User:', user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    console.log('BranchAdminRoute: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'BRANCH_ADMIN') {
    console.log('BranchAdminRoute: User role is not BRANCH_ADMIN:', user.role);
    return <Navigate to="/login" replace />;
  }

  console.log('BranchAdminRoute: User is authenticated as BRANCH_ADMIN');
  return children;
};

export default BranchAdminRoute;