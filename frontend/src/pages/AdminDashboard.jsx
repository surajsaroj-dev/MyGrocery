import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

import { Trash2 } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);

    const fetchUsers = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get('http://localhost:5000/api/users', config);
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get('http://localhost:5000/api/analytics', config);
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchAnalytics();
    }, [user.token]);

    const handleVerifyUser = async (id) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.put(`http://localhost:5000/api/users/${id}/verify`, {}, config);
            fetchUsers();
        } catch (error) {
            console.error('Error verifying user:', error);
            alert('Failed to verify user');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                await axios.delete(`http://localhost:5000/api/users/${id}`, config);
                setUsers(users.filter(u => u._id !== id));
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="container px-4 py-8 mx-auto">
                <h1 className="mb-8 text-3xl font-bold text-gray-800">Admin Dashboard</h1>

                {analytics && (
                    <div className="grid gap-6 mb-8 md:grid-cols-4">
                        <div className="p-6 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded shadow">
                            <h3 className="text-lg font-semibold opacity-80">Total Sales</h3>
                            <p className="text-3xl font-bold">${analytics.totalSales.toLocaleString()}</p>
                        </div>
                        <div className="p-6 text-white bg-gradient-to-r from-green-500 to-green-600 rounded shadow">
                            <h3 className="text-lg font-semibold opacity-80">Total Orders</h3>
                            <p className="text-3xl font-bold">{analytics.totalOrders}</p>
                        </div>
                        <div className="p-6 text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded shadow">
                            <h3 className="text-lg font-semibold opacity-80">Total Users</h3>
                            <p className="text-3xl font-bold">{analytics.totalUsers}</p>
                            <p className="text-sm opacity-70">Buyers: {analytics.userBreakdown?.buyers} | Vendors: {analytics.userBreakdown?.vendors}</p>
                        </div>
                        <div className="p-6 text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded shadow">
                            <h3 className="text-lg font-semibold opacity-80">Products</h3>
                            <p className="text-3xl font-bold">{analytics.totalProducts}</p>
                        </div>
                        <div className="p-6 text-white bg-gradient-to-r from-red-600 to-pink-600 rounded shadow col-span-2 md:col-span-1">
                            <h3 className="text-lg font-semibold opacity-80">Platform Earnings</h3>
                            <p className="text-3xl font-bold">₹{analytics.platformEarnings?.toLocaleString() || 0}</p>
                            <p className="text-[10px] font-black uppercase mt-1 opacity-70 tracking-widest">Taxes & Commissions</p>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 mb-8 md:grid-cols-3">
                    <Link to="/admin/categories" className="p-6 bg-white rounded shadow hover:shadow-md">
                        <h3 className="text-xl font-bold text-blue-600">Manage Categories</h3>
                        <p className="text-gray-600">Create and edit product categories.</p>
                    </Link>
                    <Link to="/admin/products" className="p-6 bg-white rounded shadow hover:shadow-md">
                        <h3 className="text-xl font-bold text-green-600">Manage Products</h3>
                        <p className="text-gray-600">Add products to the master catalog.</p>
                    </Link>
                    <Link to="/admin/orders" className="p-6 bg-white rounded shadow hover:shadow-md">
                        <h3 className="text-xl font-bold text-purple-600">Global Orders</h3>
                        <p className="text-gray-600">Monitor all orders and payments.</p>
                    </Link>
                    <Link to="/admin/advertisements" className="p-6 bg-white rounded shadow hover:shadow-md">
                        <h3 className="text-xl font-bold text-pink-600">Advertisements</h3>
                        <p className="text-gray-600">Manage promotional banners and ads.</p>
                    </Link>
                    <Link to="/admin/transactions" className="p-6 bg-white rounded shadow hover:shadow-md">
                        <h3 className="text-xl font-bold text-orange-600">Transaction Logs</h3>
                        <p className="text-gray-600">Global audit trail for all financial activities.</p>
                    </Link>
                </div>

                <div className="p-6 mb-8 bg-white rounded shadow">
                    <h2 className="mb-4 text-xl font-bold">Pending Vendor Approvals</h2>
                    {users.filter(u => u.role === 'vendor' && !u.isVerified).length === 0 ? (
                        <p className="text-gray-500">No pending approvals.</p>
                    ) : (
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100">Name</th>
                                    <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100">Email</th>
                                    <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.filter(u => u.role === 'vendor' && !u.isVerified).map((user) => (
                                    <tr key={user._id}>
                                        <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">{user.name}</td>
                                        <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">{user.email}</td>
                                        <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                            <button
                                                onClick={() => handleVerifyUser(user._id)}
                                                className="px-3 py-1 text-white bg-green-500 rounded hover:bg-green-600"
                                            >
                                                Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-6 bg-white rounded shadow">
                    <h2 className="mb-4 text-xl font-bold">User Management</h2>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full leading-normal">
                                <thead>
                                    <tr>
                                        <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                                            Name
                                        </th>
                                        <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                                            Email
                                        </th>
                                        <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                                            Role
                                        </th>
                                        <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id}>
                                            <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                                <p className="text-gray-900 whitespace-no-wrap">{u.name}</p>
                                            </td>
                                            <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                                <p className="text-gray-900 whitespace-no-wrap">{u.email}</p>
                                            </td>
                                            <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                                <span className={`relative inline-block px-3 py-1 font-semibold leading-tight text-white rounded-full ${u.role === 'admin' ? 'bg-red-500' : u.role === 'vendor' ? 'bg-purple-500' : 'bg-green-500'}`}>
                                                    <span className="relative">{u.role}</span>
                                                </span>
                                            </td>
                                            <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                                {u._id !== user._id && (
                                                    <button onClick={() => handleDeleteUser(u._id)} className="text-red-600 hover:text-red-900">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
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
    );
};

export default AdminDashboard;
