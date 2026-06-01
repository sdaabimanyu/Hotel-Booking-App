import React, { useState } from "react";
import { useAppContext } from "../context/appContext";

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
    <div className='relative flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-[url("/src/assets/hero3.jpg")] bg-no-repeat bg-cover bg-center h-screen overflow-hidden'>
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* Content */}
      <div className="relative z-10">
        <p className="bg-[#49b9ff]/60 rounded-full px-3 py-1 mt-20 inline-block">
          The Ultimate Hotel Experience
        </p>

        <h1 className="font-playfair text-2xl md:text-5xl md:text-[50px] md:leading-13.75 font-bold max-w-xl mt-4">
          Discover Your Ultimate Getaway Destination
        </h1>

        <p className="max-w-130 mt-2 text-sm md:text-base">
          Unparalleled luxury and comfort await at the world's most exclusive
          hotels and resorts. Start your journey today.
        </p>

        <form
          onSubmit={onSearch}
          className="bg-white text-gray-500 rounded-lg px-6 py-4 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto mt-10"
        >
          {/* Destination */}
          <div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-800"
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
              className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
              placeholder="Type here"
              required
            />

            <datalist id="destinations">
              {cities.map((city, index) => (
                <option value={city} key={index} />
              ))}
            </datalist>
          </div>

          {/* Check In */}
          <div>
            <div className="flex items-center gap-2">
              <label htmlFor="checkIn">Check In</label>
            </div>

            <input
              id="checkIn"
              type="date"
              className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
            />
          </div>

          {/* Check Out */}
          <div>
            <div className="flex items-center gap-2">
              <label htmlFor="checkOut">Check Out</label>
            </div>

            <input
              id="checkOut"
              type="date"
              className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
            />
          </div>

          {/* Guests */}
          <div className="flex md:flex-col max-md:gap-2 max-md:items-center">
            <label htmlFor="guests">Guests</label>

            <input
              min={1}
              max={4}
              id="guests"
              type="number"
              className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none max-w-16"
              placeholder="1"
            />
          </div>

          {/* Search Button */}
          <button className="flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-2 hover:bg-gray-800 transition">
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
