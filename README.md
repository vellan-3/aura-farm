# Farm Marketplace

An end-to-end B2C and B2B agricultural marketplace connecting Nigerian Farmers directly with Consumers. 

## Features
- **Roles:** Consumer, Farmer, Admin.
- **Frontend:** React 19, Vite, Tailwind CSS v4.
- **Backend:** Node.js, Express, Prisma ORM.
- **Features:** JWT Auth, Product Catalog, Cart, Order Management, Escrow Logistics, KYC Admin Panel.

## Quick Start (Local Development)

### 1. Start the Database
Ensure you have Docker installed, then run:
```bash
docker-compose up -d
```
*This spins up a local Postgres instance at `localhost:5432`.*

### 2. Run Database Migrations
Navigate to the server folder and push the Prisma schema:
```bash
cd server
npx prisma db push
npx prisma generate
```

### 3. Start the Backend API
```bash
# Still in the server/ directory
npm run dev
```
*The Express server runs on `http://localhost:3001`.*

### 4. Start the Frontend
In a new terminal window:
```bash
cd client
npm run dev
```
*The React app runs on `http://localhost:5173`.*

---
**Note:** Remember to populate your `.env` files in both `/client` and `/server` with actual keys (Paystack, Cloudinary) before taking this to production.
