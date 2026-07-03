import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function Offers() {
  const navigate = useNavigate();
  const { axios } = useAppContext();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    try {
      const { data } = await axios.get("/api/offers");

      if (data.success) {
        setOffers(data.offers);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  if (loading) {
    return (
      <div className="pt-40 text-center text-2xl font-semibold">
        Loading Offers...
      </div>
    );
  }

  return (
    <div className="bg-[#faf9f7] min-h-screen pt-32 pb-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}

        <div className="text-center mb-14">
          <p className="uppercase tracking-[6px] text-[#c9a74d] text-sm">
            Exclusive Deals
          </p>

          <h1 className="text-5xl font-bold text-[#0f2f5f] mt-4">
            Special Offers
          </h1>

          <p className="text-gray-500 mt-5 max-w-2xl mx-auto">
            Unlock exclusive savings and enjoy unforgettable stays with our
            carefully curated hotel offers.
          </p>
        </div>

        {/* Cards */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => {
            const expired =
              new Date(offer.validTill) < new Date() || !offer.isActive;
            return (
              <div
                key={offer._id}
                className="rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                {/* Image */}

                <div className="relative h-60">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-black/20"></div>

                  <div className="absolute top-5 left-5 bg-white text-[#0f2f5f] px-2 py-1 rounded-xl font-semibold text-[14px]">
                    {offer.discount}
                    {offer.discountType === "percentage" ? "%" : "$"} OFF
                  </div>

                  <div className="absolute top-5 right-5">
                    {expired ? (
                      <span className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-sm font-semibold shadow">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Expired
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-sm font-semibold shadow">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Available
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}

                <div className="p-7">
                  <h2 className="text-3xl font-bold text-[#0f2f5f] ">
                    {offer.title}
                  </h2>

                  <p className="text-gray-600 mt-4 leading-7 min-h-[85px]">
                    {offer.description}
                  </p>

                  <div className="space-y-3 mt-6">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-500">
                        Promo Code
                      </span>

                      <span className="font-bold text-[#c9a74d]">
                        {offer.code}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-gray-500">
                        Minimum Stay
                      </span>

                      <span>
                        {offer.minimumStay} Night
                        {offer.minimumStay > 1 && "s"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-gray-500">
                        Valid Till
                      </span>

                      <span>
                        {new Date(offer.validTill).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={expired}
                    onClick={() => navigate("/rooms")}
                    className={`w-full mt-8 py-4 rounded-2xl font-semibold transition ${
                      !expired
                        ? "bg-[#c9a74d] hover:bg-[#b8932f] text-white"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    Book With This Offer →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
