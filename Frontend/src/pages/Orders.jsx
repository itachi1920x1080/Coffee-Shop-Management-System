import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, FileText, CheckCircle, Clock, Printer } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/');
      // Sort orders by created_at descending (newest first)
      const sortedOrders = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order History</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by Order Number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white sticky top-0 border-b z-10">
                <tr className="text-gray-500 text-sm">
                  <th className="p-4 font-medium">Order Number</th>
                  <th className="p-4 font-medium">Date & Time</th>
                  <th className="p-4 font-medium">Items</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Total Amount</th>
                  <th className="p-4 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      មិនទាន់មានទិន្នន័យការកម្ម៉ង់ទេ (No orders recorded yet)
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-800 flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" /> {order.order_number}
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                      <td className="p-4 text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {order.items?.length || 0} items
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max ${
                          order.status === 'Completed' || order.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status === 'Completed' || order.status === 'Paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-orange-600 text-right">
                        ${order.total_amount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => setSelectedOrderForInvoice(order)}
                          className="p-2 text-gray-500 hover:text-orange-600 bg-gray-100 hover:bg-orange-50 rounded-lg transition-colors inline-flex items-center gap-1 text-sm font-medium"
                          title="Print Invoice"
                        >
                          <Printer size={16} /> Print
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {selectedOrderForInvoice && (
        <InvoiceModal 
          order={selectedOrderForInvoice} 
          onClose={() => setSelectedOrderForInvoice(null)} 
        />
      )}
    </div>
  );
}
