import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const { data } = await api.post('/api/auth/forgotpassword', { email });
            setMessage(data.message);
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to send OTP');
        }
    };

    return (
        <div
            className="flex items-center justify-center min-h-screen bg-center bg-cover"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop')" }}
        >
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative w-full max-w-md p-8 bg-white rounded shadow-md">
                <h2 className="mb-6 text-2xl font-bold text-center">Forgot Password</h2>
                {error && <div className="p-2 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}
                {message && <div className="p-2 mb-4 text-green-700 bg-green-100 rounded">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-bold text-gray-700">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
                        Send OTP
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <Link to="/login" className="text-blue-500 hover:underline">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
