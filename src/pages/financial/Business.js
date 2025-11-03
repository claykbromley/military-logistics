import Link from "next/link";
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
              <p style={{margin:0}}>The marketing strategy and fundraising option you employ depends on the consumer type. Here are some commong business types and recommended marketing strategies:</p>
              <h4 style={{marginBottom:0}}>Direct-to-Consumer (D2C / B2C)</h4>
              Selling directly to individual customers (e-commerce, coaching, apps, handmade products)
              <ul>
                <li><strong>Social Media Marketing:</strong> TikTok/Instagram for lifestyle/fitness, LinkedIn for professional services</li>
                <li><strong>Content Creation:</strong> blog, YouTube, or podcast around your expertise</li>
                <li><strong>Email Lists:</strong> collect emails early, even before launch</li>
                <li><strong>Partnerships:</strong> collaborate with veteran-owned brands to cross-promote</li>
                <li>Sharing your service story can be a great way to gain attention, but be aware of regulations regarding what you are allows to post online</li>
              </ul>
              <h4 style={{marginBottom:0}}>Business-to-Business (B2B)</h4>
              Selling to companies (consulting, IT services, logistics, marketing agencies)
              <ul>
                <li><strong>Networking:</strong> LinkedIn + local Chamber of Commerce</li>
                <li><strong>Cold Outreach:</strong> email + LinkedIn messaging campaigns</li>
                <li><strong>Proof of Expertise:</strong> case studies, white papers, portfolio work</li>
                <li><strong>Partnerships:</strong> team up with larger firms as subcontractors</li>
                <li>Leverage credibility of military discipline and project management skills</li>
              </ul>
              <h4 style={{marginBottom:0}}>Business-to-Government (B2G)</h4>
              Selling to government agencies (IT support, training, equipment, software)
              <ul>
                <li><strong>SAM.gov Registration:</strong> register for a CAGE Code + DUNS Number to bid on federal contracts</li>
                <li><strong>Veteran-Owned Small Business (VOSB) / Service-Disabled Veteran-Owned (SDVOSB):</strong> special preference in federal procurement</li>
                <li><strong>Teaming/Subcontracting:</strong> partner with larger defense primes (Lockheed, Raytheon) as a subcontractor</li>
                <li><strong>Networking:</strong> attend DoD industry days, AFWERX/NSIN events</li>
                <li>Service members have an inside perspective on defense problems which is a huge selling point</li>
              </ul>
              <h3 style={{textAlign:'center'}}>Fundraising Options</h3>
              <table style={{width:'90%'}}>
                <thead><tr>
                  <th>Method</th>
                  <th>Typical Amount</th>
                  <th>Pros</th>
                  <th>Cons</th>
                  <th>Best For</th>
                  <th>Examples</th>
                </tr></thead>
                <tbody>
                  <tr>
                    <td>Bootstrapping</td>
                    <td>$0-$20K</td>
                    <td>Full control, low risk</td>
                    <td>Slow growth</td>
                    <td>Small side business</td>
                  </tr>
                  <tr>
                    <td>Grants</td>
                    <td>$5K-$100K</td>
                    <td>Free money, no equity</td>
                    <td>Highly competitive</td>
                    <td>Early-stage, vet-focused</td>
                    <td>
                      <div><a href="https://www.sba.gov/sba-learning-platform/boots-business" target="_blank" rel="noopener noreferrer">
                        {<button>SBA Boots to Business</button>}
                      </a></div>
                      <div><a href="https://www.sba.gov/local-assistance/resource-partners/veterans-business-outreach-centers-vboc" target="_blank" rel="noopener noreferrer">
                        {<button>Veterans Business Outreach Centers</button>}
                      </a></div>
                      <div><a href="https://www.warriorrising.org/" target="_blank" rel="noopener noreferrer">
                        {<button>Warrior Rising</button>}
                      </a></div>
                      <div><a href="https://secondservicefoundation.org/" target="_blank" rel="noopener noreferrer">
                        {<button>Second Service Foundation</button>}
                      </a></div>
                      <div><a href="https://patriotbootcamp.org/" target="_blank" rel="noopener noreferrer">
                        {<button>Patriot Boot Camp</button>}
                      </a></div>
                      <div><a href="https://nsin.mil/" target="_blank" rel="noopener noreferrer">
                        {<button>National Security Innovation Network</button>}
                      </a></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Angel Investors</td>
                    <td>$25K-$250K</td>
                    <td>Veteran-focused networks</td>
                    <td>Equity given</td>
                    <td>Startup w/ traction</td>
                    <td>
                      <div><a href="https://hiversandstrivers.com/" target="_blank" rel="noopener noreferrer">
                        {<button>Hivers & Strivers</button>}
                      </a></div>
                      <div><a href="https://www.veteranventures.us/" target="_blank" rel="noopener noreferrer">
                        {<button>Veteran Ventures Capital</button>}
                      </a></div>
                      <div><a href="https://www.ainventures.com/" target="_blank" rel="noopener noreferrer">
                        {<button>AIN Ventures</button>}
                      </a></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Venture Capital</td>
                    <td>$500K-$10M+</td>
                    <td>Big growth capital</td>
                    <td>Lose control, hard to manage while AD</td>
                    <td>Scalable tech (post-service)</td>
                    <td>
                      <div><a href="https://www.scout.vc/" target="_blank" rel="noopener noreferrer">
                        {<button>Scout Ventures</button>}
                      </a></div>
                      <div><a href="https://tfxcap.com/" target="_blank" rel="noopener noreferrer">
                        {<button>TFX Capital</button>}
                      </a></div>
                      <div><a href="http://govtechfund.com/" target="_blank" rel="noopener noreferrer">
                        {<button>GovTech Fund</button>}
                      </a></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Loans</td>
                    <td>$10K-$500K</td>
                    <td>Retain ownership</td>
                    <td>Risky debt load</td>
                    <td>Stable, proven businesses</td>
                  </tr>
                </tbody>
              </table>
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