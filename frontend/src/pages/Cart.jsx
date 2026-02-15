import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';

import { Trash2, Save } from 'lucide-react';

const Cart = () => {
    const { user } = useContext(AuthContext);
    const { cartItems, removeFromCart, clearCart } = useContext(CartContext);
    const navigate = useNavigate();
    const [listTitle, setListTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateList = async () => {
        if (!listTitle) {
            alert('Please enter a list title');
            return;
        }
        if (cartItems.length === 0) {
            alert('Cart is empty');
            return;
        }

        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };

            const itemsPayload = cartItems.map(item => ({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                unit: item.product.unit
            }));

            await axios.post('https://mygrocery-bcw8.onrender.com/api/lists', {
                title: listTitle,
                items: itemsPayload
            }, config);

            clearCart();
            setLoading(false);
            alert('Grocery List Created Successfully!');
            navigate('/');
        } catch (error) {
            console.error('Error creating list:', error);
            setLoading(false);
            alert('Failed to create list');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="container px-4 py-8 mx-auto">
                <h1 className="mb-8 text-3xl font-bold text-gray-800">Review Your List</h1>

                <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-2">
                        {cartItems.length > 0 ? (
                            <div className="bg-white rounded shadow">
                                <table className="min-w-full leading-normal">
                                    <thead>
                                        <tr>
                                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100">Item</th>
                                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100">Quantity</th>
                                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartItems.map((item) => (
                                            <tr key={item.product._id}>
                                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                                    <p className="font-bold text-gray-900">{item.product.name}</p>
                                                    <p className="text-gray-500">{item.product.brand}</p>
                                                </td>
                                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                                    {item.quantity} {item.product.unit}
                                                </td>
                                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                                    <button onClick={() => removeFromCart(item.product._id)} className="text-red-600 hover:text-red-900">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-white rounded shadow">
                                <p className="text-gray-500">Your cart is empty.</p>
                            </div>
                        )}
                    </div>

                    <div className="h-fit">
                        <div className="p-6 bg-white rounded shadow">
                            <h3 className="mb-4 text-lg font-bold">Finalize List</h3>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-bold text-gray-700">List Title</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded"
                                    placeholder="e.g. Monthly Groceries - March"
                                    value={listTitle}
                                    onChange={(e) => setListTitle(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleCreateList}
                                disabled={loading || cartItems.length === 0}
                                className={`w-full flex items-center justify-center px-4 py-2 text-white rounded ${loading || cartItems.length === 0 ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                <Save size={20} className="mr-2" /> {loading ? 'Saving...' : 'Save & Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
