import Link from "next/link";

export default function Home() {
  const pages = [
    { name: "Driver Logins", path: "/driverlogins" },
    { name: "Create New Order", path: "/neworder" },
    { name: "Transfer Order", path: "/transferorder" },
    { name: "Send Notifications", path: "/sendnotification" },
    { name: "Process Driver Payments", path: "/processpayments" },
    { name: "Add Customer", path: "/addcustomer" },
    { name: "Add Driver", path: "/adddriver" },
    { name: "Add Penalty", path: "/addpenalty" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-12">
          Manager Panel
        </h1>
        <nav className="bg-white shadow-lg rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {pages.map((page) => (
              <li key={page.path}>
                <Link
                  href={page.path}
                  className="block px-6 py-4 hover:bg-gray-50 transition duration-150 ease-in-out"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-900">
                      {page.name}
                    </span>
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
