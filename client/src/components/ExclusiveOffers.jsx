import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function ExclusiveOffers() {
  const { axios } = useAppContext();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);

  const fetchOffers = async () => {
    try {
      const { data } = await axios.get("/api/offers");
      if (data.success) {
        const activeOffers = data.offers
          .filter((offer) => offer.isActive)
          .slice(0, 3);
        setOffers(activeOffers);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <div className="bg-white py-24 px-4 md:px-16 lg:px-24 antialiased border-t border-slate-100/60">
      <div className="max-w-7xl mx-auto">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold tracking-widest text-amber-600 uppercase font-inter block mb-3">
              Seasonal Specials
            </span>
            <h1 className="text-3xl md:text-[40px] font-medium font-playfair text-slate-900 tracking-tight">
              Exclusive Offers
            </h1>
            <p className="text-gray-500/90 text-[15px] mt-3 leading-relaxed font-inter">
              Take advantage of our limited-time offers and special packages to
              enhance your stay and create unforgettable memories.
            </p>
          </div>

          <button
            onClick={() => navigate("/offers")}
            className="group flex items-center gap-2 text-xs font-semibold font-inter uppercase tracking-widest text-slate-800 hover:text-amber-600 transition-colors duration-300 pb-1"
          >
            <span>View All Offers</span>
            <svg
              className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>

        {/* Premium Offers Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <div
              key={offer._id}
              className="group relative rounded-3xl overflow-hidden shadow-xs flex min-h-[440px] p-8 transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-xl border border-slate-100"
            >
              {/* High-Resolution Background Frame */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url(${offer.image})` }}
              />

              {/* Luxury Ambient Contrast Gradient Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10 transition-opacity duration-300 group-hover:opacity-95" />

              {/* Premium Discount Badge Overlay */}
              <p className="absolute top-6 left-6 z-20 bg-white/95 backdrop-blur-xs text-slate-900 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide shadow-xs font-inter border border-white/20">
                {offer.discount}
                {offer.discountType === "percentage" ? "%" : "$"} OFF
              </p>

              {/* Text Meta Context Layer */}
              <div className="relative z-10 text-white mt-auto flex flex-col items-start w-full">
                <h2 className="text-3xl font-medium font-playfair tracking-tight mb-2.5 leading-tight">
                  {offer.title}
                </h2>

                <p className="text-slate-200/90 text-sm font-inter font-light leading-relaxed mb-6 line-clamp-2">
                  {offer.description}
                </p>

                {/* Structured Metadata Parameters */}
                <div className="w-full space-y-2 text-xs font-inter font-light text-slate-300 border-t border-white/10 pt-4 mb-2">
                  <div className="flex justify-between items-center">
                    <span className="opacity-70">Promo Code</span>
                    <span className="text-amber-400 font-bold tracking-wider font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {offer.code}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-70">Minimum Stay</span>
                    <span className="font-normal text-slate-100">
                      {offer.minimumStay}{" "}
                      {offer.minimumStay > 1 ? "Nights" : "Night"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-70">Valid Till</span>
                    <span className="font-normal text-slate-100">
                      {new Date(offer.validTill).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Inline Action CTA Trigger */}
                <button
                  onClick={() => navigate("/offers")}
                  className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors duration-200 group/btn"
                >
                  <span>View Offer Details</span>
                  <svg
                    className="w-3.5 h-3.5 transform transition-transform duration-200 group-hover/btn:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Graceful Fallback State */}
        {offers.length === 0 && (
          <div className="text-center py-20 border border-dashed border-slate-200 rounded-3xl mt-12 bg-slate-50/50">
            <h2 className="text-xl font-medium font-playfair text-slate-800">
              No Offers Available
            </h2>
            <p className="text-sm font-inter text-slate-400 mt-1.5">
              New seasonal experiences will be debuted soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
