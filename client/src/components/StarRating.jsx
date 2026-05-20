import React from "react";

export default function StarRating({ rating = 4 }) {
  return (
    <div className="flex gap-x-1">
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <i key={index}
            className={`${
              rating > index ? "fa-solid fa-star text-amber-300" : "text-amber-300  fa-regular fa-star"
            }`}
          ></i>
        ))}
    </div>
  );
}
