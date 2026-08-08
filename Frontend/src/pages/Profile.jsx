import { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api/axios';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const [role, setRole] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setFormData({
        username: response.data.username,
        email: response.data.email,
        password: ''
      });
      setRole(response.data.role);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const payload = { ...formData };
      if (!payload.password) {
        delete payload.password; // Don't send empty password
      }
      
      const response = await api.put('/auth/me', payload);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update form with returned data
      setFormData({
        username: response.data.username,
        email: response.data.email,
        password: '' // Reset password field
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to update profile. Username or email might be taken.' 
      });
    } finally {
      setSaving(false);
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
    <div className="max-w-2xl mx-auto h-full flex flex-col pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your profile information and security.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex-1 mb-8">
        <div className="p-6 border-b bg-gray-50 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-2xl uppercase">
            {formData.username.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{formData.username}</h2>
            <span className="inline-block mt-1 px-2.5 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-md uppercase tracking-wider">
              {role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {message.text && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-100' : 'bg-green-50 text-green-800 border border-green-100'
            }`}>
              {message.type === 'error' ? <AlertCircle size={20} className="mt-0.5" /> : <CheckCircle size={20} className="mt-0.5" />}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} className="text-gray-400" /> Username
            </label>
            <input 
              type="text" 
              required 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow" 
              value={formData.username} 
              onChange={(e) => setFormData({...formData, username: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail size={16} className="text-gray-400" /> Email Address
            </label>
            <input 
              type="email" 
              required 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Lock size={16} className="text-gray-400" /> New Password
            </label>
            <input 
              type="password" 
              placeholder="Leave blank to keep current password"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          <div className="pt-4 border-t mt-8">
            <button 
              type="submit" 
              disabled={saving}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm ${
                saving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save size={20} />
              )}
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
