import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../../utils/customCards/Card";
import { getAllProducts } from "../../redux/slices/productSlice";
import { getAllReviews } from "../../redux/slices/reviewSlice";
import { getAllOrders } from "../../redux/slices/orderSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const products = useSelector((state) => state.products.products);
  const reviews = useSelector((state) => state.reviews.reviews);
  const orders = useSelector((state) => state.orders.orders);
  const orderList = Array.isArray(orders) ? orders : [];

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllProducts());
      dispatch(getAllReviews());
      dispatch(getAllOrders());
    }
  }, [dispatch, user?.id]);

  // Product statistics
  const { totalProducts, totalStock, outOfStock } = products.reduce(
    (acc, product) => {
      acc.totalProducts++;
      acc.totalStock += product.stock || 0;
      if (product.stock <= 0) acc.outOfStock++;
      return acc;
    },
    { totalProducts: 0, totalStock: 0, outOfStock: 0 }
  );

  // Review statistics
  const totalReviews = reviews.length;
  const avgRating =
    reviews.reduce((acc, review) => acc + (review.rating || 0), 0) /
    (totalReviews || 1);

  // Order statistics with new enums
  const {
    orderReceived: orderReceivedCount,
    paymentConfirmed: paymentConfirmedCount,
    preparing: preparingCount,
    readyForPickup: readyForPickupCount,
    pickedUp: pickedUpCount,
    completed: completedCount,
    cancelled: cancelledCount,
    refunded: refundedCount,
    total: totalOrders,
  } = orderList.reduce(
    (acc, order) => {
      switch(order.status) {
        case "ORDER_RECEIVED":
          acc.orderReceived++;
          break;
        case "PAYMENT_CONFIRMED":
          acc.paymentConfirmed++;
          break;
        case "PREPARING":
          acc.preparing++;
          break;
        case "READY_FOR_PICKUP":
          acc.readyForPickup++;
          break;
        case "PICKED_UP":
          acc.pickedUp++;
          break;
        case "COMPLETED":
          acc.completed++;
          break;
        case "CANCELLED":
          acc.cancelled++;
          break;
        case "REFUNDED":
          acc.refunded++;
          break;
      }
      acc.total++;
      return acc;
    },
    {
      orderReceived: 0,
      paymentConfirmed: 0,
      preparing: 0,
      readyForPickup: 0,
      pickedUp: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0,
      total: 0,
    }
  );

  const handleNavigate = (path) => navigate(path);

  return (
    <section id="dashboard" className="p-2">
      <div className="container-fluid">
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "var(--primary)",
            margin: 0,
            paddingLeft: "10px",
            borderLeft: "4px solid var(--primary)",
            marginBottom: "40px"
          }}
        >
          Dashboard Overview
        </h2>

        <div className="row g-2 mb-4">
          <div className="col-12 col-md-6 col-lg-3">
            <Card
              onClick={() => handleNavigate("/admin/products/manage-products")}
              title="Products"
              icon={
                <i
                  className="fas fa-box fa-bounce text-primary"
                  style={{ animationDuration: "2s" }}
                />
              }
              stats={[
                { label: "Total", value: totalProducts },
                { label: "Out of Stock", value: outOfStock },
              ]}
              bgClass="bg-white"
              textClass="text-dark"
            />
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <Card
              onClick={() => handleNavigate("/admin/stocks/manage-stocks")}
              title="Stock"
              icon={
                <i
                  className="fas fa-warehouse fa-flip text-info"
                  style={{ animationDuration: "3s" }}
                />
              }
              stats={[
                { label: "Total Stock", value: totalStock },                
              ]}
              bgClass="bg-white"
              textClass="text-dark"
            />
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <Card
              onClick={() => handleNavigate("/admin/reviews/manage-reviews")}
              title="Reviews"
              icon={
                <i
                  className="fas fa-star fa-spin text-warning"
                  style={{ animationDuration: "5s" }}
                />
              }
              stats={[
                { label: "Total", value: totalReviews },
                { label: "Avg Rating", value: avgRating.toFixed(1) },
              ]}
              bgClass="bg-white"
              textClass="text-dark"
            />
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <Card
              onClick={() => handleNavigate("/admin/orders/manage-orders")}
              title="Orders"
              icon={
                <i
                  className="fas fa-shopping-bag fa-shake text-danger"
                  style={{ animationDuration: "2s" }}
                />
              }
              stats={[
                { label: "Total", value: totalOrders },
                { label: "New Orders", value: orderReceivedCount },
              ]}
              bgClass="bg-white"
              textClass="text-dark"
            />
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-12">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white d-flex align-items-center">
                <h5 className="mb-0 me-2">Orders Status</h5>
                <i className="fas fa-chart-pie text-primary"></i>
              </div>
              <div className="card-body">
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between">
                    <span>Order Received</span>
                    <span className="fw-bold">{orderReceivedCount}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Payment Confirmed</span>
                    <span className="fw-bold">{paymentConfirmedCount}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Preparing</span>
                    <span className="fw-bold">{preparingCount}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Ready for Pickup</span>
                    <span className="fw-bold">{readyForPickupCount}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Picked Up</span>
                    <span className="fw-bold">{pickedUpCount}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Completed</span>
                    <span className="fw-bold">{completedCount}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Cancelled</span>
                    <span className="fw-bold">{cancelledCount}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Refunded</span>
                    <span className="fw-bold">{refundedCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;