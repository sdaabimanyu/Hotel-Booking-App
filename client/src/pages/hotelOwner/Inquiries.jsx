import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { MessageSquare, Send, CheckCircle, Clock } from "lucide-react";

export default function Inquiries() {
  const { axios, getToken, user } = useAppContext();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // =========================================================
  // FETCH HOTEL INQUIRIES
  // =========================================================

  const fetchInquiries = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await axios.get("/api/inquiries/hotel", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setInquiries(data.inquiries);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("FETCH INQUIRIES ERROR:", error);

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
  // OPEN REPLY MODAL
  // =========================================================

  const openReplyModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setReply(inquiry.reply || "");
  };

  // =========================================================
  // CLOSE REPLY MODAL
  // =========================================================

  const closeReplyModal = () => {
    if (sendingReply) return;

    setSelectedInquiry(null);
    setReply("");
  };

  // =========================================================
  // SEND REPLY
  // =========================================================

  const submitReply = async (e) => {
    e.preventDefault();

    if (!selectedInquiry) {
      return toast.error("Inquiry not selected");
    }

    if (!reply.trim()) {
      return toast.error("Please enter a reply");
    }

    try {
      setSendingReply(true);

      const token = await getToken();

      const { data } = await axios.patch(
        "/api/inquiries/reply",
        {
          inquiryId: selectedInquiry._id,
          reply: reply.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message || "Reply sent successfully");

        setSelectedInquiry(null);
        setReply("");

        await fetchInquiries();
      } else {
        toast.error(data.message || "Failed to send reply");
      }
    } catch (error) {
      console.log("SEND INQUIRY REPLY ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to send reply",
      );
    } finally {
      setSendingReply(false);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading booking inquiries...</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Booking Inquiries
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            View and respond to questions from your hotel guests.
          </p>
        </div>

        {/* ================================================= */}
        {/* EMPTY STATE */}
        {/* ================================================= */}

        {inquiries.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-4" />

            <h2 className="text-lg font-semibold text-gray-700">
              No Booking Inquiries
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              Guest booking inquiries will appear here.
            </p>
          </div>
        ) : (
          /* ================================================= */
          /* INQUIRY LIST */
          /* ================================================= */

          <div className="space-y-5">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry._id}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* LEFT */}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">
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
                          Open
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-500 mb-5">
                      <p>
                        <span className="font-semibold text-gray-700">
                          Guest:
                        </span>{" "}
                        {inquiry.user?.username ||
                          inquiry.booking?.name ||
                          "Guest"}
                      </p>

                      <p>
                        <span className="font-semibold text-gray-700">
                          Email:
                        </span>{" "}
                        {inquiry.user?.email ||
                          inquiry.booking?.email ||
                          "Not available"}
                      </p>

                      <p>
                        <span className="font-semibold text-gray-700">
                          Booking ID:
                        </span>{" "}
                        {inquiry.booking?._id}
                      </p>

                      <p>
                        <span className="font-semibold text-gray-700">
                          Sent:
                        </span>{" "}
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* USER MESSAGE */}

                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Guest Message
                      </p>

                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {inquiry.message}
                      </p>
                    </div>

                    {/* OWNER REPLY */}

                    {inquiry.reply && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
                        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">
                          Your Reply
                        </p>

                        <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
                          {inquiry.reply}
                        </p>

                        {inquiry.repliedAt && (
                          <p className="text-xs text-blue-400 mt-3">
                            Replied{" "}
                            {new Date(inquiry.repliedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* RIGHT */}

                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => openReplyModal(inquiry)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Send className="w-4 h-4" />

                      {inquiry.status === "answered" ? "Update Reply" : "Reply"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* REPLY MODAL */}
      {/* ========================================================= */}

      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Reply to Inquiry
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                {selectedInquiry.subject}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Guest Message
              </p>

              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message}
              </p>
            </div>

            <form onSubmit={submitReply}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reply
                </label>

                <textarea
                  rows={6}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Enter your response to the guest..."
                  maxLength={1500}
                  className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeReplyModal}
                  disabled={sendingReply}
                  className="px-5 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={sendingReply}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />

                  {sendingReply ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
