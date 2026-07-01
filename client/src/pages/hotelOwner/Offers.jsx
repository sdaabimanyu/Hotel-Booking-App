import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Power,
  ImagePlus,
  X,
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

      const { data } = await axios.get("/api/offers", {
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
      const formData = new FormData();

      formData.append("title", offerData.title);
      formData.append("description", offerData.description);
      formData.append("code", offerData.code);
      formData.append("discount", offerData.discount);
      formData.append("discountType", offerData.discountType);
      formData.append("minimumStay", offerData.minimumStay);
      formData.append("validTill", offerData.validTill);
      formData.append("image", offerData.image);

      const { data } = await axios.post("/api/offers", formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success(data.message);

        fetchOffers();

        closeModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateOffer = async () => {
    try {
      const formData = new FormData();

      formData.append("title", offerData.title);
      formData.append("description", offerData.description);
      formData.append("code", offerData.code);
      formData.append("discount", offerData.discount);
      formData.append("discountType", offerData.discountType);
      formData.append("minimumStay", offerData.minimumStay);
      formData.append("validTill", offerData.validTill);

      if (offerData.image) {
        formData.append("image", offerData.image);
      }

      const { data } = await axios.put(
        `/api/offers/${editingOffer._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (data.success) {
        toast.success(data.message);

        fetchOffers();

        closeModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteOffer = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this offer?",
    );

    if (!confirmDelete) return;

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-5">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Offers Management
          </h1>

          <p className="text-gray-500 mt-2">
            Create, update and manage promotional offers for your hotel.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transition"
        >
          <Plus size={20} />
          Create Offer
        </button>
      </div>

      {/* Dashboard Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <p className="text-gray-500">Total Offers</p>

          <h2 className="text-4xl font-bold mt-3">{totalOffers}</h2>
        </div>

        <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
          <p className="text-green-700">Active</p>

          <h2 className="text-4xl font-bold mt-3 text-green-700">
            {activeOffers}
          </h2>
        </div>

        <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
          <p className="text-red-700">Inactive</p>

          <h2 className="text-4xl font-bold mt-3 text-red-700">
            {inactiveOffers}
          </h2>
        </div>

        <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-6">
          <p className="text-yellow-700">Expired</p>

          <h2 className="text-4xl font-bold mt-3 text-yellow-700">
            {expiredOffers}
          </h2>
        </div>
      </div>

      {/* Search */}

      <div className="bg-white rounded-2xl border p-5 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search offers by title or promo code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Offer Counter */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">All Offers</h2>

        <p className="text-gray-500">{filteredOffers.length} Offers</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="py-32 text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

            <p className="mt-5 text-gray-500">Loading offers...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="py-28 text-center">
            <ImagePlus size={60} className="mx-auto text-gray-300" />

            <h2 className="text-2xl font-semibold mt-5">No Offers Found</h2>

            <p className="text-gray-500 mt-2">
              Start by creating your first promotional offer.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-5 text-left">Image</th>

                <th className="p-5 text-left">Title</th>

                <th className="p-5 text-left">Promo Code</th>

                <th className="p-5 text-left">Discount</th>

                <th className="p-5 text-left">Expiry</th>

                <th className="p-5 text-left">Status</th>

                <th className="p-5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOffers.map((offer) => (
                <tr
                  key={offer._id}
                  className="border-b hover:bg-blue-50 transition-all duration-300"
                >
                  <td className="p-5">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-24 h-16 object-cover rounded-xl shadow"
                    />
                  </td>

                  <td className="p-5 font-semibold">{offer.title}</td>

                  <td className="p-5">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {offer.code}
                    </span>
                  </td>

                  <td className="p-5">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-semibold">
                      {offer.discount}

                      {offer.discountType === "percentage" ? "%" : "$"}
                    </span>
                  </td>

                  <td className="p-5">
                    {new Date(offer.validTill).toLocaleDateString()}
                  </td>

                  <td className="p-5">
                    {offer.isActive ? (
                      <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="p-5">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => editOffer(offer)}
                        className="w-10 h-10 rounded-full hover:bg-blue-100 text-blue-600 flex items-center justify-center transition"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => deleteOffer(offer._id)}
                        className="w-10 h-10 rounded-full hover:bg-red-100 text-red-600 flex items-center justify-center transition"
                      >
                        <Trash2 size={18} />
                      </button>

                      <button
                        onClick={() => toggleStatus(offer._id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                          offer.isActive
                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        <Power size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-10 max-h-[92vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-8">Create Offer</h2>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
              {/* Left Column */}
              <div className="space-y-5">
                <label className="block text-sm font-semibold mb-2">
                  Offer Title
                </label>
                <input
                  type="text"
                  placeholder="Offer Title"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={offerData.title}
                  onChange={(e) =>
                    setOfferData({
                      ...offerData,
                      title: e.target.value,
                    })
                  }
                />
                <label className="block text-sm font-semibold mb-2">
                  Description
                </label>
                <textarea
                  rows={5}
                  placeholder="Description"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 h-44 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                  value={offerData.description}
                  onChange={(e) =>
                    setOfferData({
                      ...offerData,
                      description: e.target.value,
                    })
                  }
                />
                <label className="block text-sm font-semibold mb-2">
                  Promo Code
                </label>
                <input
                  type="text"
                  placeholder="Promo Code"
                  className="w-full w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={offerData.code}
                  onChange={(e) =>
                    setOfferData({
                      ...offerData,
                      code: e.target.value,
                    })
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <label className="block text-sm font-semibold mb-2">
                    Discount
                  </label>
                  <input
                    type="number"
                    placeholder="Discount"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={offerData.discount}
                    onChange={(e) =>
                      setOfferData({
                        ...offerData,
                        discount: e.target.value,
                      })
                    }
                  />
                  <label className="block text-sm font-semibold mb-2">
                    Discount Type
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={offerData.discountType}
                    onChange={(e) =>
                      setOfferData({
                        ...offerData,
                        discountType: e.target.value,
                      })
                    }
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                <label className="block text-sm font-semibold mb-2">
                  Minimum Stay (nights)
                </label>
                <input
                  type="number"
                  placeholder="Minimum Stay"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={offerData.minimumStay}
                  onChange={(e) =>
                    setOfferData({
                      ...offerData,
                      minimumStay: e.target.value,
                    })
                  }
                />

                <label className="block text-sm font-semibold mb-2">
                  Valid Till
                </label>
                <input
                  type="date"
                  className="w-full w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={offerData.validTill}
                  onChange={(e) =>
                    setOfferData({
                      ...offerData,
                      validTill: e.target.value,
                    })
                  }
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Offer Image
                  </label>

                  <label
                    htmlFor="offer-image"
                    className="border-2 border-dashed border-blue-300 rounded-2xl h-56 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition"
                  >
                    {offerData.image ? (
                      <img
                        src={
                          offerData.image instanceof File
                            ? URL.createObjectURL(offerData.image)
                            : offerData.image
                        }
                        alt="Preview"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-12 h-12 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>

                        <p className="mt-3 font-medium text-gray-700">
                          Click to upload image
                        </p>

                        <span className="text-sm text-gray-400">
                          JPG, PNG (Max 5MB)
                        </span>
                      </>
                    )}
                  </label>

                  <input
                    id="offer-image"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      setOfferData({
                        ...offerData,
                        image: e.target.files[0],
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-10">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={editingOffer ? updateOffer : createOffer}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                {editingOffer ? "Edit Offer" : "Create Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
