import Link from "next/link";

export default function NavBar() {
  return (
    <nav
      className="flex justify-between items-center h-16 bg-white text-black dark:bg-gray-900 dark:text-white relative shadow-sm font-mono"
      role="navigation"
    >
      <Link href="/" className="pl-8">
        Logo
      </Link>
      <div className="px-4 cursor-pointer md:hidden">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </div>
      <div className="pr-8 md:block hidden">
        <Link
          href="/"
          className="p-4 hover:text-gray-500 dark:hover:text-gray-300"
        >
          Home
        </Link>
        <Link
          href="/events"
          className="p-4 hover:text-gray-500 dark:hover:text-gray-300"
        >
          Events
        </Link>
        {/* <Link
          href="/"
          className="p-4 hover:text-gray-500 dark:hover:text-gray-300"
        >
          Services
        </Link>
        <Link
          href="/"
          className="p-4 hover:text-gray-500 dark:hover:text-gray-300"
        >
          Contact
        </Link> */}
      </div>
    </nav>
  );
}
