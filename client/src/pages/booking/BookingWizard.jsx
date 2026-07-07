import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";

export default function BookingWizard() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const { rooms, user } = useAppContext();

  const [room, setRoom] = useState(null);
  const [step, setStep] = useState(1);

  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
    guests: searchParams.get("guests") || 1,
    checkInDate: searchParams.get("checkIn"),
    checkOutDate: searchParams.get("checkOut"),
    specialRequest: "",
    selectedOffer: null,
  });

  useEffect(() => {
    if (!user) return;
    setBookingData((prev) => ({
      ...prev,
      name: user.fullName || "",
      email: user.primaryEmailAddress?.emailAddress || "",
    }));
  }, [user]);

  useEffect(() => {
    if (!rooms.length) return;
    const foundRoom = rooms.find((r) => r._id === roomId);
    if (foundRoom) {
      setRoom(foundRoom);
    }
  }, [roomId, rooms]);

  if (!room) {
    return (
      <div className="pt-40 text-center text-slate-500 font-light font-inter">
        Loading luxury dashboard...
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 md:px-16 lg:px-24 xl:px-32 bg-slate-50/50 min-h-screen antialiased">
      <div className="max-w-7xl mx-auto">
        {/* Luxury Progress Stepper */}
        <div className="grid grid-cols-3 bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden mb-12">
          {[
            { id: 1, label: "Your Details" },
            { id: 2, label: "Offers & Pricing" },
            { id: 3, label: "Payment" },
          ].map((s) => (
            <div
              key={s.id}
              className={`p-4 md:p-5 text-center text-xs md:text-sm font-inter tracking-wider uppercase transition-all duration-300 flex flex-col items-center justify-center gap-1 border-r border-slate-50 last:border-none ${
                step >= s.id
                  ? "text-slate-950 font-semibold"
                  : "text-slate-400 font-light"
              }`}
            >
              <span>
                {s.id}. {s.label}
              </span>
              {step === s.id && (
                <div className="w-8 h-[2px] bg-amber-600 rounded-full mt-0.5 animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* Dynamic Multi-Step Routing Components */}
        {step === 1 && (
          <StepOne
            room={room}
            bookingData={bookingData}
            setBookingData={setBookingData}
            setStep={setStep}
          />
        )}

        {step === 2 && (
          <StepTwo
            room={room}
            bookingData={bookingData}
            setBookingData={setBookingData}
            setStep={setStep}
          />
        )}

        {step === 3 && (
          <StepThree room={room} bookingData={bookingData} setStep={setStep} />
        )}
      </div>
    </div>
  );
}
