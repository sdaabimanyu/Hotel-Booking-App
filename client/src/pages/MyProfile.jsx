import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

export default function MyProfile() {
  const { axios, getToken, user } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    image: "",
    role: "",
  });

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    city: "",
    country: "",
    preferredRoomType: "",
    preferredGuests: 1,
  });

  // FETCH USER PROFILE
  const fetchProfile = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await axios.get("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("PROFILE DATA:", data);

      if (data.success) {
        setUserData({
          username: data.user.username || "",
          email: data.user.email || "",
          image: data.user.image || "",
          role: data.user.role || "",
        });

        setFormData({
          phone: data.user.profile?.phone || "",
          address: data.user.profile?.address || "",
          city: data.user.profile?.city || "",
          country: data.user.profile?.country || "",

          preferredRoomType:
            data.user.bookingPreferences?.preferredRoomType || "",

          preferredGuests: data.user.bookingPreferences?.preferredGuests || 1,
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("FETCH PROFILE ERROR:", error);

      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // HANDLE INPUT CHANGE
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // UPDATE PROFILE
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const token = await getToken();

      const { data } = await axios.put(
        "/api/user/profile",
        {
          ...formData,
          preferredGuests: Number(formData.preferredGuests),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("UPDATE PROFILE RESPONSE:", data);

      if (data.success) {
        toast.success(data.message);

        // Fetch profile again so UI always contains latest database data
        await fetchProfile();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("UPDATE PROFILE ERROR:", error);

      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen pt-36 flex items-center justify-center bg-[#faf9f7]">
        <p className="font-inter text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] pt-32 pb-24 px-4 sm:px-6 md:px-16 lg:px-24">
      <div className="max-w-5xl mx-auto">
        {/* PAGE HEADER */}
        <div className="mb-10">
          <p className="text-xs font-inter font-semibold tracking-[0.2em] uppercase text-slate-400 mb-3">
            Account Settings
          </p>

          <h1 className="font-playfair text-4xl md:text-5xl font-medium text-slate-900">
            My Profile
          </h1>

          <p className="font-inter text-sm text-slate-500 mt-3 max-w-xl leading-relaxed">
            Manage your personal information and booking preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* LEFT PROFILE CARD */}
          <div>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_6px_30px_rgba(0,0,0,0.03)] p-7 lg:sticky lg:top-32">
              {/* PROFILE IMAGE */}
              <div className="flex flex-col items-center text-center">
                {userData.image ? (
                  <img
                    src={userData.image}
                    alt={userData.username}
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-slate-900 text-white flex items-center justify-center text-4xl font-semibold">
                    {userData.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}

                <h2 className="font-playfair text-2xl font-bold text-slate-900 mt-5">
                  {userData.username}
                </h2>

                <p className="font-inter text-sm text-slate-400 mt-1 break-all">
                  {userData.email}
                </p>

                {/* ROLE */}
                <div className="mt-4">
                  <span className="inline-flex px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-inter font-semibold capitalize">
                    {userData.role === "hotelOwner" ? "Hotel Owner" : "Guest"}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 mt-7 pt-6">
                <p className="font-inter text-xs text-slate-400 leading-relaxed text-center">
                  Your account information is securely connected to your
                  authenticated account.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* PERSONAL INFORMATION */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_6px_30px_rgba(0,0,0,0.03)] p-6 md:p-8">
              <div className="mb-7">
                <h2 className="font-playfair text-2xl font-bold text-slate-900">
                  Personal Information
                </h2>

                <p className="font-inter text-sm text-slate-400 mt-1">
                  Update your contact and location information.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PHONE */}
                <div>
                  <label className="block font-inter text-xs font-semibold text-slate-600 mb-2">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition"
                  />
                </div>

                {/* CITY */}
                <div>
                  <label className="block font-inter text-xs font-semibold text-slate-600 mb-2">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition"
                  />
                </div>

                {/* COUNTRY */}
                <div>
                  <label className="block font-inter text-xs font-semibold text-slate-600 mb-2">
                    Country
                  </label>

                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter country"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition"
                  />
                </div>

                {/* ADDRESS */}
                <div>
                  <label className="block font-inter text-xs font-semibold text-slate-600 mb-2">
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* BOOKING PREFERENCES */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_6px_30px_rgba(0,0,0,0.03)] p-6 md:p-8">
              <div className="mb-7">
                <h2 className="font-playfair text-2xl font-bold text-slate-900">
                  Booking Preferences
                </h2>

                <p className="font-inter text-sm text-slate-400 mt-1">
                  Save your preferences for a more convenient booking
                  experience.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ROOM TYPE */}
                <div>
                  <label className="block font-inter text-xs font-semibold text-slate-600 mb-2">
                    Preferred Room Type
                  </label>

                  <select
                    name="preferredRoomType"
                    value={formData.preferredRoomType}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition cursor-pointer"
                  >
                    <option value="">No Preference</option>

                    <option value="Single Bed">Single Bed</option>

                    <option value="Double Bed">Double Bed</option>

                    <option value="Luxury Room">Luxury Room</option>

                    <option value="Family Suite">Family Suite</option>
                  </select>
                </div>

                {/* GUEST COUNT */}
                <div>
                  <label className="block font-inter text-xs font-semibold text-slate-600 mb-2">
                    Preferred Number of Guests
                  </label>

                  <input
                    type="number"
                    name="preferredGuests"
                    min="1"
                    max="20"
                    value={formData.preferredGuests}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3.5 rounded-xl bg-slate-900 text-white font-inter text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-sm"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
