import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

import { Trash2, Plus, Edit } from 'lucide-react';

const AdminCategory = () => {
    const { user } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/categories');
            setCategories(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            if (image) {
                formData.append('image', image);
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data',
                },
            };

            if (editMode) {
                await axios.put(`http://localhost:5000/api/categories/${currentId}`, formData, config);
            } else {
                await axios.post('http://localhost:5000/api/categories', formData, config);
            }

            setName('');
            setDescription('');
            setImage(null);
            setEditMode(false);
            setCurrentId(null);
            fetchCategories();
        } catch (error) {
            console.error(editMode ? 'Error updating category:' : 'Error adding category:', error);
            alert(editMode ? 'Failed to update category' : 'Failed to add category');
        }
    };

    const handleEdit = (category) => {
        setEditMode(true);
        setCurrentId(category._id);
        setName(category.name);
        setDescription(category.description);
        // Image handling is tricky for file inputs, usually we leave it empty unless they want to change it
        setImage(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this category?')) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                await axios.delete(`http://localhost:5000/api/categories/${id}`, config);
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="container px-4 py-8 mx-auto">
                <h1 className="mb-8 text-3xl font-bold text-gray-800">Manage Categories</h1>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Add/Edit Category Form */}
                    <div className="p-6 bg-white rounded shadow h-fit">
                        <h2 className="mb-4 text-xl font-bold">{editMode ? 'Edit Category' : 'Add New Category'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-bold text-gray-700">Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-bold text-gray-700">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border rounded"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-bold text-gray-700">Category Image</label>
                                <input
                                    type="file"
                                    className="w-full px-3 py-2 border rounded"
                                    onChange={(e) => setImage(e.target.files[0])}
                                    accept="image/*"
                                />
                                {editMode && !image && <p className="text-xs text-gray-500 mt-1">Leave empty to keep existing image</p>}
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className={`flex items-center justify-center w-full px-4 py-2 text-white rounded ${editMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                    {editMode ? 'Update Category' : <><Plus size={20} className="mr-2" /> Add Category</>}
                                </button>
                                {editMode && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditMode(false);
                                            setName('');
                                            setDescription('');
                                            setImage(null);
                                            setCurrentId(null);
                                        }}
                                        className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Category List */}
                    <div className="md:col-span-2">
                        <div className="p-6 bg-white rounded shadow">
                            <h2 className="mb-4 text-xl font-bold">Existing Categories</h2>
                            {loading ? (
                                <div>Loading...</div>
                            ) : (
                                <table className="min-w-full leading-normal">
                                    <thead>
                                        <tr>
                                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Image</th>
                                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Name</th>
                                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Description</th>
                                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((cat) => (
                                            <tr key={cat._id}>
                                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                                    {cat.image && (
                                                        <img
                                                            src={`http://localhost:5000/${cat.image}`}
                                                            alt={cat.name}
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">{cat.name}</td>
                                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">{cat.description}</td>
                                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-900">
                                                            <Edit size={18} />
                                                        </button>
                                                        <button onClick={() => handleDelete(cat._id)} className="text-red-600 hover:text-red-900">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCategory;
