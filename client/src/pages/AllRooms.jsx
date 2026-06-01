import React, { useMemo, useState } from "react";
import { rooms } from "../assets/assets";
import StarRating from "../components/StarRating";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const CheckBox = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onChange(e.target.checked, label)}
      />

      <span className="font-light select-none">{label}</span>
    </label>
  );
};
const RadioButton = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input type="radio" checked={selected} onChange={onChange} />

      <span>{label}</span>
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
  const sortBy = ["Price Low to High", "Price High to low", "Newest First"];

  // Handle Changes for Filters and Changes
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

  // Function to Check if a room matches the selected room types
  const matchesRoomType = (room) => {
    return (
      selectedFilters.roomType.length === 0 ||
      selectedFilters.roomType.includes(room.roomType)
    );
  };

  // Function to Check if a room matches the selected price ranges
  const matchesPriceRange = (room) => {
    return (
      selectedFilters.priecRange.length === 0 ||
      selectedFilters.priecRange.some((range) => {
        const [min, max] = range.split("-").map(Number);

        return room.pricePerNight >= min && room.pricePerNight <= max;
      })
    );
  };

  // Function to sort room based on the selected sort option
  const sortRooms = (a, b) => {
    if (selectedSort === "Price Low to High") {
      return a.pricePerNight - b.pricePerNight;
    }
    if (selectedSort === "Price High to Low") {
      return b.pricePerNight - a.pricePerNight;
    }
    if (selectedSort === "Newest First") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    return 0;
  };

  //Filter Destination
  const filteredDestination = (room) => {
    const destination = searchParams.get("destination");
    if (!destination) return true;
    return room.hotel.city.toLowerCase().includes(destination.toLowerCase());
  };

  // Filter and Sort rooms based on the selected filters and sort option
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

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({
      roomType: [],
      priecRange: [],
    });
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
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-10 lg:pt-28  md:pt-35 px-4 md:px-16 lg:px-24">
      <div className="w-[75%]">
        <div className="mb-10">
          <h1 className="text-[40px] font-playfair">Hotel Rooms</h1>
          <p className="max-w-150 text-gray-500/90">
            Take advantage of our limited-time offers and special packages to
            enhance your stay and create unforgettable memories.
          </p>
        </div>
        {filteredRooms.map((room) => (
          <div
            key={room._id}
            className="w-full flex gap-6 mb-6 border-b border-gray-300 pb-6"
          >
            {/* Room Image */}
            <img
              onClick={() => navigate(`/rooms/${room._id}`)}
              src={room.images?.[0]}
              alt={room.hotel?.name}
              className="w-[380px] h-[240px] rounded-xl object-cover cursor-pointer"
            />

            {/* Right Content */}
            <div className="flex flex-col justify-center flex-1">
              {/* City */}
              <p className="text-gray-500 text-md mb-1">{room.hotel?.city}</p>

              {/* Hotel Name */}
              <h1
                onClick={() => navigate(`/rooms/${room._id}`)}
                className="font-playfair text-[34px] leading-tight cursor-pointer mb-2"
              >
                {room.hotel?.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <StarRating />
                <p className="text-sm text-gray-700">200+ reviews</p>
              </div>

              {/* Address */}
              <p className="text-gray-500 text-[13px] mb-4">
                <i className="fa-solid fa-location-dot mr-2"></i>
                {room.hotel?.address}
              </p>

              {/* Amenities */}
              <div className="flex flex-wrap gap-3 mb-4">
                {room.amenities?.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-1 bg-gray-100 rounded-md"
                  >
                    <i
                      className={`${
                        amenityIcons[item] || "fa-solid fa-circle-check"
                      } text-gray-700 text-[11px]`}
                    ></i>

                    <span className="text-[11px] text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <h2 className="text-[18px] font-semibold text-black">
                {currency}
                {room.pricePerNight}
                <span className="text-lg text-gray-500 font-normal">
                  {" "}
                  / Night
                </span>
              </h2>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full mt-15 lg:p-2 lg:w-[25%] ">
        <div className="flex justify-between border  p-2">
          <p>Filter</p>
          <div>
            <span
              onClick={() => setOpenFilter(!openFilter)}
              className="lg:hidden"
            >
              {openFilter ? "HIDE" : "SHOW"}
            </span>
            <span className="hidden lg:block">Clear</span>
          </div>
        </div>
        <div
          className={`${openFilter ? "h-auto" : "h-0 lg:h-auto"} overflow-hidden transition-all duration-700  lg:p-4 border border-t-0 `}
        >
          <div className="mb-3 p-4 lg:p-0">
            <p>Popular Filters</p>
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
          <div className="mb-3 p-4 lg:p-0">
            <p>Price Range</p>
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
          <div className="p-4 lg:p-0">
            <p>Sort By</p>
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
      </div>
    </div>
  );
}
