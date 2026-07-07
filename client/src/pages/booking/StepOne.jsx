import { useMemo } from "react";
import toast from "react-hot-toast";

export default function StepOne({
  room,
  bookingData,
  setBookingData,
  setStep,
}) {
  const nights = useMemo(() => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate) return 1;

    const start = new Date(bookingData.checkInDate);
    const end = new Date(bookingData.checkOutDate);
    const diff = end.getTime() - start.getTime();

    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [bookingData.checkInDate, bookingData.checkOutDate]);

  const subtotal = room.pricePerNight * nights;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;

  const updateField = (field, value) => {
    setBookingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleContinue = () => {
    if (!bookingData.phone.trim())
      return toast.error("Phone Number is required");
    if (bookingData.phone.trim().length < 10)
      return toast.error("Enter a valid phone number");
    if (!bookingData.guests) return toast.error("Please select guests");
    if (!bookingData.checkInDate)
      return toast.error("Check In Date is required");
    if (!bookingData.checkOutDate)
      return toast.error("Check Out Date is required");
    if (
      new Date(bookingData.checkOutDate) <= new Date(bookingData.checkInDate)
    ) {
      return toast.error("Check Out must be after Check In");
    }
    setStep(2);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.1fr] gap-8 items-start">
      {/* LEFT FORM SECTION */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-10 shadow-xl shadow-slate-100/50">
        <h2 className="text-2xl md:text-3xl font-playfair font-normal text-slate-950 mb-8 border-b border-slate-100 pb-4">
          Guest Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FULL NAME */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-inter">
              Full Name
            </label>
            <input
              type="text"
              value={bookingData.name}
              readOnly
              className="w-full border border-slate-200 rounded-xl px-4 py-3.5 bg-slate-50/80 text-slate-500 font-medium text-sm cursor-not-allowed outline-none"
            />
          </div>

          {/* EMAIL */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-inter">
              Email Address
            </label>
            <input
              type="email"
              value={bookingData.email}
              readOnly
              className="w-full border border-slate-200 rounded-xl px-4 py-3.5 bg-slate-50/80 text-slate-500 font-medium text-sm cursor-not-allowed outline-none"
            />
          </div>

          {/* PHONE */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-inter">
              Phone Number
            </label>
            <input
              type="text"
              value={bookingData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-medium text-sm outline-none focus:border-slate-950 transition-all placeholder-slate-300"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          {/* GUESTS */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-inter">
              Total Guests
            </label>
            <select
              value={bookingData.guests}
              onChange={(e) => updateField("guests", Number(e.target.value))}
              className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-medium text-sm outline-none focus:border-slate-950 transition-all cursor-pointer bg-white"
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
            </select>
          </div>
        </div>

        {/* DATES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-50">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-inter">
              Check-In Date
            </label>
            <input
              type="date"
              value={bookingData.checkInDate || ""}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => updateField("checkInDate", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-medium text-sm outline-none focus:border-slate-950 transition-all [color-scheme:light]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-inter">
              Check-Out Date
            </label>
            <input
              type="date"
              value={bookingData.checkOutDate || ""}
              min={bookingData.checkInDate || ""}
              onChange={(e) => updateField("checkOutDate", e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-medium text-sm outline-none focus:border-slate-950 transition-all [color-scheme:light]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-inter">
              Calculated Stay
            </label>
            <div className="border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-center text-base font-semibold text-slate-950 font-inter h-[46px] flex items-center justify-center">
              {nights} {nights === 1 ? "Night" : "Nights"}
            </div>
          </div>
        </div>

        {/* SPECIAL REQUEST */}
        <div className="mt-6 space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-inter">
            Special Requests (Optional)
          </label>
          <textarea
            rows={3}
            value={bookingData.specialRequest}
            onChange={(e) => updateField("specialRequest", e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-900 font-medium outline-none resize-none focus:border-slate-950 transition-all placeholder-slate-300"
            placeholder="Specify high floor preferences, dietary notices, special arrangements..."
          />
        </div>

        {/* ACTION TRIGGER */}
        <div className="flex justify-end mt-8 pt-4 border-t border-slate-100">
          <button
            onClick={handleContinue}
            className="bg-slate-950 hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 shadow-md active:scale-[0.99] cursor-pointer"
          >
            Continue to Offers
          </button>
        </div>
      </div>

      {/* RIGHT SIDEBAR SUMMARY CARD */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xl shadow-slate-100/50 sticky top-32">
        <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 font-inter block text-center mb-4">
          Reservation Summary
        </span>

        <div className="bg-slate-950 text-white rounded-xl p-6 text-center border border-white/10 shadow-inner">
          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-inter block mb-1">
            Selected Accomodation
          </span>
          <h3 className="text-xl md:text-2xl font-playfair font-normal tracking-wide text-amber-400">
            {room.roomType}
          </h3>
        </div>

        <div className="space-y-4 mt-8 text-sm text-slate-600 font-inter font-light">
          <div className="flex justify-between items-center">
            <span>Registered Guests</span>
            <span className="font-medium text-slate-950">
              {bookingData.guests}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>Duration of Stay</span>
            <span className="font-medium text-slate-950">
              {nights} {nights === 1 ? "night" : "nights"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>
              Base Tariff Rate{" "}
              <span className="text-xs text-slate-400 block font-light">
                (${room.pricePerNight} / night)
              </span>
            </span>
            <span className="font-medium text-slate-950">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>VAT & Institutional Luxury Taxes (12%)</span>
            <span className="font-medium text-slate-950">
              ${taxes.toFixed(2)}
            </span>
          </div>

          <div className="border-t border-slate-100 my-4 pt-4 flex justify-between items-baseline">
            <span className="text-base font-normal text-slate-900">
              Total Valuation
            </span>
            <p className="text-2xl font-semibold text-slate-950 tracking-tight font-inter">
              ${total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
