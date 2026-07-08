import React from "react";
import HotelCard from "./HotelCard";
import { useAppContext } from "../context/AppContext";

export default function FeaturedDestination() {
  const { rooms, navigate } = useAppContext();

  return (
    rooms?.length > 0 && (
      <div className="bg-white pt-24 pb-32 px-4 md:px-16 lg:px-24 antialiased border-t border-slate-100/60">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          {/* Original Font Size Header Section */}
          <div className="mb-16 text-center">
            <span className="text-[11px] font-bold tracking-widest text-amber-600 uppercase font-inter block mb-3">
              Explore the World
            </span>
            <h1 className="text-center text-[40px] font-medium font-playfair text-slate-900 tracking-tight">
              Featured Destination
            </h1>
            <p className="text-center text-gray-500/90 text-[15px] max-w-3xl mt-3 leading-relaxed font-inter">
              Discover our handpicked selection of exceptional properties around
              the world, offering unparalleled luxury and unforgettable
              experiences.
            </p>
          </div>

          {/* Locked Grid: Clean spacing with bottom padding for card drop-shadows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full pb-16">
            {rooms.slice(0, 4).map((room, index) => (
              <div
                key={room._id}
                className="w-full mx-auto max-w-[340px] sm:max-w-none"
              >
                <HotelCard room={room} index={index} />
              </div>
            ))}
          </div>

          {/* Clean Premium Call To Action Button */}
          <button
            onClick={() => {
              navigate("/rooms");
              window.scrollTo(0, 0);
            }}
            className="group flex items-center gap-2.5 px-6 py-3 border border-slate-300 text-slate-800 rounded-xl text-xs font-semibold font-inter uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 ease-out shadow-xs"
          >
            <span>View All Destinations</span>
            <svg
              className="w-3.5 h-3.5 transform transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </div>
    )
  );
}
