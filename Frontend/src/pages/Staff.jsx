import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, UserPlus, Edit, Trash2, X, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'cashier',
    is_active: true
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/');
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'cashier',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setIsEditMode(true);
    setSelectedStaffId(user.id);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Leave blank unless they want to change it
      role: user.role,
      is_active: user.is_active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        // If password is empty in edit mode, remove it from payload
        const payload = { ...formData };
        if (!payload.password) {
          delete payload.password;
        }
        await api.put(`/users/${selectedStaffId}`, payload);
        alert('Staff updated successfully!');
      } else {
        if (!formData.password) {
          alert('Password is required for new staff');
          return;
        }
        await api.post('/users/', formData);
        alert('Staff added successfully!');
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch (error) {
      console.error('Error saving staff:', error);
      alert(`❌ Failed to save staff: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert(`❌ Failed to delete staff: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const filteredStaff = staff.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role) => {
    if (role === 'admin') return <ShieldAlert size={16} className="text-red-500" />;
    if (role === 'manager') return <ShieldCheck size={16} className="text-blue-500" />;
    return <Shield size={16} className="text-gray-500" />;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
        <button 
          onClick={openAddModal}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
        >
          <UserPlus size={20} /> Add New Staff
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by username or email..." 
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
                  <th className="p-4 font-medium w-16">ID</th>
                  <th className="p-4 font-medium">Username</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      No staff members found
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-500">{user.id}</td>
                      <td className="p-4 font-medium text-gray-800">{user.username}</td>
                      <td className="p-4 text-gray-600">{user.email}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-sm font-medium capitalize">
                          {getRoleIcon(user.role)} {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
              {isEditMode ? 'Edit Staff Member' : 'Add New Staff'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500" 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required 
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {isEditMode && <span className="text-gray-400 text-xs font-normal">(Leave blank to keep current)</span>}
                </label>
                <input 
                  type="password" 
                  required={!isEditMode}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500" 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500" 
                  value={formData.is_active ? "true" : "false"} 
                  onChange={(e) => setFormData({...formData, is_active: e.target.value === "true"})}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
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
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  {isEditMode ? 'Save Changes' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
