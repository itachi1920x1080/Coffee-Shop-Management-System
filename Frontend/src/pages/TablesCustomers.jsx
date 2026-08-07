import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Grid, Plus, CheckCircle, Clock, AlertCircle, Edit, Trash2, X } from 'lucide-react';

export default function TablesCustomers() {
  const [activeTab, setActiveTab] = useState('tables');
  const [tables, setTables] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Forms
  const [tableForm, setTableForm] = useState({ number: '', capacity: 4, status: 'Available', floor: 'Ground Floor' });
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', email: '', is_regular: false });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tables') {
        const res = await api.get('/tables/');
        setTables(res.data);
      } else {
        const res = await api.get('/customers/');
        setCustomers(res.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Table Actions ---
  const openTableModal = (table = null) => {
    if (table) {
      setIsEditMode(true);
      setCurrentId(table.id);
      setTableForm({ number: table.number, capacity: table.capacity, status: table.status, floor: table.floor || 'Ground Floor' });
    } else {
      setIsEditMode(false);
      setTableForm({ number: '', capacity: 4, status: 'Available', floor: 'Ground Floor' });
    }
    setIsTableModalOpen(true);
  };

  const handleSaveTable = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/tables/${currentId}`, tableForm);
      } else {
        await api.post('/tables/', tableForm);
      }
      setIsTableModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error saving table!');
    }
  };

  const handleDeleteTable = async (id) => {
    if (window.confirm('Delete this table?')) {
      try {
        await api.delete(`/tables/${id}`);
        fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  // --- Customer Actions ---
  const openCustomerModal = (customer = null) => {
    if (customer) {
      setIsEditMode(true);
      setCurrentId(customer.id);
      setCustomerForm({ 
        name: customer.name, 
        phone: customer.phone, 
        email: customer.email || '', 
        is_regular: customer.is_regular || false 
      });
    } else {
      setIsEditMode(false);
      setCustomerForm({ name: '', phone: '', email: '', is_regular: false });
    }
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/customers/${currentId}`, customerForm);
      } else {
        await api.post('/customers/', customerForm);
      }
      setIsCustomerModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error saving customer!');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tables & Customers Management</h1>
        <div className="bg-gray-200 p-1 rounded-lg flex gap-1">
          <button onClick={() => setActiveTab('tables')} className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'tables' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Manage Tables</button>
          <button onClick={() => setActiveTab('customers')} className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'customers' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Manage Customers</button>
        </div>
      </div>

      {activeTab === 'tables' ? (
        <div className="space-y-6 flex-1 flex flex-col">
          <div className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">All Tables</h2>
            <button onClick={() => openTableModal()} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Plus size={18} /> Add Table
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 flex-1 overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div></div>
            ) : (
              <div className="space-y-8">
                {Object.entries(
                  tables.reduce((acc, table) => {
                    const floor = table.floor || 'Ground Floor';
                    if (!acc[floor]) acc[floor] = [];
                    acc[floor].push(table);
                    return acc;
                  }, {})
                ).map(([floor, floorTables]) => (
                  <div key={floor}>
                    <h3 className="text-lg font-bold text-gray-700 border-b pb-2 mb-4">{floor}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {floorTables.map((table) => (
                        <div key={table.id} className={`relative border rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm transition-all group ${
                            table.status === 'Available' ? 'bg-green-50 border-green-200 text-green-800' :
                            table.status === 'Occupied' ? 'bg-red-50 border-red-200 text-red-800' : 
                            'bg-yellow-50 border-yellow-200 text-yellow-800'
                          }`}>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button onClick={() => openTableModal(table)} className="p-1 bg-white rounded shadow-sm text-blue-600 hover:text-blue-800"><Edit size={14}/></button>
                            <button onClick={() => handleDeleteTable(table.id)} className="p-1 bg-white rounded shadow-sm text-red-600 hover:text-red-800"><Trash2 size={14}/></button>
                          </div>
                          <Grid size={32} className="mb-2 opacity-80" />
                          <h3 className="font-bold text-lg mb-1">{table.number}</h3>
                          <p className="text-xs opacity-70 mb-2">Cap: {table.capacity}</p>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white bg-opacity-70 flex items-center gap-1">
                            {table.status === 'Available' && <CheckCircle size={12} className="text-green-600" />}
                            {table.status === 'Occupied' && <AlertCircle size={12} className="text-red-600" />}
                            {table.status === 'Reserved' && <Clock size={12} className="text-yellow-600" />}
                            {table.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex-1 flex flex-col">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
             <h2 className="font-semibold text-gray-700">Customer List</h2>
             <button onClick={() => openCustomerModal()} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Plus size={18} /> Add Customer
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div></div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-white sticky top-0 border-b z-10">
                  <tr className="text-gray-500 text-sm">
                    <th className="p-4 font-medium">Customer Name</th>
                    <th className="p-4 font-medium">Contact</th>
                    <th className="p-4 font-medium text-center">Total Visits</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((cus) => (
                    <tr key={cus.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                          {cus.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          {cus.name}
                          {cus.is_regular && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Regular</span>}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        <p>{cus.phone || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{cus.email}</p>
                      </td>
                      <td className="p-4 text-center font-bold text-orange-600">
                        <span className="bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                          {cus.visit_count || 0} Visits
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => openCustomerModal(cus)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18} /></button>
                        <button onClick={() => handleDeleteCustomer(cus.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Table Modal */}
      {isTableModalOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">
            <button onClick={() => setIsTableModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={24} /></button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">{isEditMode ? 'Edit Table' : 'Add New Table'}</h2>
            <form onSubmit={handleSaveTable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Table Number</label>
                <input required type="text" className="w-full p-2 border rounded" value={tableForm.number} onChange={e => setTableForm({...tableForm, number: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <input required type="number" min="1" className="w-full p-2 border rounded" value={tableForm.capacity} onChange={e => setTableForm({...tableForm, capacity: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="w-full p-2 border rounded" value={tableForm.status} onChange={e => setTableForm({...tableForm, status: e.target.value})}>
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Floor / Zone</label>
                <input required type="text" className="w-full p-2 border rounded" list="floor-options" placeholder="e.g. Ground Floor, VIP Room" value={tableForm.floor} onChange={e => setTableForm({...tableForm, floor: e.target.value})} />
                <datalist id="floor-options">
                  <option value="Ground Floor" />
                  <option value="Floor 1" />
                  <option value="Floor 2" />
                  <option value="Rooftop" />
                  <option value="VIP Room" />
                </datalist>
              </div>
              <button type="submit" className="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700">Save Table</button>
            </form>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">
            <button onClick={() => setIsCustomerModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={24} /></button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">{isEditMode ? 'Edit Customer' : 'Add New Customer'}</h2>
            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required type="text" className="w-full p-2 border rounded" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input required type="text" className="w-full p-2 border rounded" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className="w-full p-2 border rounded" value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="regular" checked={customerForm.is_regular} onChange={e => setCustomerForm({...customerForm, is_regular: e.target.checked})} />
                <label htmlFor="regular" className="text-sm font-medium">Is Regular Customer</label>
              </div>
              <button type="submit" className="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700">Save Customer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
