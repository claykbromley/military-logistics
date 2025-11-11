import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaCog, FaChevronRight } from "react-icons/fa";

const pages = {
  Services: {
    path: "/services",
    items: [
      { name: "Automotive", path: "/automotive" },
      { name: "Financial", path: "/financial" },
      { name: "Legal", path: "/legal" },
      { name: "Medical", path: "/medical" },
      { name: "Transitions", path: "/transitions" },
    ]
  },
  Discount_Database: {
    path: "/discount-database",
    items: []
  },
  Scheduler: {
    path: "/scheduler",
    items: []
  },
  Marketplace: {
    path: "/marketplace",
    items: []
  },
  Contact_US: {
    path: "/contact-us",
    items: []
  }
};

export default function Navbar() {
  const [activeTab, setActiveTab] = useState(null);

  return (
    <nav className="navbar">
      <div className="settings-bar">
        <div>
          <Link href="/" className="logo">
            LOGO
          </Link>
        </div>

        <div className="navbar-header">
          {Object.entries(pages).map(([tab, config]) => (
          <div
          className="menu-container"
            key={tab}
            onMouseEnter={() => setActiveTab(tab)}
            onMouseLeave={() => setActiveTab(null)}
          >

            <div className="tab">
              <Link href={config.path}>
                {tab.replace("_"," ")} {config.items.length?<FaChevronRight className="menu-dropdown"/>:null}
              </Link>
            </div>

            <AnimatePresence>
              {activeTab === tab && config.items.length && (
                <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="menu"
                >
                {config.items.map((item) => (
                  <div className="menu-item-container" key={item.path}>
                    <div className="menu-item">
                      <Link href={item.path}>
                        {item.name}
                      </Link>
                    </div>
                  </div>
                ))}
                </motion.div>
              )}
              </AnimatePresence>
          </div>
          ))}
        </div>

        <div style={{display:"flex"}}>
          <FaCog className="settings" />
          <div className="profile">
            <img
              src="images/pfp.png"
              alt="profile-pic"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
