import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import io from 'socket.io-client';
import { Package, Clock, DollarSign, TrendingUp, Bell } from 'lucide-react';

const VendorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newAlert, setNewAlert] = useState(false);

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('http://localhost:5000/api/lists', config);
                setLists(data);

                // Socket setup
                const socket = io('http://localhost:5000');
                socket.on('new_list', (newList) => {
                    setLists(prev => [newList, ...prev]);
                    setNewAlert(true);
                });
                return () => socket.disconnect();
            } catch (error) {
                console.error('Error fetching lists:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLists();
    }, [user.token]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* <Navbar /> */}
            <div className="container px-4 py-8 mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Market Requirements</h1>
                    {newAlert && (
                        <div className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-xl animate-bounce">
                            <Bell className="mr-2" size={20} />
                            <span className="text-sm font-black uppercase tracking-widest">New Requirement Posted!</span>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div>Loading...</div>
                ) : lists.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {lists.map((list) => (
                            <div key={list._id} className="p-6 bg-white rounded shadow hover:shadow-md">
                                <div className="flex justify-between mb-2">
                                    <h3 className="text-xl font-bold">{list.title}</h3>
                                    <div className="flex flex-col items-end bg-gray-50 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-blue-50 group">
                                        <div className="flex items-center space-x-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:animate-pulse"></div>
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{list.buyerId?.name || 'Guest Buyer'}</span>
                                        </div>
                                        <div className="text-sm font-black text-gray-900 mt-0.5 tabular-nums">
                                            {list.buyerId?.phone || <span className="text-gray-400 font-medium italic">No Contact</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mb-6 bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
                                    <p className="text-gray-600 font-black text-xs uppercase tracking-widest">{list.items.length} items requested</p>
                                    {list.expectedPrice && (
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter mb-0.5">Buyer's Budget</p>
                                            <p className="text-xl font-black text-blue-700">₹{list.expectedPrice}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <h4 className="font-semibold mb-2">Items:</h4>
                                    <div className="space-y-3">
                                        {list.items.slice(0, 3).map((item, index) => (
                                            <div key={index} className="flex items-center space-x-3">
                                                {item.product?.image ? (
                                                    <img src={item.product.image} alt="" className="w-10 h-10 object-cover rounded bg-gray-100 flex-shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                                        <span className="text-[10px] text-gray-400">No Img</span>
                                                    </div>
                                                )}
                                                <div className="flex-grow min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {item.product?.brand ? `${item.product.brand} • ` : ''}{item.quantity} {item.unit}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {list.items.length > 3 && <p className="text-xs text-blue-600 font-medium pl-13">+ {list.items.length - 3} more items</p>}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Link
                                        to={`/submit-quote/${list._id}`}
                                        className="inline-block px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                                    >
                                        Submit Quote
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center bg-white rounded shadow">
                        <p className="text-gray-500">No open grocery lists available at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorDashboard;
