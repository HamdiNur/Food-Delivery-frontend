import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const url = "http://localhost:4000"
    const [token, setToken] = useState("")
    const [food_list,setFoodList]=useState([])

    const addToCart = (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }))
        } else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
        }
    }

    const removeFromCart = (itemId) => {
        setCartItems(prev => {
            const newCount = (prev[itemId] || 0) - 1;
            return { ...prev, [itemId]: Math.max(newCount, 0) } // ✅ prevent negative
        })
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item)
                totalAmount += itemInfo.price * cartItems[item];
            }
        }
        return totalAmount;
    }
    const fetchFoodList=async()=>{
        const response=await axios.get(url+"/api/food/list")
        setFoodList(response.data.data)
    }

    // ✅ persist token on refresh
    useEffect(() => {
        
        async function loadData(){
            await fetchFoodList();
               const savedToken = localStorage.getItem("token");
        if (savedToken) setToken(savedToken);
        }
        loadData();

    }, []);

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken
    }

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider
