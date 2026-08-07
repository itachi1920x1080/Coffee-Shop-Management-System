import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Coffee, Users, LogOut, Receipt, FileText, DollarSign } from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

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
          <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavLink to="/pos" icon={ShoppingCart} label="Point of Sale" />
          <NavLink to="/orders" icon={FileText} label="Order History" />
          <NavLink to="/menus" icon={Coffee} label="Menus & Categories" />
          <NavLink to="/customers" icon={Users} label="Customers & Tables" />
          <NavLink to="/expenses" icon={DollarSign} label="Expenses" />
          <NavLink to="/reports" icon={Receipt} label="Reports" />
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
          <h2 className="text-xl font-semibold text-gray-800">Management System</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold">
              A
            </div>
            <span className="text-sm font-medium text-gray-700">Admin User</span>
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
