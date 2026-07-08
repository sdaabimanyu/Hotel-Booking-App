import React, { useMemo, useState } from "react";
import StarRating from "../components/StarRating";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

// Premium Styled Custom Checkbox Component
const CheckBox = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-3 text-sm group select-none">
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onChange(e.target.checked, label)}
          className="sr-only" // Hide native input completely
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
        className={`text-[13px] transition-colors duration-150 ${selected ? "text-slate-900 font-medium" : "text-slate-500 font-light"}`}
      >
        {label}
      </span>
    </label>
  );
};

// Premium Styled Custom Radio Button Component
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
        className={`text-[13px] transition-colors duration-150 ${selected ? "text-slate-900 font-medium" : "text-slate-500 font-light"}`}
      >
        {label}
      </span>
    </label>
  );
};

export default function AllRooms() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { rooms, navigate, currency } = useAppContext();
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    roomType: [],
    priecRange: [],
  });
  const [selectedSort, setSelectedSort] = useState("");

  const roomTypes = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite"];
  const priecRange = ["0-500", "500-1000", "1000-2000", "2000-3000"];
  const sortBy = ["Price Low to High", "Price High to Low", "Newest First"];

  const handleFilterChange = (checked, value, type) => {
    setSelectedFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      if (checked) {
        updatedFilters[type].push(value);
      } else {
        updatedFilters[type] = updatedFilters[type].filter(
          (item) => item !== value,
        );
      }
      return updatedFilters;
    });
  };

  const handleSortChange = (sortOption) => {
    setSelectedSort(sortOption);
  };

  const matchesRoomType = (room) => {
    return (
      selectedFilters.roomType.length === 0 ||
      selectedFilters.roomType.includes(room.roomType)
    );
  };

  const matchesPriceRange = (room) => {
    return (
      selectedFilters.priecRange.length === 0 ||
      selectedFilters.priecRange.some((range) => {
        const [min, max] = range.split("-").map(Number);
        return room.pricePerNight >= min && room.pricePerNight <= max;
      })
    );
  };

  const sortRooms = (a, b) => {
    if (selectedSort === "Price Low to High")
      return a.pricePerNight - b.pricePerNight;
    if (selectedSort === "Price High to Low")
      return b.pricePerNight - a.pricePerNight;
    if (selectedSort === "Newest First")
      return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  };

  const filteredDestination = (room) => {
    const destination = searchParams.get("destination");
    if (!destination) return true;
    return room.hotel.city.toLowerCase().includes(destination.toLowerCase());
  };

  const filteredRooms = useMemo(() => {
    return rooms
      .filter(
        (room) =>
          matchesRoomType(room) &&
          matchesPriceRange(room) &&
          filteredDestination(room),
      )
      .sort(sortRooms);
  }, [rooms, selectedFilters, selectedSort, searchParams]);

  const clearFilters = () => {
    setSelectedFilters({ roomType: [], priecRange: [] });
    setSelectedSort("");
    setSearchParams({});
  };

  const amenityIcons = {
    "Free WiFi": "fa-solid fa-wifi",
    "Room Service": "fa-solid fa-bell-concierge",
    "Pool Access": "fa-solid fa-person-swimming",
    "Mountain View": "fa-solid fa-mountain-sun",
    "Free Breakfast": "fa-solid fa-mug-hot",
    Parking: "fa-solid fa-square-parking",
    Gym: "fa-solid fa-dumbbell",
  };

  return (
    <div className="bg-[#faf9f7] min-h-screen pt-28 lg:pt-36 pb-24 px-4 md:px-16 lg:px-24 antialiased">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-10">
        {/* Left Side: Room Listing Modules */}
        <div className="w-full lg:w-[76%]">
          {/* Header Title Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-medium font-playfair text-slate-900 tracking-tight">
              Hotel Rooms
            </h1>
            <p className="max-w-xl text-sm font-inter text-slate-500 mt-3 leading-relaxed">
              Take advantage of our limited-time offers and special packages to
              enhance your stay and create unforgettable memories.
            </p>
          </div>

          {/* Rooms Grid / List Stack */}
          <div className="space-y-8">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xs">
                <p className="font-playfair text-xl text-slate-400">
                  No rooms match your preference
                </p>
              </div>
            ) : (
              filteredRooms.map((room) => (
                <div
                  key={room._id}
                  className="w-full bg-white rounded-3xl p-5 flex flex-col md:flex-row gap-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300"
                >
                  {/* Room Media Frame */}
                  <div className="w-full md:w-[340px] h-[220px] shrink-0 rounded-2xl overflow-hidden shadow-xs relative group">
                    <img
                      onClick={() => navigate(`/rooms/${room._id}`)}
                      src={room.images?.[0]}
                      alt={room.hotel?.name}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-103 transition-transform duration-500 ease-out"
                    />
                  </div>

                  {/* Room Text Details & Value Metrics */}
                  <div className="flex flex-col justify-between flex-1 py-1">
                    <div>
                      {/* Location Metadata tag */}
                      <p className="text-[11px] font-bold font-inter tracking-wider text-slate-600 uppercase mb-1">
                        {room.hotel?.city}
                      </p>

                      {/* Suite / Room Display Title */}
                      <h2
                        onClick={() => navigate(`/rooms/${room._id}`)}
                        className="font-playfair text-3xl font-bold text-slate-800 tracking-tight cursor-pointer hover:text-slate-600 transition-colors duration-150 mb-2.5"
                      >
                        {room.hotel?.name}
                      </h2>

                      {/* Ratings Overlay Row */}
                      {/* Dynamic Ratings Row */}
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

                      {/* Map Location Detail Tag */}
                      <p className="text-slate-400 font-inter text-xs flex items-center gap-2 mb-5">
                        <span className="text-slate-300 text-sm">📍</span>
                        <span className="line-clamp-1">
                          {room.hotel?.address}
                        </span>
                      </p>

                      {/* Premium Mini-Pill Amenities Grid */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {room.amenities?.slice(0, 5).map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100/70 rounded-lg"
                          >
                            <i
                              className={`${
                                amenityIcons[item] || "fa-solid fa-circle-check"
                              } text-slate-400 text-[10px]`}
                            ></i>
                            <span className="text-[11px] font-inter text-slate-500 font-medium">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing Value Tagline */}
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
              ))
            )}
          </div>
        </div>

        {/* Right Side: Clean Premium Filters Sidebar */}
        <div className="w-full lg:w-[24%] shrink-0 lg:sticky lg:top-36">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] overflow-hidden">
            {/* Filter Header Component bar */}
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

            {/* Filter Content Panels Stack */}
            <div
              className={`${openFilter ? "max-h-[1000px] opacity-100" : "max-h-0 lg:max-h-none opacity-0 lg:opacity-100"} overflow-hidden transition-all duration-500 ease-in-out font-inter`}
            >
              {/* Category: Room Types */}
              <div className="p-6 border-b border-slate-50">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
                  Popular Accommodations
                </p>
                <div className="space-y-1">
                  {roomTypes.map((room, index) => (
                    <CheckBox
                      label={room}
                      key={index}
                      selected={selectedFilters.roomType.includes(room)}
                      onChange={(checked) =>
                        handleFilterChange(checked, room, "roomType")
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Category: Pricing Matrix Ranges */}
              <div className="p-6 border-b border-slate-50">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
                  Price Per Night
                </p>
                <div className="space-y-1">
                  {priecRange.map((range, index) => (
                    <CheckBox
                      key={index}
                      label={`${currency}${range}`}
                      selected={selectedFilters.priecRange.includes(range)}
                      onChange={(checked) =>
                        handleFilterChange(checked, range, "priecRange")
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Category: Sorting Methods */}
              <div className="p-6 bg-slate-50/30">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
                  Sort Results By
                </p>
                <div className="space-y-1">
                  {sortBy.map((option, index) => (
                    <RadioButton
                      label={option}
                      key={index}
                      selected={selectedSort === option}
                      onChange={() => handleSortChange(option)}
                    />
                  ))}
                </div>
              </div>

              {/* Mobile-only Clear Filter Visibility Button */}
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
