# Airdrop Tracker Pro v2.2

Airdrop Tracker Pro is a comprehensive web application designed to help enthusiasts and investors track, manage, and discover potential cryptocurrency airdrops. It features a modern, responsive user interface with real-time data visualization, wallet integration, and a robust backend for managing airdrop data.

## 🚀 Features

-   **Dashboard**: Overview of potential and active airdrops with real-time status.
-   **Airdrop Tracking**: Detailed list of airdrops with filtering and sorting capabilities.
-   **Wallet Integration**: Secure wallet connection to check eligibility and balances.
-   **Real-time Charts**: Visual analytics using Recharts and D3.js.
-   **Dark/Light Mode**: Fully responsive theming system.
-   **Legal & Compliance**: Integrated Terms of Service and Privacy Policy.

## 🛠 Tech Stack

### Frontend
-   **Framework**: [React](https://react.dev/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Charts**: [Recharts](https://recharts.org/), [D3.js](https://d3js.org/)

### Backend
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [MongoDB](https://www.mongodb.com/)
-   **Security**: Helmet, Rate Limit, BCrypt, JWT

### Blockchain & APIs
-   **SDKs**: [Alchemy SDK](https://www.alchemy.com/), [Ethers.js](https://docs.ethers.org/)
-   **Data Sources**: CoinGecko API, Alchemy

## 📦 Installation & Running Locally

Follow these steps to set up the project locally on your machine.

### Prerequisites
-   Node.js (v16 or higher)
-   npm or yarn
-   MongoDB (running locally or cloud connection string)

### 1. Clone the Repository
```bash
git clone <repository_url>
cd airdrop-tracker-pro-v2
```

### 2. Install Dependencies
Install the necessary packages for both frontend and backend.
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and configure your environment variables (example):
```env
MONGODB_URI=mongodb://localhost:27017/airdrop-tracker
PORT=3001
JWT_SECRET=your_secret_key
ALCHEMY_API_KEY=your_alchemy_key
```

### 4. Run the Application

You can run the frontend and backend separately using the provided scripts.

**Start the Backend Server:**
```bash
npm run dev:backend
```
_Server typically runs on http://localhost:3001_

**Start the Frontend Development Server:**
```bash
npm run dev
```
_Frontend typically runs on http://localhost:5173_

### 5. Build for Production
To create a production build of the frontend:
```bash
npm run build
```

## 📄 License
© 2026 Airdrop Tracker. All rights reserved.
