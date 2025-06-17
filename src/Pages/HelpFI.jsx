import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useState } from "react";

const helpSections = [
  {
    id: "saunaStayIntro",
    title: "🧭 SaunaStay Yleiskatsaus",
    children: [
      { id: "SaunaStay Home", title: "🔎 SaunaStay Etusivu", img: "/images/homeFi.png" },
      { id: "Typefilters", title: "🔎 Saunatyypin Suodattimet", img: "/images/typeFilterFi.png" },
      { id: "Categoryfilters", title: "🔎 Saunakategorian Haku", img: "/images/categorySearchFi.png" },
      { id: "saunaList", title: "🔎 Saunalistaus", img: "/images/allSaunas.png" },
      { id: "saunaViews", title: "🧖 Saunan Yksityiskohdat", img: "/images/saunaDetailPage-fi.png" },
      { id: "saunaJournal", title: "📘 Saunapäiväkirja", img: "/images/saunaJournal.png" },
      { id: "feedbackBot1", title: "📝 Palaute-botti – Valitse rooli", img: "/images/feedbackBot1Fi.png" },
      { id: "feedbackBot2", title: "🤖 Palaute-botti", img: "/images/feedbackBot2Fi.png" }
    ]
  },
  {
    id: "userFlow",
    title: "🧍 Käyttäjän Käyttöpolku",
    children: [
      { id: "signupLogin", title: "🔐 Rekisteröidy / Kirjaudu", img: "/images/signup-fi.png" },
      { id: "googlelogin", title: "🔐 Kirjaudu Googlella", img: "/images/googleSignin.png" },
      { id: "login", title: "🔐 Kirjaudu Sisään", img: "/images/loginFi.png" },
      { id: "userNavbar", title: "🧭 Käyttäjän Navigointi", img: "/images/userNavbarFi.png" },
      { id: "selectSauna", title: "🧖 Näytä Saunan Tiedot", img: "/images/saunaDetail.png" },
      { id: "selectSaunaFi", title: "🧖 Valitse Sauna ja Aikataulu", img: "/images/bookingFi.png" },
      { id: "confirmBooking", title: "✅ Vahvista Varaus -modaali", img: "/images/confirmBookingModal.png" },
      { id: "paymentPage", title: "💳 Maksusivu", img: "/images/PaymentDetail.png" },
      { id: "testStripe", title: "💳 Stripe Testimaksu", img: "/images/testStripe.png" },
      { id: "thankYou", title: "🎉 Kiitossivu", img: "/images/thankyouFi.png" },
      { id: "userDashboard", title: "📋 Hallinnoi Varauksia", img: "/images/manageBookingFi.png" },
      { id: "userDashboard", title: "📋 Päivitä Varaus", img: "/images/userBookingUpdateFi.png" },
      { id: "favorites", title: "❤️ Suosikkisaunat", img: "/images/userFavSaunaFi.png" },
      { id: "Profile", title: "👤 Käyttäjäprofiili", img: "/images/profileFi.png" }
    ]
  },
  {
    id: "addNewSaunaFlow",
    title: "📌 Listaa Uusi Sauna",
    children: [
      { id: "selectType", title: "🏷 Valitse Saunatyyppi", img: "/images/list-type-fi.png" },
        { id: "selectCategory", title: "📂 Valitse Kategoria", img: "/images/list-category-fi.png" },
      { id: "authLogin", title: "🔐 Kirjaudu", img: "/images/loginFi.png" },
      { id: "authSignup", title: "🔐 Rekisteröidy", img: "/images/list-signup-fi.png" },
      { id: "fillInfo", title: "📝 Täytä Saunatiedot", img: "/images/list-info-fi.png" },
      { id: "hours", title: "⏱ Aukioloajat", img: "/images/list-time-fi.png" },
      { id: "location", title: "📍 Sijainti", img: "/images/list-location-fi.png" },
      { id: "images", title: "🖼 Lataa Kuvat", img: "/images/list-image-fi.png" },
      { id: "amenities", title: "🛁 Mukavuudet", img: "/images/list-amenities-fi.png" },
      { id: "security", title: "🔒 Turvallisuus", img: "/images/list-security-fi.png" },
      { id: "listingSuccess", title: "✅ Sauna Julkaistu", img: "/images/list-successfulMessage.png" }
    ]
  },
  {
    id: "ownerFlow",
    title: "🏠 Omistajan Käyttöpolku",
    children: [
      { id: "ownerDashboard", title: "📊 Omistajan Etusivu", img: "/images/ownerDashboardFi.png" },
      { id: "manageSaunas", title: "🛠 Hallinnoi Saunoja", img: "/images/manageSaunaFi.png" },
      { id: "manageAvailability", title: "📆 Saatavuus (Päivä)", img: "/images/manageAvailabilityDayFi.png" },
      { id: "manageAvailabilityMonth", title: "🗓 Saatavuus (Kuukausi)", img: "/images/manageAvailabilityMonthFi.png" },
      { id: "manageBookings", title: "📒 Hallinnoi Varauksia", img: "/images/manageBookingFi.png" },
      { id: "bookingModalOwner", title: "✏️ Muokkaa Varausta", img: "/images/updateBookingRequestOwnerFi.png" },
      { id: "revenue", title: "💰 Tulojen Yhteenveto", img: "/images/ownerRevenueFi.png" },
      { id: "profile", title: "🙍‍♂️ Omistajan Profiili", img: "/images/profileFi.png" }
    ]
  }
];

export default function HelpFI() {
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
            placeholder="Etsi aihetta..."
            className="mb-4 p-2 border rounded w-full"
          />
          {filteredSections.map((section) => (
            <div key={section.id}>
              <h4 className="font-semibold mt-4">{section.title}</h4>
              {section.children.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block text-sm mb-2 text-orange-700 underline hover:text-[#7b8d6d] font-medium transition-colors"
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
