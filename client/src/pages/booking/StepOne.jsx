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
    if (!bookingData.name.trim()) {
      return toast.error("Full Name is required");
    }

    if (!bookingData.email.trim()) {
      return toast.error("Email is required");
    }

    if (!bookingData.phone.trim()) {
      return toast.error("Phone Number is required");
    }

    if (!bookingData.guests) {
      return toast.error("Please select guests");
    }

    if (!bookingData.checkInDate) {
      return toast.error("Check In Date is required");
    }

    if (!bookingData.checkOutDate) {
      return toast.error("Check Out Date is required");
    }

    if (
      new Date(bookingData.checkOutDate) <= new Date(bookingData.checkInDate)
    ) {
      return toast.error("Check Out must be after Check In");
    }

    setStep(2);
  };

  return (
    <div className="grid lg:grid-cols-[2fr_1.1fr] gap-8">
      {/* LEFT */}

      <div className="bg-white rounded-3xl border p-8">
        <h2 className="text-4xl font-semibold text-center mb-10">
          Guest Information
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          {/* FULL NAME */}

          <div>
            <label className="block mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
              Full Name
            </label>

            <input
              type="text"
              value={bookingData.name}
              readOnly
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full border rounded-2xl px-4 py-4 outline-none"
              placeholder="Alex Johnson"
            />
          </div>

          {/* EMAIL */}

          <div>
            <label className="block mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
              Email
            </label>

            <input
              type="email"
              value={bookingData.email}
              readOnly
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full border rounded-2xl px-4 py-4 outline-none"
              placeholder="alex@example.com"
            />
          </div>

          {/* PHONE */}

          <div>
            <label className="block mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
              Phone
            </label>

            <input
              type="text"
              value={bookingData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="w-full border rounded-2xl px-4 py-4 outline-none"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          {/* GUESTS */}

          <div>
            <label className="block mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
              Guests
            </label>

            <select
              value={bookingData.guests}
              onChange={(e) => updateField("guests", e.target.value)}
              className="w-full border rounded-2xl px-4 py-4 outline-none"
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
            </select>
          </div>
        </div>

        {/* DATES */}

        <div className="grid md:grid-cols-3 gap-5 mt-8">
          <div>
            <label className="block mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
              Check-In
            </label>

            <input
              type="date"
              value={bookingData.checkInDate || ""}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => updateField("checkInDate", e.target.value)}
              className="w-full border rounded-2xl px-4 py-4 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
              Check-Out
            </label>

            <input
              type="date"
              value={bookingData.checkOutDate || ""}
              min={bookingData.checkInDate}
              onChange={(e) => updateField("checkOutDate", e.target.value)}
              className="w-full border rounded-2xl px-4 py-4 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
              Nights
            </label>

            <div className="border rounded-2xl px-4 py-4 text-center text-xl font-semibold">
              {nights}
            </div>
          </div>
        </div>

        {/* SPECIAL REQUEST */}

        <div className="mt-8">
          <label className="block mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
            Special Requests (Optional)
          </label>

          <textarea
            rows={4}
            value={bookingData.specialRequest}
            onChange={(e) => updateField("specialRequest", e.target.value)}
            className="w-full border rounded-2xl p-4 outline-none resize-none"
            placeholder="e.g. high floor, anniversary setup..."
          />
        </div>

        {/* CONTINUE */}

        <div className="flex justify-end mt-8">
          <button
            onClick={handleContinue}
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

        <div className="space-y-4 mt-8 text-lg">
          <div className="flex justify-between">
            <span>Guests</span>
            <span>{bookingData.guests}</span>
          </div>

          <div className="flex justify-between">
            <span>Nights</span>
            <span>{nights}</span>
          </div>

          <div className="flex justify-between">
            <span>
              ${room.pricePerNight} × {nights}
            </span>
            <span>${subtotal}</span>
          </div>

          <div className="flex justify-between">
            <span>Taxes (12%)</span>
            <span>${taxes}</span>
          </div>

          <hr className="my-4" />

          <div className="flex justify-between text-2xl font-bold text-[#0f2f5f]">
            <span>Total Due</span>
            <span>${total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
