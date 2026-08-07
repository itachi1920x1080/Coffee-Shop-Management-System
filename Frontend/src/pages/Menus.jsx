import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit, Trash2, X, Search, Layers } from 'lucide-react';

export default function Menus() {
  const [activeTab, setActiveTab] = useState('menus');
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for Menu Modal
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isMenuEditMode, setIsMenuEditMode] = useState(false);
  const [currentMenuId, setCurrentMenuId] = useState(null);
  const [menuFormData, setMenuFormData] = useState({
    code: '', name: '', price: '', category_id: '', description: ''
  });
  const [imageFile, setImageFile] = useState(null);

  // States for Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [isCategoryOptionsModalOpen, setIsCategoryOptionsModalOpen] = useState(false);
  const [selectedImportCategory, setSelectedImportCategory] = useState("");
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [selectedSuggestedProducts, setSelectedSuggestedProducts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '', description: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'menus') {
        const [menusRes, categoriesRes] = await Promise.all([
          api.get('/menus/'),
          api.get('/categories/')
        ]);
        setMenus(menusRes.data);
        setCategories(categoriesRes.data);
      } else {
        const res = await api.get('/categories/');
        setCategories(res.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openMenuModal = (menu = null) => {
    if (menu) {
      setIsMenuEditMode(true);
      setCurrentMenuId(menu.id);
      setMenuFormData({
        code: menu.code || '',
        name: menu.name,
        price: menu.price,
        category_id: menu.category_id,
        description: menu.description || ''
      });
    } else {
      setIsMenuEditMode(false);
      setCurrentMenuId(null);
      setMenuFormData({
        code: '', name: '', price: '', category_id: '', description: ''
      });
    }
    setImageFile(null);
    setIsMenuModalOpen(true);
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    try {
      let savedMenuId;

      if (isMenuEditMode) {
        // Update existing menu
        await api.put(`/menus/${currentMenuId}`, {
          name: menuFormData.name,
          price: parseFloat(menuFormData.price),
          category_id: parseInt(menuFormData.category_id),
          description: menuFormData.description
        });
        savedMenuId = currentMenuId;
      } else {
        // Create new menu
        const code = menuFormData.code || `M-${Math.floor(Math.random() * 10000)}`;
        const res = await api.post('/menus/', {
          code: code,
          name: menuFormData.name,
          price: parseFloat(menuFormData.price),
          category_id: parseInt(menuFormData.category_id),
          description: menuFormData.description
        });
        savedMenuId = res.data.id;
      }

      // Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        await api.post(`/menus/${savedMenuId}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (!isMenuEditMode) {
        // Auto-generate image if no image was uploaded
        try {
           await api.post(`/menus/${savedMenuId}/generate-image?prompt=${encodeURIComponent(menuFormData.name)}`);
        } catch (imgErr) {
           console.error('Failed to auto-generate image:', imgErr);
        }
      }

      alert(isMenuEditMode ? 'កែប្រែមុខម្ហូបជោគជ័យ!' : 'បន្ថែមមុខម្ហូបជោគជ័យ!');
      setIsMenuModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving menu:', error);
      alert('មានបញ្ហាក្នុងការរក្សាទុកមុខម្ហូប។');
    }
  };

  const openCategoryModal = (category = null) => {
    if (category) {
      setIsCategoryEditMode(true);
      setCurrentCategoryId(category.id);
      setCategoryFormData({
        name: category.name,
        description: category.description || ''
      });
    } else {
      setIsCategoryEditMode(false);
      setCurrentCategoryId(null);
      setCategoryFormData({ name: '', description: '' });
    }
    setIsCategoryModalOpen(true);
  };

  const calculateSuggestedProducts = (name) => {
    const categoryName = name.toLowerCase();
    if (categoryName.includes('hot coffee')) {
      return ['Espresso', 'Americano', 'Cappuccino', 'Latte', 'Mocha', 'Flat White'];
    } else if (categoryName.includes('iced coffee')) {
      return ['Iced Americano', 'Iced Latte', 'Iced Mocha', 'Cold Brew'];
    } else if (categoryName.includes('milk tea')) {
      return ['Classic Milk Tea', 'Brown Sugar Milk Tea', 'Thai Milk Tea', 'Taro Milk Tea'];
    } else if (categoryName.includes('tea')) {
      return ['Green Tea', 'Black Tea', 'Lemon Tea', 'Milk Tea'];
    } else if (categoryName.includes('chocolate')) {
      return ['Hot Chocolate', 'Iced Chocolate', 'Chocolate Latte'];
    } else if (categoryName.includes('smoothie')) {
      return ['Strawberry Smoothie', 'Mango Smoothie', 'Banana Smoothie'];
    } else if (categoryName.includes('juice')) {
      return ['Orange Juice', 'Apple Juice', 'Watermelon Juice'];
    } else if (categoryName.includes('soft drink')) {
      return ['Coca-Cola', 'Sprite', 'Fanta'];
    } else if (categoryName.includes('water')) {
      return ['Mineral Water', 'Sparkling Water'];
    } else if (categoryName.includes('hot')) {
      return ['Espresso', 'Americano', 'Cappuccino', 'Latte', 'Mocha'];
    } else if (categoryName.includes('cold') || categoryName.includes('ice') || categoryName.includes('iced')) {
      return ['Iced Coffee', 'Iced Latte', 'Lemon Tea', 'Frappe'];
    } else if (categoryName.includes('pastry') || categoryName.includes('pastries') || categoryName.includes('food') || categoryName.includes('snack')) {
      return ['Croissant', 'Muffin', 'Chocolate Chip Cookie', 'Brownie'];
    }
    return [];
  };

  const handleNextCategory = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      alert('❌ Please complete all required fields.');
      return;
    }

    if (isCategoryEditMode) {
      try {
        await api.put(`/categories/${currentCategoryId}`, categoryFormData);
        alert('✅ Category created successfully!');
        setIsCategoryModalOpen(false);
        setCategoryFormData({ name: '', description: '' });
        fetchData();
      } catch (error) {
        console.error('Error saving category:', error);
        if (error.response?.status === 400 && error.response?.data?.detail?.includes('already exists')) {
          alert('⚠️ Category already exists. Please choose another name.');
        } else {
          alert('❌ Failed to create category. Please try again.');
        }
      }
    } else {
      // Calculate suggestions based on name
      const suggestions = calculateSuggestedProducts(categoryFormData.name);
      setSuggestedProducts(suggestions);
      setSelectedSuggestedProducts(suggestions); // Check all by default
      
      // Proceed to options modal
      setIsCategoryModalOpen(false);
      setIsCategoryOptionsModalOpen(true);
    }
  };

  const handleCategoryOption = async (option) => {
    if (option === 'cancel') {
      setIsCategoryOptionsModalOpen(false);
      setCategoryFormData({ name: '', description: '' });
      return;
    }

    setIsCreatingCategory(true);
    try {
      // 1. Create the category first
      let newCategory;
      try {
        const response = await api.post('/categories/', categoryFormData);
        newCategory = response.data;
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.detail?.includes('already exists')) {
          alert('⚠️ Category already exists. Please choose another name.');
        } else {
          alert('❌ Failed to create category. Please try again.');
        }
        setIsCreatingCategory(false);
        setIsCategoryOptionsModalOpen(false);
        setIsCategoryModalOpen(true); // Let them fix the name
        return;
      }
      
      // 2. Handle specific options
      if (option === 'empty') {
         // Do nothing else
      } else if (option === 'generate') {
          if (selectedSuggestedProducts.length > 0) {
            await Promise.all(selectedSuggestedProducts.map(async (productName, index) => {
               const productData = {
                  code: `AUTO-${newCategory.id}-${index}-${Math.floor(Math.random()*1000)}`,
                  name: productName,
                  price: 3.00,
                  category_id: newCategory.id,
                  description: `Auto-generated ${productName}`
               };
               try {
                   const res = await api.post('/menus/', productData);
                   // Auto generate image
                   await api.post(`/menus/${res.data.id}/generate-image?prompt=${encodeURIComponent(productName)}`);
               } catch(err) {
                   console.error('Failed to auto-gen product/image:', err);
               }
            }));
          }
      } else if (option === 'import') {
          if (!selectedImportCategory) {
              alert('សូមជ្រើសរើសប្រភេទដើមដើម្បី Import');
              setIsCreatingCategory(false);
              return;
          }
          const menusToCopy = menus.filter(m => m.category_id === parseInt(selectedImportCategory));
          if (menusToCopy.length > 0) {
              await Promise.all(menusToCopy.map(async (m, index) => {
                  const productData = {
                      code: `IMP-${newCategory.id}-${index}-${Math.floor(Math.random()*1000)}`,
                      name: m.name,
                      price: m.price,
                      category_id: newCategory.id,
                      description: m.description
                  };
                  try {
                      const res = await api.post('/menus/', productData);
                      if (!m.image) {
                          // Auto generate image if imported item had no image
                          await api.post(`/menus/${res.data.id}/generate-image?prompt=${encodeURIComponent(m.name)}`);
                      }
                  } catch(err) {
                      console.error('Failed to import product/image:', err);
                  }
              }));
          }
      } else if (option === 'manual') {
          alert('✅ Category created successfully!');
          setIsCategoryOptionsModalOpen(false);
          setIsCreatingCategory(false);
          setCategoryFormData({ name: '', description: '' });
          await fetchData();
          
          openMenuModal(); 
          setMenuFormData(prev => ({...prev, category_id: newCategory.id}));
          return; 
      }
      
      alert('✅ Category created successfully!');
      setIsCategoryOptionsModalOpen(false);
      setCategoryFormData({ name: '', description: '' });
      setSelectedImportCategory("");
      setSuggestedProducts([]);
      setSelectedSuggestedProducts([]);
      fetchData();
      
    } catch (error) {
      console.error('Error in category option:', error);
      alert('❌ Failed to create category. Please try again.');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post('/ai/generate-menu', { category: categoryFormData.name });
      const extras = response.data.items;
      setSuggestedProducts([...suggestedProducts, ...extras]);
      setSelectedSuggestedProducts([...selectedSuggestedProducts, ...extras]);
    } catch (error) {
      console.error('Error generating AI items:', error);
      alert('បរាជ័យក្នុងការបង្កើតដោយ AI (Failed to generate with AI). ' + (error.response?.data?.detail || ''));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDescription = async (type) => {
    const nameToUse = type === 'menu' ? menuFormData.name : categoryFormData.name;
    if (!nameToUse) {
      alert(`Please enter a ${type} name first to generate a description.`);
      return;
    }
    
    setIsGeneratingDesc(true);
    try {
      const response = await api.post('/ai/generate-description', { 
        name: nameToUse,
        type: type
      });
      const generatedDesc = response.data.description;
      
      if (type === 'menu') {
        setMenuFormData(prev => ({...prev, description: generatedDesc}));
      } else {
        setCategoryFormData(prev => ({...prev, description: generatedDesc}));
      }
    } catch (error) {
      console.error('Error generating description:', error);
      alert('Failed to generate description with AI. ' + (error.response?.data?.detail || ''));
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleDeleteMenu = async (id) => {
    if (window.confirm('តើអ្នកពិតជាចង់លុបមុខម្ហូបនេះមែនទេ?')) {
      try {
        await api.delete(`/menus/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting menu:', error);
        alert(error.response?.data?.detail || 'មានបញ្ហាក្នុងការលុបមុខម្ហូប។');
      }
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('តើអ្នកពិតជាចង់លុបប្រភេទនេះមែនទេ?')) {
      try {
        await api.delete(`/categories/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert(error.response?.data?.detail || 'មានបញ្ហាក្នុងការលុបប្រភេទ។');
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Menus & Categories</h1>
        
        <div className="bg-gray-200 p-1 rounded-lg flex gap-1">
          <button 
            onClick={() => setActiveTab('menus')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'menus' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Manage Menus
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'categories' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Manage Categories
          </button>
        </div>
      </div>

      {activeTab === 'menus' ? (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex-1 flex flex-col">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Search menus..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
            <button onClick={() => openMenuModal()} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
              <Plus size={20} /> Add Menu
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div></div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-white sticky top-0 border-b z-10">
                  <tr className="text-gray-500 text-sm">
                    <th className="p-4 font-medium">Image</th>
                    <th className="p-4 font-medium">Menu Name</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map((menu) => (
                    <tr key={menu.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                          {menu.image ? <img src={`http://127.0.0.1:8000${menu.image}`} alt={menu.name} className="object-cover w-full h-full" /> : <span className="text-gray-400 text-xs">N/A</span>}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-gray-800">{menu.name}</td>
                      <td className="p-4 text-gray-600"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{menu.category?.name || 'Uncategorized'}</span></td>
                      <td className="p-4 font-bold text-orange-600">${menu.price.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => openMenuModal(menu)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18} /></button>
                        <button onClick={() => handleDeleteMenu(menu.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex-1 flex flex-col">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Search categories..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
            <button onClick={() => openCategoryModal()} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
              <Plus size={20} /> Add Category
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div></div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-white sticky top-0 border-b z-10">
                  <tr className="text-gray-500 text-sm">
                    <th className="p-4 font-medium">Icon</th>
                    <th className="p-4 font-medium">Category Name</th>
                    <th className="p-4 font-medium">Description</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                          <Layers size={20} />
                        </div>
                      </td>
                      <td className="p-4 font-medium text-gray-800">{cat.name}</td>
                      <td className="p-4 text-gray-500">{cat.description || 'N/A'}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => openCategoryModal(cat)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18} /></button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Menu Modal */}
      {isMenuModalOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[32rem] relative">
            <button onClick={() => setIsMenuModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
              {isMenuEditMode ? 'Edit Menu' : 'Add New Menu'}
            </h2>
            <form onSubmit={handleSaveMenu} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu Image</label>
                <input type="file" accept="image/*" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500" onChange={(e) => setImageFile(e.target.files[0])} />
                {!isMenuEditMode && <p className="text-xs text-orange-600 mt-1">✨ If no image is selected, an AI image will be auto-generated.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu Name</label>
                <input type="text" required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500" value={menuFormData.name} onChange={(e) => setMenuFormData({...menuFormData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input type="number" step="0.01" required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500" value={menuFormData.price} onChange={(e) => setMenuFormData({...menuFormData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500" value={menuFormData.category_id} onChange={(e) => setMenuFormData({...menuFormData, category_id: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                  <button 
                    type="button" 
                    onClick={() => handleGenerateDescription('menu')}
                    disabled={isGeneratingDesc || !menuFormData.name}
                    className="text-xs flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
                  >
                    {isGeneratingDesc ? <div className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div> : '✨'} Generate AI
                  </button>
                </div>
                <textarea rows="3" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500" value={menuFormData.description} onChange={(e) => setMenuFormData({...menuFormData, description: e.target.value})}></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsMenuModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">Save Menu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[32rem] relative">
            <button onClick={() => setIsCategoryModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
              {isCategoryEditMode ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleNextCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input type="text" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500" value={categoryFormData.name} onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                  <button 
                    type="button" 
                    onClick={() => handleGenerateDescription('category')}
                    disabled={isGeneratingDesc || !categoryFormData.name}
                    className="text-xs flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
                  >
                    {isGeneratingDesc ? <div className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div> : '✨'} Generate AI
                  </button>
                </div>
                <textarea rows="3" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500" value={categoryFormData.description} onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
                  {isCategoryEditMode ? 'Save Category' : 'Next'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Options Modal */}
      {isCategoryOptionsModalOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[32rem] relative">
            <button onClick={() => handleCategoryOption('cancel')} disabled={isCreatingCategory} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">How to add products?</h2>
            <p className="text-gray-600 mb-6 text-sm">Choose how you want to populate the new category <strong>"{categoryFormData.name}"</strong>.</p>
            
            <div className="space-y-4">
              {suggestedProducts.length > 0 ? (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-3">Suggested Products (Auto Add)</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {suggestedProducts.map(prod => (
                      <div key={prod} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id={`chk-${prod.replace(/\s+/g, '-')}`} 
                          checked={selectedSuggestedProducts.includes(prod)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSuggestedProducts([...selectedSuggestedProducts, prod]);
                            } else {
                              setSelectedSuggestedProducts(selectedSuggestedProducts.filter(p => p !== prod));
                            }
                          }}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 cursor-pointer" 
                        />
                        <label htmlFor={`chk-${prod.replace(/\s+/g, '-')}`} className="text-sm text-gray-700 cursor-pointer select-none">{prod}</label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <button onClick={() => handleCategoryOption('generate')} disabled={selectedSuggestedProducts.length === 0 || isCreatingCategory} className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 font-medium text-sm transition-colors flex items-center justify-center">
                      {isCreatingCategory ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating...
                        </span>
                      ) : 'Add Selected Products'}
                    </button>
                    <button onClick={handleGenerateMore} disabled={isGenerating || isCreatingCategory} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-100 font-medium text-sm transition-colors disabled:opacity-50">
                      {isGenerating ? 'Generating...' : 'Generate More with AI'}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => handleCategoryOption('generate')} disabled={isCreatingCategory} className="w-full text-left p-4 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors flex flex-col disabled:opacity-50">
                  <span className="font-bold text-gray-800 flex items-center gap-2">
                    {isCreatingCategory && <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>}
                    {isCreatingCategory ? 'Creating category...' : 'Generate Products with AI'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">Automatically generate relevant products based on the category name.</span>
                </button>
              )}

              {suggestedProducts.length > 0 && <div className="text-center text-sm text-gray-400 font-medium my-1">OR</div>}

              <button onClick={() => handleCategoryOption('empty')} disabled={isCreatingCategory} className="w-full text-left p-4 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors flex flex-col disabled:opacity-50">
                <span className="font-bold text-gray-800 flex items-center gap-2">
                  {isCreatingCategory && <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>}
                  {isCreatingCategory ? 'Creating category...' : 'Create Empty Category'}
                </span>
                <span className="text-xs text-gray-500 mt-1">Create the category now and add products later.</span>
              </button>

              <div className="w-full text-left p-4 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors flex flex-col">
                <div className="flex justify-between items-center w-full mb-2">
                  <span className="font-bold text-gray-800">Import from Existing Types</span>
                  <button 
                    onClick={() => handleCategoryOption('import')} 
                    disabled={!selectedImportCategory || isCreatingCategory}
                    className="bg-orange-600 text-white px-3 py-1 text-sm rounded-md hover:bg-orange-700 disabled:bg-gray-300 flex items-center gap-2"
                  >
                    {isCreatingCategory && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    {isCreatingCategory ? 'Importing...' : 'Import'}
                  </button>
                </div>
                <span className="text-xs text-gray-500 mb-2">Duplicate products from an existing category.</span>
                <select 
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500 text-sm"
                  value={selectedImportCategory}
                  onChange={(e) => setSelectedImportCategory(e.target.value)}
                  disabled={isCreatingCategory}
                >
                  <option value="">-- Select Category to Import From --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <button onClick={() => handleCategoryOption('manual')} disabled={isCreatingCategory} className="w-full text-left p-4 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors flex flex-col disabled:opacity-50">
                <span className="font-bold text-gray-800 flex items-center gap-2">
                  {isCreatingCategory && <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>}
                  {isCreatingCategory ? 'Creating category...' : 'Add Products Manually'}
                </span>
                <span className="text-xs text-gray-500 mt-1">Create category and immediately open the form to add a new product.</span>
              </button>
            </div>

            <div className="pt-6 flex justify-end">
              <button onClick={() => handleCategoryOption('cancel')} disabled={isCreatingCategory} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors w-full disabled:opacity-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
