import React, { useEffect, useState } from "react";
import HotelCard from "./HotelCard";
import { useAppContext } from "../context/AppContext";

export default function RecommendedHotels() {
  const { rooms, searchedCities } = useAppContext();
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    if (!rooms?.length || !searchedCities?.length) {
      setRecommended([]);
      return;
    }

    const filteredHotels = rooms.filter((room) =>
      searchedCities.some(
        (city) =>
          city.toLowerCase().trim() === room.hotel?.city?.toLowerCase().trim(),
      ),
    );

    setRecommended(filteredHotels);
  }, [rooms, searchedCities]);

  if (recommended.length === 0) return null;

  return (
    <div className="bg-white py-24 px-4 md:px-16 lg:px-24 antialiased border-t border-slate-100/60">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Editorial Section Header */}
        <div className="mb-16 text-center">
          <span className="text-[11px] font-bold tracking-widest text-amber-600 uppercase font-inter block mb-3">
            Curated Collection
          </span>
          <h1 className="text-center text-[40px] font-medium font-playfair text-slate-900 tracking-tight">
            Recommended Hotels
          </h1>
          <p className="text-center text-gray-500/90 text-[15px] max-w-3xl mt-3 leading-relaxed font-inter">
            Discover our handpicked selection of exceptional properties around
            the world, custom tailored to your recent interests.
          </p>
        </div>

        {/* Dynamic Card Layout Grid */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 w-full max-w-7xl">
          {recommended.slice(0, 4).map((room, index) => (
            <div
              key={room._id}
              className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(25%-24px)] min-w-[280px] max-w-[340px]"
            >
              <HotelCard room={room} index={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
