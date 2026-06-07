import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { accessToken, ready, tryRefresh } = useAuthStore();

  useEffect(() => {
    if (!ready) tryRefresh();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!accessToken) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
