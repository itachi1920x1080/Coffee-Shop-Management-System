import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Coffee, Users, LogOut, Receipt, FileText, DollarSign, UserCog } from 'lucide-react';
import api from '../api/axios';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // If 401, they might be logged out
      }
    };
    fetchUser();
  }, []);

  // Redirect Cashiers away from Dashboard
  useEffect(() => {
    if (user?.role === 'cashier' && location.pathname === '/dashboard') {
      navigate('/pos', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  // Redirect non-Admins away from Staff Management
  useEffect(() => {
    if (user && user.role !== 'admin' && location.pathname === '/staff') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const isCashier = user?.role === 'cashier';
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  const NavLink = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname.startsWith(to);
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
          isActive 
            ? 'bg-orange-50 text-orange-600' 
            : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
        }`}
      >
        <Icon size={20} /> {label}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-6 border-b text-center">
          <h1 className="text-2xl font-bold text-orange-600">☕ Coffee POS</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Everyone except Cashier gets Dashboard */}
          {!isCashier && (
            <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          )}
          
          {/* Everyone gets POS and Orders */}
          <NavLink to="/pos" icon={ShoppingCart} label="Point of Sale" />
          <NavLink to="/orders" icon={FileText} label="Order History" />

          {/* Management features hidden from Cashier */}
          {!isCashier && (
            <>
              <NavLink to="/menus" icon={Coffee} label="Menus & Categories" />
              <NavLink to="/customers" icon={Users} label="Customers & Tables" />
              <NavLink to="/expenses" icon={DollarSign} label="Expenses" />
              <NavLink to="/reports" icon={Receipt} label="Reports" />
            </>
          )}

          {/* Admin strictly only features */}
          {isAdmin && (
            <NavLink to="/staff" icon={UserCog} label="Staff Management" />
          )}
        </nav>

        <div className="p-4 border-t">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {isCashier ? "Point of Sale" : "Management System"}
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold uppercase">
              {user ? user.username.charAt(0) : 'U'}
            </div>
            <span className="text-sm font-medium text-gray-700 capitalize">
              {user ? `${user.username} (${user.role})` : 'Loading...'}
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
