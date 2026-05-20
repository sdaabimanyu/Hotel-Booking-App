import React from "react";
import { offers } from "../assets/assets";

export default function ExclusiveOffers() {
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

        <button className="font-semibold flex items-center gap-2">
          View All Offers
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      {/* Offers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {offers.map((item) => (
          <div
            key={item._id}
            className="relative rounded-2xl overflow-hidden bg-cover bg-center flex  p-6"
            style={{ backgroundImage: `url(${item.image})` }}
          >
            <p className="text-black rounded-md text-[14px] font-semibold px-2 bg-white absolute top-5 left-5 z-1">
              {item.offer}% OFF
            </p>
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/35"></div>

            {/* Content */}
            <div className="relative z-10 text-white mt-10 flex flex-col justify-between items-start">
              <div>
                <p className="mt-2 text-sm leading-6 max-w-xs text-[25px] font-playfair">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-6">{item.description}</p>

                <p className="mt-3 mb-5 text-sm text-gray-200">{item.expiry}</p>
              </div>

              <button className="font-semibold">
                View Offers <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
