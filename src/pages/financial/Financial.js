import './financial.css'
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_KEY = "d32tt99r01qtm631kfi0d32tt99r01qtm631kfig";
const FIXED_STOCKS = ["QQQ", "SPY", "DIA"];
const CYCLING_STOCKS = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN", "NVDA", "META"];

export default function Financial() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [stockerror, setStockError] = useState(null);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [news, setNews] = useState([]);

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
    <div className='financial-page'>
      <div className='services'>
        <div className='option-header'><Link key={"../financial"} to={"../financial"}>Financial Services</Link></div>
        <hr />
        <div className='services-option'><Link key={"./investments"} to={"./investments"}>Investments</Link></div>
        <div className='services-option'><Link key={"./taxes"} to={"./taxes"}>Taxes and Income</Link></div>
        <div className='services-option'><Link key={"./loans"} to={"./loans"}>Loans</Link></div>
        <div className='services-option'><Link key={"./retirement"} to={"./retirement"}>Retirement</Link></div>
        <div className='services-option'><Link key={"./business"} to={"./business"}>Start a Business</Link></div>
        <div className='services-option'><Link key={"./credit"} to={"./credit"}>Credit</Link></div>
        <div className='services-option'><Link key={"./bills"} to={"./bills"}>Manage Bills</Link></div>
      </div>
      <div className='main'>
        <div className='news'>
          {error?
            <div style={{textAlign:'center'}}>{error}</div>:
            <div>
              <div style={{textAlign:'center'}}>
                <h1 style={{margin:0}}>Financial News</h1>
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
        {stockerror?
          <div style={{textAlign:'center'}}>{stockerror}</div>:
          <div className='stocks'>
            {data.map(stock => (
              <div className="stock-option" style={{
                color: stock.percentChange >= 0 ? "#00bf00ff" : "#c70000ff",
                backgroundColor: stock.percentChange >= 0 ? "#e0f9e0" : "#f9e0e0",
                border: stock.percentChange >= 0 ? "solid 2px #00bf00ff" : "solid 2px #c70000ff", }}>
                {stock.symbol}: {stock.price?.toFixed(2)}
                ({stock.percentChange >= 0 ? "+" : ""}
                {stock.percentChange?.toFixed(2)}%)
              </div>
            ))}
          </div>}
      </div>
    </div>
  );
}
