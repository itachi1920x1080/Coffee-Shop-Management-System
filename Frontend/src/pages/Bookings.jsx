import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Edit2, Trash2, Plus, DoorOpen, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';

export default function Bookings() {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'rooms'
  
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Room Modal State
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    capacity: 1,
    price_per_hour: 0.0,
    status: 'Available'
  });

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [bookingFormData, setBookingFormData] = useState({
    room_id: '',
    customer_name: '',
    customer_phone: '',
    start_time: '',
    end_time: '',
    status: 'Pending',
    payment_status: 'Unpaid',
    payment_note: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        api.get('/workspace/rooms'),
        api.get('/workspace/bookings')
      ]);
      setRooms(roomsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Room Handlers ---
  const handleOpenRoomModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setRoomFormData({
        name: room.name,
        capacity: room.capacity,
        price_per_hour: room.price_per_hour,
        status: room.status
      });
    } else {
      setEditingRoom(null);
      setRoomFormData({ name: '', capacity: 1, price_per_hour: 0.0, status: 'Available' });
    }
    setShowRoomModal(true);
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.put(`/workspace/rooms/${editingRoom.id}`, roomFormData);
      } else {
        await api.post('/workspace/rooms', roomFormData);
      }
      setShowRoomModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Failed to save room');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm('Are you sure you want to delete this room? This might fail if there are bookings attached to it.')) {
      try {
        await api.delete(`/workspace/rooms/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Cannot delete room. Ensure no bookings are linked to it.');
      }
    }
  };

  // --- Booking Handlers ---
  const handleOpenBookingModal = (booking = null) => {
    if (booking) {
      setEditingBooking(booking);
      // Format dates for datetime-local input
      const start = new Date(booking.start_time).toISOString().slice(0, 16);
      const end = new Date(booking.end_time).toISOString().slice(0, 16);
      
      setBookingFormData({
        room_id: booking.room_id,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone || '',
        start_time: start,
        end_time: end,
        status: booking.status,
        payment_status: booking.payment_status || 'Unpaid',
        payment_note: booking.payment_note || ''
      });
    } else {
      setEditingBooking(null);
      setBookingFormData({
        room_id: rooms.length > 0 ? rooms[0].id : '',
        customer_name: '',
        customer_phone: '',
        start_time: '',
        end_time: '',
        status: 'Pending',
        payment_status: 'Unpaid',
        payment_note: ''
      });
    }
    setShowBookingModal(true);
  };

  const calculateTotalPrice = (start, end, roomId) => {
    if (!start || !end || !roomId) return 0;
    const room = rooms.find(r => r.id === parseInt(roomId));
    if (!room) return 0;
    
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const hours = (endTime - startTime) / (1000 * 60 * 60);
    
    return hours > 0 ? hours * room.price_per_hour : 0;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const totalPrice = calculateTotalPrice(bookingFormData.start_time, bookingFormData.end_time, bookingFormData.room_id);
    
    const payload = {
      ...bookingFormData,
      total_price: totalPrice
    };

    try {
      if (editingBooking) {
        await api.put(`/workspace/bookings/${editingBooking.id}`, payload);
      } else {
        await api.post('/workspace/bookings', payload);
      }
      setShowBookingModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Failed to save booking');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (window.confirm('Are you sure you want to cancel and delete this booking?')) {
      try {
        await api.delete(`/workspace/bookings/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting booking:', error);
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
          <h1 className="text-2xl font-bold text-gray-800">Workspace Bookings</h1>
          <p className="text-gray-500 mt-1">Manage private rooms and workspaces reservations.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'bookings' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Reservations
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'rooms' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Rooms Setup
          </button>
        </div>
      </div>

      {/* --- ROOMS VIEW --- */}
      {activeTab === 'rooms' && (
        <div className="flex-1 flex flex-col">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => handleOpenRoomModal()}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} /> Add Room
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-xl shadow-sm border text-center text-gray-500">
                <DoorOpen size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No rooms created yet.</p>
              </div>
            ) : (
              rooms.map((room) => (
                <div key={room.id} className="bg-white rounded-xl shadow-sm border p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <DoorOpen className="text-orange-600" size={24} /> {room.name}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      room.status === 'Available' ? 'bg-green-50 text-green-600' :
                      room.status === 'Occupied' ? 'bg-orange-50 text-orange-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {room.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Users size={16} /> Capacity: {room.capacity} people
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Clock size={16} /> Rate: ${room.price_per_hour.toFixed(2)} / hour
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleOpenRoomModal(room)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Room"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Room"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- BOOKINGS VIEW --- */}
      {activeTab === 'bookings' && (
        <div className="flex-1 flex flex-col">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => handleOpenBookingModal()}
              disabled={rooms.length === 0}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:bg-gray-300"
            >
              <Calendar size={20} /> New Reservation
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 font-semibold text-gray-600">Room</th>
                    <th className="p-4 font-semibold text-gray-600">Customer</th>
                    <th className="p-4 font-semibold text-gray-600">Date & Time</th>
                    <th className="p-4 font-semibold text-gray-600">Price</th>
                    <th className="p-4 font-semibold text-gray-600">Payment</th>
                    <th className="p-4 font-semibold text-gray-600">Status</th>
                    <th className="p-4 font-semibold text-gray-600 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">
                        <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
                        <p>No active reservations found.</p>
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-800">
                          {booking.room?.name || 'Unknown Room'}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-800">{booking.customer_name}</div>
                          <div className="text-xs text-gray-500">{booking.customer_phone}</div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          <div><span className="font-medium text-gray-700">Start:</span> {new Date(booking.start_time).toLocaleString()}</div>
                          <div><span className="font-medium text-gray-700">End:</span> {new Date(booking.end_time).toLocaleString()}</div>
                        </td>
                        <td className="p-4 font-bold text-gray-800">
                          ${booking.total_price.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold w-max ${
                              booking.payment_status === 'Paid' ? 'bg-green-100 text-green-700' :
                              booking.payment_status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {booking.payment_status}
                            </span>
                            {booking.payment_note && <span className="text-[10px] text-gray-500">{booking.payment_note}</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                            booking.status === 'Active' ? 'bg-blue-50 text-blue-600' :
                            booking.status === 'Completed' ? 'bg-green-50 text-green-600' :
                            booking.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                            'bg-orange-50 text-orange-600'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenBookingModal(booking)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Booking"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Booking"
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
        </div>
      )}

      {/* --- ROOM MODAL --- */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h2>
            </div>
            <form onSubmit={handleRoomSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Meeting Room A"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  value={roomFormData.name}
                  onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    value={roomFormData.capacity}
                    onChange={(e) => setRoomFormData({ ...roomFormData, capacity: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Hour ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    value={roomFormData.price_per_hour}
                    onChange={(e) => setRoomFormData({ ...roomFormData, price_per_hour: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  value={roomFormData.status}
                  onChange={(e) => setRoomFormData({ ...roomFormData, status: e.target.value })}
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- BOOKING MODAL --- */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingBooking ? 'Edit Reservation' : 'New Reservation'}
              </h2>
            </div>
            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                <select
                  required
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  value={bookingFormData.room_id}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, room_id: e.target.value })}
                >
                  <option value="" disabled>Select a room</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} (${room.price_per_hour}/hr)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    value={bookingFormData.customer_name}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, customer_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    value={bookingFormData.customer_phone}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, customer_phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  value={bookingFormData.start_time}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, start_time: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  value={bookingFormData.end_time}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, end_time: e.target.value })}
                />
              </div>

              {/* Price Preview */}
              {bookingFormData.start_time && bookingFormData.end_time && bookingFormData.room_id && (
                <div className="bg-gray-50 p-3 rounded-lg border flex justify-between items-center text-sm">
                  <span className="text-gray-600">Estimated Total:</span>
                  <span className="font-bold text-gray-800 text-lg">
                    ${calculateTotalPrice(bookingFormData.start_time, bookingFormData.end_time, bookingFormData.room_id).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    value={bookingFormData.status}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, status: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    value={bookingFormData.payment_status}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, payment_status: e.target.value })}
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Paid in advance via transfer, will pay on arrival"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  value={bookingFormData.payment_note}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, payment_note: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
