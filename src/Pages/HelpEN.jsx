import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useState } from "react";

const helpSections = [
  {
    id: "saunaStayIntro",
    title: "🧭 SaunaStay Overview",
    children: [
        { id: "SaunaStay Home", title: "🔎 SaunaStay Home", img: "/images/home.png" },
        { id: "Typefilters", title: "🔎 Sauna Type Filters", img: "/images/typeFilter.png" },
        { id: "Categoryfilters", title: "🔎 Sauna Category Search", img: "/images/categorySearch.png" },
      { id: "saunaList", title: "🔎 Sauna List", img: "/images/allSaunas.png" },
      { id: "saunaViews", title: "🧖 Sauna Detail Views", img: "/images/saunaDetail.png" },
      { id: "saunaJournal", title: "📘 Sauna Journal", img: "/images/saunaJournal.png" },
      { id: "feedbackBot1", title: "📝 Feedback Bot Select Role", img: "/images/feedbackBot1.png" },
      { id: "feedbackBot2", title: "🤖 Feedback Bot", img: "/images/feedbackBot2.png" }
    ]
  },


  { id: "userFlow", title: " Sauna User Flow", children: [
    { id: "signupLogin", title: "🔐 Sign up / Login", img: "/images/signup.png" },
    { id: "googlelogin", title: "🔐Google Log In", img: "/images/googleSignin.png" },
       { id: "login", title: "🔐 Log In", img: "/images/login.png" },
    { id: "userNavbar", title: "🧭 User Navbar", img: "/images/navBar.png" },
     { id: "selectSauna", title: "🧖 View Sauna Details ", img: "/images/saunaDetail.png" },
    { id: "selectSaunaFi", title: "🧖 Select Sauna and Booking Table ", img: "/images/booking.png" },
    { id: "confirmBooking", title: "✅ Confirm Booking Modal", img: "/images/confirmBookingModal.png" },
    { id: "paymentPage", title: "💳 Payment Page", img: "/images/PaymentDetail.png" },
    { id: "testStripe", title: "💳 Stripe Test Payment", img: "/images/testStripe.png" },
    { id: "thankYou", title: "🎉 Thank You Page", img: "/images/thankyou.png" },
       { id: "userDashboard", title: "📋 User Manage Bookings", img: "/images/manageBooking.png" },
      { id: "userDashboard", title: "📋 User Update Booking", img: "/images/userBookingUpdate.png" },
     { id: "favorites", title: "❤️ My Favorites", img: "/images/userFavSauna.png" },
         { id: "Profile", title: "👤 User Profile", img: "/images/profile.png" }
  ]},

   {
    id: "addNewSaunaFlow",
    title: "📌 Add New Sauna Flow",
    children: [
      { id: "selectType", title: "🏷 Select Sauna Type", img: "/images/listsauna-type.png" },
      { id: "selectTypeSelected", title: "🏷 Sauna Type Selected", img: "/images/listSauna-typeSelected.png" },
      { id: "selectCategory", title: "📂 Choose Category", img: "/images/listSauna-CatSelected.png" },
      { id: "authLogin", title: "🔐 Login Step", img: "/images/list-login-fi.png" },
      { id: "authSignup", title: "🔐 Signup Step", img: "/images/list-signup-fi.png" },
      { id: "fillInfo", title: "📝 Fill Sauna Info", img: "/images/list-saunainfo-filled.png" },
       { id: "hours", title: "⏱ Set Operating Hours", img: "/images/list-timmings.png" },
      { id: "location", title: "📍 Set Sauna Location", img: "/images/list-location.png" },
      { id: "images", title: "🖼 Upload Sauna Images", img: "/images/list-image.png" },
      { id: "amenities", title: "🛁 Sauna Amenities", img: "/images/list-amenities.png" },
      { id: "security", title: "🔒 Sauna Security", img: "/images/list-security.png" },
           { id: "listingSuccess", title: "✅ Listing Created", img: "/images/list-successfulMessage.png" }
    ]
  },
  { id: "ownerFlow", title: "🏠 Owner Flow", children: [
    { id: "ownerDashboard", title: "📊 Owner Dashboard", img: "/images/ownerDashboard.png" },
    
    { id: "manageSaunas", title: "🛠 Manage Saunas", img: "/images/manageSauna.png" },
    { id: "manageAvailability", title: "📆 Manage Availability (Day)", img: "/images/manageAvailabilityDay.png" },
    { id: "manageAvailabilityMonth", title: "🗓 Availability (Month)", img: "/images/manageAvailabilityMonth.png" },
    { id: "manageBookings", title: "📒 Manage Bookings", img: "/images/manageBooking.png" },
    { id: "bookingModalOwner", title: "✏️ Owner Booking Update Modal", img: "/images/updateBookingRequestOwner.png" },
    { id: "revenue", title: "💰 Revenue Overview", img: "/images/ownerRevenue.png" },
    { id: "profile", title: "🙍‍♂️ Owner Profile", img: "/images/profile.png" }
  ]}
];

export default function HelpEN() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filteredSections = helpSections.map(section => ({
    ...section,
    children: section.children.filter(child =>
      child.title.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(section => section.children.length > 0);

  return (
    <div className="flex flex-col max-w-7xl mx-auto p-4">
      <Link to="/" className="text-blue-700 underline mb-4">{t("help.back")}</Link>
      <div className="flex">
     <aside className="w-64 pr-6 border-r sticky top-4 h-screen overflow-y-auto">

          <h2 className="text-xl font-bold mb-4">{t("help.title")}</h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topic..."
            className="mb-4 p-2 border rounded w-full"
          />
          {filteredSections.map((section) => (
            <div key={section.id}>
              <h4 className="font-semibold mt-4">{section.title}</h4>
              {section.children.map((sec) => (
                <a
  key={sec.id}
  href={`#${sec.id}`}
  className="block text-sm mb-2 text-orange-700 underline hover:text-[#7b8d6d] hover:underline font-medium transition-colors"
>
  {sec.title}
</a>

              ))}
            </div>
          ))}
        </aside>
        <main className="flex-1 space-y-10 pl-6">
          {filteredSections.flatMap(section => section.children).map(sec => (
       <section
  key={sec.id}
  id={sec.id}
  className="pb-10 mb-10 border-b border-gray-300"
>
  <h3 className="text-2xl font-semibold mb-2">{sec.title}</h3>
  <p className="mb-4">{t(`help.details.${sec.id}`)}</p>
  <img
    src={sec.img}
    alt={sec.title}
    className="w-full max-w-2xl h-auto max-h-[500px] object-contain rounded-lg shadow"
  />
</section>

          ))}
          <div className="mt-12">
            <Link to="/" className="text-blue-700 underline">{t("help.back")}</Link>
          </div>
        </main>
      </div>
    </div>
  );
}