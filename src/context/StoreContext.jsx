import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [food_list, setFoodList] = useState([]);
  const [token, setToken] = useState("");
  const url = "http://localhost:4000";

  // ✅ Fetch food list
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      setFoodList(response.data.data);
    } catch (err) {
      console.error("Error fetching food list:", err);
    }
  };

  // ✅ Load cart from backend
  const loadCartData = async (token) => {
    if (!token) return;
    try {
      const response = await axios.post(
        `${url}/api/cart/get`,
        {}, // body can be empty if backend uses token to identify user
        { headers: { token } }
      );
      if (response.data && response.data.cart) {
        setCartItems(response.data.cart);
      }
    } catch (err) {
      console.error("Error loading cart from backend:", err);
    }
  };

  // ✅ Add to cart
  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          { headers: { token } }
        );
      } catch (err) {
        console.error("Error adding to cart:", err);
      }
    }
  };

  // ✅ Remove from cart
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const newCount = (prev[itemId] || 0) - 1;
      const updated = { ...prev, [itemId]: Math.max(newCount, 0) };
      if (updated[itemId] === 0) delete updated[itemId];
      return updated;
    });

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          { headers: { token } }
        );
      } catch (err) {
        console.error("Error removing from cart:", err);
      }
    }
  };

  // ✅ Get total cart amount
  const getTotalCartAmount = () => {
    let total = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const product = food_list.find((f) => f._id === item);
        if (product) total += product.price * cartItems[item];
      }
    }
    return total;
  };

  // ✅ Load initial data: token, food list, and cart
  useEffect(() => {
    async function loadData() {
      await fetchFoodList();

      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        await loadCartData(savedToken); // <-- fetch cart from backend
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
    setToken,
    url,
    setCartItems,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
