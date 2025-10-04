import './financial.css'
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";

export default function Business() {
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
          <h1 style={{margin:0}}>Start a Business</h1>
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(0)}>
            <h4>DoD Regulations {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===0 &&
            <div className='benefit-expanded'>
              <p style={{marginTop:0}}>Military regulations prohibit actions that interfere with your duties or bring discredit to the armed forces. It is, however, possible to start a business as long as you follow the proper regulations. Most branches require written approval or notification for outside employment or running a business.</p>
              <ul>
                <li><strong>Seek Permission:</strong> Talk to your supervisor or commander about your intention to start a business.</li>
                <li><strong>Address Potential Conflicts:</strong> Your command will likely consider if the business will interfere with your military duties or reputation.</li>
                <li><strong>Prioritize Service:</strong> Be clear that military service and duties always come first.</li>
                <li><strong>Avoid Using Military Status:</strong> You cannot use your military affiliation or status for personal financial gain in your business.</li>
                <li><strong>Ensure Business Independence:</strong> Do not use military resources, equipment, or property for your side business. </li>
              </ul>
              <h4 style={{textAlign:'center'}}>Ethics Review</h4>
              <ul>
                <li>You may not use government time, equipment, or resources to operate your business.</li>
                <li>You may not compete with the U.S. government.</li>
                <li>You may not misuse your rank or uniform to promote the business.</li>
                <li>A Staff Judge Advocate (SJA) or ethics counselor can review your plan before you start.</li>
              </ul>
              <div className='benefit-links'>
                <button>Find a Legal Advisor</button>
              </div>
            </div>
          }
        </div>
        
        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(1)}>
            <h4>Balancing a Business with Military Life {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===1 &&
            <div className='benefit-expanded'>
              <p style={{margin:0}}>Your primary duty as a service member will always take priority, so steps can taken to best develop your business around your service obligations. In general, favor asynchronous or passive income businesses that do not require you to be on call during on-duty hours. Below are some business models that tend to work well in a deployment cycle due to low maintenance and flexibility.</p>
              <table>
                <thead><tr>
                  <th>Business Model</th>
                  <th>Example</th>
                  <th>Benefits</th>
                </tr></thead>
                <tbody>
                  <tr>
                    <td>Digital Products</td>
                    <td>E-books, online courses, design templates</td>
                    <td>Very scalable, no inventory</td>
                  </tr>
                  <tr>
                    <td>Content Creation*</td>
                    <td>YouTube, podcast, blog</td>
                    <td>Build brand slowly, monetize later</td>
                  </tr>
                  <tr>
                    <td>E-Commerce</td>
                    <td>Shopify, Etsy</td>
                    <td>No warehouse, location-independent</td>
                  </tr>
                  <tr>
                    <td>Software/Apps</td>
                    <td>This website</td>
                    <td>High upside, can build part-time</td>
                  </tr>
                  <tr>
                    <td>Real Estate Investing</td>
                    <td>Rental property with management company</td>
                    <td>BAH-friendly, VA loan access</td>
                  </tr>
                  <tr>
                    <td>Freelance/Consulting</td>
                    <td>Web design, coding, tutoring</td>
                    <td>Flexible hours, remote work</td>
                  </tr>
                </tbody>
              </table>
              <p>*Please research current regulation before posting about the military or US Government</p>
              <h4 style={{textAlign:'center'}}>Preparing for Deployment</h4>
              <ul>
                <li>Start small and automate early, your time and focus belong to the mission first</li>
                <li>Automate payments (through Stripe, PayPal, etc) and customer service (through chatbots, email responders, etc)</li>
                <li>Work with others or hire virtual assistants to handle routine tasks and large workloads</li>
                <li>Etablish a Power of Attorney to manage business banking during deployment</li>
              </ul>
              <div className='benefit-links'>
              </div>
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(2)}>
            <h4>Business Setup and Management {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===2 &&
            <div className='benefit-expanded'>
              <div className='center' style={{alignItems:'flex-start'}}>
                <div className='business-structures'>
                  <h4 style={{textAlign:'center', margin:0}}>Sole Proprietorship</h4>
                  <hr />
                  <p><strong>Setup:</strong> just start operating under your name</p>
                  <p>Can optionally file a DBA (Doing Business As) with your state/county to operate under a different name for branding and privacy</p>
                  <p><strong>Pros:</strong> very easy and cheap to start, and all income flows into your tax return</p>
                  <p><strong>Cons:</strong> no liability protection against getting sued, and harder to separate from personal finances</p>
                  <p><strong>Best for:</strong> very small, low-risk side hustles like freelance writing, tutoring, or online courses</p>
                </div>
                <div className='business-structures'>
                  <h4 style={{textAlign:'center', margin:0}}>Limited Liability Company (LLC)</h4>
                  <hr />
                  <p><strong>Setup:</strong> file Articles of Organization with your state ($50–$500 fee depending on state)</p>
                  <p><strong>Pros:</strong> liability protection, flexible tax treatment, and good credibility when working with customers</p>
                  <p><strong>Cons:</strong> annual state reporting and fees</p>
                  <p>Easy to manage remotely and maintain military and personal life separation</p>
                  <p><strong>Best for:</strong> service members who want serious side businesses (e-commerce, consulting, real estate)</p>
                </div>
                <div className='business-structures'>
                  <h4 style={{textAlign:'center', margin:0}}>S-Corporation (via LLC or Corporation Election)</h4>
                  <hr />
                  <p><strong>Setup:</strong> start a LLC or Corporation, then file IRS Form 2553 to elect S-Corp status</p>
                  <p><strong>Pros:</strong> tax savings on self-employment taxes by paying yourself a “reasonable salary” + distributions</p>
                  <p><strong>Cons:</strong> more paperwork (payroll, quarterly filings, etc), and less flexibility if moving PCS frequently</p>
                  <p>Usually unnecessary until the business makes {">"}$75K–$100K/year net profit</p>
                  <p><strong>Best for:</strong> service members running higher-earning businesses (consulting firms, large e-commerce)</p>
                </div>
                <div className='business-structures'>
                  <h4 style={{textAlign:'center', margin:0}}>C-Corporation</h4>
                  <hr />
                  <p><strong>Setup:</strong> file incorporation docs with state, separate tax entity</p>
                  <p><strong>Pros:</strong> potential for investors, stock options, and unlimited growth potential</p>
                  <p><strong>Cons:</strong> double taxation (corporate tax + dividend tax), and high complexity</p>
                  <p>Typically too complex for most side businesses while active duty</p>
                  <p><strong>Best for:</strong> post-separation, high-growth startups aiming for outside funding</p>
                </div>
              </div>
              <h3 style={{textAlign:'center'}}>Registering your Business</h3>
              <ol>
                <li><strong>Pick Your State:</strong> states like Wyoming, Delaware, Nevada are popular for LLCs due to convenient tax and legal systems, but most service members choose their state of legal residence to avoid confusion with taxes</li>
                <li><strong>Get an Employer Identification Number (EIN):</strong> needed to open a business bank account and file taxes</li>
                <li><strong>Business Bank Account:</strong> Use military-friendly banks/credit unions (Navy Fed, USAA) or fintech banks, but never mix military pay and business funds</li>
                <li><strong>Licenses & Permits:</strong> varies by business (e.g., food service, firearms, childcare need special permits)</li>
              </ol>
              <div className='benefit-links'>
                <a href="https://sa.www4.irs.gov/applyein/" target="_blank" rel="noopener noreferrer">
                  {<button>Get an EIN</button>}
                </a>
              </div>
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(3)}>
            <h4>Marketing and Fundraising {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===3 &&
            <div className='benefit-expanded'>
              
              <div className='benefit-links'>
              </div>
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(4)}>
            <h4>Corporate Taxes {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===4 &&
            <div className='benefit-expanded'>
              <table style={{width:'90%'}}>
              <thead><tr>
                <th colSpan={4}>Tax Structure</th>
              </tr></thead>
              <tbody>
                <tr>
                  <td><strong>Sole Proprietor/LLC</strong></td>
                  <td>Profits flow onto Schedule C of your personal return</td>
                  <td><a href="/documents/f1040sc.pdf" target="_blank" rel="noopener noreferrer">
                      {<button>Schedule C</button>}
                  </a></td>
                  <td><a href="/documents/i1040sc.pdf" target="_blank" rel="noopener noreferrer">
                      {<button>Instructions</button>}
                  </a></td>
                </tr>
                <tr>
                  <td><strong>S-Corp</strong></td>
                  <td>File separate corporate tax return, owner takes salary + dividends</td>
                  <td>
                    <a href="/documents/f1120s.pdf" target="_blank" rel="noopener noreferrer">
                      {<button>Form 1120-S</button>}
                    </a>
                    <a href="/documents/f1065sk1s.pdf" target="_blank" rel="noopener noreferrer">
                      {<button style={{marginTop:'2px'}}>Schedule K-1</button>}
                    </a>
                  </td>
                  <td>
                    <a href="/documents/i1120s.pdf" target="_blank" rel="noopener noreferrer">
                      {<button>Instructions</button>}
                    </a>
                    <a href="/documents/i1065sk1s.pdf" target="_blank" rel="noopener noreferrer">
                      {<button style={{marginTop:'2px'}}>Instructions</button>}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td><strong>C-Corp</strong></td>
                  <td>Separate entity, pays its own taxes</td>
                  <td><a href="/documents/f1120.pdf" target="_blank" rel="noopener noreferrer">
                      {<button>Form 1120</button>}
                  </a></td>
                  <td><a href="/documents/i1120.pdf" target="_blank" rel="noopener noreferrer">
                      {<button>Instructions</button>}
                  </a></td>
                </tr>
                <tr>
                  <td><strong>Quarterly Taxes</strong></td>
                  <td>Business income requires quarterly tax payments (April, June, Sept, Jan)</td>
                  <td><a href="/documents/f1040es.pdf" target="_blank" rel="noopener noreferrer">
                      {<button>Form 1040-ES</button>}
                  </a></td>
                </tr>
              </tbody>
            </table>
            <p>If you are not using an S-Corp, you will owe 15.3% <strong>self-employment tax</strong> (Social Security + Medicare) on profits in addition to income tax.</p>
            <h4 style={{textAlign:'center'}}>Common Military Deductions</h4>
            <ul>
              <li><strong>Home Office Deduction:</strong> check with a JAG if this is allowed in base housing</li>
              <li><strong>Startup Costs:</strong> first $5,000 deductible in year 1</li>
              <li><strong>Business Milage:</strong> if driving for business, not daily commute</li>
              <li><strong>Equipment:</strong> laptop, software, cameras, etc.</li>
              <li><strong>Advertising/Marketing:</strong> website hosting, ads, etc.</li>
            </ul>
            <p>Note: You cannot deduct expenses for work you did on duty or using military resources.</p>
            </div>
          }
        </div>
      </div>
    </div>
  );
}