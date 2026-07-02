import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function ExclusiveOffers() {
  const { axios } = useAppContext();
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);

  const fetchOffers = async () => {
    try {
      const { data } = await axios.get("/api/offers");

      if (data.success) {
        const activeOffers = data.offers
          .filter((offer) => offer.isActive)
          .slice(0, 3);

        setOffers(activeOffers);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <div className="px-6 md:px-16 lg:px-24 py-16">
      {/* Heading */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-[40px] font-playfair">
            Exclusive Offers
          </h1>

          <p className="text-gray-500/90 mt-3">
            Take advantage of our limited-time offers and special packages to
            enhance your stay and create unforgettable memories.
          </p>
        </div>

        <button
          onClick={() => navigate("/offers")}
          className="font-semibold flex items-center gap-2"
        >
          View All Offers
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      {/* Offers */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {offers.map((offer) => (
          <div
            key={offer._id}
            className="relative rounded-2xl overflow-hidden bg-cover bg-center flex min-h-[380px] p-6"
            style={{
              backgroundImage: `url(${offer.image})`,
            }}
          >
            {/* Overlay */}

            <div className="absolute inset-0 bg-black/45"></div>

            {/* Discount */}

            <p className="absolute top-5 left-5 z-20 bg-white text-black px-3 py-1 rounded-lg font-semibold">
              {offer.discount}
              {offer.discountType === "percentage" ? "%" : "$"} OFF
            </p>

            {/* Content */}

            <div className="relative z-10 text-white mt-auto">
              <h2 className="text-3xl font-playfair">{offer.title}</h2>

              <p className="mt-3 text-gray-200">{offer.description}</p>

              <div className="mt-5 space-y-1 text-sm text-gray-300">
                <p>
                  Promo Code:
                  <span className="text-[#d4af37] font-bold ml-2">
                    {offer.code}
                  </span>
                </p>

                <p>
                  Minimum Stay: {offer.minimumStay}{" "}
                  {offer.minimumStay > 1 ? "Nights" : "Night"}
                </p>

                <p>
                  Valid Till {new Date(offer.validTill).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => navigate("/offers")}
                className="mt-6 font-semibold flex items-center gap-2 hover:text-[#d4af37] transition"
              >
                View Offer
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {offers.length === 0 && (
        <div className="text-center mt-16">
          <h2 className="text-2xl font-semibold">No Offers Available</h2>

          <p className="text-gray-500 mt-2">
            New offers will be available soon.
          </p>
        </div>
      )}
    </div>
  );
}
