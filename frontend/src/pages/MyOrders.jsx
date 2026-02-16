import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_URL } from '../api/config';
import AuthContext from '../context/AuthContext';
import { Package, Truck, Copy, Check } from 'lucide-react';

const MyOrders = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const fetchOrders = async () => {
        if (!user) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await api.get('/api/orders', config);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.token) {
            fetchOrders();
        }
    }, [user?.token]);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (orderId, amount) => {
        const res = await loadRazorpay();

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };

            // 1. Create Razorpay Order on Backend
            const { data: orderData } = await api.post('/api/payment/create-order', { orderId }, config);

            // 2. Handle Mock Payment
            if (orderData.isMock) {
                console.log('Mock Payment Detected. Auto-verifying...');
                try {
                    await api.post('/api/payment/verify', {
                        razorpay_order_id: orderData.id,
                        razorpay_payment_id: `mock_pay_${Date.now()}`,
                        razorpay_signature: 'mock_signature',
                        orderId: orderId
                    }, config);

                    alert('Payment Successful (MOCK MODE)!');
                    fetchOrders();
                } catch (error) {
                    console.error('Mock Payment Verification Failed', error);
                    alert('Mock Payment Failed');
                }
                return;
            }

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Grocery Platform",
                description: "Monthly Grocery Payment",
                order_id: orderData.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        await api.post('/api/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: orderId
                        }, config);

                        alert('Payment Successful!');
                        fetchOrders();
                    } catch (error) {
                        console.error('Payment Verification Failed', error);
                        alert('Payment Verified Failed');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || '9999999999'
                },
                theme: {
                    color: "#059669"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Payment Initiation Failed');
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await api.put(`/api/orders/${orderId}/status`, { status: newStatus }, config);
            fetchOrders();
        } catch (error) {
            console.error('Error updating status:', error.response?.data || error);
            alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
        }
    };

    const [expandedOrder, setExpandedOrder] = useState(null);

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'paid': return 'bg-green-100 text-green-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-indigo-100 text-indigo-800';
            case 'dispatched': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            <div className="container max-w-5xl px-4 py-8 mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Purchase History</h1>
                    <div className="flex items-center space-x-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                        <span>{orders.length} Orders</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-20 bg-white rounded-3xl border border-gray-100 shadow-sm font-bold text-gray-400">
                        Analyzing your transaction history...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <Package size={64} className="mx-auto mb-6 text-gray-200" />
                        <h2 className="text-2xl font-black text-gray-800 mb-2">No Orders Yet</h2>
                        <p className="text-gray-500 max-w-xs mx-auto">Start by creating a grocery list and accepting a vendor quotation!</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {orders.map((order) => (
                            <div key={order._id} className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${expandedOrder === order._id ? 'border-blue-200 shadow-xl shadow-blue-50' : 'border-gray-100 shadow-sm hover:border-gray-200'}`}>
                                <div
                                    className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                                    onClick={() => toggleExpand(order._id)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 group">
                                                    <h3 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">#{order._id.substring(18)}...</h3>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(order._id); }}
                                                        className={`p-1 rounded transition-all ${copiedId === order._id ? 'text-green-500' : 'text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100'}`}
                                                        title="Copy Full ID"
                                                    >
                                                        {copiedId === order._id ? <Check size={12} /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.deliveryStatus)}`}>
                                                    {order.deliveryStatus}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${order.paymentMethod === 'online' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>
                                                    {order.paymentMethod === 'online' ? 'Online' : 'COD'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 font-bold uppercase tracking-tighter mt-0.5">
                                                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Bill</p>
                                            <p className="text-xl font-black text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            {expandedOrder === order._id ? (
                                                <div className="bg-gray-100 p-2 rounded-full text-gray-400"><Package size={16} /></div>
                                            ) : (
                                                <div className="bg-blue-600 p-2 rounded-full text-white"><Package size={16} /></div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {expandedOrder === order._id && (
                                    <div className="bg-gray-50/50 p-6 border-t border-gray-100">
                                        <div className="grid gap-8 md:grid-cols-3">
                                            <div className="md:col-span-2">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Line Items</h4>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {order.quotationId?.originalListId?.items?.map((item, idx) => {
                                                        const qItem = order.quotationId?.prices?.find(p => p.itemName === item.name);
                                                        return (
                                                            <div key={idx} className="flex items-center p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                                                {(() => {
                                                                    const img = item.product?.image || qItem?.product?.image;
                                                                    return img ? (
                                                                        <img src={img} alt="" className="w-12 h-12 rounded-xl object-cover bg-gray-50" />
                                                                    ) : (
                                                                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-[8px] font-black text-gray-300">N/A</div>
                                                                    );
                                                                })()}
                                                                <div className="ml-3 flex-grow">
                                                                    <p className="text-sm font-bold text-gray-800 leading-tight">{item.name}</p>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{item.quantity} {item.unit}</p>
                                                                    {qItem && (
                                                                        <div className="flex justify-between items-center mt-1">
                                                                            <span className="text-xs font-black text-blue-600">₹{qItem.finalPrice.toFixed(2)}</span>
                                                                            {qItem.discount > 0 && <span className="text-[8px] bg-green-100 text-green-700 px-1 py-0.5 rounded font-black">-{qItem.discount}%</span>}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                                                    <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4">Order Summary</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-start text-xs font-bold">
                                                            <span className="text-gray-400 uppercase">{user.role === 'buyer' ? 'Vendor' : 'Buyer'}</span>
                                                            <div className="text-right max-w-[150px]">
                                                                <div className="text-gray-800 font-black">{user.role === 'buyer' ? order.vendorId?.name : order.buyerId?.name}</div>
                                                                <div className="text-[10px] text-blue-600 font-black mt-0.5">{user.role === 'buyer' ? order.vendorId?.phone : order.buyerId?.phone || 'No Contact'}</div>
                                                                {user.role === 'vendor' && (
                                                                    <div className="mt-2 pt-2 border-t border-gray-50">
                                                                        <span className="text-[9px] text-gray-400 uppercase block mb-1">Delivery Address</span>
                                                                        {order.paymentStatus === 'paid' ? (
                                                                            <div className="text-gray-700 text-[11px] leading-relaxed break-words bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                                                                                {order.buyerId?.address || 'No address provided'}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-amber-600 text-[9px] italic font-medium bg-amber-50 p-1.5 rounded-lg border border-amber-100 px-2">
                                                                                Visible after payment
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between text-xs font-bold">
                                                            <span className="text-gray-400 uppercase">Status</span>
                                                            <span className={`px-2 py-0.5 rounded-md ${getStatusColor(order.deliveryStatus)}`}>{order.deliveryStatus}</span>
                                                        </div>
                                                        <div className="flex justify-between items-baseline">
                                                            <span className="text-gray-400 uppercase text-[10px] font-black">Payment</span>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${order.paymentMethod === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                {order.paymentMethod === 'online' ? 'Online' : 'COD'}
                                                            </span>
                                                        </div>
                                                        <div className="pt-3 border-t border-gray-50 flex justify-between items-baseline">
                                                            <span className="text-sm font-black text-gray-900">{user.role === 'buyer' ? 'Paid Total' : 'Order Total'}</span>
                                                            <span className="text-xl font-black text-green-600">₹{order.totalAmount.toFixed(2)}</span>
                                                        </div>
                                                        {user.role === 'vendor' && order.quotationId?.originalListId?.expectedPrice && (
                                                            <p className="text-[10px] text-gray-400 font-bold text-right uppercase mt-1">
                                                                Buyer Expected: ₹{order.quotationId.originalListId.expectedPrice}
                                                            </p>
                                                        )}
                                                        {user.role === 'buyer' && order.quotationId?.discountTotal > 0 && (
                                                            <p className="text-[10px] text-green-600 font-black text-right">You saved ₹{order.quotationId.discountTotal.toFixed(2)}!</p>
                                                        )}
                                                    </div>

                                                    <div className="mt-6 space-y-2">
                                                        {user.role === 'buyer' && order.paymentStatus === 'pending' && order.paymentMethod === 'online' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handlePayment(order._id, order.totalAmount); }}
                                                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700"
                                                            >
                                                                Pay Now
                                                            </button>
                                                        )}
                                                        {user.role === 'buyer' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); navigate(`/track-order/${order._id}`); }}
                                                                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <Truck size={14} /> Track Order
                                                            </button>
                                                        )}
                                                        {user.role === 'vendor' && (
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Update Status</p>
                                                                <select
                                                                    className="w-full p-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold font-black outline-none"
                                                                    value={order.deliveryStatus}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onChange={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, e.target.value); }}
                                                                >
                                                                    <option value="pending">Pending</option>
                                                                    <option value="processing">Processing</option>
                                                                    <option value="shipped">Shipped</option>
                                                                    <option value="dispatched">Dispatched</option>
                                                                    <option value="delivered">Delivered</option>
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
