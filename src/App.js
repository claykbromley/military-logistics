import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { motion } from "framer-motion";

const pages = {
  Home: [
    { name: "Overview", path: "/overview" },
    { name: "Updates", path: "/updates" },
  ],
  Services: [
    { name: "Consulting", path: "/consulting" },
    { name: "Development", path: "/development" },
  ],
  About: [
    { name: "Team", path: "/team" },
    { name: "Contact", path: "/contact" },
  ],
};

function Navbar() {
  const [activeTab, setActiveTab] = useState(null);

  return (
    <div className="flex bg-gray-900 text-white p-4 shadow-md">
      {Object.entries(pages).map(([tab, items]) => (
        <div
          key={tab}
          className="relative mx-4"
          onMouseEnter={() => setActiveTab(tab)}
          onMouseLeave={() => setActiveTab(null)}
        >
          <button className="hover:text-gray-300 font-medium">{tab}</button>
          {activeTab === tab && (
            <motion.div
              className="absolute top-10 left-0 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-4 py-2 hover:bg-gray-100 whitespace-nowrap"
                >
                  {item.name}
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

function Page({ title }) {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-gray-600">Welcome to the {title} page.</p>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="p-12 text-center">
      <h1 className="text-4xl font-extrabold mb-6">Welcome to Our Website</h1>
      <p className="text-lg text-gray-700 max-w-2xl mx-auto">
        Explore our services, learn more about our team, and stay up to date with the latest updates. Use the navigation above to get started.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {Object.values(pages).flat().map((item) => (
            <Route
              key={item.path}
              path={item.path}
              element={<Page title={item.name} />}
            />
          ))}
        </Routes>
      </div>
    </Router>
  );
}
