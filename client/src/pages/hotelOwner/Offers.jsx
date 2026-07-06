import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Power,
  ImagePlus,
  X,
  Tag,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
} from "lucide-react";

export default function Offers() {
  const { axios, getToken, user } = useAppContext();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const [offerData, setOfferData] = useState({
    title: "",
    description: "",
    code: "",
    discount: "",
    discountType: "percentage",
    minimumStay: 1,
    validTill: "",
    image: null,
  });

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/offers/owner", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setOffers(data.offers);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOffers();
    }
  }, [user]);

  const createOffer = async () => {
    try {
      if (!offerData.image) {
        return toast.error("Please select an offer image");
      }
      const imageUrl = await uploadToCloudinary(offerData.image);
      const { data } = await axios.post(
        "/api/offers",
        {
          title: offerData.title,
          description: offerData.description,
          code: offerData.code,
          discount: offerData.discount,
          discountType: offerData.discountType,
          minimumStay: offerData.minimumStay,
          validTill: offerData.validTill,
          image: imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message);
        await fetchOffers();
        closeModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create offer",
      );
    }
  };

  const updateOffer = async () => {
    try {
      let imageUrl = editingOffer.image;
      if (offerData.image instanceof File) {
        imageUrl = await uploadToCloudinary(offerData.image);
      }

      const { data } = await axios.put(
        `/api/offers/${editingOffer._id}`,
        {
          title: offerData.title,
          description: offerData.description,
          code: offerData.code,
          discount: offerData.discount,
          discountType: offerData.discountType,
          minimumStay: offerData.minimumStay,
          validTill: offerData.validTill,
          image: imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message);
        await fetchOffers();
        closeModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update offer",
      );
    }
  };

  const deleteOffer = async (id) => {
    const result = await Swal.fire({
      title: "Delete Offer?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      const { data } = await axios.delete(`/api/offers/${id}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        toast.success(data.message);
        fetchOffers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const { data } = await axios.patch(
        `/api/offers/${id}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message);
        fetchOffers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const editOffer = (offer) => {
    setEditingOffer(offer);
    setOfferData({
      title: offer.title,
      description: offer.description,
      code: offer.code,
      discount: offer.discount,
      discountType: offer.discountType,
      minimumStay: offer.minimumStay,
      validTill: offer.validTill.split("T")[0],
      image: offer.image,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOffer(null);
    setOfferData({
      title: "",
      description: "",
      code: "",
      discount: "",
      discountType: "percentage",
      minimumStay: 1,
      validTill: "",
      image: null,
    });
  };

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      return (
        offer.title.toLowerCase().includes(search.toLowerCase()) ||
        offer.code.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [offers, search]);

  const totalOffers = offers.length;
  const activeOffers = offers.filter((o) => o.isActive).length;
  const inactiveOffers = offers.filter((o) => !o.isActive).length;
  const expiredOffers = offers.filter(
    (o) => new Date(o.validTill) < new Date(),
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Top Heading Module */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Offers Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create, update and manage promotional offers for your hotel.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200 self-start md:self-auto"
        >
          <Plus size={18} />
          Create Offer
        </button>
      </div>

      {/* Premium Multi-state KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Card */}
        <div className="bg-white rounded-2xl border border-gray-100 border-l-4 border-l-blue-500 p-6 shadow-sm flex items-center justify-between min-h-[110px]">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Offers
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {totalOffers}
            </h2>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Active Card */}
        <div className="bg-white rounded-2xl border border-gray-100 border-l-4 border-l-emerald-500 p-6 shadow-sm flex items-center justify-between min-h-[110px]">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Active Offers
            </p>
            <h2 className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {activeOffers}
            </h2>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Inactive Card */}
        <div className="bg-white rounded-2xl border border-gray-100 border-l-4 border-l-rose-500 p-6 shadow-sm flex items-center justify-between min-h-[110px]">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Inactive Offers
            </p>
            <h2 className="text-3xl font-extrabold text-rose-600 tracking-tight">
              {inactiveOffers}
            </h2>
          </div>
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Expired Card */}
        <div className="bg-white rounded-2xl border border-gray-100 border-l-4 border-l-amber-500 p-6 shadow-sm flex items-center justify-between min-h-[110px]">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Expired Offers
            </p>
            <h2 className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {expiredOffers}
            </h2>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter / Search Bar Wrapper */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center">
        <div className="relative w-full">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search offers by title or promo code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-gray-800"
          />
        </div>
      </div>

      {/* Structured Modern Grid Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 tracking-tight">
          Active Portfolio
        </h2>
        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">
          {filteredOffers.length} Live Items
        </span>
      </div>

      {/* Modern High-End Table Component */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-9 h-9 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-xs font-medium text-gray-400">
              Synchronizing records...
            </p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="py-20 text-center">
            <ImagePlus
              size={44}
              className="mx-auto text-gray-300 stroke-[1.5]"
            />
            <h3 className="text-base font-bold text-gray-700 mt-4">
              No Offers Found
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Start by creating your first global promotional strategy config
              files.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-5 text-left font-semibold">Image</th>
                  <th className="p-5 text-left font-semibold">Title</th>
                  <th className="p-5 text-left font-semibold">Promo Code</th>
                  <th className="p-5 text-left font-semibold">Discount</th>
                  <th className="p-5 text-left font-semibold">Expiry Date</th>
                  <th className="p-5 text-left font-semibold">Status Matrix</th>
                  <th className="p-5 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOffers.map((offer) => (
                  <tr
                    key={offer._id}
                    className="hover:bg-slate-50/50 transition-all duration-150"
                  >
                    <td className="p-5">
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className="w-20 h-12 object-cover rounded-xl shadow-sm border border-gray-100"
                      />
                    </td>
                    <td className="p-5 font-semibold text-gray-800 text-sm">
                      {offer.title}
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold tracking-wide">
                        <Tag className="w-3 h-3" />
                        {offer.code}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="inline-block whitespace-nowrap bg-purple-50 text-purple-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                        {offer.discount}
                        {offer.discountType === "percentage" ? "% Off" : " $"}
                      </span>
                    </td>
                    <td className="p-5 text-gray-500 text-xs font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {new Date(offer.validTill).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-5">
                      {offer.isActive ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          onClick={() => editOffer(offer)}
                          className="w-8 h-8 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 flex items-center justify-center transition-all duration-150"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => deleteOffer(offer._id)}
                          className="w-8 h-8 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 flex items-center justify-center transition-all duration-150"
                        >
                          <Trash2 size={15} />
                        </button>
                        <button
                          onClick={() => toggleStatus(offer._id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
                            offer.isActive
                              ? "text-emerald-500 hover:bg-emerald-50"
                              : "text-gray-400 hover:bg-gray-100"
                          }`}
                        >
                          <Power size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ultra-Premium Unified Dialog / Modal Window */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col border border-gray-100">
            {/* Modal Sticky Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  {editingOffer
                    ? "Modify Dynamic Offer"
                    : "Architect New Offer"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Fill out parameters below to dispatch rule.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Columns Container */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Form Wing */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Offer Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Summer Escape Package"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-gray-800"
                    value={offerData.title}
                    onChange={(e) =>
                      setOfferData({ ...offerData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Strategic Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide a comprehensive narrative overview detailing campaign values..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 h-[115px] resize-none outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-gray-800"
                    value={offerData.description}
                    onChange={(e) =>
                      setOfferData({
                        ...offerData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Promo Token Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., ESCAPE35"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-mono tracking-wider uppercase text-gray-800"
                    value={offerData.code}
                    onChange={(e) =>
                      setOfferData({
                        ...offerData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      placeholder="Amount"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-gray-800"
                      value={offerData.discount}
                      onChange={(e) =>
                        setOfferData({ ...offerData, discount: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Discount Architecture
                    </label>
                    <select
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-gray-700 bg-white"
                      value={offerData.discountType}
                      onChange={(e) =>
                        setOfferData({
                          ...offerData,
                          discountType: e.target.value,
                        })
                      }
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Currency ($)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Form Wing */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Minimum Stay Requirements (Nights)
                  </label>
                  <input
                    type="number"
                    placeholder="1"
                    min={1}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-gray-800"
                    value={offerData.minimumStay}
                    onChange={(e) =>
                      setOfferData({
                        ...offerData,
                        minimumStay: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Campaign Lifespan Expiry Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-gray-700"
                    value={offerData.validTill}
                    onChange={(e) =>
                      setOfferData({ ...offerData, validTill: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Offer Identity Image
                  </label>
                  <label
                    htmlFor="offer-image"
                    className="border border-dashed border-gray-300 bg-gray-50/50 rounded-2xl h-[175px] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/20 hover:border-blue-300 transition-all duration-200 overflow-hidden group"
                  >
                    {offerData.image ? (
                      <img
                        src={
                          offerData.image instanceof File
                            ? URL.createObjectURL(offerData.image)
                            : offerData.image
                        }
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImagePlus
                          size={28}
                          className="mx-auto text-gray-400 group-hover:text-blue-500 transition"
                        />
                        <p className="mt-2 text-xs font-semibold text-gray-700">
                          Upload asset image
                        </p>
                        <span className="text-[11px] text-gray-400 mt-0.5 block">
                          JPG, PNG format maxing 5MB
                        </span>
                      </div>
                    )}
                  </label>
                  <input
                    id="offer-image"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      setOfferData({ ...offerData, image: e.target.files[0] })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Modal Sticky Footer Actions */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={editingOffer ? updateOffer : createOffer}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm transition text-sm font-semibold"
              >
                {editingOffer ? "Commit Changes" : "Deploy Config"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
