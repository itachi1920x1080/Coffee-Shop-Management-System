import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Download, FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function Reports() {
  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/reports/summary', {
        params: { start_date: startDate, end_date: endDate }
      });
      setReport(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/reports/export/${format}`, {
        params: { start_date: startDate, end_date: endDate },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Financial_Report_${startDate}_to_${endDate}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert(`មានបញ្ហាក្នុងការទាញយក (Failed to export ${format.toUpperCase()})`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial Reports</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter by Date</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="date" 
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="date" 
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <button 
            onClick={fetchReport}
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Generate Report
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : report ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-100">
                <DollarSign size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Income</p>
                <h3 className="text-2xl font-bold text-gray-800">${report.total_income?.toFixed(2) || '0.00'}</h3>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-red-100">
                <TrendingDown size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Expenses</p>
                <h3 className="text-2xl font-bold text-gray-800">${report.total_expense?.toFixed(2) || '0.00'}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-green-100">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Net Profit</p>
                <h3 className="text-2xl font-bold text-gray-800">${report.net_profit?.toFixed(2) || '0.00'}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Export Data</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              Download the financial summary report for the selected period ({report.start_date} to {report.end_date}) in your preferred format.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => handleExport('csv')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <FileText size={20} /> Export to CSV
              </button>
              <button 
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Download size={20} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
