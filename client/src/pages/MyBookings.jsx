import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

export default function MyBookings() {
  const { axios, getToken, user } = useAppContext();

  const [bookings, setBookings] = useState([]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // =========================================================
  // FETCH USER BOOKINGS
  // =========================================================

  const fetchUserBookings = async () => {
    try {
      const { data } = await axios.get("/api/bookings/user", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        const sortedBookings = [...data.bookings].sort((a, b) => {
          const dateA = new Date(a.createdAt || a.checkInDate);
          const dateB = new Date(b.createdAt || b.checkInDate);

          return dateB - dateA;
        });

        setBookings(sortedBookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("FETCH BOOKINGS ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch bookings",
      );
    }
  };

  // =========================================================
  // STRIPE PAYMENT
  // =========================================================

  const handlePayment = async (bookingId) => {
    try {
      const { data } = await axios.post(
        "/api/bookings/stripe-payment",
        {
          bookingId,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("PAYMENT ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to start payment",
      );
    }
  };

  // =========================================================
  // OPEN REVIEW MODAL
  // =========================================================

  const openReviewModal = (booking) => {
    // Extra frontend protection
    if (booking.status !== "checked-out") {
      toast.error("You can review only after completing your stay");
      return;
    }

    setSelectedBooking(booking);
    setRating(5);
    setComment("");
    setShowReviewModal(true);
  };

  // =========================================================
  // CLOSE REVIEW MODAL
  // =========================================================

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
    setComment("");
    setRating(5);
  };

  // =========================================================
  // SUBMIT REVIEW
  // =========================================================

  const submitReview = async () => {
    try {
      if (!selectedBooking) {
        toast.error("Booking not selected");
        return;
      }

      if (selectedBooking.status !== "checked-out") {
        toast.error("You can review only after completing your stay");
        return;
      }

      if (!comment.trim()) {
        toast.error("Please enter your review");
        return;
      }

      const token = await getToken();

      const { data } = await axios.post(
        "/api/reviews",
        {
          bookingId: selectedBooking._id,
          rating,
          comment: comment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message || "Review submitted successfully");

        await fetchUserBookings();

        closeReviewModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("SUBMIT REVIEW ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit review",
      );
    }
  };

  // =========================================================
  // CANCEL BOOKING
  // =========================================================

  const cancelBooking = async (bookingId) => {
    try {
      const { data } = await axios.post(
        "/api/bookings/cancel",
        {
          bookingId,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message);

        await fetchUserBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("CANCEL BOOKING ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to cancel booking",
      );
    }
  };

  // =========================================================
  // LOAD BOOKINGS
  // =========================================================

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  // =========================================================
  // BOOKING STATUS STYLES
  // =========================================================

  const getStatusStyles = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200/60";

      case "confirmed":
        return "bg-sky-50 text-sky-700 border-sky-200/60";

      case "checked-in":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";

      case "checked-out":
        return "bg-slate-50 text-slate-600 border-slate-200";

      case "cancelled":
        return "bg-red-50 text-red-600 border-red-200/60";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <>
      <div className="bg-[#faf9f7] min-h-screen py-32 md:pb-36 px-4 md:px-16 lg:px-24 xl:px-32 antialiased">
        <div className="max-w-6xl mx-auto">
          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-medium font-playfair text-slate-900 tracking-tight">
              My Bookings
            </h1>

            <p className="max-w-2xl text-sm font-inter text-slate-500 mt-3 leading-relaxed">
              Easily manage your past, current, and upcoming hotel reservations
              in one place. Plan your trips seamlessly with just a few clicks.
            </p>
          </div>

          {/* ================================================= */}
          {/* BOOKINGS */}
          {/* ================================================= */}

          <div className="space-y-6 w-full text-slate-800">
            {bookings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <p className="font-playfair text-xl text-slate-400">
                  No reservations found
                </p>
              </div>
            ) : (
              bookings.map((booking) => {
                const now = new Date();

                const checkInDate = new Date(booking.checkInDate);

                const isUpcoming = checkInDate > now;

                const isCancelled = booking.status === "cancelled";

                const isCheckedOut = booking.status === "checked-out";

                const isCheckedIn = booking.status === "checked-in";

                const isConfirmed = booking.status === "confirmed";

                const isPending = booking.status === "pending";

                return (
                  <div
                    key={booking._id}
                    className="flex flex-col lg:flex-row justify-between bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 gap-6"
                  >
                    {/* ================================================= */}
                    {/* LEFT SIDE */}
                    {/* ================================================= */}

                    <div className="flex flex-col md:flex-row flex-1 gap-6">
                      {/* ROOM IMAGE */}

                      <div className="relative md:w-56 h-40 md:h-auto shrink-0 rounded-2xl overflow-hidden shadow-sm">
                        <img
                          src={
                            booking.room?.images?.[0] || "/placeholder-room.jpg"
                          }
                          alt="hotel-img"
                          className="w-full h-full object-cover"
                        />

                        {booking.selectedOffer && (
                          <div className="absolute bottom-3 left-3 bg-emerald-500 text-white font-inter text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
                            % {booking.selectedOffer.code} Applied
                          </div>
                        )}
                      </div>

                      {/* ================================================= */}
                      {/* BOOKING INFORMATION */}
                      {/* ================================================= */}

                      <div className="flex flex-col justify-between flex-1 py-1">
                        <div>
                          <div className="flex flex-wrap items-baseline gap-2">
                            <h2 className="font-playfair text-2xl font-bold text-slate-800 tracking-tight">
                              {booking.hotel?.name}
                            </h2>

                            <span className="font-inter text-xs text-slate-400 font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                              {booking.room?.roomType}
                            </span>
                          </div>

                          <div className="flex flex-col gap-2 mt-4 text-sm font-inter text-slate-500">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 text-xs w-4 text-center">
                                📍
                              </span>

                              <span className="line-clamp-1">
                                {booking.hotel?.address}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 text-xs w-4 text-center">
                                👥
                              </span>

                              <span>
                                Guests: {booking.guests}{" "}
                                {booking.guests > 1 ? "People" : "Person"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ================================================= */}
                        {/* CHECK-IN / CHECK-OUT */}
                        {/* ================================================= */}

                        <div className="grid grid-cols-2 gap-4 pt-5 mt-5 border-t border-slate-50 max-w-sm">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 font-inter">
                              Check-In
                            </p>

                            <p className="text-xs font-semibold text-slate-700 mt-1 font-inter">
                              {new Date(booking.checkInDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>

                          <div className="border-l border-slate-100 pl-4">
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 font-inter">
                              Check-Out
                            </p>

                            <p className="text-xs font-semibold text-slate-700 mt-1 font-inter">
                              {new Date(
                                booking.checkOutDate,
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ================================================= */}
                    {/* RIGHT SIDE */}
                    {/* ================================================= */}

                    <div className="flex flex-row lg:flex-col justify-between items-end lg:justify-between p-1 lg:border-l lg:border-slate-50 lg:pl-8 min-w-[200px] gap-4">
                      {/* ================================================= */}
                      {/* PRICE AND STATUS */}
                      {/* ================================================= */}

                      <div className="flex flex-col items-start lg:items-end w-full space-y-2.5">
                        <p className="text-xs font-inter text-slate-400 font-medium">
                          Total Cost
                        </p>

                        <p className="text-3xl font-bold font-inter text-slate-900 tracking-tight">
                          ${booking.totalPrice}
                        </p>

                        <div className="flex flex-wrap gap-1.5 lg:justify-end w-full pt-1">
                          {/* PAYMENT STATUS */}

                          {!isCancelled && (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-inter border ${
                                booking.isPaid
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : "bg-rose-50 text-rose-700 border-rose-100"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  booking.isPaid
                                    ? "bg-emerald-500"
                                    : "bg-rose-500"
                                }`}
                              ></span>

                              {booking.isPaid ? "Paid" : "Unpaid"}
                            </span>
                          )}

                          {/* BOOKING STATUS */}

                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold font-inter border uppercase tracking-wider text-[10px] ${getStatusStyles(
                              booking.status,
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>

                      {/* ================================================= */}
                      {/* ACTION BUTTONS */}
                      {/* ================================================= */}

                      <div className="w-full shrink-0 max-w-[180px] lg:max-w-none">
                        {/* ================================================= */}
                        {/* CANCEL BUTTON */}
                        {/* ================================================= */}

                        {!isCancelled &&
                          !isCheckedIn &&
                          !isCheckedOut &&
                          isUpcoming && (
                            <button
                              onClick={() => cancelBooking(booking._id)}
                              className="w-full py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold tracking-wide transition duration-200 mb-2"
                            >
                              Cancel Reservation
                            </button>
                          )}

                        {/* ================================================= */}
                        {/* CANCELLED BOOKING */}
                        {/* ================================================= */}

                        {isCancelled ? (
                          <div className="w-full text-center py-2.5 bg-red-50 border border-red-100 rounded-xl text-xs font-bold font-inter text-red-600">
                            Reservation Cancelled
                          </div>
                        ) : booking.reviewSubmitted ? (
                          /* ================================================= */
                          /* REVIEW ALREADY SUBMITTED */
                          /* ================================================= */

                          <div className="w-full text-center py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold font-inter text-emerald-600 flex items-center justify-center gap-1.5">
                            <span>✓</span>
                            Review Submitted
                          </div>
                        ) : isCheckedOut ? (
                          /* ================================================= */
                          /* CHECKED-OUT BOOKING */
                          /* ================================================= */

                          <button
                            onClick={() => openReviewModal(booking)}
                            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-wide transition duration-200 shadow-sm shadow-slate-900/10"
                          >
                            Write Stay Experience
                          </button>
                        ) : !booking.isPaid ? (
                          /* ================================================= */
                          /* UNPAID BOOKING */
                          /* ================================================= */

                          <button
                            onClick={() => handlePayment(booking._id)}
                            className="w-full py-3 bg-secondary hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-bold tracking-wide shadow-md shadow-amber-500/5 transition duration-200"
                          >
                            Complete Secure Payment
                          </button>
                        ) : isCheckedIn ? (
                          /* ================================================= */
                          /* CURRENTLY CHECKED IN */
                          /* ================================================= */

                          <div className="w-full text-center py-2.5 text-emerald-600 font-inter text-xs font-semibold">
                            Stay currently in progress
                          </div>
                        ) : isConfirmed || isPending ? (
                          /* ================================================= */
                          /* UPCOMING / PENDING STAY */
                          /* ================================================= */

                          <div className="w-full text-center py-2.5 text-slate-400 font-inter text-xs font-medium italic">
                            Review unlocks after check-out
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* REVIEW MODAL */}
      {/* ========================================================= */}

      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100/80 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-medium font-playfair text-slate-900 tracking-tight mb-2">
              Share Your Stay
            </h2>

            <p className="text-xs font-inter text-slate-400 mb-6">
              Your valuable feedback helps refine our bespoke luxury services.
            </p>

            <div className="space-y-5 font-inter">
              {/* RATING */}

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
                  Overall Rating
                </label>

                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 text-slate-700 p-3.5 rounded-xl font-medium outline-hidden focus:border-amber-300 transition text-sm appearance-none cursor-pointer"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ 5 Excellent Stars</option>

                  <option value={4}>⭐⭐⭐⭐ 4 Good Stars</option>

                  <option value={3}>⭐⭐⭐ 3 Average Stars</option>

                  <option value={2}>⭐⭐ 2 Below Average Stars</option>

                  <option value={1}>⭐ 1 Poor Star</option>
                </select>
              </div>

              {/* COMMENT */}

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
                  Review Statement
                </label>

                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Elaborate on your experience regarding amenities, ambiance, and care..."
                  className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm p-4 rounded-xl outline-hidden focus:border-amber-300 focus:bg-white placeholder:text-slate-400 transition resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* MODAL BUTTONS */}

            <div className="flex justify-end gap-3 mt-8 font-inter">
              <button
                onClick={closeReviewModal}
                className="px-5 py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-bold tracking-wide transition duration-200"
              >
                Dismiss
              </button>

              <button
                onClick={submitReview}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-wide shadow-md shadow-slate-900/10 transition duration-200"
              >
                Publish Review
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
