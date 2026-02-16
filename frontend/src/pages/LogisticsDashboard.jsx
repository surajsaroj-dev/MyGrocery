import { useState, useEffect, useContext } from 'react';
import api from '../api/config';
import AuthContext from '../context/AuthContext';
import { Package, Truck, CheckCircle, MapPin, Phone, User as UserIcon, Navigation } from 'lucide-react';

const LogisticsDashboard = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAssignedOrders = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await api.get('/api/orders', config);
            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching assigned orders:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchAssignedOrders();
    }, [user]);

    const handleStatusUpdate = async (orderId, status) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await api.put(`/api/orders/${orderId}/logistics-status`, { status }, config);
            fetchAssignedOrders();
            alert(`Order status updated to ${status}`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin text-green-600"><Truck size={48} /></div>
        </div>
    );

    const stats = {
        pending: orders.filter(o => o.deliveryStatus === 'processing' || o.deliveryStatus === 'shipped').length,
        dispatched: orders.filter(o => o.deliveryStatus === 'dispatched').length,
        delivered: orders.filter(o => o.deliveryStatus === 'delivered').length,
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="container px-4 py-4 mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-black text-gray-800 flex items-center">
                        <Truck className="mr-2 text-green-600" /> Logistics Hub
                    </h1>
                    <div className="flex items-center space-x-2">
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Partner</p>
                            <p className="text-sm font-black text-gray-800">{user.name}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <UserIcon size={20} />
                        </div>
                    </div>
                </div>
            </header>

            <main className="container px-4 py-8 mx-auto">
                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned</p>
                        <p className="text-2xl font-black text-gray-800">{stats.pending}</p>
                    </div>
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">On Path</p>
                        <p className="text-2xl font-black text-blue-600">{stats.dispatched}</p>
                    </div>
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Closed</p>
                        <p className="text-2xl font-black text-green-600">{stats.delivered}</p>
                    </div>
                </div>

                <h2 className="text-lg font-black text-gray-800 mb-6 px-2">Delivery Queue</h2>

                <div className="space-y-6">
                    {orders.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                            <Package className="mx-auto text-gray-200 mb-4" size={64} />
                            <p className="font-bold text-gray-400">No deliveries assigned currently</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-50">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-tighter">
                                                Order #{order._id.substring(0, 8)}
                                            </span>
                                            <h3 className="text-xl font-black text-gray-800 mt-2">{order.buyerId?.name}</h3>
                                        </div>
                                        <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${order.deliveryStatus === 'delivered' ? 'bg-green-50 text-green-600' :
                                                order.deliveryStatus === 'dispatched' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                            }`}>
                                            {order.deliveryStatus}
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-start">
                                            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center mr-3 shrink-0">
                                                <MapPin size={16} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Address</p>
                                                <p className="text-sm font-bold text-gray-700 leading-tight">{order.buyerId?.address || 'Address not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center mr-3 shrink-0">
                                                <Phone size={16} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Buyer</p>
                                                <p className="text-sm font-bold text-gray-700">{order.buyerId?.phone || 'No phone number'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center mr-3 shrink-0">
                                                <Navigation size={16} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pickup From</p>
                                                <p className="text-sm font-bold text-gray-700">{order.vendorId?.name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        {order.deliveryStatus !== 'delivered' && (
                                            <>
                                                {order.deliveryStatus !== 'dispatched' ? (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order._id, 'dispatched')}
                                                        className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-200"
                                                    >
                                                        Start Delivery
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order._id, 'delivered')}
                                                        className="flex-grow bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-green-200"
                                                    >
                                                        Mark as Delivered
                                                    </button>
                                                )}
                                                <a
                                                    href={`tel:${order.buyerId?.phone}`}
                                                    className="w-16 h-14 bg-gray-100 flex items-center justify-center rounded-2xl text-gray-600 hover:bg-gray-200"
                                                >
                                                    <Phone size={24} />
                                                </a>
                                            </>
                                        )}
                                        {order.deliveryStatus === 'delivered' && (
                                            <div className="w-full py-4 text-center font-black text-green-600 bg-green-50 rounded-2xl border-2 border-green-100 flex items-center justify-center">
                                                <CheckCircle size={20} className="mr-2" /> JOB COMPLETED
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default LogisticsDashboard;
