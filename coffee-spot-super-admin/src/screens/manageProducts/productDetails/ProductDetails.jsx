import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../../../utils/customLoader/Loader";
import "../../../styles/globalStyles.css";
import "./ProductDetails.css";

const ProductDetails = () => {
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setProduct(location.state?.product || null);
      setLoading(false);
    }, 1000);
  }, [location.state]);

  if (loading) {
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );
  }

  if (!product) {
    return <div className="not-found">No Product Found</div>;
  }

  return (
    <section id="product-detail">
      <h2 className="products-title">Products List</h2>
      <div className="content-container">
        <div className="product-image-container">
          <img
            src={product.productImage || "/default-product.png"}
            alt="Product"
            className="product-image"
            onError={(e) => {
              e.target.src = "/default-product.png";
            }}
          />
        </div>

        <div className="details-container">
          <div className="details-table">
            <div className="detail-row">
              <div className="detail-label">Title</div>
              <div className="detail-value">{product.title}</div>
              <div className="detail-label">Category</div>
              <div className="detail-value">
                {Array.isArray(product.category)
                  ? product.category.join(", ")
                  : product.category}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Description</div>
              <div className="detail-value description">
                {product.description}
              </div>
              <div className="detail-label">Price</div>
              <div className="detail-value price">PKR {product.price}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Stock</div>
              <div className="detail-value">
                <span
                  className={`stock-badge ${
                    product.stock > 10
                      ? "in-stock"
                      : product.stock > 0
                      ? "low-stock"
                      : "out-of-stock"
                  }`}
                >
                  {product.stock}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
