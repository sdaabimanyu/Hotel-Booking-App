import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

export default function ListRoom() {
  const [rooms, setRooms] = useState([]);
  const { axios, getToken, user, currency, navigate } = useAppContext();

  // Fetch Rooms of the Hotel Owner
  const fetchRooms = async () => {
    try {
      const { data } = await axios.get("/api/rooms/owner", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setRooms(data.rooms);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Toggle Availability of the Room
  const toggleAvailability = async (roomId) => {
    try {
      const { data } = await axios.post(
        "/api/rooms/toggle-availability",
        { roomId },
        { headers: { Authorization: `Bearer ${await getToken()}` } },
      );
      if (data.success) {
        toast.success(data.message);
        fetchRooms();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteRoomHandler = async (roomId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this room?",
    );

    if (!confirmDelete) return;

    try {
      const { data } = await axios.delete(`/api/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        toast.success(data.message);
        fetchRooms();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
        List Room
      </h1>
      <p className="text-gray-500 text-sm mt-2 max-w-2xl leading-relaxed">
        View, edit, or manage all listed rooms. Keep the information up-to-date
        to provide the best experience for users.
      </p>

      {/* Styled Grid Table Layout Container */}
      <div className="w-full bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden mt-8 flex flex-col">
        {/* Table Headings Wrapper */}
        <div className="grid grid-cols-3 sm:grid-cols-4 bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-6 text-left">
          <div>Name</div>
          <div className="max-sm:hidden sm:col-span-1">Facility</div>
          <div className="text-left">Price / night</div>
          <div className="text-center">Actions</div>
        </div>

        {/* Scrollable Container Area */}
        <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
          {!rooms || rooms.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No rooms listed yet.
            </div>
          ) : (
            rooms.map((room, index) => (
              <div
                key={index}
                className="grid grid-cols-3 sm:grid-cols-4 items-center py-4 px-6 hover:bg-gray-50/50 transition-colors text-sm text-gray-700"
              >
                <div className="font-medium text-gray-800 pr-2 truncate">
                  {room.roomType}
                </div>
                <div className="text-gray-500 max-sm:hidden pr-4 truncate">
                  {room.amenities ? room.amenities.join(", ") : "None"}
                </div>
                <div className="font-semibold text-gray-800">
                  {currency}
                  {room.pricePerNight}
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => navigate(`/owner/edit-room/${room._id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteRoomHandler(room._id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                  >
                    Delete
                  </button>

                  {/* Switch Toggle Input Control */}
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      onChange={() => toggleAvailability(room._id)}
                      type="checkbox"
                      className="sr-only peer"
                      checked={room.isAvailable}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-100 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
