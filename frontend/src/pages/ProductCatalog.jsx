import { useState, useEffect, useContext } from 'react';
import api, { API_URL } from '../api/config';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

import { ShoppingBag, Plus, Filter, Search, Tag, CheckCircle, Package, ArrowRight } from 'lucide-react';

const ProductCatalog = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [lists, setLists] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [addingToList, setAddingToList] = useState(null); // ID of product being added
    const [selectedListId, setSelectedListId] = useState('');
    const [qty, setQty] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
                const [prodRes, catRes, listRes] = await Promise.all([
                    api.get('/api/products'),
                    api.get('/api/categories'),
                    user?.role === 'buyer' ? api.get('/api/lists', config) : Promise.resolve({ data: [] })
                ]);
                setProducts(prodRes.data);
                setFilteredProducts(prodRes.data);
                setCategories(catRes.data);
                setLists(listRes.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching catalog data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        let result = products;
        if (selectedCategory) {
            result = result.filter(p => p.category?._id === selectedCategory);
        }
        if (selectedBrand) {
            result = result.filter(p => p.brand === selectedBrand);
        }
        if (searchTerm) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredProducts(result);
    }, [selectedCategory, selectedBrand, searchTerm, products]);

    const handleAddToList = async (e) => {
        e.preventDefault();
        if (!selectedListId) {
            alert('Please select a list first');
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await api.post(`/api/lists/${selectedListId}/items`, {
                productId: addingToList._id,
                quantity: qty,
                unit: addingToList.unit
            }, config);

            alert(`${addingToList.name} added to list!`);
            setAddingToList(null);
            setQty(1);
        } catch (error) {
            console.error('Error adding to list:', error);
            alert('Failed to add item to list');
        }
    };

    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading Master Catalog...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            <div className="container px-4 py-8 mx-auto xl:max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">Master Catalog</h1>
                        <p className="text-gray-500 font-medium">Browse thousands of products and brands curated for your region.</p>
                    </div>
                    {user?.role === 'buyer' && (
                        <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-xl shadow-blue-100 flex items-center space-x-4">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-blue-100">Quick Switch</p>
                                <Link to="/" className="font-bold flex items-center hover:underline">
                                    View Your Lists <ArrowRight size={16} className="ml-1" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                <Search className="mr-2" size={14} /> Search Items
                            </h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Milk, Bread, Nescafe..."
                                    className="w-full bg-gray-50 p-3 rounded-2xl border-none text-sm font-bold focus:ring-2 focus:ring-blue-100"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                <Filter className="mr-2" size={14} /> Categories
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedCategory('')}
                                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === '' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    All Products
                                </button>
                                {categories.map(c => (
                                    <button
                                        key={c._id}
                                        onClick={() => setSelectedCategory(c._id)}
                                        className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === c._id ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                <Tag className="mr-2" size={14} /> Top Brands
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedBrand('')}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${selectedBrand === '' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    All
                                </button>
                                {brands.map(brand => (
                                    <button
                                        key={brand}
                                        onClick={() => setSelectedBrand(brand)}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${selectedBrand === brand ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        {brand}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="lg:col-span-3">
                        {filteredProducts.length > 0 ? (
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredProducts.map(product => (
                                    <div key={product._id} className="bg-white group rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300 flex flex-col">
                                        <div className="relative aspect-square bg-gray-50 rounded-2xl mb-6 overflow-hidden flex items-center justify-center p-4">
                                            {product.image ? (
                                                <img src={`${API_URL}/${product.image}`} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="text-[10px] font-black text-gray-300 uppercase">Image Coming Soon</div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-black text-gray-900 leading-tight">{product.name}</h3>
                                                <span className="bg-green-100 text-green-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Available</span>
                                            </div>
                                            <p className="text-xs text-blue-600 font-bold mb-4">{product.brand || 'Generic'} • {product.unit}</p>
                                        </div>
                                        {user?.role === 'buyer' && (
                                            <button
                                                onClick={() => setAddingToList(product)}
                                                className="w-full py-3 bg-gray-50 text-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all group-hover:shadow-lg"
                                            >
                                                Add to List
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-20 rounded-3xl border border-dashed border-gray-200 text-center">
                                <Package size={48} className="mx-auto mb-4 text-gray-200" />
                                <h3 className="text-xl font-bold text-gray-800">No Matched Products</h3>
                                <p className="text-gray-500">Try adjusting your filters or search term.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add to List Modal Overlay */}
            {addingToList && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <h2 className="text-2xl font-black text-gray-900 mb-6">Select Grocery List</h2>
                        <form onSubmit={handleAddToList}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Target List</label>
                                    <select
                                        required
                                        className="w-full bg-gray-50 p-4 rounded-2xl border-none text-sm font-bold appearance-none"
                                        value={selectedListId}
                                        onChange={(e) => setSelectedListId(e.target.value)}
                                    >
                                        <option value="">Choose a list...</option>
                                        {lists.filter(l => l.status === 'open').map(list => (
                                            <option key={list._id} value={list._id}>{list.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantity</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={qty}
                                            onChange={(e) => setQty(e.target.value)}
                                            className="w-full bg-gray-50 p-4 rounded-2xl border-none text-sm font-bold"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-end">
                                        <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 font-bold text-xs text-center border border-blue-100">
                                            Unit: {addingToList.unit}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setAddingToList(null)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100"
                                >
                                    Confirm <ArrowRight size={14} className="inline ml-1" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCatalog;
