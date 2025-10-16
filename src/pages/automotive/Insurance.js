import './automotive.css'
import { Link } from "react-router-dom";

export default function Overview() {
  return (
    <div className='automotive-page'>
      <div className='services'>
        <div className='option-header'><Link key={"../automotive"} to={"../automotive"}>Automotive Services</Link></div>
        <hr />
        <div className='services-option'><Link key={"../automotive/liscense"} to={"../automotive/liscense"}>Driver's Liscense</Link></div>
        <div className='services-option'><Link key={"../automotive/registration"} to={"../automotive/registration"}>Vehicle Registration</Link></div>
        <div className='services-option'><Link key={"../automotive/loans"} to={"../automotive/loans"}>Auto Loans</Link></div>
        <div className='services-option'><Link key={"../automotive/insurance"} to={"../automotive/insurance"}>Insurance</Link></div>
        <div className='services-option'><Link key={"../automotive/buy-sell"} to={"../automotive/buy-sell"}>Buying/Selling</Link></div>
        <div className='services-option'><Link key={"../automotive/deployment"} to={"../automotive/deployment"}>Deployment</Link></div>
      </div>
      <div className='main'>
      </div>
    </div>
  );
}
