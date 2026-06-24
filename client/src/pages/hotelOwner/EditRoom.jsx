import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

export default function EditRoom() {
  const { id } = useParams();

  const { axios, getToken, navigate } = useAppContext();

  const [roomType, setRoomType] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [amenities, setAmenities] = useState("");

  const fetchRoom = async () => {
    try {
      const { data } = await axios.get(`/api/rooms/${id}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      console.log("ROOM DATA:", data);

      if (data.success) {
        setRoomType(data.room.roomType);
        setPricePerNight(data.room.pricePerNight);
        setAmenities(data.room.amenities.join(", "));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, []);

  const updateRoom = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.put(
        `/api/rooms/${id}`,
        {
          roomType,
          pricePerNight,
          amenities: amenities.split(",").map((item) => item.trim()),
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );

      if (data.success) {
        toast.success("Room Updated");
        navigate("/owner/list-room");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-[40px] mb-6">Edit Room</h1>

      <form onSubmit={updateRoom} className="space-y-5">
        <div>
          <label>Room Type</label>
          <input
            type="text"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full border p-3 rounded"
          />
        </div>

        <div>
          <label>Price Per Night</label>
          <input
            type="number"
            value={pricePerNight}
            onChange={(e) => setPricePerNight(e.target.value)}
            className="w-full border p-3 rounded"
          />
        </div>

        <div>
          <label>Amenities</label>
          <input
            type="text"
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            className="w-full border p-3 rounded"
          />
          <p className="text-sm text-gray-500">Separate with commas</p>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          Update Room
        </button>
      </form>
    </div>
  );
}
