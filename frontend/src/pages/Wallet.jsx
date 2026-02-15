import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, CreditCard, Plus } from 'lucide-react';

const Wallet = () => {
    const { user } = useContext(AuthContext);
    const [walletData, setWalletData] = useState({ balance: 0, referralCode: '', transactions: [] });
    const [loading, setLoading] = useState(true);
    const [rechargeAmount, setRechargeAmount] = useState(100);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/wallet', config);
            setWalletData(data);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleRecharge = async () => {
        const sdkLoaded = await loadRazorpay();
        if (!sdkLoaded) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('http://localhost:5000/api/wallet/recharge', { amount: rechargeAmount }, config);

            // 1. Handle Mock Recharge
            if (data.isMock) {
                console.log('Mock Recharge Detected. Auto-verifying...');
                try {
                    await axios.post('http://localhost:5000/api/wallet/verify', {
                        razorpay_order_id: data.id,
                        razorpay_payment_id: `mock_pay_${Date.now()}`,
                        razorpay_signature: 'mock_signature'
                    }, config);

                    alert('Wallet Recharged Successfully (MOCK MODE)!');
                    fetchWalletData();
                    setShowModal(false);
                } catch (error) {
                    console.error('Mock Verify failed:', error);
                    alert('Mock Recharge Failed');
                }
                return;
            }

            // 2. Real Razorpay Flow
            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: "Grocery Platform",
                description: "Wallet Recharge",
                order_id: data.id,
                handler: async function (response) {
                    try {
                        await axios.post('http://localhost:5000/api/wallet/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, config);

                        alert('Wallet Recharged Successfully!');
                        fetchWalletData();
                        setShowModal(false);
                    } catch (error) {
                        console.error('Verify failed:', error);
                        alert('Recharge Verification Failed');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || '9999999999'
                },
                theme: {
                    color: "#2563eb"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Recharge failed:', error);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading wallet...</div>;

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="container max-w-4xl px-4 py-8 mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Wallet</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
                    >
                        <Plus size={18} className="mr-2" /> Recharge Wallet
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl text-white shadow-xl flex flex-col justify-between">
                        <div>
                            <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-1">Total Balance</p>
                            <h2 className="text-4xl font-black">₹{walletData.balance.toFixed(2)}</h2>
                        </div>
                        <WalletIcon className="opacity-20 mt-4" size={48} />
                    </div>

                    {/* Referral Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Referral Rewards</h3>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Active</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Share your referral code and earn commissions on every transaction they make!</p>
                        <div className="flex items-center bg-gray-50 p-3 rounded-2xl border border-dashed border-gray-200">
                            <code className="flex-grow font-black text-blue-600 text-lg tracking-widest">{walletData.referralCode}</code>
                            <button
                                onClick={() => { navigator.clipboard.writeText(walletData.referralCode); alert('Code copied!') }}
                                className="text-xs font-black text-gray-400 hover:text-gray-600 uppercase"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest flex items-center">
                            <CreditCard className="mr-2 text-blue-600" size={16} /> Transaction History
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {walletData.transactions.length > 0 ? walletData.transactions.map((tx) => (
                            <div key={tx._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-xl ${tx.amount > 0 && tx.type !== 'deposit' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                        {tx.type === 'deposit' || tx.type === 'referral_commission' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{tx.description}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(tx.createdAt).toLocaleString()}</p>
                                            {tx.buyerId && tx.type !== 'order_payment' && (
                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black uppercase">From: {tx.buyerId.name}</span>
                                            )}
                                            {tx.vendorId && (
                                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-black uppercase">To: {tx.vendorId.name}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-black ${tx.type === 'deposit' || tx.type === 'referral_commission' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type === 'deposit' || tx.type === 'referral_commission' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                                    </p>
                                    <span className="text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase font-black">{tx.status}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center text-gray-400 italic">No transactions found.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recharge Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-black">✕</button>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tight">Recharge Balance</h2>
                        <div className="mb-6">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Amount (INR)</label>
                            <input
                                type="number"
                                value={rechargeAmount}
                                onChange={(e) => setRechargeAmount(e.target.value)}
                                className="w-full text-3xl font-black bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={handleRecharge}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                        >
                            Pay via Razorpay
                        </button>
                        <p className="text-center text-[10px] text-gray-400 mt-4 uppercase font-bold tracking-tighter">Secure Payment Gateway Integration</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wallet;
