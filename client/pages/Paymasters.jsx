import {
  Tabs,
  TabsHeader,
  Tab,
  TabsBody,
  TabPanel,
  Typography,
} from "@material-tailwind/react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import PaymasterItem from "@/components/PaymasterItem";
import { useChainId, useAccount } from "wagmi";
import { useRouter } from "next/router";
import { getPaymasters, getData } from "../lib/tableland";

export function DashboardPage() {
  const [paymasters, setPaymasters] = useState([]);
  const [taken, setTaken] = useState(false);

  useEffect(() => {
    async function fetchPaymasters() {
      const paymastersArray = await getPaymasters(5);
      const objects = [];
      for (const paymaster of paymastersArray) {
        const data = await getData(paymaster.safeMetadata);
        objects.push({ paymaster: paymaster.safeAddress, data: data });
      }
      setPaymasters(objects);
      setTaken(true);
    }

    if (!taken) {
      fetchPaymasters();
      console.log(paymasters);
    }
  }, []);

  return (
    <div>
      <div className="flex flex-col min-h-screen bg-blue-gray-100">
        <Navbar />
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Paymasters</h1>
          {taken && paymasters.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymasters.map((item, index) => (
                <PaymasterItem data={item.data} address={item.paymaster} />
              ))}
            </div>
          )}
        </div>
        <div className="flex-grow"></div>

        <Footer />
      </div>
    </div>
  );
}

export default DashboardPage;
