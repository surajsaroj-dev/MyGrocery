import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Newsletter Section */}
            <div className="border-b border-gray-800">
                <div className="container px-4 py-12 mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-bold text-white mb-2">Subscribe to our newsletter</h3>
                            <p className="text-gray-400">Get the latest updates and exclusive offers directly in your inbox.</p>
                        </div>
                        <div className="flex w-full md:w-auto gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="w-full md:w-80 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
                            />
                            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
                                Subscribe <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="container px-4 py-16 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div>
                        <Link to="/" className="text-2xl font-black text-white tracking-tighter flex items-center mb-6">
                            🛒 MG <span className="ml-1 text-blue-500">GROCERAX</span>
                        </Link>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Your one-stop destination for monthly grocery needs. Quality products, best prices, and doorstep delivery.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all transform hover:-translate-y-1">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all transform hover:-translate-y-1">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all transform hover:-translate-y-1">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            <li><Link to="/" className="hover:text-blue-500 transition-colors">Home</Link></li>
                            <li><Link to="/catalog" className="hover:text-blue-500 transition-colors">Shop Now</Link></li>
                            <li><Link to="/about" className="hover:text-blue-500 transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-500 transition-colors">Contact Us</Link></li>
                            <li><Link to="/faq" className="hover:text-blue-500 transition-colors">FAQs</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Customer Service</h4>
                        <ul className="space-y-4">
                            <li><Link to="/my-account" className="hover:text-blue-500 transition-colors">My Account</Link></li>
                            <li><Link to="/orders" className="hover:text-blue-500 transition-colors">Order History</Link></li>
                            <li><Link to="/tracking" className="hover:text-blue-500 transition-colors">Order Tracking</Link></li>
                            <li><Link to="/terms" className="hover:text-blue-500 transition-colors">Terms & Conditions</Link></li>
                            <li><Link to="/privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="text-blue-500 mt-1" size={20} />
                                <span>123 Grocery Street, Market Plaza, City, Country 12345</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="text-blue-500" size={20} />
                                <span>+1 (234) 567-8900</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="text-blue-500" size={20} />
                                <span>support@mggrocerax.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="bg-gray-950 py-6">
                <div className="container px-4 mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                    <p>&copy; {currentYear} Monthly Grocery Platform. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="/cookies" className="hover:text-white transition-colors">Cookie Settings</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
