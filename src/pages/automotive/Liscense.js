import Link from "next/link";
import ComponentCarousel from "./Carousel";

export default function Overview() {
  const Card1 = () => <div style={{textAlign:'center', padding:'20px'}}>
    <h3>License Renewal While Deployed or Stationed Out-of-State</h3>
    <p>Most states allow active-duty service members (and sometimes spouses) to 
      keep driving on an expired license while deployed or stationed away from home. 
      This extension usually lasts until 30-90 days after returning from active duty.
      Always carry your military ID and orders when driving under an extension.</p>
  </div>;
  const Card2 = () => <div style={{textAlign:'center', padding:'20px'}}>
    <h3>Renewing Remotely</h3>
    <p>You can renew your license online or by mail in most states. 
      Be sure to include proof of military status, such as a copy of your LES or military ID, and 
      follow your home state's DMV instructions. If stationed overseas, renewal can often be done through the state DMV website.</p>
  </div>;
  const Card3 = () => <div style={{textAlign:'center', padding:'20px'}}>
    <h3>Maintaining Home State License Under SCRA</h3>
    <p>The Servicemembers Civil Relief Act (SCRA) allows you to keep your home state 
      driver's license even if you are stationed in another state. 
      This means you don't have to get a new license every time you move.</p>
  </div>;
  const Card4 = () => <div style={{textAlign:'center', padding:'20px'}}>
    <h3>State-by-State Military License Extensions</h3>
    <p>Each state has its own military license policies. Many states extend expiration dates 
      automatically when you show proof of active service. 
      Some issue special “military license” designations. 
      You can check your state DMV's military policy using the map on the Automotive Homepage.</p>
  </div>;
  const Card5 = () => <div style={{textAlign:'center', padding:'20px'}}>
    <h3>After Returning from Deployment</h3>
    <p>If your license expired while you were deployed, most states allow you to renew within 
      30-90 days after returning. Bring a copy of your deployment orders to avoid late fees.</p>
  </div>;

  return (
    <div className='automotive-page'>
      <div className='services'>
        <div className='option-header'><Link href={"../automotive"}>Automotive Services</Link></div>
        <hr />
        <div className='services-option'><Link href={"../automotive/liscense"}>Driver's Liscense</Link></div>
        <div className='services-option'><Link href={"../automotive/registration"}>Vehicle Registration</Link></div>
        <div className='services-option'><Link href={"../automotive/loans"}>Auto Loans</Link></div>
        <div className='services-option'><Link href={"../automotive/insurance"}>Insurance</Link></div>
        <div className='services-option'><Link href={"../automotive/buy-sell"}>Buying/Selling</Link></div>
        <div className='services-option'><Link href={"../automotive/deployment"}>Deployment</Link></div>
      </div>
      <div className='main'>
        <div style={{textAlign:'center'}}>
          <h1 style={{margin:0}}>Driver's Liscense</h1>
          <p style={{marginTop:0}}> Active-duty service members enjoy special privileges when it comes to renewing and maintaining their driver's license.</p>
        </div>
        <div style={{ background: "#f3f4f6", height: "70%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ComponentCarousel items={[Card1, Card2, Card3, Card4, Card5]} />
        </div>
      </div>
    </div>
  );
}
