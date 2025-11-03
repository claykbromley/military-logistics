import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaCog, FaChevronRight } from "react-icons/fa";

const pages = {
  Services: [
    { name: "Automotive", path: "/automotive" },
    { name: "Financial", path: "/financial" },
    { name: "Legal", path: "/legal" },
    { name: "Medical", path: "/medical" },
    { name: "Transitions", path: "/transitions" },
  ],
  Discount_Database: [],
  Scheduler: [],
  Marketplace: [],
  Contact_US: []
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
          {Object.entries(pages).map(([tab, items]) => (
          <div
          className="menu-container"
            key={tab}
            onMouseEnter={() => setActiveTab(tab)}
            onMouseLeave={() => setActiveTab(null)}
          >

            <div className="tab">
              <Link href={"/" + tab.toLowerCase()}>
                {tab.replace("_"," ")} {items.length?<FaChevronRight className="menu-dropdown"/>:null}
              </Link>
            </div>

            <AnimatePresence>
              {activeTab === tab && items.length && (
                <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="menu"
                >
                {items.map((item) => (
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
