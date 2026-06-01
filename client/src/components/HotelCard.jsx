import React from "react";
import { Link } from "react-router-dom";

export default function HotelCard({ room, index }) {
  return (
    <Link
      to={`/rooms/${room._id}`}
      onClick={() => scrollTo(0, 0)}
      className="max-w-70 w-full rounded-2xl relative shadow mb-10 pb-2 bg-white"
    >
      <img
        src={room.images?.[0]}
        alt={room.hotel?.name}
        className="w-full h-60 object-cover rounded-t-xl"
      />

      {index % 2 === 0 && (
        <p className="mt-3 text-sm text-black font-medium absolute top-0 left-3 rounded-md px-2 py-1 bg-white">
          Best Seller
        </p>
      )}

      <div className="py-1">
        <div className="flex items-center justify-between mt-2 px-2">
          <p className="text-xl font-semibold text-black font-playfair">
            {room.hotel?.name}
          </p>
        </div>

        <p className="text-gray-500 px-2 mt-2 text-[14px]">
          <i className="fa-solid fa-location-dot"></i> {room.hotel?.city}
        </p>

        <div className="flex justify-between px-2 mt-2">
          <p className="text-black mt-1">
            ${room.pricePerNight}
            <span className="text-gray-500/90">/Night</span>
          </p>

          <button className="px-2 py-2 bg-black text-white rounded">
            Book Now
          </button>
        </div>
      </div>
    </Link>
  );
}
