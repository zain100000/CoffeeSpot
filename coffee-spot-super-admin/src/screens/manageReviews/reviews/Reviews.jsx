import React, { useState, useEffect } from "react";
import "../../../styles/globalStyles.css";
import "./Reviews.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllReviews } from "../../../redux/slices/reviewSlice";
import InputField from "../../../utils/customInputField/InputField";
import Loader from "../../../utils/customLoader/Loader";

const Reviews = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const reviews = useSelector((state) => state.reviews.reviews);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      dispatch(getAllReviews())
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dispatch, user?.id]);

  const filteredReviews = (Array.isArray(reviews) ? reviews : []).filter(
    (review) =>
      review.comment &&
      review.comment.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const renderStars = (count) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fas fa-star ${
            i <= count ? "filled" : "unfilled"
          } star-icon`}
        ></i>
      );
    }
    return stars;
  };

  return (
    <section id="review">
      <div className="reviews-container">
        <h2 className="reviews-title">Reviews List</h2>
        <div className="search-container">
          <InputField
            type="text"
            placeholder="Search Reviews"
            value={search}
            onChange={handleSearch}
            width={300}
          />
        </div>
        <div className="table-responsive">
          {loading ? (
            <div className="loader-container">
              <Loader />
            </div>
          ) : filteredReviews.length > 0 ? (
            <table className="review-table">
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Reviewer Comment</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review, index) => (
                  <tr key={index}>
                    <td className="user-profile">
                      <img
                        src={
                          review?.userId?.profilePicture || "/default-user.png"
                        }
                        alt={review?.userId?.userName}
                        className="user-img"
                        onError={(e) => {
                          e.target.src = "/default-user.png";
                        }}
                      />
                      <span className="user-name">
                        {review?.userId?.userName}
                      </span>
                    </td>
                    <td className="review-comment">{review.comment}</td>
                    <td className="review-rating">
                      <div className="stars-container">
                        {renderStars(review.rating)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-reviews-found">
              <i className="fas fa-star"></i>
              <p>No Reviews Found</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
