import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";

import LandingPage from "./pages/LandingPage";

import Automotive from "./pages/automotive/Automotive";
import Liscense from "./pages/automotive/Liscense";
import Registration from "./pages/automotive/Registration";
import AutoLoans from "./pages/automotive/Loans";
import Insurance from "./pages/automotive/Insurance";
import BuySell from "./pages/automotive/Buy-Sell";
import AutoDeployment from "./pages/automotive/Deployment";

import Medical from "./pages/Medical";

import Financial from "./pages/financial/Financial";
import Investments from "./pages/financial/Investments";
import Taxes from "./pages/financial/Taxes";
import Loans from "./pages/financial/Loans";
import Retirement from "./pages/financial/Retirement";
import Business from "./pages/financial/Business";
import Credit from "./pages/financial/Credit";
import Bills from "./pages/financial/Bills";

import Legal from "./pages/Legal";
import Marketplace from "./pages/Marketplace";
import Scheduler from "./pages/Scheduler";
import Services from "./pages/Services";
import Transitions from "./pages/Transitions";
import DiscountDatabase from "./pages/DiscountDatabase";
import ContactUs from "./pages/ContactUs";

export default function App() {
  return (
    <Router>
      <div className="page">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/automotive" element={<Automotive />} />
          <Route path="/automotive/liscense" element={<Liscense />} />
          <Route path="/automotive/registration" element={<Registration />} />
          <Route path="/automotive/loans" element={<AutoLoans />} />
          <Route path="/automotive/insurance" element={<Insurance />} />
          <Route path="/automotive/buy-sell" element={<BuySell />} />
          <Route path="/automotive/deployment" element={<AutoDeployment />} />

          <Route path="/medical" element={<Medical />} />

          <Route path="/financial" element={<Financial />} />
          <Route path="/financial/investments" element={<Investments />} />
          <Route path="/financial/taxes" element={<Taxes />} />
          <Route path="/financial/loans" element={<Loans />} />
          <Route path="/financial/retirement" element={<Retirement />} />
          <Route path="/financial/business" element={<Business />} />
          <Route path="/financial/credit" element={<Credit />} />
          <Route path="/financial/bills" element={<Bills />} />

          <Route path="/legal" element={<Legal />} />
          <Route path="/services" element={<Services />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/scheduler" element={<Scheduler />} />
          <Route path="/transitions" element={<Transitions />} />
          <Route path="/discount_database" element={<DiscountDatabase />} />
          <Route path="/contact_us" element={<ContactUs />} />
        </Routes>
      </div>
    </Router>
  );
}
