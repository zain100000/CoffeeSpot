import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import CONFIG from '../config/Config';

const {BASE_URL} = CONFIG;

// Utility to fetch bearer token
const getToken = async rejectWithValue => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) throw new Error('User is not authenticated.');
    return token;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch token.');
  }
};

// addToCart, removeFromCart, removeAllFromCart, getAllCartItems thunks
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({productId}, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      const {data} = await axios.post(
        `${BASE_URL}/cart/add-to-cart`,
        {productId},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      // always return an array
      return Array.isArray(data.cart) ? data.cart : [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({productId}, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      const {data} = await axios.post(
        `${BASE_URL}/cart/remove-from-cart`,
        {productId},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return Array.isArray(data.cart) ? data.cart : [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const removeAllFromCart = createAsyncThunk(
  'cart/removeAllFromCart',
  async ({productId}, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      await axios.delete(`${BASE_URL}/cart/remove-all-cart-items`, {
        data: {productId},
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return productId;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const getAllCartItems = createAsyncThunk(
  'cart/getAllCartItems',
  async (_, {rejectWithValue}) => {
    try {
      const token = await getToken(rejectWithValue);
      const {data} = await axios.get(`${BASE_URL}/cart/get-all-cart-items`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      return Array.isArray(data.cart) ? data.cart : [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
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
      const idx = state.cartItems.findIndex(
        it => it.productId._id === productId,
      );
      if (idx !== -1) state.cartItems[idx].quantity = quantity;
    },
  },
  extraReducers: builder => {
    builder
      // Add
      .addCase(addToCart.pending, s => {
        s.loading = true;
        s.error = null;
      })
      .addCase(addToCart.fulfilled, (s, a) => {
        s.loading = false;
        s.cartItems = a.payload;
      })
      .addCase(addToCart.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // Remove one
      .addCase(removeFromCart.pending, s => {
        s.loading = true;
        s.error = null;
      })
      .addCase(removeFromCart.fulfilled, (s, a) => {
        s.loading = false;
        s.cartItems = a.payload;
      })
      .addCase(removeFromCart.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // Remove all
      .addCase(removeAllFromCart.pending, s => {
        s.loading = true;
        s.error = null;
      })
      .addCase(removeAllFromCart.fulfilled, (s, a) => {
        s.loading = false;
        s.cartItems = s.cartItems.filter(it => it.productId._id !== a.payload);
      })
      .addCase(removeAllFromCart.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // Get all
      .addCase(getAllCartItems.pending, s => {
        s.loading = true;
      })
      .addCase(getAllCartItems.fulfilled, (s, a) => {
        s.loading = false;
        s.cartItems = a.payload;
      })
      .addCase(getAllCartItems.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export const {updateCartItem} = cartSlice.actions;
export default cartSlice.reducer;
