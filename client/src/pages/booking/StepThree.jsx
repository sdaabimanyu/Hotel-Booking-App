import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

export default function StepThree({ room, bookingData, setStep }) {
  const { axios, getToken } = useAppContext();

  const [paymentMethod, setPaymentMethod] = useState("hotel");
  const [loading, setLoading] = useState(false);

  const nights =
    (new Date(bookingData.checkOutDate) - new Date(bookingData.checkInDate)) /
    (1000 * 60 * 60 * 24);

  const subtotal = room.pricePerNight * nights;

  const discount = bookingData.selectedOffer
    ? bookingData.selectedOffer.discountType === "percentage"
      ? Number(
          ((subtotal * bookingData.selectedOffer.discount) / 100).toFixed(2),
        )
      : Number(
          Math.min(bookingData.selectedOffer.discount, subtotal).toFixed(2),
        )
    : 0;

  const discountedPrice = Number((subtotal - discount).toFixed(2));
  const taxes = Number((discountedPrice * 0.12).toFixed(2));
  const total = Number((discountedPrice + taxes).toFixed(2));

  const handlePayment = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      // Create booking first
      const bookingRes = await axios.post(
        "/api/bookings/book",
        {
          room: room._id,
          guests: bookingData.guests,
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          specialRequest: bookingData.specialRequest,
          selectedOffer: bookingData.selectedOffer?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!bookingRes.data.success) {
        setLoading(false);
        return toast.error(bookingRes.data.message);
      }

      if (paymentMethod === "hotel") {
        toast.success("Booking Created Successfully");
        setLoading(false);
        return (window.location.href = "/my-bookings");
      }

      console.log("NEW BOOKING ID:", bookingRes.data.bookingId);

      const stripeRes = await axios.post(
        "/api/bookings/stripe-payment",
        {
          bookingId: bookingRes.data.bookingId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (stripeRes.data.success) {
        setLoading(false);
        window.location.href = stripeRes.data.url;
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.1fr] gap-8 items-start font-inter">
      {/* LEFT CONTENT AREA: PAYMENT SELECTION */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-10 shadow-xl shadow-slate-100/50">
        <h2 className="text-2xl md:text-3xl font-playfair font-normal text-slate-950 mb-8 border-b border-slate-100 pb-4">
          Select Settlement Method
        </h2>

        <div className="space-y-4">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Preferred Payment Channel
          </label>

          {/* PAY AT HOTELOPTION */}
          <div
            onClick={() => setPaymentMethod("hotel")}
            className={`border rounded-xl p-5 cursor-pointer transition-all duration-300 flex items-center justify-between group ${
              paymentMethod === "hotel"
                ? "border-amber-600 bg-amber-50/20 ring-1 ring-amber-600"
                : "border-slate-200 hover:border-slate-400 bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  paymentMethod === "hotel"
                    ? "border-amber-600 bg-amber-600"
                    : "border-slate-300"
                }`}
              >
                {paymentMethod === "hotel" && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-950">
                  Defer Payment (Pay At Property)
                </p>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                  Guarantee with details and settle upon your arrival at the
                  front desk.
                </p>
              </div>
            </div>
          </div>

          {/* STRIPE PAYMENT OPTION */}
          <div
            onClick={() => setPaymentMethod("stripe")}
            className={`border rounded-xl p-5 cursor-pointer transition-all duration-300 flex items-center justify-between group ${
              paymentMethod === "stripe"
                ? "border-amber-600 bg-amber-50/20 ring-1 ring-amber-600"
                : "border-slate-200 hover:border-slate-400 bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  paymentMethod === "stripe"
                    ? "border-amber-600 bg-amber-600"
                    : "border-slate-300"
                }`}
              >
                {paymentMethod === "stripe" && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-950">
                  Instant Online Settlement (Stripe Secure)
                </p>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                  Settle balance now via encrypted credit/debit transaction
                  gateway.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTION TRIGGERS */}
        <div className="flex justify-between mt-12 pt-6 border-t border-slate-100">
          <button
            onClick={() => setStep(2)}
            className="px-6 py-3 rounded-xl border border-slate-200 hover:border-slate-950 text-slate-700 hover:text-slate-950 text-sm font-medium transition-all duration-300 cursor-pointer"
          >
            ← Back to Offers
          </button>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="bg-slate-950 hover:bg-amber-600 disabled:bg-slate-400 text-white px-8 py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 shadow-md active:scale-[0.99] cursor-pointer"
          >
            {loading
              ? "Processing Securely..."
              : "Confirm & Finalize Reservation"}
          </button>
        </div>
      </div>

      {/* RIGHT SIDEBAR CONTAINING OVERALL BREAKDOWN */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xl shadow-slate-100/50 sticky top-32">
        <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 block text-center mb-4">
          Booking Summary
        </span>

        <div className="bg-slate-950 text-white rounded-xl p-6 text-center border border-white/10 shadow-inner">
          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase block mb-1">
            Selected Accomodation
          </span>
          <h3 className="text-xl md:text-2xl font-playfair font-normal tracking-wide text-amber-400">
            {room.roomType}
          </h3>
        </div>

        <div className="space-y-4 mt-8 text-sm text-slate-600 font-light border-b border-slate-100 pb-5">
          <div className="flex justify-between items-center">
            <span>Total Occupants</span>
            <span className="font-medium text-slate-950">
              {bookingData.guests}{" "}
              {bookingData.guests === 1 ? "Guest" : "Guests"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>Check-In Date</span>
            <span className="font-medium text-slate-950">
              {bookingData.checkInDate}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>Check-Out Date</span>
            <span className="font-medium text-slate-950">
              {bookingData.checkOutDate}
            </span>
          </div>
        </div>

        <div className="space-y-4 mt-5 text-sm text-slate-600 font-light">
          <div className="flex justify-between items-center">
            <span>Room Tariff Subtotal</span>
            <span className="font-medium text-slate-950">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          {bookingData.selectedOffer && (
            <>
              <div className="flex justify-between items-center text-xs bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                <span className="text-slate-400 uppercase tracking-wider font-bold text-[9px]">
                  Privilege Rate
                </span>
                <span className="font-semibold text-slate-800 tracking-wider uppercase">
                  {bookingData.selectedOffer.code}
                </span>
              </div>

              <div className="flex justify-between items-center text-emerald-600 font-medium">
                <span>Offer Reduction</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center">
            <span>Taxes (12%)</span>
            <span className="font-medium text-slate-950">
              ${taxes.toFixed(2)}
            </span>
          </div>

          <div className="border-t border-slate-100 my-4 pt-4 flex justify-between items-baseline">
            <span className="text-base font-normal text-slate-900">
              Total Valuation
            </span>
            <p className="text-2xl font-semibold text-slate-950 tracking-tight">
              ${total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
