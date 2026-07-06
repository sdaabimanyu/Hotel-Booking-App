import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { Calendar, User, CreditCard, ChevronDown } from "lucide-react";

export default function Bookings() {
  const { axios, getToken, currency } = useAppContext();
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
        { bookingId, status },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );

      if (data.success) {
        toast.success("Status Updated Successfully");
        fetchBookings();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "checked-in":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "checked-out":
        return "bg-gray-50 text-gray-600 border-gray-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Hotel Bookings
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage incoming room reservations, track check-ins, and update
            reservation status records.
          </p>
        </div>
        <div className="text-sm font-medium text-gray-500 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl self-start md:self-auto">
          Total Reservations:{" "}
          <span className="text-gray-900 font-semibold">{bookings.length}</span>
        </div>
      </div>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 text-sm">
            No active reservations found.
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Guest Profile & Room Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-semibold text-gray-900 text-base leading-snug">
                      {booking.userName || booking.user?.username || "Guest"}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="font-medium text-blue-600 bg-blue-50/50 px-2.5 py-0.5 rounded-md text-xs">
                        {booking.room?.roomType || "Standard Room"}
                      </span>
                      {booking.amount && (
                        <span className="text-gray-400 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" />
                          {currency || "$"}
                          {booking.amount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline Grid (Check-In / Check-Out) */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 max-w-sm w-full lg:px-6 lg:border-x lg:border-gray-100">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                      Check-In
                    </span>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                      {new Date(booking.checkInDate).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                      Check-Out
                    </span>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                      {new Date(booking.checkOutDate).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Status & Action Control Dropdown */}
                <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-50">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                      Payment
                    </span>
                    <span
                      className={`inline-flex items-center text-xs font-semibold rounded-full px-2.5 py-0.5 ${
                        booking.isPaid
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {booking.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>

                  <div className="relative inline-block w-40">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      Update Status
                    </span>
                    <div className="relative">
                      <select
                        value={booking.status}
                        onChange={(e) =>
                          updateStatus(booking._id, e.target.value)
                        }
                        className={`w-full appearance-none border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 cursor-pointer transition-all ${getStatusColor(booking.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="checked-in">Checked In</option>
                        <option value="checked-out">Checked Out</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
