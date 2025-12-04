import Link from "next/link";

export default function Transitions() {
  return (
    <div className='financial-page'>
      <div className='services'>
        <div className='option-header'><Link href="/transitions">Transition Checklists</Link></div>
        <hr />
        <div className='services-option'><Link href="/transitions/deployment">Deployment</Link></div>
        <div className='services-option'><Link href="/transitions/pcs">PCS</Link></div>
        <div className='services-option'><Link href="/transitions/joining">Joining the Military</Link></div>
        <div className='services-option'><Link href="/transitions/retirement">Retirement</Link></div>
      </div>
      <div className='main'>
        
      </div>
    </div>
  );
}
