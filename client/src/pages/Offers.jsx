import React from "react";
import { useNavigate } from "react-router-dom";

export default function Offers() {
  const navigate = useNavigate();

  const offers = [
    {
      id: 1,
      title: "Early Bird Discount",
      discount: "25%",
      code: "EARLY25",
      description:
        "Book 30 days in advance and save 25% across all room types. Plan ahead and enjoy your reward.",
      minStay: "2 nights",
      validTill: "May 31, 2026",
      used: 145,
      active: true,
    },
    {
      id: 2,
      title: "Weekend Getaway",
      discount: "20%",
      code: "WKND20",
      description:
        "Enjoy 20% off on Friday–Sunday stays. The perfect excuse for a spontaneous city escape.",
      minStay: "2 nights",
      validTill: "Jun 30, 2026",
      used: 89,
      active: true,
    },
    {
      id: 3,
      title: "Long Stay Bonus",
      discount: "$100",
      code: "STAY100",
      description:
        "Stay 7 nights or more and receive $100 off your total booking. The longer the stay, the greater the reward.",
      minStay: "7 nights",
      validTill: "Dec 31, 2026",
      used: 34,
      active: true,
    },
    {
      id: 4,
      title: "Suite Privilege",
      discount: "15%",
      code: "SUITE15",
      description:
        "Reserve any suite and enjoy 15% off. Subject to limited availability — book now.",
      minStay: "1 night",
      validTill: "Apr 30, 2026",
      used: 23,
      active: true,
    },
    {
      id: 5,
      title: "Summer Escape",
      discount: "30%",
      code: "SUMMER30",
      description:
        "Special summer offer available for selected destinations and room categories.",
      minStay: "3 nights",
      validTill: "Aug 31, 2026",
      used: 12,
      active: false,
    },
  ];
  return (
    <div className="bg-[#f7f6f3] min-h-screen pt-32 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="uppercase tracking-[6px] text-[#c9a74d] text-sm">
            Exclusive Deals
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-[#0f2f5f] mt-4">
            Special Offers
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`rounded-3xl overflow-hidden border shadow-sm bg-white ${
                !offer.active ? "opacity-60" : ""
              }`}
            >
              {/* Top Section */}
              <div className="bg-[#0f2f5f] text-white p-8 flex justify-between items-start">
                <div>
                  <p className="uppercase text-[#d4af37] tracking-[4px] text-sm">
                    Save
                  </p>

                  <h2 className="text-6xl font-bold mt-3">{offer.discount}</h2>
                </div>

                <div className="text-right">
                  <p className="uppercase text-gray-300 text-sm">Promo Code</p>

                  <h3 className="text-[#d4af37] text-3xl font-bold mt-3 tracking-widest">
                    {offer.code}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-3xl font-semibold text-[#0f2f5f]">
                    {offer.title}
                  </h3>

                  {!offer.active && (
                    <span className="bg-red-100 text-red-500 px-4 py-2 rounded-xl text-sm">
                      Inactive
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  {offer.description}
                </p>

                <div className="flex flex-wrap gap-6 text-gray-500 text-sm mb-8">
                  <span>Min stay: {offer.minStay}</span>

                  <span>Valid till: {offer.validTill}</span>

                  <span>Used: {offer.used}×</span>
                </div>

                <button
                  disabled={!offer.active}
                  onClick={() => navigate("/rooms")}
                  className={`w-full py-4 rounded-2xl text-lg font-medium transition ${
                    offer.active
                      ? "bg-[#c9a74d] text-white hover:bg-[#b89637]"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Book With This Offer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
