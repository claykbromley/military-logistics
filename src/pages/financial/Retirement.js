import Link from "next/link";
import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import { TSPCalculator } from "./TSP-Calculator"
import { FinAdvisor } from './Modals';

export default function Retirement() {
  const [showBenefit, setShowBenefit] = useState(null);
  const [modal, setModal] = useState(null);

  const handleClick = (value) => {
    setShowBenefit(showBenefit===value ? null : value);
  };

  return (
    <div className='financial-page'>
      <div className='services'>
        <div className='option-header'><Link href={"/financial"}>Financial Services</Link></div>
        <hr />
        <div className='services-option'><Link href={"/financial/investments"}>Investments</Link></div>
        <div className='services-option'><Link href={"/financial/taxes"}>Taxes and Income</Link></div>
        <div className='services-option'><Link href={"/financial/loans"}>Loans</Link></div>
        <div className='services-option'><Link href={"/financial/retirement"}>Retirement</Link></div>
        <div className='services-option'><Link href={"/financial/business"}>Start a Business</Link></div>
        <div className='services-option'><Link href={"/financial/credit"}>Credit</Link></div>
        <div className='services-option'><Link href={"/financial/bills"}>Manage Bills</Link></div>
      </div>

      <div className='main'>
        <div style={{textAlign:'center'}}>
          <h1 style={{margin:0}}>Retirement Planning</h1>
          <button onClick={() => setModal(0)} style={{marginTop:'10px'}}>Find a Financial Advisor</button>
        </div>
        {modal===0 && <FinAdvisor setModal={setModal} />}

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(0)}>
            <h4>Blended Retirement System {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===0 &&
            <div className='benefit-expanded'>
              <p style={{marginTop:0}}>The Blended Retirement System is the standard retirement plan for those who entered service on or after Jan 1, 2018. It blends a traditional pension with Thrift Savings Plan (TSP) contributions.</p>
              <ul>
                <li><strong>Defined-Benefit Pension:</strong> earned after 20 years of service. Pays <strong>2%</strong> x <strong>years of service</strong> x <strong>highest 36 months of base pay</strong>.</li>
                <li><strong>Cost-of-Living Adjustments (COLA):</strong> Pension grows annually with inflation.</li>
                <li><strong>Survivor Benefit Plan (SBP):</strong> can provide ongoing income to a spouse/beneficiary.</li>
                <li><strong>Early Retirement Options</strong></li>
                <li><strong>Continuation Pay:</strong> A mid-career bonus for BRS participants of approximately 2.5 x monthly base pay. It can be taken as a lump sum or spread out.</li>
              </ul>
              <p>Reserve/National Guard pension starts at a later age (typically 60, can be earlier with qualifying deployments).</p>
              <div className='benefit-links'>
                <a href="https://militarypay.defense.gov/Portals/3/Documents/BlendedRetirementDocuments/A%20Guide%20to%20the%20Uniformed%20Services%20BRS%20December%202017.pdf?ver=2017-12-18-140805-343" target="_blank" rel="noopener noreferrer">
                  {<button>BRS Guide</button>}
                </a>
              </div>
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(1)}>
            <h4>Thrift Savings Plan (TSP) {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===1 &&
            <div className='benefit-expanded'>
              <p style={{marginTop:0}}>The TSP is the military equivalent of a civilian 401(k), a tax-advantaged retirement account.</p>
              <h3>Benefits:</h3>
              <ul>
                <li><strong>Government Matching:</strong> 1% automatic contribution from DoD after 60 days and up to 5% matching after 2 years.</li>
                <li><strong>Tax Options:</strong>
                  <ul>
                    <li><strong>Traditional TSP:</strong> Pre-tax contributions, tax deferred until withdrawal.</li>
                    <li><strong>Roth TSP:</strong> After-tax contributions, tax-free withdrawals in retirement.</li>
                  </ul>
                </li>
                <li>Extremely low administrative fees (around 0.05%)</li>
                <li><strong>Portable:</strong> it can be rolled it into a civilian 401(k) or IRA after leaving the military.</li>
              </ul>
              <h3>Core Individual Funds</h3>
              <table>
                <thead><tr>
                  <th>Fund</th>
                  <th>Asset Class</th>
                  <th>Objective</th>
                  <th>Risk/Return Profile</th>
                </tr></thead>
                <tbody>
                  <tr>
                    <td>G Fund (Government Securities)</td>
                    <td>U.S. Treasury securities</td>
                    <td>Provide guaranteed principal protection and interest that beats short-term inflation.</td>
                    <td>Lowest risk, lowest return. Similar to a high-quality bond fund but with no risk of loss.</td>
                  </tr>
                  <tr>
                    <td>F Fund (Fixed Income)</td>
                    <td>U.S. investment-grade bonds</td>
                    <td>Provide bond market returns and diversify stock risk.</td>
                    <td>Low-to-moderate risk. Sensitive to interest rate changes.</td>
                  </tr>
                  <tr>
                    <td>C Fund (Common Stock)</td>
                    <td>Large U.S. companies (S&P 500)</td>
                    <td>Track performance of large-cap U.S. stocks.</td>
                    <td>Higher long-term growth, moderate volatility.</td>
                  </tr>
                  <tr>
                    <td>S Fund (Small Cap)</td>
                    <td>U.S. small/mid-cap stocks (Dow Jones U.S. Completion Index)</td>
                    <td>Capture growth of non-S&P 500 companies.</td>
                    <td>Higher risk, higher growth potential.</td>
                  </tr>
                  <tr>
                    <td>I Fund (International)</td>
                    <td>Developed international markets (MSCI EAFE Index)</td>
                    <td>Diversify outside the U.S.</td>
                    <td>Higher risk, affected by currency fluctuations.</td>
                  </tr>
                </tbody>
              </table>
              <h3>Lifecycle (L) Funds</h3>
              <ul>
                <li>Target-date funds that automatically adjust your mix of G, F, C, S, and I Funds.</li>
                <li>Choose a fund closest to your expected retirement year (e.g., L2050 if you plan to retire around 2050).</li>
                <li><strong>Automatic Rebalancing:</strong> Heavier in stocks (C, S, I) for growth in earlier years, then gradually shifts toward bonds (G, F) for stability in later years.</li>
                <li>Best for investors who want a “set it and forget it” strategy.</li>
              </ul>
              <div className='benefit-links'>
                <a href="./Investments">
                  {<button>Investment Options</button>}
                </a>
                <a href="https://www.tsp.gov/" target="_blank" rel="noopener noreferrer">
                  {<button>Visit TSP Website</button>}
                </a>
              </div>
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(2)}>
            <h4>Retirement Calculator {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===2 &&
            <div className='benefit-expanded'>
              <TSPCalculator />
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(3)}>
            <h4>Roth IRA {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===3 &&
            <div className='benefit-expanded'>
              <p style={{marginTop:0}}>Roth Indivual Retirement Accounts (IRA) take after-tax contributions, so withdrawals in retirement are tax-free.</p>
              <ul>
                <li><strong>Limit:</strong> $7,000/yr (2025) under 50</li>
                <li><strong>Best for:</strong> junior enlisted/officers in low tax brackets, anyone expecting higher taxes later</li>
                <li><strong>Combat Zone Tax Exclusion:</strong> income counts as tax-free contributions, so you can withdraw tax-free forever.</li>
              </ul>
              <div className='benefit-links'>
                <a href="https://investor.vanguard.com/accounts-plans/iras" target="_blank" rel="noopener noreferrer">
                  {<button>Vanguard</button>}
                </a>
                <a href="https://www.fidelity.com/retirement-ira/roth-ira" target="_blank" rel="noopener noreferrer">
                  {<button>Fidelity</button>}
                </a>
                <a href="https://www.schwab.com/ira/roth-ira" target="_blank" rel="noopener noreferrer">
                  {<button>Schwab</button>}
                </a>
                <a href="https://www.usaa.com/investing/iras-and-rollovers/" target="_blank" rel="noopener noreferrer">
                  {<button>USAA</button>}
                </a>
                <a href="https://www.navyfederal.org/checking-savings/savings/retirement-savings/savings-accounts.html" target="_blank" rel="noopener noreferrer">
                  {<button>NFCU</button>}
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
}