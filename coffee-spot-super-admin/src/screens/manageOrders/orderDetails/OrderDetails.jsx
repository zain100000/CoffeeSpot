import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../../../utils/customLoader/Loader";
import "./OrderDetails.css";
import "../../../styles/globalStyles.css";

const OrderDetails = () => {
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setOrder(location.state?.order || null);
      setLoading(false);
    }, 1000);
  }, [location.state]);

  const getStatusColor = (status) => {
    switch (status) {
      case "ORDER_RECEIVED":
        return "#FFA500"; // Orange
      case "PAYMENT_CONFIRMED":
        return "#4169E1"; // Royal Blue
      case "PREPARING":
        return "#6A5ACD"; // Slate Blue
      case "READY_FOR_PICKUP":
        return "#32CD32"; // Lime Green
      case "PICKED_UP":
        return "#228B22"; // Forest Green
      case "COMPLETED":
        return "#4CAF50"; // Green
      case "CANCELLED":
        return "#FF0000"; // Red
      case "REFUNDED":
        return "#FFC0CB"; // Pink
      default:
        return "#808080"; // Gray
    }
  };

  if (loading) {
    return (
      <div
        className="loader-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Loader />
      </div>
    );
  }

  if (!order) {
    return <div className="not-found">No Order Found</div>;
  }

  return (
    <section id="order-detail">
      <h2 className="orders-title">Order Details</h2>
      <div className="content-container">
        {/* <div className="order-image-container">
          {order?.items?.[0]?.productId?.productImage ? (
            <img
              src={order.items[0].productId.productImage}
              alt={order.items[0].productId.title}
              className="order-image"
              onError={(e) => {
                e.target.src = "/default-order.png";
              }}
            />
          ) : (
            <img
              src="/default-order.png"
              alt="Default"
              className="order-image"
            />
          )}
        </div> */}

        <div className="details-container">
          <div className="details-table">
            <div className="detail-row">
              <div className="detail-label">Order ID</div>
              <div className="detail-value">
                #{order._id.substring(18, 24).toUpperCase()}
              </div>
              <div className="detail-label">Status</div>
              <div className="detail-value">
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Placed At</div>
              <div className="detail-value">
                {new Date(order.placedAt || order.createdAt).toLocaleString()}
              </div>
              <div className="detail-label">Payment Status</div>
              <div className="detail-value">
                <span
                  className="payment-badge"
                  style={{
                    backgroundColor:
                      order.payment === "PAID" ? "#4CAF50" : "#FFA500",
                    color: "white",
                  }}
                >
                  {order.payment}
                </span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Payment Method</div>
              <div className="detail-value">
                <span className="payment-method">{order.paymentMethod}</span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Customer</div>
              <div className="detail-value">{order.userId?.userName}</div>
              <div className="detail-label">Customer Email</div>
              <div className="detail-value">{order.userId?.email}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Customer Phone</div>
              <div className="detail-value">{order.userId?.phone}</div>
              <div className="detail-label">Shipping Address</div>
              <div className="detail-value">{order.shippingAddress}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="order-items-container">
        <h3 className="order-items-title">Order Items</h3>
        <div className="items-table">
          <div className="items-header">
            <div className="header-cell">Product</div>
            <div className="header-cell">Quantity</div>
            <div className="header-cell">Unit Price</div>
            <div className="header-cell">Shipping Fee</div>
            <div className="header-cell">Total Price</div>
          </div>

          {order.items.map((item, index) => (
            <div className="item-row" key={index}>
              <div className="item-cell">
                <img
                  src={item.productId?.productImage || "/default-order.png"}
                  alt={item.productId?.title || "Product"}
                  className="product-image"
                  onError={(e) => {
                    e.target.src = "/default-order.png";
                  }}
                />
              </div>
              <div className="item-cell">
                {item.productId?.title || item.title || "Unknown Product"}
              </div>
              <div className="item-cell">{item.quantity}</div>
              <div className="item-cell">
                PKR {item.productId?.price || item.price || 0}
              </div>
              <div className="item-cell">PKR {order.shippingFee}</div>
              <div className="item-cell">PKR {order.totalAmount}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OrderDetails;
