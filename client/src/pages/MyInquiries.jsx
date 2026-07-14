import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { MessageSquare, CheckCircle, Clock } from "lucide-react";

export default function MyInquiries() {
  const { axios, getToken, user } = useAppContext();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // FETCH USER INQUIRIES
  // =========================================================

  const fetchInquiries = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await axios.get("/api/inquiries/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setInquiries(data.inquiries || []);
      } else {
        toast.error(data.message || "Failed to fetch inquiries");
      }
    } catch (error) {
      console.log("FETCH USER INQUIRIES ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch inquiries",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD INQUIRIES
  // =========================================================

  useEffect(() => {
    if (user) {
      fetchInquiries();
    }
  }, [user]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen pt-40 flex items-center justify-center">
        <p className="text-slate-500">Loading your inquiries...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-16 lg:px-24 xl:px-32 bg-slate-50/50">
      <div className="max-w-6xl mx-auto">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-playfair font-medium text-slate-900">
            My Booking Inquiries
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            View your booking questions and responses from hotels.
          </p>
        </div>

        {/* ================================================= */}
        {/* EMPTY STATE */}
        {/* ================================================= */}

        {inquiries.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-4" />

            <h2 className="text-lg font-semibold text-slate-700">
              No Booking Inquiries
            </h2>

            <p className="text-sm text-slate-400 mt-2">
              Inquiries you send about your bookings will appear here.
            </p>
          </div>
        ) : (
          /* ================================================= */
          /* INQUIRY LIST */
          /* ================================================= */

          <div className="space-y-6">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry._id}
                className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm"
              >
                {/* ========================================= */}
                {/* TOP */}
                {/* ========================================= */}

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-slate-900">
                        {inquiry.subject}
                      </h2>

                      {inquiry.status === "answered" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Answered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                          <Clock className="w-3.5 h-3.5" />
                          Waiting for Reply
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-500 mt-2">
                      {inquiry.hotel?.name || "Hotel"}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400">
                    Sent {new Date(inquiry.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* ========================================= */}
                {/* BOOKING INFORMATION */}
                {/* ========================================= */}

                {inquiry.booking && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-5">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                        Booking ID
                      </p>

                      <p className="text-sm text-slate-700 mt-1 break-all">
                        {inquiry.booking._id}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                        Check-In
                      </p>

                      <p className="text-sm text-slate-700 mt-1">
                        {new Date(
                          inquiry.booking.checkInDate,
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                        Check-Out
                      </p>

                      <p className="text-sm text-slate-700 mt-1">
                        {new Date(
                          inquiry.booking.checkOutDate,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* ========================================= */}
                {/* USER MESSAGE */}
                {/* ========================================= */}

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Your Message
                  </p>

                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {inquiry.message}
                  </p>
                </div>

                {/* ========================================= */}
                {/* HOTEL REPLY */}
                {/* ========================================= */}

                {inquiry.reply ? (
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 mt-4">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                      Hotel Response
                    </p>

                    <p className="text-sm text-emerald-900 leading-relaxed whitespace-pre-wrap">
                      {inquiry.reply}
                    </p>

                    {inquiry.repliedAt && (
                      <p className="text-xs text-emerald-500 mt-4">
                        Replied {new Date(inquiry.repliedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-5 mt-4">
                    <p className="text-sm text-amber-700">
                      The hotel has not responded to this inquiry yet.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
