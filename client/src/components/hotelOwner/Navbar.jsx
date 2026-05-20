import { UserButton } from "@clerk/react";
import React from "react";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300 ">
      <Link to="/">
        <h1 className="text-4xl font-semibold font-bonheur text-black">
          El Hotel
        </h1>
      </Link>
      <UserButton />
    </div>
  );
}
