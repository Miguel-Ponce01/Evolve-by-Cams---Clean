# Evolve by Cams — POS Terminal & Booking Console

Evolve by Cams is a premium Front Desk Intake and Point of Sale (POS) system designed for a Pilates & Wellness Studio. The application is built using Next.js, styled with a custom Slacc-inspired design system, integrated with a Python-based multi-agent workspace orchestrator, and configured for mobile deployment via Capacitor.

---

## 🎯 Purpose of the Project

The purpose of this system is to provide front-desk administrators with an intuitive, responsive, and aesthetically stunning console to manage class schedules, track real-time reformer occupancy, check out walk-in or registered clients, manage class waitlists, and issue receipts with real-time simulated client notifications.

---

## 🎨 Slacc Design System Alignment

The user interface strictly adheres to the Slacc brand design principles documented in [DESIGN.md](file:///c:/Users/MYPC/Documents/Evolve%20by%20Cams%20-%20Clean/DESIGN.md):
* **Color Palette**: Built around a deep aubergine primary (`#4a154b`), warm cream-lavender canvases (`#f4ede4` / `#f9f0ff`), and link blue (`#1264a3`) inline actions.
* **CTAs & Buttons**: All action items are pill-shaped (`rounded-pill` / `.btn-primary-pill`) with generous horizontal padding (28–30px) for high touch-target compliance on mobile viewports.
* **Typography**: Clean humanist display styles leveraging tight negative tracking for high-density headers.

---

## ⚡ Core Features

1. **POS Dashboard**: Real-time telemetry showcasing daily occupancy rate, logged bookings, active customers registry, and today's total revenue.
2. **Reformer Roster Map**: Visual studio layout mapping out Pilates reformer stations. Administrators can tap to checkout open spots or manage waitlists for fully-booked classes.
3. **Smart Checkout**: Lookup system for existing clients, payment method routing (Cash, Card, or Class Credits), and automatic promotional coupon application.
4. **Receipting & Notifications**: Simulated client notification console rendering live SMS and Email alerts, complete with mandatory studio safety guidelines (e.g., grip socks policy) and printable transaction receipts.
5. **Multi-Agent Workspace**: Built-in AI workforce (`Coding`, `Debugging`, and `Deployment` agents) managed by a central orchestrator python engine using Gemini.

---

## 🚀 Setup & Execution

### 1. Restore Project Dependencies
First, open your local terminal, navigate to the clean workspace folder, and restore both the web and python package dependencies:

* **Web UI (Node.js)**:
  ```powershell
  cd "C:\Users\MYPC\Documents\Evolve by Cams - Clean"
  npm install
  ```
* **AI Agents (Python)**:
  ```powershell
  pip install -r requirements.txt
  ```

### 2. Run the Web Development Server
Once packages are installed, start the local development server:
```powershell
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to access the dashboard.

### 3. Run the Multi-Agent Orchestrator
To execute or test the multi-agent system:
* Make sure your `GEMINI_API_KEY` is set in your system environment variables or inside the local [.env.local](file:///c:/Users/MYPC/Documents/Evolve%20by%20Cams%20-%20Clean/.env.local) file.
* Run the manager execution script:
  ```powershell
  python agents/manager.py
  ```

### 4. Build & Export for Mobile (Capacitor Android)
The project is configured for static Next.js export (`output: 'export'`) to enable direct compilation into native mobile applications:
1. Compile the static web bundle:
   ```powershell
   npm run build
   ```
2. Sync the static `/out` assets folder with your Capacitor native target:
   ```powershell
   npm run cap:sync
   ```
3. Open the native workspace project inside Android Studio:
   ```powershell
   npm run cap:open:android
   ```

---

## 📂 Key Project Directory Structure

* **[/src/app](file:///c:/Users/MYPC/Documents/Evolve%20by%20Cams%20-%20Clean/src/app)**: App Router pages.
  * **[page.tsx](file:///c:/Users/MYPC/Documents/Evolve%20by%20Cams%20-%20Clean/src/app/page.tsx)**: Main POS terminal dashboard.
  * **[/book/[classId]](file:///c:/Users/MYPC/Documents/Evolve%20by%20Cams%20-%20Clean/src/app/book/[classId])**: Reformer selection and booking intake page.
  * **[/success/[bookingId]](file:///c:/Users/MYPC/Documents/Evolve%20by%20Cams%20-%20Clean/src/app/book/[classId]/success/[bookingId])**: Dynamic static page generating printed receipts and mobile alerts.
* **[/agents](file:///c:/Users/MYPC/Documents/Evolve%20by%20Cams%20-%20Clean/agents)**: Python agent persona configurations and the orchestrator script ([manager.py](file:///c:/Users/MYPC/Documents/Evolve%20by%20Cams%20-%20Clean/agents/manager.py)).
* **[/android](file:///c:/Users/MYPC/Documents/Evolve%20by%20Cams%20-%20Clean/android)**: Target platform wrapper folder for native Capacitor Android apps.
