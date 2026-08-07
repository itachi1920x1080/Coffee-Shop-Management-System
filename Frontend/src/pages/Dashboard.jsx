import { useState, useEffect } from 'react';
import api from '../api/axios';
import { DollarSign, ShoppingBag, Coffee, TrendingUp, Users } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // ហៅ API ទៅកាន់ Backend ដើម្បីទាញទិន្នន័យ
        const response = await api.get('/dashboard/metrics');
        setMetrics(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 bg-red-50 rounded-lg">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      
      {/* ផ្នែកបង្ហាញកាតសង្ខេបទិន្នន័យ (Stat Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Today's Income" 
          value={`$${metrics?.today_income?.toFixed(2) || '0.00'}`} 
          icon={<DollarSign size={24} className="text-green-600" />} 
          bgColor="bg-green-100"
        />
        <StatCard 
          title="Total Orders" 
          value={metrics?.today_orders_count || 0} 
          icon={<ShoppingBag size={24} className="text-blue-600" />} 
          bgColor="bg-blue-100"
        />
        <StatCard 
          title="Total Customers" 
          value={metrics?.total_customers || 0} 
          icon={<Users size={24} className="text-orange-600" />} 
          bgColor="bg-orange-100"
        />
        <StatCard 
          title="Net Profit" 
          value={`$${metrics?.net_profit?.toFixed(2) || '0.00'}`} 
          icon={<TrendingUp size={24} className="text-purple-600" />} 
          bgColor="bg-purple-100"
        />
      </div>

      {/* ផ្នែកបង្ហាញមុខម្ហូបលក់ដាច់បំផុត */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Item Today</h2>
        
        {metrics?.best_selling_menu ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="pb-3 font-medium">Item Name</th>
                  <th className="pb-3 font-medium text-right">Quantity Sold</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 text-gray-800 font-medium">{metrics.best_selling_menu.menu_name}</td>
                  <td className="py-3 text-gray-600 text-right">{metrics.best_selling_menu.total_quantity_sold}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Coffee size={48} className="mx-auto text-gray-300 mb-3" />
            <p>No sales data for today yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Component តូចមួយសម្រាប់បង្កើតកាត (Card) ដើម្បីកុំឲ្យសរសេរកូដជាន់គ្នាដដែលៗ
function StatCard({ title, value, icon, bgColor }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-5 hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${bgColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );
}
