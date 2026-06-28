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

      console.log(data);

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

      <div className="space-y-8">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="border border-gray-300 rounded-3xl p-6"
          >
            <div className="flex justify-between items-start">
              {/* Left */}
              <div className="flex gap-4">
                {/* Room Image */}
                <img
                  src={review.room?.images?.[0]}
                  alt=""
                  className="w-24 h-24 rounded-xl object-cover"
                />

                {/* User + Room */}
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                      {review.userName?.charAt(0).toUpperCase() || "G"}
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold">
                        {review.userName || "Guest"}
                      </h3>

                      <p className="text-gray-500">{review.room?.roomType}</p>
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

            {/* Review Text */}
            <p className="mt-6 text-lg text-gray-700">{review.comment}</p>

            {/* Date */}
            <p className="mt-4 text-gray-400">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
      {reviews.map((review) => (
        <div key={review._id}>
          <p>{review.user.username}</p>
          <p>{review.room.roomType}</p>
          <p>{review.rating}</p>
          <p>{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
