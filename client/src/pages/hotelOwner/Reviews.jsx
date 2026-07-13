import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import {
  Star,
  MessageSquare,
  Building,
  Calendar,
  Check,
  X,
  Trash2,
  Send,
  Reply,
} from "lucide-react";

export default function Reviews() {
  const { axios, getToken } = useAppContext();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Which review currently has the response box open
  const [respondingReviewId, setRespondingReviewId] = useState(null);

  // Admin response text
  const [responseText, setResponseText] = useState("");

  // Stores the review currently being processed
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // =========================================================
  // FETCH HOTEL REVIEWS
  // =========================================================

  const fetchReviews = useCallback(async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/reviews/hotel", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setReviews(data.reviews || []);
      } else {
        toast.error(data.message || "Failed to fetch reviews");
      }
    } catch (error) {
      console.log(
        "FETCH REVIEWS ERROR:",
        error.response?.data || error.message,
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch reviews",
      );
    } finally {
      setLoading(false);
    }
  }, [axios, getToken]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // =========================================================
  // APPROVE REVIEW
  // =========================================================

  const approveReview = async (reviewId) => {
    try {
      setActionLoadingId(reviewId);

      const token = await getToken();

      const { data } = await axios.patch(
        `/api/reviews/${reviewId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message || "Review approved successfully");

        setReviews((previousReviews) =>
          previousReviews.map((review) =>
            review._id === reviewId
              ? {
                  ...review,
                  status: "approved",
                }
              : review,
          ),
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(
        "APPROVE REVIEW ERROR:",
        error.response?.data || error.message,
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to approve review",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // =========================================================
  // REJECT REVIEW
  // =========================================================

  const rejectReview = async (reviewId) => {
    try {
      setActionLoadingId(reviewId);

      const token = await getToken();

      const { data } = await axios.patch(
        `/api/reviews/${reviewId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message || "Review rejected successfully");

        setReviews((previousReviews) =>
          previousReviews.map((review) =>
            review._id === reviewId
              ? {
                  ...review,
                  status: "rejected",
                }
              : review,
          ),
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(
        "REJECT REVIEW ERROR:",
        error.response?.data || error.message,
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to reject review",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // =========================================================
  // OPEN RESPONSE BOX
  // =========================================================

  const openResponseBox = (review) => {
    setRespondingReviewId(review._id);
    setResponseText(review.adminResponse || "");
  };

  // =========================================================
  // CLOSE RESPONSE BOX
  // =========================================================

  const closeResponseBox = () => {
    setRespondingReviewId(null);
    setResponseText("");
  };

  // =========================================================
  // RESPOND TO REVIEW
  // =========================================================

  const respondToReview = async (reviewId) => {
    const trimmedResponse = responseText.trim();

    if (!trimmedResponse) {
      return toast.error("Please enter a response");
    }

    try {
      setActionLoadingId(reviewId);

      const token = await getToken();

      const { data } = await axios.patch(
        `/api/reviews/${reviewId}/respond`,
        {
          response: trimmedResponse,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message || "Response added successfully");

        setReviews((previousReviews) =>
          previousReviews.map((review) =>
            review._id === reviewId
              ? {
                  ...review,
                  adminResponse: data.review?.adminResponse || trimmedResponse,
                  respondedAt:
                    data.review?.respondedAt || new Date().toISOString(),
                }
              : review,
          ),
        );

        closeResponseBox();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(
        "RESPOND REVIEW ERROR:",
        error.response?.data || error.message,
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to respond to review",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // =========================================================
  // DELETE REVIEW
  // =========================================================

  const deleteReview = async (reviewId) => {
    const result = await Swal.fire({
      title: "Delete Review?",
      text: "This review will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoadingId(reviewId);

      const token = await getToken();

      const { data } = await axios.delete(`/api/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        toast.success(data.message || "Review deleted successfully");

        setReviews((previousReviews) =>
          previousReviews.filter((review) => review._id !== reviewId),
        );

        if (respondingReviewId === reviewId) {
          closeResponseBox();
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(
        "DELETE REVIEW ERROR:",
        error.response?.data || error.message,
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete review",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // =========================================================
  // GET REVIEW STATUS
  // =========================================================

  const getReviewStatus = (review) => {
    // Support old reviews that were created before status existed
    return review.status || "approved";
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const renderStatusBadge = (review) => {
    const status = getReviewStatus(review);

    if (status === "approved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-semibold">
          <Check className="w-3.5 h-3.5" />
          Approved
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
          <X className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
        <MessageSquare className="w-3.5 h-3.5" />
        Pending
      </span>
    );
  };

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const totalReviews = reviews.length;

  const pendingReviews = reviews.filter(
    (review) => getReviewStatus(review) === "pending",
  ).length;

  const approvedReviewsList = reviews.filter(
    (review) => getReviewStatus(review) === "approved",
  );

  const approvedReviews = approvedReviewsList.length;

  const rejectedReviews = reviews.filter(
    (review) => getReviewStatus(review) === "rejected",
  ).length;

  // Only approved reviews should affect the public average rating
  const averageRating =
    approvedReviewsList.length > 0
      ? (
          approvedReviewsList.reduce(
            (total, review) => total + Number(review.rating || 0),
            0,
          ) / approvedReviewsList.length
        ).toFixed(1)
      : "0.0";

  // =========================================================
  // STARS
  // =========================================================

  const renderStars = (rating) => {
    const numericRating = Number(rating) || 0;

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= numericRating
                ? "fill-amber-400 text-amber-400"
                : "text-gray-200 fill-gray-100"
            }`}
          />
        ))}
      </div>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-gray-500 mt-4">Loading reviews...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Review Moderation
        </h1>

        <p className="text-gray-500 text-sm mt-2">
          Manage guest feedback, moderate reviews and respond to your guests.
        </p>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Reviews</p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            {totalReviews}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>

          <p className="text-3xl font-bold text-amber-600 mt-2">
            {pendingReviews}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Approved</p>

          <p className="text-3xl font-bold text-green-600 mt-2">
            {approvedReviews}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Rejected</p>

          <p className="text-3xl font-bold text-red-600 mt-2">
            {rejectedReviews}
          </p>
        </div>
      </div>

      {/* RATING SUMMARY */}

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Guest Satisfaction
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Average rating from approved guest reviews.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 px-5 py-3 rounded-xl">
          <div>
            <span className="text-3xl font-bold text-gray-900">
              {averageRating}
            </span>

            <span className="text-gray-400 text-sm"> / 5.0</span>
          </div>

          <div className="h-8 w-px bg-gray-200" />

          {renderStars(Math.round(Number(averageRating)))}
        </div>
      </div>

      {/* REVIEWS */}

      <div className="space-y-5">
        {reviews.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 flex flex-col items-center gap-3">
            <MessageSquare className="w-10 h-10 text-gray-300" />

            <span>No customer reviews collected yet.</span>
          </div>
        ) : (
          reviews.map((review) => {
            const status = getReviewStatus(review);

            const isCurrentReviewLoading = actionLoadingId === review._id;

            return (
              <div
                key={review._id}
                className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200"
              >
                {/* REVIEW CONTENT */}

                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    {/* LEFT */}

                    <div className="flex items-start gap-4 flex-1">
                      {/* AVATAR */}

                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                        {review.userName?.charAt(0)?.toUpperCase() || "G"}
                      </div>

                      <div className="flex-1">
                        {/* USER + STATUS */}

                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold text-gray-900">
                            {review.userName || "Verified Guest"}
                          </h3>

                          {renderStars(review.rating)}

                          {renderStatusBadge(review)}
                        </div>

                        {/* ROOM + DATE */}

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                            <Building className="w-3 h-3" />

                            {review.room?.roomType || "Room"}
                          </span>

                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />

                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "Date unavailable"}
                          </span>
                        </div>

                        {/* COMMENT */}

                        <p className="text-gray-600 text-sm leading-relaxed mt-4 max-w-3xl">
                          "{review.comment}"
                        </p>
                      </div>
                    </div>

                    {/* ROOM IMAGE */}

                    {review.room?.images?.[0] && (
                      <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                        <img
                          src={review.room.images[0]}
                          alt={review.room.roomType || "Hotel room"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* ADMIN RESPONSE */}

                  {review.adminResponse && (
                    <div className="mt-6 ml-0 md:ml-14 bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Reply className="w-4 h-4 text-blue-600" />

                        <p className="text-sm font-semibold text-blue-800">
                          Hotel Response
                        </p>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed">
                        {review.adminResponse}
                      </p>

                      {review.respondedAt && (
                        <p className="text-xs text-gray-400 mt-3">
                          Responded on{" "}
                          {new Date(review.respondedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* RESPONSE FORM */}

                  {respondingReviewId === review._id && (
                    <div className="mt-6 ml-0 md:ml-14">
                      <textarea
                        rows={4}
                        value={responseText}
                        onChange={(event) =>
                          setResponseText(event.target.value)
                        }
                        placeholder="Write your response to this guest..."
                        className="w-full border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />

                      <div className="flex justify-end gap-3 mt-3">
                        <button
                          type="button"
                          onClick={closeResponseBox}
                          disabled={isCurrentReviewLoading}
                          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() => respondToReview(review._id)}
                          disabled={isCurrentReviewLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />

                          {isCurrentReviewLoading
                            ? "Sending..."
                            : "Send Response"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* MODERATION ACTIONS */}

                <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {status !== "approved" && (
                      <button
                        type="button"
                        onClick={() => approveReview(review._id)}
                        disabled={isCurrentReviewLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />

                        {isCurrentReviewLoading ? "Processing..." : "Approve"}
                      </button>
                    )}

                    {status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => rejectReview(review._id)}
                        disabled={isCurrentReviewLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openResponseBox(review)}
                      disabled={isCurrentReviewLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50"
                    >
                      <Reply className="w-4 h-4" />

                      {review.adminResponse ? "Edit Response" : "Respond"}
                    </button>
                  </div>

                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={() => deleteReview(review._id)}
                    disabled={isCurrentReviewLoading}
                    className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
