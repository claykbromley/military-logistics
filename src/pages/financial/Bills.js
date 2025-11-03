import Link from "next/link";

export default function Bills() {

  return (
    <div className='financial-page'>
      <div className='services'>
        <div className='option-header'><Link href={"../financial"}>Financial Services</Link></div>
        <hr />
        <div className='services-option'><Link href={"../financial/investments"}>Investments</Link></div>
        <div className='services-option'><Link href={"../financial/taxes"}>Taxes and Income</Link></div>
        <div className='services-option'><Link href={"../financial/loans"}>Loans</Link></div>
        <div className='services-option'><Link href={"../financial/retirement"}>Retirement</Link></div>
        <div className='services-option'><Link href={"../financial/business"}>Start a Business</Link></div>
        <div className='services-option'><Link href={"../financial/credit"}>Credit</Link></div>
        <div className='services-option'><Link href={"../financial/bills"}>Manage Bills</Link></div>
      </div>
      <div className='main'>
       
      </div>
    </div>
  );
}