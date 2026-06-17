import { useMemo } from "react";

export default function StepTwo({
  room,
  bookingData,
  setBookingData,
  setStep,
}) {
  const offers = [
    {
      id: 1,
      title: "Early Bird Discount",
      discount: 25,
      code: "EARLY25",
      description: "Save 25% when booking 30 days in advance.",
    },
    {
      id: 2,
      title: "Weekend Getaway",
      discount: 20,
      code: "WKND20",
      description: "Enjoy 20% off weekend stays.",
    },
    {
      id: 3,
      title: "Suite Privilege",
      discount: 15,
      code: "SUITE15",
      description: "Special discount for suite bookings.",
    },
  ];

  const nights = useMemo(() => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate) return 1;

    const start = new Date(bookingData.checkInDate);
    const end = new Date(bookingData.checkOutDate);

    const diff = end.getTime() - start.getTime();

    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [bookingData.checkInDate, bookingData.checkOutDate]);

  const subtotal = room.pricePerNight * nights;

  const discountAmount = bookingData.selectedOffer
    ? (subtotal * bookingData.selectedOffer.discount) / 100
    : 0;

  const discountedPrice = subtotal - discountAmount;

  const taxes = Math.round(discountedPrice * 0.12);

  const total = discountedPrice + taxes;

  return (
    <div className="grid lg:grid-cols-[2fr_1.1fr] gap-8">
      {/* LEFT */}

      <div className="bg-white rounded-3xl border p-8">
        <h2 className="text-4xl font-semibold text-center mb-10">
          Offers & Pricing
        </h2>

        <div className="space-y-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              onClick={() =>
                setBookingData((prev) => ({
                  ...prev,
                  selectedOffer: offer,
                }))
              }
              className={`border-2 rounded-3xl cursor-pointer transition overflow-hidden ${
                bookingData.selectedOffer?.id === offer.id
                  ? "border-[#0f2f5f]"
                  : "border-gray-200"
              }`}
            >
              <div className="bg-[#0f2f5f] text-white p-6 flex justify-between">
                <div>
                  <p className="uppercase text-[#d4af37]">Save</p>

                  <h2 className="text-5xl font-bold">{offer.discount}%</h2>
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
            <span>${subtotal}</span>
          </div>

          {bookingData.selectedOffer && (
            <>
              <div className="flex justify-between text-green-600">
                <span>
                  Discount ({bookingData.selectedOffer.discount}
                  %)
                </span>

                <span>-${discountAmount}</span>
              </div>

              <div className="flex justify-between">
                <span>Promo Code</span>

                <span>{bookingData.selectedOffer.code}</span>
              </div>
            </>
          )}

          <div className="flex justify-between">
            <span>Taxes (12%)</span>

            <span>${taxes}</span>
          </div>

          <hr />

          <div className="flex justify-between text-2xl font-bold text-[#0f2f5f]">
            <span>Total Due</span>

            <span>${total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
