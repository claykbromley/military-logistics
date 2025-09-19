import { useState, useEffect } from "react";
import Papa from "papaparse";
import './financial.css';
import { taxRatesSingle, taxRatesMaried } from "./tax_rates";

export default function IncomeCalculator() {
  const [payTable, setPayTable] = useState([]);
  const [bahTable, setBahTable] = useState([]);
  const [bahWithTable, setBahWithTable] = useState([]);
  const [dutyStationList, setDutyStationList] = useState([]);
  const [payGrades, setPayGrades] = useState([]);

  const [payGrade, setPayGrade] = useState("E-1");
  const [years, setYears] = useState(0);
  const [dutyStation, setDutyStation] = useState("");
  const [hasDependents, setHasDependents] = useState(false);
  const [bonus, setBonus] = useState(0);
  const [homeState, setHomeState] = useState("");
  const [married, setMarried] = useState(false);

  useEffect(() => {
    Papa.parse("/data/pay_table.csv", {
      download: true,
      header: true,
      complete: (results) => {
        setPayTable(results.data);
        const grades = results.data.map((row) => row["Pay Grade"]?.trim()).filter(Boolean);
        setPayGrades(grades);
      },
      error: (err) => console.error("CSV parsing error:", err),
    });

    Papa.parse("/data/bah.csv", {
      download: true,
      header: true,
      complete: (results) => {
        setBahTable(results.data);
        const stations = results.data.map((row) => row["DUTY STATION"]?.trim()).filter(Boolean);
        setDutyStationList(stations);
      },
      error: (err) => console.error("CSV parsing error:", err),
    });

    Papa.parse("/data/bah_with_dependents.csv", {
      download: true,
      header: true,
      complete: (results) => {setBahWithTable(results.data)},
      error: (err) => console.error("CSV parsing error:", err),
    });
  }, []);

  function lookupBasicPay(grade, yrs) {
    const row = payTable.find(r => r["Pay Grade"]?.trim() === String(grade).trim());
    if (!row) return 0;

    const colKey = String(bucketYears(yrs)).trim();
    const value = row[colKey];
    return value ? Number(value) : 0;
  }

  function bucketYears(yrs) {
    if (yrs < 2) return "2 or less";
    if (yrs < 3) return "Over 2";
    if (yrs < 4) return "Over 3";
    if (yrs < 6) return "Over 4";
    if (yrs < 8) return "Over 6";
    if (yrs < 10) return "Over 8";
    if (yrs < 12) return "Over 10";
    if (yrs < 14) return "Over 12";
    if (yrs < 16) return "Over 14";
    if (yrs < 18) return "Over 16";
    if (yrs < 20) return "Over 18";
    if (yrs < 22) return "Over 20";
    if (yrs < 24) return "Over 22";
    if (yrs < 26) return "Over 24";
    if (yrs < 28) return "Over 26";
    if (yrs < 30) return "Over 28";
    if (yrs < 32) return "Over 30";
    if (yrs < 34) return "Over 32";
    if (yrs < 36) return "Over 34";
    if (yrs < 38) return "Over 36";
    if (yrs < 40) return "Over 38";
    return "Over 40";
  }

  function lookupBAH(grade, dutyStation, hasDependents) {
    const row = hasDependents?
    (bahWithTable.find(r => r["DUTY STATION"]?.trim() === String(dutyStation).trim())):
    (bahTable.find(r => r["DUTY STATION"]?.trim() === String(dutyStation).trim()))
    if (!row) return 0;

    const colKey = String(grade).trim();
    const value = row[colKey];
    return value ? Number(value) : 0;
  }

  function calculateTax(income, brackets) {
    let tax = 0, lastCap = 0;
    for (const { rate, cap } of brackets) {
      if (income > cap) {
        tax += (cap - lastCap) * rate;
        lastCap = cap;
      } else {
        tax += (income - lastCap) * rate;
        break;
      }
    }
    return tax;
  }

  const calculate = () => {
    const basicMonthly = lookupBasicPay(payGrade, years);
    const bahMonthly = lookupBAH(payGrade, dutyStation, hasDependents);

    const basMonthly = payGrade.startsWith("E") ? 452 : 460;

    const annualBase = basicMonthly * 12;
    const annualBah = bahMonthly * 12;
    const annualBas = basMonthly * 12;
    const annualBonus = Number(bonus) * 12;

    const taxRates = married?taxRatesMaried:taxRatesSingle;
    const federalTax = calculateTax(annualBase, taxRates["FEDERAL"]);
    const stateTax = homeState === "" ? 0 : calculateTax(annualBase, taxRates[homeState]);
    
    const total = annualBase + annualBah + annualBas + annualBonus;
    const net = total - federalTax - stateTax;

    return {
      annualBase: Math.round(annualBase),
      annualBah: Math.round(annualBah),
      annualBas: Math.round(annualBas),
      annualBonus: Math.round(annualBonus),
      total: Math.round(total),
      federalTax: Math.round(federalTax),
      stateTax: Math.round(stateTax),
      net: Math.round(net)
    };
  };

  const results = calculate();

  return (
    <div>
      <div style={{display:'flex'}}>
        <div style={{borderRight:'solid 1px', width:'50%'}}>
          <div className="calculator-input">
            <label>Pay Grade:</label>
            <select value={payGrade} onChange={(e) => setPayGrade(e.target.value)} style={{marginLeft:'10px'}}>
              {payGrades.map((abbr) => (
                <option key={abbr} value={abbr}>
                  {abbr}
                </option>
              ))}
            </select>
          </div>
          <div className="calculator-input">
            <label>Years in Service:</label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              onBlur={() => {if (years === "") setYears("0")}}
              style={{ marginLeft: "10px" }}
            />
          </div>
          <div className="calculator-input">
            <label>Duty Station:</label>
            <select
              value={dutyStation}
              onChange={(e) => setDutyStation(e.target.value)}
              style={{margin:'5px'}}
            >
              <option value="">-- Choose a Duty Station --</option>
              {dutyStationList.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </div>
          <div className="calculator-input">
            <label style={{marginRight:'10px'}}>Monthly Bonus:</label>$
            <input
              type="number"
              value={bonus}
              onChange={(e) => setBonus(e.target.value)}
              onBlur={() => {if (years === "") setYears("0")}}
            />
          </div>
          <div className="calculator-input">
            <label>Home State:</label>
            <select style={{marginLeft:'5px'}} value={homeState} onChange={(e) => setHomeState(e.target.value)}>
              <option value="">-- Choose a Home State --</option>
              {Object.keys(taxRatesSingle).slice(1).map((abbr) => (
                <option key={abbr} value={abbr}>
                  {abbr}
                </option>
              ))}
            </select>
          </div>
          <div className="calculator-input">
            <label>
              Dependents:{" "}
              <input
                type="checkbox"
                checked={hasDependents}
                onChange={(e) => setHasDependents(e.target.checked)}
              />
            </label>
          </div>
          <div className="calculator-input">
            <label>
              Married Filing Jointly:{" "}
              <input
                type="checkbox"
                checked={married}
                onChange={(e) => setMarried(e.target.checked)}
              />
            </label>
          </div>
        </div>

        <div style={{width:"50%", textAlign:"center"}}>
          <div style={{display:'flex', justifyContent:'center', gap:'20px'}}>
            <p style={{marginTop:0}}><strong>Base Pay:</strong> ${results.annualBase.toLocaleString()}</p>
            <p style={{marginTop:0}}><strong>BAH:</strong> ${results.annualBah.toLocaleString()}</p>
          </div>
          <div style={{display:'flex', justifyContent:'center', gap:'20px'}}>
            <p style={{margin:0}}><strong>BAS:</strong> ${results.annualBas.toLocaleString()}</p>
            <p style={{margin:0}}><strong>Bonus:</strong> ${results.annualBonus.toLocaleString()}</p>
          </div>
          <h3>Total Income: ${results.total.toLocaleString()}</h3>
          <hr />
          <div style={{display:'flex', justifyContent:'center', gap:'20px'}}>
            <p><strong>Federal Taxes:</strong> ${results.federalTax.toLocaleString()}*</p>
            <p><strong>State Taxes:</strong> ${results.stateTax.toLocaleString()}*</p>
          </div>
          <h3 style={{marginTop:0}}>Net Income: ${results.net.toLocaleString()}</h3>
        </div>
      </div>

      <hr />
      <div className="calculator-input" style={{marginTop:'20px'}}>
        <a href="https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/" target="_blank" rel="noopener noreferrer">
          {<button>View Pay Tables and Monthly Bonuses</button>}
        </a>
      </div>
      <div style={{textAlign:'center'}}>
        <p>*Federal and state taxes are approximations</p>
      </div>
    </div>
  );
}