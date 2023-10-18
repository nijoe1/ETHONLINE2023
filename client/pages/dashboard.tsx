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

import { useChainId, useAccount } from "wagmi";
import { useRouter } from "next/router";

export function DashboardPage({}) {

  return (
    <div>
      <div className="flex flex-col min-h-screen bg-blue-gray-100">
        <Navbar />
      </div>

      <Footer />
    </div>
  );
}
export default DashboardPage;
