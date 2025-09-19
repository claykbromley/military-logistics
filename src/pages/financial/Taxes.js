import './financial.css'
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import { TurboTax, MilTax, MilTaxConsultation } from './Modals';
import IncomeCalculator from './Income-Calculator';

export default function Taxes() {
  const [showBenefit, setShowBenefit] = useState(null);
  const [modal, setModal] = useState(null);

  const handleClick = (value) => {
    setShowBenefit(showBenefit===value ? null : value);
  };

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
        <div style={{textAlign:'center'}}>
          <h1 style={{margin:0}}>Tax and Income Services</h1>
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(0)}>
            <h4>Free Tax Filing through TurboTax {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===0 &&
            <div className='benefit-expanded'>
              <ul>
                <li>Intuit TurboTax provides free tax filing to all Enlisted active duty or reserve personnel.</li>
                <li>Simply enter your military W-2, verify your rank and your TurboTax Military discount will be applied when you file.</li>
              </ul>
              <table>
                <thead>
                  <tr><th style={{width:'40%'}}>Eligible</th><th style={{width:'40%'}}>Ineligible</th></tr>
                </thead>
                <tbody>
                  <tr><td>Active Duty</td><td>Veterans</td></tr>
                  <tr><td>Reservists</td><td>National Guard</td></tr>
                  <tr><td>E1 - E9</td><td>Commissioned Officers</td></tr>
                  <tr><td></td><td>Warrant Officers</td></tr>
                </tbody>
              </table>
              <div className='benefit-links'>
                <button onClick={() => setModal(0)}>File Taxes</button>
                <a href="https://turbotax.intuit.com/personal-taxes/online/military-edition.jsp" target="_blank" rel="noopener noreferrer">
                  {<button>Visit Website</button>}
                </a>
              </div>
              {modal===0 && <TurboTax setModal={setModal} />}
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(1)}>
            <h4>Free Tax Filing through MilTax {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===1 &&
            <div className='benefit-expanded'>
              <ul>
                <li>MilTax provides free software and support for members of the military community.</li>
                <li>Backed by the Defense Department and made exclusively for the military community — with MilTax you can:
                  <ol>
                    <li>Complete your tax return with specialized software that accounts for the complexities of military life</li>
                    <li>Connect with a tax pro</li>
                    <li>File federal and up to three state returns</li>
                  </ol>
                </li>
              </ul>
              <hr />
              <table style={{width:'50%'}}>
                <thead><tr><th>Who is Eligible?</th></tr></thead>
                <tbody>
                  <tr><td style={{border:'1px solid'}}>Active Duty Service Members</td></tr>
                  <tr><td style={{border:'1px solid'}}>National Guard</td></tr>
                  <tr><td style={{border:'1px solid'}}>Dependents</td></tr>
                  <tr><td style={{border:'1px solid'}}>Medically Discharged Service Members and Caretakers</td></tr>
                  <tr><td style={{border:'1px solid'}}>Survivors of Deseased Service Members</td></tr>
                  <tr><td style={{border:'1px solid'}}>Military Academy Cadets/Midshipmen</td></tr>
                  <tr><td style={{border:'1px solid'}}>Foreign Service Members on US Bases</td></tr>
                </tbody>
              </table>
              <div className='benefit-links'>
                <button onClick={() => setModal(1)}>File Taxes</button>
                <button onClick={() => setModal(2)}>Schedule a Consultation</button>
                <a href="https://www.militaryonesource.mil/financial-legal/taxes/miltax-military-tax-services/" target="_blank" rel="noopener noreferrer">
                  {<button>Visit Website</button>}
                </a>
              </div>
              {modal===1 && <MilTax setModal={setModal} />}
              {modal===2 && <MilTaxConsultation setModal={setModal} />}
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(2)}>
            <h4>Income Calculator {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===2 &&
            <div className='benefit-expanded'>
              <IncomeCalculator />
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(3)}>
            <h4>Tax Breaks {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===3 &&
            <div className='benefit-expanded'>
              <h3 style={{textAlign:'center', marginTop:0}}>Tax benefits for oversees service:</h3>
              <div className='benefit-links'>
                <a href="https://www.irs.gov/individuals/military/tax-exclusion-for-combat-service" target="_blank" rel="noopener noreferrer">
                  {<button>IRS Website</button>}
                </a>
              </div>
              <ul style={{marginTop:'16px'}}>
                <li><strong>Tax-free allowances:</strong> Payments for housing, cost of living, moving expenses, and family separation are not taxable.</li>
                <li><strong>Earned Income Tax Credit (EITC):</strong> Non-taxable combat pay can be counted as income when calculating the EITC. This can boost the credit amount for low- and moderate-income service members, leading to a larger refund.</li>
                <li><strong>Moving expense deduction:</strong> Active-duty service members can deduct unreimbursed moving expenses related to a Permanent Change of Station (PCS), a benefit not available to most other taxpayers.</li>
                <li><strong>Capital gains exclusion on home sales:</strong> You can extend the five-year test period for the home sale gain exclusion by up to 10 years. This means you only need to have lived in the home for two of the past 15 years to exclude up to $250,000 (single) or $500,000 (married filing jointly) of gain.</li>
                <li><strong>Student loan interest deduction:</strong> You can deduct interest paid on student loans.</li>
              </ul>
              <hr />

              <h3 style={{textAlign:'center'}}>Tax benefits for combat zones:</h3>
              <div className='benefit-links'>
                <a href="https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/CZ1/" target="_blank" rel="noopener noreferrer">
                  {<button>Designated Combat Zones</button>}
                </a>
              </div>
              <p>If you serve in a designated combat zone, you can exclude certain military pay from your taxable income. These tax breaks apply to the entire month, even if you serve for only part of it.</p>
              <ul>
                <li><strong>Combat pay exclusion:</strong> All military pay for enlisted members and warrant officers is excluded from federal income tax. For commissioned officers, the exclusion is capped at the highest rate of enlisted pay, plus any hostile fire or imminent danger pay.</li>
                <li><strong>Bonus pay exclusion:</strong> Certain bonuses, such as re-enlistment and continuation bonuses, are tax-free if you receive them during the months you serve in a combat zone.</li>
                <li><strong>Hospitalization pay:</strong> Pay received while hospitalized with injuries from combat service is also excluded from taxes.</li>
              </ul>
              <hr />

              <h3 style={{textAlign:'center'}}>Tax deadline extensions</h3>
              <ul>
                <li><strong>Automatic 2-month extension:</strong> Service members stationed outside the United States and Puerto Rico on the standard tax filing date receive an automatic two-month extension to file their return. This is an extension to file, not to pay, so interest may still apply to any tax owed after the normal deadline.</li>
                <li><strong>Combat zone extensions:</strong> For service in a designated combat zone, an automatic extension is provided to file and pay taxes. The deadline is postponed for 180 days after leaving the combat zone, plus the number of days that were left to file when service began. This extension also applies to service members hospitalized due to injuries from combat zone service.</li>
                <li><strong>Spousal extensions:</strong> In a combat zone, the extension also applies to the spouse of the deployed service member.</li>
              </ul>
            </div>
          }
        </div>
      </div>
    </div>
  );
}