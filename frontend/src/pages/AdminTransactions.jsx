import { useState, useEffect, useContext } from 'react';
import api from '../api/config';
import AuthContext from '../context/AuthContext';
import { CreditCard, ArrowUpRight, ArrowDownLeft, User, ShoppingBag, ExternalLink, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminTransactions = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            console.log('Fetching all transactions for admin...');
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await api.get('/api/wallet/all', config);
            console.log('Transactions received:', data);
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching global transactions:', error.response || error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(tx =>
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx._id.includes(searchTerm)
    );

    const getBadgeStyle = (type) => {
        switch (type) {
            case 'order_payment': return 'bg-blue-100 text-blue-700';
            case 'royalty_deduction': return 'bg-purple-100 text-purple-700';
            case 'referral_commission': return 'bg-amber-100 text-amber-700';
            case 'deposit': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading global logs...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <CreditCard className="text-blue-600" size={32} /> Global Transaction Logs
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">Monitor all financial movements across the platform.</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search by user, description or ID..."
                            className="w-full px-6 py-4 bg-white rounded-2xl shadow-sm border border-gray-100 focus:ring-4 focus:ring-blue-100 outline-none font-bold text-sm transition-all pr-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </div>

                <div className="bg-white rounded-[40px] shadow-xl border border-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction / User</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Related Parties</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Context</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredTransactions.map(tx => (
                                    <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                    {tx.amount > 0 ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 text-sm leading-tight">{tx.description}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <User size={12} className="text-gray-400" />
                                                        <p className="text-[10px] font-black text-blue-600 uppercase">{tx.userId?.name} ({tx.userId?.role})</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${getBadgeStyle(tx.type)}`}>
                                                {tx.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <p className={`text-lg font-black ${tx.amount > 0 ? 'text-green-600' : 'text-red-900'}`}>
                                                {tx.amount > 0 ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                                            </p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">{new Date(tx.createdAt).toLocaleString()}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                {tx.buyerId && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter w-12">Buyer:</span>
                                                        <p className="text-[10px] font-bold text-gray-700">{tx.buyerId.name}</p>
                                                    </div>
                                                )}
                                                {tx.vendorId && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter w-12">Vendor:</span>
                                                        <p className="text-[10px] font-bold text-gray-700">{tx.vendorId.name}</p>
                                                    </div>
                                                )}
                                                {!tx.buyerId && !tx.vendorId && <p className="text-[10px] text-gray-300 italic">No linked parties</p>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {tx.orderId ? (
                                                <button
                                                    onClick={() => navigate(`/track-order/${tx.orderId._id}`)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-gray-100"
                                                >
                                                    <ShoppingBag size={12} />
                                                    View Order
                                                    <ExternalLink size={10} className="opacity-50" />
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 font-bold uppercase italic">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredTransactions.length === 0 && (
                            <div className="p-20 text-center">
                                <p className="text-gray-400 font-bold italic text-lg tracking-tight">No transactions match your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTransactions;
