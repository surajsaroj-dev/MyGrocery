import { useState, useEffect, useContext } from 'react';
import api, { API_URL } from '../api/config';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import io from 'socket.io-client';
import { Package, Clock, DollarSign, TrendingUp, Bell } from 'lucide-react';

const VendorDashboard = () => {
    const { user, setUser } = useContext(AuthContext);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [referralStats, setReferralStats] = useState({ count: 0, rewards: 0, referralCode: '', history: [] });
    const [newAlert, setNewAlert] = useState(false);
    const [converting, setConverting] = useState(false);

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await api.get('/api/lists', config);
                setLists(data);

                // Fetch referral stats
                const statsRes = await api.get('/api/users/stats/referrals', config);
                setReferralStats(statsRes.data);

                // Socket setup
                const socket = io(API_URL);
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

    const handleConvertRewards = async () => {
        if (!referralStats.rewards || referralStats.rewards <= 0) return;

        setConverting(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await api.post('/api/users/referrals/convert', {}, config);

            // Update auth context wallet balance
            const updatedUser = { ...user, walletBalance: data.walletBalance };
            setUser(updatedUser);
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));

            alert(data.message);
            // Re-fetch lists and stats
            const config2 = { headers: { Authorization: `Bearer ${user.token}` } };
            const statsRes = await api.get('/api/users/stats/referrals', config2);
            setReferralStats(statsRes.data);
        } catch (error) {
            console.error('Error converting rewards:', error);
            alert(error.response?.data?.message || 'Conversion failed');
        } finally {
            setConverting(false);
        }
    };

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

                {/* Referral Section Card for Vendor */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm mb-8 overflow-hidden relative">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest">
                                <TrendingUp size={16} /> Business Growth
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Expand Your Network</h2>
                            <p className="text-gray-500 font-medium max-w-sm">Invite other vendors or buyers and earn referral rewards for every transaction they make!</p>

                            <div className="flex items-center gap-4 pt-2">
                                <div className="bg-gray-50 px-6 py-4 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Code</span>
                                    <span className="text-2xl font-black text-blue-600 tracking-wider">{referralStats.referralCode || user.referralCode}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(referralStats.referralCode || user.referralCode);
                                        alert('Code copied to clipboard!');
                                    }}
                                    className="px-6 py-4 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95"
                                >
                                    Copy Code
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-600 p-8 rounded-[40px] text-white flex flex-col items-center text-center shadow-2xl shadow-blue-200 min-w-[200px]">
                            <span className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Referral Rewards</span>
                            <div className="text-5xl font-black mb-2">{referralStats.rewards}</div>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-6">Points Earned</span>

                            <button
                                onClick={handleConvertRewards}
                                disabled={converting || !referralStats.rewards}
                                className={`w-full py-3 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${converting || !referralStats.rewards ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}
                            >
                                {converting ? 'Converting...' : 'Convert to Cash'}
                            </button>
                        </div>
                    </div>
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
                                                    <img src={`${API_URL}/${item.product.image}`} alt="" className="w-10 h-10 object-cover rounded bg-gray-100 flex-shrink-0" />
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
