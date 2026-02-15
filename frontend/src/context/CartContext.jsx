import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('groceryCart')) || [];
        setCartItems(savedCart);
    }, []);

    useEffect(() => {
        localStorage.setItem('groceryCart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity) => {
        const existingItem = cartItems.find(item => item.product._id === product._id);
        if (existingItem) {
            setCartItems(cartItems.map(item =>
                item.product._id === product._id
                    ? { ...item, quantity: (parseInt(item.quantity) + parseInt(quantity)).toString() }
                    : item
            ));
        } else {
            setCartItems([...cartItems, { product, quantity: quantity.toString(), name: product.name, unit: product.unit }]);
        }
    };

    const removeFromCart = (productId) => {
        setCartItems(cartItems.filter(item => item.product._id !== productId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};

export default CartContext;
