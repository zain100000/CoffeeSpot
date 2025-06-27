import React, { useState, useEffect } from "react";
import "./Orders.css";
import "../../../styles/globalStyles.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrders,
  setOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../../../redux/slices/orderSlice";
import { useNavigate } from "react-router-dom";
import Loader from "../../../utils/customLoader/Loader";
import InputField from "../../../utils/customInputField/InputField";
import Modal from "../../../utils/customModal/Modal";
import { toast } from "react-hot-toast";

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const orders = useSelector((state) => state.orders.orders);

  console.log("ORDERS", orders)

  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPaymentStatusModalOpen, setIsPaymentStatusModalOpen] =
    useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      dispatch(getAllOrders())
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dispatch, user?.id]);

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter((order) =>
    order.status?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetail = (order) => {
    navigate(`/admin/orders/order-details/${order._id}`, {
      state: { order },
    });
  };

  const handleStatusChange = (order) => {
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };

  const changeOrderStatus = async (status) => {
    setLoadingAction(status);
    try {
      if (selectedOrder?._id) {
        await dispatch(
          updateOrderStatus({
            orderId: selectedOrder._id,
            status: status,
          })
        ).unwrap();

        toast.success(`Status changed to successfully!`);

        // Update local state
        const updatedOrders = orders.map((order) =>
          order._id === selectedOrder._id ? { ...order, status } : order
        );
        dispatch(setOrders(updatedOrders));
      }
    } catch (error) {
      toast.error(`Failed to change status: ${error.message}`);
    } finally {
      setLoadingAction(null);
      setIsStatusModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const handlePaymentStatusChange = (order) => {
    setSelectedOrder(order);
    setIsPaymentStatusModalOpen(true);
  };

  const changePaymentStatus = async (payment) => {
    setLoadingAction(payment);
    try {
      if (selectedOrder?._id) {
        await dispatch(
          updatePaymentStatus({
            orderId: selectedOrder._id,
            payment: payment,
          })
        ).unwrap();

        toast.success(`Payment Status changed successfully!`);

        // Update local state
        const updatedOrders = orders.map((order) =>
          order._id === selectedOrder._id ? { ...order, payment } : order
        );
        dispatch(setOrders(updatedOrders));
      }
    } catch (error) {
      toast.error(`Failed to change payment status: ${error.message}`);
    } finally {
      setLoadingAction(null);
      setIsPaymentStatusModalOpen(false);
      setSelectedOrder(null);
    }
  };

  return (
    <section id="orders">
      <div className="orders-container">
        <h2 className="orders-title">Orders List</h2>
        <div className="orders-header">
          <div className="mt-4">
            <InputField
              type="text"
              placeholder="Search Orders"
              value={search}
              onChange={handleSearch}
              width={300}
            />
          </div>
          {/* Removed the "Add Product" button equivalent */}
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loader-container">
              <Loader />
            </div>
          ) : filteredOrders.length > 0 ? (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-id">
                      #{order._id.substring(18, 24).toUpperCase()}
                    </td>
                    <td className="order-customer">
                      {order.userId?.userName || "N/A"}
                    </td>
                    <td className="payment-status">
                      <span
                        className={`payment-badge ${order.payment.toLowerCase()}`}
                      >
                        {order.payment}
                      </span>
                    </td>
                    <td className="order-status">
                      <span
                        className={`status-badge ${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="action-btn view-detail"
                        onClick={() => handleViewDetail(order)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>

                      <button
                        className="action-btn status-change"
                        onClick={() => handleStatusChange(order)}
                      >
                        <i className="fas fa-sync"></i>
                      </button>

                      <button
                        className="action-btn payment-status-change"
                        onClick={() => handlePaymentStatusChange(order)}
                      >
                        <i className="fas fa-money-bill"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-orders-found">
              <i className="fas fa-box-open"></i>
              <p>No Orders Found</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Change Status for #${
            selectedOrder?._id?.substring(18, 24).toUpperCase() || "Order"
          }`}
          loading={loadingAction !== null}
          buttons={["PROCESSING", "DELIVERED"].map((status) => ({
            label: status.charAt(0) + status.slice(1).toLowerCase(),
            className: `modal-btn-${status.toLowerCase()}`,
            onClick: () => changeOrderStatus(status),
            loading: loadingAction === status,
          }))}
        >
          Are you sure you want to change the status of this order?
        </Modal>

        <Modal
          isOpen={isPaymentStatusModalOpen}
          onClose={() => setIsPaymentStatusModalOpen(false)}
          title={`Change Payment Status for #${
            selectedOrder?._id?.substring(18, 24).toUpperCase() || "Order"
          }`}
          loading={loadingAction !== null}
          buttons={["PAID"].map((payment) => ({
            label: payment.charAt(0) + payment.slice(1).toLowerCase(),
            className: `modal-btn-${payment.toLowerCase()}`,
            onClick: () => changePaymentStatus(payment),
            loading: loadingAction === payment,
          }))}
        >
          Are you sure you want to change the payment status of this order?
        </Modal>
      </div>
    </section>
  );
};

export default Orders;
