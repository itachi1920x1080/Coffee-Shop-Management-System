import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('access_token');

  // ប្រសិនបើគ្មាន Token ទេ បញ្ជូនត្រលប់ទៅទំព័រ Login វិញ
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ប្រសិនបើមាន Token អនុញ្ញាតឱ្យចូលទៅកាន់ Route កូនៗ (Outlet)
  return <Outlet />;
}
