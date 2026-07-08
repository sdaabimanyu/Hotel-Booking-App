import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";

export default function Hero() {
  const cities = ["New York", "Dubai", "Monaco", "Alaska", "Paris"];
  const { navigate, getToken, axios, setSearchedCities } = useAppContext();
  const [destination, setDestination] = useState("");

  const onSearch = async (e) => {
    e.preventDefault();

    navigate(`/rooms?destination=${destination}`);

    try {
      await axios.post(
        "/api/user/store-recent-search",
        {
          recentSearchedCity: destination,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );

      setSearchedCities((prev) => {
        const updated = [...prev, destination];

        if (updated.length > 3) {
          updated.shift();
        }

        return updated;
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='relative flex flex-col justify-center px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 text-white bg-[url("/src/assets/hero3.jpg")] bg-no-repeat bg-cover bg-center min-h-screen lg:h-screen py-24 lg:py-0 overflow-x-hidden'>
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <p className="bg-[#49b9ff]/60 rounded-full px-3 py-1 font-inter text-xs sm:text-sm inline-block tracking-wide">
          The Ultimate Hotel Experience
        </p>

        <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-[50px] lg:leading-tight font-bold max-w-2xl mt-4">
          Discover Your Ultimate Getaway Destination
        </h1>

        <p className="max-w-xl mt-3 text-sm sm:text-base text-gray-200/90 leading-relaxed font-light">
          Unparalleled luxury and comfort await at the world's most exclusive
          hotels and resorts. Start your journey today.
        </p>

        <form
          onSubmit={onSearch}
          className="bg-white text-gray-600 rounded-2xl p-4 sm:p-6 flex flex-col lg:flex-row items-stretch lg:items-end gap-4 w-full mt-10 shadow-xl border border-gray-100"
        >
          {/* Destination */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <svg
                className="w-4 h-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 10h16M8 14h8m-4-7V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"
                />
              </svg>
              <label htmlFor="destinationInput">Destination</label>
            </div>

            <input
              onChange={(e) => setDestination(e.target.value)}
              value={destination}
              list="destinations"
              id="destinationInput"
              type="text"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 mt-2 text-sm outline-none focus:border-blue-400 focus:bg-white transition"
              placeholder="Where are you going?"
              required
            />

            <datalist id="destinations">
              {cities.map((city, index) => (
                <option value={city} key={index} />
              ))}
            </datalist>
          </div>

          {/* Check In */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <label htmlFor="checkIn">Check In</label>
            </div>

            <input
              id="checkIn"
              type="date"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 mt-2 text-sm outline-none focus:border-blue-400 focus:bg-white transition"
            />
          </div>

          {/* Check Out */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <label htmlFor="checkOut">Check Out</label>
            </div>

            <input
              id="checkOut"
              type="date"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 mt-2 text-sm outline-none focus:border-blue-400 focus:bg-white transition"
            />
          </div>

          {/* Guests */}
          <div className="flex-1 lg:max-w-[120px] flex flex-col">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <label htmlFor="guests">Guests</label>
            </div>

            <input
              min={1}
              max={4}
              id="guests"
              type="number"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 mt-2 text-sm outline-none focus:border-blue-400 focus:bg-white transition"
              placeholder="1"
            />
          </div>

          {/* Search Button */}
          <button className="w-full lg:w-auto h-[46px] flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 font-medium text-sm text-white hover:bg-slate-800 active:scale-[0.98] transition duration-200 cursor-pointer shadow-md shadow-slate-900/10">
            <svg
              className="w-4 h-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
            <span>Search</span>
          </button>
        </form>
      </div>
    </div>
  );
}
