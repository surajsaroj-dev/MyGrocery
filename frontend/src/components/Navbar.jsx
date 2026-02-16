import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../api/config';
import AuthContext from '../context/AuthContext';
import {
    LogOut,
    LayoutDashboard,
    ShoppingBag,
    ClipboardList,
    Wallet,
    Settings,
    Menu,
    X,
    Search,
    User,
    ChevronDown,
    ShoppingCart,
    Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        ...(user?.role === 'buyer' ? [
            { path: '/catalog', label: 'Marketplace', icon: <ShoppingBag size={18} /> },
            { path: '/track-order', label: 'Track Order', icon: <Truck size={18} /> }
        ] : []),
        { path: '/orders', label: 'Orders', icon: <ClipboardList size={18} /> },
        { path: '/wallet', label: 'Wallet', icon: <Wallet size={18} /> },
    ];

    const adminLinks = [
        { path: '/admin/products', label: 'Products' },
        { path: '/admin/advertisements', label: 'Ads' },
        { path: '/admin/users', label: 'Users' },
    ];

    // Calculate cart items count
    const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    return (
        <nav
            className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/90 backdrop-blur-md shadow-md py-2'
                : 'bg-white border-b border-gray-100 py-4'
                }`}
        >
            <div className="container px-4 mx-auto max-w-7xl">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center group">
                        <div className="bg-blue-600 text-white p-2 rounded-lg mr-2 transform group-hover:rotate-3 transition-transform">
                            <ShoppingBag size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-gray-900 tracking-tight leading-none text-2xl">
                                MG<span className="text-blue-600">GROCERAX</span>
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    {user && (
                        <div className="hidden md:flex items-center space-x-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2
                                        ${isActive(link.path)
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {user.role === 'admin' && (
                                <div className="border-l border-gray-200 ml-2 pl-2 flex items-center space-x-1">
                                    {adminLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors
                                                ${isActive(link.path) ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`
                                            }
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {user ? (
                            <>
                                {/* Cart Icon (Mobile & Desktop) */}
                                {user.role === 'buyer' && (
                                    <Link
                                        to="/cart"
                                        className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    >
                                        <ShoppingCart size={24} />
                                        {cartItemCount > 0 && (
                                            <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white transform translate-x-1 -translate-y-1">
                                                {cartItemCount}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                {/* User Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="flex items-center gap-3 p-1 pl-2 rounded-full border border-gray-200 hover:shadow-md transition-all bg-white"
                                    >
                                        <div className="hidden lg:flex flex-col items-end mr-1">
                                            <span className="text-xs font-bold text-gray-900 leading-none">{user.name}</span>
                                            <span className="text-[10px] uppercase text-blue-600 font-bold leading-none mt-1">{user.role}</span>
                                        </div>
                                        <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 overflow-hidden border border-gray-100">
                                            {user.profileImage ? (
                                                <img
                                                    src={`${API_URL}/${user.profileImage}`}
                                                    alt="Profile"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <User size={18} />
                                            )}
                                        </div>
                                        <ChevronDown size={14} className={`text-gray-400 mr-2 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-4 py-3 border-b border-gray-50 lg:hidden">
                                                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>

                                            <Link to="/wallet" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                                <Wallet size={18} /> Wallet
                                            </Link>
                                            <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                                <Settings size={18} /> Settings
                                            </Link>

                                            <div className="border-t border-gray-50 mt-1 pt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut size={18} /> Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Menu Toggle */}
                                <button
                                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    onClick={() => setIsMobileMenuOpen(true)}
                                >
                                    <Menu size={24} />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">
                                    Sign In
                                </Link>
                                <Link to="/register" className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="absolute inset-y-0 right-0 w-[80%] max-w-xs bg-white shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-xl font-black text-gray-900">Menu</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-grow space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all
                                        ${isActive(link.path)
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            ))}

                            {user?.role === 'admin' && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Admin</p>
                                    {adminLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className="block px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
                            >
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
