import { useState, useEffect } from "react";
import "../../../styles/globalStyles.css";
import "./Products.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProducts,
  setProducts,
  deleteProduct,
} from "../../../redux/slices/productSlice";
import Modal from "../../../utils/customModal/Modal";
import { toast } from "react-hot-toast";
import InputField from "../../../utils/customInputField/InputField";
import Button from "../../../utils/customButton/Button";
import { useNavigate } from "react-router-dom";
import Loader from "../../../utils/customLoader/Loader";

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const products = useSelector((state) => state.products.products);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
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
      Array.isArray(product.category) &&
      (product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.category.some((cat) =>
          cat.toLowerCase().includes(search.toLowerCase())
        ))
  );

  const handleSearch = (e) => setSearch(e.target.value);

  // const handleViewDetailChange = (product) => {
  //   navigate(`/admin/products/product-details/${product._id}`, {
  //     state: { product },
  //   });
  // };

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const deleteProductHandler = async () => {
    setLoadingAction("DELETE");
    try {
      if (selectedProduct?._id) {
        await dispatch(deleteProduct(selectedProduct._id));
        toast.success("Product deleted successfully!");
        dispatch(
          setProducts(products.filter((doc) => doc._id !== selectedProduct._id))
        );
      }
    } catch {
      toast.error("Error while deleting product.");
    } finally {
      setLoadingAction(null);
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleEditProduct = (product) => {
    navigate(`/admin/products/edit-product/${product._id}`, {
      state: { product },
    });
  };

  const handleAddProductNavigate = () => {
    navigate("/admin/products/add-product");
  };

  return (
    <section id="products">
      <div className="products-container">
        <h2 className="products-title">Products List</h2>
        <div className="products-header">
          <div className="mt-4">
            <InputField
              type="text"
              placeholder="Search Products"
              value={search}
              onChange={handleSearch}
              width={300}
            />
          </div>
          <Button
            title="Product"
            width={150}
            onPress={handleAddProductNavigate}
            icon={<i className="fas fa-plus-circle"></i>}
          />
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
                  <th>Category</th>
                  <th>Price</th>
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
                        <div className="product-description">
                          {product.description.substring(0, 30)}...
                        </div>
                      </div>
                    </td>
                    <td>
                      {Array.isArray(product.category)
                        ? product.category.join(", ")
                        : product.category}
                    </td>
                    <td>PKR{product.price}</td>
                    <td className="actions">
                      {/* <button
                        className="action-btn view-btn"
                        onClick={() => handleViewDetailChange(product)}
                      >
                        <i className="fas fa-eye"></i>
                      </button> */}
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditProduct(product)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteProduct(product)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-products-found">
              <i className="fas fa-box-open"></i>
              <p>No Products Found</p>
            </div>
          )}
        </div>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title={`Delete ${selectedProduct?.title}`}
          loading={loadingAction === "DELETE"}
          icon={<i class="fas fa-trash"></i>}
          buttons={[
            {
              label: "Delete",
              className: "danger-btn",
              onClick: deleteProductHandler,
              loading: loadingAction === "DELETE",
            },
          ]}
        >
          <p>Are you sure you want to delete this product?</p>
          <p className="text-muted">This action cannot be undone.</p>
        </Modal>
      </div>
    </section>
  );
};

export default Products;
