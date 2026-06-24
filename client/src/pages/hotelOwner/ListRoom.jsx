import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";

export default function ListRoom() {
  const [rooms, setRooms] = useState();
  const { axios, getToken, user, currency, navigate } = useAppContext();
  // const navigate = useNavigate();

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
    const { data } = await axios.post(
      "/api/rooms/toggle-availability",
      { roomId },
      { headers: { Authorization: `Bearer ${await getToken()} ` } },
    );
    if (data.success) {
      toast.success(data.message);
      fetchRooms();
    } else {
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
    <div>
      <h1 className=" text-[40px] ">List Room</h1>
      <p className="text-gray-500/90 text-[16px] max-w-2xl ">
        View, edit, or manage all listed rooms. Keep the information up-to-date
        to provide the best experience for users.
      </p>
      <div className="w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-auto mt-8">
        <table className="w-full">
          <thead>
            <tr>
              <th className="py-3 px-4 text-gray-800 font-medium">Name</th>
              <th className="py-3 px-4 text-gray-800 font-medium max-sm:hidden">
                Facility
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium ">
                Price / night
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rooms?.map((room, index) => (
              <tr key={index}>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                  {room.roomType}
                </td>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden">
                  {room.amenities.join(",")}{" "}
                </td>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                  {currency}
                  {room.pricePerNight}
                </td>
                <td className="py-3 px-4 border-t border-gray-300">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/owner/edit-room/${room._id}`)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteRoomHandler(room._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        onChange={() => toggleAvailability(room._id)}
                        type="checkbox"
                        className="sr-only peer"
                        checked={room.isAvailable}
                      />

                      <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600"></div>

                      <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></span>
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
