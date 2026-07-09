import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";

export default function BookingWizard() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();

  const { rooms, user, axios, getToken } = useAppContext();

  const [room, setRoom] = useState(null);
  const [step, setStep] = useState(1);
  const [profileLoading, setProfileLoading] = useState(true);

  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
    guests: Number(searchParams.get("guests")) || 1,
    checkInDate: searchParams.get("checkIn") || "",
    checkOutDate: searchParams.get("checkOut") || "",
    specialRequest: "",
    selectedOffer: null,
  });

  // =========================================================
  // FIND SELECTED ROOM
  // =========================================================

  useEffect(() => {
    if (!rooms.length) return;

    const foundRoom = rooms.find((room) => room._id === roomId);

    if (foundRoom) {
      setRoom(foundRoom);
    }
  }, [roomId, rooms]);

  // =========================================================
  // LOAD USER PROFILE + BOOKING PREFERENCES
  // =========================================================

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);

        const token = await getToken();

        const { data } = await axios.get("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("BOOKING PROFILE RESPONSE:", data);

        if (data.success) {
          const profileUser = data.user;

          // Check if guests were already provided through the URL
          const guestsFromSearch = searchParams.get("guests");

          setBookingData((prev) => ({
            ...prev,

            // Clerk user information
            name: user.fullName || profileUser.username || "",

            email:
              user.primaryEmailAddress?.emailAddress || profileUser.email || "",

            // MongoDB profile information
            phone: profileUser.profile?.phone || "",

            // IMPORTANT:
            // URL guests have priority.
            // Otherwise use saved booking preference.
            // Otherwise default to 1.
            guests: guestsFromSearch
              ? Number(guestsFromSearch)
              : profileUser.bookingPreferences?.preferredGuests || 1,
          }));
        }
      } catch (error) {
        console.log(
          "FETCH BOOKING PROFILE ERROR:",
          error.response?.data || error.message,
        );
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, getToken, axios, searchParams]);

  // =========================================================
  // LOADING
  // =========================================================

  if (!room || profileLoading) {
    return (
      <div className="min-h-screen pt-40 flex items-center justify-center bg-slate-50/50">
        <p className="text-slate-500 font-light font-inter">
          Loading booking details...
        </p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 md:px-16 lg:px-24 xl:px-32 bg-slate-50/50 min-h-screen antialiased">
      <div className="max-w-7xl mx-auto">
        {/* ================================================= */}
        {/* PROGRESS STEPPER */}
        {/* ================================================= */}

        <div className="grid grid-cols-3 bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden mb-12">
          {[
            {
              id: 1,
              label: "Your Details",
            },
            {
              id: 2,
              label: "Offers & Pricing",
            },
            {
              id: 3,
              label: "Payment",
            },
          ].map((stepItem) => (
            <div
              key={stepItem.id}
              className={`p-4 md:p-5 text-center text-xs md:text-sm font-inter tracking-wider uppercase transition-all duration-300 flex flex-col items-center justify-center gap-1 border-r border-slate-50 last:border-none ${
                step >= stepItem.id
                  ? "text-slate-950 font-semibold"
                  : "text-slate-400 font-light"
              }`}
            >
              <span>
                {stepItem.id}. {stepItem.label}
              </span>

              {step === stepItem.id && (
                <div className="w-8 h-[2px] bg-amber-600 rounded-full mt-0.5 animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* ================================================= */}
        {/* STEP ONE */}
        {/* ================================================= */}

        {step === 1 && (
          <StepOne
            room={room}
            bookingData={bookingData}
            setBookingData={setBookingData}
            setStep={setStep}
          />
        )}

        {/* ================================================= */}
        {/* STEP TWO */}
        {/* ================================================= */}

        {step === 2 && (
          <StepTwo
            room={room}
            bookingData={bookingData}
            setBookingData={setBookingData}
            setStep={setStep}
          />
        )}

        {/* ================================================= */}
        {/* STEP THREE */}
        {/* ================================================= */}

        {step === 3 && (
          <StepThree room={room} bookingData={bookingData} setStep={setStep} />
        )}
      </div>
    </div>
  );
}
