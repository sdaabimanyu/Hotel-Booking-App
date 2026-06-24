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

  const fetchUserBookings = async () => {
    try {
      const { data } = await axios.get("/api/bookings/user", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      const { data } = await axios.post(
        "/api/bookings/stripe-payment",
        { bookingId },
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );
      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    try {
      console.log("SUBMIT REVIEW CLICKED");
      const token = await getToken();
      console.log("SELECTED BOOKING:", selectedBooking);
      console.log("RATING:", rating);
      console.log("COMMENT:", comment);
      console.log("SENDING REQUEST...");
      const { data } = await axios.post(
        "/api/reviews",
        {
          bookingId: selectedBooking._id,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        toast.success("Review Added");

        await fetchUserBookings();

        setShowReviewModal(false);
        setSelectedBooking(null);
        setComment("");
        setRating(5);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const { data } = await axios.post(
        "/api/bookings/cancel",
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message);

        fetchUserBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  return (
    <>
      <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
        <div className="mb-10">
          <h1 className="text-[40px] font-playfair">My Bookings</h1>
          <p className="max-w-150 text-gray-500/90">
            Easily manage your past, current, and upcoming hotel reservations in
            one place. Plan your trips seamlessly with just a few clicks
          </p>
        </div>

        <div className="max-w-6xl mt-8 w-full text-gray-800">
          <div className="hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3">
            <div>Hotels</div>
            <div>Date & Timings</div>
            <div>Payment</div>
          </div>

          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 py-6 first:border-t"
            >
              {/* Hotel Details */}
              <div className="flex flex-col md:flex-row">
                <img
                  src={booking.room?.images?.[0] || "/placeholder-room.jpg"}
                  alt="hotel-img"
                  className="md:w-44 rounded shadow object-cover"
                />

                <div className="flex flex-col gap-1.5 max-md:mt-3 md:ml-4">
                  <p className="font-playfair text-2xl">
                    {booking.hotel.name}
                    <span className="font-inter text-sm">
                      {" "}
                      ({booking.room.roomType})
                    </span>
                  </p>

                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <i className="fa-solid fa-location-dot"></i>
                    <span>{booking.hotel.address}</span>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <i className="fa-solid fa-people-group"></i>
                    <span>Guests: {booking.guests}</span>
                  </div>

                  <p className="text-base">Total: ${booking.totalPrice}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="flex flex-row md:items-center md:gap-12 mt-3 gap-8">
                <div>
                  <p>Check-In</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(booking.checkInDate).toDateString()}
                  </p>
                </div>

                <div>
                  <p>Check-Out</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(booking.checkOutDate).toDateString()}
                  </p>
                </div>
              </div>

              {/* Payment */}
              <div className="flex flex-col items-start justify-center pt-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      booking.isPaid ? "bg-green-500" : "bg-red-500"
                    }`}
                  />

                  <p
                    className={`text-sm ${
                      booking.isPaid ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {booking.isPaid ? "Paid" : "Unpaid"}
                  </p>
                </div>

                <p
                  className={`font-medium ${
                    booking.status === "pending"
                      ? "text-yellow-500"
                      : booking.status === "confirmed"
                        ? "text-blue-500"
                        : booking.status === "checked-in"
                          ? "text-green-500"
                          : booking.status === "checked-out"
                            ? "text-emerald-600"
                            : "text-red-500"
                  }`}
                >
                  Status: {booking.status}
                </p>

                {booking.status !== "cancelled" &&
                  new Date(booking.checkInDate) > new Date() && (
                    <button
                      onClick={() => cancelBooking(booking._id)}
                      className="mt-3 px-5 py-2 bg-red-500 text-white rounded-lg"
                    >
                      Cancel Booking
                    </button>
                  )}

                {/* Review Already Submitted */}
                {booking.reviewSubmitted ? (
                  <div className="mt-3">
                    <p className="text-green-600 font-medium">
                      Review Submitted
                    </p>
                  </div>
                ) : !booking.isPaid ? (
                  <button
                    onClick={() => handlePayment(booking._id)}
                    className="mt-3 px-5 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Pay Now
                  </button>
                ) : new Date(booking.checkOutDate) > new Date() ? (
                  <p className="mt-3 text-gray-500 text-sm">
                    Review available after checkout
                  </p>
                ) : (
                  <button
                    onClick={() => openReviewModal(booking)}
                    className="mt-3 px-5 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Write Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[500px]">
            <h2 className="text-2xl font-bold mb-4">Write Review</h2>

            <label className="block mb-2">Rating</label>

            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full border p-3 rounded-lg mb-4"
            >
              <option value={1}>⭐ 1 Star</option>
              <option value={2}>⭐⭐ 2 Stars</option>
              <option value={3}>⭐⭐⭐ 3 Stars</option>
              <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
              <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
            </select>

            <label className="block mb-2">Review</label>

            <textarea
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full border p-3 rounded-lg"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={submitReview}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
