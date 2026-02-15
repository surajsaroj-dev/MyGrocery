import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

import { Tag, Percent, IndianRupee, ShieldCheck } from 'lucide-react';

const SubmitQuote = () => {
    const { listId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [list, setList] = useState(null);
    const [prices, setPrices] = useState({});
    const [validUntil, setValidUntil] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchList = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                const { data } = await axios.get(`http://localhost:5000/api/lists/${listId}`, config);
                setList(data);

                // Initialize prices state with basePrice and discount
                const initialPrices = {};
                data.items.forEach(item => {
                    initialPrices[item.name] = { basePrice: '', discount: '0' };
                });
                setPrices(initialPrices);
            } catch (error) {
                console.error('Error fetching list:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchList();
    }, [listId, user?.token]);

    const handlePriceUpdate = (itemName, field, value) => {
        setPrices({
            ...prices,
            [itemName]: {
                ...prices[itemName],
                [field]: value
            }
        });
    };

    const calculateFinalPrice = (itemName) => {
        const item = prices[itemName];
        if (!item || !item.basePrice) return 0;
        const base = parseFloat(item.basePrice);
        const disc = parseFloat(item.discount || 0);
        return base - (base * (disc / 100));
    };

    const calculateTotalQuote = () => {
        return Object.keys(prices).reduce((total, name) => {
            return total + calculateFinalPrice(name);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Filter out items with no price entered or invalid prices
            const priceArray = list.items
                .map(item => {
                    const priceData = prices[item.name];
                    if (!priceData) return null;
                    const base = parseFloat(priceData.basePrice);
                    if (isNaN(base)) return null;
                    return {
                        itemName: item.name,
                        product: item.product?._id || item.product, // Preserve link to master data
                        basePrice: base,
                        discount: parseFloat(priceData.discount || 0),
                    };
                })
                .filter(item => item !== null);

            if (priceArray.length === 0) {
                alert('Please enter at least one valid price.');
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };

            await axios.post('http://localhost:5000/api/quotations', {
                listId,
                prices: priceArray,
                validUntil: validUntil || null
            }, config);

            navigate('/');
        } catch (error) {
            console.error('Error submitting quote:', error);
            const msg = error.response?.data?.message || 'Failed to submit quote';
            alert(`Error: ${msg}`);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading list data...</div>;
    if (!list) return <div className="flex items-center justify-center min-h-screen">List not found</div>;

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="container max-w-4xl px-4 py-8 mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Submit Quotation</h1>
                        <p className="text-gray-500 mt-1">For list: <span className="font-semibold text-blue-600">{list.title}</span></p>
                    </div>
                    <div className="flex items-center space-x-12">
                        {list.expectedPrice && (
                            <div className="text-right px-6 py-2 bg-blue-50 rounded-2xl border border-blue-100">
                                <p className="text-[10px] text-blue-500 uppercase tracking-widest font-black">Buyer's Expected Price</p>
                                <p className="text-2xl font-black text-blue-700">₹{list.expectedPrice}</p>
                            </div>
                        )}
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Your Total Proposal</p>
                            <p className="text-3xl font-black text-green-600">₹{calculateTotalQuote().toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-700">Line Items</h3>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{list.items.length} Items</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {list.items.map((item, index) => (
                                        <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start space-x-4">
                                                {/* Product Image preview */}
                                                {item.product?.image ? (
                                                    <img src={item.product.image} alt="" className="w-16 h-16 object-cover rounded-xl bg-gray-100 shadow-sm" />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase p-2 text-center">No Image</div>
                                                )}

                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 text-lg leading-none mb-1">{item.name}</h4>
                                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-black uppercase">{item.quantity} {item.unit}</span>
                                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase">Quality: {item.quality || 'Standard'}</span>
                                                                {item.brandPreference && (
                                                                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-black uppercase">Brand: {item.brandPreference}</span>
                                                                )}
                                                            </div>
                                                            {item.specifications && (
                                                                <div className="mt-2 p-2 bg-amber-50/50 border border-amber-100 rounded-lg">
                                                                    <p className="text-[10px] text-amber-700 font-bold leading-tight">🛑 Buyer's Note: {item.specifications}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Final Price</p>
                                                            <p className="font-black text-gray-900 text-xl">₹{calculateFinalPrice(item.name).toFixed(2)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 flex items-center">
                                                                <Tag size={10} className="mr-1" /> Base Price (Total)
                                                            </label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow font-semibold"
                                                                    value={prices[item.name]?.basePrice || ''}
                                                                    onChange={(e) => handlePriceUpdate(item.name, 'basePrice', e.target.value)}
                                                                    required
                                                                    placeholder="0.00"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 flex items-center">
                                                                <Percent size={10} className="mr-1" /> Discount %
                                                            </label>
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow font-semibold"
                                                                    value={prices[item.name]?.discount || ''}
                                                                    onChange={(e) => handlePriceUpdate(item.name, 'discount', e.target.value)}
                                                                    placeholder="0"
                                                                />
                                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Quote Expiration Date</label>
                                <input
                                    type="date"
                                    className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                    value={validUntil}
                                    onChange={(e) => setValidUntil(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-2 italic px-1">Orders placed after this date will be invalid.</p>
                            </div>

                            <div className="flex items-center justify-end space-x-4 pt-4">
                                <button type="button" onClick={() => navigate('/')} className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
                                <button
                                    type="submit"
                                    className="px-10 py-3 font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
                                >
                                    Submit Proposal
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Buyer Info */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                <ShieldCheck className="mr-2 text-green-500" size={18} />
                                Buyer Verification
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Contact Name</p>
                                    <p className="font-bold text-gray-800">{list.buyerId.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Delivery Address</p>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">{list.buyerId.address || 'Address not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Request Date</p>
                                    <p className="text-sm text-gray-600 font-medium">{new Date(list.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-xl text-white">
                            <h3 className="font-bold mb-2">Vendor Tip</h3>
                            <p className="text-xs text-blue-100 leading-relaxed">Offering a competitive discount of 5-10% increases your chances of being selected by over 40%.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmitQuote;
