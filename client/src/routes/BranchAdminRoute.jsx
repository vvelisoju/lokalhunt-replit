import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BranchAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'BRANCH_ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default BranchAdminRoute;