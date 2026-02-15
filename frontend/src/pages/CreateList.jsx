import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

import { Plus, Trash2, Search } from 'lucide-react';

const CreateList = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [expectedPrice, setExpectedPrice] = useState('');
    const [duration, setDuration] = useState(24); // Hours
    const [items, setItems] = useState([{ name: '', quantity: 1, unit: 'kg', product: null, quality: 'Standard', brandPreference: '', specifications: '' }]);
    const [masterProducts, setMasterProducts] = useState([]);
    const [suggestions, setSuggestions] = useState({});

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/products');
                setMasterProducts(data);
            } catch (error) {
                console.error('Error fetching master products:', error);
            }
        };
        fetchProducts();
    }, []);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        if (field === 'name') {
            if (value.length > 1) {
                const filtered = masterProducts.filter(p =>
                    p.name.toLowerCase().includes(value.toLowerCase()) ||
                    p.brand?.toLowerCase().includes(value.toLowerCase())
                ).slice(0, 5);
                setSuggestions({ ...suggestions, [index]: filtered });
            } else {
                const newSugg = { ...suggestions };
                delete newSugg[index];
                setSuggestions(newSugg);
            }
            // Clear linked product if name is manually changed
            newItems[index].product = null;
        }

        setItems(newItems);
    };

    const selectSuggestion = (index, product) => {
        const newItems = [...items];
        newItems[index].name = product.name;
        newItems[index].unit = product.unit || 'unit';
        newItems[index].product = product._id;

        // Populate brand if it exists in master data (though schema only tracks name/qty/unit/product)
        // We'll keep the name as is but the product ID will link it to the master data

        setItems(newItems);

        setSuggestions(prev => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
    };

    const addItem = () => {
        setItems([...items, { name: '', quantity: 1, unit: 'kg', product: null, quality: 'Standard', brandPreference: '', specifications: '' }]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        const newSugg = { ...suggestions };
        delete newSugg[index];
        setSuggestions(newSugg);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            // Format items to match Backend expectation
            const formattedItems = items.map(item => ({
                name: item.name,
                quantity: item.quantity.toString(),
                unit: item.unit,
                product: item.product,
                quality: item.quality,
                brandPreference: item.brandPreference,
                specifications: item.specifications
            }));

            const expiredAt = new Date();
            expiredAt.setHours(expiredAt.getHours() + parseInt(duration));

            await axios.post('http://localhost:5000/api/lists', {
                title,
                expectedPrice: parseFloat(expectedPrice),
                expiredAt,
                items: formattedItems
            }, config);
            navigate('/');
        } catch (error) {
            console.error('Error creating list:', error);
            alert('Failed to create list');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="container max-w-2xl px-4 py-8 mx-auto">
                <h1 className="mb-6 text-2xl font-bold text-gray-800">Create New Grocery List</h1>
                <div className="p-6 bg-white rounded shadow">
                    <form onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            <div className="md:col-span-1">
                                <label className="block mb-2 text-sm font-bold text-gray-700">List Title</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Monthly Groceries"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-bold text-gray-700">Expected Price (₹)</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Total Budget"
                                    value={expectedPrice}
                                    onChange={(e) => setExpectedPrice(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-bold text-gray-700">Duration (Hours)</label>
                                <select
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                >
                                    <option value="12">12 Hours</option>
                                    <option value="24">24 Hours</option>
                                    <option value="48">48 Hours</option>
                                    <option value="72">3 Days</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="mb-2 text-lg font-semibold text-gray-700">Items</h3>
                            <p className="mb-4 text-xs text-gray-500">Specify what you need and the quality you expect.</p>

                            {items.map((item, index) => (
                                <div key={index} className="relative mb-6 p-4 border rounded-xl bg-gray-50/30">
                                    <div className="flex flex-wrap items-end gap-3">
                                        <div className="relative flex-grow min-w-[200px]">
                                            <label className="block text-xs text-gray-500 uppercase font-black tracking-tighter mb-1">Item Name</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 border rounded-xl"
                                                    value={item.name}
                                                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                    autoComplete="off"
                                                    required
                                                />
                                                {item.product && (
                                                    <span className="absolute text-[10px] text-green-600 top-[-15px] right-0">Linked to Catalog</span>
                                                )}
                                            </div>

                                            {/* Autocomplete Suggestions */}
                                            {suggestions[index] && suggestions[index].length > 0 && (
                                                <div className="absolute z-20 w-80 mt-2 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl shadow-gray-300/50 overflow-hidden transform transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-2">
                                                    <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Catalog Matches</p>
                                                    </div>
                                                    <div className="max-h-64 overflow-y-auto">
                                                        {suggestions[index].map((msg) => (
                                                            <div
                                                                key={msg._id}
                                                                className="flex items-center px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors group border-b border-gray-50 last:border-0"
                                                                onClick={() => selectSuggestion(index, msg)}
                                                            >
                                                                <div className="w-12 h-12 flex-shrink-0 mr-4">
                                                                    {msg.image ? (
                                                                        <img src={msg.image} alt="" className="w-full h-full object-cover rounded-xl shadow-sm bg-gray-50 group-hover:scale-105 transition-transform" />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-[8px] font-black text-gray-400 uppercase p-1 text-center">No Img</div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <p className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{msg.name}</p>
                                                                    <div className="flex items-center mt-0.5 space-x-2">
                                                                        <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-black uppercase">{msg.brand || 'Generic'}</span>
                                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Units: {msg.unit}</span>
                                                                    </div>
                                                                </div>
                                                                <Plus size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-20">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Qty</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-700"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Unit</label>
                                            <select
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-700"
                                                value={item.unit}
                                                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                            >
                                                <option value="kg">kg</option>
                                                <option value="gram">gram</option>
                                                <option value="liter">liter</option>
                                                <option value="packet">packet</option>
                                                <option value="box">box</option>
                                                <option value="unit">unit</option>
                                                <option value="dozen">dozen</option>
                                            </select>
                                        </div>
                                        <div className="w-32">
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Quality</label>
                                            <select
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-700"
                                                value={item.quality}
                                                onChange={(e) => handleItemChange(index, 'quality', e.target.value)}
                                            >
                                                <option value="Premium">Premium</option>
                                                <option value="Standard">Standard</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Grade A">Grade A</option>
                                                <option value="Organic">Organic</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Additional Clarity Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-white/50 p-3 rounded-xl border border-dashed border-gray-200">
                                        <div>
                                            <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 ml-1">Brand Preference</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Tata, Fortune, or 'Any Good Brand'"
                                                className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-blue-300 transition-all"
                                                value={item.brandPreference || ''}
                                                onChange={(e) => handleItemChange(index, 'brandPreference', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 ml-1">Specific Instructions / Notes</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Small grains, Green color only, etc."
                                                className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-amber-300 transition-all"
                                                value={item.specifications || ''}
                                                onChange={(e) => handleItemChange(index, 'specifications', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="absolute top-2 right-2 p-2 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                                <Plus size={16} className="mr-1" /> Add New Item
                            </button>
                        </div>

                        <div className="mt-8 text-right">
                            <button
                                type="submit"
                                className="px-6 py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 shadow-md transition-all active:scale-95"
                            >
                                Save & Share List
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateList;
