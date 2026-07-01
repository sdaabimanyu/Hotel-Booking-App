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
  const [paymentMethod, setPaymentMethod] = useState("hotel");

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
    return <div className="pt-40 text-center">Loading...</div>;
  }

  return (
    <div className="pt-28 pb-20 px-4 md:px-16 lg:px-24 xl:px-32 bg-[#faf9f7] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Progress Bar */}

        <div className="grid grid-cols-3 border rounded-3xl overflow-hidden mb-10">
          <div
            className={`p-5 text-center ${
              step >= 1 ? "bg-[#0f2f5f] text-white" : ""
            }`}
          >
            1. Your Details
          </div>

          <div
            className={`p-5 text-center ${
              step >= 2 ? "bg-[#0f2f5f] text-white" : ""
            }`}
          >
            2. Offers & Pricing
          </div>

          <div
            className={`p-5 text-center ${
              step >= 3 ? "bg-[#0f2f5f] text-white" : ""
            }`}
          >
            3. Payment
          </div>
        </div>

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
