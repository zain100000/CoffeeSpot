import React, { useState, useEffect } from "react";
import "./Stock.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProducts,
  updateProduct,
} from "../../../redux/slices/productSlice";
import InputField from "../../../utils/customInputField/InputField";
import Loader from "../../../utils/customLoader/Loader";
import { toast } from "react-hot-toast";

const Stock = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const products = useSelector((state) => state.products.products);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      dispatch(getAllProducts())
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dispatch, user?.id]);

  const filteredProducts = (Array.isArray(products) ? products : []).filter(
    (product) =>
      product.title &&
      product.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleIncreaseStock = (product) => {
    const newStock = (product.stock || 0) + 1;

    dispatch(
      updateProduct({
        productId: product._id,
        formData: { ...product, stock: newStock },
      })
    )
      .unwrap()
      .then((result) => {
        const updatedProducts = products.map((p) =>
          p._id === product._id ? { ...p, stock: newStock } : p
        );
        dispatch({ type: "products/setProducts", payload: updatedProducts });
        toast.success("Stock increased successfully!");
      })
      .catch(() => toast.error("Failed to increase stock."));
  };

  const handleDecreaseStock = (product) => {
    const newStock = product.stock && product.stock > 0 ? product.stock - 1 : 0;

    dispatch(
      updateProduct({
        productId: product._id,
        formData: { ...product, stock: newStock },
      })
    )
      .unwrap()
      .then((result) => {
        const updatedProducts = products.map((p) =>
          p._id === product._id ? { ...p, stock: newStock } : p
        );
        dispatch({ type: "products/setProducts", payload: updatedProducts });
        toast.success("Stock decreased successfully!");
      })
      .catch(() => toast.error("Failed to decrease stock."));
  };

  return (
    <section id="products">
      <div className="products-container">
        <h2 className="products-title">Product Stock</h2>
        <div className="products-header">
          <div className="mt-4">
            <InputField
              type="text"
              placeholder="Search Stock"
              value={search}
              onChange={handleSearch}
              width={300}
            />
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loader-container">
              <Loader />
            </div>
          ) : filteredProducts.length > 0 ? (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="product-info">
                      <img
                        src={product.productImage || "/default-product.png"}
                        alt={product.title}
                        className="product-img"
                        onError={(e) => {
                          e.target.src = "/default-product.png";
                        }}
                      />
                      <div>
                        <div className="product-name">{product.title}</div>
                      </div>
                    </td>
                    <td>
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
                    </td>
                    <td className="actions">
                      <button
                        className="action-btn increase-btn"
                        onClick={() => handleIncreaseStock(product)}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                      <button
                        className="action-btn decrease-btn"
                        onClick={() => handleDecreaseStock(product)}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-products-found">
              <i className="fas fa-box-open"></i>
              <p>No Stock Found</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Stock;
