import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";

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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Guest Reviews</h1>

      <div className="space-y-5">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white border rounded-xl p-5">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                {/* Room Image */}
                <img
                  src={review.room?.images?.[0]}
                  alt="room"
                  className="w-20 h-20 rounded-lg object-cover"
                />

                <div>
                  {/* User */}
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                      {review.userName?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg">
                        {review.userName}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {review.room?.roomType}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-yellow-500 text-xl">
                {"⭐".repeat(review.rating)}
              </div>
            </div>

            <p className="mt-3 text-gray-600">{review.comment}</p>

            <p className="text-sm text-gray-400 mt-3">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
