import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function BookingWizard() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();

  const { navigate } = useAppContext();

  const [step, setStep] = useState(1);

  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests");

  const offers = [
    {
      title: "Early Bird",
      discount: "25%",
      code: "EARLY25",
    },
    {
      title: "Weekend Getaway",
      discount: "20%",
      code: "WKND20",
    },
    {
      title: "Suite Privilege",
      discount: "15%",
      code: "SUITE15",
    },
  ];

  const [selectedOffer, setSelectedOffer] = useState(null);

  return (
    <div className="pt-30 pb-20 px-6 md:px-12 bg-[#f7f6f3] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Progress */}

        <div className="flex justify-between border rounded-2xl bg-white p-4 mb-10">
          <button
            onClick={() => setStep(1)}
            className={`font-medium ${
              step === 1 ? "text-blue-700" : "text-gray-500"
            }`}
          >
            1. Your Details
          </button>

          <button
            onClick={() => setStep(2)}
            className={`font-medium ${
              step === 2 ? "text-blue-700" : "text-gray-500"
            }`}
          >
            2. Offers & Pricing
          </button>

          <button
            onClick={() => setStep(3)}
            className={`font-medium ${
              step === 3 ? "text-blue-700" : "text-gray-500"
            }`}
          >
            3. Payment
          </button>
        </div>

        {/* STEP 1 */}

        {step === 1 && (
          <div className="bg-white p-8 rounded-2xl shadow">
            <h2 className="text-3xl font-bold mb-8">Guest Details</h2>

            <div className="grid md:grid-cols-2 gap-5">
              <input
                placeholder="Full Name"
                className="border p-4 rounded-xl"
              />

              <input placeholder="Email" className="border p-4 rounded-xl" />

              <input placeholder="Phone" className="border p-4 rounded-xl" />

              <input
                value={guests}
                
                className="border p-4 rounded-xl bg-gray-100"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-8 bg-[#0f2f5f] text-white px-8 py-3 rounded-xl"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 2 */}

        {step === 2 && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Offers & Pricing</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {offers.map((offer, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedOffer(offer)}
                  className={`bg-white p-6 rounded-2xl shadow cursor-pointer border-2 ${
                    selectedOffer?.code === offer.code
                      ? "border-blue-700"
                      : "border-transparent"
                  }`}
                >
                  <h3 className="text-xl font-bold">{offer.title}</h3>

                  <p className="text-5xl font-bold text-blue-700 mt-4">
                    {offer.discount}
                  </p>

                  <p className="mt-4 text-gray-500">{offer.code}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(3)}
              className="mt-8 bg-[#0f2f5f] text-white px-8 py-3 rounded-xl"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 3 */}

        {step === 3 && (
          <div className="bg-white p-8 rounded-2xl shadow">
            <h2 className="text-3xl font-bold mb-6">Payment Summary</h2>

            <div className="space-y-3 text-lg">
              <p>
                <strong>Room ID:</strong> {roomId}
              </p>

              <p>
                <strong>Check In:</strong> {checkIn}
              </p>

              <p>
                <strong>Check Out:</strong> {checkOut}
              </p>

              <p>
                <strong>Guests:</strong> {guests}
              </p>

              <p>
                <strong>Offer:</strong>{" "}
                {selectedOffer ? selectedOffer.code : "No Offer Selected"}
              </p>
            </div>

            <button className="mt-8 bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl">
              Pay With Stripe
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
