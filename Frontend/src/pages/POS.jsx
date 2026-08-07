import { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShoppingCart, Plus, Minus, Trash2, X, Search } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { BakongKHQR, khqrData, IndividualInfo } from 'bakong-khqr';

export default function POS() {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // States សម្រាប់ផ្ទាំង Checkout Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [amountReceived, setAmountReceived] = useState('');
  const [receivedCurrency, setReceivedCurrency] = useState('USD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrString, setQrString] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menusRes, categoriesRes] = await Promise.all([
          api.get('/menus/'),
          api.get('/categories/')
        ]);
        setMenus(menusRes.data);
        
        const recommendedOrder = [
          "Hot Coffee", "Iced Coffee", "Tea", "Bubble Tea", "Milk Drinks", 
          "Chocolate Drinks", "Juice", "Smoothies", "Frappes", "Soft Drinks", 
          "Water", "Specialty Drinks"
        ];
        
        const sortedCategories = categoriesRes.data.sort((a, b) => {
          const indexA = recommendedOrder.indexOf(a.name);
          const indexB = recommendedOrder.indexOf(b.name);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });

        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMenus = menus.filter(menu => {
    const matchesCategory = selectedCategory === 'All' || menu.category?.name === selectedCategory;
    const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (menu) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === menu.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...menu, quantity: 1 }];
    });
  };

  const updateQuantity = (id, amount) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + amount;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      });
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const totalAmount = cart.reduce((total, item) => total + item.price * (parseInt(item.quantity) || 0), 0);
  
  const EXCHANGE_RATE = 4100;
  let receivedInUSD = 0;
  if (amountReceived) {
      receivedInUSD = receivedCurrency === 'KHR' 
        ? parseFloat(amountReceived) / EXCHANGE_RATE 
        : parseFloat(amountReceived);
  }
  const changeAmount = receivedInUSD - totalAmount;

  // Generate KHQR when Checkout opens
  useEffect(() => {
    if (isCheckoutOpen && totalAmount > 0) {
      try {
        const info = new IndividualInfo(
          'test@aba', // Dummy merchant Bakong Account ID
          'Coffee Shop',
          'Phnom Penh',
          {
            amount: parseFloat(totalAmount.toFixed(2)),
            currency: khqrData.currency.usd,
            storeLabel: 'Coffee POS',
            expirationTimestamp: Date.now() + 15 * 60 * 1000 // Expires in 15 minutes
          }
        );
        const khqr = new BakongKHQR();
        const res = khqr.generateIndividual(info);
        if (res.data && res.data.qr) {
          setQrString(res.data.qr);
        }
      } catch (error) {
        console.error("Error generating KHQR:", error);
      }
    } else {
      setQrString('');
    }
  }, [isCheckoutOpen, totalAmount]);

  // អនុគមន៍សម្រាប់បញ្ជូនទិន្នន័យបញ្ជាទិញ និងបង់ប្រាក់ទៅកាន់ Backend
  const handleCheckout = async () => {
    const finalAmountReceived = paymentMethod === 'khqr' ? totalAmount : parseFloat(amountReceived);

    if (finalAmountReceived < totalAmount || isNaN(finalAmountReceived)) {
      alert("ទឹកប្រាក់ទទួលមិនគ្រប់គ្រាន់ទេ! (Insufficient amount)");
      return;
    }

    setIsProcessing(true);
    try {
      // ១. បង្កើត Order សិន
      const orderData = {
        total_price: totalAmount,
        status: "Completed",
        items: cart.map(item => ({
          menu_id: item.id,
          quantity: item.quantity,
          unit_price: item.price
        }))
      };
      const orderResponse = await api.post('/orders/', orderData);
      const orderId = orderResponse.data.id;

      // ២. ធ្វើការទូទាត់ប្រាក់ (Payment)
      const paymentData = {
        order_id: orderId,
        amount_received: finalAmountReceived,
        payment_currency: "USD"
      };
      await api.post('/payments/', paymentData);

      // ៣. បង្ហាញសារជោគជ័យ និងជម្រះកន្ត្រក
      alert("ទូទាត់ប្រាក់ជោគជ័យ! (Payment Successful!)");
      setCart([]);
      setIsCheckoutOpen(false);
      setAmountReceived('');
      
    } catch (error) {
      console.error('Checkout failed:', error);
      alert("មានបញ្ហាក្នុងការទូទាត់ប្រាក់។ សូមសាកល្បងម្តងទៀត។");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full gap-6 relative">
      {/* ផ្នែកខាងឆ្វេង៖ បញ្ជីមុខម្ហូប */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Point of Sale</h1>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        </div>
        
        {/* Category Navigation Bar */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
              selectedCategory === 'All' 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-orange-100 border border-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat.name 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-orange-100 border border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4">
            {filteredMenus.map((menu) => (
              <div 
                key={menu.id} 
                onClick={() => addToCart(menu)}
                className="bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-orange-400 transition-all flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 bg-gray-200 rounded-full mb-3 overflow-hidden flex items-center justify-center">
                  {menu.image ? (
                     <img src={`http://127.0.0.1:8000${menu.image}`} alt={menu.name} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-gray-400 text-xs">No Image</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{menu.name}</h3>
                <p className="text-orange-600 font-bold">${menu.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ផ្នែកខាងស្តាំ៖ កន្ត្រក (Cart) */}
      <div className="w-96 bg-white border rounded-xl shadow-sm flex flex-col">
        <div className="p-4 border-b bg-gray-50 rounded-t-xl flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart size={20} className="text-orange-600" /> Current Order
          </h2>
          <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
            {cart.length} Items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart size={48} className="mb-2 opacity-50" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                  <p className="text-gray-500 text-xs">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:text-orange-600"><Minus size={14} /></button>
                    <input 
                      type="number" 
                      className="w-10 text-center text-sm font-medium bg-transparent border-x border-gray-200 focus:outline-none"
                      value={item.quantity === '' ? '' : item.quantity}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        if (rawValue === '') {
                           setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: '' } : i));
                           return;
                        }
                        const val = parseInt(rawValue);
                        if (!isNaN(val) && val >= 0) {
                          setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: val } : i));
                        }
                      }}
                      onBlur={(e) => {
                        if (item.quantity === '' || item.quantity <= 0) {
                          setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: 1 } : i));
                        }
                      }}
                      min="1"
                    />
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:text-orange-600"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Total Amount:</span>
            <span className="text-2xl font-bold text-orange-600">${totalAmount.toFixed(2)}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Checkout / Pay
          </button>
        </div>
      </div>

      {/* ផ្ទាំង Checkout Modal */}
      {isCheckoutOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Payment</h2>
            
            <div className="flex gap-2 mb-6">
              <button 
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${paymentMethod === 'cash' ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setPaymentMethod('cash')}
              >
                Cash Payment
              </button>
              <button 
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${paymentMethod === 'khqr' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setPaymentMethod('khqr')}
              >
                KHQR Payment
              </button>
            </div>

            {paymentMethod === 'khqr' && qrString && (
              <div className="flex flex-col items-center mb-6">
                <div className="bg-white p-2 rounded-xl shadow-sm border mb-2">
                  <QRCodeCanvas value={qrString} size={180} level={"H"} />
                </div>
                <span className="text-sm font-bold text-blue-800">Scan to Pay via KHQR</span>
              </div>
            )}

            <div className="mb-4">
              <span className="block text-sm text-gray-500 mb-1">Total to Pay</span>
              <span className="text-3xl font-bold text-orange-600">${totalAmount.toFixed(2)}</span>
            </div>

            {paymentMethod === 'cash' && (
              <>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Amount Received</label>
                    <div className="flex bg-gray-200 rounded-lg p-1">
                      <button 
                        onClick={() => setReceivedCurrency('USD')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${receivedCurrency === 'USD' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        USD ($)
                      </button>
                      <button 
                        onClick={() => setReceivedCurrency('KHR')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${receivedCurrency === 'KHR' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        KHR (៛)
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-xl">
                      {receivedCurrency === 'USD' ? '$' : '៛'}
                    </span>
                    <input 
                      type="number" 
                      autoFocus
                      className={`w-full text-2xl p-3 ${receivedCurrency === 'USD' ? 'pl-8' : 'pl-10'} border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none`}
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <span className="block text-sm text-gray-500 mb-1">Change (ប្រាក់អាប់)</span>
                  <span className={`text-2xl font-bold ${changeAmount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                    ${changeAmount > 0 ? changeAmount.toFixed(2) : '0.00'}
                  </span>
                  {changeAmount > 0 && (
                    <span className="block text-sm text-gray-500 mt-1">
                      ≈ {(changeAmount * EXCHANGE_RATE).toLocaleString()} ៛ (KHR)
                    </span>
                  )}
                </div>
              </>
            )}


            <button 
              onClick={handleCheckout}
              disabled={isProcessing || (paymentMethod === 'cash' && changeAmount < 0)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
