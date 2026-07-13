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
    description: "",
    roomSize: "",
    bedType: "",
    view: "",
    pricePerNight: "",
    amenities: {
      "Free WiFi": false,
      "Free Breakfast": false,
      "Room Service": false,
      "Mountain View": false,
      "Pool Access": false,
    },
  });

  const [loading, setLoading] = useState(false);

  // =========================================================
  // SUBMIT ROOM
  // =========================================================

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // =========================================================
    // VALIDATION
    // =========================================================

    if (
      !inputs.roomType ||
      !inputs.description.trim() ||
      !inputs.roomSize.trim() ||
      !inputs.bedType ||
      !inputs.view ||
      !inputs.pricePerNight ||
      Number(inputs.pricePerNight) <= 0 ||
      !Object.values(images).some((image) => image)
    ) {
      toast.error("Please fill in all required room details");
      return;
    }

    // Get only selected amenities

    const selectedAmenities = Object.keys(inputs.amenities).filter(
      (amenity) => inputs.amenities[amenity],
    );

    if (selectedAmenities.length === 0) {
      toast.error("Please select at least one amenity");
      return;
    }

    try {
      setLoading(true);

      // =========================================================
      // CREATE FORM DATA
      // =========================================================

      const formData = new FormData();

      formData.append("roomType", inputs.roomType);

      formData.append("description", inputs.description.trim());

      formData.append("roomSize", inputs.roomSize.trim());

      formData.append("bedType", inputs.bedType);

      formData.append("view", inputs.view);

      formData.append("pricePerNight", inputs.pricePerNight);

      formData.append("amenities", JSON.stringify(selectedAmenities));

      // =========================================================
      // ADD IMAGES
      // =========================================================

      Object.values(images).forEach((image) => {
        if (image) {
          formData.append("images", image);
        }
      });

      // =========================================================
      // SEND REQUEST
      // =========================================================

      const token = await getToken();

      const { data } = await axios.post("/api/rooms/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // =========================================================
      // SUCCESS
      // =========================================================

      if (data.success) {
        toast.success(data.message);

        // Reset form

        setInputs({
          roomType: "",
          description: "",
          roomSize: "",
          bedType: "",
          view: "",
          pricePerNight: "",
          amenities: {
            "Free WiFi": false,
            "Free Breakfast": false,
            "Room Service": false,
            "Mountain View": false,
            "Pool Access": false,
          },
        });

        setImages({
          1: null,
          2: null,
          3: null,
          4: null,
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("ADD ROOM ERROR:", error);

      toast.error(
        error.response?.data?.message || error.message || "Failed to add room",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <form
      onSubmit={onSubmitHandler}
      className="max-w-4xl mx-auto px-4 py-8 bg-white rounded-xl border border-gray-100 shadow-sm mb-10"
    >
      {/* HEADER */}

      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
        Add Room
      </h1>

      <p className="text-gray-500 text-sm mt-2 max-w-2xl leading-relaxed">
        Add detailed room information, pricing, images and amenities to help
        guests choose the right accommodation.
      </p>

      {/* ========================================================= */}
      {/* ROOM IMAGES */}
      {/* ========================================================= */}

      <div className="mt-8">
        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Room Images
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
                  alt="Room preview"
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
                  setImages({
                    ...images,
                    [key]: e.target.files?.[0] || null,
                  })
                }
              />
            </label>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* ROOM TYPE + PRICE */}
      {/* ========================================================= */}

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* ROOM TYPE */}

        <div>
          <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Room Type
          </p>

          <select
            value={inputs.roomType}
            onChange={(e) =>
              setInputs({
                ...inputs,
                roomType: e.target.value,
              })
            }
            className="border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-gray-700 rounded-lg p-2.5 w-full text-sm outline-none transition-all"
          >
            <option value="">Select Room Type</option>

            <option value="Single Bed">Single Bed</option>

            <option value="Double Bed">Double Bed</option>

            <option value="Luxury Room">Luxury Room</option>

            <option value="Family Suite">Family Suite</option>
          </select>
        </div>

        {/* PRICE */}

        <div>
          <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Price{" "}
            <span className="text-xs text-gray-400 font-normal">/ night</span>
          </p>

          <input
            type="number"
            min="1"
            placeholder="Enter price per night"
            value={inputs.pricePerNight}
            onChange={(e) =>
              setInputs({
                ...inputs,
                pricePerNight: e.target.value,
              })
            }
            className="border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-gray-700 rounded-lg p-2.5 w-full text-sm outline-none transition-all"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* DESCRIPTION */}
      {/* ========================================================= */}

      <div className="mt-6">
        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Room Description
        </p>

        <textarea
          rows="5"
          placeholder="Describe the room, its features, comfort, design and guest experience..."
          value={inputs.description}
          onChange={(e) =>
            setInputs({
              ...inputs,
              description: e.target.value,
            })
          }
          className="border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-gray-700 rounded-lg p-3 w-full text-sm outline-none transition-all resize-none"
        />
      </div>

      {/* ========================================================= */}
      {/* ROOM SIZE + BED TYPE */}
      {/* ========================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* ROOM SIZE */}

        <div>
          <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Room Size
          </p>

          <input
            type="text"
            placeholder="Example: 450 sq ft"
            value={inputs.roomSize}
            onChange={(e) =>
              setInputs({
                ...inputs,
                roomSize: e.target.value,
              })
            }
            className="border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-gray-700 rounded-lg p-2.5 w-full text-sm outline-none transition-all"
          />
        </div>

        {/* BED TYPE */}

        <div>
          <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Bed Type
          </p>

          <select
            value={inputs.bedType}
            onChange={(e) =>
              setInputs({
                ...inputs,
                bedType: e.target.value,
              })
            }
            className="border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-gray-700 rounded-lg p-2.5 w-full text-sm outline-none transition-all"
          >
            <option value="">Select Bed Type</option>

            <option value="Single Bed">Single Bed</option>

            <option value="Double Bed">Double Bed</option>

            <option value="Queen Bed">Queen Bed</option>

            <option value="King Bed">King Bed</option>

            <option value="Two Double Beds">Two Double Beds</option>
          </select>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW */}
      {/* ========================================================= */}

      <div className="mt-6">
        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Room View
        </p>

        <select
          value={inputs.view}
          onChange={(e) =>
            setInputs({
              ...inputs,
              view: e.target.value,
            })
          }
          className="border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-gray-700 rounded-lg p-2.5 w-full md:w-1/2 text-sm outline-none transition-all"
        >
          <option value="">Select Room View</option>

          <option value="City View">City View</option>

          <option value="Mountain View">Mountain View</option>

          <option value="Ocean View">Ocean View</option>

          <option value="Pool View">Pool View</option>

          <option value="Garden View">Garden View</option>

          <option value="Courtyard View">Courtyard View</option>
        </select>
      </div>

      {/* ========================================================= */}
      {/* AMENITIES */}
      {/* ========================================================= */}

      <div className="mt-8">
        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Amenities
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-gray-600">
          {Object.keys(inputs.amenities).map((amenity, index) => (
            <div key={amenity} className="flex items-center gap-2.5">
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

      {/* ========================================================= */}
      {/* SUBMIT */}
      {/* ========================================================= */}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-lg mt-8 cursor-pointer transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Adding Room..." : "Add Room"}
      </button>
    </form>
  );
}
