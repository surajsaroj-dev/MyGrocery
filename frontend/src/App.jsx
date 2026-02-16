import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// App main entry point
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './components/Dashboard';
import CreateList from './pages/CreateList';

import SubmitQuote from './pages/SubmitQuote';

import ListDetails from './pages/ListDetails';

import MyOrders from './pages/MyOrders';
import TrackOrder from './pages/TrackOrder';
import ProductCatalog from './pages/ProductCatalog';
import Cart from './pages/Cart';
import AdminCategory from './pages/AdminCategory';
import AdminProduct from './pages/AdminProduct';
import AdminOrders from './pages/AdminOrders';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminAdvertisements from './pages/AdminAdvertisements';
import Wallet from './pages/Wallet';
import Referrals from './pages/Referrals';
import AdminUsers from './pages/AdminUsers';
import AdminTransactions from './pages/AdminTransactions';
import Settings from './pages/Settings';
import LogisticsDashboard from './pages/LogisticsDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/create-list" element={<CreateList />} />
              <Route path="/list/:id" element={<ListDetails />} />
              <Route path="/submit-quote/:listId" element={<SubmitQuote />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/track-order/:id?" element={<TrackOrder />} />
              <Route path="/catalog" element={<ProductCatalog />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/admin/categories" element={<AdminCategory />} />
              <Route path="/admin/products" element={<AdminProduct />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/advertisements" element={<AdminAdvertisements />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/transactions" element={<AdminTransactions />} />
              <Route path="/logistics/dashboard" element={<LogisticsDashboard />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}


export default App;
