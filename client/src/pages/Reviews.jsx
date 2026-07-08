import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

export default function Reviews() {
  const { axios, user } = useAppContext();
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get("/api/reviews");

      console.log("PUBLIC REVIEWS RESPONSE:", data);
      console.log("NUMBER OF PUBLIC REVIEWS:", data.reviews?.length);

      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTitle = (rating) => {
    if (rating === 5) return "Excellent Stay";
    if (rating === 4) return "Great Experience";
    if (rating === 3) return "Pleasant Stay";
    if (rating === 2) return "Needs Improvement";
    return "Not Satisfied";
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  const fullStars = Math.floor(averageRating);
  const stars = "★".repeat(fullStars) + "☆".repeat(5 - fullStars);

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  return (
    <div className="pt-36 pb-24 px-6 md:px-16 lg:px-24 xl:px-32 max-w-7xl mx-auto bg-slate-50/40 min-h-screen antialiased">
      {/* Header Section */}
      <div className="mb-12 flex items-end justify-between flex-wrap gap-8 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-5xl font-playfair font-medium tracking-tight text-slate-900">
            Guest Reviews
          </h1>
          <p className="font-inter text-slate-500 font-normal mt-3 tracking-wide text-sm">
            Take advantage of our customer feedback and verified testimonials •{" "}
            {reviews.length} Reviews
          </p>
        </div>

        {/* Score Overview Card */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center gap-6 min-w-[240px]">
          <div>
            <p className="font-inter text-slate-400 text-xs font-semibold tracking-wider uppercase">
              Average Rating
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-4xl font-playfair font-bold text-slate-800">
                {averageRating}
              </span>
              <span className="font-inter text-slate-400 text-sm">/ 5.0</span>
            </div>
          </div>
          <div className="h-10 w-px bg-gray-100" />
          <div className="text-secondary text-xl tracking-tight">{stars}</div>
        </div>
      </div>

      {/* Reviews Content Grid */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center shadow-sm">
          <h2 className="text-2xl font-playfair font-semibold text-slate-700">
            No Reviews Yet
          </h2>
          <p className="font-inter text-slate-400 mt-2 text-sm">
            Guests haven't reviewed your hotel yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-2xl p-8 shadow-[0_6px_24px_rgba(0,0,0,0.015)] border border-slate-100/80 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                {/* User Info & Metadata Group */}
                <div className="flex flex-col sm:flex-row gap-6 items-start w-full">
                  {/* Room Thumbnail Image */}
                  {review.room?.images?.[0] ? (
                    <img
                      src={review.hotel?.image || review.room?.images?.[0]}
                      alt={review.hotel?.name}
                      className="w-28 h-28 rounded-2xl object-cover shadow-sm bg-slate-100"
                    />
                  ) : (
                    <div className="font-inter w-28 h-28 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-xs tracking-wider uppercase">
                      No Image
                    </div>
                  )}

                  {/* Profile & Detail Badges */}
                  <div className="flex-1 space-y-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-900 text-slate-100 flex items-center justify-center text-base font-semibold shadow-sm">
                        {(review.userName || review.user?.username || "G")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight capitalize">
                          {review.userName || review.user?.username || "Guest"}
                        </h3>
                        <p className="font-inter text-xs text-slate-400 font-medium">
                          Verified Resident
                        </p>
                      </div>
                    </div>

                    {/* Styled Meta Badges using Outfit natively */}
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      <span className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 text-xs font-semibold tracking-wide">
                        🏢 {review.hotel?.name}
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 text-xs font-semibold tracking-wide">
                        🛏 {review.room?.roomType}
                      </span>
                      <span className="font-inter px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide">
                        ✓ Verified Stay
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating Value with Custom Secondary Accent color */}
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 self-start md:self-auto">
                  <div className="flex text-secondary text-base tracking-tighter">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= review.rating ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="font-inter text-xs font-bold text-slate-700">
                    {review.rating}.0
                  </span>
                </div>
              </div>

              {/* Review Text Area */}
              <div className="mt-6 pt-6 border-t border-slate-50">
                <h4 className="text-xl font-playfair font-bold text-slate-800 mb-2">
                  {getTitle(review.rating)}
                </h4>
                <p className="font-inter text-slate-600 text-base leading-relaxed font-light">
                  "{review.comment}"
                </p>
              </div>

              {/* Date Block */}
              <p className="font-inter mt-5 text-slate-400 text-xs tracking-wide">
                Reviewed on{" "}
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
