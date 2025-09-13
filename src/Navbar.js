import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaCog, FaChevronRight } from "react-icons/fa";
import './Navbar.css';

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
          <Link key={"/"} to={"/"}
            className="logo">
            {"LOGO"}
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
              <Link key={"/" + tab} to={"/" + tab}>
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
                  <div className="menu-item-container">
                    <div className="menu-item">
                      <Link
                      key={item.path}
                      to={item.path}
                      >
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
