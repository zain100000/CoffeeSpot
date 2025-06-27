import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../../../utils/customLoader/Loader";
import "./OrderDetails.css";
import "../../../styles/globalStyles.css";

const OrderDetails = () => {
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("ORDERS", order);

  useEffect(() => {
    setTimeout(() => {
      setOrder(location.state?.order || null);
      setLoading(false);
    }, 1000);
  }, [location.state]);

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
        <div className="order-image-container">
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
        </div>

        <div className="details-container">
          <div className="details-table">
            <div className="detail-row">
              <div className="detail-label">Order ID</div>
              <div className="detail-value">
                #{order._id.substring(18, 24).toUpperCase()}
              </div>
              <div className="detail-label">Status</div>
              <div className="detail-value">
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Placed At</div>
              <div className="detail-value">
                {new Date(order.placedAt).toLocaleString()}
              </div>
              <div className="detail-label">Payment Status</div>
              <div className="detail-value">
                <span className={`status-badge ${order.payment.toLowerCase()}`}>
                  {order.payment}
                </span>
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
              <div className="detail-label">Customer Address</div>
              <div className="detail-value">{order.userId?.address}</div>
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
            <div className="header-cell">Total Price</div>
          </div>

          {order.items.map((item) => (
            <div className="item-row" key={item._id}>
              <div className="item-cell">{item.productId?.title}</div>
              <div className="item-cell">{item.quantity}</div>
              <div className="item-cell">PKR{item.productId?.price}</div>
              <div className="item-cell">
                PKR{(item.productId?.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OrderDetails;
