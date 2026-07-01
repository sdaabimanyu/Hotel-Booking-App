import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [offerData, setOfferData] = useState({
    title: "",
    description: "",
    code: "",
    discount: "",
    discountType: "percentage",
    minimumStay: 1,
    validTill: "",
    image: "",
  });
  const { axios, getToken, user } = useAppContext();

  const fetchOffers = async () => {
    try {
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
      console.log(error);
      toast.error(error.message);
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

        setShowModal(false);

        fetchOffers();

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
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Offers</h1>

          <p className="text-gray-500 mt-2">
            Create and manage promotional offers.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-3 rounded-xl"
        >
          + Create Offer
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Code</th>
              <th className="p-4 text-left">Discount</th>
              <th className="p-4 text-left">Expiry</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {offers.map((offer) => (
              <tr key={offer._id} className="border-t">
                <td className="p-4">{offer.title}</td>

                <td className="p-4 font-semibold text-blue-600">
                  {offer.code}
                </td>

                <td className="p-4">
                  {offer.discount}
                  {offer.discountType === "percentage" ? "%" : "$"}
                </td>

                <td className="p-4">
                  {new Date(offer.validTill).toLocaleDateString()}
                </td>

                <td className="p-4">
                  {offer.isActive ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      Active
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                      Inactive
                    </span>
                  )}
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button>✏</button>

                    <button>🗑</button>

                    <button>
                      {offer.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {offers.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-12 text-gray-500">
                  No offers created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[600px]">
            <h2 className="text-3xl font-bold mb-6">Create Offer</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Offer Title"
                className="w-full border rounded-xl p-3"
                value={offerData.title}
                onChange={(e) =>
                  setOfferData({
                    ...offerData,
                    title: e.target.value,
                  })
                }
              />

              <textarea
                placeholder="Description"
                className="w-full border rounded-xl p-3"
                value={offerData.description}
                onChange={(e) =>
                  setOfferData({
                    ...offerData,
                    description: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Promo Code"
                className="w-full border rounded-xl p-3"
                value={offerData.code}
                onChange={(e) =>
                  setOfferData({
                    ...offerData,
                    code: e.target.value,
                  })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Discount"
                  className="border rounded-xl p-3"
                  value={offerData.discount}
                  onChange={(e) =>
                    setOfferData({
                      ...offerData,
                      discount: e.target.value,
                    })
                  }
                />

                <select
                  className="border rounded-xl p-3"
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

              <input
                type="number"
                placeholder="Minimum Stay"
                className="w-full border rounded-xl p-3"
                value={offerData.minimumStay}
                onChange={(e) =>
                  setOfferData({
                    ...offerData,
                    minimumStay: e.target.value,
                  })
                }
              />

              <input
                type="date"
                className="w-full border rounded-xl p-3"
                value={offerData.validTill}
                onChange={(e) =>
                  setOfferData({
                    ...offerData,
                    validTill: e.target.value,
                  })
                }
              />

              <div>
                <label className="block mb-2 font-medium">Offer Image</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setOfferData({
                      ...offerData,
                      image: e.target.files[0],
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={createOffer}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl"
              >
                Create Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
