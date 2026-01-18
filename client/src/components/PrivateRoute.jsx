import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';

/**
 * Protected route component
 * Redirects to login if user is not authenticated
 */
export default function PrivateRoute({ children }) {
    const { isAuthenticated, isLoading } = useStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="spinner mr-3"></span>
                <span className="text-gray-400">Loading...</span>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
}
