# SmartFix Campus 🏫🔧

ระบบบริหารจัดการงานแจ้งซ่อมภายในสถานศึกษาอัจฉริยะ (Smart Maintenance Management System for Educational Institutions)

## Features
- 📱 Mobile-first Public Report Form
- 📸 QR Code Location System (Scan to report with auto-location)
- 🖼️ Image Upload with Compression (Cloudinary)
- 🎫 Ticket Tracking System with Timeline
- 💬 LINE Group Notifications
- 🔐 Secure Admin Dashboard (Firebase Auth)
- 📊 Real-time Analytics & Dashboard

## Tech Stack
- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend/API**: Next.js Route Handlers
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Storage**: Cloudinary (Free Tier)
- **Notifications**: LINE Messaging API
- **Deployment**: Vercel

## Environment Variables
Copy .env.example to .env or .env.local and fill in the values:

- NEXT_PUBLIC_*: Safe to expose to the client.
- Other variables: Secrets! Do NOT expose them to the client or commit them to version control.

## Installation
1. Clone the project
2. 
pm install
3. Setup Environment Variables
4. 
pm run dev

## Deployment
This project is optimized for **Vercel Free Tier**. Connect your GitHub repository to Vercel and set the environment variables in the Vercel Dashboard.
