import React, { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { BsGithub } from "react-icons/bs";
import { TfiTwitterAlt } from "react-icons/tfi";
import { TbWorldSearch } from "react-icons/tb";

const navLinks = [
  { text: "Paymasters", href: "/attestations" },
  { text: "Dashboard", href: "/schemas" },
];

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

  const handleLinkClick = (href: any) => {
    router.push(href);
  };



  return (
    <div
      className={`flex ${
        "flex-row"
      } items-center bg-black py-2 border-b mb-3 mx-1px mt-1px`}
    >
      <div
        className={`flex ${
          "flex-col"
        } items-center justify-between w-full lg:w-auto`}
      >
        <img
          src="/logo2.jpeg"
          alt="ZKP Logo"
          onClick={() => handleLinkClick("/")}
          width={100}
          height={50}
          className="rounded-lg cursor-pointer ml-4"
        />
      </div>
      <div
        className={`flex items-center ${"flex-grow justify-center"}`}
      >
        <div
          className={`flex ${"flex-wrap gap-4 ml-14 max-w-screen-xl"}`}
        >
          {navLinks.map((item, index) => (
            <Link key={index} href={item.href}>
              <Button
                onClick={() => handleLinkClick(item.href)}
                size="lg"
                color="white"
                className="hover:bg-gray-200 text-lg p-1 hover:text-black hover:rounded-md mx-1"
              >
                {item.text}
              </Button>
            </Link>
          ))}
        </div>
        {!isMobile && (
          <div className="flex flex-wrap bg-white rounded-md h-8 mt-2 ml-4 lg:mt-0">
            <input
              type="text"
              placeholder="  Search by UID"
              className="rounded-lg bg-white w-32 md:w-48 lg:w-56 mr-2 "
            />
            <TbWorldSearch className="cursor-pointer mt-2 mr-2" />
          </div>
        )}
        {!isMobile && (
          <div className="flex flex-wrap items-center justify-between w-auto  gap-4 ml-4 text-white rounded-md">
            <TfiTwitterAlt
              onClick={() =>
                handleLinkClick("https://twitter.com/TAS_Protocol")
              }
              className="cursor-pointer"
            />
            <BsGithub
              onClick={() => handleLinkClick("https://github.com/nijoe1/TAS/")}
              className="cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;