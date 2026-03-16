"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  DollarSign, PiggyBank, CreditCard, Home, TrendingUp,
  Shield, ChevronRight, BriefcaseBusiness, ArrowUpRight,
  ArrowDownRight, ExternalLink, Clock, Newspaper,
  Sparkles, Receipt
} from "lucide-react"
import { Card } from "@/components/ui/card"
import axios from "axios"

/* ─── Constants ─── */

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY
const FIXED_STOCKS = ["QQQ", "SPY", "DIA"]
const CYCLING_STOCKS = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN", "NVDA", "META"]

const serviceCategories = [
  { name: "Investments", icon: TrendingUp},
  { name: "Taxes and Income", icon: PiggyBank},
  { name: "Loans", icon: Home},
  { name: "Retirement", icon: Shield},
  { name: "Start a Business", icon: BriefcaseBusiness},
  { name: "Credit", icon: CreditCard},
  { name: "Bills", icon: Receipt}
]

/* ─── Types ─── */

type Stock = {
  symbol: string
  price: number
  change: number
  percentChange: number
}

type NewsItem = {
  id: string
  url: string
  headline: string
  datetime: number
  summary: string
}

/* ─── Helpers ─── */

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

/* ─── Sub-components ─── */

function StockPill({ stock }: { stock: Stock }) {
  const up = stock.percentChange >= 0
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span className="text-xs font-bold tracking-wide text-foreground">{stock.symbol}</span>
      <span className="font-medium tabular-nums text-muted-foreground">${stock.price?.toFixed(2)}</span>
      <span
        className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
          up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}
      >
        {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {up ? "+" : ""}{stock.percentChange?.toFixed(2)}%
      </span>
    </div>
  )
}

function NewsCard({ item }: { item: NewsItem }) {
  const timeAgo = getTimeAgo(new Date(item.datetime * 1000))
  const summary = item.summary?.length > 150 ? item.summary.slice(0, 150) + "…" : item.summary

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block no-underline"
    >
      <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary group-hover:shadow-lg">
        <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium text-primary">
          <Clock size={11} />
          <span>{timeAgo}</span>
        </div>
        <h3 className="mb-2 text-[15px] font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
          {item.headline}
        </h3>
        {summary && (
          <p className="mb-3 flex-1 text-[13px] leading-relaxed text-muted-foreground">{summary}</p>
        )}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 transition-all group-hover:opacity-100">
          Read article <ExternalLink size={11} />
        </div>
      </div>
    </a>
  )
}

/* ─── Main Page ─── */

export default function FinancialPage() {
  const [data, setData] = useState<Stock[]>([])
  const [stockError, setStockError] = useState<string | null>(null)
  const [cycleIndex, setCycleIndex] = useState(0)
  const [news, setNews] = useState<NewsItem[]>([])
  const [newsError, setNewsError] = useState<string | null>(null)

  /* Fetch news */
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setNewsError(null)
        const res = await axios.get<NewsItem[]>(
          `https://finnhub.io/api/v1/news?category=general&token=${API_KEY}`
        )
        setNews(res.data.slice(0, 20))
      } catch {
        setNewsError("Unable to load financial news right now.")
      }
    }
    fetchNews()
    const id = setInterval(fetchNews, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  /* Cycle through extra stocks */
  useEffect(() => {
    const id = setInterval(() => {
      setCycleIndex((p) => (p + 1) % CYCLING_STOCKS.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  /* Fetch stock quotes */
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setStockError(null)
        const symbols = [...FIXED_STOCKS, CYCLING_STOCKS[cycleIndex]]
        const responses = await Promise.all(
          symbols.map((s) =>
            axios.get(`https://finnhub.io/api/v1/quote?symbol=${s}&token=${API_KEY}`)
          )
        )
        setData(
          responses.map((r, i) => ({
            symbol: symbols[i],
            price: r.data.c,
            change: r.data.d,
            percentChange: r.data.dp,
          }))
        )
      } catch {
        setStockError("Unable to load market data.")
      }
    }
    fetchStocks()
    const id = setInterval(fetchStocks, 60 * 1000)
    return () => clearInterval(id)
  }, [cycleIndex])

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
            <span className="text-foreground font-medium">Financial</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 bg-sidebar border-r">
          <div className="p-6">
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

        {/* ── Main Content ── */}
        <main className="flex-1 lg:sticky lg:top-0 lg:h-screen overflow-y-auto px-5 py-7 lg:px-10">
          <div className="mx-auto max-w-[960px]">

            {/* Hero */}
            <div className="mb-7 text-center">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-5 bg-primary text-primary-foreground">
                <Sparkles className="w-3 h-3" />
                Financial Readiness
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight text-foreground">
                Financial Services &amp; Benefits
              </h1>
              <p className="text-base lg:text-lg max-w-lg mx-auto text-muted-foreground">
                Tools, guidance, and real-time market data to help you make
                confident financial decisions during and after service.
              </p>
            </div>

            {/* Stock Ticker */}
            {stockError ? (
              <div className="mb-7 rounded-lg bg-stone-100 p-4 text-center text-sm text-stone-400">
                {stockError}
              </div>
            ) : (
              <div className="mb-8 flex flex-wrap justify-center gap-1">
                {data.map((stock) => (
                  <StockPill key={stock.symbol} stock={stock} />
                ))}
              </div>
            )}

            {/* News header */}
            <div className="mb-5 flex items-center gap-2.5 border-b-2 border-muted-foreground pb-3">
              <Newspaper size={18} className="text-muted-foreground" />
              <h2 className="text-lg font-bold tracking-tight text-muted-foreground">Market News</h2>
            </div>

            {/* News grid */}
            {newsError ? (
              <div className="py-10 text-center text-sm text-stone-400">{newsError}</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {news.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}