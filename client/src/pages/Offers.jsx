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
      <div className="pt-40 text-center text-2xl font-semibold font-playfair tracking-wide text-slate-800">
        Loading Offers...
      </div>
    );
  }

  return (
    <div className="bg-[#faf9f7] min-h-screen pt-32 pb-20 px-6 md:px-12 lg:px-20 antialiased">
      <div className="max-w-7xl mx-auto">
        {/* Heading Section */}
        <div className="text-center mb-14">
          <p className="uppercase tracking-[6px] text-secondary text-xs font-semibold">
            Exclusive Deals
          </p>

          <h1 className="text-5xl font-medium font-playfair text-slate-900 mt-3 tracking-tight">
            Special Offers
          </h1>

          <p className="font-inter text-slate-500 mt-4 max-w-2xl mx-auto text-sm leading-relaxed">
            Unlock exclusive savings and enjoy unforgettable stays with our
            carefully curated hotel offers.
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => {
            const expired =
              new Date(offer.validTill) < new Date() || !offer.isActive;
            return (
              <div
                key={offer._id}
                className="rounded-3xl overflow-hidden bg-white shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100/50 hover:shadow-[0_12px_35px_rgba(0,0,0,0.07)] hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Banner / Image container */}
                <div className="relative h-60">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-black/15"></div>

                  {/* Discount Badge */}
                  <div className="font-inter absolute top-5 left-5 bg-white text-slate-900 px-3 py-1.5 rounded-xl font-bold text-xs tracking-wide shadow-sm">
                    {offer.discount}
                    {offer.discountType === "percentage" ? "%" : "$"} OFF
                  </div>

                  {/* Expiration Status Badge */}
                  <div className="font-inter absolute top-5 right-5">
                    {expired ? (
                      <span className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Expired
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Available
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-7">
                  <h2 className="text-2xl font-bold font-playfair text-slate-800 tracking-tight">
                    {offer.title}
                  </h2>

                  <p className="font-inter text-slate-500 mt-3 text-sm leading-relaxed min-h-[80px]">
                    {offer.description}
                  </p>

                  {/* Promo Metadata Table */}
                  <div className="space-y-3.5 mt-6 pt-5 border-t border-slate-50">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-400">
                        Promo Code
                      </span>
                      <span className="font-bold text-secondary tracking-wide bg-amber-50/60 px-2.5 py-1 rounded-lg border border-amber-100/40">
                        {offer.code}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-400">
                        Minimum Stay
                      </span>
                      <span className="font-semibold text-slate-700">
                        {offer.minimumStay} Night
                        {offer.minimumStay > 1 && "s"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-400">
                        Valid Till
                      </span>
                      <span className="font-inter font-semibold text-slate-700 text-xs">
                        {new Date(offer.validTill).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Button CTA */}
                  <button
                    disabled={expired}
                    onClick={() => navigate("/rooms")}
                    className={`w-full mt-7 py-3.5 rounded-2xl font-semibold tracking-wide text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                      !expired
                        ? "bg-secondary hover:bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 active:scale-[0.99]"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <span>Book With This Offer</span>
                    <span className="text-base">→</span>
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
