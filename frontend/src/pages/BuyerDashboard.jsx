import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

import { Plus, List as ListIcon, ShoppingBag, ArrowRight, Package, Clock, Wallet } from 'lucide-react';

const BuyerDashboard = () => {
    const { user, setUser } = useContext(AuthContext);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [referralStats, setReferralStats] = useState({ count: 0, rewards: 0, referralCode: '', history: [] });
    const [converting, setConverting] = useState(false);

    const fetchData = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const [listsRes, statsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/lists', config),
                axios.get('http://localhost:5000/api/users/stats/referrals', config)
            ]);
            setLists(listsRes.data);
            setReferralStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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
            const { data } = await axios.post('http://localhost:5000/api/users/referrals/convert', {}, config);

            // Update auth context wallet balance
            const updatedUser = { ...user, walletBalance: data.walletBalance };
            setUser(updatedUser);
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));

            alert(data.message);
            fetchData(); // Refresh stats
        } catch (error) {
            console.error('Error converting rewards:', error);
            alert(error.response?.data?.message || 'Conversion failed');
        } finally {
            setConverting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            <div className="container px-4 py-8 mx-auto xl:max-w-7xl">
                {/* Hero / Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">Buyer Central</h1>
                        <p className="text-gray-500 font-medium text-lg leading-snug max-w-md">Manage your monthly refills and discover premium brands at competitive prices.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/catalog"
                            className="flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 shadow-xl shadow-gray-200 transition-all hover:-translate-y-1"
                        >
                            <ShoppingBag size={20} className="mr-3" /> Browse Master Catalog
                        </Link>
                        <Link
                            to="/create-list"
                            className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all hover:-translate-y-1"
                        >
                            <Plus size={20} className="mr-2" /> Create Custom List
                        </Link>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Active Lists Section */}
                    <div className="lg:col-span-2">
                        {/* Referral Section Card */}
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm mb-8 overflow-hidden relative">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest">
                                        <Wallet size={16} /> Earn Rewards
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Refer & Earn Real Cash</h2>
                                    <p className="text-gray-500 font-medium max-w-sm">Share your code with friends. You earn 100 points, they earn 50 points!</p>

                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="bg-gray-50 px-6 py-4 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Code</span>
                                            <span className="text-2xl font-black text-blue-600 tracking-wider">{referralStats.referralCode}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(referralStats.referralCode);
                                                alert('Code copied to clipboard!');
                                            }}
                                            className="px-6 py-4 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95"
                                        >
                                            Copy Code
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-blue-600 p-8 rounded-[40px] text-white flex flex-col items-center text-center shadow-2xl shadow-blue-200 min-w-[200px]">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Reward Balance</span>
                                    <div className="text-5xl font-black mb-2">{referralStats.rewards}</div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-6">Points available</span>

                                    <button
                                        onClick={handleConvertRewards}
                                        disabled={converting || !referralStats.rewards}
                                        className={`w-full py-3 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${converting || !referralStats.rewards ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}
                                    >
                                        {converting ? 'Converting...' : 'Convert to Cash'}
                                    </button>
                                </div>
                            </div>
                            <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none">
                                <Wallet size={300} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-gray-800 flex items-center">
                                <ListIcon className="mr-2 text-blue-600" size={20} /> Your Procurement Lists
                            </h2>
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{lists.length} Lists Found</span>
                        </div>

                        {loading ? (
                            <div className="p-20 bg-white rounded-[40px] border border-gray-100 text-center font-bold text-gray-400">Loading your data...</div>
                        ) : lists.length > 0 ? (
                            <div className="grid gap-6">
                                {lists.map((list) => (
                                    <div key={list._id} className="group bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-50 hover:border-blue-100 transition-all duration-300">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center space-x-6">
                                                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center ${list.status === 'open' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                                    <Package size={28} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{list.title}</h3>
                                                    <div className="flex items-center space-x-3 mt-1 text-sm text-gray-400 font-bold uppercase tracking-tighter">
                                                        <span className="flex items-center"><Package size={14} className="mr-1" /> {list.items.length} Items</span>
                                                        <span>•</span>
                                                        <span className="flex items-center"><Clock size={14} className="mr-1" /> {new Date(list.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${list.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                    {list.status}
                                                </span>
                                                <Link
                                                    to={`/list/${list._id}`}
                                                    className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <ArrowRight size={20} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-20 rounded-[40px] border border-dashed border-gray-200 text-center">
                                <ListIcon size={48} className="mx-auto mb-6 text-gray-200" />
                                <h3 className="text-2xl font-black text-gray-800 mb-2">No Active Lists</h3>
                                <p className="text-gray-500 max-w-xs mx-auto mb-8 font-medium">Start your first procurement cycle by creating a custom list or browsing the catalog.</p>
                                <Link to="/create-list" className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-gray-200">
                                    Create First List
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats / Tips Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Referral Performance</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-500">Friends Referred</span>
                                    <span className="text-xl font-black text-gray-900">{referralStats.count}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-500">Total Reward Points</span>
                                    <span className="text-xl font-black text-blue-600">{referralStats.rewards}</span>
                                </div>
                                <div className="pt-4 space-y-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Recent Referrals</span>
                                    {referralStats.history?.slice(0, 3).map((h, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-gray-600 truncate max-w-[120px] tracking-tight">{h.name}</span>
                                            <span className="text-gray-400 tracking-tighter">{new Date(h.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                    {(!referralStats.history || referralStats.history.length === 0) && <p className="text-xs text-gray-400 italic">No referrals yet.</p>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[40px] text-white shadow-2xl shadow-blue-100 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-4">Market Insight</h3>
                                <p className="text-blue-100 text-sm font-medium leading-relaxed mb-6">
                                    Browse our master catalog to find brand-exclusive deals. Adding items directly from the catalog ensures higher accuracy in vendor bidding.
                                </p>
                                <Link to="/catalog" className="inline-flex items-center text-xs font-black uppercase tracking-widest text-white hover:underline">
                                    Explore Catalog <ArrowRight size={14} className="ml-2" />
                                </Link>
                            </div>
                            <div className="absolute -right-8 -bottom-8 opacity-10">
                                <ShoppingBag size={150} />
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Quick Overview</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-500">Active Lists</span>
                                    <span className="text-xl font-black text-gray-900">{lists.filter(l => l.status === 'open').length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-500">Bids Received</span>
                                    <span className="text-xl font-black text-blue-600">--</span>
                                </div>
                                <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                                    <Link to="/orders" className="text-xs font-black text-gray-900 uppercase tracking-widest hover:underline">Recent Orders</Link>
                                    <ArrowRight size={14} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerDashboard;
