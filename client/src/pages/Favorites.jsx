import React from "react";
import { useAppContext } from "../context/AppContext";

export default function Favorites() {
  const { favoriteRooms, toggleFavoriteRoom, navigate, currency, userLoading } =
    useAppContext();

  const amenityIcons = {
    "Free WiFi": "fa-solid fa-wifi",
    "Room Service": "fa-solid fa-bell-concierge",
    "Pool Access": "fa-solid fa-person-swimming",
    "Mountain View": "fa-solid fa-mountain-sun",
    "Free Breakfast": "fa-solid fa-mug-hot",
    Parking: "fa-solid fa-square-parking",
    Gym: "fa-solid fa-dumbbell",
  };

  if (userLoading) {
    return (
      <div className="min-h-screen pt-36 flex items-center justify-center">
        <p className="text-slate-500">Loading favorites...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] pt-32 md:pt-36 pb-24 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-600 font-semibold mb-3">
            Your Collection
          </p>

          <h1 className="text-4xl md:text-5xl font-playfair font-medium text-slate-900">
            Favorite Rooms
          </h1>

          <p className="text-sm text-slate-500 mt-3 max-w-xl leading-relaxed">
            Keep your favorite accommodations in one place and quickly return
            whenever you're ready to plan your next stay.
          </p>
        </div>

        {/* NO FAVORITES */}
        {favoriteRooms.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl py-24 px-6 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 flex items-center justify-center mb-5">
              <i className="fa-regular fa-heart text-2xl text-slate-400"></i>
            </div>

            <h2 className="font-playfair text-2xl text-slate-800">
              No favorite rooms yet
            </h2>

            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Explore our available rooms and save the accommodations that catch
              your attention.
            </p>

            <button
              onClick={() => navigate("/rooms")}
              className="mt-7 bg-slate-950 text-white px-7 py-3 rounded-xl text-sm hover:bg-amber-600 transition-all duration-300 cursor-pointer"
            >
              Explore Rooms
            </button>
          </div>
        ) : (
          <>
            {/* FAVORITE COUNT */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-500">
                {favoriteRooms.length} saved{" "}
                {favoriteRooms.length === 1 ? "room" : "rooms"}
              </p>
            </div>

            {/* FAVORITES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {favoriteRooms.map((room) => (
                <div
                  key={room._id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  {/* ROOM IMAGE */}
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={room.images?.[0]}
                      alt={room.hotel?.name || room.roomType}
                      onClick={() => navigate(`/rooms/${room._id}`)}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* REMOVE FAVORITE */}
                    <button
                      type="button"
                      onClick={() => toggleFavoriteRoom(room._id)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
                      aria-label="Remove from favorites"
                    >
                      <i className="fa-solid fa-heart text-red-500 text-lg"></i>
                    </button>

                    {/* ROOM TYPE */}
                    <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-700">
                      {room.roomType}
                    </span>
                  </div>

                  {/* ROOM INFORMATION */}
                  <div className="p-6">
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-amber-600 mb-1">
                      {room.hotel?.city || "Destination"}
                    </p>

                    <h2
                      onClick={() => navigate(`/rooms/${room._id}`)}
                      className="font-playfair text-2xl font-semibold text-slate-900 cursor-pointer hover:text-amber-600 transition-colors"
                    >
                      {room.hotel?.name || room.roomType}
                    </h2>

                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                      <i className="fa-solid fa-location-dot text-amber-600"></i>

                      <span className="line-clamp-1">
                        {room.hotel?.address || "Location unavailable"}
                      </span>
                    </p>

                    {/* AMENITIES */}
                    <div className="flex flex-wrap gap-2 mt-5">
                      {room.amenities?.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-500"
                        >
                          <i
                            className={
                              amenityIcons[amenity] ||
                              "fa-solid fa-circle-check"
                            }
                          ></i>

                          {amenity}
                        </span>
                      ))}
                    </div>

                    {/* PRICE + VIEW BUTTON */}
                    <div className="flex items-end justify-between mt-6 pt-5 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">
                          From
                        </p>

                        <p className="text-xl font-bold text-slate-900">
                          {currency}
                          {room.pricePerNight}

                          <span className="text-xs font-normal text-slate-400">
                            {" "}
                            / night
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={() => navigate(`/rooms/${room._id}`)}
                        className="px-4 py-2 rounded-lg bg-slate-950 text-white text-xs hover:bg-amber-600 transition-all cursor-pointer"
                      >
                        View Room
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
