import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { Calendar, User, CreditCard, ChevronDown } from "lucide-react";

export default function Bookings() {
  const { axios, getToken, currency } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  // ==========================================
  // FETCH HOTEL BOOKINGS
  // ==========================================

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await axios.get("/api/bookings/hotel", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("HOTEL BOOKINGS RESPONSE:", data);

      if (data.success) {
        setBookings(data.dashboardData?.bookings || []);
      } else {
        toast.error(data.message || "Failed to fetch bookings");
      }
    } catch (error) {
      console.log(
        "FETCH BOOKINGS ERROR:",
        error.response?.data || error.message,
      );

      toast.error(error.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE BOOKING STATUS
  // ==========================================

  const updateStatus = async (bookingId, status) => {
    try {
      setUpdatingBookingId(bookingId);

      const token = await getToken();

      const { data } = await axios.put(
        "/api/bookings/status",
        {
          bookingId,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message || "Booking status updated");

        // Update only the changed booking in frontend state
        setBookings((previousBookings) =>
          previousBookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  status: data.booking.status,
                }
              : booking,
          ),
        );
      } else {
        toast.error(data.message || "Failed to update booking status");
      }
    } catch (error) {
      console.log(
        "UPDATE STATUS ERROR:",
        error.response?.data || error.message,
      );

      toast.error(
        error.response?.data?.message || "Failed to update booking status",
      );
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // ==========================================
  // FETCH BOOKINGS WHEN PAGE LOADS
  // ==========================================

  useEffect(() => {
    fetchBookings();
  }, []);

  // ==========================================
  // STATUS COLOR
  // ==========================================

  const getStatusColor = (status) => {
    switch (status) {
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

  // ==========================================
  // GET ALLOWED NEXT STATUSES
  // ==========================================

  const getAllowedStatuses = (currentStatus) => {
    const allowedTransitions = {
      pending: [
        {
          value: "confirmed",
          label: "Confirmed",
        },
        {
          value: "cancelled",
          label: "Cancelled",
        },
      ],

      confirmed: [
        {
          value: "checked-in",
          label: "Checked In",
        },
        {
          value: "cancelled",
          label: "Cancelled",
        },
      ],

      "checked-in": [
        {
          value: "checked-out",
          label: "Checked Out",
        },
      ],

      "checked-out": [],

      cancelled: [],
    };

    return allowedTransitions[currentStatus] || [];
  };

  // ==========================================
  // FORMAT STATUS
  // ==========================================

  const formatStatus = (status) => {
    switch (status) {
      case "checked-in":
        return "Checked In";

      case "checked-out":
        return "Checked Out";

      case "confirmed":
        return "Confirmed";

      case "cancelled":
        return "Cancelled";

      default:
        return "Pending";
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center py-20 text-gray-500">
          Loading bookings...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* HEADER */}

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

      {/* BOOKINGS */}

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-400 text-sm">
            No active reservations found.
          </div>
        ) : (
          bookings.map((booking) => {
            const allowedStatuses = getAllowedStatuses(booking.status);

            const isFinished =
              booking.status === "checked-out" ||
              booking.status === "cancelled";

            return (
              <div
                key={booking._id}
                className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* GUEST + ROOM */}

                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <User className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <h2 className="font-semibold text-gray-900 text-base leading-snug">
                        {booking.name || booking.user?.username || "Guest"}
                      </h2>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span className="font-medium text-blue-600 bg-blue-50/50 px-2.5 py-0.5 rounded-md text-xs">
                          {booking.room?.roomType || "Standard Room"}
                        </span>

                        <span className="text-gray-400 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" />

                          {currency || "$"}
                          {booking.totalPrice?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DATES */}

                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 max-w-sm w-full lg:px-6 lg:border-x lg:border-gray-100">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                        Check-In
                      </span>

                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400 shrink-0" />

                        {new Date(booking.checkInDate).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
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
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PAYMENT + STATUS */}

                  <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-50">
                    {/* PAYMENT */}

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

                    {/* BOOKING STATUS */}

                    <div className="relative inline-block w-40">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                        Booking Status
                      </span>

                      {isFinished ? (
                        <div
                          className={`w-full border rounded-lg px-3 py-2 text-xs font-semibold ${getStatusColor(
                            booking.status,
                          )}`}
                        >
                          {formatStatus(booking.status)}
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            value={booking.status}
                            disabled={updatingBookingId === booking._id}
                            onChange={(event) => {
                              const newStatus = event.target.value;

                              if (newStatus === booking.status) {
                                return;
                              }

                              updateStatus(booking._id, newStatus);
                            }}
                            className={`w-full appearance-none border rounded-lg px-3 py-2 pr-8 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 cursor-pointer transition-all disabled:cursor-not-allowed disabled:opacity-60 ${getStatusColor(
                              booking.status,
                            )}`}
                          >
                            {/* CURRENT STATUS */}

                            <option value={booking.status}>
                              {formatStatus(booking.status)}
                            </option>

                            {/* ONLY ALLOWED NEXT STATUSES */}

                            {allowedStatuses.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>

                          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
