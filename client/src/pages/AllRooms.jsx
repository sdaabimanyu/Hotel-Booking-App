import React, { useState } from "react";
import { rooms } from "../assets/assets";
import StarRating from "../components/StarRating";
import { useNavigate } from "react-router-dom";

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
      <input type="radio" checked={selected} onChange={label} />

      <span>{label}</span>
    </label>
  );
};

export default function AllRooms() {
  const navigate = useNavigate();
  const [openFilter, setOpenFilter] = useState(false);

  const roomTypes = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite"];
  const priecRange = ["0-500", "500-1000", "1000-2000", "2000-3000"];
  const sortBy = ["Price Low to High", "Price High to low", "Newest First"];

  return (
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-10 lg:pt-28  md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="w-[70%]">
        <div className="mb-10">
          <h1 className="text-[40px] font-playfair">Hotel Rooms</h1>
          <p className="max-w-150 text-gray-500/90">
            Take advantage of our limited-time offers and special packages to
            enhance your stay and create unforgettable memories.
          </p>
        </div>
        {rooms.map((room) => (
          <div
            key={room._id}
            className="w-full flex mb-5 border-b border-gray-300 pb-5"
          >
            <img
              onClick={() => {
                navigate(`/rooms/${room._id}`);
              }}
              src={room.image[0]}
              alt={room.hotel_name}
              className="w-100 h-60 rounded-xl"
            />
            <div className="px-5 py-1">
              <h1 className="text-gray-500/90 text-[15px]">
                {room.hotel_location}
              </h1>
              <h1
                onClick={() => {
                  navigate(`/rooms/${room._id}`);
                }}
                className="font-playfair text-[25px] mb-2 cursor-pointer"
              >
                {room.hotel_name}
              </h1>
              <div className="flex items-center gap-x-2 mb-2">
                <StarRating />
                <p className="text-[13px]">200+ reviews</p>
              </div>
              <h1 className="text-gray-500/90 text-[15px] mb-3">
                <i className="fa-solid fa-location-arrow"></i> {room.hotel_location}
              </h1>
              <div className="flex gap-x-3 mb-3">
                {room.amenities?.map((item, index) => (
                  <div key={index} className="bg-gray-200 p-1 rounded">
                    <i className={item.icon}></i>
                    <p className="text-[12px]">{item.name}</p>
                  </div>
                ))}
              </div>
              <h1 className="font-semibold text-[18px]">
                ${room.price}/
                <span className="text-[14px] text-gray-500/90">Night</span>{" "}
              </h1>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full mt-15 lg:p-2 lg:w-[30%] ">
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
            {roomTypes.map((type, index) => (
              <CheckBox label={type} key={index} />
            ))}
          </div>
          <div className="mb-3 p-4 lg:p-0">
            <p>Price Range</p>
            {priecRange.map((range, index) => (
              <CheckBox label={range} key={index} />
            ))}
          </div>
          <div className="p-4 lg:p-0">
            <p>Sort By</p>
            {sortBy.map((option, index) => (
              <RadioButton label={option} key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
