import React, { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const navLinks = [{ text: "Paymasters", href: "/" }];

const Navbar = () => {
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    // Initial call to set isMobile based on window width
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLinkClick = (href) => {
    router.push(href);
  };

  return (
    <div
      className={`flex ${"flex-row"} items-center bg-black py-2 border-b mb-3 mx-1px mt-1px`}
    >
      <div
        className={`flex ${"flex-col"} items-center justify-between w-full lg:w-auto`}
      >
        <img
          src="/logo2.jpeg"
          alt="ZKP Logo"
          onClick={() => handleLinkClick("/")}
          width={200}
          height={100}
          className="rounded-lg cursor-pointer ml-4"
        />
      </div>
      <div className={`flex items-center ${"flex-grow justify-center"}`}>
        <div className={`flex ${"flex-wrap gap-4 ml-14 max-w-screen-xl"}`}>
          {navLinks.map((item, index) => (
            <Link key={index} href={item.href}>
              <Button
                onClick={() => handleLinkClick("/Paymasters")}
                size="lg"
                color="white"
                className="hover:bg-gray-200 bg-gray-300 text-lg p-1 hover:text-black hover:rounded-md mx-1"
              >
                {item.text}
              </Button>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex justify-end lg:w-auto">
        <div className={`mr-4`}>
          <ConnectButton showBalance={true} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
