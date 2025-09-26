import './financial.css'
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import { NMCRS } from './Modals';

export default function Loans() {
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
          <h1 style={{margin:0}}>Loan and Debt Relief Benefits</h1>
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(0)}>
            <h4>Servicemembers Civil Relief Act (SCRA) {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===0 &&
            <div className='benefit-expanded'>
              <p style={{marginTop:0}}>SCRA provides a range of financial and legal protections to service members on active duty, helping reduce stress and hardship while they serve.</p>
              <h3>Financial Protections</h3>
              <ul>
                <li><strong>Interest Rate Cap:</strong> Limits interest on pre-service debts, like credit cards, mortgages, auto loans, to 6% per year during active duty.</li>
                <li><strong>Protection from Foreclosure & Repossession:</strong> Prevents foreclosure on a home or repossession of property without a court order while on active duty.</li>
                <li><strong>Lease Termination Rights:</strong> Allows early termination of housing leases and vehicle leases if called to active duty or deployed for 90+ days.</li>
                <li><strong>Eviction Protection:</strong> Prevents eviction without a court order if monthly rent is below a set threshold.</li>
                <li><strong>Adverse Credit Actions:</strong> Creditors can't report negative actions (like lease termination under SCRA) as defaults.</li>
                <li><strong>Tax Relief:</strong> Protects against double taxation by allowing members to retain their state of legal residence for tax purposes, even when stationed elsewhere.</li>
              </ul>
              <h3>Legal Protections</h3>
              <ul>
                <li><strong>Stay of Civil Proceedings:</strong> Courts must postpone civil actions (lawsuits, bankruptcy, divorce proceedings, etc.) if military service materially affects the member's ability to appear.</li>
                <li><strong>Default Judgment Protection:</strong> Courts cannot enter a default judgment without confirming the service member’s military status and appointing an attorney if needed.</li>
              </ul>
              <table style={{width:'50%'}}>
                <thead><tr><th>Who is Eligible?</th></tr></thead>
                <tbody>
                  <tr><td>Active Duty Service Members</td></tr>
                  <tr><td>National Guard on Federal Orders {'>'} 30 days</td></tr>
                  <tr><td>Dependents</td></tr>
                  <tr><td>Commissioned Officers of the PHS and NOAA</td></tr>
                </tbody>
              </table>
              <div className='benefit-links'>
                <a href="/documents/SCRA_User_Guide.pdf" target="_blank" rel="noopener noreferrer">
                  {<button>User Guide</button>}
                </a>
                <a href="https://scra.dmdc.osd.mil/scra/#/home" target="_blank" rel="noopener noreferrer">
                  {<button>Visit Website</button>}
                </a>
              </div>
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(1)}>
            <h4>USAA Loan Options {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===1 &&
            <div className='benefit-expanded'>
              <ul>
                <li>Flexible terms and competitive rates (especially for those with good credit).</li>
                <li>No prepayment fees typically, so you can pay off early without penalty.</li>
                <li>Multiple loan types (auto, home, personal) under one financial institution, integrating well with other services (banking, insurance, etc.).</li>
                <li>VA mortgages are supported, which are especially beneficial for those who qualify.</li>
              </ul>
              <table style={{width:'80%'}}>
                <thead><tr>
                  <th>Loan Type</th>
                  <th>Purpose</th>
                  <th>Key Features</th>
                </tr></thead>
                <tbody>
                  <tr>
                    <td>
                      <a href="https://www.usaa.com/banking/loans/auto/" target="_blank" rel="noopener noreferrer">
                        {<button>Auto Loans</button>}
                      </a>
                    </td>
                    <td>Loans to buy new or used vehicles</td>
                    <td>USAA offers financing terms up to 84 months on new and used auto loans (for certain model years) under good credit.</td>
                  </tr>
                  <tr>
                    <td>
                      <a href="https://www.usaa.com/banking/loans/personal/" target="_blank" rel="noopener noreferrer">
                        {<button>Personal Loans</button>}
                      </a>
                    </td>
                    <td>Unsecured loans for general use</td>
                    <td>USAA has fixed‐rate personal loans. Rates depend on creditworthiness. No application or early repayment (prepayment) fees.</td>
                  </tr>
                  <tr>
                    <td>
                      <a href="https://www.usaa.com/banking/home-mortgages/purchase/" target="_blank" rel="noopener noreferrer">
                        {<button>Home Mortgages</button>}
                      </a>
                    </td>
                    <td>Purchase, refinance, etc.</td>
                    <td>USAA offers many mortgage types: conventional, FHA, VA, jumbo, etc. They also help with VA home loans (no down payment required when eligible).</td>
                  </tr>
                  <tr>
                    <td>
                      <a href="https://www.usaa.com/banking/home-mortgages/refinance/" target="_blank" rel="noopener noreferrer">
                        {<button>Refinancing Options</button>}
                      </a>
                    </td>
                    <td>Lowering your rate or changing the structure of an existing mortgage</td>
                    <td>USAA handles conventional refi, VA cash-out, etc.</td>
                  </tr>
                  <tr>
                    <td>
                      <a href="https://www.usaa.com/inet/wc/career-starter-loan/" target="_blank" rel="noopener noreferrer">
                        {<button>Career Starter Loans</button>}
                      </a>
                    </td>
                    <td>For early career members / when beginning service or training</td>
                    <td>USAA has “Career Starter Loan” targeted at personnel starting out to provide access to funds at reasonable rates.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(2)}>
            <h4>NFCU Loan Options {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===2 &&
            <div className='benefit-expanded'>
              <table style={{width:'80%'}}>
                <thead><tr>
                  <th>Loan Type</th>
                  <th>Purpose</th>
                  <th>Key Features</th>
                </tr></thead>
                <tbody>
                  <tr>
                    <td>
                      <a href="https://www.navyfederal.org/loans-cards/personal-loans.html" target="_blank" rel="noopener noreferrer">
                        {<button>Personal Expense Loans</button>}
                      </a>
                    </td>
                    <td>Unsecured funds for things like moving expenses, auto repairs, etc.</td>
                    <td>Loan amounts from $250 to $50,000. Fixed rate. No origination or prepayment fees. APRs “as low as ~8.99%” for shorter terms.</td>
                  </tr>
                  <tr>
                    <td>
                      <a href="https://www.navyfederal.org/loans-cards/personal-loans.html" target="_blank" rel="noopener noreferrer">
                        {<button>Home Improvement Loans</button>}
                      </a>
                    </td>
                    <td>Funds for remodeling, repairs, upgrades</td>
                    <td>Available for longer terms depending on amount. Some require minimum loan amounts.</td>
                  </tr>
                  <tr>
                    <td>
                      <a href="https://www.navyfederal.org/loans-cards/personal-loans.html" target="_blank" rel="noopener noreferrer">
                        {<button>Debt Consolidation Loans</button>}
                      </a>
                    </td>
                    <td>Combine multiple high-interest debts into one loan</td>
                    <td>Helps simplify payments; offers fixed payment and competitive rate.</td>
                  </tr>
                  <tr>
                    <td>
                      <a href="https://www.navyfederal.org/loans-cards/personal-loans.html" target="_blank" rel="noopener noreferrer">
                        {<button>Savings-Secured / Certificate-Secured Loans</button>}
                      </a>
                    </td>
                    <td>Use your savings or certificates as collateral to get lower rates</td>
                    <td>Because it's secured, interest rate is lower (share rate + small margin) and your collateral still earns dividends.</td>
                  </tr>
                  <tr>
                    <td>
                      <a href="https://www.navyfederal.org/membership/offers-discounts/military-loan-discounts.html" target="_blank" rel="noopener noreferrer">
                        {<button>Auto Loans</button>}
                      </a>
                    </td>
                    <td>For buying vehicles or refinancing existing auto loans</td>
                    <td>Military members and retirees get APR discounts on select vehicle loans.</td>
                  </tr>
                  <tr>
                    <td>
                      <a href="https://www.navyfederal.org/makingcents/home-ownership/mortgage-options-military-members.html" target="_blank" rel="noopener noreferrer">
                        {<button>Home Mortgages</button>}
                      </a>
                    </td>
                    <td>Mortgages with features suited to military service, and alternative options if VA eligibility/utilization is limited</td>
                    <td>VA Loans, or Military Choice Loans when VA benefit is used up or ineligible, similar benefits.</td>
                  </tr>
                  <tr>
                    <td>
                      <a href="https://www.navyfederal.org/membership/rotc-ocs.html" target="_blank" rel="noopener noreferrer">
                        {<button>Career Kickoff Loan</button>}
                      </a>
                    </td>
                    <td>For pre-commissioning people (ROTC, OCS, Academies, etc.)</td>
                    <td>Up to $25,000, low APR (~2.99%) for 60 months. Also deferred payment options until after commissioning or a set period. Helps with uniforms, housing setup, etc.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(3)}>
            <h4>VA Home Loans {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===3 &&
            <div className='benefit-expanded'>
              <p style={{marginTop:0}}>The VA Home Loan program, backed by the U.S. Department of Veterans Affairs, is one of the most valuable financial benefits available to service members, veterans, and certain military spouses. It’s designed to make homeownership more affordable and flexible than most conventional mortgages.</p>
              <h3>Financial Benefits</h3>
              <ul>
                <li><strong>No Down Payment:</strong> Unlike conventional loans that often require 5-20% down, eligible borrowers can finance 100% of the home's value.</li>
                <li><strong>No Private Mortgage Insurance:</strong> Conventional loans typically require PMI if the down payment is under 20%. VA loans eliminate this cost, saving hundreds per month.</li>
                <li><strong>Competitive Interest Rates:</strong> VA loans typically have lower average interest rates compared to conventional loans, reducing monthly payments and total interest paid over the life of the loan.</li>
                <li><strong>Limited Closing Costs:</strong> The VA limits the types of closing costs veterans can be charged, which helps keep upfront expenses low.</li>
                <li><strong>Funding Fee Flexibility:</strong> A one-time VA funding fee can be rolled into the loan rather than paid upfront.</li>
              </ul>
              <h3>Flexible Terms & Protections</h3>
              <ul>
                <li><strong>No Prepayment Penalty:</strong> You can pay off the loan early without any penalty.</li>
                <li><strong>Assumable Loans:</strong> A VA loan can be assumed by another qualified buyer who meets VA standards if you sell the home, potentially making your property more attractive in a high-rate market.</li>
                <li><strong>Refinancing:</strong> Interest Rate Reduction Refinance Loan (IRRRL) (“VA Streamline”) allows refinancing to a lower rate with minimal paperwork and no appraisal in many cases.</li>
              </ul>
              <h3>Additional Benefits</h3>
              <ul>
                <li><strong>Reusability:</strong> You can use a VA loan multiple times throughout your life, as long as eligibility requirements are met.</li>
                <li><strong>Secondary/Vacant Land Options:</strong> Primarily for primary residences, but can be used for certain multi-unit properties (up to 4 units if you occupy one) or new construction under specific guidelines.</li>
                <li><strong>Support for Deployed Service Members:</strong> Active-duty members can purchase homes while deployed, using a power of attorney.</li>
              </ul>
              <table style={{width:'50%'}}>
                <thead><tr><th>Who is Eligible?</th></tr></thead>
                <tbody>
                  <tr><td>Active-duty service members {'>'} 181 days</td></tr>
                  <tr><td>Veterans with qualifying service</td></tr>
                  <tr><td>Certain members of the National Guard and Reserves</td></tr>
                  <tr><td>Surviving spouses of service members who died in service or from a service-connected disability</td></tr>
                </tbody>
              </table>
              <div className='benefit-links'>
                <a href="https://www.benefits.va.gov/homeloans/" target="_blank" rel="noopener noreferrer">
                  {<button>Visit Website</button>}
                </a>
              </div>
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(4)}>
            <h4>Navy and Marine Corps Relief Socity {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===4 &&
            <div className='benefit-expanded'>
              <p style={{marginTop:0}}>The Navy-Marine Corps Relief Society (NMCRS) is a nonprofit organization that provides financial assistance, education, and support services to U.S. Navy and Marine Corps service members and their families. Its mission is to help sailors, Marines, and their dependents meet urgent needs and build long-term financial stability.</p>
              <p>Provides interest-free loans or grants for emergencies such as basic living expenses, emergency travel, vehicle repairs, funeral costs, disaster relief, etc. Repayment is flexible and tailored to the service member's budget. Assistance is not reported to credit bureaus, so it won’t affect your credit score.</p>
              <ul>
                <li><strong>Quick Assist Loans</strong> Up to $1000 for urgent needs with minimal paperwork, no repayment schedule required if turned into a grant based on need.</li>
                <li><strong>Budget Counseling & Financial Education:</strong> Free one-on-one sessions to create budgets, manage debt, and plan for major expenses.</li>
                <li><strong>Education Assistance:</strong> Interest-free education loans and grants for spouses and children of active-duty or retired sailors/Marines pursuing college or vocational training.</li>
                <li><strong>Thrift Shops:</strong> Low-cost uniforms, household goods, and clothing at NMCRS thrift stores on or near many Navy/Marine Corps bases.</li>
                <li><strong>Visiting Nurse Program:</strong> Free home visits by registered nurses to provide postpartum support, health education, and referrals for new parents.</li>
                <li><strong>Budget for Baby Workshops:</strong> Guidance on managing finances for a growing family.</li>
              </ul>
              
              <table style={{width:'50%'}}>
                <thead><tr><th>Who is Eligible?</th></tr></thead>
                <tbody>
                  <tr><td>Active-duty Navy and Marine Corps members and their dependents</td></tr>
                  <tr><td>Retired Navy and Marine Corps members and their dependents</td></tr>
                  <tr><td>Reservists on active duty</td></tr>
                  <tr><td>Eligible widows, widowers, and surviving family members</td></tr>
                </tbody>
              </table>
              <div className='benefit-links'>
                <button onClick={() => setModal(0)}>Find a Location</button>
                <a href="https://www.nmcrs.org/" target="_blank" rel="noopener noreferrer">
                  {<button>Visit Website</button>}
                </a>
              </div>
              {modal===0 && <NMCRS setModal={setModal} />}
            </div>
          }
        </div>
      </div>
    </div>
  );
}