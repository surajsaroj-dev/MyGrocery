import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Trash2, Plus, Edit, Power, CheckCircle, CircleSlash } from 'lucide-react';

const AdminUsers = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'buyer'
    });

    const fetchUsers = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get('https://mygrocery-bcw8.onrender.com/api/users', config);
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleToggleStatus = async (id) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.put(`https://mygrocery-bcw8.onrender.com/api/users/${id}/status`, {}, config);
            fetchUsers();
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Failed to toggle user status');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };

            const payload = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
            };

            if (!editMode) {
                payload.password = formData.password;
            }

            if (editMode) {
                await axios.put(`https://mygrocery-bcw8.onrender.com/api/users/${currentId}`, payload, config);
            } else {
                await axios.post('https://mygrocery-bcw8.onrender.com/api/users', payload, config);
            }

            setFormData({ name: '', email: '', password: '', role: 'buyer' });
            setEditMode(false);
            setCurrentId(null);
            fetchUsers();
        } catch (error) {
            console.error(editMode ? 'Error updating user:' : 'Error adding user:', error);
            alert(editMode ? 'Failed to update user' : 'Failed to add user');
        }
    };

    const handleEdit = (userData) => {
        setEditMode(true);
        setCurrentId(userData._id);
        setFormData({
            name: userData.name,
            email: userData.email,
            password: '',
            role: userData.role
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Permanent delete this user? (Warning: Better to use Inactive instead)')) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                await axios.delete(`https://mygrocery-bcw8.onrender.com/api/users/${id}`, config);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container px-4 py-8 mx-auto">
                <h1 className="mb-8 text-3xl font-bold text-gray-800">Manage Users</h1>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="p-8 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 h-fit">
                        <h2 className="mb-6 text-xl font-black text-gray-800">{editMode ? 'Edit User' : 'Add New User'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest">Name</label>
                                <input name="name" type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-semibold" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest">Email</label>
                                <input name="email" type="email" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-semibold" value={formData.email} onChange={handleChange} required />
                            </div>
                            {!editMode && (
                                <div>
                                    <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
                                    <input name="password" type="password" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-semibold" value={formData.password} onChange={handleChange} required={!editMode} />
                                </div>
                            )}
                            <div>
                                <label className="block mb-1.5 text-xs font-black text-gray-400 uppercase tracking-widest">Role</label>
                                <select name="role" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-semibold" value={formData.role} onChange={handleChange}>
                                    <option value="buyer">Buyer</option>
                                    <option value="vendor">Vendor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <button type="submit" className={`flex items-center justify-center w-full px-6 py-3 mt-4 text-sm font-black text-white rounded-xl shadow-lg transition-all active:scale-[0.98] ${editMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}`}>
                                    {editMode ? 'Update User' : <><Plus size={20} className="mr-2" /> Add User</>}
                                </button>
                                {editMode && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditMode(false);
                                            setFormData({ name: '', email: '', password: '', role: 'buyer' });
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

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-black text-gray-800">Existing Users</h2>
                            </div>
                            {loading ? (
                                <div className="p-6 text-center text-gray-500">Loading users...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Name</th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Email</th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {users.map((u) => (
                                                <tr key={u._id} className={`hover:bg-gray-50/50 transition-colors ${!u.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-gray-800">{u.name}</div>
                                                        {!u.isActive && <span className="text-[10px] font-black uppercase text-red-500 tracking-tighter">Deactivated</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{u.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-wide ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                                                            u.role === 'vendor' ? 'bg-orange-100 text-orange-600' :
                                                                'bg-blue-100 text-blue-600'
                                                            }`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${u.isActive !== false ? 'text-green-600' : 'text-red-500'}`}>
                                                            {u.isActive !== false ? <CheckCircle size={14} /> : <CircleSlash size={14} />}
                                                            {u.isActive !== false ? 'Active' : 'Inactive'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleEdit(u)} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit User">
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleStatus(u._id)}
                                                                className={`p-2 rounded-xl transition-all ${u.isActive !== false ? 'text-orange-400 hover:text-orange-600 hover:bg-orange-50' : 'text-green-400 hover:text-green-600 hover:bg-green-50'}`}
                                                                title={u.isActive !== false ? 'Deactivate' : 'Activate'}
                                                            >
                                                                <Power size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(u._id)}
                                                                className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                                title="Permanent Delete"
                                                            >
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

export default AdminUsers;
