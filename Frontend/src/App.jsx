import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Menus from './pages/Menus';
import TablesCustomers from './pages/TablesCustomers';
import Reports from './pages/Reports';
import Expenses from './pages/Expenses';
import Orders from './pages/Orders';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      
      {/* គ្រប់ Routes ទាំងអស់នៅខាងក្រោមនេះ ត្រូវការ Token ទើបអាចចូលបាន */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/menus" element={<Menus />} />
          <Route path="/customers" element={<TablesCustomers />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
