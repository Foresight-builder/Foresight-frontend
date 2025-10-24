export default function TopNavBar() {
  return (
    <nav className="relative z-10 flex items-center justify-between px-10 py-5">
      <div className="flex items-center space-x-2">
        <img src="/images/logo.jpg" alt="logo" className="w-8 h-8" />
        <h1 className="text-xl font-bold text-purple-700">Foresight</h1>
        <span className="text-sm text-gray-500">慈善捐赠平台</span>
      </div>
      <div className="space-x-8 hidden md:flex">
        <a href="#" className="text-purple-600 hover:text-purple-800">
          首页
        </a>
        <a href="/trending" className="hover:text-purple-700">
          Trending
        </a>
        <a href="#" className="hover:text-purple-700">
          受益人
        </a>
        <a href="#" className="hover:text-purple-700">
          About
        </a>
      </div>
      <button className="bg-gradient-to-r from-pink-400 to-purple-500 text-white px-5 py-2 rounded-xl shadow hover:opacity-90">
        连接钱包
      </button>
    </nav>
  );
}
