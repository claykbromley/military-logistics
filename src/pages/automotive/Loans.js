import Link from "next/link";

export default function Overview() {
  return (
    <div className='automotive-page'>
      <div className='services'>
        <div className='option-header'><Link href={"/automotive"}>Automotive Services</Link></div>
        <hr />
        <div className='services-option'><Link href={"/automotive/liscense"}>Driver's Liscense</Link></div>
        <div className='services-option'><Link href={"/automotive/registration"}>Vehicle Registration</Link></div>
        <div className='services-option'><Link href={"/automotive/loans"}>Auto Loans</Link></div>
        <div className='services-option'><Link href={"/automotive/insurance"}>Insurance</Link></div>
        <div className='services-option'><Link href={"/automotive/buy-sell"}>Buying/Selling</Link></div>
        <div className='services-option'><Link href={"/automotive/deployment"}>Deployment</Link></div>
      </div>
      <div className='main'>
      </div>
    </div>
  );
}
