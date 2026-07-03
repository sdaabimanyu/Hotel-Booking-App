import { useMemo, useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

export default function StepTwo({
  room,
  bookingData,
  setBookingData,
  setStep,
}) {
  const { axios, getToken } = useAppContext();

  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState([]);

  const fetchOffers = async () => {
    try {
      const { data } = await axios.get("/api/offers");

      if (data.success) {
        setOffers(data.offers.filter((offer) => offer.isActive));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const nights = useMemo(() => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate) return 1;

    const start = new Date(bookingData.checkInDate);
    const end = new Date(bookingData.checkOutDate);

    const diff = end.getTime() - start.getTime();

    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [bookingData.checkInDate, bookingData.checkOutDate]);

  const subtotal = room.pricePerNight * nights;

  let discountAmount = 0;

  if (
    bookingData.selectedOffer &&
    nights >= bookingData.selectedOffer.minimumStay &&
    new Date(bookingData.selectedOffer.validTill) >= new Date()
  ) {
    if (bookingData.selectedOffer.discountType === "percentage") {
      discountAmount = Number(
        ((subtotal * bookingData.selectedOffer.discount) / 100).toFixed(2),
      );
    } else {
      discountAmount = Number(bookingData.selectedOffer.discount.toFixed(2));
    }
  }

  const discountedPrice = Number(
    Math.max(subtotal - discountAmount, 0).toFixed(2),
  );

  const taxes = Number((discountedPrice * 0.12).toFixed(2));

  const total = Number((discountedPrice + taxes).toFixed(2));

  const applyOffer = async () => {
    try {
      setLoading(true);

      const { data } = await axios.post(
        "/api/offers/apply",
        {
          code: promoCode,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );

      if (data.success) {
        toast.success("Offer Applied");

        setBookingData({
          ...bookingData,
          selectedOffer: data.offer,
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }

    setLoading(false);
  };

  return (
    <div className="grid lg:grid-cols-[2fr_1.1fr] gap-8">
      {/* LEFT */}

      <div className="bg-white rounded-3xl border p-8">
        <h2 className="text-4xl font-semibold text-center mb-10">
          Offers & Pricing
        </h2>

        <div className="mb-8">
          <label className="block font-semibold mb-2">Have a Promo Code?</label>

          <div className="flex gap-3">
            <input
              type="text"
              value={promoCode}
              placeholder="Enter promo code"
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 border rounded-xl px-4 py-3"
            />

            <button
              onClick={applyOffer}
              disabled={loading}
              className="bg-[#0f2f5f] text-white px-6 rounded-xl"
            >
              {loading ? "Applying..." : "Apply"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {offers.map((offer) => (
            <div
              key={offer._id}
              onClick={() =>
                setBookingData((prev) => ({
                  ...prev,
                  selectedOffer: offer,
                }))
              }
              className={`border-2 rounded-3xl cursor-pointer transition overflow-hidden ${
                bookingData.selectedOffer?._id === offer._id
                  ? "border-[#0f2f5f]"
                  : "border-gray-200"
              }`}
            >
              <div className="bg-[#0f2f5f] text-white p-6 flex justify-between">
                <div>
                  <p className="uppercase text-[#d4af37]">Save</p>

                  <h2 className="text-5xl font-bold">
                    {offer.discount}
                    {offer.discountType === "percentage" ? "%" : "$"}
                  </h2>
                </div>

                <div className="text-right">
                  <p>Promo Code</p>

                  <h3 className="text-[#d4af37] text-2xl font-bold">
                    {offer.code}
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-semibold text-[#0f2f5f] mb-3">
                  {offer.title}
                </h3>

                <p className="text-gray-600">{offer.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-10">
          <button
            onClick={() => setStep(1)}
            className="px-8 py-4 rounded-2xl border"
          >
            ← Back
          </button>

          <button
            onClick={() => setStep(3)}
            className="bg-[#c9a74d] hover:bg-[#b89434] text-white px-10 py-4 rounded-2xl"
          >
            Continue →
          </button>
        </div>
      </div>

      {/* RIGHT */}

      <div className="bg-white rounded-3xl border p-8 h-fit">
        <p className="text-center tracking-[4px] uppercase text-[#c9a74d] text-sm mb-6">
          Booking Summary
        </p>

        <div className="bg-[#f4d9a3] rounded-2xl p-8 text-center">
          <h3 className="text-3xl font-semibold">{room.roomType}</h3>
        </div>

        <div className="space-y-4 mt-8">
          <div className="flex justify-between">
            <span>Room Cost</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {discountAmount > 0 && (
            <>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>

                <span>-${discountAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Promo Code</span>

                <span>{bookingData.selectedOffer.code}</span>
              </div>
            </>
          )}

          <div className="flex justify-between">
            <span>Taxes (12%)</span>

            <span>${taxes.toFixed(2)}</span>
          </div>

          <hr />

          <div className="flex justify-between text-2xl font-bold text-[#0f2f5f]">
            <span>Total Due</span>

            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
