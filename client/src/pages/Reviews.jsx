import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

export default function Reviews() {
  const { axios, getToken, user } = useAppContext();

  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get("/api/reviews");

      console.log("FULL RESPONSE:", data);
      console.log("REVIEWS:", data.reviews);

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
    <div className="pt-32 pb-20 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="mb-10 flex items-center justify-between flex-wrap gap-6">
        <div>
          <h1 className="text-5xl font-bold">Guest Reviews</h1>

          <p className="text-gray-500 mt-2">{reviews.length} Reviews</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
          <p className="text-gray-500 text-sm">Average Rating</p>

          <div className="flex items-center gap-3 mt-2">
            <div className="text-yellow-400 text-3xl">{stars}</div>

            <span className="text-4xl font-bold">{averageRating}</span>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-700">
            No Reviews Yet
          </h2>

          <p className="text-gray-500 mt-2">
            Guests haven't reviewed your hotel yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-between items-start flex-col md:flex-row gap-6">
                {/* Left */}
                <div className="flex gap-4">
                  {/* Room Image */}
                  {review.room?.images?.[0] ? (
                    <img
                      src={review.hotel?.image || review.room?.images?.[0]}
                      alt={review.hotel?.name}
                      className="w-32 h-32 rounded-2xl object-cover shadow"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                      No Image
                    </div>
                  )}

                  {/* User */}
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                        {(review.userName || review.user?.username || "G")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold">
                          {review.userName || review.user?.username || "Guest"}
                        </h3>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                            🏨 {review.hotel?.name}
                          </span>

                          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
                            🛏 {review.room?.roomType}
                          </span>

                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                            ✔ Verified Stay
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400 text-2xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= review.rating ? "★" : "☆"}
                      </span>
                    ))}
                  </div>

                  <span className="text-lg font-semibold text-gray-700">
                    {review.rating}.0
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-semibold mt-8 mb-3">
                {getTitle(review.rating)}
              </h3>

              {/* Comment */}
              <p className="text-gray-700 text-lg leading-9">
                {review.comment}
              </p>

              {/* Date */}
              <p className="mt-6 text-gray-400 text-sm">
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
