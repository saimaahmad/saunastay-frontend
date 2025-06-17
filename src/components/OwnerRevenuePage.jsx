  import React, { useEffect, useState } from "react";
  import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    doc,
    getDoc,
    setDoc,
  } from "firebase/firestore";
  import { onAuthStateChanged } from "firebase/auth";
  import { db, auth } from "../firebase";
import { useTranslation } from "react-i18next";

  const OwnerRevenuePage = () => {
    const [ownerEmail, setOwnerEmail] = useState("");
    const [saunas, setSaunas] = useState([]);
    const [selectedSauna, setSelectedSauna] = useState(null);
  const [revenueView, setRevenueView] = useState("monthly"); // monthly or alltime
    const [ownerRevenue, setOwnerRevenue] = useState(null);
    const [payments, setPayments] = useState([]);
const { t } = useTranslation();




const calculateAndUpdateOwnerTotalRevenue = async (ownerEmail, setOwnerRevenue) => {
  try {
    const paymentsRef = collection(db, "payment");
    const q = query(
      paymentsRef,
      where("saunaOwnerEmail", "==", ownerEmail),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);

    const paymentList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalGrossRevenue = paymentList.reduce(
      (sum, p) => sum + (p.amountPaid || 0),
      0
    );
    const totalPlatformFee = parseFloat((totalGrossRevenue * 0.05).toFixed(2));
    const totalNetRevenue = parseFloat((totalGrossRevenue - totalPlatformFee).toFixed(2));

    const revenueData = {
      ownerEmail,
      totalGrossRevenue,
      totalPlatformFee,
      totalNetRevenue,
      lastUpdated: new Date()
    };

    const revenueDocRef = doc(db, "OwnerRevenue", ownerEmail);
    await setDoc(revenueDocRef, revenueData, { merge: true });
    setOwnerRevenue(revenueData);
  } catch (error) {
    console.error("Failed to calculate and update revenue:", error);
  }
};


const fetchOwnerRevenue = async () => {
  if (!ownerEmail) return;

  const revenueDocRef = doc(db, "OwnerRevenue", ownerEmail);
  const revenueSnap = await getDoc(revenueDocRef);
  if (revenueSnap.exists()) {
    setOwnerRevenue(revenueSnap.data());
  } else {
    setOwnerRevenue(null);
  }
};

useEffect(() => {
  if (ownerEmail) {
    const updateAndFetch = async () => {
      await calculateAndUpdateOwnerTotalRevenue(ownerEmail, setOwnerRevenue);
      await fetchOwnerRevenue(); // Re-fetch after update
    };
    updateAndFetch();
  }
}, [ownerEmail]);



    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) setOwnerEmail(user.email);
        else {
          setOwnerEmail("");
          setSaunas([]);
          setSelectedSauna(null);
          setOwnerRevenue(null);
          setPayments([]);
        }
      });
      return () => unsubscribe();
    }, []);

    useEffect(() => {
      if (!ownerEmail) return;

      const fetchSaunas = async () => {
        const saunasRef = collection(db, "saunas");
        const q = query(saunasRef, where("ownerEmail", "==", ownerEmail));
        const snapshot = await getDocs(q);
        const saunaList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSaunas(saunaList);

        if (saunaList.length > 0) {
          setSelectedSauna(saunaList[0]);
        } else {
          setSelectedSauna(null);
        }
      };

      fetchSaunas();
    }, [ownerEmail]);



   useEffect(() => {
  if (!ownerEmail) return;

  const fetchPayments = async () => {
    const paymentsRef = collection(db, "payment");

    let q;
    if (selectedSauna) {
      q = query(
        paymentsRef,
        where("saunaId", "==", selectedSauna.id),
        orderBy("timestamp", "desc")
      );
    } else {
      q = query(
        paymentsRef,
        where("saunaOwnerEmail", "==", ownerEmail),
        orderBy("timestamp", "desc")
      );
    }

    const snapshot = await getDocs(q);
    const paymentList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPayments(paymentList);

   
  };

  fetchPayments();
}, [ownerEmail, selectedSauna]);


    // Helper to get revenue data based on toggle



const summary = {
  gross: ownerRevenue?.totalGrossRevenue || 0,
  platformFee: ownerRevenue?.totalPlatformFee || 0,
  net: ownerRevenue?.totalNetRevenue || 0,
};


const platformFeeRate = 0.05;


const saunaPayments = payments.filter(p => p.saunaId === selectedSauna?.id);
const grossRevenue = saunaPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
const platformFee = grossRevenue * platformFeeRate;
const netRevenue = grossRevenue - platformFee;


    return (
      <div className="bg-[#f5efe6] min-h-screen p-6 flex flex-col gap-6">
        {/* Top full width total revenue summary with toggle */}
        <section className="bg-[#e2c078] p-8 rounded-lg shadow-md w-full relative">
          <h3 className="text-3xl font-serif text-[#243a26] mb-6 text-left">
    {t("totalRevenue.allSaunas")}
          </h3>


          <div className="flex justify-center gap-8 flex-wrap">
            <div className="w-64 bg-[#fff9e6] shadow-lg rounded-3xl border-2 border-[#d4b85b] p-6 text-center">
            
                <p className="text-base text-gray-700 font-semibold">  {t("revenueT.gross")}</p>
               <p className="text-3xl font-serif text-green-800">
  €{summary.gross.toFixed(2)}
</p>

            
            </div>

            <div className="w-64 bg-[#fff9e6] shadow-lg rounded-3xl border-2 border-[#d4b85b] p-6 text-center">
              
                <p className="text-base text-gray-700 font-semibold">{t("revenueT.platformFee")}(5%)</p>
                <p className="text-3xl font-serif text-red-700">
                  -€{summary.platformFee.toFixed(2)}
                </p>
              
            </div>

            <div className="w-64 bg-[#fff9e6] shadow-lg rounded-3xl border-2 border-[#d4b85b] p-6 text-center">
         
                <p className="text-base text-gray-700 font-semibold">  {t("revenueT.net")}</p>
                <p className="text-3xl font-serif text-blue-800">
                  €{summary.net.toFixed(2)}
                </p>
              
            </div>
          </div>
        </section>

        {/* Below that, left and right panels side by side */}
        <div className="flex gap-6 flex-grow w-full">
          {/* Left Sidebar: Sauna list */}
          <aside className=" w-[320px] bg-[#f3dcb9] rounded-lg p-4 shadow-sm flex flex-col">
            <h2 className="text-xl font-serif mb-6 text-[#243a26]">{t("saunas.title")}</h2>
            <ul className="space-y-3 overflow-y-auto flex-grow">
              {saunas.length > 0 ? (
                saunas.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => setSelectedSauna(s)}
                    className={`cursor-pointer p-3 rounded border transition-all duration-200 ${
                      selectedSauna?.id === s.id
                        ? "bg-[#ebbd83] border-[#b67342] font-serif shadow-md"
                        : "hover:bg-[#e5cdac] border-[#e4c497]"
                    }`}
                  >
                    <div>{s.title}</div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        {s.city}, {s.country}
                      </span>
                      <span>
                        {s.type}, {s.category}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-[#5a5a5a]">{t("saunas.noneFound")}</p>
              )}
            </ul>
          </aside>

          {/* Right panel: Selected sauna revenue and payment details */}
          <main className="flex flex-col flex-grow gap-6">
        

            {/* Selected Sauna Revenue Card */}
            {selectedSauna && (
          <section className="bg-[#ebbd83] p-6 rounded-lg shadow-md w-full border border-gray-100">
    <h3 className="text-2xl font-serif text-gray-900 mb-4 border-b border-gray-100 pb-2">
      🧖 {selectedSauna.title}  {t("revenueT.title")}
    </h3>
    <div className="grid grid-cols-3 gap-6 text-gray-800 font-medium text-lg">
      {/* Gross Revenue */}
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-2 mb-1">
          <div className="p-1 rounded bg-[#e2c078] text-[#243a26]">
            {/* Wallet or cash icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2v-2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 13h6" />
            </svg>
          </div>
          <span className="text-sm text-gray-500 uppercase tracking-wide">  {t("revenue.gross")}</span>
        </div>
        <span className="text-xl font-serif">€{grossRevenue.toFixed(2)}</span>
      </div>

      {/* Platform Fee */}
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-2 mb-1">
          <div className="p-1 rounded bg-[#ebbd83] text-[#b67342]">
            {/* Percentage / fee icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
            </svg>
          </div>
          <span className="text-sm text-gray-500 uppercase tracking-wide">  {t("revenue.platformFee")}</span>
        </div>
        <span className="text-xl font-serif text-red-600">-€{platformFee.toFixed(2)}</span>
      </div>

      {/* Net Revenue */}
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-2 mb-1">
          <div className="p-1 rounded bg-[#243a26] text-[#e2c078]">
            {/* Check / success icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm text-gray-500 uppercase tracking-wide">    {t("revenue.net")}</span>
        </div>
        <span className="text-xl font-serif text-green-700">€{netRevenue.toFixed(2)}</span>
      </div>
    </div>
  </section>

            )}

            {/* Payment List */}
            <section className="overflow-x-auto rounded-lg shadow-sm w-full bg-[#f3dcb9]">
              <table className="w-full border-collapse text-[#243a26]">
                <thead className="bg-[#e2c078]">
                  <tr>
                    <th className="border border-[#bca04a] px-3 py-2 text-left text-sm font-semibold">
                       {t("table.bookingId")}
                    </th>
                    <th className="border border-[#bca04a] px-3 py-2 text-right text-sm font-semibold">
                       {t("table.amountPaid")}
                    </th>
                                    <th className="border border-[#bca04a] px-3 py-2 text-left text-sm font-semibold">
                       {t("table.status")}
                    </th>
                    <th className="border border-[#bca04a] px-3 py-2 text-left text-sm font-semibold">
                  {t("table.date")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? (
                    payments.map((p) => (
                      <tr key={p.id} className="odd:bg-[#f6f1db] even:bg-[#fff9e6]">
                        <td className="border border-[#bca04a] px-3 py-1 text-sm font-mono">
                          {p.bookingId}
                        </td>
                        
                        <td className="border border-[#bca04a] px-3 py-1 text-sm text-right font-semibold">
                          {p.amountPaid.toFixed(2)}
                        </td>
                      
                        <td className="border border-[#bca04a] px-3 py-1 text-sm">
                          {p.status}
                        </td>
                        <td className="border border-[#bca04a] px-3 py-1 text-sm">
                          {p.timestamp
                            ? new Date(p.timestamp.seconds * 1000).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center text-gray-600 py-4 italic text-sm"
                      >
                  {t("table.noPayments")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </main>
        </div>
      </div>
    );
  };

  export default OwnerRevenuePage;
