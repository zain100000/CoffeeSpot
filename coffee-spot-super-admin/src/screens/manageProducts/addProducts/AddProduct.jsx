import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import "./AddProduct.css";
import "../../../styles/globalStyles.css";
import InputField from "../../../utils/customInputField/InputField";
import Button from "../../../utils/customButton/Button";
import imgPlaceholder from "../../../assets/logo/logo.png";
import {
  validateTitle,
  validateDescription,
  validatePrice,
  validateCategory,
  validateStock,
  validateFields,
} from "../../../utils/customValidations/Validations";
import { addProduct } from "../../../redux/slices/productSlice";
import { toast } from "react-hot-toast";

const AddProduct = () => {
  const dispatch = useDispatch();
  const imageInputRef = useRef(null);
  const [productImage, setProductImage] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState([]);
  const [stock, setStock] = useState("");
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [stockError, setStockError] = useState("");

  useEffect(() => {
    const hasErrors =
      titleError ||
      descriptionError ||
      priceError ||
      categoryError ||
      stockError ||
      !title ||
      !description ||
      !price ||
      category.length === 0 ||
      !stock;
  }, [
    titleError,
    descriptionError,
    priceError,
    categoryError,
    stockError,
    title,
    description,
    price,
    category,
    stock,
  ]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setTitleError(validateTitle(e.target.value));
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    setDescriptionError(validateDescription(e.target.value));
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
    setPriceError(validatePrice(e.target.value));
  };

  const handleCategoryChange = (e) => {
    const categories = e.target.value.split(",").map((cat) => cat.trim());
    setCategory(categories);
    setCategoryError(validateCategory(categories));
  };

  const handleStockChange = (e) => {
    setStock(e.target.value);
    setStockError(validateStock(e.target.value));
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setProductImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();

    const fields = {
      title,
      description,
      price,
      category,
      stock,
    };

    const errors = validateFields(fields);
    if (Object.keys(errors).length > 0) {
      toast.error(errors[Object.keys(errors)[0]]);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) =>
        formData.append(
          key,
          Array.isArray(value) ? JSON.stringify(value) : value
        )
      );

      if (productImage) {
        formData.append("productImage", productImage);
      }

      const resultAction = await dispatch(addProduct(formData));

      if (addProduct.fulfilled.match(resultAction)) {
        toast.success("Product added successfully");
        resetForm();
      } else if (addProduct.rejected.match(resultAction)) {
        toast.error(resultAction.payload?.error || "Failed to add product");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setCategory([]);
    setStock("");
    setProductImage(null);
    setProductImagePreview(null);
  };

  return (
    <section id="upload-product">
      <div className="container">
        <div className="row align-items-center justify-content-center">
          <div className="col-sm-12 col-md-12 col-lg-12">
            <h2 className="products-title">Add Product</h2>
          </div>
        </div>

        <div className="row align-items-center justify-content-center">
          <div className="col-md-4 text-center mb-4">
            <div
              className="img-container"
              onClick={() => imageInputRef.current.click()}
            >
              <img
                src={productImagePreview || imgPlaceholder}
                alt="Product"
                className="image"
              />
            </div>
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageSelect}
            />
          </div>

          <div className="col-sm-12 col-md-12 col-lg-8">
            <div className="row">
              <div className="col-md-12 mb-3">
                <InputField
                  label="Title"
                  value={title}
                  onChange={handleTitleChange}
                  error={titleError}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <InputField
                  label="Description"
                  value={description}
                  onChange={handleDescriptionChange}
                  error={descriptionError}
                  required
                  multiline
                  rows={4}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <InputField
                  label="Price"
                  value={price}
                  onChange={handlePriceChange}
                  error={priceError}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <InputField
                  label="Category (comma separated)"
                  value={category.join(", ")}
                  onChange={handleCategoryChange}
                  error={categoryError}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <InputField
                  label="Stock"
                  value={stock}
                  onChange={handleStockChange}
                  error={stockError}
                  required
                />
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-sm-12 col-md-12 col-lg-12 text-center">
                <Button
                  title="Add Product"
                  width={180}
                  onPress={handleAddProduct}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddProduct;
