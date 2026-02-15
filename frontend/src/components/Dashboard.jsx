import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import BuyerDashboard from '../pages/BuyerDashboard';
import VendorDashboard from '../pages/VendorDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import LandingPage from '../pages/LandingPage';

const Dashboard = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <LandingPage />;
    }

    if (user.role === 'buyer') return <BuyerDashboard />;
    if (user.role === 'vendor') return <VendorDashboard />;
    if (user.role === 'admin') return <AdminDashboard />;

    return <div>Unknown Role</div>;
};

export default Dashboard;
