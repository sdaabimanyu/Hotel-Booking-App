import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { UploadCloud } from "lucide-react";

export default function AddRoom() {
  const { axios, getToken } = useAppContext();
  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  const [inputs, setInputs] = useState({
    roomType: "",
    pricePerNight: 0,
    amenities: {
      "Free WiFi": false,
      "Free Breakfast": false,
      "Room Service": false,
      "Mountain View": false,
      "Pool Access": false,
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    // check if all inputs are filled
    if (
      !inputs.roomType ||
      !inputs.pricePerNight ||
      !inputs.amenities ||
      !Object.values(images).some((image) => image)
    ) {
      toast.error("Please fill in all the details");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("roomType", inputs.roomType);
      formData.append("pricePerNight", inputs.pricePerNight);
      // Converting Amenities to array & keeping only enabled amenities
      const amenities = Object.keys(inputs.amenities).filter(
        (key) => inputs.amenities[key],
      );
      formData.append("amenities", JSON.stringify(amenities));

      // Adding images to FormData
      Object.keys(images).forEach((key) => {
        images[key] && formData.append("images", images[key]);
      });

      const { data } = await axios.post("/api/rooms/", formData, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        toast.success(data.message);
        setInputs({
          roomType: "",
          pricePerNight: 0,
          amenities: {
            "Free WiFi": false,
            "Free Breakfast": false,
            "Room Service": false,
            "Mountain View": false,
            "Pool Access": false,
          },
        });
        setImages({ 1: null, 2: null, 3: null, 4: null });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="max-w-4xl mx-auto px-4 py-8 bg-white rounded-xl border border-gray-100 shadow-sm mb-10"
    >
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
        Add Room
      </h1>
      <p className="text-gray-500 text-sm mt-2 max-w-2xl leading-relaxed">
        Fill in the details carefully and accurate room details, pricing, and
        amenities, to enhance the user booking experience.
      </p>

      {/* Upload Area For Images */}
      <div className="mt-8">
        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Images
        </p>
        <div className="grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap">
          {Object.keys(images).map((key) => (
            <label
              htmlFor={`roomimage${key}`}
              key={key}
              className="border border-dashed border-gray-300 hover:border-blue-400 rounded-xl h-20 w-32 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-gray-50/50 transition-colors"
            >
              {images[key] ? (
                <img
                  className="h-full w-full object-cover"
                  src={URL.createObjectURL(images[key])}
                  alt=""
                />
              ) : (
                <div className="flex flex-col items-center text-center p-2">
                  <UploadCloud className="w-5 h-5 text-gray-400 mb-1" />
                  <p className="text-[11px] text-gray-500 font-medium">
                    Upload
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                id={`roomimage${key}`}
                hidden
                onChange={(e) =>
                  setImages({ ...images, [key]: e.target.files[0] })
                }
              />
            </label>
          ))}
        </div>
      </div>

      <div className="w-full flex max-sm:flex-col gap-6 mt-6">
        <div className="flex-1 max-w-xs">
          <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Room Type
          </p>
          <select
            value={inputs.roomType}
            onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })}
            className="border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-gray-700 rounded-lg p-2.5 w-full text-sm outline-none transition-all"
          >
            <option value="">Select Room Type</option>
            <option value="Single Bed">Single Bed</option>
            <option value="Double Bed">Double Bed</option>
            <option value="Luxury Room">Luxury Room</option>
            <option value="Family Suite">Family Suite</option>
          </select>
        </div>

        <div className="w-32">
          <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Price{" "}
            <span className="text-xs text-gray-400 font-normal">/night</span>
          </p>
          <input
            type="number"
            placeholder="0"
            className="border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-gray-700 rounded-lg p-2.5 w-full text-sm outline-none transition-all"
            value={inputs.pricePerNight}
            onChange={(e) =>
              setInputs({ ...inputs, pricePerNight: e.target.value })
            }
          />
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Amenities
        </p>
        <div className="flex flex-col gap-3 text-gray-600 max-w-xs">
          {Object.keys(inputs.amenities).map((amenity, index) => (
            <div key={index} className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id={`amenities${index + 1}`}
                className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                checked={inputs.amenities[amenity]}
                onChange={() =>
                  setInputs({
                    ...inputs,
                    amenities: {
                      ...inputs.amenities,
                      [amenity]: !inputs.amenities[amenity],
                    },
                  })
                }
              />
              <label
                htmlFor={`amenities${index + 1}`}
                className="text-sm text-gray-700 cursor-pointer select-none"
              >
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-lg mt-8 cursor-pointer transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Room"}
      </button>
    </form>
  );
}
