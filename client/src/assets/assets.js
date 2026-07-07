import appicon from "./appicon.png";
import hotel1 from "./hotel1.jpg";
import hotel2 from "./h.jpg";
import hotel3 from "./hotel3.webp";
import hotel4 from "./hotel5.webp";
import hotel6 from "./hotel6.jpg";
import hotel7 from "./hotel7.jpg";
import hotel8 from "./hotel8.webp";
import offer1 from "./offer1.webp";
import offer2 from "./offer2.webp";
import offer3 from "./offer3.jpg";

export const assets = {
  appicon,
};

export const rooms = [
  {
    _id: 1,
    hotel_name: "The Plaza",
    type: "KingSize Bed",
    image: [hotel1, hotel8, hotel2, hotel3],
    ratings: 4.5,
    hotel_location: "Los Angeles, California, USA",
    price: 3999,
    roomType: "Family suite",
    amenities: [
      {
        name: "Room Service",
        icon: "fa-solid fa-bell-concierge",
      },
      {
        name: "Mountain View",
        icon: "fa-solid fa-mountain",
      },
      {
        name: "Free WiFi",
        icon: "fa-solid fa-wifi",
      },
    ],
  },
  {
    _id: 2,
    hotel_name: "The Plaza",
    type: "KingSize Bed",
    image: [hotel1, hotel8, hotel2, hotel3],
    ratings: 4.5,
    hotel_location: "Los Angeles, California, USA",
    price: 3999,
    roomType: "Family suite",
    amenities: [
      {
        name: "Room Service",
        icon: "fa-solid fa-bell-concierge",
      },
      {
        name: "Mountain View",
        icon: "fa-solid fa-mountain",
      },
      {
        name: "Free WiFi",
        icon: "fa-solid fa-wifi",
      },
    ],
  },
  {
    _id: 3,
    hotel_name: "The Plaza",
    type: "KingSize Bed",
    image: [hotel1, hotel8, hotel2, hotel3],
    ratings: 4.5,
    hotel_location: "Los Angeles, California, USA",
    price: 3999,
    roomType: "Family suite",
    amenities: [
      {
        name: "Room Service",
        icon: "fa-solid fa-bell-concierge",
      },
      {
        name: "Mountain View",
        icon: "fa-solid fa-mountain",
      },
      {
        name: "Free WiFi",
        icon: "fa-solid fa-wifi",
      },
    ],
  },
  {
    _id: 4,
    hotel_name: "The Plaza",
    type: "KingSize Bed",
    image: [hotel1, hotel8, hotel2, hotel3],
    ratings: 4.5,
    hotel_location: "Los Angeles, California, USA",
    price: 3999,
    roomType: "Family suite",
    amenities: [
      {
        name: "Room Service",
        icon: "fa-solid fa-bell-concierge",
      },
      {
        name: "Mountain View",
        icon: "fa-solid fa-mountain",
      },
      {
        name: "Free WiFi",
        icon: "fa-solid fa-wifi",
      },
    ],
  },
  {
    _id: 5,
    hotel_name: "The Plaza",
    type: "KingSize Bed",
    image: [hotel1, hotel8, hotel2, hotel3],
    ratings: 4.5,
    hotel_location: "Los Angeles, California, USA",
    price: 3999,
    roomType: "Family suite",
    amenities: [
      {
        name: "Room Service",
        icon: "fa-solid fa-bell-concierge",
      },
      {
        name: "Mountain View",
        icon: "fa-solid fa-mountain",
      },
      {
        name: "Free WiFi",
        icon: "fa-solid fa-wifi",
      },
    ],
  },
];

export const offers = [
  {
    _id: 1,
    image: offer1,
    offer: 25,
    title: "Summer Escape Package",
    description: "Enjoy a complimentary night and daily breakfast",
    expiry: "Expires Aug 31",
  },
  {
    _id: 2,
    image: offer2,
    offer: 20,
    title: "Romantic Getaway",
    description: "Special couples package including spa treatment",
    expiry: "Expires Aug 31",
  },
  {
    _id: 3,
    image: offer3,
    offer: 30,
    title: "Luxury Retreat",
    description:
      "Book 60 days in advance and save on your stay at any of our luxury properties worldwide.",
    expiry: "Expires Aug 31",
  },
];

export const testimonials = [
  {
    id: 1,
    name: "Tony Stark",
    address: "Barcelona, Spain",
    image:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
    ratings: 5,
    review:
      "I've used many booking platforms before, but none compare to the personalized experience and attention to detail that QuickStay provides. Their curated selection of hotels is unmatched.",
  },
  {
    id: 2,
    name: "Tony Stark",
    address: "Barcelona, Spain",
    image:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
    ratings: 5,
    review:
      "I've used many booking platforms before, but none compare to the personalized experience and attention to detail that QuickStay provides. Their curated selection of hotels is unmatched.",
  },
  {
    id: 3,
    name: "Tony Stark",
    address: "Barcelona, Spain",
    image:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
    ratings: 5,
    review:
      "I've used many booking platforms before, but none compare to the personalized experience and attention to detail that QuickStay provides. Their curated selection of hotels is unmatched.",
  },
];

export const roomCommonData = [
  {
    icon: "fa-solid fa-house",
    title: "Clean & Safe Stay",
    description: "A well-maintained and hygienic space just for you.",
  },

  {
    icon: "fa-solid fa-house-circle-check",
    title: "Enhanced Cleaning",
    description: "This host follows Staybnb's strict cleaning standards.",
  },

  {
    icon: "fa-solid fa-location-dot",
    title: "Excellent Location",
    description: "90% of guests rated the location 5 stars.",
  },

  {
    icon: "fa-solid fa-heart",
    title: "Smooth Check-In",
    description: "100% of guests gave check-in a 5-star rating.",
  },
];

export const hotelDummyData = {
  _id: "67f76393197ac559e4089b72",
  name: "Urbanza Suites",
  address: "Main Road 123 Street , 23 Colony",
  contact: "+0123456789",
  owner: "user_2unqyL4diJFP1E3pIBnasc7w8hP",
  city: "New York",
  createdAt: "2025-04-10T06:22:11.663Z",
  updatedAt: "2025-04-10T06:22:11.663Z",
  __v: 0,
};

export const userDummyData = {
  _id: "user_2unqyL4diJFP1E3pIBnasc7w8hP",
  username: "Abimanyu",
  email: "sdaabimanyu@gmail.com",
  image: "clerk.com b2FkZWQaW1nXZj2N2c5YVpSSEFVYVUxbmVYZ2JkSVVuWnZWSJ9",
  role: "hotelOwner",
  createdAt: "2025-03-25T09:29:16.367Z",
  updatedAt: "2025-04-10T06:34:48.719Z",
  __v: 1,
  recentSearchedCities: ["New York"],
};

export const roomsDummyData = [
  {
    _id: "67f7647c197ac559e4089b96",
    hotel: hotelDummyData,
    roomType: "Double Bed",
    pricePerNight: 399,
    amenities: ["Room Service", "Mountain View", "Pool Access"],
    images: [hotel1, hotel2, hotel3, hotel8],
    isAvailable: true,
    createdAt: "2025-04-10T06:26:04.013Z",
    updatedAt: "2025-04-10T06:26:04.013Z",
    __v: 0,
  },
  {
    _id: "67f76452197ac559e4089b8e",
    hotel: hotelDummyData,
    roomType: "Double Bed",
    pricePerNight: 299,
    amenities: ["Room Service", "Mountain View", "Pool Access"],
    images: [hotel2, hotel3, hotel8, hotel1],
    isAvailable: true,
    createdAt: "2025-04-10T06:25:22.593Z",
    updatedAt: "2025-04-10T06:25:22.593Z",
    __v: 0,
  },
  {
    _id: "67f76406197ac559e4089b82",
    hotel: hotelDummyData,
    roomType: "Double Bed",
    pricePerNight: 249,
    amenities: ["Free WiFi", "Free Breakfast", "Room Service"],
    images: [hotel3, hotel8, hotel1, hotel2],
    isAvailable: true,
    createdAt: "2025-04-10T06:24:06.285Z",
    updatedAt: "2025-04-10T06:24:06.285Z",
    __v: 0,
  },
  {
    _id: "67f763d8197ac559e4089b7a",
    hotel: hotelDummyData,
    roomType: "Single Bed",
    pricePerNight: 199,
    amenities: ["Free WiFi", "Room Service", "Pool Access"],
    images: [hotel8, hotel1, hotel2, hotel3],
    isAvailable: true,
    createdAt: "2025-04-10T06:23:20.252Z",
    updatedAt: "2025-04-10T06:23:20.252Z",
    __v: 0,
  },
];

export const userBookingsDummyData = [
  {
    _id: "67f76839994a731e97d3b8ce",
    user: userDummyData,
    room: roomsDummyData[1],
    hotel: hotelDummyData,
    checkInDate: "2025-04-30T00:00:00.000Z",
    checkOutDate: "2025-05-01T00:00:00.000Z",
    totalPrice: 299,
    guests: 1,
    status: "pending",
    paymentMethod: "Stripe",
    isPaid: false,
    createdAt: "2025-04-10T06:42:01.529Z",
    updatedAt: "2025-04-10T06:43:54.520Z",
    __v: 0,
  },
  {
    _id: "67f76839994a731e97d3b8cf",
    user: userDummyData,
    room: roomsDummyData[1],
    hotel: hotelDummyData,
    checkInDate: "2025-04-30T00:00:00.000Z",
    checkOutDate: "2025-05-01T00:00:00.000Z",
    totalPrice: 299,
    guests: 1,
    status: "pending",
    paymentMethod: "Stripe",
    isPaid: true,
    createdAt: "2025-04-10T06:42:01.529Z",
    updatedAt: "2025-04-10T06:43:54.520Z",
    __v: 0,
  },
];

export const dashboardDummyData = {
  totalBookings: 3,

  totalRevenue: 879,

  bookings: [
    {
      _id: "1",
      user: userDummyData,
      room: roomsDummyData[0],
      totalPrice: 399,
      isPaid: true,
    },

    {
      _id: "2",
      user: userDummyData,
      room: roomsDummyData[1],
      totalPrice: 299,
      isPaid: false,
    },

    {
      _id: "3",
      user: userDummyData,
      room: roomsDummyData[2],
      totalPrice: 249,
      isPaid: true,
    },
  ],
};
