import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { User, Mail, Lock, MapPin, Phone, UserPlus, ArrowRight, Sparkles, Users, ChevronDown } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
        address: '',
        phone: '',
        referralByCode: ''
    });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await register(formData);
        setLoading(false);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-2 md:p-4 bg-gray-50 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                <div className="bg-white/80 backdrop-blur-xl rounded-[24px] md:rounded-[48px] shadow-2xl shadow-blue-100/50 border border-white overflow-hidden p-4 md:p-8">
                    {/* Header */}
                    <div className="text-center mb-3 md:mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-blue-600 text-white rounded-[16px] md:rounded-[24px] shadow-xl shadow-blue-200 mb-2 md:mb-4 transform hover:rotate-6 transition-transform">
                            <UserPlus size={24} className="md:w-8 md:h-8" />
                        </div>
                    </div>

                    {error && (
                        <div className="mb-2 md:mb-4 p-2 md:p-3 bg-red-50 border-l-4 border-red-500 rounded-2xl flex items-center text-red-700 font-bold text-xs md:text-sm animate-shake">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                            {/* Name */}
                            <div className="space-y-1 md:space-y-2">
                                <label className="block text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="John Doe"
                                        className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 text-sm md:text-base bg-gray-50 border-2 border-transparent rounded-[16px] md:rounded-[24px] font-bold text-gray-900 outline-none focus:bg-white focus:border-blue-600 focus:shadow-lg focus:shadow-blue-50 transition-all"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1 md:space-y-2">
                                <label className="block text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="john@example.com"
                                        className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 text-sm md:text-base bg-gray-50 border-2 border-transparent rounded-[16px] md:rounded-[24px] font-bold text-gray-900 outline-none focus:bg-white focus:border-blue-600 focus:shadow-lg focus:shadow-blue-50 transition-all"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1 md:space-y-2">
                                <label className="block text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 text-sm md:text-base bg-gray-50 border-2 border-transparent rounded-[16px] md:rounded-[24px] font-bold text-gray-900 outline-none focus:bg-white focus:border-blue-600 focus:shadow-lg focus:shadow-blue-50 transition-all"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-1 md:space-y-2">
                                <label className="block text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="+91 99999 99999"
                                        className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 text-sm md:text-base bg-gray-50 border-2 border-transparent rounded-[16px] md:rounded-[24px] font-bold text-gray-900 outline-none focus:bg-white focus:border-blue-600 focus:shadow-lg focus:shadow-blue-50 transition-all"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address - Full Width */}
                        <div className="space-y-1 md:space-y-2">
                            <label className="block text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <MapPin size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Enter your full address"
                                    className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 text-sm md:text-base bg-gray-50 border-2 border-transparent rounded-[16px] md:rounded-[24px] font-bold text-gray-900 outline-none focus:bg-white focus:border-blue-600 focus:shadow-lg focus:shadow-blue-50 transition-all"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                            {/* Role Select */}
                            <div className="space-y-1 md:space-y-2">
                                <label className="block text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Register As</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <Users size={18} />
                                    </div>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <ChevronDown size={18} />
                                    </div>
                                    <select
                                        name="role"
                                        className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-2 md:py-3 text-sm md:text-base bg-gray-50 border-2 border-transparent rounded-[16px] md:rounded-[24px] font-black text-gray-900 outline-none focus:bg-white focus:border-blue-600 focus:shadow-lg focus:shadow-blue-50 transition-all appearance-none cursor-pointer"
                                        value={formData.role}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled>Select </option>
                                        <option value="buyer">🛍️ Buyer / Customer</option>
                                        <option value="vendor">🏪 Vendor / Seller</option>
                                        <option value="logistics">🚚 Logistics Partner</option>
                                    </select>
                                </div>
                            </div>

                            {/* Referral Code */}
                            <div className="space-y-1 md:space-y-2">
                                <label className="block text-[8px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 flex items-center justify-between">
                                    <span>Referral Code</span>
                                    <span className="text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-black">GET REWARDS</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-600/50">
                                        <Sparkles size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="referralByCode"
                                        placeholder="Optional code"
                                        className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 text-sm md:text-base bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-[16px] md:rounded-[24px] font-black text-blue-600 placeholder:text-blue-300 outline-none focus:bg-white focus:border-blue-600 focus:border-solid transition-all"
                                        value={formData.referralByCode}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-3 md:py-4 text-xs md:text-sm bg-blue-600 text-white rounded-[16px] md:rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center group disabled:opacity-70"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Complete Registration
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-3 md:mt-6 text-center">
                        <p className="text-gray-500 font-bold text-xs md:text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-4 transition-colors">
                                Sign In here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out 0s 2;
                }
            `}} />
        </div>
    );
};

export default Register;
