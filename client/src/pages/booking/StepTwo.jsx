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
    if (!promoCode.trim()) return toast.error("Please enter a promo code");
    try {
      setLoading(true);
      const { data } = await axios.post(
        "/api/offers/apply",
        { code: promoCode },
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
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.1fr] gap-8 items-start font-inter">
      {/* LEFT CONTENT AREA */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-10 shadow-xl shadow-slate-100/50">
        <h2 className="text-2xl md:text-3xl font-playfair font-normal text-slate-950 mb-8 border-b border-slate-100 pb-4">
          Exclusive Offers & Privileges
        </h2>

        {/* PROMO INPUT FIELD */}
        <div className="mb-10">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Have a Private Promo Code?
          </label>
          <div className="flex gap-3 max-w-md">
            <input
              type="text"
              value={promoCode}
              placeholder="ENTER CODE"
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium tracking-wider uppercase outline-none focus:border-slate-950 transition-all placeholder-slate-300"
            />
            <button
              onClick={applyOffer}
              disabled={loading}
              className="bg-slate-950 hover:bg-amber-600 text-white px-6 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Verifying..." : "Apply"}
            </button>
          </div>
        </div>

        {/* AVAILABLE OFFERS LIST */}
        <div className="space-y-4">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Select an Available Privilege Rate
          </label>

          {offers.map((offer) => {
            const isSelected = bookingData.selectedOffer?._id === offer._id;
            return (
              <div
                key={offer._id}
                onClick={() =>
                  setBookingData((prev) => ({
                    ...prev,
                    selectedOffer: offer,
                  }))
                }
                className={`border rounded-xl cursor-pointer transition-all duration-300 flex flex-col md:flex-row justify-between overflow-hidden relative group ${
                  isSelected
                    ? "border-amber-600 bg-amber-50/20 ring-1 ring-amber-600"
                    : "border-slate-200 hover:border-slate-400 bg-white"
                }`}
              >
                {/* Offer Main Info */}
                <div className="p-6 flex-1">
                  <span className="inline-block text-[9px] font-bold tracking-widest uppercase bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md mb-3 group-hover:bg-amber-100 group-hover:text-amber-900 transition-colors">
                    Special Package
                  </span>
                  <h3 className="text-xl font-playfair font-normal text-slate-950 mb-1">
                    {offer.title}
                  </h3>
                  <p className="text-slate-500 font-light text-sm leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                {/* Offer Perks Ribbon */}
                <div
                  className={`p-6 flex flex-row md:flex-col justify-between items-center md:justify-center md:items-end gap-1 border-t md:border-t-0 md:border-l min-w-[160px] text-right ${
                    isSelected
                      ? "border-amber-100 bg-amber-50/40"
                      : "border-slate-100 bg-slate-50/50"
                  }`}
                >
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Save
                    </p>
                    <p className="text-3xl font-semibold tracking-tight text-slate-950">
                      {offer.discountType === "percentage" ? "" : "$"}
                      {offer.discount}
                      {offer.discountType === "percentage" ? "%" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-amber-700 bg-amber-100/60 border border-amber-200/50 rounded px-2 py-0.5 tracking-wider uppercase mt-1">
                      {offer.code}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* INTERACTION TRIGGERS */}
        <div className="flex justify-between mt-12 pt-6 border-t border-slate-100">
          <button
            onClick={() => setStep(1)}
            className="px-6 py-3 rounded-xl border border-slate-200 hover:border-slate-950 text-slate-700 hover:text-slate-950 text-sm font-medium transition-all duration-300 cursor-pointer"
          >
            ← Back to Details
          </button>

          <button
            onClick={() => setStep(3)}
            className="bg-slate-950 hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 shadow-md active:scale-[0.99] cursor-pointer"
          >
            Continue to Payment →
          </button>
        </div>
      </div>

      {/* RIGHT SIDEBAR CONTAINER */}
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

        <div className="space-y-4 mt-8 text-sm text-slate-600 font-light">
          <div className="flex justify-between items-center">
            <span>
              Room Tariff ({nights} {nights === 1 ? "night" : "nights"})
            </span>
            <span className="font-medium text-slate-950">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          {discountAmount > 0 && (
            <>
              <div className="flex justify-between items-center text-emerald-600 font-medium">
                <span>Privilege Discount</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-xs bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                <span className="text-slate-400 uppercase tracking-wider font-bold text-[9px]">
                  Active Code
                </span>
                <span className="font-semibold text-slate-800 tracking-wider uppercase">
                  {bookingData.selectedOffer.code}
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center">
            <span>VAT & Institutional Luxury Taxes (12%)</span>
            <span className="font-medium text-slate-950">
              ${taxes.toFixed(2)}
            </span>
          </div>

          <div className="border-t border-slate-100 my-4 pt-4 flex justify-between items-baseline">
            <span className="text-base font-normal text-slate-900">
              Total Due
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
