import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Printer, Download } from 'lucide-react';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    net_profit: 0,
    daily_data: []
  });

  // កំណត់ថ្ងៃខែដើមខែ និងចុងខែ (Default Date Range)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const currentDay = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(currentDay);
  const [activeFilter, setActiveFilter] = useState('month');

  const setPredefinedRange = (type) => {
    setActiveFilter(type);
    const dateObj = new Date();
    const end = dateObj.toISOString().split('T')[0];
    let start = end;

    if (type === 'today') {
      start = end;
    } else if (type === 'month') {
      start = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1).toISOString().split('T')[0];
    } else if (type === 'year') {
      start = new Date(dateObj.getFullYear(), 0, 1).toISOString().split('T')[0];
    }
    
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // ហៅ API ដោយបញ្ជូនថ្ងៃខែទៅជាមួយ (Query Parameters)
      const response = await api.get('/reports/summary', {
        params: { start_date: startDate, end_date: endDate }
      });
      
      // សន្មតថា Backend បញ្ជូនទិន្នន័យមកទម្រង់បែបនេះ
      // បើ Backend អត់ទាន់មានទិន្នន័យ សូមប្រើទិន្នន័យសាកល្បង (Mock Data) សិន
      if (response.data) {
        setSummary(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      // ទិន្នន័យសាកល្បង (Mock Data) សម្រាប់មើល Interface មុនពេល Backend ដំណើរការ១០០%
      setSummary({
        total_income: 2450.50,
        total_expense: 850.00,
        net_profit: 1600.50,
        daily_data: [
          { date: 'Aug 01', income: 150, expense: 50 },
          { date: 'Aug 02', income: 200, expense: 30 },
          { date: 'Aug 03', income: 180, expense: 120 },
          { date: 'Aug 04', income: 300, expense: 40 },
          { date: 'Aug 05', income: 250, expense: 0 },
          { date: 'Aug 06', income: 400, expense: 200 },
          { date: 'Aug 07', income: 350, expense: 50 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full print:bg-white">
      {/* ផ្នែកខាងលើ (Header & Filters) នឹងត្រូវបានលាក់ពេល Print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Financial Reports</h1>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-lg shadow-sm border">
          <div className="flex bg-gray-100 rounded-md p-1 mr-2">
            <button 
              onClick={() => setPredefinedRange('today')} 
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeFilter === 'today' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Today
            </button>
            <button 
              onClick={() => setPredefinedRange('month')} 
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeFilter === 'month' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Month
            </button>
            <button 
              onClick={() => setPredefinedRange('year')} 
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeFilter === 'year' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Year
            </button>
          </div>
          
          <div className="flex items-center gap-2 px-2">
            <Calendar size={18} className="text-gray-400" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setActiveFilter('custom'); }}
              className="text-sm outline-none text-gray-700 bg-transparent"
            />
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2 px-2">
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setActiveFilter('custom'); }}
              className="text-sm outline-none text-gray-700 bg-transparent"
            />
          </div>
          <button 
            onClick={handlePrint}
            className="ml-2 flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            <Printer size={16} /> Print / PDF
          </button>
        </div>
      </div>

      {/* ផ្នែកសម្រាប់បង្ហាញពេល Print (Print Header) */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">☕ Coffee Shop Name</h1>
        <h2 className="text-xl text-gray-600">Financial Report</h2>
        <p className="text-gray-500 mt-1">Period: {startDate} to {endDate}</p>
      </div>

      {/* កាតសង្ខេបទិន្នន័យ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Income Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Income</p>
              <h3 className="text-3xl font-bold text-gray-800">${summary.total_income.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Expenses</p>
              <h3 className="text-3xl font-bold text-gray-800">${summary.total_expense.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Net Profit</p>
              <h3 className="text-3xl font-bold text-gray-800">${summary.net_profit.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* ក្រាហ្វិក (Chart) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border flex-1 min-h-[400px]">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Income vs Expense Overview</h3>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={(summary.daily_data || []).map(d => ({...d, cashFlow: d.income - d.expense}))}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                cursor={{fill: '#f9fafb'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Legend wrapperStyle={{paddingTop: '20px'}}/>
              <Bar dataKey="income" name="Income ($)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar dataKey="expense" name="Expense ($)" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
              <Line type="monotone" dataKey="cashFlow" name="Cash Flow ($)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
