import React from "react";
import { useAppContext } from "../context/AppContext";

export default function Favorites() {
  const {
    favoriteHotels,
    favoriteRooms,
    rooms,
    toggleFavoriteHotel,
    toggleFavoriteRoom,
    navigate,
    currency,
    userLoading,
  } = useAppContext();

  const amenityIcons = {
    "Free WiFi": "fa-solid fa-wifi",
    "Room Service": "fa-solid fa-bell-concierge",
    "Pool Access": "fa-solid fa-person-swimming",
    "Mountain View": "fa-solid fa-mountain-sun",
    "Free Breakfast": "fa-solid fa-mug-hot",
    Parking: "fa-solid fa-square-parking",
    Gym: "fa-solid fa-dumbbell",
  };

  // Find one room belonging to a hotel.
  // We use that room's first image as the hotel image.
  const getHotelRoom = (hotelId) => {
    return rooms.find((room) => {
      const roomHotelId =
        typeof room.hotel === "object" ? room.hotel?._id : room.hotel;

      return roomHotelId === hotelId;
    });
  };

  // Get hotel image from one of its rooms.
  const getHotelImage = (hotelId) => {
    const hotelRoom = getHotelRoom(hotelId);

    return hotelRoom?.images?.[0] || "";
  };

  if (userLoading) {
    return (
      <div className="min-h-screen pt-36 flex items-center justify-center bg-[#faf9f7]">
        <p className="text-slate-500">Loading favorites...</p>
      </div>
    );
  }

  const noFavorites = favoriteHotels.length === 0 && favoriteRooms.length === 0;

  return (
    <div className="min-h-screen bg-[#faf9f7] pt-32 md:pt-36 pb-24 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-7xl mx-auto">
        {/* ================= HEADER ================= */}

        <div className="mb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-600 font-semibold mb-3">
            Your Collection
          </p>

          <h1 className="text-4xl md:text-5xl font-playfair font-medium text-slate-900">
            My Favorites
          </h1>

          <p className="text-sm text-slate-500 mt-3 max-w-xl leading-relaxed">
            Keep your favorite hotels and rooms in one place and quickly return
            whenever you're ready to plan your next stay.
          </p>
        </div>

        {/* ================= NO FAVORITES ================= */}

        {noFavorites ? (
          <div className="bg-white border border-slate-100 rounded-3xl py-24 px-6 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 flex items-center justify-center mb-5">
              <i className="fa-regular fa-heart text-2xl text-slate-400"></i>
            </div>

            <h2 className="font-playfair text-2xl text-slate-800">
              No favorites yet
            </h2>

            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Explore our available hotels and rooms and save the places that
              catch your attention.
            </p>

            <button
              onClick={() => navigate("/rooms")}
              className="mt-7 bg-slate-950 text-white px-7 py-3 rounded-xl text-sm hover:bg-amber-600 transition-all duration-300 cursor-pointer"
            >
              Explore Hotels
            </button>
          </div>
        ) : (
          <div className="space-y-20">
            {/* ================================================= */}
            {/* FAVORITE HOTELS */}
            {/* ================================================= */}

            <section>
              {/* HOTEL HEADER */}

              <div className="flex items-end justify-between mb-7">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-amber-600 font-semibold mb-2">
                    Saved Destinations
                  </p>

                  <h2 className="text-3xl font-playfair font-semibold text-slate-900">
                    Favorite Hotels
                  </h2>
                </div>

                <p className="text-sm text-slate-500">
                  {favoriteHotels.length} saved{" "}
                  {favoriteHotels.length === 1 ? "hotel" : "hotels"}
                </p>
              </div>

              {/* NO FAVORITE HOTELS */}

              {favoriteHotels.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-14 px-6 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <i className="fa-regular fa-building text-slate-400"></i>
                  </div>

                  <h3 className="font-playfair text-xl text-slate-800">
                    No favorite hotels yet
                  </h3>

                  <p className="text-sm text-slate-500 mt-2">
                    Save hotels you would like to visit in the future.
                  </p>

                  <button
                    onClick={() => navigate("/rooms")}
                    className="mt-5 text-sm font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
                  >
                    Explore Hotels
                  </button>
                </div>
              ) : (
                /* HOTEL GRID */

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {favoriteHotels.map((hotel) => {
                    const hotelImage = getHotelImage(hotel._id);

                    return (
                      <div
                        key={hotel._id}
                        className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group"
                      >
                        {/* HOTEL IMAGE */}

                        <div className="relative h-60 overflow-hidden bg-slate-100">
                          {hotelImage ? (
                            <img
                              src={hotelImage}
                              alt={hotel.name}
                              onClick={() =>
                                navigate(`/rooms?hotel=${hotel._id}`)
                              }
                              className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                              <i className="fa-regular fa-building text-3xl mb-3"></i>

                              <p className="text-sm">No image available</p>
                            </div>
                          )}

                          {/* REMOVE FAVORITE HOTEL */}

                          <button
                            type="button"
                            onClick={() => toggleFavoriteHotel(hotel._id)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
                            aria-label="Remove hotel from favorites"
                          >
                            <i className="fa-solid fa-heart text-red-500 text-lg"></i>
                          </button>

                          {/* HOTEL BADGE */}

                          <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-700">
                            Favorite Hotel
                          </span>
                        </div>

                        {/* HOTEL INFORMATION */}

                        <div className="p-6">
                          <p className="text-[10px] uppercase tracking-widest font-semibold text-amber-600 mb-1">
                            {hotel.city || "Destination"}
                          </p>

                          <h2
                            onClick={() =>
                              navigate(`/rooms?hotel=${hotel._id}`)
                            }
                            className="font-playfair text-2xl font-semibold text-slate-900 cursor-pointer hover:text-amber-600 transition-colors"
                          >
                            {hotel.name}
                          </h2>

                          <p className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                            <i className="fa-solid fa-location-dot text-amber-600"></i>

                            <span className="line-clamp-1">
                              {hotel.address || "Location unavailable"}
                            </span>
                          </p>

                          {/* EXPLORE BUTTON */}

                          <div className="mt-6 pt-5 border-t border-slate-100">
                            <button
                              onClick={() =>
                                navigate(`/rooms?hotel=${hotel._id}`)
                              }
                              className="w-full py-3 rounded-xl bg-slate-950 text-white text-xs hover:bg-amber-600 transition-all cursor-pointer"
                            >
                              Explore Rooms
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ================================================= */}
            {/* FAVORITE ROOMS */}
            {/* ================================================= */}

            <section>
              {/* ROOM HEADER */}

              <div className="flex items-end justify-between mb-7">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-amber-600 font-semibold mb-2">
                    Saved Accommodations
                  </p>

                  <h2 className="text-3xl font-playfair font-semibold text-slate-900">
                    Favorite Rooms
                  </h2>
                </div>

                <p className="text-sm text-slate-500">
                  {favoriteRooms.length} saved{" "}
                  {favoriteRooms.length === 1 ? "room" : "rooms"}
                </p>
              </div>

              {/* NO FAVORITE ROOMS */}

              {favoriteRooms.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-14 px-6 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <i className="fa-regular fa-heart text-slate-400"></i>
                  </div>

                  <h3 className="font-playfair text-xl text-slate-800">
                    No favorite rooms yet
                  </h3>

                  <p className="text-sm text-slate-500 mt-2">
                    Save rooms that you would like to book in the future.
                  </p>

                  <button
                    onClick={() => navigate("/rooms")}
                    className="mt-5 text-sm font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
                  >
                    Explore Rooms
                  </button>
                </div>
              ) : (
                /* ROOM GRID */

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

                        {/* REMOVE ROOM FAVORITE */}

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

                        {/* PRICE AND VIEW BUTTON */}

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
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
