import { useState, useEffect, useContext } from 'react';
import api, { API_URL } from '../api/config';
import AuthContext from '../context/AuthContext';

import { Trash2, Plus } from 'lucide-react';

const AdminProduct = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        brand: '',
        unit: '',
        description: '',
        image: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/api/products'),
                api.get('/api/categories')
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        if (e.target.name === 'image') {
            setImageFile(e.target.files[0]);
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const data = new FormData();
            data.append('name', formData.name);
            data.append('category', formData.category);
            data.append('brand', formData.brand);
            data.append('unit', formData.unit);
            data.append('description', formData.description);
            if (imageFile) {
                data.append('image', imageFile);
            }

            if (editMode) {
                await api.put(`/api/products/${currentId}`, data, config);
            } else {
                await api.post('/api/products', data, config);
            }

            setFormData({ name: '', category: '', brand: '', unit: '', description: '', image: '' });
            setImageFile(null);
            setEditMode(false);
            setCurrentId(null);
            fetchData();
        } catch (error) {
            console.error(editMode ? 'Error updating product:' : 'Error adding product:', error);
            alert(editMode ? 'Failed to update product' : 'Failed to add product');
        }
    };

    const handleEdit = (product) => {
        setEditMode(true);
        setCurrentId(product._id);
        setFormData({
            name: product.name,
            category: product.category?._id || '',
            brand: product.brand || '',
            unit: product.unit,
            description: product.description || '',
            image: '' // Reset file input
        });
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this product?')) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                await api.delete(`/api/products/${id}`, config);
                fetchData();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="container px-4 py-8 mx-auto">
                <h1 className="mb-8 text-3xl font-bold text-gray-800 tracking-tight">Master Product Catalog</h1>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Add/Edit Product Form */}
                    <div className="p-8 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 h-fit">
                        <h2 className="mb-6 text-xl font-black text-gray-800">{editMode ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest">Name</label>
                                <input name="name" type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-semibold" value={formData.name} onChange={handleChange} required placeholder="e.g. Basmati Rice" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest">Category</label>
                                    <select name="category" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-semibold" value={formData.category} onChange={handleChange} required>
                                        <option value="">Select</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest">Unit</label>
                                    <input name="unit" type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-semibold" value={formData.unit} onChange={handleChange} required placeholder="kg" />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest">Brand</label>
                                <input name="brand" type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-semibold" value={formData.brand} onChange={handleChange} placeholder="e.g. Daawat" />
                            </div>
                            <div>
                                <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest">Product Image</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-xl hover:border-blue-400 transition-colors cursor-pointer group relative">
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                <span>Upload a file</span>
                                                <input name="image" type="file" className="sr-only" onChange={handleChange} accept="image/*" />
                                            </label>
                                            <p className="pl-1 text-gray-400 font-bold">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-400 font-bold">PNG, JPG, WebP up to 10MB</p>
                                        {imageFile && (
                                            <p className="text-xs text-green-600 font-black mt-2">Selected: {imageFile.name}</p>
                                        )}
                                        {editMode && !imageFile && <p className="text-xs text-gray-400 mt-2">Keep existing image</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className={`flex items-center justify-center w-full px-6 py-3 mt-4 text-sm font-black text-white rounded-xl shadow-lg transition-all active:scale-[0.98] ${editMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}`}>
                                    {editMode ? 'Update Product' : <><Plus size={20} className="mr-2" /> Add to Catalog</>}
                                </button>
                                {editMode && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditMode(false);
                                            setFormData({ name: '', category: '', brand: '', unit: '', description: '', image: '' });
                                            setImageFile(null);
                                            setCurrentId(null);
                                        }}
                                        className="flex items-center justify-center px-4 py-3 mt-4 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Product List */}
                    <div className="lg:col-span-2">
                        <div className="p-0 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                            <div className="p-6 bg-gray-50 border-b border-gray-100">
                                <h2 className="text-xl font-black text-gray-800">Product Inventory</h2>
                            </div>
                            {loading ? <div className="p-20 text-center font-bold text-gray-400">Loading catalog...</div> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-white">
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left border-b border-gray-100">Product</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left border-b border-gray-100">Category</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left border-b border-gray-100">Unit</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left border-b border-gray-100">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-left">
                                            {products.map((p) => (
                                                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-12 h-12 flex-shrink-0 mr-3">
                                                                {p.image ? (
                                                                    <img src={`${API_URL}/${p.image}`} className="w-full h-full object-cover rounded-xl shadow-sm bg-gray-100" />
                                                                ) : (
                                                                    <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-[8px] font-black text-gray-300">NO IMG</div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-800 leading-none">{p.name}</p>
                                                                <p className="text-xs text-blue-600 font-semibold mt-1">{p.brand || 'No Brand'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                                                        <span className="bg-gray-100 px-2 py-1 rounded-lg text-xs font-bold">{p.category?.name}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{p.unit}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleEdit(p)} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                                Edit
                                                            </button>
                                                            <button onClick={() => handleDelete(p._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProduct;
