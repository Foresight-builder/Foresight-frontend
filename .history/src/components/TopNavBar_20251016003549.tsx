import Link from "next/link";
export default function TopNavBar() {
  return (
    <nav className="relative z-10 flex items-center justify-between px-10 py-5">
      <div className="flex items-center">
        <img src="/images/logo.jpg" alt="logo" className="w-8 h-8" />
        <div className="ml-3">
          <h1 className="text-2xl font-semibold">Foresight</h1>
          <span className="text-sm text-black">Trade with confidence</span>
        </div>
      </div>
      <div className="space-x-8 hidden md:flex">
        <a className="hover:text-black" href="#">
          Home
        </a>
        <a className="hover:text-black" href="#">
          Feature
        </a>
        <a className="hover:text-black" href="#">
          Free
        </a>
        <a className="hover:text-black" href="#">
          VIP
        </a>
        <a className="hover:text-black" href="#">
          Sigin in
        </a>
        <Link className="hover:text-black" href="/trending">
          Trending
        </Link>
      </div>
      <button className="px-4 py-2 bg-blue-500 text-black rounded-xl">
        Connect Wallet
      </button>
    </nav>
  );
}
