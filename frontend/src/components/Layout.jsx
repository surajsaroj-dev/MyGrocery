import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
    const location = useLocation();

    // Routes that should NOT show the header and footer
    const noLayoutRoutes = [
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password'
    ];

    const shouldShowLayout = !noLayoutRoutes.includes(location.pathname);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {shouldShowLayout && <Navbar />}
            <main className="flex-grow">
                {children}
            </main>
            {shouldShowLayout && <Footer />}
        </div>
    );
};

export default Layout;
