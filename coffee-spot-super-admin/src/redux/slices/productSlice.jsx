import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

export const addProduct = createAsyncThunk(
  "product/addProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const token = getToken();

      const response = await axios.post(
        `${BACKEND_API_URL}/product/add-product`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to upload product"
      );
    }
  }
);

export const getAllProducts = createAsyncThunk(
  "product/getAllProducts",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/product/get-all-products`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.products;
    } catch (error) {
      console.error("Error fetching products:", error.response?.data); // Log error
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

export const getProductById = createAsyncThunk(
  "product/getProductById",
  async (productId, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/product/get-product-by-id/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ productId, formData }, { rejectWithValue }) => {
    try {
      const token = getToken();

      const response = await axios.patch(
        `${BACKEND_API_URL}/product/update-product/${productId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update product"
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (productId, { getState, rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.delete(
        `${BACKEND_API_URL}/product/delete-product/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { products } = getState().products;
      return products.filter((product) => product._id !== productId);
    } catch (error) {
      console.error("Delete Error:", error.response?.data); // Log error message
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload; // Correctly assign the payload
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = action.payload;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setProducts } = productSlice.actions;

export default productSlice.reducer;
