import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import CONFIG from '../config/Config';

const {BASE_URL} = CONFIG;

const getToken = async rejectWithValue => {
  try {
    console.log('Getting auth token from AsyncStorage');
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      console.log('No auth token found');
      throw new Error('User is not authenticated.');
    }
    console.log('Auth token retrieved successfully');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return rejectWithValue(error.message || 'Failed to fetch token.');
  }
};

export const placeOrder = createAsyncThunk(
  'order/placeOrder',
  async (orderData, {rejectWithValue}) => {
    console.log('placeOrder thunk: Called with orderData:', orderData);

    try {
      const token = await getToken(rejectWithValue);
      console.log('placeOrder thunk: Token retrieved:', token);

      // Ensure shippingFee is a string to match backend schema
      const backendPayload = {
        shippingAddress: orderData.shippingAddress,
        shippingFee: orderData.shippingFee.toString(),
        paymentMethod: orderData.paymentMethod,
        totalAmount: orderData.totalAmount,
        items: orderData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      console.log(
        'placeOrder thunk: Sending payload to backend:',
        backendPayload,
      );

      const response = await axios.post(
        `${BASE_URL}/order/place-order`,
        backendPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('placeOrder thunk: Backend response:', response.data);
      return response.data;
    } catch (error) {
      console.error(
        'placeOrder thunk: Backend error:',
        error.response?.data || error.message,
      );
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getAllOrders = createAsyncThunk(
  'order/getAllOrders',
  async (_, thunkAPI) => {
    console.log('getAllOrders thunk started');
    const {rejectWithValue} = thunkAPI;
    try {
      const token = await getToken(rejectWithValue);
      console.log('Making API call to get all orders');

      const response = await axios.get(`${BASE_URL}/order/get-all-orders`, {
        headers: {Authorization: `Bearer ${token}`},
      });

      console.log('Get all orders API response:', response.data);
      return response.data.orders;
    } catch (error) {
      console.error('Get all orders API error:', error.response?.data || error);
      return rejectWithValue(error.response?.data || 'An error occurred.');
    }
  },
);

export const getOrderById = createAsyncThunk(
  'order/getOrderById',
  async (orderId, {rejectWithValue}) => {
    console.log('getOrderById thunk started for order ID:', orderId);
    try {
      const token = await getToken(rejectWithValue);
      console.log('Making API call to get order by ID');

      const response = await axios.get(
        `${BASE_URL}/order/get-order-by-orderId/${orderId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      console.log('Get order by ID API response:', response.data);
      return response.data;
    } catch (error) {
      console.error(
        'Get order by ID API error:',
        error.response?.data || error,
      );
      return rejectWithValue(
        error.response?.data || 'Failed to fetch order details.',
      );
    }
  },
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // Place Order
      .addCase(placeOrder.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Orders
      .addCase(getAllOrders.pending, state => {
        console.log('getAllOrders.pending reducer');
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        console.log(
          'getAllOrders.fulfilled reducer with payload:',
          action.payload,
        );
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        console.log(
          'getAllOrders.rejected reducer with payload:',
          action.payload,
        );
        state.loading = false;
        state.error = action.payload;
      })

      // Get Order By ID
      .addCase(getOrderById.pending, state => {
        console.log('getOrderById.pending reducer');
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        console.log(
          'getOrderById.fulfilled reducer with payload:',
          action.payload,
        );
        state.loading = false;
        const index = state.orders.findIndex(
          order => order._id === action.payload._id,
        );
        if (index >= 0) {
          state.orders[index] = action.payload;
        } else {
          state.orders.push(action.payload);
        }
      })
      .addCase(getOrderById.rejected, (state, action) => {
        console.log(
          'getOrderById.rejected reducer with payload:',
          action.payload,
        );
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;
