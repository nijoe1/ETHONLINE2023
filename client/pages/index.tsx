import { Navbar } from "@/components/layout";
import Footer from "@/components/Footer"; // Import the Footer component
import Link from "next/link";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();


  const handleLinkClick = (href: any) => {
    router.push(href);
  };

  const links = [
    {
      title: "Safe",
      description:
        "Tableland is an open source, permissionless cloud database built on SQLite. Read and write tamperproof data from apps, data pipelines, or EVM smart contracts.",
      href: "https://tableland.xyz/",
    },
    {
      title: "Sismo",
      description:
        "Filecoin is making the web more secure and efficient with a decentralized data storage marketplace, protocol, and cryptocurrency.",
      href: "https://filecoin.io/",
    },
    {
      title: "Gelato",
      description:
        "Store Files Permanently. Perpetual storage powered by decentralized web. Easily store and secure your data.",
      href: "https://www.lighthouse.storage/",
    },
  ];
  const style = {
    height: 1000,
  };

  return (
    <div className={`flex flex-col min-h-screen bg-blue-gray-100`}>
      <Navbar />
      <div className="flex flex-col ">
        <div className="flex flex-col items-center">
          <section className="w-full">
            <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center sm:py-32 sm:px-10 lg:px-32 xl:max-w-3xl">
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl text-black ">
                Welcome to ZKSafePaymaster
              </h1>
              <p className="px-8 mt-6 mb-12 text-lg text-gray-600  ">
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => handleLinkClick("/schemas")}
                  className="px-8 py-3 m-2 text-lg font-semibold rounded-md bg-black text-white hover:bg-white hover:text-black transition duration-300"
                >
                  Get Started
                </button>
                <button
                  onClick={() =>
                    handleLinkClick("https://github.com/nijoe1/tas")
                  }
                  className="px-8 py-3 m-2 text-lg border rounded-md hover:bg-black hover:text-white transition duration-300"
                >
                  Source Code
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
      <main className="flex flex-col items-center justify-between p-24">
        <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left mt-24 lg:mt-0">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100"
              rel="noopener noreferrer"
            >
              <h2 className={`mb-3 text-2xl font-semibold`}>
                {link.title}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                 
                </span>
              </h2>
              <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <div className="flex-grow"></div>
      <Footer />
    </div>
  );
}
