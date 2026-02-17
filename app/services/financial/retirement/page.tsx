"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { DollarSign, PiggyBank, CreditCard, Home, Receipt, Building2, ExternalLink, BadgeCheck, Target, HeartHandshake, Globe, Phone, ChevronDown, Lightbulb, TrendingUp, Shield, ChevronRight, BriefcaseBusiness } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function RetirementPage() {
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
    description: "Military retirement planning has changed significantly with the introduction of the Blended Retirement System (BRS) in 2018. Under BRS, the DoD automatically contributes 1% of your base pay to TSP and matches up to an additional 4% of your contributions. Unlike the legacy system where you needed 20 years to receive any retirement benefit, BRS provides a portable retirement benefit through TSP matching from your very first day of service. Even if you serve only four years, you leave with a valuable retirement account. For those who serve 20 or more years, you still receive a defined pension benefit, though at a slightly reduced multiplier (2.0% vs 2.5% per year).",
    keyFacts: [
      { label: "BRS Auto Contribution", value: "1% of Base Pay", icon: BadgeCheck },
      { label: "Full TSP Match", value: "5% Total", icon: DollarSign },
      { label: "20-Year Pension (BRS)", value: "40% Base Pay", icon: PiggyBank },
      { label: "Continuation Pay", value: "At 12 Years", icon: Target },
    ],
    importantNote: "The single most important thing you can do for your retirement is contribute at least 5% of your base pay to TSP from the start of your career. This ensures you receive the full government match. Every dollar you miss in matching is money left on the table. Even an E-1 contributing 5% builds significant wealth over a 4-year enlistment.",
    helpfulLinks: [
      { label: "BRS Overview", url: "https://militarypay.defense.gov/blendedretirement/" },
      { label: "TSP.gov", url: "https://www.tsp.gov" },
    ],
  }

  const icons = {
    "Blended Retirement System": PiggyBank,
    "Thrift Savings Plan (TSP)": TrendingUp,
    "Retirement Calculator": DollarSign,
    "Roth IRA": PiggyBank,
    "VA Disability & Retirement Pay": Shield,
    "Survivor Benefit Plan (SBP)": HeartHandshake,
    "Social Security & Military Service": Globe,
  }

  const page = {
    title: "Retirement Planning",
    sections: [
      {
        name: "Blended Retirement System",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              The Blended Retirement System (BRS) became the default retirement plan for all service members who entered after January 1, 2018. It combines a reduced defined-benefit pension (2.0% per year of service instead of the legacy 2.5%) with government matching contributions to the Thrift Savings Plan. The key advantage of BRS is that it provides retirement benefits to everyone who serves, not just the roughly 17% who reach 20 years under the legacy system. Even a service member who serves a single four-year enlistment leaves with a portable TSP account funded by government contributions.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">BRS Components</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><strong>Defined Benefit:</strong> 2% x years of service x base pay (at 20 years = 40%)</li>
                  <li><strong>TSP Matching:</strong> Up to 5% government match</li>
                  <li><strong>Continuation Pay:</strong> Lump sum bonus at 12 years (2.5x to 13x monthly base pay depending on branch)</li>
                  <li><strong>Lump Sum Option:</strong> At retirement, elect to receive 25% or 50% of pension as lump sum (reduced monthly until age 67)</li>
                </ul>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">TSP Matching Schedule</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><strong>Automatic 1%:</strong> DoD contributes 1% regardless of your contribution (starts at 60 days)</li>
                  <li><strong>Matching (3%):</strong> DoD matches your contributions dollar-for-dollar on first 3% (starts at 2 years)</li>
                  <li><strong>Matching (2%):</strong> DoD matches 50 cents per dollar on next 2%</li>
                  <li><strong>Total:</strong> Contribute 5% to get the full 5% government match</li>
                  <li><strong>Vesting:</strong> Government contributions vest at 2 years of service</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">BRS vs. Legacy: Which is Better?</h5>
              <p className="text-sm text-blue-700 dark:text-blue-400">If you are certain you will serve 20 or more years, the legacy system pays a higher pension (50% vs 40% at 20 years). However, if there is any chance you may separate before 20 years, BRS is significantly better because you take your TSP with you. Statistically, over 80% of service members separate before 20 years, making BRS the better choice for most.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Continuation Pay Strategy</h5>
              <p className="text-sm text-amber-700 dark:text-amber-400">When you receive continuation pay at your 12-year mark, consider investing it rather than spending it. Depositing it into your TSP, Roth IRA, or a brokerage account accelerates your retirement savings at a critical mid-career point.</p>
            </div>
            <a href="https://militarypay.defense.gov/blendedretirement/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              BRS Information <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "Thrift Savings Plan (TSP)",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              The Thrift Savings Plan is the federal government{"'"}s equivalent of a 401(k), and it is one of the best retirement accounts available anywhere. With expense ratios as low as 0.043% -- compared to 0.5% to 1.0% for most civilian plans -- TSP lets you keep more of your investment returns over time. You can contribute to Traditional TSP (tax-deferred) or Roth TSP (after-tax, tax-free growth), or split contributions between both. Most financial advisors recommend Roth TSP for junior service members in lower tax brackets, since your tax rate will likely be higher in retirement.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">2026 Contribution Limits</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><strong>Elective Deferral:</strong> $23,500</li>
                  <li><strong>Catch-up (age 50+):</strong> Additional $7,500</li>
                  <li><strong>Super Catch-up (60-63):</strong> Additional $11,250</li>
                  <li><strong>Annual Addition Limit:</strong> $70,000 (includes all contributions)</li>
                </ul>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">TSP Fund Options</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><strong>G Fund:</strong> Government securities (low risk, low return)</li>
                  <li><strong>F Fund:</strong> Fixed income / bonds index</li>
                  <li><strong>C Fund:</strong> S&P 500 large-cap stock index</li>
                  <li><strong>S Fund:</strong> Small and mid-cap stock index</li>
                  <li><strong>I Fund:</strong> International stock index</li>
                  <li><strong>L Funds:</strong> Lifecycle target-date funds (auto-rebalancing)</li>
                </ul>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">Combat Zone Advantage</h5>
              <p className="text-sm text-green-700 dark:text-green-400">Contributions from tax-free combat pay to your Roth TSP grow tax-free and withdrawals in retirement are also tax-free -- this is a triple tax benefit (no tax on the money going in, no tax on growth, no tax on withdrawal). During a deployment, consider maxing out Roth TSP contributions if your budget allows.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Roth vs. Traditional TSP</h5>
              <p className="text-sm text-blue-700 dark:text-blue-400">Choose Roth TSP if you are in a low tax bracket now (most E-1 through E-6 and O-1 through O-3). Choose Traditional TSP if you are in a higher bracket and want the immediate tax deduction. You can split contributions between both. The government matching always goes into Traditional TSP regardless of your election.</p>
            </div>
            <a href="https://www.tsp.gov" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              TSP.gov <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "Retirement Calculator",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Planning for retirement requires understanding how your military pension, TSP, Social Security, and VA disability pay all work together. These official calculators help you model different scenarios -- such as retiring at 20 years vs. 24 years, contributing different amounts to TSP, or delaying Social Security. Running the numbers early in your career gives you a clear target and helps you make informed decisions about reenlistment, TSP contributions, and post-military career planning.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <a href="https://www.tsp.gov/calculators/" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  TSP Calculators <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">Retirement income, loan payments, and contribution calculators</p>
              </a>
              <a href="https://militarypay.defense.gov/calculators/blended-retirement-system-comparison-calculator/" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  BRS Calculator <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">Compare BRS vs Legacy retirement</p>
              </a>
              <a href="https://militarypay.defense.gov/calculators/retirement-calculator/" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  Military Retirement Calculator <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">Estimate your military pension</p>
              </a>
              <a href="https://www.ssa.gov/benefits/retirement/estimator.html" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  Social Security Estimator <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">Estimate future Social Security benefits</p>
              </a>
            </div>
          </div>
        ),
      },
      {
        name: "Roth IRA",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              A Roth IRA is an excellent supplement to your TSP, offering additional tax-advantaged retirement savings with significantly more investment options and withdrawal flexibility. While TSP limits you to a handful of index funds, a Roth IRA at brokerages like Vanguard, Fidelity, or Schwab gives you access to thousands of mutual funds, ETFs, individual stocks, and bonds. Another key advantage: you can withdraw your contributions (not earnings) at any time without penalty, making it a flexible savings vehicle for both retirement and emergencies. Most military financial advisors recommend maxing out both TSP (for the match) and a Roth IRA each year.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">2026 Roth IRA Limits</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><strong>Contribution Limit:</strong> $7,000</li>
                  <li><strong>Catch-up (50+):</strong> Additional $1,000</li>
                  <li><strong>Income Limit (Single):</strong> $161,000 (phase-out begins at $146,000)</li>
                  <li><strong>Income Limit (Married):</strong> $240,000 (phase-out begins at $230,000)</li>
                </ul>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">Roth IRA Benefits</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Tax-free growth and withdrawals</li>
                  <li>No required minimum distributions</li>
                  <li>Withdraw contributions anytime penalty-free</li>
                  <li>More investment options than TSP</li>
                  <li>Can be passed to heirs tax-free</li>
                </ul>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">Military Advantage</h5>
              <p className="text-sm text-green-700 dark:text-green-400">{"Military members often qualify for Roth IRA contributions even with high total compensation because BAH and BAS don't count toward the income limits."}</p>
            </div>
          </div>
        ),
      },
      {
        name: "VA Disability & Retirement Pay",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Many service members retire with both military retirement pay and VA disability compensation, and understanding how these two income streams interact is critical to maximizing your total retirement income. Historically, retirees had their military pension reduced dollar-for-dollar by the amount of VA disability they received (called the {"'"}VA waiver{"'"}). The CRDP and CRSC programs were created to eliminate or reduce this offset for qualifying retirees. VA disability pay is entirely tax-free, which makes it especially valuable. Even a 10% VA rating can be worth tens of thousands of dollars over a lifetime when you factor in the tax savings and annual COLA increases.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">CRDP (Concurrent Retirement & Disability Pay)</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><strong>Eligibility:</strong> 20+ years of service and 50%+ VA disability rating</li>
                  <li><strong>Benefit:</strong> Receive full military retirement pay AND full VA disability pay</li>
                  <li><strong>Taxability:</strong> Military retirement pay is taxable; VA disability is tax-free</li>
                  <li><strong>Phase-In:</strong> Fully phased in since 2014</li>
                </ul>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <h5 className="font-semibold text-foreground mb-2">CRSC (Combat-Related Special Compensation)</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><strong>Eligibility:</strong> 20+ years or medically retired with combat-related disabilities</li>
                  <li><strong>Benefit:</strong> Tax-free compensation for combat-related disabilities</li>
                  <li><strong>Application:</strong> Must apply through your branch of service</li>
                  <li><strong>Note:</strong> Cannot receive both CRDP and CRSC -- the system pays whichever is higher</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Key Difference</h5>
              <p className="text-sm text-blue-700 dark:text-blue-400">CRDP restores your full retirement pay (taxable). CRSC provides tax-free compensation specifically for combat-related disabilities. If eligible for both, DFAS automatically calculates and pays the higher amount.</p>
            </div>
            <a href="https://www.dfas.mil/retiredmilitary/disability/crdp/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              DFAS CRDP Information <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "Survivor Benefit Plan (SBP)",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              The Survivor Benefit Plan is a government-subsidized annuity that ensures your spouse or other eligible dependents continue receiving a portion of your military retirement pay after your death. The decision to enroll or decline SBP must be made at retirement, and it is essentially irrevocable. If you decline, your spouse must sign a written acknowledgment. SBP costs 6.5% of your selected base amount, and your survivors receive 55% of that amount monthly for life. Unlike private life insurance, SBP payments are adjusted annually for cost of living, never expire, and cannot be canceled by the government. The trade-off is that SBP is offset by VA Dependency and Indemnity Compensation (DIC), which reduces its effective value for survivors who also qualify for DIC due to a service-connected death.
            </p>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">SBP Key Details</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Cost:</strong> 6.5% of your selected base amount (deducted from retirement pay)</li>
                <li><strong>Benefit:</strong> Surviving spouse receives 55% of the selected base amount</li>
                <li><strong>Automatic Enrollment:</strong> You are automatically enrolled at maximum coverage at retirement unless you opt out (with spouse concurrence)</li>
                <li><strong>DIC Offset:</strong> SBP is offset dollar-for-dollar by VA Dependency and Indemnity Compensation (DIC) if the death is service-connected</li>
                <li><strong>Paid-Up SBP:</strong> After 30 years of participation (and reaching age 70), premiums stop but coverage continues</li>
              </ul>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/40 rounded-lg p-4">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">Pros</h5>
                <ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
                  <li>Government-subsidized life insurance</li>
                  <li>Inflation-adjusted payments (COLA)</li>
                  <li>Cannot be canceled by the insurer</li>
                  <li>Premiums are tax-deductible</li>
                </ul>
              </div>
              <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 rounded-lg p-4">
                <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Cons</h5>
                <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-400">
                  <li>DIC offset reduces effective benefit</li>
                  <li>Only 55% of base amount (not full retirement)</li>
                  <li>Cannot easily change or cancel after retirement</li>
                  <li>Cost may exceed comparable term life insurance</li>
                </ul>
              </div>
            </div>
            <a href="https://militarypay.defense.gov/Benefits/Survivor-Benefit-Program/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
              DoD SBP Information <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ),
      },
      {
        name: "Social Security & Military Service",
        content: (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Military service counts fully toward Social Security. You pay Social Security taxes on your base pay (not allowances like BAH/BAS), and you earn credits just like civilian workers. What many service members do not realize is that Social Security can become a significant portion of your total retirement income, especially if you served 20+ years and then had a civilian career. Your Social Security benefit is calculated based on your highest 35 years of earnings, so a second career after the military can substantially increase your benefit. Military retirees are in a unique position to delay claiming Social Security until age 70, since the military pension provides a guaranteed income floor. Delaying from 62 to 70 increases your monthly benefit by approximately 77%.
            </p>
            <div className="bg-card p-4 rounded-lg border">
              <h5 className="font-semibold text-foreground mb-2">Military Social Security Credits</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Standard Credits:</strong> You pay Social Security taxes on military base pay and earn credits like any worker</li>
                <li><strong>Special Extra Credits:</strong> For service 1957-2001, you received an additional $300 in earnings for each $100 in active duty base pay (up to $1,200/year)</li>
                <li><strong>Post-2001:</strong> No special extra credits, but standard credits still apply</li>
                <li><strong>Disability:</strong> Military disability retirement may affect when you can claim Social Security disability benefits</li>
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 rounded-lg p-4">
              <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">When to Claim</h5>
              <p className="text-sm text-amber-700 dark:text-amber-400">Since you have a military pension as a guaranteed income floor, consider delaying Social Security to age 70 for the maximum benefit (132% of your full retirement age benefit). Your pension covers basic needs while Social Security grows 8% per year for every year you delay past full retirement age.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <a href="https://www.ssa.gov/benefits/retirement/estimator.html" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  Social Security Estimator <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">Estimate your future benefits</p>
              </a>
              <a href="https://www.ssa.gov/pubs/EN-05-10017.pdf" target="_blank" rel="noopener noreferrer" className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  Military Service & SS (PDF) <ExternalLink className="h-4 w-4 text-primary" />
                </h5>
                <p className="text-sm text-muted-foreground">SSA publication on military credits</p>
              </a>
            </div>
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
            <span className="text-foreground font-medium">Retirement</span>
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
