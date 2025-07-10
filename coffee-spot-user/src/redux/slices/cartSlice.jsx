import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import CONFIG from '../config/Config';

const {BASE_URL} = CONFIG;

// Utility to fetch token
const getToken = async rejectWithValue => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) throw new Error('User is not authenticated.');
    return token;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch token.');
  }
};

// Add to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({productId}, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.post(
        `${BASE_URL}/cart/add-to-cart`,
        {productId},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Remove one quantity from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({productId}, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.post(
        `${BASE_URL}/cart/remove-from-cart`,
        {productId},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Remove all instances of one product
export const removeAllFromCart = createAsyncThunk(
  'cart/removeAllFromCart',
  async ({productId}, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.delete(
        `${BASE_URL}/cart/remove-all-cart-items`,
        {
          data: {productId},
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return {productId};
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Fetch all cart items
export const getAllCartItems = createAsyncThunk(
  'cart/getAllCartItems',
  async (_, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.get(`${BASE_URL}/cart/get-all-cart-items`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateCartItem: (state, action) => {
      const {productId, quantity} = action.payload;
      const itemIndex = state.cartItems.findIndex(
        item => item.productId._id === productId,
      );
      if (itemIndex !== -1) {
        state.cartItems[itemIndex].quantity = quantity;
      }
    },
  },
  extraReducers: builder => {
    builder
      // Add
      .addCase(addToCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove
      .addCase(removeFromCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove All
      .addCase(removeAllFromCart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeAllFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = state.cartItems.filter(
          item => item.productId._id !== action.payload.productId,
        );
      })
      .addCase(removeAllFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All
      .addCase(getAllCartItems.pending, state => {
        state.loading = true;
      })
      .addCase(getAllCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAllCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {updateCartItem} = cartSlice.actions;

export default cartSlice.reducer;
