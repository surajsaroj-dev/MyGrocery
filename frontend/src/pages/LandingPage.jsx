import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { API_URL } from '../api/config';
import { ShoppingCart, Users, TrendingUp, ShieldCheck, ChevronRight, Package } from 'lucide-react';
import AdBanner from '../components/AdBanner';

const LandingPage = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/api/categories');
                // Ensure data is an array before slicing
                if (Array.isArray(data)) {
                    setCategories(data.slice(0, 6)); // Show top 6 categories
                } else {
                    console.warn('Categories API returned non-array data:', data);
                    setCategories([]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b">
                {/* <div className="container px-4 mx-auto">
                    <div className="flex items-center justify-between py-4">
                        <div className="text-2xl font-bold text-green-600 flex items-center">
                            <ShoppingCart className="mr-2" />
                            GroceryMarket
                        </div>
                        <div className="space-x-4">
                            <Link to="/login" className="px-4 py-2 font-semibold text-gray-600 hover:text-green-600">Login</Link>
                            <Link to="/register" className="px-4 py-2 text-white bg-green-600 rounded-full hover:bg-green-700 shadow-md">Get Started</Link>
                        </div>
                    </div>
                </div> */}
            </nav>

            {/* Hero Section */}
            <header className="relative overflow-hidden bg-gray-900 border-b-4 border-green-600 font-sans">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop"
                        alt="Grocery Market"
                        className="object-cover w-full h-full opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-green-900/95 via-emerald-900/90 to-green-800/80"></div>
                </div>
                <div className="container relative px-4 py-24 mx-auto text-center text-white">
                    <div className="inline-block px-4 py-1 mb-6 text-sm font-semibold tracking-wider text-green-300 uppercase bg-green-800/40 rounded-full border border-green-500/30">
                        The Future of Wholesale Groceries
                    </div>
                    <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-7xl">
                        Smart Monthly Grocery <br />
                        <span className="text-green-400">Planning & Sourcing</span>
                    </h1>
                    <p className="max-w-3xl mx-auto mb-10 text-lg md:text-xl text-green-50/80 leading-relaxed">
                        Connect with verified vendors, compare live quotes, and save up to 25% on your bulk household supplies every month.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row items-center">
                        <Link to="/register" className="w-full sm:w-auto px-10 py-4 text-lg font-bold text-green-800 transition bg-white rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95">
                            Start as Buyer
                        </Link>
                        <Link to="/register" className="w-full sm:w-auto px-10 py-4 text-lg font-bold text-white transition bg-green-700/50 backdrop-blur-sm border-2 border-white/20 rounded-full hover:bg-white/10 active:scale-95">
                            Join as Vendor
                        </Link>
                    </div>
                </div>
            </header>

            {/* Advertisement Banner */}
            <section className="container px-4 py-12 mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 italic border-l-4 border-orange-500 pl-3">Hot Offers Today</h2>
                    <span className="text-sm text-gray-500 font-medium">Auto-rotating • Every 5s</span>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                    <AdBanner />
                </div>
            </section>

            {/* Showcase Section (Master Data) */}
            <section className="py-16 bg-white">
                <div className="container px-4 mx-auto text-center">
                    <h2 className="mb-4 text-3xl font-bold text-gray-800">Shop by Category</h2>
                    <p className="mb-12 text-gray-600">Discover quality products across all our specialties.</p>

                    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6 mb-12">
                        {categories.length > 0 ? (
                            categories.map((cat) => (
                                <Link
                                    key={cat._id}
                                    to="/catalog"
                                    className="group relative h-48 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                                >
                                    {/* Background Image */}
                                    <div className="absolute inset-0">
                                        {cat.image ? (
                                            <img
                                                src={`${API_URL}/${cat.image}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                alt={cat.name}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                                                <Package className="text-green-200" size={48} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-green-900/90 transition-all duration-500"></div>
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                                        <div className="w-10 h-10 mx-auto mb-2 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                            <ShoppingCart size={18} />
                                        </div>
                                        <span className="font-black text-white block text-sm tracking-wide uppercase drop-shadow-md">
                                            {cat.name}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            // Placeholder categories if none added yet
                            ['Cereals', 'Dairy', 'Spices', 'Cleaning', 'Personal Care', 'Beverages'].map((name, i) => (
                                <div key={i} className="relative h-48 rounded-3xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 grayscale opacity-60">
                                    <ShoppingCart size={32} className="text-gray-300 mb-3" />
                                    <span className="font-bold text-gray-400 block text-xs tracking-widest uppercase">{name}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <Link to="/catalog" className="inline-flex items-center text-green-600 font-bold hover:underline">
                        Explore Full Product Catalog <ChevronRight size={20} className="ml-1" />
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="container px-4 mx-auto">
                    <h2 className="mb-16 text-3xl font-bold text-center text-gray-800">How It Works</h2>

                    <div className="grid gap-12 md:grid-cols-3">
                        <div className="p-10 text-center transition bg-white rounded-3xl shadow-sm border border-gray-100 relative group">
                            <div className="absolute top-0 right-0 p-4 font-black text-6xl text-gray-50 select-none">01</div>
                            <div className="inline-flex items-center justify-center w-20 h-20 mb-8 text-green-600 bg-green-50 rounded-2xl group-hover:rotate-6 transition-transform">
                                <ShoppingCart size={40} />
                            </div>
                            <h3 className="mb-4 text-2xl font-bold">Build Your List</h3>
                            <p className="text-gray-600 leading-relaxed">Search through thousands of brands and products to create your detailed monthly grocery list in seconds.</p>
                        </div>
                        <div className="p-10 text-center transition bg-white rounded-3xl shadow-sm border border-gray-100 relative group">
                            <div className="absolute top-0 right-0 p-4 font-black text-6xl text-gray-50 select-none">02</div>
                            <div className="inline-flex items-center justify-center w-20 h-20 mb-8 text-blue-600 bg-blue-50 rounded-2xl group-hover:rotate-6 transition-transform">
                                <TrendingUp size={40} />
                            </div>
                            <h3 className="mb-4 text-2xl font-bold">Compare Quotes</h3>
                            <p className="text-gray-600 leading-relaxed">Verified vendors bid for your list. Compare their offers, delivery times, and ratings before you choose.</p>
                        </div>
                        <div className="p-10 text-center transition bg-white rounded-3xl shadow-sm border border-gray-100 relative group">
                            <div className="absolute top-0 right-0 p-4 font-black text-6xl text-gray-50 select-none">03</div>
                            <div className="inline-flex items-center justify-center w-20 h-20 mb-8 text-purple-600 bg-purple-50 rounded-2xl group-hover:rotate-6 transition-transform">
                                <ShieldCheck size={40} />
                            </div>
                            <h3 className="mb-4 text-2xl font-bold">Place Order</h3>
                            <p className="text-gray-600 leading-relaxed">Pay securely through the platform. Your funds are held until the vendor delivers your supplies to your door.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brands Section Placeholder */}
            <section className="py-12 border-t border-gray-100">
                <div className="container px-4 mx-auto">
                    <p className="text-center text-gray-400 font-medium mb-8 uppercase tracking-widest text-xs">Partnered with Leading Brands</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all">
                        {['Nestle', 'Unilever', 'P&G', 'Amul', 'Tata', 'ITC'].map(brand => (
                            <span key={brand} className="text-2xl font-black">{brand}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            {/* <footer className="py-16 text-white bg-gray-950">
                <div className="container px-4 mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-8">
                        <div className="text-2xl font-bold text-white flex items-center">
                            <ShoppingCart className="mr-2 text-green-500" />
                            GroceryMarket
                        </div>
                        <div className="flex gap-8 text-gray-400 text-sm">
                            <Link to="/" className="hover:text-green-500">About Us</Link>
                            <Link to="/" className="hover:text-green-500">Work with Us</Link>
                            <Link to="/" className="hover:text-green-500">Privacy Policy</Link>
                            <Link to="/" className="hover:text-green-500">Contact</Link>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 text-center">
                        <p className="text-gray-500 text-sm">© 2024 Monthly Grocery Platform. Empowering local communities with smart sourcing.</p>
                    </div>
                </div>
            </footer> */}
        </div>
    );
};

export default LandingPage;
