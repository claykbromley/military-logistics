"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { DollarSign, PiggyBank, CreditCard, Home, Receipt, Building2, ExternalLink, Scale, Fingerprint, FileText, Target, Phone, ChevronDown, Lightbulb, TrendingUp, Shield, ChevronRight, BriefcaseBusiness, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CreditPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const serviceCategories = [
    { name: "Investments", icon: TrendingUp},
    { name: "Taxes and Income", icon: PiggyBank},
    { name: "Loans", icon: Home},
    { name: "Retirement", icon: Shield},
    { name: "Start a Business", icon: BriefcaseBusiness},
    { name: "Credit", icon: CreditCard},
    { name: "Bills", icon: Receipt}
  ]

  const intro = {
    description: "Good credit is essential for military life. It affects your security clearance eligibility, ability to rent housing, car insurance rates, and access to the best loan products. The military provides unique credit protections through the Servicemembers Civil Relief Act (SCRA) and Military Lending Act (MLA). SCRA can reduce interest rates on pre-service debt to 6%, while MLA caps rates at 36% on most consumer loans. Additionally, many premium credit cards waive their annual fees entirely for active-duty service members, meaning you can access hundreds of dollars in benefits for free. Understanding and leveraging these protections is one of the smartest financial moves you can make.",
    keyFacts: [
      { label: "SCRA Rate Cap", value: "6% APR", icon: Shield },
      { label: "MLA Rate Cap", value: "36% MAPR", icon: Scale },
      { label: "Amex Platinum Fee Waiver", value: "$695 Saved", icon: CreditCard },
      { label: "Free Credit Reports", value: "AnnualCreditReport.com", icon: FileText },
    ],
    importantNote: "Place an Active Duty Alert on your credit reports with all three bureaus (Equifax, Experian, TransUnion) to protect against identity theft while deployed. This is free and lasts 12 months. You can also freeze your credit for additional protection.",
    helpfulLinks: [
      { label: "Annual Credit Report", url: "https://www.annualcreditreport.com" },
      { label: "CFPB Military Resources", url: "https://www.consumerfinance.gov/consumer-tools/military-financial-lifecycle/" },
    ],
  }

  const icons = {
    "SCRA and MLA Protections": Shield,
    "Credit Card Options": CreditCard,
    "Managing Credit Score": Target,
    "Identity Theft Protection": Fingerprint,
    "Predatory Lending Warning Signs": AlertTriangle
  }

  const page = {
    title: "Credit Options",
    sections: [
      {
        name: "SCRA and MLA Protections",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Two federal laws provide important credit protections for military members: the Servicemembers Civil Relief Act (SCRA) and the Military Lending Act (MLA).
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40 rounded-lg p-4">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">SCRA Protections</h5>
                <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  <li>6% interest rate cap on pre-service debt</li>
                  <li>Applies to credit cards, mortgages, auto loans</li>
                  <li>Must request in writing with orders</li>
                  <li>Protections last during active duty + 1 year</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/40 rounded-lg p-4">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">MLA Protections</h5>
                <ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
                  <li>36% MAPR cap on consumer loans</li>
                  <li>Covers payday loans, vehicle title loans</li>
                  <li>Applies to active duty and dependents</li>
                  <li>Automatic - no action required</li>
                </ul>
              </div>
            </div>
            <a href="https://www.consumerfinance.gov/consumer-tools/military-financial-lifecycle/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              CFPB Military Financial Resources <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "Credit Card Options",
        content: (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Choosing the right bank and credit card can save military members thousands of dollars through fee waivers, better rates, and exclusive benefits. Here is a comprehensive comparison to help you decide.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Why Military-Focused Banks?</h5>
              <p className="text-sm text-blue-700 dark:text-blue-400">Military-focused banks understand PCS moves, deployments, and unique military pay schedules. They offer features like early direct deposit, overseas ATM fee waivers, and customer service trained in military life.</p>
            </div>

            {/* USAA Section */}
            <div className="bg-card rounded-xl border-2 border-border overflow-hidden">
              <div className="bg-[#00529b] text-white p-4">
                <h4 className="text-lg font-bold">USAA</h4>
                <p className="text-sm text-blue-100">Best for: Full-service banking with insurance bundling</p>
              </div>
              <div className="p-5">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="font-semibold text-green-700 mb-2">Pros</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>Exclusive to military families - understands your needs</li>
                      <li>Early direct deposit (up to 2 days early)</li>
                      <li>Excellent mobile app and customer service</li>
                      <li>Bundle banking, insurance, and investments</li>
                      <li>No foreign transaction fees</li>
                      <li>ATM fee rebates up to $15/month</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-red-700 mb-2">Cons</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>No physical branches - online/phone only</li>
                      <li>Cash deposits can be challenging</li>
                      <li>Membership limited to military community</li>
                      <li>Credit cards have moderate rewards</li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href="https://www.usaa.com/banking/loans/auto/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#00529b] text-white text-sm rounded hover:bg-[#003d75] transition-colors">
                    Auto Loans <ExternalLink className="h-3 w-3" />
                  </a>
                  <a href="https://www.usaa.com/banking/credit-cards-public/?wa_ref=pub_global_banking_credit_cards" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#00529b] text-white text-sm rounded hover:bg-[#003d75] transition-colors">
                    Credit Cards <ExternalLink className="h-3 w-3" />
                  </a>
                  <a href="https://www.usaa.com/bank/checking-savings" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#00529b] text-white text-sm rounded hover:bg-[#003d75] transition-colors">
                    Checking/Savings <ExternalLink className="h-3 w-3" />
                  </a>
                  <a href="https://www.usaa.com/inet/wc/insurance-products?wa_ref=pub_global_insurance" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-200 text-muted-foreground text-sm rounded hover:bg-slate-300 transition-colors">
                    Insurance <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Navy Federal Section */}
            <div className="bg-card rounded-xl border-2 border-border overflow-hidden">
              <div className="bg-[#003865] text-white p-4">
                <h4 className="text-lg font-bold">Navy Federal Credit Union</h4>
                <p className="text-sm text-blue-100">Best for: Branch access + competitive rates</p>
              </div>
              <div className="p-5">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="font-semibold text-green-700 mb-2">Pros</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>350+ branches worldwide, many on military bases</li>
                      <li>Best-in-class auto loan rates</li>
                      <li>High-yield savings accounts</li>
                      <li>No monthly fees on most accounts</li>
                      <li>Excellent mortgage rates for VA loans</li>
                      <li>24/7 customer service</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-red-700 mb-2">Cons</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>Credit cards are less competitive</li>
                      <li>Technology/app can be slower than competitors</li>
                      <li>May have long wait times for service</li>
                      <li>Some products require membership tenure</li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href="https://www.navyfederal.org/loans-cards/auto-loans/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#003865] text-white text-sm rounded hover:bg-[#002a4d] transition-colors">
                    Auto Loans <ExternalLink className="h-3 w-3" />
                  </a>
                  <a href="https://www.navyfederal.org/loans-cards/credit-cards/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#003865] text-white text-sm rounded hover:bg-[#002a4d] transition-colors">
                    Credit Cards <ExternalLink className="h-3 w-3" />
                  </a>
                  <a href="https://www.navyfederal.org/checking-savings/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#003865] text-white text-sm rounded hover:bg-[#002a4d] transition-colors">
                    Checking/Savings <ExternalLink className="h-3 w-3" />
                  </a>
                  <a href="https://www.navyfederal.org/loans-cards/mortgage/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-200 text-muted-foreground text-sm rounded hover:bg-slate-300 transition-colors">
                    Mortgages <ExternalLink className="h-3 w-3" />
                  </a>
                  <a href="https://www.navyfederal.org/branches-atms/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-200 text-muted-foreground text-sm rounded hover:bg-slate-300 transition-colors">
                    Find a Branch <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* PenFed Section */}
            <div className="bg-card rounded-xl border-2 border-border overflow-hidden">
              <div className="bg-[#00205b] text-white p-4">
                <h4 className="text-lg font-bold">Pentagon Federal Credit Union (PenFed)</h4>
                <p className="text-sm text-blue-100">Best for: Credit cards and auto refinancing</p>
              </div>
              <div className="p-5">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="font-semibold text-green-700 mb-2">Pros</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>Open to all - not just military</li>
                      <li>Excellent auto loan and refinancing rates</li>
                      <li>Strong credit card rewards programs</li>
                      <li>No PMI on certain mortgages</li>
                      <li>Competitive CD and savings rates</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-red-700 mb-2">Cons</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>Limited branch network</li>
                      <li>Not military-exclusive (less specialized service)</li>
                      <li>Customer service can be inconsistent</li>
                      <li>Some products have higher requirements</li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href="https://www.penfed.org/auto/auto-loans" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#00205b] text-white text-sm rounded hover:bg-[#001640] transition-colors">
                    Auto Loans <ExternalLink className="h-3 w-3" />
                  </a>
                  <a href="https://www.penfed.org/credit-cards" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#00205b] text-white text-sm rounded hover:bg-[#001640] transition-colors">
                    Credit Cards <ExternalLink className="h-3 w-3" />
                  </a>
                  <a href="https://www.penfed.org/accounts" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#00205b] text-white text-sm rounded hover:bg-[#001640] transition-colors">
                    Accounts <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Traditional Banks Section */}
            <div className="bg-card rounded-xl border-2 border-border overflow-hidden">
              <div className="bg-slate-700 text-white p-4">
                <h4 className="text-lg font-bold">Traditional Banks with SCRA Benefits</h4>
                <p className="text-sm text-slate-200">Best for: Premium credit card rewards with fee waivers</p>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-foreground mb-2">American Express</h5>
                    <p className="text-sm text-muted-foreground mb-2">Waives ALL annual fees on ALL cards for active duty under SCRA/MLA. This includes the Platinum ($695/yr), Gold ($250/yr), and all co-branded cards.</p>
                    <div className="flex flex-wrap gap-2">
                      <a href="https://www.americanexpress.com/us/credit-cards/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#006fcf] text-white text-sm rounded hover:bg-[#0056a4] transition-colors">
                        View Cards <ExternalLink className="h-3 w-3" />
                      </a>
                      <a href="https://www.americanexpress.com/us/customer-service/faq.military-benefits.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-200 text-muted-foreground text-sm rounded hover:bg-slate-300 transition-colors">
                        SCRA Benefits <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <div className="border-b pb-4">
                    <h5 className="font-semibold text-foreground mb-2">Chase</h5>
                    <p className="text-sm text-muted-foreground mb-2">Waives annual fees on Sapphire Preferred ($95/yr) and Sapphire Reserve ($550/yr) for active duty military. Excellent travel rewards.</p>
                    <div className="flex flex-wrap gap-2">
                      <a href="https://creditcards.chase.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0f4c81] text-white text-sm rounded hover:bg-[#0a3a64] transition-colors">
                        View Cards <ExternalLink className="h-3 w-3" />
                      </a>
                      <a href="https://www.chase.com/personal/military-banking" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-200 text-muted-foreground text-sm rounded hover:bg-slate-300 transition-colors">
                        Military Benefits <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground mb-2">Bank of America</h5>
                    <p className="text-sm text-muted-foreground mb-2">Offers SCRA benefits on select cards. Strong presence near military bases with Military Banking program.</p>
                    <div className="flex flex-wrap gap-2">
                      <a href="https://www.bankofamerica.com/credit-cards/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#012169] text-white text-sm rounded hover:bg-[#010f3d] transition-colors">
                        View Cards <ExternalLink className="h-3 w-3" />
                      </a>
                      <a href="https://www.bankofamerica.com/deposits/manage/faq-active-military.go" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-200 text-muted-foreground text-sm rounded hover:bg-slate-300 transition-colors">
                        Military Benefits <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">Pro Tip: Maximize Your Benefits</h5>
              <p className="text-sm text-green-700 dark:text-green-400">Apply for premium credit cards with high annual fees (like Amex Platinum at $695/yr), then request SCRA benefits. You get the premium rewards, lounge access, and benefits without paying the fee while on active duty. Many service members use this strategy to access premium travel benefits for free.</p>
            </div>
          </div>
        ),
      },
      {
        name: "Managing Credit Score",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              A good credit score is essential for military life - from security clearances to housing. Here is how to build and maintain excellent credit.
            </p>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">Credit Score Factors</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Payment History (35%):</strong> Always pay on time - set up autopay</li>
                <li><strong>Credit Utilization (30%):</strong> Keep balances below 30% of limits</li>
                <li><strong>Credit History Length (15%):</strong> Keep old accounts open</li>
                <li><strong>Credit Mix (10%):</strong> Have different types of credit</li>
                <li><strong>New Credit (10%):</strong> Limit new applications</li>
              </ul>
            </div>
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <a href="https://www.annualcreditreport.com" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  Free Credit Reports <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">Official free annual credit reports</p>
              </a>
              <a href="https://www.consumer.ftc.gov/articles/free-credit-reports" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  FTC Credit Guide <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">Understanding your credit rights</p>
              </a>
            </div>
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 rounded-lg p-4 mt-4">
              <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Security Clearance Note</h5>
              <p className="text-sm text-amber-700 dark:text-amber-400">Financial responsibility is evaluated for security clearances. Late payments, collections, and excessive debt can impact your clearance eligibility.</p>
            </div>
          </div>
        ),
      },
      {
        name: "Identity Theft Protection",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Military members are at higher risk for identity theft due to frequent moves, shared housing, mail forwarding, and public records of service. Deploying service members are especially vulnerable because they may not check accounts for months. Taking proactive steps to protect your identity is essential.
            </p>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">Protection Steps</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Active Duty Alert:</strong> Place a free active duty alert on your credit reports with all three bureaus. Lasts 12 months and can be renewed. Requires lenders to verify your identity before issuing credit.</li>
                <li><strong>Credit Freeze:</strong> Freeze your credit with Equifax, Experian, and TransUnion for free. No one can open new credit in your name until you unfreeze.</li>
                <li><strong>Monitor Accounts:</strong> Set up transaction alerts on all bank accounts and credit cards. Check statements at least monthly.</li>
                <li><strong>Secure Mail:</strong> Use a PO Box or informed delivery service. Do not leave mail unattended during PCS.</li>
                <li><strong>Shred Documents:</strong> Destroy documents with personal information, especially LES, orders, and financial statements.</li>
              </ul>
            </div>
            <div className="grid gap-4 md:grid-cols-3 mt-4">
              <a href="https://www.equifax.com/personal/credit-report-services/credit-freeze/" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors text-center">
                <h5 className="font-semibold text-foreground mb-1 text-sm flex items-center justify-center gap-1">
                  Equifax Freeze <ExternalLink className="h-3 w-3 text-primary" />
                </h5>
              </a>
              <a href="https://www.experian.com/freeze/center.html" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors text-center">
                <h5 className="font-semibold text-foreground mb-1 text-sm flex items-center justify-center gap-1">
                  Experian Freeze <ExternalLink className="h-3 w-3 text-primary" />
                </h5>
              </a>
              <a href="https://www.transunion.com/credit-freeze" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors text-center">
                <h5 className="font-semibold text-foreground mb-1 text-sm flex items-center justify-center gap-1">
                  TransUnion Freeze <ExternalLink className="h-3 w-3 text-primary" />
                </h5>
              </a>
            </div>
            <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">If You Are a Victim</h5>
              <p className="text-sm text-blue-700 dark:text-blue-400">Report identity theft immediately at IdentityTheft.gov, contact your branch Inspector General, and notify your security manager (identity theft can affect clearances). File a police report and contact all three credit bureaus to place fraud alerts.</p>
            </div>
            <a href="https://www.identitytheft.gov" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              IdentityTheft.gov <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "Predatory Lending Warning Signs",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Predatory lenders specifically target military members, often setting up shop just outside the gates of military installations. Knowing the warning signs can save you thousands of dollars and protect your career.
            </p>
            <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-red-800 dark:text-red-300 mb-2">Red Flags to Watch For</h5>
              <ul className="space-y-2 text-sm text-red-700 dark:text-red-400">
                <li><strong>Payday Loans:</strong> These charge triple-digit APRs. The MLA caps rates at 36% for active duty, but some lenders find loopholes.</li>
                <li><strong>Vehicle Title Loans:</strong> You risk losing your car if you cannot repay. Interest rates often exceed 100% APR.</li>
                <li><strong>Rent-to-Own:</strong> You can end up paying 2-3 times the retail price for furniture or electronics.</li>
                <li><strong>{"Military Specials"} at Dealerships:</strong> Often come with inflated prices, high APRs, and unnecessary add-ons targeting new service members.</li>
                <li><strong>Advance Fee Scams:</strong> Legitimate lenders never require upfront payment to process a loan.</li>
              </ul>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">How to Protect Yourself</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Always compare rates from USAA, Navy Federal, or PenFed before accepting any loan</li>
                <li>Never sign anything under pressure -- take contracts home and review</li>
                <li>Consult your installation Legal Assistance Office before signing large financial contracts</li>
                <li>Report predatory practices to your installation command and the CFPB</li>
                <li>Use the CFPB complaint database to check lender history</li>
              </ul>
            </div>
            <a href="https://www.consumerfinance.gov/complaint/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              File a CFPB Complaint <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
    ],
  }

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionName) ? prev.filter(id => id !== sectionName) : [...prev, sectionName]
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
           <a href="/" className="hover:text-primary transition-colors">
              Home
            </a>
            <ChevronRight className="h-4 w-4" />
            <a className="hover:text-primary transition-colors">
              Services
            </a>
            <ChevronRight className="h-4 w-4" />
            <a href="/services/financial" className="hover:text-primary transition-colors">
              Financial
            </a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Credit</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)]">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 bg-sidebar border-r overflow-y-auto">
          <div className="top-20 p-6">
            <a href="/services/financial">
              <h2 className="text-2xl font-bold text-sidebar-foreground mb-6 pb-3 border-b-2 border-muted-foreground text-center">
                Financial Services
              </h2>
            </a>
            <div className="space-y-3">
              <a key={"finance-manager"} href={`/services/command-center/financial`} className="block">
                <Card
                  key={"finance-manager"}
                  className="p-4 hover:shadow-md transition-all cursor-pointer bg-card border-2 hover:border-primary group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-card-foreground/10 group-hover:bg-card-foreground/20 transition-colors">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                        Financial Manager
                      </h3>
                    </div>
                  </div>
                </Card>
              </a>
              {serviceCategories.map((category) => {
                const Icon = category.icon
                const href = `/services/financial/${category.name.toLowerCase().replace(/\s+/g, "-")}`
                return (
                  <a key={category.name} href={href} className="block">
                    <Card
                      key={category.name}
                      className="p-4 hover:shadow-md transition-all cursor-pointer bg-card border-2 hover:border-primary group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-card-foreground/10 group-hover:bg-card-foreground/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </Card>
                  </a>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative">
          <div className="relative z-10 p-6 lg:p-12">
            <div className="flex flex-col max-w-6xl mx-auto min-h-full space-y-8">
              {/* Title and description */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-3">{page.title}</h2>
                <p className="text-muted-foreground">
                  {intro.description}
                </p>
              </div>

              {/* Key Facts - outside of boxes, displayed as inline stats */}
              {intro?.keyFacts && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {intro.keyFacts.map((fact, idx) => {
                    const FactIcon = fact.icon
                    return (
                      <div key={idx} className="flex flex-col items-center text-center p-4 bg-card rounded-xl border border-border shadow-sm">
                        <FactIcon className="h-6 w-6 text-primary mb-2" />
                        <span className="text-lg font-bold text-foreground">{fact.value}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">{fact.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Important note - outside of boxes, styled as inline callout */}
              {intro?.importantNote && (
                <div className="flex items-start gap-3 p-1">
                  <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Good to know:</strong> {intro.importantNote}
                  </p>
                </div>
              )}

              {/* Quick helpful links - outside of boxes */}
              {intro?.helpfulLinks && (
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                  {intro.helpfulLinks.map((link, idx) => (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">
                      <Button className="h-auto py-4 justify-start gap-3 bg-card cursor-pointer w-full" variant="outline">
                        <span>{link.label}</span>
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </Button>
                    </a>
                  ))}
                </div>
              )}

              {/* Divider */}
              <hr className="border-muted-foreground" />

              {/* Section Cards */}
              {page.sections.map((section, idx) => {
                const isExpanded = expandedSections.includes(section.name)
                const SectionIcon = icons[section.name as keyof typeof icons]
                return (
                  <Card key={idx} className="border border overflow-hidden p-0">
                    <button
                      type="button"
                      onClick={() => toggleSection(section.name)}
                      className="w-full flex items-start p-6 hover:bg-muted transition-colors text-left"
                    >
                      <div className="w-full flex items-center gap-6">
                        <div className={`rounded-lg`}>
                          <SectionIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground mb-1">{section.name}</h3>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t bg-background">
                        {section.content}
                      </div>
                    )}
                  </Card>
                )
              })}

              {/* Bottom helpful resources section - outside of main content boxes */}
              <div className="pt-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Every military installation has free financial counseling available. You do not need an appointment for most services, and everything is confidential. These resources are available to active duty, Guard, Reserve, and their families.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <a
                    href="https://www.militaryonesource.mil/financial-legal/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="h-auto py-4 justify-start gap-3 bg-card cursor-pointer w-full" variant="outline">
                      <Phone className="h-4 w-4" />
                      Military OneSource (800-342-9647)
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                  <a
                    href="https://www.consumerfinance.gov/consumer-tools/military-financial-lifecycle/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="h-auto py-4 justify-start gap-3 bg-card cursor-pointer w-full" variant="outline">
                      <Building2 className="h-4 w-4" />
                      CFPB Military Resources
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
