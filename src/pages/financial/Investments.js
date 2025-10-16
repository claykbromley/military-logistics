import './financial.css'
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import { FinAdvisor, HouseFinder } from './Modals';
import HoverPie from './pie_chart';

export default function Investments() {
  
  const [showBenefit, setShowBenefit] = useState(null);
  const [modal, setModal] = useState(null);

  const handleClick = (value) => {
    setShowBenefit(showBenefit===value ? null : value);
  };

  return (
    <div className='financial-page'>
      <div className='services'>
        <div className='option-header'><Link key={"../financial"} to={"../financial"}>Financial Services</Link></div>
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
          <h1 style={{margin:0}}>Investments and Personal Finances</h1>
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(0)}>
            <h4>Thrift Savings Plan (TSP) {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===0 &&
            <div className='benefit-expanded'>
              <p>The TSP is a tax-advantaged retirement account that lets you contribute pre-tax (Traditional) or after-tax (Roth) dollars.
                With this, you can invest in ultra-low-cost index funds and receive free government matching contributions under the Blended Retirement System.</p>
              <ul>
                <li><strong>Contribution Limit:</strong> $23,000 ({"<"}50 yrs) / $30,500 (50+ with catch-up)</li>
                <li><strong>Government Matching:</strong> Up to 5% of base pay (automatic 1% + up to 4% match)</li>
                <li><strong>Tax Options:</strong> Traditional (pre-tax) or Roth (after-tax)</li>
                <li><strong>Expense Ratios:</strong> ~0.04% (far cheaper than civilian 401(k)s)</li>
              </ul>
              <h3>Fund Options</h3>
              <table style={{width:'90%'}}>
                <thead><tr>
                  <th>Fund</th>
                  <th>Asset Type</th>
                  <th>Risk Level</th>
                  <th>Average Return*</th>
                  <th>Notes</th>
                </tr></thead>
                <tbody>
                  <tr>
                    <td>G Fund</td>
                    <td>government securities</td>
                    <td>Low</td>
                    <td>2-3%</td>
                    <td>principal guarenteed, low growth</td>
                  </tr>
                  <tr>
                    <td>F Fund</td>
                    <td>US Bonds</td>
                    <td>Low-Medium</td>
                    <td>3-4%</td>
                    <td>tracks US Bond market</td>
                  </tr>
                  <tr>
                    <td>C Fund</td>
                    <td>large-cap US stocks</td>
                    <td>medium-high</td>
                    <td>10-12%</td>
                    <td>tracks S&P 500</td>
                  </tr>
                  <tr>
                    <td>S Fund</td>
                    <td>small/mid US stocks</td>
                    <td>High</td>
                    <td>11-13%</td>
                    <td>more volatility</td>
                  </tr>
                  <tr>
                    <td>I Fund</td>
                    <td>international stocks</td>
                    <td>High</td>
                    <td>6-8%</td>
                    <td>developed markets</td>
                  </tr>
                  <tr>
                    <td>Lifecycle (L)</td>
                    <td>target-date mix</td>
                    <td>varies</td>
                    <td>varies</td>
                    <td>automatically rebalances by retirement date</td>
                  </tr>
                </tbody>
              </table>
              <p>*Returns are historical averages over last 10 years, not guarantees</p>
              <h3>Roth vs. Traditional TSP</h3>
              <table style={{width:'90%'}}>
                <thead><tr>
                  <th>Feature</th>
                  <th>Roth</th>
                  <th>Traditional</th>
                </tr></thead>
                <tbody>
                  <tr>
                    <td>Contributions</td>
                    <td>After Tax</td>
                    <td>Pre Tax</td>
                  </tr>
                  <tr>
                    <td>Withdrawals</td>
                    <td>Tax-free in retirement</td>
                    <td>Taxed in retirement</td>
                  </tr>
                  <tr>
                    <td>Best for</td>
                    <td>Young troops in low tax bracket</td>
                    <td>Senior ranks expecting lower taxes in retirement</td>
                  </tr>
                </tbody>
              </table>
              <hr />
              <h3 style={{textAlign:'center', margin:0}}>Investment Advice</h3>
              <ul>
                <li>Always contribute at least 5% to capture the full match</li>
                <li>Start early: time in the market beats timing the market</li>
                <li>Junior service members: Roth is usually best (low income now)</li>
                <li>Senior service members: Traditional may save more (high income now)</li>
                <li>Use Lifecycle funds if you prefer a set-it-and-forget-it approach</li>
                <li>Revisit allocation after promotions, PCS moves, or major life events</li>
              </ul>
              <div className='benefit-links'>
                <a href="./Retirement">
                  {<button>TSP Calculator</button>}
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
            onClick={() => handleClick(1)}>
            <h4>Real Estate{<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===1 &&
            <div className='benefit-expanded'>
              <h3>Real Estate Strategies</h3>
              <table style={{width:'90%'}}>
                <thead><tr>
                  <th>Strategy</th>
                  <th>Primary Goal</th>
                  <th>Timeline</th>
                  <th>Key Military Advantage</th>
                </tr></thead>
                <tbody>
                  <tr>
                    <td>Primary Residence</td>
                    <td>Build equity while living in it</td>
                    <td>PCS cycle (3–5 yrs)</td>
                    <td>VA loan: no down payment, no PMI</td>
                  </tr>
                  <tr>
                    <td>House Hacking</td>
                    <td>Live in one unit, rent others</td>
                    <td>1-5 years</td>
                    <td>VA/FHA multi-family financing</td>
                  </tr>
                  <tr>
                    <td>PCS Rental</td>
                    <td>Buy during a duty station, rent out after PCS</td>
                    <td>5-20 years</td>
                    <td>BAH covers mortgage while stationed</td>
                  </tr>
                  <tr>
                    <td>BRRRR (Buy, Rehab, Rent, Refinance, Repeat)</td>
                    <td>Force appreciation and scale portfolio</td>
                    <td>2-10 years</td>
                    <td>Access to low-cost VA or conventional loans</td>
                  </tr>
                  <tr>
                    <td>REITs (Real Estate Investment Trusts)</td>
                    <td>Passive income without ownership headaches</td>
                    <td>Immediate</td>
                    <td>No landlord duties, buy via TSP/IRA</td>
                  </tr>
                </tbody>
              </table>
              <p>Renting is often the safer option if staying in one location for less than 3 years</p>
              <h4>Primary Residence While Stationed</h4>
              <p>Makes sense when you are likely to stay 3+ years in one location and the local market is stable or appreciating.</p>
              <ol>
                <li>Get pre-approved with a VA lender</li>
                <li>Research BAH vs. mortgage payment</li>
                <li>Budget for PCS (property manager, vacancy risk)</li>
              </ol>
              <h4>House Hacking</h4>
              <ul>
                <li>Live in one part of a multi-unit property (e.g., 4-plex), rent the others</li>
                <li>VA loans allow up to 4-unit properties with 0% down if you occupy one unit</li>
                <li>Tenants' rent covers mortgage, so you can live for free</li>
              </ul>
              <h4>PCS Rental (Buy and Hold)</h4>
              <p>Buy at one duty station, keep it as a rental when you move</p>
              <ul>
                <li>Use property management (8-12% of rent)</li>
                <li>Budget for maintenance (1% of property value annually)</li>
                <li>Confirm rental demand before buying</li>
              </ul>
              <h4>BRRRR Strategy</h4>
              <p>Buy undervalued property → Renovate → Rent → Refinance → Repeat</p>
              <ul>
                <li>Use VA or FHA loans to start with little money down</li>
                <li>Requires good contractor network and strong market knowledge</li>
              </ul>
              <h4>Passive Real Estate Investing</h4>
              <p>Useful if deployments, duty hours, or PCS moves make direct ownership difficult</p>
              <ul>
                <li>REIT ETFs: Vanguard VNQ, Schwab SCHH → invest via Roth IRA or brokerage</li>
                <li>Crowdfunding platforms: Fundrise, RealtyMogul (minimums ~$10–$500)</li>
                <li>No tenants or landlord duties</li>
              </ul>
              <div className='benefit-links'>
                <button onClick={() => setModal(0)}>House Finder</button>
                <a href="./Loans">
                  {<button>VA Loan</button>}
                </a>
              </div>
              {modal===0 && <HouseFinder setModal={setModal} />}
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(2)}>
            <h4>Investment Strategy {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===2 &&
            <div className='benefit-expanded'>
              <p style={{marginTop:0}}>There are many possible ways to approach your investment strategy. Your financial goals determine which asset class you should pursue.</p>
              <table style={{width:'90%'}}>
                <thead><tr>
                  <th>Goal</th>
                  <th>Time Horizon</th>
                  <th>Risk Level</th>
                  <th>Primary Accounts</th>
                </tr></thead>
                <tbody>
                  <tr>
                    <td>Emergency Fund</td>
                    <td>{"<"}1 year</td>
                    <td>None</td>
                    <td>High-yield savings</td>
                  </tr>
                  <tr>
                    <td>Short-term (PCS, car, etc.)</td>
                    <td>1-5 years</td>
                    <td>Low</td>
                    <td>CDs, short-term Treasury ETFs, I Bonds</td>
                  </tr>
                  <tr>
                    <td>Retirement</td>
                    <td>20+ years</td>
                    <td>Medium-High</td>
                    <td>Roth IRA, Traditional IRA, taxable brokerage</td>
                  </tr>
                  <tr>
                    <td>Build Wealth</td>
                    <td>Flexible</td>
                    <td>Medium-High</td>
                    <td>Brokerage (stocks, ETFs, REITs)</td>
                  </tr>
                  <tr>
                    <td>Income After Service</td>
                    <td>5-15 years</td>
                    <td>Medium</td>
                    <td>Dividend ETFs, REITs, rental property</td>
                  </tr>
                </tbody>
              </table>
              <h3>Asset Class Breakdown</h3>
              <table style={{width:'90%'}}>
                <thead><tr>
                  <th>Asset Class</th>
                  <th>Expected Return (long-term)</th>
                  <th>Risk</th>
                  <th>When to Use</th>
                </tr></thead>
                <tbody>
                  <tr>
                    <td>U.S. Stocks (Index Funds/ETFs)</td>
                    <td>7–10%</td>
                    <td>High</td>
                    <td>Retirement, long-term wealth</td>
                  </tr>
                  <tr>
                    <td>International Stocks</td>
                    <td>6-8%</td>
                    <td>High</td>
                    <td>Diversification</td>
                  </tr>
                  <tr>
                    <td>Bonds (Treasury/Corporate)</td>
                    <td>2-5%</td>
                    <td>Low–Med</td>
                    <td>Income, stability</td>
                  </tr>
                  <tr>
                    <td>REITs (Real Estate)</td>
                    <td>6-9%</td>
                    <td>Med-High</td>
                    <td>Passive real estate income</td>
                  </tr>
                  <tr>
                    <td>Cash / Money Market</td>
                    <td>3–5%</td>
                    <td>Very Low</td>
                    <td>Emergency fund</td>
                  </tr>
                  <tr>
                    <td>Alternatives (gold, crypto)</td>
                    <td>Highly variable</td>
                    <td>Very High</td>
                    <td>Speculation ({"<"}5% of portfolio)</td>
                  </tr>
                </tbody>
              </table>
              <div className='center' style={{textAlign:'center'}}>
                <div style={{width:'30%'}}>
                  <h4 style={{marginBottom:0}}>Aggressive Growth</h4>
                  <h5 style={{margin:0}}>20-30 years</h5>
                  <h5 style={{margin:0}}>Max growth for financial independence</h5>
                  <HoverPie data={[
                    {name:"US Stock ETF", value:60},
                    {name:"International Stock ETF", value:25},
                    {name:"US Bond ETF", value:10},
                    {name:"REIT ETF", value:5},
                    {name:"Dividend Stock ETF", value:0},
                    {name:"Cash/Money Market", value:0}
                  ]}/>
                </div>
                <div style={{width:'30%'}}>
                  <h4 style={{marginBottom:0}}>Balanced Growth</h4>
                  <h5 style={{margin:0}}>15-20 years</h5>
                  <h5 style={{margin:0}}>Grow wealth while reducing volatility</h5>
                  <HoverPie data={[
                    {name:"US Stock ETF", value:50},
                    {name:"International Stock ETF", value:20},
                    {name:"US Bond ETF", value:25},
                    {name:"REIT ETF", value:5},
                    {name:"Dividend Stock ETF", value:0},
                    {name:"Cash/Money Market", value:0}
                  ]}/>
                </div>
                <div style={{width:'30%'}}>
                  <h4 style={{marginBottom:0}}>Income-Focused</h4>
                  <h5 style={{margin:0}}>5-10 years</h5>
                  <h5 style={{margin:0}}>Generate steady cash flow for civilian life</h5>
                  <HoverPie data={[
                    {name:"US Stock ETF", value:0},
                    {name:"International Stock ETF", value:0},
                    {name:"US Bond ETF", value:40},
                    {name:"REIT ETF", value:15},
                    {name:"Dividend Stock ETF", value:40},
                    {name:"Cash/Money Market", value:5}
                  ]}/>
                </div>
              </div>
              <p>***This is meant as a tool for exploring options. Please complete your own research before making financial decisions</p>
              <div className='benefit-links'>
                <button onClick={() => setModal(1)} style={{marginTop:'10px'}}>Find a Financial Advisor</button>
              </div>
              {modal===1 && <FinAdvisor setModal={setModal} />}
            </div>
          }
        </div>
      </div>
    </div>
  );
}