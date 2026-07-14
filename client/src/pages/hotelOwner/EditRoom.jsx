import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

export default function EditRoom() {
  const { id } = useParams();

  const { axios, getToken, navigate } = useAppContext();

  // =========================================================
  // ROOM FORM STATE
  // =========================================================

  const [roomType, setRoomType] = useState("");
  const [description, setDescription] = useState("");
  const [roomSize, setRoomSize] = useState("");
  const [bedType, setBedType] = useState("");
  const [view, setView] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [amenities, setAmenities] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // =========================================================
  // FETCH ROOM
  // =========================================================

  const fetchRoom = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await axios.get(`/api/rooms/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        const room = data.room;

        setRoomType(room.roomType || "");
        setDescription(room.description || "");
        setRoomSize(room.roomSize || "");
        setBedType(room.bedType || "");
        setView(room.view || "");
        setPricePerNight(room.pricePerNight || "");

        setAmenities(
          Array.isArray(room.amenities) ? room.amenities.join(", ") : "",
        );
      } else {
        toast.error(data.message || "Failed to load room");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to load room",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH ROOM ON PAGE LOAD
  // =========================================================

  useEffect(() => {
    fetchRoom();
  }, [id]);

  // =========================================================
  // UPDATE ROOM
  // =========================================================

  const updateRoom = async (e) => {
    e.preventDefault();

    // =========================================================
    // BASIC VALIDATION
    // =========================================================

    if (
      !roomType.trim() ||
      !description.trim() ||
      !roomSize.trim() ||
      !bedType.trim() ||
      !view.trim() ||
      !pricePerNight
    ) {
      return toast.error("Please fill all required room details");
    }

    const roomPrice = Number(pricePerNight);

    if (Number.isNaN(roomPrice) || roomPrice <= 0) {
      return toast.error("Please enter a valid room price");
    }

    // =========================================================
    // PREPARE AMENITIES
    // =========================================================

    const formattedAmenities = amenities
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (formattedAmenities.length === 0) {
      return toast.error("Please provide at least one amenity");
    }

    try {
      setUpdating(true);

      const token = await getToken();

      const { data } = await axios.put(
        `/api/rooms/${id}`,
        {
          roomType: roomType.trim(),
          description: description.trim(),
          roomSize: roomSize.trim(),
          bedType: bedType.trim(),
          view: view.trim(),
          pricePerNight: roomPrice,
          amenities: formattedAmenities,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message || "Room updated successfully");

        navigate("/owner/list-room");
      } else {
        toast.error(data.message || "Failed to update room");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update room",
      );
    } finally {
      setUpdating(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Loading room details...</p>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="max-w-3xl">
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
          Edit Room
        </h1>

        <p className="text-gray-500 mt-2">
          Update room information, pricing, descriptions, and amenities.
        </p>
      </div>

      {/* ===================================================== */}
      {/* FORM */}
      {/* ===================================================== */}

      <form
        onSubmit={updateRoom}
        className="bg-white border border-gray-200 rounded-xl p-6 space-y-6"
      >
        {/* =================================================== */}
        {/* ROOM TYPE */}
        {/* =================================================== */}

        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Room Type
          </label>

          <input
            type="text"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            placeholder="Example: Deluxe Room"
            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
          />
        </div>

        {/* =================================================== */}
        {/* DESCRIPTION */}
        {/* =================================================== */}

        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Room Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter detailed room description"
            rows={5}
            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* =================================================== */}
        {/* ROOM SIZE + BED TYPE */}
        {/* =================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Room Size
            </label>

            <input
              type="text"
              value={roomSize}
              onChange={(e) => setRoomSize(e.target.value)}
              placeholder="Example: 450 sq ft"
              className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Bed Type
            </label>

            <input
              type="text"
              value={bedType}
              onChange={(e) => setBedType(e.target.value)}
              placeholder="Example: King Bed"
              className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* =================================================== */}
        {/* VIEW + PRICE */}
        {/* =================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Room View
            </label>

            <input
              type="text"
              value={view}
              onChange={(e) => setView(e.target.value)}
              placeholder="Example: Ocean View"
              className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Price Per Night
            </label>

            <input
              type="number"
              min="1"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
              placeholder="Enter room price"
              className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* =================================================== */}
        {/* AMENITIES */}
        {/* =================================================== */}

        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Amenities
          </label>

          <input
            type="text"
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            placeholder="WiFi, Air Conditioning, TV, Breakfast"
            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-blue-500"
          />

          <p className="text-sm text-gray-500 mt-2">
            Separate each amenity with a comma.
          </p>
        </div>

        {/* =================================================== */}
        {/* BUTTONS */}
        {/* =================================================== */}

        <div className="flex flex-col sm:flex-row gap-3 pt-3">
          <button
            type="submit"
            disabled={updating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition"
          >
            {updating ? "Updating Room..." : "Update Room"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/owner/list-room")}
            disabled={updating}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
