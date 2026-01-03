import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

type PolygonTickerResult = {
  ticker: string;
};

type PolygonTickerResponse = {
  results?: PolygonTickerResult[];
};

export async function searchTickers(query: string): Promise<string[]> {
  const res = await fetch(
    `https://api.polygon.io/v3/reference/tickers?search=${encodeURIComponent(
      query
    )}&active=true&limit=5&apiKey=${process.env.NEXT_PUBLIC_POLYGON_API_KEY}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch tickers");
  }

  const data: PolygonTickerResponse = await res.json();
  return data.results?.map((r) => r.ticker) ?? [];
}


export function generateExecutionDates(start:Date, frequency:String, weekday:String, count = 10) {
  const dates = [];
  let d = new Date(start);

  while (dates.length < count) {
    if (frequency === "monthly") d.setMonth(d.getMonth() + 1);
    if (frequency === "biweekly") d.setDate(d.getDate() + 14);
    if (frequency === "weekly") d.setDate(d.getDate() + 7);

    if (!isMarketHoliday(d)) dates.push(new Date(d));
  }

  return dates;
}

export function estimateAnnualInvestment(frequency:String, amount:number) {
  const periods =
    frequency === "weekly" ? 52 :
    frequency === "biweekly" ? 26 : 12;

  return periods * amount;
}

const HOLIDAYS = [
  "2025-01-01",
  "2025-07-04",
  "2025-12-25",
];

export function isMarketHoliday(date:Date) {
  const d = date.toISOString().split("T")[0];
  return HOLIDAYS.includes(d) || date.getDay() === 0 || date.getDay() === 6;
}

interface ModalProps {
  open: boolean
  onClose: () => void
}

export function Control({ open, onClose }: ModalProps) {
  const [results, setResults] = useState<string[]>([]);
  const [ticker, setTicker] = useState<string>("");
  const [frequency, setFrequency] = useState("monthly");
  const [weekday, setWeekday] = useState("monday");
  const [amountType, setAmountType] = useState("dollars");
  const [amount, setAmount] = useState(100);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [startDate, setStartDate] = useState("");

  async function handleSearch(q: string): Promise<void> {
    const query = q.toUpperCase();
    setTicker(query);
    if (query.length < 1) {
      setResults([]);
      return;
    }
    const results = await searchTickers(query);
    setResults(results);
  }


  const executions = startDate
    ? generateExecutionDates(new Date(startDate), frequency, weekday)
    : [];

  const annual = estimateAnnualInvestment(frequency, amount);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 border-2 border-blue-200/50 justify-center">
        <DialogTitle className="sr-only">Control</DialogTitle>
        <h2 className="text-lg font-bold text-center m-0">Automated Investment Plan</h2>

        <div className="flex flex-col">
          <label className="text-center text-sm font-bold">Ticker</label>
          <input
            value={ticker}
            className="p-1 border-2 rounded-lg"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="SPY, VTI, AAPL"
          />
          {results.length > 0 && (
            <ul className="m-0 p-0 border border-[#ccc] bg-white list-none">
              {results.map((r) => (
                <li key={r} onClick={() => setTicker(r)}>
                  {r}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col">
            <label className="text-center text-sm font-bold">Frequency</label>
            <select value={frequency} className="p-1 border-2 rounded-lg" onChange={(e) => setFrequency(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="biweekly">Every 2 Weeks</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          {(frequency === "weekly" || frequency === "biweekly") && (
            <div className="flex flex-col">
              <label className="text-center text-sm font-bold">Day</label>
              <select value={weekday} className="p-1 border-2 rounded-lg" onChange={(e) => setWeekday(e.target.value)}>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col">
            <label className="text-center text-sm font-bold">Investment Type</label>
            <select value={amountType} className="p-1 border-2 rounded-lg" onChange={(e) => setAmountType(e.target.value)}>
              <option value="dollars">Dollar Amount</option>
              <option value="shares">Shares</option>
            </select>
          </div>

          <div className="flex flex-col w-20">
            <label className="text-center text-sm font-bold">{amountType === "dollars" ? "Amount ($)" : "Shares"}</label>
            <input
              className="p-1 border-2 rounded-lg"
              type="number"
              value={amount}
              onChange={(e) => setAmount(+e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col">
            <label className="text-center text-sm font-bold">Min Price</label>
            <input value={minPrice} className="p-1 border-2 rounded-lg" onChange={(e) => setMinPrice(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className="text-center text-sm font-bold">Max Price</label>
            <input value={maxPrice} className="p-1 border-2 rounded-lg" onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-center text-sm font-bold">Start Date</label>
          <input className="p-1 border-2 rounded-lg" type="date" onChange={(e) => setStartDate(e.target.value)} />
        </div>

        {executions.length > 0 && (
          <div className="card">
            <h4>Next Executions</h4>
            <ul>
              {executions.map((d) => (
                <li key={d.toISOString()}>{d.toDateString()}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <div className="text-sm text-center">
            Estimated Annual Investment:
            <strong> ${annual.toLocaleString()}</strong>
          </div>
          <div className="text-sm text-center">
            Estimated Annual Return:
            <strong> ${annual.toLocaleString()}</strong>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
