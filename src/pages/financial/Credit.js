import './financial.css'
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";

export default function Credit() {
  const [showBenefit, setShowBenefit] = useState(null);

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
          <h1 style={{margin:0}}>Credit Options</h1>
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(0)}>
            <h4>SCRA and MLA Protections {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===0 &&
            <div className='benefit-expanded'>
              <h3 style={{margin:0}}>Servicemembers Civil Relief Act (SCRA)</h3>
              <p>The SCRA gives strong financial protections to active-duty service members. These protections apply to credit cards, loans, and other debts opened before active duty.</p>
              <ul>
                <li><strong>6% Interest Rate Cap:</strong> Any debt (credit card, car loan, mortgage, etc.) taken out before entering active duty must be reduced to 6% APR while serving</li>
                <li><strong>No Late Fees or Penalties:</strong> Creditors must forgive any interest above 6%, not defer it</li>
                <li><strong>Credit Score Protection:</strong> Creditors can’t report negative changes or reduced limits as retaliation for invoking SCRA</li>
                <li><strong>Lease Termination Rights:</strong> You can cancel vehicle and housing leases without penalty when receiving PCS or deployment orders</li>
              </ul>
              <p>To use the SCRA, contact each credit card or lender's SCRA department, and submit a copy of your active-duty orders. Many banks retroactively apply the 6% cap and refund interest paid since entering service.</p>
              <h3>Military Lending Act (MLA)</h3>
              <p>The MLA complements the SCRA but covers loans and credit opened while on active duty.</p>
              <ul>
                <li>36% Military APR cap, including fees (most cards are well below that)</li>
                <li>No mandatory arbitration clauses or “gotcha” terms</li>
                <li>Many issuers use MLA status to automatically waive annual fees</li>
              </ul>
              <p>Lenders automatically verify your MLA status through the DoD database when you apply. This applies only to personal credit, not business credit.</p>
              <div className='benefit-links'>
                <a href="https://scra.dmdc.osd.mil/scra/" target="_blank" rel="noopener noreferrer">
                  {<button>SCRA Website</button>}
                </a>
                <a href="https://mla.dmdc.osd.mil/mla/" target="_blank" rel="noopener noreferrer">
                  {<button>MLA Website</button>}
                </a>
              </div>
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(1)}>
            <h4>Credit Card Options {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===1 &&
            <div className='benefit-expanded'>
              <p style={{margin:0}}>Many banks extend extra benefits beyond the legal minimum. These include waived annual fees, lower interest rates, and enhanced rewards for service members.</p>
              <table style={{width:'90%'}}>
                <thead><tr>
                  <th>Bank</th>
                  <th>Benefits</th>
                  <th>Example Cards</th>
                </tr></thead>
                <tbody>
                  <tr>
                    <td>American Express</td>
                    <td>Waives all annual fees for active duty under MLA (Military Lending Act). This includes premium cards like the Amex Platinum ($695 annual fee waived).</td>
                    <td>
                      <div><a href="https://www.americanexpress.com/us/credit-cards/card/platinum/" target="_blank" rel="noopener noreferrer">
                        {<button>AMEX Platnum</button>}
                      </a></div>
                      <div><a href="https://www.americanexpress.com/us/credit-cards/card/gold-card/" target="_blank" rel="noopener noreferrer">
                        {<button>AMEX Gold</button>}
                      </a></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Chase</td>
                    <td>Waives annual fees and limits APR under SCRA, including for the Chase Sapphire Reserve ($550 fee waived).</td>
                    <td>
                      <div><a href="https://creditcards.chase.com/rewards-credit-cards/sapphire/reserve" target="_blank" rel="noopener noreferrer">
                        {<button>Sapphire Reserve</button>}
                      </a></div>
                      <div><a href="https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred" target="_blank" rel="noopener noreferrer">
                        {<button>Sapphire Preferred</button>}
                      </a></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Capital One</td>
                    <td>Caps interest at 4% (better than required 6%) and waives fees.</td>
                    <td>
                      <div><a href="https://www.capitalone.com/credit-cards/venture/" target="_blank" rel="noopener noreferrer">
                        {<button>Venture</button>}
                      </a></div>
                      <div><a href="https://www.capitalone.com/credit-cards/quicksilver/" target="_blank" rel="noopener noreferrer">
                        {<button>Quicksilver</button>}
                      </a></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Citi</td>
                    <td>Caps APR at 0% for eligible service members on pre-service accounts.</td>
                    <td>
                      <div><a href="https://www.citi.com/credit-cards/credit-card-rewards/citi-strata-premier-benefits" target="_blank" rel="noopener noreferrer">
                        {<button>Premier</button>}
                      </a></div>
                      <div><a href="https://www.citi.com/credit-cards/citi-double-cash-credit-card" target="_blank" rel="noopener noreferrer">
                        {<button>Double Cash</button>}
                      </a></div>
                    </td>
                  </tr>
                  <tr>
                    <td>USAA</td>
                    <td>Offers low APRs, deployment deferments, and fee waivers on USAA cards.</td>
                    <td>
                      <div><a href="https://www.usaa.com/banking/credit-cards-public/cash-back/preferred-cash" target="_blank" rel="noopener noreferrer">
                        {<button>Cashback Rewards</button>}
                      </a></div>
                      <div><a href="https://www.usaa.com/banking/credit-cards-public/low-interest/rate-advantage/" target="_blank" rel="noopener noreferrer">
                        {<button>Rate Advantage</button>}
                      </a></div>
                    </td>
                  </tr>
                  <tr>
                    <td>NFCU</td>
                    <td>Offers 0% APR deployment lines, low fixed APRs, and easy pre-approvals for service members.</td>
                    <td>
                      <div><a href="https://www.navyfederal.org/loans-cards/credit-cards/cash-rewards.html" target="_blank" rel="noopener noreferrer">
                        {<button>Cash Rewards</button>}
                      </a></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(2)}>
            <h4>Managing Credit Score {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===2 &&
            <div className='benefit-expanded'>
              <h3 style={{margin:0, textAlign:'center'}}>Understanding Credit Score</h3>
              <table style={{width:'90%'}}>
                <thead><tr>
                  <th>Factor</th>
                  <th>Weight</th>
                  <th>Tips</th>
                </tr></thead>
                <tbody>
                  <tr>
                    <td>Payment History</td>
                    <td>35%</td>
                    <td>Always pay on time (set up autopay)</td>
                  </tr>
                  <tr>
                    <td>Credit Utilization</td>
                    <td>30%</td>
                    <td>Keep balances under 30% of credit limit (under 10% is ideal)</td>
                  </tr>
                  <tr>
                    <td>Credit Age</td>
                    <td>15%</td>
                    <td>Keep oldest cards open, use no-fee cards long-term</td>
                  </tr>
                  <tr>
                    <td>Credit Mix</td>
                    <td>10%</td>
                    <td>Use both revolving (cards) and installment (auto, personal) credit responsibly</td>
                  </tr>
                  <tr>
                    <td>New Credit</td>
                    <td>10%</td>
                    <td>Space applications 3-6 months apart</td>
                  </tr>
                </tbody>
              </table>
              <ul>
                <li>Use fee-waived premium cards (Amex Platinum, Chase Sapphire Reserve) to earn points on PCS moves and TDY travel.</li>
                <li>Use rewards for flights home, hotels, or to offset deployment travel.</li>
                <li>Place an "active-duty alert" on your credit report via Equifax/Experian/TransUnion to reduce identity theft risk.</li>
                <li>Use Navy Fed's deployment assistance for temporary APR reductions or payment holds.</li>
              </ul>
              <h3 style={{textAlign:'center'}}>Credit Tools</h3>
              <div className='center' style={{marginBottom:'10px'}}>
                <a href="https://www.annualcreditreport.com/" target="_blank" rel="noopener noreferrer">
                  {<button>AnnualCreditReport.com</button>}
                </a> - Free credit reports from Experian, TransUnion, and Equifax
              </div>
              <div className='center' style={{marginBottom:'10px'}}>
                <a href="https://www.creditkarma.com/" target="_blank" rel="noopener noreferrer">
                  {<button>Credit Karma</button>}
                </a> - Credit score monitoring + alerts
              </div>
              <div className='center' style={{marginBottom:'10px'}}>
                <a href="https://www.experian.com/" target="_blank" rel="noopener noreferrer">
                  {<button>Experian</button>}
                </a> - Credit score monitoring + alerts
              </div>
              <div className='center'>
                <a href="https://www.nerdwallet.com/" target="_blank" rel="noopener noreferrer">
                  {<button>NerdWallet</button>}
                </a> - Credit score monitoring + alerts
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
}