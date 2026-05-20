import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { roomCommonData, rooms } from "../assets/assets";
import StarRating from "../components/StarRating";

export default function RoomDetails() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    const room = rooms.find((room) => room._id === Number(id));
    if (room) {
      room && setRoom(room);
      room && setMainImage(room.image[0]);
    }
  }, [id]);
  return (
    room && (
      <div className="pt-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32 ">
        {/* Room Details */}
        <div className="flex flex-col md:flex-row md:items-center gap-x-3 mb-3">
          <h1 className="font-playfair text-3xl md:text-4xl mb-2 md:mb-0 ">
            {room.hotel_name}{" "}
            <span className="font-inter text-sm">({room.type})</span>
          </h1>
          <p className="bg-orange-400 text-white text-xs font-inter  py-1.5 px-3  w-20 rounded-2xl  text-center">
            20% OFF
          </p>
        </div>
        {/* Room Ratings */}
        <div className="flex gap-x-2 items-center mb-3">
          <StarRating />
          <p>200+ reviews</p>
        </div>

        {/* Room Address*/}
        <div>
          <p className="text-gray-500/90">
            <i className="fa-solid fa-location-dot"></i> {room.hotel_location}
          </p>
        </div>
        {/* Room Images */}
        <div className="flex flex-col lg:flex-row gap-6 mt-6  ">
          <div className="w-full lg:w-1/2">
            <img
              src={mainImage}
              alt="Room Image"
              className="w-full h-full rounded-xl shadow-lg object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
            {room?.image.length > 1 &&
              room.image.map((image, index) => (
                <img
                  onClick={() => setMainImage(image)}
                  key={index}
                  src={image}
                  alt="Room Image"
                  className={`w-full h-35 rounded-xl shadow-md object-cover cursor-pointer transition ${
                    mainImage === image ? "outline-3 outline-orange-400" : ""
                  }`}
                />
              ))}
          </div>
        </div>
        {/* Room Highlights */}
        <div className="flex flex-col md:flex-row md:justify-between mt-10">
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-playfair">
              Experience Luxury Like Never Before
            </h1>
            <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
              {room.amenities.map((item, index) => (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
                  <i className={item.icon}></i>

                  <p className="text-xs">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Room Price */}
          <p className="text-2xl font-medium">${room.price}/night</p>
        </div>

        {/* CheckIn CheckOut Form */}
        <form className="flex flex-col md:flex-row  items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl">
          <div className="flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500">
            <div className="flex flex-col">
              <label htmlFor="CheckInDate" className="font-medium">
                Check-In
              </label>
              <input
                type="date"
                id="CheckInDate"
                placeholder="Check-In"
                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                required
              />
            </div>

            <div className="w-px h-15 bg-gray-300/50 max-md:hidden"></div>

            <div className="flex flex-col">
              <label htmlFor="CheckOutDate" className="font-medium">
                Check-Out
              </label>
              <input
                type="date"
                id="CheckOutDate"
                placeholder="Check-Out"
                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                required
              />
            </div>

            <div className="w-px h-15 bg-gray-300/50 max-md:hidden"></div>

            <div className="flex flex-col">
              <label htmlFor="Guests" className="font-medium">
                Guests
              </label>
              <input
                type="number"
                id="Guests"
                placeholder="0"
                className="max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-primary hover:bg-primary-dull active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer"
          >
            Check Availability
          </button>
        </form>

        {/* Common Speification */}
        <div className="mt-25 space-y-4">
          {roomCommonData.map((items, index) => (
            <div key={index} className="flex items-start gap-2">
              <i className={`${items.icon} text-xl text-gray-700`}></i>
              <div>
                <p className="text-base">{items.title}</p>
                <p className="text-gray-500">{items.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500">
          <p>
            Guests will be allocated on the ground floor according to
            availability. You get a comfortable Two bedroom apartment has a true
            city feeling. The price quoted is for two guest, at the guest slot
            please mark the number of guests to get the exact price for groups.
            The Guests will be allocated ground floor according to availability.
            You get the comfortable two bedroom apartment that has a true city
            feeling.
          </p>
        </div>

        {/* Hosted By */}
        <div className="flex flex-col items-start gap-4">
          <div className="flex gap-4">
            <img
              src="/src/assets/logo1.png"
              alt="Host"
              className="h-14 w-14 md:h-18 md:w-18 rounded-full"
            />
            <div>
              <p className="text-lg md:text-xl">Hosted by {room.hotel_name}</p>
              <div className="flex items-center mt-1">
                <StarRating />
                <p className="ml-2">200+ reviews</p>
              </div>
            </div>
          </div>
          <button className="px-6 py-2.5 mt-4 rounded text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer ">
            Contact Now
          </button>
        </div>
      </div>
    )
  );
}
