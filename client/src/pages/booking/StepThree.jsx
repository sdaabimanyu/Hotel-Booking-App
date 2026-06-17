import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

export default function StepThree({ room, bookingData, setStep }) {
  const { axios, getToken } = useAppContext();

  const [paymentMethod, setPaymentMethod] = useState("hotel");
  
  const handlePayment = async () => {
    try {
      const token = await getToken();

      // Create booking first
      const bookingRes = await axios.post(
        "/api/bookings/book",
        {
          room: room._id,
          guests: bookingData.guests,
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!bookingRes.data.success) {
        return toast.error(bookingRes.data.message);
      }

      if (paymentMethod === "hotel") {
        toast.success("Booking Created");
        return (window.location.href = "/my-bookings");
      }

      // Get newly created booking
      const userBookings = await axios.get("/api/bookings/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const latestBooking = userBookings.data.bookings[0];

      const stripeRes = await axios.post(
        "/api/bookings/stripe-payment",
        {
          bookingId: latestBooking._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (stripeRes.data.success) {
        window.location.href = stripeRes.data.url;
      }
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
      {/* Left */}

      <div className="bg-white border rounded-3xl p-8">
        <h2 className="text-4xl font-semibold text-center mb-10">Payment</h2>

        <div className="space-y-4">
          <div className="border rounded-2xl p-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "hotel"}
                onChange={() => setPaymentMethod("hotel")}
              />
              <span>Pay At Hotel</span>
            </label>
          </div>

          <div className="border rounded-2xl p-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "stripe"}
                onChange={() => setPaymentMethod("stripe")}
              />
              <span>Stripe Payment</span>
            </label>
          </div>
        </div>

        <div className="flex justify-between mt-10">
          <button
            onClick={() => setStep(2)}
            className="border px-8 py-4 rounded-2xl"
          >
            ← Back
          </button>

          <button
            onClick={handlePayment}
            className="bg-[#c9a74d] text-white px-10 py-4 rounded-2xl hover:bg-[#b89434]"
          >
            Confirm Booking
          </button>
        </div>
      </div>

      {/* Right */}

      <div className="bg-white border rounded-3xl p-8">
        <h3 className="text-center uppercase tracking-[4px] text-[#c9a74d] mb-6">
          Booking Summary
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Room</span>

            <span>{room.roomType}</span>
          </div>

          <div className="flex justify-between">
            <span>Guests</span>

            <span>{bookingData.guests}</span>
          </div>

          <div className="flex justify-between">
            <span>Check In</span>

            <span>{bookingData.checkInDate}</span>
          </div>

          <div className="flex justify-between">
            <span>Check Out</span>

            <span>{bookingData.checkOutDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
