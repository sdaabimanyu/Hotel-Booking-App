import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

export default function Reviews() {
  const { axios, getToken, user } = useAppContext();

  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get("/api/reviews/hotel", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      console.log(data.reviews);

      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  return (
    <div className="pt-32 pb-20 px-4 md:px-16 lg:px-24 xl:px-32">
      <h1 className="text-4xl font-bold mb-10">Guest Reviews</h1>

      {reviews.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          No reviews available.
        </div>
      ) : (
        <div className="space-y-8">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="border border-gray-300 rounded-3xl p-6 bg-white shadow-sm"
            >
              <div className="flex justify-between items-start flex-col md:flex-row gap-6">
                {/* Left */}
                <div className="flex gap-4">
                  {/* Room Image */}
                  {review.room?.images?.[0] ? (
                    <img
                      src={review.room.images[0]}
                      alt={review.room.roomType}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                      No Image
                    </div>
                  )}

                  {/* User */}
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                        {(review.userName || review.user?.username || "G")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold">
                          {review.userName || review.user?.username || "Guest"}
                        </h3>

                        <p className="text-gray-500">
                          {review.room?.roomType || "Room Deleted"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex text-yellow-400 text-3xl">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <p className="mt-6 text-gray-700 leading-7 max-w-4xl">
                {review.comment}
              </p>

              {/* Date */}
              <p className="mt-4 text-gray-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
