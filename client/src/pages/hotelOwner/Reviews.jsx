import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Star, MessageSquare, Building, Calendar } from "lucide-react";

export default function Reviews() {
  const { axios, getToken } = useAppContext();
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get("/api/reviews/hotel", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Calculate high-level summary metrics
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews
        ).toFixed(1)
      : "0.0";

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-gray-200 fill-gray-100"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Premium Header Summary Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Guest Reviews
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Read authenticated opinions from previous guests to inspect service
            quality trends.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-gray-50/70 border border-gray-100 px-5 py-3 rounded-xl shrink-0">
          <div className="text-center">
            <span className="text-3xl font-bold text-gray-900">
              {averageRating}
            </span>
            <span className="text-gray-400 text-sm font-medium"> / 5.0</span>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="text-xs font-medium text-gray-500 mt-1">
              Based on {totalReviews} reviews
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Stream Container */}
      <div className="space-y-5">
        {reviews.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 text-sm flex flex-col items-center gap-2">
            <MessageSquare className="w-8 h-8 text-gray-300" />
            <span>No customer reviews collected yet.</span>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                {/* Left: Guest Profile Meta block */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Dynamic Initial Circle */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-sm shrink-0">
                    {review.userName?.charAt(0).toUpperCase() || "G"}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h3 className="font-semibold text-gray-900 text-base leading-snug">
                        {review.userName || "Verified Guest"}
                      </h3>
                      {renderStars(review.rating)}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1 text-blue-600 bg-blue-50/60 px-2 py-0.5 rounded-md">
                        <Building className="w-3 h-3" />
                        {review.room?.roomType || "Luxury Suite"}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    </div>

                    {/* Actual Review Message Content body */}
                    <p className="text-gray-600 text-sm leading-relaxed pt-2 max-w-3xl font-normal">
                      "{review.comment}"
                    </p>
                  </div>
                </div>

                {/* Right: Architectural Room Thumbnail Element */}
                {review.room?.images?.[0] && (
                  <div className="w-full md:w-28 h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0 bg-gray-50 max-md:order-first">
                    <img
                      src={review.room.images[0]}
                      alt="Reserved Space Preview"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
