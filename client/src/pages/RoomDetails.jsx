import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StarRating from "../components/StarRating";
import { useAppContext } from "../context/AppContext";
import { roomCommonData } from "../assets/assets";
import toast from "react-hot-toast";
import logo1 from "../assets/logo1.png";

export default function RoomDetails() {
  const { id } = useParams();
  const {
    rooms,
    getToken,
    axios,
    navigate,
    user,
    toggleFavoriteRoom,
    isRoomFavorite,
  } = useAppContext();
  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [guests, setGuests] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);

  const checkAvailability = async () => {
    try {
      if (!checkInDate || !checkOutDate) {
        toast.error("Please select both dates");
        return;
      }
      if (checkInDate >= checkOutDate) {
        toast.error("Check-In Date should be before Check-Out Date");
        return;
      }

      const { data } = await axios.post("/api/bookings/check-availability", {
        room: id,
        checkInDate,
        checkOutDate,
      });

      if (data.success) {
        if (data.isAvailable) {
          setIsAvailable(true);
          toast.success("Room is Available");
        } else {
          setIsAvailable(false);
          toast.error("Room is Not Available");
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      if (!isAvailable) {
        return checkAvailability();
      } else {
        navigate(
          `/booking/${id}?checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}`,
        );
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/reviews/room/${room._id}`);
      if (data.success) {
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!rooms.length) return;
    const foundRoom = rooms.find((room) => room._id === id);
    if (foundRoom) {
      setRoom(foundRoom);
      setMainImage(foundRoom.images?.[0]);
    }
  }, [id, rooms]);

  useEffect(() => {
    if (room) {
      fetchReviews();
    }
  }, [room]);

  const amenityIcons = {
    "Free WiFi": "fa-solid fa-wifi",
    "Free Breakfast": "fa-solid fa-mug-hot",
    "Room Service": "fa-solid fa-bell-concierge",
    "Pool Access": "fa-solid fa-person-swimming",
    "Mountain View": "fa-solid fa-mountain",
  };

  return (
    room && (
      <div className="pt-28 pb-20 md:py-36 px-4 md:px-16 lg:px-24 xl:px-32 bg-slate-50/50 antialiased">
        {/* Header Metadata Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="bg-amber-500/10 text-amber-800 text-[10px] font-bold tracking-widest uppercase font-inter py-1 px-3 rounded-md border border-amber-500/10">
              Limited Offer: 20% OFF
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="font-playfair text-3xl md:text-5xl font-normal text-slate-950 tracking-tight">
                {room.hotel?.name}
                <span className="font-inter text-base font-light text-slate-500 block md:inline md:ml-3 mt-1 md:mt-0">
                  — {room.roomType}
                </span>
              </h1>

              {/* Change the header metadata ratings container row to this: */}
              <div className="flex items-center gap-x-4 mt-3 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  {/* Dynamic Rating Prop */}
                  <StarRating rating={averageRating} />
                  <span className="text-xs font-semibold text-slate-800 ml-1">
                    ({reviews.length}{" "}
                    {reviews.length === 1 ? "Review" : "Reviews"})
                  </span>
                </div>
                <span className="text-slate-300">|</span>
                <p className="flex items-center gap-1.5 text-slate-500 font-light">
                  <i className="fa-solid fa-location-dot text-amber-600 text-xs"></i>{" "}
                  {room.hotel?.address}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t lg:border-none pt-4 lg:pt-0 border-slate-200">
              {/* FAVORITE BUTTON */}
              {user && (
                <button
                  type="button"
                  onClick={() => toggleFavoriteRoom(room._id)}
                  className="w-12 h-12 shrink-0 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
                  aria-label={
                    isRoomFavorite(room._id)
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <i
                    className={`text-xl transition-all duration-200 ${
                      isRoomFavorite(room._id)
                        ? "fa-solid fa-heart text-red-500"
                        : "fa-regular fa-heart text-slate-600"
                    }`}
                  />
                </button>
              )}

              {/* PRICE */}
              <div className="text-left lg:text-right">
                <span className="text-xs text-slate-400 uppercase tracking-widest block font-medium">
                  From Rate
                </span>

                <p className="text-3xl font-inter font-semibold text-slate-950">
                  ${room.pricePerNight}
                  <span className="text-sm font-light text-slate-500 tracking-normal">
                    {" "}
                    / night
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Restored Original Image Sizing Layout */}
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 mt-6">
          <div className="w-full lg:w-1/2">
            <img
              src={mainImage}
              alt="Room Image"
              className="w-full h-full rounded-xl shadow-lg object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
            {room?.images?.length > 1 &&
              room.images.map((image, index) => (
                <img
                  onClick={() => setMainImage(image)}
                  key={index}
                  src={image}
                  alt="Room Image"
                  className={`w-full h-35 rounded-xl shadow-md object-cover cursor-pointer transition ${
                    mainImage === image
                      ? "ring-2 ring-offset-2 ring-amber-600 scale-[0.98]"
                      : "hover:opacity-95"
                  }`}
                />
              ))}
          </div>
        </div>

        {/* Highlights & Booking Module Combo */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16">
          {/* Main Content Info Panel */}
          <div className="col-span-1 lg:col-span-7 space-y-12">
            <div>
              <h3 className="text-2xl md:text-3xl font-playfair font-normal text-slate-950 mb-4">
                Experience Luxury Uncompromised
              </h3>
              <p className="text-slate-600 font-light leading-relaxed font-inter">
                Guests will be allocated on the preferred floors according to
                real-time availability. This beautifully configured space
                features private master suites conveying an authentic city
                resort pulse. Rates dynamically adjust according to occupancy
                profiles; ensure targeted visitor configuration details are
                registered below to obtain accurate pricing metrics for group
                reservations.
              </p>
            </div>

            {/* Elevated Bespoke Amenities Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                Suite Amenities
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {room?.amenities?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2.5 bg-white border border-slate-100 shadow-sm px-4 py-2.5 rounded-xl text-slate-800"
                  >
                    <i
                      className={`${amenityIcons[item] || "fa-solid fa-circle-check"} text-amber-600 text-sm`}
                    />
                    <span className="text-xs font-medium font-inter">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Specifications List */}
            <div className="border-t border-slate-200 pt-10 space-y-6">
              {roomCommonData.map((items, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="p-3 bg-white border border-slate-100 shadow-sm rounded-xl text-slate-700">
                    <i className={`${items.icon} text-lg text-amber-600`}></i>
                  </div>
                  <div>
                    <h5 className="text-base font-medium text-slate-900">
                      {items.title}
                    </h5>
                    <p className="text-sm text-slate-500 font-light mt-0.5">
                      {items.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Desktop Sidebar Booking Widget */}
          <div className="col-span-1 lg:col-span-5">
            <div className="sticky top-32 bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-100/70">
              <h4 className="text-lg font-playfair font-medium text-slate-950 mb-6 pb-4 border-b border-slate-100">
                Reservation Desk
              </h4>

              <form onSubmit={onSubmitHandler} className="space-y-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="CheckInDate"
                    className="text-[10px] font-bold tracking-wider uppercase text-slate-400 font-inter"
                  >
                    Check-In Date
                  </label>
                  <input
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    type="date"
                    id="CheckInDate"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium outline-none focus:border-slate-950 transition-all [color-scheme:light]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="CheckOutDate"
                    className="text-[10px] font-bold tracking-wider uppercase text-slate-400 font-inter"
                  >
                    Check-Out Date
                  </label>
                  <input
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || ""}
                    disabled={!checkInDate}
                    type="date"
                    id="CheckOutDate"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium outline-none focus:border-slate-950 transition-all [color-scheme:light] disabled:opacity-50"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="Guests"
                    className="text-[10px] font-bold tracking-wider uppercase text-slate-400 font-inter"
                  >
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    id="Guests"
                    min={1}
                    max={4}
                    onChange={(e) => setGuests(e.target.value)}
                    value={guests}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium outline-none focus:border-slate-950 transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 bg-slate-950 hover:bg-amber-600 text-white font-medium text-sm tracking-wide py-4 px-6 rounded-xl transition-all duration-300 shadow-md active:scale-[0.99] cursor-pointer"
                >
                  {isAvailable
                    ? "Proceed to Checkout"
                    : "Verify Room Availability"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Enhanced Guest Reviews Section */}
        <div className="max-w-7xl mx-auto border-t border-slate-200 mt-20 pt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-playfair font-normal text-slate-950">
                Guest Experiences
              </h2>
              <p className="text-slate-500 font-light text-sm mt-1">
                Verified reviews from past authentic stays
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-2xl font-semibold text-slate-900">
                ★ {averageRating.toFixed(1)}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                {reviews.length} Total Reviews
              </span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
              <p className="text-slate-400 font-light text-sm">
                No review logs matching this suite profile yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-medium text-slate-950 text-base">
                          {review.userName}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-light mt-0.5">
                          {new Date(review.createdAt).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "long", day: "numeric" },
                          )}
                        </p>
                      </div>
                      <div className="flex gap-0.5 text-xs bg-amber-500/10 px-2 py-1 rounded border border-amber-500/10 text-amber-700 font-semibold">
                        ★ {review.rating}.0
                      </div>
                    </div>
                    <p className="mt-4 text-slate-600 font-light text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High-End Concierge / Host Unit Info */}
        <div className="max-w-7xl mx-auto border-t border-slate-200 pt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={logo1}
              alt="Luxury Hotel Brand Logo"
              className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover border border-slate-200 bg-white p-1 shadow-inner"
            />
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">
                Bespoke Concierge
              </p>
              <h4 className="text-xl font-playfair font-normal text-slate-950 mt-0.5">
                Hosted by {room.hotel?.name}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <StarRating />
                <span>Premium Luxury Host Profile</span>
              </div>
            </div>
          </div>
          <button className="sm:w-auto text-center px-6 py-3 rounded-xl text-slate-900 border border-slate-300 hover:border-slate-950 hover:bg-slate-950 hover:text-white transition-all duration-300 text-sm font-medium tracking-wide bg-white shadow-sm cursor-pointer">
            Contact Concierge Desk
          </button>
        </div>
      </div>
    )
  );
}
