import './financial.css'
import { Link } from "react-router-dom";

export default function Business() {

  return (
    <div className='financial-page'>
      <div className='services'>
        <h3>Financial Services</h3>
        <hr />
        <div className='services-option'><Link key={"../financial/investments"} to={"../financial/investments"}>Investments</Link></div>
        <div className='services-option'><Link key={"../financial/taxes"} to={"../financial/taxes"}>Taxes and Income</Link></div>
        <div className='services-option'><Link key={"../financial/loans"} to={"../financial/loans"}>Loans</Link></div>
        <div className='services-option'><Link key={"../financial/retirement"} to={"../financial/retirement"}>Retirement</Link></div>
        <div className='services-option'><Link key={"../financial/business"} to={"../financial/business"}>Start a Business</Link></div>
        <div className='services-option'><Link key={"../financial/credit"} to={"../financial/credit"}>Credit</Link></div>
        <div className='services-option'><Link key={"../financial/bills"} to={"../financial/bills"}>Manage Bills</Link></div>
      </div>
      <div className='main'>
       
      </div>
    </div>
  );
}