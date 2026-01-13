"use client"

import { Header } from "@/components/header"
import { DollarSign, PiggyBank, CreditCard, Home, TrendingUp, Shield, ChevronRight, BriefcaseBusiness } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import axios from "axios"

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const FIXED_STOCKS = ["QQQ", "SPY", "DIA"];
const CYCLING_STOCKS = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN", "NVDA", "META"];

export default function FinancialPage() {
  const serviceCategories = [
    { name: "Manage Finances", icon: DollarSign, description: "Control your monthly bills and investments" },
    { name: "Investments", icon: TrendingUp, description: "Learn about investment options to grow your capital" },
    { name: "Taxes and Income", icon: PiggyBank, description: "Analyze your income and file your taxes" },
    { name: "Loans", icon: Home, description: "Secure loans for important life changes" },
    { name: "Retirement", icon: Shield, description: "Prepare for a life after the military" },
    { name: "Start a Business", icon: BriefcaseBusiness, description: "Manage a side business while active duty" },
    { name: "Credit", icon: CreditCard, description: "Grow your credit and explore card options" },
  ]

  type Stock = {
    symbol: string;
    price: number;
    change: number;
    percentChange: number;
  };

  type News = {
    id: string;
    url: string;
    headline: string;
    datetime: number;
    summary: string;
  };


  const [data, setData] = useState<Stock[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stockerror, setStockError] = useState<string | null>(null);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [news, setNews] = useState<News[]>([]);

  const fetchNews = async () => {
    try {
      setError(null);

      const response = await axios.get(
        `https://finnhub.io/api/v1/news?category=general&token=${API_KEY}`
      );

      setNews(response.data.slice(0, 20));
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to load financial news");
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % CYCLING_STOCKS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setStockError(null);

        const currentStocks = [...FIXED_STOCKS, CYCLING_STOCKS[cycleIndex]];
        const responses = await Promise.all(
          currentStocks.map(symbol =>
            axios.get(
              `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
            )
          )
        );

        const stocks = responses.map((resp, i) => {
          const q = resp.data;  
          return {
            symbol: currentStocks[i],
            price: q.c,
            change: q.d,
            percentChange: q.dp
          };
        });

        setData(stocks);
      } catch (err) {
        console.error("Error fetching stock data:", err);
        setStockError("Failed to load stock data");
      }
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, 60 * 1000); 
    return () => clearInterval(interval);
  }, [cycleIndex]);

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

      <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)] overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 bg-slate-100 border-r overflow-y-auto">
          <div className="top-20 p-6">
            <a href="/services/financial">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-slate-300 text-center">
                Financial Services
              </h2>
            </a>
            <div className="space-y-3">
              {serviceCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Card
                    key={category.name}
                    className="p-4 hover:shadow-md transition-all cursor-pointer bg-white border-2 hover:border-primary group"
                  >
                    <a key={category.name} href={`/services/financial/${category.name.toLowerCase().replace(/\s+/g, "-")}`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                    </a>
                  </Card>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex flex-1 relative flex-col h-full min-h-0 overflow-hidden">
          <div className="relative z-10 p-6 lg:px-12 lg:py-3 h-full min-h-0">
            <div className="flex flex-col max-w-6xl mx-auto h-full min-h-0">
              <div className="text-center mb-2 flex-shrink-0">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Financial Services and Benefits</h1>
                {stockerror?
                  <div className="text-center">{stockerror}</div>:
                  <div className="flex bg-[lightgray] rounded-[5px] p-[8px] justify-space-evenly">
                    {data.map(stock => (
                      <div key={stock.symbol} className="flex flex-1 justify-center">
                        <div key={stock.symbol} className="p-[8px] rounded-[10px]"
                        style={{
                          color: stock.percentChange >= 0 ? "#00bf00ff" : "#c70000ff",
                          backgroundColor: stock.percentChange >= 0 ? "#e0f9e0" : "#f9e0e0",
                          border: stock.percentChange >= 0 ? "solid 2px #00bf00ff" : "solid 2px #c70000ff", }}>
                          {stock.symbol}: {stock.price?.toFixed(2)}
                          ({stock.percentChange >= 0 ? "+" : ""}
                          {stock.percentChange?.toFixed(2)}%)
                        </div>
                      </div>
                    ))}
                  </div>}
                </div>
              <div className="overflow-y-auto h-full flex-1">
                {error?
                  <div className="text-center">{error}</div>:
                  <div>
                    <div className="text-center">
                      <h1 className="md:text-3xl font-bold text-slate-900 m-4">Financial News</h1>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {news.map((item) => (
                        <li key={item.id} style={{
                          marginBottom: 20,
                          padding: 15,
                          border: "1px solid #ddd",
                          borderRadius: 8
                        }}>
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ textDecoration: "none", color: "#0a2a66", fontWeight: "bold" }}
                          >
                            {item.headline}
                          </a>
                          <p style={{ margin: "5px 0", color: "#555" }}>
                            {new Date(item.datetime * 1000).toLocaleString()}
                          </p>
                          {item.summary && <p style={{ color: "#333" }}>{item.summary}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
