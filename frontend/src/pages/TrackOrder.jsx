import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/config';
import AuthContext from '../context/AuthContext';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, SearchSlash, Copy, Check } from 'lucide-react';

const TrackOrder = () => {
    const { id: urlId } = useParams();
    const { user } = useContext(AuthContext);
    const [orderId, setOrderId] = useState(urlId || '');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    useEffect(() => {
        if (urlId && user) {
            performSearch(urlId);
        }
    }, [urlId, user]);

    const performSearch = async (sid) => {
        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await api.get(`/api/orders/${sid}/track`, config);
            setOrder(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Order not found or access denied');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!orderId.trim()) return;
        performSearch(orderId);
    };

    const steps = [
        { status: 'pending', label: 'Order Placed', icon: Clock, color: 'blue' },
        { status: 'processing', label: 'Processing', icon: Package, color: 'blue' },
        { status: 'shipped', label: 'Shipped', icon: Truck, color: 'indigo' },
        { status: 'dispatched', label: 'Dispatched', icon: Truck, color: 'indigo' },
        { status: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'green' },
    ];

    const getStatusIndex = (status) => {
        return steps.findIndex(s => s.status === status);
    };

    const currentStepIndex = order ? getStatusIndex(order.deliveryStatus) : -1;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Search Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-gray-900 mb-4">Track Your Order</h1>
                    <p className="text-gray-500 font-medium mb-8">Enter your Order ID to see the real-time status of your groceries.</p>

                    <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
                        <input
                            type="text"
                            placeholder="Enter 24-character Order ID (e.g. 65c...)"
                            className="w-full px-6 py-5 bg-white rounded-[32px] shadow-xl shadow-gray-200/50 border-2 border-transparent focus:border-blue-500 outline-none font-bold text-gray-800 transition-all pr-16"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-2 top-2 bottom-2 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Search size={20} />}
                        </button>
                    </form>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-white p-8 rounded-[40px] shadow-xl border border-red-50 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <SearchSlash size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Order Not Found</h3>
                        <p className="text-gray-500 font-medium">{error}</p>
                    </div>
                )}

                {/* Tracking Result */}
                {order && (
                    <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-100/50 border border-white overflow-hidden p-8 md:p-12 animate-in slide-in-from-bottom-8 duration-500">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-10 border-b border-gray-100">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">TRACKING ID</p>
                                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => copyToClipboard(order._id)}>
                                    <h2 className="text-xl font-black text-gray-900 break-all select-all group-hover:text-blue-600 transition-colors">#{order._id}</h2>
                                    <span className={`p-1.5 rounded-lg transition-all ${copySuccess ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100'}`}>
                                        {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">VENDOR</p>
                                <p className="font-bold text-blue-600">{order.vendorName}</p>
                            </div>
                        </div>

                        {/* Visual Timeline */}
                        <div className="relative mb-16 px-4">
                            {/* Line */}
                            <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-100 -translate-y-1/2 z-0 hidden md:block">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                                ></div>
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 md:gap-4">
                                {steps.map((step, index) => {
                                    const Icon = step.icon;
                                    const isCompleted = index <= currentStepIndex;
                                    const isActive = index === currentStepIndex;

                                    return (
                                        <div key={step.status} className="flex flex-col items-center text-center group">
                                            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 rotate-0' : 'bg-gray-100 text-gray-400 rotate-12 group-hover:rotate-0'
                                                }`}>
                                                <Icon size={28} />
                                            </div>
                                            <div className="mt-4">
                                                <p className={`text-sm font-black uppercase tracking-widest ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </p>
                                                {isActive && (
                                                    <p className="text-[10px] text-blue-500 font-bold mt-1 animate-pulse">CURRENT STATUS</p>
                                                )}
                                                {isCompleted && !isActive && (
                                                    <p className="text-[10px] text-green-500 font-bold mt-1">COMPLETED</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Amount</p>
                                <p className="text-2xl font-black text-gray-900">₹{order.totalAmount}</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment Status</p>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Order Date</p>
                                <p className="font-bold text-gray-800">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Helpful Tips */}
                {!order && !loading && (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
                        <div className="flex items-start p-6 bg-white rounded-3xl border border-gray-200 shadow-sm">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mr-4 shrink-0">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Where is my Order ID?</p>
                                <p className="text-xs text-gray-500 mt-1 font-medium">You can find it in your "My Orders" section or in the order confirmation message.</p>
                            </div>
                        </div>
                        <div className="flex items-start p-6 bg-white rounded-3xl border border-gray-200 shadow-sm">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mr-4 shrink-0">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Live Updates</p>
                                <p className="text-xs text-gray-500 mt-1 font-medium">Status updates are pushed in real-time as your vendor prepares and ships your items.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
