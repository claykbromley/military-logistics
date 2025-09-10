import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";

// Import individual pages
import LandingPage from "./pages/LandingPage";
import Automotive from "./pages/Automotive";
import Medical from "./pages/Medical";
import Financial from "./pages/Financial";
import Legal from "./pages/Legal";
import Marketplace from "./pages/Marketplace";
import Scheduler from "./pages/Scheduler";
import Services from "./pages/Services";
import Transitions from "./pages/Transitions";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/automotive" element={<Automotive />} />
          <Route path="/medical" element={<Medical />} />
          <Route path="/financial" element={<Financial />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/services" element={<Services />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/scheduler" element={<Scheduler />} />
          <Route path="/transitions" element={<Transitions />} />
        </Routes>
      </div>
    </Router>
  );
}
