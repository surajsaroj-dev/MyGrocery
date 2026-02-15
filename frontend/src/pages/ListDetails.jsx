import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

import { CheckCircle, Info, TrendingDown, DollarSign, Package, ShoppingBag, Phone, Star, Clock, Copy, ArrowRight } from 'lucide-react';
import io from 'socket.io-client';

const ListDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [list, setList] = useState(null);
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();

    // Success Modal States
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState('');
    const [isCopying, setIsCopying] = useState(false);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setIsCopying(true);
        setTimeout(() => setIsCopying(false), 2000);
    };

    useEffect(() => {
        let activeSocket = null;

        const fetchData = async () => {
            if (!user) return;
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };

                // Fetch List Details
                const listRes = await axios.get(`https://mygrocery-bcw8.onrender.com/api/lists/${id}`, config);
                setList(listRes.data);

                // Fetch Quotations for this list
                const quotesRes = await axios.get(`https://mygrocery-bcw8.onrender.com/api/quotations?listId=${id}`, config);
                setQuotations(quotesRes.data);

                // Socket setup
                if (!activeSocket) {
                    activeSocket = io('https://mygrocery-bcw8.onrender.com', {
                        transports: ['polling', 'websocket'],
                        reconnectionAttempts: 5
                    });
                    setSocket(activeSocket);

                    activeSocket.on('connect', () => {
                        console.log('Socket connected successfully!');
                        activeSocket.emit('join', user._id);
                    });

                    activeSocket.on('connect_error', (err) => {
                        console.error('Socket connection error:', err.message);
                    });

                    activeSocket.on('new_quote', (data) => {
                        if (data.listId === id) {
                            setQuotations(prev => [...prev, data.quotation]);
                            console.log('New bid received real-time!');
                        }
                    });
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            if (activeSocket) {
                console.log('Cleaning up socket...');
                activeSocket.disconnect();
            }
        };
    }, [id, user?.token]);

    const [selectedQuote, setSelectedQuote] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handleAcceptQuote = async () => {
        if (!selectedQuote) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.post('https://mygrocery-bcw8.onrender.com/api/orders', {
                quotationId: selectedQuote._id,
                paymentMethod: paymentMethod
            }, config);

            setCreatedOrderId(data._id);
            setShowPaymentModal(false);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to create order');
        }
    };

    const initiateAcceptQuote = (quote) => {
        setSelectedQuote(quote);
        setShowPaymentModal(true);
    };

    const getCheapestPriceForItem = (itemName) => {
        if (quotations.length === 0) return null;
        const prices = quotations.map(q => {
            const item = q.prices.find(p => p.itemName === itemName);
            return item ? item.finalPrice : Infinity;
        });
        return Math.min(...prices);
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading list analysis...</div>;
    if (!list) return <div className="flex items-center justify-center min-h-screen font-bold text-red-500">List not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            <div className="container px-4 py-8 mx-auto xl:max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <Link to="/" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center mb-2">
                            &larr; Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{list.title}</h1>
                        <div className="flex flex-wrap gap-4 mt-2">
                            <div className="flex items-center bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 shadow-sm">
                                <DollarSign size={16} className="mr-2 text-blue-600" />
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Buyer's Budget</p>
                                    <p className="text-lg font-black text-blue-800">₹{list.expectedPrice || 'Not set'}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-gray-500 text-xs font-bold uppercase tracking-wider">
                                <Clock size={14} className="mr-1 text-blue-600" />
                                Ends: {list.expiredAt ? new Date(list.expiredAt).toLocaleString() : 'No limit'}
                            </div>
                            <p className="text-gray-400">Created {new Date(list.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${list.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-800 text-white'}`}>
                            {list.status}
                        </span>
                        {list.status === 'open' && (
                            <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100">
                                <TrendingDown className="mr-1.5" size={14} />
                                Receiving Bids
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Comparison Matrix */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-12">
                    <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center">
                            <ShoppingBag className="text-blue-600 mr-2" size={20} />
                            <h2 className="text-xl font-black text-gray-800">Bid Comparison Matrix</h2>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Comparing {quotations.length} Vendor Quotes</p>
                    </div>

                    <div className="overflow-x-auto text-left">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-white">
                                    <th className="sticky left-0 z-10 bg-white p-6 border-b border-gray-100 min-w-[300px]">
                                        <div className="flex items-center text-xs font-black text-gray-400 uppercase tracking-widest">
                                            <Package className="mr-2" size={14} /> Grocery Item Details
                                        </div>
                                    </th>
                                    {quotations.map(quote => (
                                        <th key={quote._id} className="p-6 border-b border-gray-100 min-w-[200px] text-center bg-blue-50/30">
                                            <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">{quote.vendorId.name}</div>
                                            <div className="text-[10px] text-gray-400 font-black mb-2 uppercase tracking-tight">{quote.vendorId.phone || 'PHONE NOT PROVIDED BY SERVER'}</div>
                                            <div className="text-2xl font-black text-gray-900">₹{quote.totalAmount.toFixed(2)}</div>
                                            {quote.discountTotal > 0 && (
                                                <div className="text-[10px] bg-green-100 text-green-700 inline-block px-2 py-0.5 rounded-full font-black mt-1">
                                                    SAVE ₹{quote.discountTotal.toFixed(2)}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {list.items.map((listItem, itemIdx) => {
                                    const cheapest = getCheapestPriceForItem(listItem.name);
                                    return (
                                        <tr key={itemIdx} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50/50 p-6 flex items-center space-x-4">
                                                {/* Prioritize master image from first available quotation if list item doesn't have one */}
                                                {(() => {
                                                    const bestItemWithImage = quotations.find(q => q.prices.find(p => p.itemName === listItem.name && p.product?.image))?.prices.find(p => p.itemName === listItem.name);
                                                    const img = listItem.product?.image || bestItemWithImage?.product?.image;
                                                    const brand = listItem.product?.brand || bestItemWithImage?.product?.brand;

                                                    return (
                                                        <>
                                                            {img ? (
                                                                <img src={img} className="w-12 h-12 rounded-xl object-cover bg-gray-100 shadow-sm" alt="" />
                                                            ) : (
                                                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-[8px] font-black text-gray-400 uppercase p-1 text-center">No Image</div>
                                                            )}
                                                            <div>
                                                                <div className="font-bold text-gray-800 leading-tight">{listItem.name}</div>
                                                                <div className="text-xs text-gray-500 font-medium">{brand || 'Generic Brand'} • {listItem.quantity} {listItem.unit}</div>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </td>
                                            {quotations.map(quote => {
                                                const qItem = quote.prices.find(p => p.itemName === listItem.name);
                                                const isCheapest = qItem && qItem.finalPrice === cheapest;
                                                return (
                                                    <td key={quote._id} className={`p-6 text-center ${isCheapest ? 'bg-green-50/20' : ''}`}>
                                                        {qItem ? (
                                                            <div className="space-y-1">
                                                                <div className={`text-lg font-black ${isCheapest ? 'text-green-600' : 'text-gray-800'}`}>
                                                                    ₹{qItem.finalPrice.toFixed(2)}
                                                                </div>
                                                                {qItem.discount > 0 && (
                                                                    <div className="text-[10px] text-gray-400 line-through">₹{qItem.basePrice.toFixed(2)}</div>
                                                                )}
                                                                {isCheapest && <div className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">Best Value</div>}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-300 font-bold italic uppercase">Not Quoted</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td className="sticky left-0 z-10 bg-white p-6 border-t border-gray-100"></td>
                                    {quotations.map(quote => (
                                        <td key={quote._id} className="p-6 border-t border-gray-100 text-center">
                                            {list.status === 'open' ? (
                                                <button
                                                    onClick={() => initiateAcceptQuote(quote)}
                                                    className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                                                >
                                                    Select Vendor
                                                </button>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Finalized</span>
                                                    {quote.status === 'accepted' && (
                                                        <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-xl flex items-center shadow-sm">
                                                            <Phone size={14} className="mr-2" />
                                                            <span className="font-black tracking-tighter text-sm">{quote.vendorId.phone || 'N/A'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Empty State */}
                {quotations.length === 0 && (
                    <div className="bg-white p-20 rounded-3xl border border-dashed border-gray-200 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
                            <Info className="text-gray-300" size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">No Quotations Yet</h2>
                        <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">Vendors will see your request and submit their bids soon. Check back in a few hours!</p>
                    </div>
                )}

                {/* Additional Details */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl text-white shadow-xl">
                        <h3 className="text-xl font-black mb-4 flex items-center">
                            <CheckCircle className="mr-2 text-blue-400" size={20} /> Smart Saver Insights
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-sm mb-6">
                            We've analyzed the bids for this list. The best overall deal is from <span className="text-white font-bold">{quotations.length > 0 ? quotations.sort((a, b) => a.totalAmount - b.totalAmount)[0].vendorId.name : '--'}</span>,
                            saving you approximately ₹{quotations.length > 0 ? (Math.max(...quotations.map(q => q.totalAmount)) - Math.min(...quotations.map(q => q.totalAmount))).toFixed(2) : '0.00'} compared to the highest bid.
                        </p>
                        <div className="flex items-center space-x-4">
                            <div className="bg-gray-700/50 p-3 rounded-2xl flex-grow">
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Total Items</p>
                                <p className="text-xl font-bold">{list.items.length}</p>
                            </div>
                            <div className="bg-gray-700/50 p-3 rounded-2xl flex-grow">
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Active Quotes</p>
                                <p className="text-xl font-bold">{quotations.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Method Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <DollarSign size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Select Payment Method</h3>
                            <p className="text-gray-500 font-medium text-sm mb-8">Choose how you would like to pay for your order from <span className="text-blue-600 font-bold">{selectedQuote?.vendorId.name}</span>.</p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`w-full p-5 rounded-3xl border-2 transition-all flex items-center justify-between ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <div className="flex items-center text-left">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${paymentMethod === 'cod' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-sm">Cash on Delivery</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Pay at your doorstep</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-600' : 'border-gray-200'}`}>
                                        {paymentMethod === 'cod' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('online')}
                                    className={`w-full p-5 rounded-3xl border-2 transition-all flex items-center justify-between ${paymentMethod === 'online' ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <div className="flex items-center text-left">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${paymentMethod === 'online' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-sm">Online Payment</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Wallet or UPI / Cards</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-blue-600 bg-blue-600' : 'border-gray-200'}`}>
                                        {paymentMethod === 'online' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                </button>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAcceptQuote}
                                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
                                >
                                    Confirm Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Order Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-10 text-center">
                            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
                                <CheckCircle size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h3>
                            <p className="text-gray-500 font-medium mb-8">Your groceries are being prepared. Keep this ID handy for tracking.</p>

                            <div className="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200 mb-8 relative group">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">YOUR ORDER ID</p>
                                <div className="flex items-center justify-center gap-3">
                                    <code className="text-lg md:text-xl font-black text-blue-600 break-all">{createdOrderId}</code>
                                    <button
                                        onClick={() => copyToClipboard(createdOrderId)}
                                        className={`p-2 rounded-lg transition-all ${isCopying ? 'bg-green-500 text-white' : 'bg-white text-gray-400 hover:text-blue-600 shadow-sm border border-gray-100'}`}
                                        title="Copy ID"
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>
                                {isCopying && <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-green-500 font-bold uppercase animate-fade-in">Copied to clipboard!</p>}
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => navigate(`/track-order/${createdOrderId}`)}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center gap-2 group transition-all"
                                >
                                    Track My Order <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all font-bold"
                                >
                                    Close & Return
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListDetails;
