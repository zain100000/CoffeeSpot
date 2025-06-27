import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../navigation/outlet/Outlet";
import ProtectedRoute from "./protectedRoutes/ProtectedRoutes";

// Authentication Screens
import Signin from "../screens/auth/Signin";
import NotFound from "../screens/notFound/NotFound";

// Dashboard Screens
import Dashboard from "../screens/dashboard/Dashboard";

// Product Management Screens
import ManageProducts from "../screens/manageProducts/products/Products";
import AddProduct from "../screens/manageProducts/addProducts/AddProduct";
import UpdateProduct from "../screens/manageProducts/updateProduct/UpdateProduct";
import ProductDetails from "../screens/manageProducts/productDetails/ProductDetails";

// Stock Management Screens
import Stock from "../screens/manageStock/stock/Stock";

// Review Management Screens
import Reviews from "../screens/manageReviews/reviews/Reviews";

// Order Management Screens
import Orders from "../screens/manageOrders/orders/Orders";
import OrderDetails from "../screens/manageOrders/orderDetails/OrderDetails";

// Chats Management Screens
import ChatList from "../screens/manageChats/chatLists/ChatList";
import Messages from "../screens/manageChats/messages/Messages";

const AppNavigator = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Signin />} />

      {/* Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Make dashboard the index route for /admin */}
        <Route index element={<Dashboard />} />

        {/* Dashboard Routes */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Product Management Routes */}
        <Route path="products/manage-products" element={<ManageProducts />} />
        <Route path="products/add-product" element={<AddProduct />} />
        <Route path="products/edit-product/:id" element={<UpdateProduct />} />
        <Route
          path="products/product-details/:id"
          element={<ProductDetails />}
        />

        {/* Stock Management Routes */}
        <Route path="stocks/manage-stocks" element={<Stock />} />

        {/* Review Management Routes */}
        <Route path="reviews/manage-reviews" element={<Reviews />} />

        {/* Order Management Routes */}
        <Route path="orders/manage-orders" element={<Orders />} />
        <Route path="orders/order-details/:id" element={<OrderDetails />} />

        {/* Chats Management Routes */}
        <Route path="customer-care/chats" element={<ChatList />} />
        <Route path="customer-care/chat-details/:id" element={<Messages />} />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppNavigator;
