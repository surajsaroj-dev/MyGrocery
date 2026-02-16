import { useState, useEffect, useContext } from 'react';
import api from '../api/config';
import AuthContext from '../context/AuthContext';
import { Trash2, Plus, Edit, Power, CheckCircle, CircleSlash } from 'lucide-react';

const AdminUsers = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Filter states
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'buyer'
    });

    const fetchUsers = async () => {
        if (!user || !user.token) return;
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
                params: {
                    keyword,
                    page,
                    sortBy,
                    sortOrder
                }
            };
            const { data } = await api.get('/api/users', config);
            setUsers(data.users || []);
            setPages(data.pages || 1);
            setTotal(data.total || 0);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [user, keyword, page, sortBy, sortOrder]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleToggleStatus = async (id) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await api.put(`/api/users/${id}/status`, {}, config);
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
                await api.put(`/api/users/${currentId}`, payload, config);
            } else {
                await api.post('/api/users', payload, config);
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
                await api.delete(`/api/users/${id}`, config);
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
                            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-black text-gray-800">Existing Users</h2>
                                    <p className="text-xs font-bold text-gray-500 mt-1">Total: {total} users</p>
                                </div>
                                <div className="relative flex-grow max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={keyword}
                                        onChange={(e) => {
                                            setKeyword(e.target.value);
                                            setPage(1); // Reset to first page on search
                                        }}
                                    />
                                </div>
                            </div>
                            {loading ? (
                                <div className="p-6 text-center text-gray-500">Loading users...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th
                                                    className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-600"
                                                    onClick={() => {
                                                        setSortBy('name');
                                                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                                    }}
                                                >
                                                    Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-600"
                                                    onClick={() => {
                                                        setSortBy('email');
                                                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                                    }}
                                                >
                                                    Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-600"
                                                    onClick={() => {
                                                        setSortBy('role');
                                                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                                    }}
                                                >
                                                    Role {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-600"
                                                    onClick={() => {
                                                        setSortBy('createdAt');
                                                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                                    }}
                                                >
                                                    Joined {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {users?.map((u) => (
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
                                                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                                                        {new Date(u.createdAt).toLocaleDateString()}
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

                            {/* Pagination Controls */}
                            {!loading && pages > 1 && (
                                <div className="p-6 border-t border-gray-100 flex items-center justify-center gap-2">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(page - 1)}
                                        className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 font-bold"
                                    >
                                        Prev
                                    </button>
                                    {[...Array(pages).keys()].map((p) => (
                                        <button
                                            key={p + 1}
                                            onClick={() => setPage(p + 1)}
                                            className={`w-10 h-10 rounded-xl font-bold transition-all ${page === p + 1 ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-gray-600'}`}
                                        >
                                            {p + 1}
                                        </button>
                                    ))}
                                    <button
                                        disabled={page === pages}
                                        onClick={() => setPage(page + 1)}
                                        className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 font-bold"
                                    >
                                        Next
                                    </button>
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
