import React, { useMemo, useState } from "react";
import StarRating from "../components/StarRating";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const CheckBox = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-3 text-sm group select-none">
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onChange(e.target.checked, label)}
          className="sr-only"
        />

        <div
          className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
            selected
              ? "bg-slate-900 border-slate-900"
              : "border-slate-300 bg-white group-hover:border-slate-400"
          }`}
        >
          {selected && (
            <svg
              className="w-2.5 h-2.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>

      <span
        className={`text-[13px] transition-colors duration-150 ${
          selected ? "text-slate-900 font-medium" : "text-slate-500 font-light"
        }`}
      >
        {label}
      </span>
    </label>
  );
};

const RadioButton = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-3 text-sm group select-none">
      <div className="relative flex items-center justify-center">
        <input
          type="radio"
          checked={selected}
          onChange={onChange}
          className="sr-only"
        />

        <div
          className={`w-4 h-4 rounded-full border transition-all duration-200 flex items-center justify-center ${
            selected
              ? "border-slate-900 bg-white"
              : "border-slate-300 bg-white group-hover:border-slate-400"
          }`}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-slate-900" />}
        </div>
      </div>

      <span
        className={`text-[13px] transition-colors duration-150 ${
          selected ? "text-slate-900 font-medium" : "text-slate-500 font-light"
        }`}
      >
        {label}
      </span>
    </label>
  );
};

export default function AllRooms() {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    rooms,
    navigate,
    currency,
    favoriteRooms,
    toggleFavoriteRoom,
    user,
    userProfile,
  } = useAppContext();

  const [openFilter, setOpenFilter] = useState(false);

  // =========================================================
  // SELECTED FILTERS
  // =========================================================

  const [selectedFilters, setSelectedFilters] = useState({
    roomType: [],
    priceRange: [],
    amenities: [],
  });

  const [selectedSort, setSelectedSort] = useState("");

  // =========================================================
  // FILTER OPTIONS
  // =========================================================

  const roomTypes = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite"];

  const priceRange = ["0-500", "500-1000", "1000-2000", "2000-3000"];

  const amenities = [
    "Free WiFi",
    "Room Service",
    "Pool Access",
    "Mountain View",
    "Free Breakfast",
    "Parking",
    "Gym",
  ];

  const sortBy = ["Price Low to High", "Price High to Low", "Newest First"];

  // =========================================================
  // USER BOOKING PREFERENCE
  // =========================================================

  const preferredRoomType =
    userProfile?.bookingPreferences?.preferredRoomType || "";

  // =========================================================
  // FILTER CHANGE
  // =========================================================

  const handleFilterChange = (checked, value, type) => {
    setSelectedFilters((prevFilters) => {
      if (checked) {
        return {
          ...prevFilters,

          [type]: prevFilters[type].includes(value)
            ? prevFilters[type]
            : [...prevFilters[type], value],
        };
      }

      return {
        ...prevFilters,

        [type]: prevFilters[type].filter((item) => item !== value),
      };
    });
  };

  // =========================================================
  // SORT CHANGE
  // =========================================================

  const handleSortChange = (sortOption) => {
    setSelectedSort(sortOption);
  };

  // =========================================================
  // ROOM TYPE FILTER
  // =========================================================

  const matchesRoomType = (room) => {
    return (
      selectedFilters.roomType.length === 0 ||
      selectedFilters.roomType.includes(room.roomType)
    );
  };

  // =========================================================
  // PRICE FILTER
  // =========================================================

  const matchesPriceRange = (room) => {
    return (
      selectedFilters.priceRange.length === 0 ||
      selectedFilters.priceRange.some((range) => {
        const [min, max] = range.split("-").map(Number);

        return room.pricePerNight >= min && room.pricePerNight <= max;
      })
    );
  };

  // =========================================================
  // AMENITIES FILTER
  // =========================================================

  const matchesAmenities = (room) => {
    if (selectedFilters.amenities.length === 0) {
      return true;
    }

    if (!Array.isArray(room.amenities)) {
      return false;
    }

    return selectedFilters.amenities.every((selectedAmenity) =>
      room.amenities.some(
        (roomAmenity) =>
          roomAmenity.toLowerCase().trim() ===
          selectedAmenity.toLowerCase().trim(),
      ),
    );
  };

  // =========================================================
  // DESTINATION FILTER
  // =========================================================

  const filteredDestination = (room) => {
    const destination = searchParams.get("destination");

    if (!destination) {
      return true;
    }

    return room.hotel?.city
      ?.toLowerCase()
      .includes(destination.toLowerCase().trim());
  };

  // =========================================================
  // FAVORITE HOTEL FILTER
  // =========================================================

  const filteredHotel = (room) => {
    const hotelId = searchParams.get("hotel");

    if (!hotelId) {
      return true;
    }

    const roomHotelId =
      typeof room.hotel === "object" ? room.hotel?._id : room.hotel;

    return roomHotelId?.toString() === hotelId.toString();
  };

  // =========================================================
  // CHECK IF ROOM MATCHES USER PREFERENCE
  // =========================================================

  const isRecommendedRoom = (room) => {
    if (!preferredRoomType) {
      return false;
    }

    return room.roomType?.toLowerCase() === preferredRoomType.toLowerCase();
  };

  // =========================================================
  // FILTER + SORT ROOMS
  // =========================================================

  const filteredRooms = useMemo(() => {
    const result = rooms.filter(
      (room) =>
        matchesRoomType(room) &&
        matchesPriceRange(room) &&
        matchesAmenities(room) &&
        filteredDestination(room) &&
        filteredHotel(room),
    );

    // -------------------------------------------------------
    // EXPLICIT USER SORT HAS FIRST PRIORITY
    // -------------------------------------------------------

    if (selectedSort === "Price Low to High") {
      return [...result].sort((a, b) => a.pricePerNight - b.pricePerNight);
    }

    if (selectedSort === "Price High to Low") {
      return [...result].sort((a, b) => b.pricePerNight - a.pricePerNight);
    }

    if (selectedSort === "Newest First") {
      return [...result].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    }

    // -------------------------------------------------------
    // NO MANUAL SORT:
    // RECOMMENDED ROOMS APPEAR FIRST
    // -------------------------------------------------------

    if (preferredRoomType) {
      return [...result].sort((a, b) => {
        const aRecommended = isRecommendedRoom(a) ? 1 : 0;
        const bRecommended = isRecommendedRoom(b) ? 1 : 0;

        return bRecommended - aRecommended;
      });
    }

    return result;
  }, [rooms, selectedFilters, selectedSort, searchParams, preferredRoomType]);

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSelectedFilters({
      roomType: [],
      priceRange: [],
      amenities: [],
    });

    setSelectedSort("");

    setSearchParams({});
  };

  // =========================================================
  // AMENITY ICONS
  // =========================================================

  const amenityIcons = {
    "Free WiFi": "fa-solid fa-wifi",
    "Room Service": "fa-solid fa-bell-concierge",
    "Pool Access": "fa-solid fa-person-swimming",
    "Mountain View": "fa-solid fa-mountain-sun",
    "Free Breakfast": "fa-solid fa-mug-hot",
    Parking: "fa-solid fa-square-parking",
    Gym: "fa-solid fa-dumbbell",
  };

  // =========================================================
  // CHECK FAVORITE ROOM
  // =========================================================

  const isRoomFavorite = (roomId) => {
    return favoriteRooms.some((room) => room._id === roomId);
  };

  return (
    <div className="bg-[#faf9f7] min-h-screen pt-28 lg:pt-36 pb-24 px-4 md:px-16 lg:px-24 antialiased">
      <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-start justify-between gap-10">
        {/* ================================================= */}
        {/* ROOMS SECTION */}
        {/* ================================================= */}

        <div className="w-full lg:w-[76%]">
          {/* HEADER */}

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-medium font-playfair text-slate-900 tracking-tight">
              Hotel Rooms
            </h1>

            <p className="max-w-xl text-sm font-inter text-slate-500 mt-3 leading-relaxed">
              Take advantage of our limited-time offers and special packages to
              enhance your stay and create unforgettable memories.
            </p>

            {user && preferredRoomType && (
              <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                <i className="fa-solid fa-wand-magic-sparkles text-amber-600 text-xs"></i>

                <p className="text-xs font-inter text-amber-800">
                  Rooms matching your preference for{" "}
                  <span className="font-semibold">{preferredRoomType}</span> are
                  shown first.
                </p>
              </div>
            )}
          </div>

          {/* ================================================= */}
          {/* ROOMS LIST */}
          {/* ================================================= */}

          <div className="space-y-8">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xs">
                <p className="font-playfair text-xl text-slate-400">
                  No rooms match your selected filters
                </p>
              </div>
            ) : (
              filteredRooms.map((room) => {
                const recommended = isRecommendedRoom(room);

                return (
                  <div
                    key={room._id}
                    className={`w-full bg-white rounded-3xl p-5 flex flex-col md:flex-row gap-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] ${
                      recommended && user
                        ? "border-amber-200"
                        : "border-slate-100"
                    }`}
                  >
                    {/* ROOM IMAGE */}

                    <div className="w-full md:w-[340px] h-[220px] shrink-0 rounded-2xl overflow-hidden shadow-xs relative group">
                      <img
                        onClick={() => navigate(`/rooms/${room._id}`)}
                        src={room.images?.[0]}
                        alt={room.hotel?.name}
                        className="w-full h-full object-cover cursor-pointer group-hover:scale-103 transition-transform duration-500 ease-out"
                      />

                      {user && recommended && (
                        <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                          <i className="fa-solid fa-star text-[9px]"></i>

                          <span className="text-[10px] font-semibold uppercase tracking-wider">
                            Recommended for You
                          </span>
                        </div>
                      )}

                      {user && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleFavoriteRoom(room._id);
                          }}
                          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:scale-110 transition-all duration-200 cursor-pointer"
                          aria-label={
                            isRoomFavorite(room._id)
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          <i
                            className={`${
                              isRoomFavorite(room._id)
                                ? "fa-solid fa-heart text-red-500"
                                : "fa-regular fa-heart text-slate-600"
                            } text-lg`}
                          ></i>
                        </button>
                      )}
                    </div>

                    {/* ROOM INFORMATION */}

                    <div className="flex flex-col justify-between flex-1 py-1">
                      <div>
                        <p className="text-[11px] font-bold font-inter tracking-wider text-slate-600 uppercase mb-1">
                          {room.hotel?.city}
                        </p>

                        <h2
                          onClick={() => navigate(`/rooms/${room._id}`)}
                          className="font-playfair text-3xl font-bold text-slate-800 tracking-tight cursor-pointer hover:text-slate-600 transition-colors duration-150 mb-2.5"
                        >
                          {room.hotel?.name}
                        </h2>

                        <p className="text-xs font-inter font-medium text-amber-600 mb-3">
                          {room.roomType}
                        </p>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="scale-95 origin-left">
                            <StarRating rating={room.averageRating || 0} />
                          </div>

                          <div className="w-1 h-1 rounded-full bg-slate-300" />

                          <p className="text-xs font-inter font-medium text-slate-500">
                            {room.reviewCount || 0}{" "}
                            {room.reviewCount === 1 ? "review" : "reviews"}
                          </p>
                        </div>

                        <p className="text-slate-400 font-inter text-xs flex items-center gap-2 mb-5">
                          <span className="text-slate-300 text-sm">📍</span>

                          <span className="line-clamp-1">
                            {room.hotel?.address}
                          </span>
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {room.amenities?.slice(0, 5).map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100/70 rounded-lg"
                            >
                              <i
                                className={`${
                                  amenityIcons[item] ||
                                  "fa-solid fa-circle-check"
                                } text-slate-400 text-[10px]`}
                              ></i>

                              <span className="text-[11px] font-inter text-slate-500 font-medium">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-50 flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold font-inter text-slate-900">
                          {currency}
                          {room.pricePerNight}
                        </span>

                        <span className="text-xs font-inter font-medium text-slate-400 uppercase tracking-wider">
                          / Night
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================================================= */}
        {/* FILTER SIDEBAR */}
        {/* ================================================= */}

        <div className="w-full lg:w-[24%] shrink-0 lg:sticky lg:top-36">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] overflow-hidden">
            {/* FILTER HEADER */}

            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <p className="font-playfair text-lg font-bold text-slate-900 tracking-tight">
                Filters
              </p>

              <div>
                <button
                  onClick={() => setOpenFilter(!openFilter)}
                  className="lg:hidden text-xs font-bold font-inter text-slate-500 tracking-wider uppercase bg-white border border-slate-200 px-3 py-1 rounded-lg"
                >
                  {openFilter ? "Hide" : "Show"}
                </button>

                <button
                  onClick={clearFilters}
                  className="hidden lg:block text-xs font-bold font-inter text-slate-400 hover:text-amber-600 transition-colors duration-150 uppercase tracking-wider"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* FILTER CONTENT */}

            <div
              className={`${
                openFilter
                  ? "max-h-[2000px] opacity-100"
                  : "max-h-0 lg:max-h-none opacity-0 lg:opacity-100"
              } overflow-hidden transition-all duration-500 ease-in-out font-inter`}
            >
              {/* ROOM TYPES */}

              <div className="p-6 border-b border-slate-50">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
                  Popular Accommodations
                </p>

                <div className="space-y-1">
                  {roomTypes.map((roomType) => (
                    <CheckBox
                      label={roomType}
                      key={roomType}
                      selected={selectedFilters.roomType.includes(roomType)}
                      onChange={(checked) =>
                        handleFilterChange(checked, roomType, "roomType")
                      }
                    />
                  ))}
                </div>
              </div>

              {/* PRICE RANGE */}

              <div className="p-6 border-b border-slate-50">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
                  Price Per Night
                </p>

                <div className="space-y-1">
                  {priceRange.map((range) => (
                    <CheckBox
                      key={range}
                      label={`${currency}${range}`}
                      selected={selectedFilters.priceRange.includes(range)}
                      onChange={(checked) =>
                        handleFilterChange(checked, range, "priceRange")
                      }
                    />
                  ))}
                </div>
              </div>

              {/* ================================================= */}
              {/* AMENITIES FILTER */}
              {/* ================================================= */}

              <div className="p-6 border-b border-slate-50">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
                  Amenities
                </p>

                <div className="space-y-1">
                  {amenities.map((amenity) => (
                    <CheckBox
                      key={amenity}
                      label={amenity}
                      selected={selectedFilters.amenities.includes(amenity)}
                      onChange={(checked) =>
                        handleFilterChange(checked, amenity, "amenities")
                      }
                    />
                  ))}
                </div>
              </div>

              {/* SORT */}

              <div className="p-6 bg-slate-50/30">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
                  Sort Results By
                </p>

                <div className="space-y-1">
                  {sortBy.map((option) => (
                    <RadioButton
                      label={option}
                      key={option}
                      selected={selectedSort === option}
                      onChange={() => handleSortChange(option)}
                    />
                  ))}
                </div>
              </div>

              {/* MOBILE CLEAR */}

              <div className="p-4 lg:hidden border-t border-slate-100 bg-white">
                <button
                  onClick={clearFilters}
                  className="w-full text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold font-inter tracking-wide transition duration-150"
                >
                  Clear Applied Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
