import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

import { Users, Gift, Share2, TrendingUp, Copy, CheckCircle } from 'lucide-react';

const Referrals = () => {
    const { user } = useContext(AuthContext);
    const [referralStats, setReferralStats] = useState([]);
    const [walletData, setWalletData] = useState({ balance: 0, referralCode: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };

                // Fetch basic wallet info (for referral code)
                const walletRes = await axios.get('http://localhost:5000/api/wallet', config);
                setWalletData(walletRes.data);

                // Fetch referred users
                const referralRes = await axios.get('http://localhost:5000/api/users/stats/referrals', config);
                setReferralStats(referralRes.data);
            } catch (error) {
                console.error('Error fetching referral data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user.token]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(walletData.referralCode);
        alert('Referral code copied to clipboard!');
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading referrals...</div>;

    const totalCommission = walletData.transactions?.filter(t => t.type === 'referral_commission').reduce((acc, t) => acc + t.amount, 0) || 0;

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="container max-w-5xl px-4 py-8 mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 uppercase">Refer & Earn</h1>
                    <p className="text-gray-500 font-medium">Invite your friends and earn commissions on every order they place!</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {/* Share Card */}
                    <div className="md:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-100/50 border border-blue-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Share2 size={120} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6">Your Unique Code</h3>
                            <div className="flex items-center bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200 group">
                                <code className="text-4xl font-black text-gray-900 tracking-widest flex-grow">{walletData.referralCode}</code>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 flex items-center"
                                >
                                    <Copy size={20} className="mr-2" /> <span className="text-xs font-black uppercase tracking-widest">Copy</span>
                                </button>
                            </div>
                            <p className="mt-6 text-sm text-gray-400 font-medium">Step 1: Share code • Step 2: Friend joins • Step 3: Earn 0.1% of their orders</p>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-[2rem] text-white shadow-lg shadow-green-100">
                            <Gift className="mb-4 opacity-50" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Total Commission</p>
                            <h2 className="text-3xl font-black">₹{totalCommission.toFixed(2)}</h2>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-md">
                            <Users className="mb-4 text-blue-600" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-gray-400">Referred Friends</p>
                            <h2 className="text-3xl font-black text-gray-900">{referralStats.length}</h2>
                        </div>
                    </div>
                </div>

                {/* List of Referrals */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest flex items-center">
                            <TrendingUp className="mr-2 text-blue-600" size={18} /> Referral Network
                        </h3>
                        <span className="text-xs font-bold text-gray-400">{referralStats.length} Total Users</span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {referralStats.length > 0 ? referralStats.map((item, idx) => (
                            <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">
                                        {item.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 tracking-tight">{item.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Joined {new Date(item.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-green-500 bg-green-50 px-3 py-1 rounded-full space-x-2 border border-green-100">
                                    <CheckCircle size={14} />
                                    <span className="text-[10px] font-black uppercase">Active Member</span>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center">
                                <Users className="mx-auto text-gray-100 mb-4" size={64} />
                                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No friends referred yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Referrals;
