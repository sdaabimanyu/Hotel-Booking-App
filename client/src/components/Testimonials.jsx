import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import StarRating from "./StarRating";

export default function Testimonials() {
  const { axios } = useAppContext();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get("/api/reviews");
      if (data.success) {
        setReviews(data.reviews.slice(0, 3));
      }
    } catch (error) {
      console.log("FETCH TESTIMONIALS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="bg-white py-24 px-4 md:px-16 lg:px-24 antialiased border-t border-slate-100/60">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Editorial Section Header */}
        <div className="mb-16 text-center">
          <span className="text-[11px] font-bold tracking-widest text-amber-600 uppercase font-inter block mb-3">
            Guest Journal
          </span>
          <h1 className="text-center text-[40px] font-medium font-playfair text-slate-900 tracking-tight">
            What Our Guests Say
          </h1>
          <p className="text-center text-gray-500/90 text-[15px] max-w-3xl mt-3 leading-relaxed font-inter">
            Discover what our guests have to say about their stays and
            experiences at El Hotel.
          </p>
        </div>

        {/* Dynamic Loading Framework States */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-inter text-slate-400">
              Loading guest reviews...
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl w-full max-w-4xl bg-slate-50/50">
            <p className="text-sm font-inter text-slate-400">
              No guest reviews available yet.
            </p>
          </div>
        ) : (
          /* Uniform Grid Alignment Layout Wrapper */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full items-stretch">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Decorative Premium Quote Mark Backing */}
                <span className="absolute right-6 top-4 font-playfair text-8xl text-slate-100/70 select-none pointer-events-none line-clamp-1">
                  “
                </span>

                <div className="relative z-10 flex-1 flex flex-col">
                  {/* Reviewer Profile Meta Section */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center font-semibold text-base shrink-0 font-inter tracking-wide shadow-2xs">
                        {review.userName?.charAt(0).toUpperCase() || "G"}
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium font-playfair text-lg text-slate-900 truncate">
                          {review.userName || "Verified Guest"}
                        </p>
                        <p className="text-slate-400 text-xs font-inter mt-0.5 truncate">
                          {review.hotel?.name || "El Hotel"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Context Meta Row: Rating + Room Type Badge */}
                  <div className="flex flex-wrap items-center gap-3 mt-6">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <StarRating rating={review.rating} />
                    </div>
                    {review.room?.roomType && (
                      <span className="inline-flex items-center bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase font-inter">
                        {review.room.roomType}
                      </span>
                    )}
                  </div>

                  {/* Body Comment Narrative Text */}
                  <p className="text-slate-600 font-inter text-[14px] leading-relaxed mt-4 italic font-light flex-1">
                    "{review.comment}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
