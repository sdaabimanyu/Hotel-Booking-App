import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

export default function Bookings() {
  const { axios, getToken } = useAppContext();

  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/api/bookings/hotel", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setBookings(data.dashboardData.bookings);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      const { data } = await axios.put(
        "/api/bookings/status",
        {
          bookingId,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );

      if (data.success) {
        toast.success("Status Updated");
        fetchBookings();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Hotel Bookings</h1>

      <div className="space-y-5">
        {bookings.map((booking) => (
          <div key={booking._id} className="border rounded-xl p-5 bg-white">
            <div className="flex justify-between">
              <div>
                <h2 className="font-semibold text-lg">
                  {booking.userName || booking.user?.username || "Guest"}
                </h2>

                <p>{booking.room?.roomType}</p>

                <p className="text-sm text-gray-500">
                  Check In: {new Date(booking.checkInDate).toLocaleDateString()}
                </p>

                <p className="text-sm text-gray-500">
                  Check Out:{" "}
                  {new Date(booking.checkOutDate).toLocaleDateString()}
                </p>

                <p>Payment: {booking.isPaid ? "Paid" : "Unpaid"}</p>
              </div>

              <select
                value={booking.status}
                onChange={(e) => updateStatus(booking._id, e.target.value)}
                className="border rounded px-3 py-2 h-fit"
              >
                <option value="pending">Pending</option>

                <option value="confirmed">Confirmed</option>

                <option value="checked-in">Checked In</option>

                <option value="checked-out">Checked Out</option>

                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
