import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

import { Trash2, Plus, Edit2, Eye, EyeOff } from 'lucide-react';

const AdminAdvertisements = () => {
    const { user } = useContext(AuthContext);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        link: '',
        position: 'banner',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
    });

    useEffect(() => {
        if (!user) return;
        fetchAds();
    }, [user?.token]);

    const fetchAds = async () => {
        if (!user) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get('http://localhost:5000/api/advertisements/all', config);
            setAds(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching ads:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };

            if (editingAd) {
                await axios.put(`http://localhost:5000/api/advertisements/${editingAd._id}`, formData, config);
            } else {
                await axios.post('http://localhost:5000/api/advertisements', formData, config);
            }

            setShowForm(false);
            setEditingAd(null);
            setFormData({
                title: '',
                description: '',
                image: '',
                link: '',
                position: 'banner',
                startDate: new Date().toISOString().split('T')[0],
                endDate: ''
            });
            fetchAds();
        } catch (error) {
            console.error('Error saving ad:', error);
            console.error('Error response:', error.response?.data);
            alert(`Failed to save advertisement: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEdit = (ad) => {
        setEditingAd(ad);
        setFormData({
            title: ad.title,
            description: ad.description || '',
            image: ad.image,
            link: ad.link || '',
            position: ad.position,
            startDate: new Date(ad.startDate).toISOString().split('T')[0],
            endDate: new Date(ad.endDate).toISOString().split('T')[0]
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this advertisement?')) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.delete(`http://localhost:5000/api/advertisements/${id}`, config);
            fetchAds();
        } catch (error) {
            console.error('Error deleting ad:', error);
            alert('Failed to delete advertisement');
        }
    };

    const toggleActive = async (ad) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.put(`http://localhost:5000/api/advertisements/${ad._id}`,
                { ...ad, isActive: !ad.isActive },
                config
            );
            fetchAds();
        } catch (error) {
            console.error('Error toggling ad status:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="container px-4 py-8 mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Manage Advertisements</h1>
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingAd(null);
                            setFormData({
                                title: '',
                                description: '',
                                image: '',
                                link: '',
                                position: 'banner',
                                startDate: new Date().toISOString().split('T')[0],
                                endDate: ''
                            });
                        }}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                        <Plus size={20} className="mr-2" />
                        {showForm ? 'Cancel' : 'Create Ad'}
                    </button>
                </div>

                {showForm && (
                    <div className="p-6 mb-8 bg-white rounded shadow">
                        <h2 className="mb-4 text-xl font-bold">{editingAd ? 'Edit' : 'Create'} Advertisement</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-gray-700">Title *</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-gray-700">Position *</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        required
                                    >
                                        <option value="banner">Banner</option>
                                        <option value="sidebar">Sidebar</option>
                                        <option value="popup">Popup</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block mb-2 text-sm font-bold text-gray-700">Description</label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded"
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-gray-700">Image URL *</label>
                                    <input
                                        type="url"
                                        className="w-full px-3 py-2 border rounded"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-gray-700">Link URL</label>
                                    <input
                                        type="url"
                                        className="w-full px-3 py-2 border rounded"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-gray-700">Start Date *</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border rounded"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-gray-700">End Date *</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border rounded"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2 mt-4 text-white bg-green-600 rounded hover:bg-green-700"
                            >
                                {editingAd ? 'Update' : 'Create'} Advertisement
                            </button>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {ads.map((ad) => (
                            <div key={ad._id} className="overflow-hidden bg-white rounded shadow">
                                <img src={ad.image} alt={ad.title} className="object-cover w-full h-48" />
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-bold">{ad.title}</h3>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded ${ad.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {ad.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="mb-2 text-sm text-gray-600">{ad.description}</p>
                                    <div className="mb-2 text-xs text-gray-500">
                                        <p>Position: <span className="font-semibold">{ad.position}</span></p>
                                        <p>Start: {new Date(ad.startDate).toLocaleDateString()}</p>
                                        <p>End: {new Date(ad.endDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleActive(ad)}
                                            className="flex items-center px-3 py-1 text-sm text-white bg-yellow-600 rounded hover:bg-yellow-700"
                                        >
                                            {ad.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(ad)}
                                            className="flex items-center px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ad._id)}
                                            className="flex items-center px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAdvertisements;
