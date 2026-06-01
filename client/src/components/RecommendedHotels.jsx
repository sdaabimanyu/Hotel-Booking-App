import React, { useEffect, useState } from "react";
import HotelCard from "./HotelCard";
import { useAppContext } from "../context/appContext";

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
          city.toLowerCase().trim() ===
          room.hotel?.city?.toLowerCase().trim()
      )
    );

    setRecommended(filteredHotels);
  }, [rooms, searchedCities]);

  console.log("ROOMS:", rooms);
  console.log("SEARCHED CITIES:", searchedCities);
  console.log("RECOMMENDED:", recommended);

  if (recommended.length === 0) return null;

  return (
    <div className="flex flex-col justify-center items-center px-20 py-15 bg-gray-50">
      <div className="mb-13">
        <h1 className="text-center text-[40px] font-playfair">
          Recommended Hotels
        </h1>

        <p className="text-center text-gray-500/90 text-[15px] max-w-3xl">
          Discover our handpicked selection of exceptional properties around
          the world.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {recommended.slice(0, 4).map((room, index) => (
          <HotelCard
            key={room._id}
            room={room}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}