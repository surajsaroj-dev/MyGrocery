import { useState, useEffect, useContext, Fragment } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

import { Eye, ChevronDown, ChevronUp } from 'lucide-react';

const AdminOrders = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        if (!user) return;
        const fetchOrders = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                const { data } = await axios.get('https://mygrocery-bcw8.onrender.com/api/orders', config);
                setOrders(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user?.token]);

    const toggleExpand = (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderId);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'delivered': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="container px-4 py-8 mx-auto">
                <h1 className="mb-8 text-3xl font-bold text-gray-800">Global Order Monitor</h1>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded shadow">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Order ID</th>
                                    <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Buyer</th>
                                    <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Vendor</th>
                                    <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Amount</th>
                                    <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Payment</th>
                                    <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Status</th>
                                    <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <Fragment key={order._id}>
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">#{order._id.substring(0, 8)}</td>
                                            <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                                <div className="font-semibold">{order.buyerId?.name}</div>
                                                <div className="text-xs text-gray-500">{order.buyerId?.email}</div>
                                            </td>
                                            <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">{order.vendorId?.name}</td>
                                            <td className="px-5 py-5 text-sm font-bold text-green-600 bg-white border-b border-gray-200">${order.totalAmount}</td>
                                            <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.paymentStatus)}`}>
                                                    {order.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.deliveryStatus)}`}>
                                                    {order.deliveryStatus}
                                                </span>
                                            </td>
                                            <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                                <button
                                                    onClick={() => toggleExpand(order._id)}
                                                    className="text-blue-600 hover:text-blue-900 focus:outline-none"
                                                >
                                                    {expandedOrder === order._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Expanded Row Details */}
                                        {expandedOrder === order._id && (
                                            <tr>
                                                <td colSpan="7" className="p-4 bg-gray-50">
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div>
                                                            <h4 className="mb-2 font-bold text-gray-700">Products</h4>
                                                            <div className="space-y-2">
                                                                {order.quotationId?.originalListId?.items?.map((item, idx) => {
                                                                    const qItem = order.quotationId?.prices?.find(p => p.itemName === item.name);
                                                                    return (
                                                                        <div key={idx} className="flex items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                                            {(() => {
                                                                                const img = item.product?.image || qItem?.product?.image;
                                                                                const brand = item.product?.brand || qItem?.product?.brand;
                                                                                return (
                                                                                    <>
                                                                                        {img ? (
                                                                                            <img src={img} alt={item.name} className="object-cover w-12 h-12 mr-3 rounded-lg shadow-sm" />
                                                                                        ) : (
                                                                                            <div className="flex items-center justify-center w-12 h-12 mr-3 bg-gray-100 rounded-lg text-[8px] font-black text-gray-400">N/A</div>
                                                                                        )}
                                                                                        <div className="flex-grow">
                                                                                            <p className="font-bold text-gray-800 text-sm leading-tight">{item.name}</p>
                                                                                            <p className="text-[10px] text-gray-500 font-bold uppercase">
                                                                                                {brand && <span className="text-blue-600">{brand} • </span>}
                                                                                                {item.quantity} {item.unit}
                                                                                            </p>
                                                                                        </div>
                                                                                    </>
                                                                                );
                                                                            })()}
                                                                            {qItem && (
                                                                                <div className="text-right ml-4">
                                                                                    <p className="text-sm font-black text-gray-900">${qItem.finalPrice.toFixed(2)}</p>
                                                                                    {qItem.discount > 0 && <p className="text-[10px] text-green-600 font-black">-{qItem.discount}%</p>}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="mb-2 font-bold text-gray-700">Payment & Delivery Details</h4>
                                                            <div className="p-4 bg-white rounded shadow-sm">
                                                                <p><strong>Transaction ID:</strong> {order._id}</p>
                                                                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                                                <p className="mt-2"><strong>Buyer Contact:</strong> {order.buyerId?.phone || 'N/A'}</p>
                                                                <p><strong>Address:</strong> {order.buyerId?.address || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
