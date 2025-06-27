import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

export const getAllReviews = createAsyncThunk(
  "review/getAllReviews",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/review/get-all-reviews`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.reviews;
    } catch (error) {
      console.error("Error fetching reviews:", error.response?.data); // Log error
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    reviews: [],
    loading: false,
    error: null,
  },
  reducers: {
    setReviews: (state, action) => {
      state.reviews = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload; // Correctly assign the payload
      })
      .addCase(getAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setReviews } = reviewSlice.actions;

export default reviewSlice.reducer;
