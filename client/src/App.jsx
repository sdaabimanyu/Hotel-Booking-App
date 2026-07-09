import { useState } from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import AllRooms from "./pages/AllRooms";
import RoomDetails from "./pages/RoomDetails";
import MyBookings from "./pages/MyBookings";
import HotelReg from "./components/HotelReg";
import Layout from "./pages/hotelOwner/Layout";
import Dashboard from "./pages/hotelOwner/Dashboard";
import AddRoom from "./pages/hotelOwner/AddRoom";
import ListRoom from "./pages/hotelOwner/ListRoom";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";
import Loader from "./components/Loader";
import Offers from "./pages/Offers";
import BookingWizard from "./pages/booking/BookingWizard";
import OwnerReviews from "./pages/hotelOwner/Reviews";
import Bookings from "./pages/hotelOwner/Bookings";
import Reviews from "./pages/Reviews";
import EditRoom from "./pages/hotelOwner/EditRoom";
import Analytics from "./pages/hotelOwner/Analytics";
import OwnerOffers from "./pages/hotelOwner/Offers";
import MyProfile from "./pages/MyProfile";
import Favorites from "./pages/Favorites";

function App() {
  const isOwnerPath = useLocation().pathname.includes("owner");
  const { showHotelReg } = useAppContext();

  return (
    <div>
      <Toaster />
      {!isOwnerPath && <Navbar />}

      {showHotelReg && <HotelReg />}

      <div className="min-h-[70vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<AllRooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/loader/:nextUrl" element={<Loader />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/booking/:roomId" element={<BookingWizard />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<MyProfile />} />

          <Route path="/owner" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-room" element={<AddRoom />} />
            <Route path="list-room" element={<ListRoom />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="reviews" element={<OwnerReviews />} />
            <Route path="edit-room/:id" element={<EditRoom />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="offers" element={<OwnerOffers />} />
          </Route>
        </Routes>
      </div>

      {!isOwnerPath && <Footer />}
    </div>
  );
}

export default App;
