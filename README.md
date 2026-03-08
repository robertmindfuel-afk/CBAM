# CBAM Compass — EU Carbon Border Adjustment Calculator

A comprehensive, end-to-end CBAM compliance platform for importers and exporters. Built with React + Vite + Tailwind CSS.

## Features

###  CBAM Calculator
- Step-by-step guided calculation wizard
- Supports all 6 CBAM sectors (Cement, Iron & Steel, Aluminium, Fertilizers, Electricity, Hydrogen)
- Actual verified emissions OR default values with year-specific mark-ups
- Production-route-specific benchmarks
- Carbon price deduction for third-country carbon pricing
- Multi-year cost projection charts (2026–2034)

###  CN Codes Database
- 90+ CN codes covering all CBAM goods per Annex I of Reg. 2023/956
- Full-text search by CN code, description, or product category
- Sector filtering with code counts
- De minimis threshold indicators

### Country Default Values
- Country-specific default emission values per Reg. 2025/2621
- 40+ countries with product-specific values
- Year-specific mark-up visualization (+10%/+20%/+30%)
- Interactive bar chart comparison
- Carbon price deduction potential per country

###  EU Benchmarks
- Complete benchmark values per Reg. 2025/2620
- Column A (actual data) and Column B (default) benchmarks
- Production route variants (BF-BOF, DRI-EAF, Scrap-EAF, etc.)
- Free allocation phase-out visualization (2026–2034)

###  Compliance Timeline
- Full timeline from transitional to definitive period
- Registration, reporting, financial, and verification requirements
- Penalty information
- Key milestone dates

### Multi-Year Projections
- 2026–2034 cost projections with EU ETS price forecasts
- Cumulative cost analysis
- Interactive parameter adjustment
- Exportable results table

## Data Sources

All data sourced from official EU legislation:
- **Regulation (EU) 2023/956** — CBAM base regulation
- **Regulation (EU) 2025/2083** — Simplification Regulation
- **Implementing Regulation (EU) 2025/2547** — Embedded emissions methodology
- **Implementing Regulation (EU) 2025/2620** — Benchmarks and free allocation
- **Implementing Regulation (EU) 2025/2621** — Default values
- **Implementing Regulation (EU) 2025/2548** — Certificate pricing



## Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+



## Project Structure

```
cbam-platform/
├── public/
│   └── vite.svg
├── src/
│   ├── data/
│   │   ├── cnCodes.js       
│   │   ├── defaultValues.js 
│   │   └── benchmarks.js    
│   ├── utils/
│   │   └── calculator.js     
│   ├── App.jsx                
│   ├── main.jsx           
│   └── index.css            
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
└── README.md
```

## Disclaimer

This tool is for informational and planning purposes only. Always verify calculations against the official EU CBAM Registry and consult with qualified compliance advisors for actual regulatory submissions. Data may not reflect the latest amendments — check the European Commission's CBAM portal for current values.

## License

MIT
