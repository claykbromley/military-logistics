import '../App.css'
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_KEY = "d32tt99r01qtm631kfi0d32tt99r01qtm631kfig";
const FIXED_STOCKS = ["QQQ", "SPY", "DIA"];
const CYCLING_STOCKS = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN", "NVDA", "META"];

export default function Financial() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
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

  const fetchStockData = async () => {
    try {
      setError(null);

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
      setError("Failed to load stock data");
    }
  };

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 60 * 1000); 
    return () => clearInterval(interval);
  }, [cycleIndex]);

  if (error) return <div>{error}</div>;

  return (
    <div className='financial-page'>
      <div className='services'>
        <h3>Financial Services</h3>
        <hr />
        <div className='services-option'>Investments</div>
        <div className='services-option'>File Taxes</div>
        <div className='services-option'>Loans</div>
        <div className='services-option'>Retirement</div>
        <div className='services-option'>Start a Business</div>
        <div className='services-option'>Credit</div>
        <div className='services-option'>Manage Bills</div>
      </div>
      <div className='main'>
        <div className='news'>
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
        </div>
        <div className='stocks'>
          {data.map(stock => (
            <div className="stock-option" style={{
              color: stock.percentChange >= 0 ? "#00bf00ff" : "#c70000ff",
              backgroundColor: stock.percentChange >= 0 ? "#e0f9e0" : "#f9e0e0" }}>
              {stock.symbol}: {stock.price?.toFixed(2)}
              ({stock.percentChange >= 0 ? "+" : ""}
              {stock.percentChange?.toFixed(2)}%)
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
