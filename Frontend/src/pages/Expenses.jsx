import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Receipt, DollarSign, Calendar, X } from 'lucide-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // States សម្រាប់ Modal បន្ថែមការចំណាយ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    amount_riel: '',
    category: 'Ingredients', // លំនាំដើម
    expense_date: new Date().toISOString().split('T')[0] // យកកាលបរិច្ឆេទថ្ងៃនេះ
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses/');
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses/', {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        expense_date: formData.expense_date
      });
      
      alert('កត់ត្រាការចំណាយជោគជ័យ!');
      setIsModalOpen(false);
      setFormData({ 
        title: '', 
        amount: '', 
        amount_riel: '',
        category: 'Ingredients', 
        expense_date: new Date().toISOString().split('T')[0] 
      });
      fetchExpenses(); // ទាញយកទិន្នន័យថ្មីម្តងទៀត
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('មានបញ្ហាក្នុងការកត់ត្រា។');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('តើអ្នកពិតជាចង់លុបកំណត់ត្រានេះមែនទេ?')) {
      try {
        await api.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  // គណនាការចំណាយសរុប
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Expenses Management</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Plus size={20} /> Add Expense
        </button>
      </div>

      {/* កាតសង្ខេបការចំណាយ */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-red-100">
          <DollarSign size={28} className="text-red-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Expenses (All Time)</p>
          <h3 className="text-3xl font-bold text-gray-800">${totalExpense.toFixed(2)}</h3>
        </div>
      </div>

      {/* តារាងបញ្ជីការចំណាយ */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 border-b z-10">
                <tr className="text-gray-500 text-sm">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      <Receipt size={40} className="mx-auto mb-3 opacity-30" />
                      No expenses recorded yet.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-600 flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        {exp.expense_date}
                      </td>
                      <td className="p-4 font-medium text-gray-800">{exp.title}</td>
                      <td className="p-4 text-gray-600">
                        <span className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-medium">
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-red-600">-${exp.amount.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(exp.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                          <Trash2 size={18} />
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

      {/* Modal បន្ថែមការចំណាយ */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[32rem] relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
              <Receipt className="text-red-600" /> Record Expense
            </h2>
            
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (ចំណងជើង)</label>
                <input 
                  type="text" 
                  required
                  placeholder="ឧ. ទិញទឹកកក, បង់ថ្លៃភ្លើង..."
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input 
                    type="text"
                    inputMode="decimal"
                    required
                    placeholder="0.00"
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={formData.amount}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9.]/g, '');
                      // Prevent multiple decimals
                      if ((val.match(/\./g) || []).length > 1) {
                        val = val.substring(0, val.length - 1);
                      }
                      const parsed = parseFloat(val);
                      setFormData({
                        ...formData, 
                        amount: val, 
                        amount_riel: !isNaN(parsed) ? Math.floor(parsed * 4000).toString() : ''
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (៛)</label>
                  <input 
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={formData.amount_riel}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      const parsed = parseInt(val, 10);
                      setFormData({
                        ...formData, 
                        amount_riel: val, 
                        amount: !isNaN(parsed) ? (parsed / 4000).toFixed(2) : ''
                      });
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date (កាលបរិច្ឆេទ)</label>
                <input 
                  type="date" 
                  required
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({...formData, expense_date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category (ប្រភេទ)</label>
                <select 
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Ingredients">Ingredients (វត្ថុធាតុដើម)</option>
                  <option value="Utilities">Utilities (ទឹក ភ្លើង ទីតាំង)</option>
                  <option value="Salary">Salary (ប្រាក់ខែបុគ្គលិក)</option>
                  <option value="Equipment">Equipment (សម្ភារៈប្រើប្រាស់)</option>
                  <option value="CashierError">Cashier Error (គិតលុយខុស)</option>
                  <option value="Other">Other (ផ្សេងៗ)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
