import React from "react";
import regposter from "../assets/regposter1.jpeg";

export default function HotelReg() {
  const cities = ["New York", "Dubai", "Monaco", "Alaska", "Paris"];
  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center justify-center bg-black/70">
      <form className="flex bg-white rounded-xl max-w-3xl max-md:mx-2">
        <img
          src={regposter}
          alt="reg-poster"
          className="w-1/2 rounded-xl hidden md:block"
        />

        <div className="relative flex flex-col items-center md:w-1/2 p-8 md:p-10">
          <i className="fa-solid fa-xmark absolute top-4 right-4 h-4 w-4 cursor-pointer"></i>
          <p className="text-xl font-semibold "> Register Your Hotel</p>
          {/* Hotel Name */}
          <div className="w-full mt-4">
            <label htmlFor="name" className="text-[15px] text-gray-500">
              Hotel Name
            </label>
            <input
              type="text"
              placeholder="Type here"
              className="border border-gray-200 rounded w-full px-3 py-1.5 text-[15px] mt-1 outline-indigo-500 font-light"
              required
            />
          </div>
          {/* Phone */}
          <div className="w-full mt-4">
            <label htmlFor="contact" className="text-[15px] text-gray-500">
              Phone
            </label>
            <input
              id="contact"
              type="text"
              placeholder="Type here"
              className="border border-gray-200 rounded w-full px-3 py-1.5 text-[15px] mt-1 outline-indigo-500 font-light"
              required
            />
          </div>
          {/* Address */}
          <div className="w-full mt-4">
            <label htmlFor="address" className="text-[15px] text-gray-500">
              Address
            </label>
            <input
              id="address"
              type="text"
              placeholder="Type here"
              className="border border-gray-200 rounded w-full px-3 py-1.5 text-[15px] mt-1 outline-indigo-500 font-light"
              required
            />
          </div>
          {/* Select City Drop Down */}
          <div className="w-full mt-4 max-w-60 mr-auto">
            <label htmlFor="city" className="text-[15px] text-gray-500">
              City
            </label>
            <select
              id="city"
              className="border border-gray-200 rounded w-full px-3 py-1.5 text-[15px] mt-1 outline-indigo-500 font-light text-[15px]"
              required
            >
              <option value="">Select City</option>
              {cities.map((city, index) => (
                <option key={index} value="city">
                  {city}
                </option>
              ))}
            </select>
          </div>
          <button className="bg-indigo-500 hover:bg-indigo-600 transition-all text-white mr-auto px-6 py-2 rounded cursor-pointer mt-6">
            Register
          </button>
        </div>
      </form>
    </div>
  );
}
