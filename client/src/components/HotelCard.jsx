import React from "react";
import { Link } from "react-router-dom";

export default function HotelCard({ room, index }) {
  return (
    <Link
      to={`/rooms/${room._id}`}
      onClick={() => window.scrollTo(0, 0)}
      className="w-full h-full flex flex-col justify-between bg-white rounded-3xl shadow-xl border border-slate-100/80 transition-all duration-300 hover:scale-[1.01] hover:border-slate-200/60 group overflow-hidden"
    >
      {/* Top Section Container */}
      <div>
        {/* Image View Frame */}
        <div className="w-full h-52 overflow-hidden relative">
          <img
            src={room.images?.[0]}
            alt={room.hotel?.name}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
          />

          {/* Dynamic Badge Positioned Cleaner */}
          {index % 2 === 0 && (
            <p className="absolute top-3.5 left-3.5 text-[11px] text-slate-900 font-semibold rounded-lg px-2.5 py-1.5 bg-white tracking-wide select-none border border-slate-100 shadow-xs">
              Best Seller
            </p>
          )}
        </div>

        {/* Internal Text Context Block with solid padding */}
        <div className="p-5 space-y-2">
          <h3 className="text-xl font-bold text-slate-800 font-playfair tracking-tight leading-snug line-clamp-2 min-h-[56px]">
            {room.hotel?.name}
          </h3>

          <p className="text-slate-400 flex items-center gap-1.5 text-xs font-inter font-light">
            <i className="fa-solid fa-location-dot text-slate-300 text-sm"></i>
            <span>{room.hotel?.city}</span>
          </p>
        </div>
      </div>

      {/* Pricing Actions Row - Locked at the bottom with explicit padding */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <p className="text-slate-900 font-inter font-semibold text-base whitespace-nowrap">
            ${room.pricePerNight}
            <span className="text-slate-400 font-normal text-[11px] uppercase tracking-wider ml-1">
              /Night
            </span>
          </p>

          <button className="px-4 py-2.5 bg-slate-950 group-hover:bg-slate-800 text-white text-xs font-medium rounded-xl font-inter tracking-wide transition-colors duration-150 whitespace-nowrap">
            Book Now
          </button>
        </div>
      </div>
    </Link>
  );
}
