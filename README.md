# Metro Police System 🚓🇧🇩

**A Comprehensive Digital Policing Platform**

The **Metro Police System** is a full-stack web application designed to modernize and digitize police services for the Bangladesh Metro Police. This platform bridges the gap between citizens and law enforcement, providing online access to essential services like crime reporting, traffic fine management, and emergency response.

---

## 🚀 Key Features

### 👮 Services for Citizens
*   **Online General Diary (GD)**: Report crimes, lost items, or missing persons directly through the portal.
*   **Traffic Fine Managment**: Check traffic citations by vehicle number and pay fines online (simulated).
*   **Emergency SOS**: A dedicated panic button for immediate emergency alerts, sharing location details with the nearest station.
*   **Police Clearance Certificate (PCC)**: Apply for and track the status of clearance certificates online.
*   **Safe Route GPS**: Find the safest routes for travel based on crime data and police patrolling intensity.
*   **Cyberbullying Assistance**: An AI-powered chat assistant to help victims of cyberbullying with advice and reporting.

### 🕵️‍♀️ Tools for Law Enforcement
*   **Criminal Database**: Searchable database of criminals with simulated face recognition capabilities.
*   **Crime Mapping & Heatmaps**: Visual representation of crime hotspots and police patrolling density to optimize resource allocation.
*   **Crime Prediction**: ML-based algorithms to predict potential crime patterns and risk levels in different areas.
*   **Missing Person Auto-Match**: Automated system matching reported missing persons with found unidentified persons or bodies.
*   **Admin Dashboard**: comprehensive dashboard for officers to manage reports, update case statuses, and oversee operations.

---

## 🛠️ Technology Stack

*   **Frontend**: React.js (Vite), Tailwind CSS
*   **Backend**: Node.js, Express.js
*   **Database**: MySQL
*   **Authentication**: JWT (JSON Web Tokens) & Bcrypt

---

## 📦 Getting Started

For detailed instructions on how to set up, configure, and run this project locally, please refer to the **[Setup Guide](README_SETUP.md)**.

**Quick Setup Summary:**
1.  **Database**: Import `database/schema.sql` into your MySQL server (e.g., via XAMPP).
2.  **Backend**: Run `npm install` and `npm start` in the `backend/` directory.
3.  **Frontend**: Run `npm install` and `npm run dev` in the project root.

> **Note**: This is a Software Engineering Lab project. Some features like payment processing and facial recognition are simulated for demonstration purposes.

---

## 📁 Project Structure

```bash
Metro-Police/
├── backend/          # Node.js/Express API & Database Logic
├── database/         # SQL Schema & Dummy Data
├── src/              # React Frontend Source Code
│   ├── components/   # Reusable UI Components
│   ├── pages/        # Application Pages (Dashboard, Reports, etc.)
│   └── context/      # State Management (Auth)
└── README_SETUP.md   # Detailed Installation Instructions
```


### 👥 Team Members

- **MD Ifta Faisal**
- **MD. Israfil Hossain**
- **Md. Biplob**
- **Ashiq Anzum**
