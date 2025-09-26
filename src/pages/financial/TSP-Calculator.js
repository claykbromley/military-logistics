import { useState, useMemo, useEffect } from "react";
import Papa from "papaparse";
import "./financial.css"

export function TSPCalculator() {
  const [years, setYears] = useState(20);
  const [age, setAge] = useState(18);
  const [payTable, setPayTable] = useState([]);
  const [payGrades, setPayGrades] = useState([]);

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
  }, []);

  const makeEmptyRows = (n) => {
    const progression = [2,3,4,4,5,5,5,5,6,6,6,6,6,7,7,7,7,8,8,8];

    return Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      rank: "E-" + String(progression[i]),
      contribPct: 5,
      portfolioType: "custom",
      alloc: { C: 0.6, S: 0.2, I: 0.15, F: 0.05, G: 0 },
    }));
  };

  const [rows, setRows] = useState(makeEmptyRows(years));

  function updateYears(n) {
    setYears(n);
    setRows((prev) => {
      if (n === prev.length) return prev;
      if (n > prev.length) {
        return prev.concat(makeEmptyRows(n - prev.length).map((r, idx) => ({ ...r, id: prev.length + idx + 1 })));
      }
      return prev.slice(0, n);
    });
  }

  function updateRow(idx, field, value) {
    setRows((prev) => {
      const next = prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r));
      return next;
    });
  }

  function updateRowAlloc(idx, fund, value) {
    setRows((prev) => {
      const next = prev.map((r, i) => {
        if (i !== idx) return r;
        if (value === -1) {
          const alloc = {'C':0, 'S':0, 'I':0, 'F':0, 'G':0};
          return { ...r, alloc: {...alloc, [fund]:1}}}
        const alloc = { ...r.alloc, [fund]: Number(value) };
        const total = Object.values(alloc).reduce((a, b) => a + b, 0);
        const normalized = total > 0 ? Object.fromEntries(Object.entries(alloc).map(([k, v]) => [k, v / total])) : alloc;
        return { ...r, alloc: normalized };
      });
      return next;
    });
  }

  function employerContributionPct(contribPctFrac, yearsOfServiceCompleted) {
    const auto = 0.01;
    let match = 0;
    if (yearsOfServiceCompleted >= 2) {
      const additional = Math.max(0, Math.min(contribPctFrac, 0.05) - 0.01);
      match = additional;
    }
    return auto + match;
  }

  const projection = useMemo(() => {
    let balance = 0;
    const rowsOut = [];
    const defaultReturns = { C: 7, S: 8, I: 6, F: 3, G: 2 };
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const yosCompleted = i;
      const rank = row.rank;
      const base = Number(lookupBasicPay(rank, yosCompleted)) * 12 || 0;
      const contribPct = (Number(row.contribPct) || 0) / 100;
      const employeeContrib = base * contribPct;
      const employerPct = employerContributionPct(contribPct, yosCompleted);
      const employerContrib = base * employerPct;

      let expectedReturnPct = 6;
      if (row.portfolioType && row.portfolioType.startsWith("L")) {
        const match = row.portfolioType.match(/L(\d{4})/);
        if (match) {
          const targetYear = Number(match[1]);
          const yearsToTarget = Math.max(0, targetYear - (new Date().getFullYear()));
          expectedReturnPct = yearsToTarget >= 25 ? 7 : yearsToTarget >= 15 ? 6 : 5;
        } else {
          expectedReturnPct = 6;
        }
      } else {
        expectedReturnPct = expectedReturnFromAlloc(row.alloc);
      }

      const preGrowthBalance = balance + employeeContrib + employerContrib;
      balance = preGrowthBalance * (1 + expectedReturnPct / 100);

      rowsOut.push({
        age: age + i,
        rank: rank,
        contribPct: Math.round(contribPct * 100 * 100) / 100,
        employeeContrib: Math.round(employeeContrib),
        employerContrib: Math.round(employerContrib),
        expectedReturnPct: Math.round(expectedReturnPct * 100) / 100,
        balance: Math.round(balance),
      });
    }
    
    function expectedReturnFromAlloc(alloc, returns = defaultReturns) {
      const r = Object.keys(returns).reduce((acc, fund) => acc + (alloc[fund] ?? 0) * (returns[fund] / 100), 0);
      return r * 100;
    }

    function lookupBasicPay(grade, yrs) {
      const row = payTable.find(r => r["Pay Grade"]?.trim() === String(grade).trim());
      if (!row) return 0;

      const colKey = String(bucketYears(yrs)).trim();
      const value = row[colKey];
      return value ? Number(value) : 0;
    }
    
    function bucketYears(yrs) {
      const thresholds = [2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40];
      for (const t of thresholds) {
        if (yrs < t) {return t === 2 ? "2 or less" : `Over ${t - (t <= 4 ? 1 : 2)}`}
      }
      return "Over 40";
    }

    const retirementAge = rowsOut[rowsOut.length - 1].age;
    const expectedReturnPct = rowsOut[rowsOut.length - 1].expectedReturnPct;
    for ( let i = 0; i < 60 - retirementAge; i++) {
      balance = balance * (1 + expectedReturnPct / 100);
      rowsOut.push({
        age: retirementAge + i,
        balance: Math.round(balance),
      });
    }

    return { rowsOut, finalBalance: Math.round(balance) };
  }, [rows, payTable, age]);

  function LineChart({ data }) {
    if (!data || data.length === 0) return null;
    const pad = 30;
    const max = Math.max(...data.map(d => d.balance));
    const min = 0;
    const width = 700;
    const height = 200;
    const points = data.map((d, i) => {
      const x = pad + (i / (data.length - 1 || 1)) * (width - pad * 2);
      const y = height - pad - ((d.balance - min) / (max - min || 1)) * (height - pad * 2);
      return [x, y];
    });
    const pathD = points.map((p, i) =>
      `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`
    ).join(" ");

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{width:'full', height:'full'}}
        preserveAspectRatio="none"
      >
        <rect x={0} y={0} width={width} height={height} fill="transparent" />
        <path d={pathD} fill="none" strokeWidth={2} stroke="black" />
        {points.map((p, i) => (
          <g key={i}>
            <circle key={i} cx={p[0]} cy={p[1]} r={3} />
            <text x={p[0]} y={height-15} fontSize={10} textAnchor="middle">{i + age}</text>
            {i===0 && <text x={8} y={p[1]} fontSize={12}>$0</text>}
            {i===years && <text x={8} y={p[1]} fontSize={12}>${data[years-1].balance.toLocaleString()}</text>}
            {i===data.length-1 && <text x={8} y={p[1]} fontSize={12}>${Math.round(max).toLocaleString()}</text>}
          </g>
        ))}
      </svg>
    );
  }

  function setAllocPreset(idx, preset) {
    const presets = {
      "Aggressive": { C: 0.5, S: 0.25, I: 0.2, F: 0.05, G: 0 },
      "Moderate": { C: 0.45, S: 0.15, I: 0.25, F: 0.1, G: 0.05 },
      "Conservative": { C: 0.25, S: 0.05, I: 0.2, F: 0.3, G: 0.2 },
    };
    if (!presets[preset]) return;
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, portfolioType: 'custom', alloc: presets[preset] } : r)));
  }

  const handleInput = (e, min = 0, max = 100) => {
    const raw = e.target.value;
    if (raw === "") {return ""}
    const num = Math.max(min, Math.min(max, Number(raw)));
    return num;
  };

  return (
    <div>
      <div className="center">
        <label>Years of Service:
          <select value={years} style={{ marginLeft: '5px' }}
            onChange={(e) => updateYears(Number(e.target.value))}>
            {Array.from({ length: 40 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </label>
        <label>Age of Enlistment:
          <select value={age} style={{ marginLeft: '5px' }}
            onChange={(e) => setAge(Number(e.target.value))}>
            {Array.from({ length: 26 }, (_, i) => (
              <option key={i + 17} value={i + 17}>{i + 17}</option>
            ))}
          </select>
        </label>
        <button onClick={() => setRows(makeEmptyRows(years))}>Reset rows</button>
      </div>

      <div>
        <table style={{width:'90%'}}>
          <thead>
            <tr>
              <th>Age</th>
              <th>Pay Grade</th>
              <th>Contribution %</th>
              <th>Portfolio</th>
              <th>Allocation</th>
            </tr>
          </thead>
          <tbody>
            {projection.rowsOut.slice(0, years).map((r, i) => (
              <tr key={i}>
                <td>{r.age}</td>
                <td>
                  <select value={rows[i].rank} onChange={(e) => updateRow(i, 'rank', e.target.value)}>
                    {payGrades.map((abbr) => (
                      <option key={abbr} value={abbr}>
                        {abbr}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input type="number" min="0" max="100" value={rows[i].contribPct} style={{width:'50px'}}
                    onChange={(e) => updateRow(i, 'contribPct', handleInput(e))}/>
                </td>
                <td>
                  <select value={rows[i].portfolioType} onChange={(e) => updateRow(i, 'portfolioType', e.target.value)} style={{margin:'5px'}}>
                    <option value="custom">Custom</option>
                    <option value={`L${new Date().getFullYear() + 25}`}>L{new Date().getFullYear() + 25}</option>
                    <option value={`L${new Date().getFullYear() + 15}`}>L{new Date().getFullYear() + 15}</option>
                    <option value={`L${new Date().getFullYear() + 5}`}>L{new Date().getFullYear() + 5}</option>
                  </select>
                </td>
                <td>
                  {rows[i].portfolioType === 'custom' ? (
                    <div>
                      <div className="center" style={{margin:'5px'}}>
                        {['C','S','I','F','G'].map((f) => (
                          <div key={f}>
                            <button style={{padding:2, borderRadius:3}}
                              onClick={() => updateRowAlloc(i, f, -1)}>
                              {f}</button>:
                            <input type="number" step="0.01" value={(rows[i].alloc[f] ?? 0).toFixed(2)} style={{width:'50px', marginLeft:'5px'}}
                              onChange={(e) => updateRowAlloc(i, f, Number(e.target.value))}/>
                          </div>
                        ))}
                      </div>
                      <div className="center" style={{marginBottom:'5px'}}>
                        <button style={{paddingTop:0, paddingBottom:0}} onClick={() => setAllocPreset(i, 'Aggressive')}>Aggressive</button>
                        <button style={{paddingTop:0, paddingBottom:0}} onClick={() => setAllocPreset(i, 'Moderate')}>Moderate</button>
                        <button style={{paddingTop:0, paddingBottom:0}} onClick={() => setAllocPreset(i, 'Conservative')}>Conservative</button>
                      </div>
                    </div>
                  ) : (
                    <div>{rows[i].portfolioType}</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <div>
          <div className="center">
            <div className="tsp-pred">
              Estimated TSP value at 60 Years Old: <strong style={{marginLeft:'10px'}}>${projection.finalBalance.toLocaleString()}</strong>
            </div>
          </div>
          <h3 style={{textAlign:'center', margin:0}}>Balance Over Time</h3>
          <LineChart data={projection.rowsOut}/>
        </div>
      </div>

      <div>
        <table style={{width:'90%'}}>
          <thead><tr>
            <th>Age</th>
            <th>Expected Return %</th>
            <th>Personal Contribution</th>
            <th>Employer Contribution</th>
            <th>Balance</th>
          </tr></thead>
          <tbody>
            {projection.rowsOut.slice(0, years).map((r, i) => (
              <tr key={i}>
                <td>{r.age}</td>
                <td>{r.expectedReturnPct}%</td>
                <td>${r.employeeContrib.toLocaleString()}</td>
                <td>${r.employerContrib.toLocaleString()}</td>
                <td>${r.balance.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <p>Note: This simulator models contributions and employer matching per simplified BRS rules and assumes end-of-year compounding using the portfolio's weighted expected return. It is meant to be an illustrative planning tool. For precise calculations, please consult a financial counselor.</p>
      </div>
    </div>
  );
}
