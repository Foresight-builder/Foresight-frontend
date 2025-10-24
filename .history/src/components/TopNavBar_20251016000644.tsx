export default function TopNavBar() {
  return (
    <nav className="relative z-10 flex items-center justify-between px-10 py-5">
      <div className="flex items-center">
        <img src="/images/logo.jpg" alt="logo" className="w-8 h-8" />
        <div className="ml-3">
          <h1 className="text-2xl font-semibold">Foresight</h1>
          <span className="text-sm text-gray-500">Trade with confidence</span>
        </div>
      </div>
      <div className="space-x-8 hidden md:flex">
        <a className="hover:text-blue-500" href="#">Home</a>
        <a className="hover:text-blue-500" href="#">Feature</a>
        <a className="hover:text-blue-500" href="#">Free</a>
        <a className="hover:text-blue-500" href="#">VIP</a>
        <a className="hover:text-blue-500" href="#">Sigin in</a>
        <a className="hover:text-blue-500" href="/trending">Trending</a>
      </div>
      <button className="px-4 py-2 bg-blue-500 text-white rounded-xl">Connect Wallet</button>
    </nav>
  );
}