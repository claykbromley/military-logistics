# Military Logistics

A comprehensive Next.js application providing military service members with resources and tools for financial planning, automotive services, legal assistance, medical information, and transition support.

## Tech Stack

- **Framework**: Next.js 16 (Pages Router)
- **React**: 18.3.1
- **Styling**: Tailwind CSS 4 + Custom CSS
- **UI Libraries**:
  - Framer Motion (animations)
  - React Icons
  - FontAwesome
- **Data Visualization**: Recharts, React Simple Maps
- **API Integration**: Axios

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd military-logistics
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Build for Production

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Starts the development server with hot-reload
- `npm run build` - Builds the app for production
- `npm start` - Runs the built app in production mode
- `npm run lint` - Runs Next.js linter

## Features

### Financial Services
- Investment tracking with real-time stock data
- Financial news feed
- Tax calculators and income planning
- Retirement planning (TSP calculator)
- Loan management
- Business startup resources
- Credit management
- Bill tracking

### Automotive Services
- Vehicle buying/selling guidance
- Insurance information
- Registration assistance
- Driver's license resources
- Deployment vehicle storage
- Auto loans

### Additional Services
- Legal resources
- Medical information
- Transition assistance
- Service marketplace
- Appointment scheduler
- Military discount database

## Project Structure

```
military-logistics/
├── pages/              # Next.js pages (routing)
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/         # Page components
│   │   ├── financial/ # Financial service pages
│   │   └── automotive/ # Automotive service pages
│   └── Navbar.js      # Main navigation
├── public/            # Static assets
└── next.config.js     # Next.js configuration
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
