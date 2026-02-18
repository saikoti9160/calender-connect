# Calender Connect — Scheduling SaaS Platform

A production-grade **Calendly Clone** built with a **Java Spring Boot** backend and **React** frontend. This application offers a full-stack solution for appointment scheduling, including public booking pages, availability management, and admin controls.

## 📸 Screenshots

### Dashboard
<img width="1908" height="973" alt="image" src="https://github.com/user-attachments/assets/6aa5ef95-2964-424b-9fd7-6b669f03d267" />

*Overview of upcoming meetings and quick stats.*

### Event Types
!<img width="1910" height="863" alt="image" src="https://github.com/user-attachments/assets/6c13d847-e60b-4bf1-97a3-6e265014313c" />

*Manage your different meeting types and configurations.*

### Availability
!<img width="1915" height="867" alt="image" src="https://github.com/user-attachments/assets/3d77efdb-19ea-48c0-9080-8aaac0b58bbd" />

*Configure your weekly schedule with an intuitive toggle editor.*

### Public Booking Flow
<img width="1326" height="853" alt="image" src="https://github.com/user-attachments/assets/51ec863e-cbd3-4ac9-9edd-24ecdbd8185c" />

*Clean, frictionless booking experience for your guests.*


Admin Panel
<img width="1877" height="859" alt="image" src="https://github.com/user-attachments/assets/f124b4f2-5ed6-4552-ac55-43748e38bd04" />


---

## 🚀 Key Features

### 🌟 Frontend (React + Vite)
-   **Modern Dashboard**: View upcoming meetings, stats, and manage event types.
-   **Public Booking Page**: A polished, 4-step booking flow for guests (no login required).
-   **Availability Manager**: Interactive weekly schedule editor.
-   **Event Types**: Create and customize meeting types (duration, location, color).
-   **User Profiles**: Manage account details and personalized booking links.
-   **Admin Panel**: User management and platform-wide statistics.
-   **Responsive Design**: Fully responsive UI built with a custom dark-mode design system.

### ⚙️ Backend (Spring Boot)
-   **Robust Architecture**: 8 REST controllers, 9 business services, and JPA repositories.
-   **Security**: Full JWT authentication, BCrypt password hashing, and role-based access control (RBAC).
-   **Smart Scheduling**: Core slot generation engine handling time zones, buffers, and double-booking prevention.
-   **Database**: PostgreSQL schema with optimized relationships and constraints.
-   **Integrations**: Stubs for Google Calendar and Zoom integrations.
-   **Email Notifications**: Async email service for booking confirmations.

---

## 🛠️ Tech Stack

-   **Backend**: Java 17, Spring Boot 3, Spring Security, JPA/Hibernate, PostgreSQL, Docker
-   **Frontend**: React 18, Vite, Axios, React Router 6, Lucide React
-   **DevOps**: Docker Compose, Nginx (for production build)

---

## 🏃‍♂️ Getting Started

### Prerequisites
-   Docker & Docker Compose
-   *OR* Java 17+ and Node.js 18+ (for local dev)

### Option 1: Docker Compose (Recommended)
The easiest way to run the full stack (Frontend + Backend + DB).

```bash
docker-compose up --build
```
-   **Frontend**: [http://localhost:3000](http://localhost:3000)
-   **Backend**: [http://localhost:8080](http://localhost:8080)

### Option 2: Local Development

**1. Backend**
```bash
cd backend
mvn spring-boot:run
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```
-   **Frontend**: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Default Credentials

The system seeds a default admin user on startup:

-   **Email**: `admin@antigravity.com`
-   **Password**: `Admin@123`

---

## 📁 Project Structure

```
AgentDemo/
├── backend/                # Spring Boot Application
│   ├── src/main/java/      # Source code
│   └── Dockerfile          # Backend container config
├── frontend/               # React Application
│   ├── src/pages/          # React pages (Dashboard, Booking, etc.)
│   └── Dockerfile          # Frontend container config
├── docker-compose.yml      # Orchestration
└── init.sql                # Database schema
```

## 📜 License
This project is open-source and available for personal and educational use.
