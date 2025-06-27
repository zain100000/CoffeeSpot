import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Button from "../../../utils/customButton/Button";
import InputField from "../../../utils/customInputField/InputField";
import { useDispatch } from "react-redux";
import { updateProduct } from "../../../redux/slices/productSlice";
import { toast } from "react-hot-toast";
import "./UpdateProduct.css";

const UpdateProduct = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const originalProduct = location.state?.product || {};
  const [product, setProduct] = useState(originalProduct);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const imageInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(
    product.productImage || "/images/default_product.png"
  );

  const handleChange = (field, value) => {
    const updated = { ...product, [field]: value };
    setProduct(updated);
    setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalProduct));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    handleChange("productImage", file);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasChanges) return;

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(product).forEach(([key, val]) => {
        formData.append(key, val);
      });

      const resultAction = await dispatch(
        updateProduct({ productId: product._id, formData })
      );

      if (updateProduct.fulfilled.match(resultAction)) {
        toast.success("Product updated successfully");
      } else {
        toast.error("Failed to update product");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="update-product">
      <div className="container">
        <div className="row align-items-center justify-content-center mb-4">
          <div className="col-12">
            <h2 className="products-title">Edit Product</h2>
          </div>
        </div>

        <div className="row">
          {/* Image Column */}
          <div className="col-md-4 text-center mb-4">
            <div
              className="img-container"
              onClick={() => imageInputRef.current.click()}
            >
              <img src={imagePreview} alt="Product Preview" className="image" />
              <input
                type="file"
                ref={imageInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleImageSelect}
              />
            </div>
          </div>

          <div className="col-sm-12 col-md-8">
            <div className="row">
              <div className="col-md-12 mb-3">
                <InputField
                  label="Title"
                  value={product.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <InputField
                  label="Description"
                  value={product.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  multiline
                  rows={4}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <InputField
                  label="Price"
                  value={product.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <InputField
                  label="Category"
                  value={product.category?.join(", ") || ""}
                  onChange={(e) =>
                    handleChange(
                      "category",
                      e.target.value.split(",").map((c) => c.trim())
                    )
                  }
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <InputField
                  label="Stock"
                  value={product.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-12 text-center">
                <Button
                  title="Update"
                  width={180}
                  onPress={handleUpdate}
                  loading={loading}
                  icon={<i class="fas fa-sync-alt"></i>}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpdateProduct;
