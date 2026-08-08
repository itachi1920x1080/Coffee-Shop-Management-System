import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, Package, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../api/axios';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [stockAction, setStockAction] = useState('add'); // 'add' or 'deduct'
  
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    quantity: 0,
    unit: 'pcs',
    min_stock_level: 5
  });

  const [stockFormData, setStockFormData] = useState({
    amount: 0
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory/');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        item_name: item.item_name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        min_stock_level: item.min_stock_level
      });
    } else {
      setEditingItem(null);
      setFormData({
        item_name: '',
        category: '',
        quantity: 0,
        unit: 'pcs',
        min_stock_level: 5
      });
    }
    setShowModal(true);
  };

  const handleOpenStockModal = (item, action) => {
    setEditingItem(item);
    setStockAction(action);
    setStockFormData({ amount: 0 });
    setShowStockModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/inventory/${editingItem.id}`, formData);
      } else {
        await api.post('/inventory/', formData);
      }
      setShowModal(false);
      fetchInventory();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/inventory/${editingItem.id}/stock`, {
        amount: parseFloat(stockFormData.amount),
        action: stockAction
      });
      setShowStockModal(false);
      fetchInventory();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/inventory/${id}`);
        fetchInventory();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Manage stock levels, ingredients, and supplies.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-semibold text-gray-600">Item Name</th>
                <th className="p-4 font-semibold text-gray-600">Category</th>
                <th className="p-4 font-semibold text-gray-600">Quantity</th>
                <th className="p-4 font-semibold text-gray-600">Min. Stock</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No inventory items found.</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{item.item_name}</td>
                    <td className="p-4 text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{item.category}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-gray-800">{item.quantity}</span> <span className="text-gray-500 text-sm">{item.unit}</span>
                    </td>
                    <td className="p-4 text-gray-600">{item.min_stock_level} {item.unit}</td>
                    <td className="p-4">
                      {item.quantity <= item.min_stock_level ? (
                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold">
                          <AlertTriangle size={14} /> Low Stock
                        </span>
                      ) : (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-semibold">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenStockModal(item, 'add')}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Add Stock"
                        >
                          <TrendingUp size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenStockModal(item, 'deduct')}
                          className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                          title="Deduct Stock"
                        >
                          <TrendingDown size={18} />
                        </button>
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Modal (Create/Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Beans, Milk, Cups"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., kg, liters, pcs"
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. Stock Level</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  value={formData.min_stock_level}
                  onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">You will be warned when stock falls below this amount.</p>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className={`p-6 border-b text-white ${stockAction === 'add' ? 'bg-green-600' : 'bg-orange-600'}`}>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {stockAction === 'add' ? <TrendingUp /> : <TrendingDown />}
                {stockAction === 'add' ? 'Add Stock' : 'Deduct Stock'}
              </h2>
            </div>
            <form onSubmit={handleStockSubmit} className="p-6 space-y-4">
              <p className="text-gray-700">
                Item: <span className="font-bold">{editingItem?.item_name}</span>
                <br />
                Current: <span className="font-bold">{editingItem?.quantity} {editingItem?.unit}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount to {stockAction === 'add' ? 'add' : 'deduct'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:outline-none ${
                      stockAction === 'add' ? 'focus:ring-green-500' : 'focus:ring-orange-500'
                    }`}
                    value={stockFormData.amount}
                    onChange={(e) => setStockFormData({ amount: e.target.value })}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                    {editingItem?.unit}
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                    stockAction === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
