import React from "react";
import HotelCard from "./HotelCard";
import { useAppContext } from "../context/AppContext";

export default function FeturedDestination() {
  const { rooms, navigate } = useAppContext();
  return (
    rooms?.length > 0 && (
      <div className="flex flex-col justify-center items-center px-20 py-15 bg-gray-50">
        <div className="mb-13">
          <h1 className="text-center text-[40px] font-playfair">
            Featured Destination
          </h1>
          <p className="text-center text-gray-500/90 text-[15px] max-w-3xl">
            Discover our handpicked selection of exceptional properties around
            the world, offering unparalleled luxury and unforgettable
            experiences.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-x-5  overflow-hidden text-gray-500/90 mb-5">
          {rooms.slice(0, 4).map((room, index) => (
            <HotelCard key={room._id} room={room} index={index} />
          ))}
        </div>

        <button
          onClick={() => {
            navigate("/rooms");
            scrollTo(0, 0);
          }}
          className="p-2 rounded border border-gray-300 hover:bg-gray-200"
        >
          View All Destinations
        </button>
      </div>
    )
  );
}
