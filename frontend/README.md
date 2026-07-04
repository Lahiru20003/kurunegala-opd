# 🏥 Kurunegala Teaching Hospital - OPD Queue Management System

A comprehensive, real-time Outpatient Department (OPD) Queue Management System built using the MERN stack. This system is designed to streamline clinic bookings, prioritize patients with special needs, and provide live queue tracking to enhance the overall healthcare experience for both patients and hospital staff.

---

## ✨ Key Features

### 🧑‍⚕️ Patient Portal (User-facing)
* **Multilingual Support:** Seamlessly switch between English, Sinhala, and Tamil.
* **Smart Booking System:** Book clinic appointments up to 4 days prior to the scheduled date.
* **Live Queue Tracking:** Real-time updates on "Currently Calling" token, "People Ahead", and "Estimated Time".
* **Priority Allocation:** Automated priority scoring based on Age (DOB) and Special Needs (Pregnant/Disabled).
* **Search & Filter:** Easily find specific clinics by name or date.
* **Smart Notifications:** Automatic removal of expired or cancelled clinics from the live tracking dashboard.

### 🛡️ Admin / Staff Portal
* **Secure Access:** Dedicated and protected login for authorized hospital staff.
* **Clinic Management:** Schedule new clinics, set maximum token limits, calculate average time per patient, and cancel clinics with one click.
* **Live Queue Control:** Call the next patient, mark as completed, and monitor daily statistics (Total Bookings, Waiting List, Completed).
* **Special Needs Verification:** Dedicated alert system to securely review, approve, or reject special medical needs requested by patients.
* **Advanced Search:** Find patients instantly using their NIC (National Identity Card) or Guardian NIC.

---

## 🛠️ Technology Stack

**Frontend:**
* React.js (Vite)
* Bootstrap 5 (Styling & UI Components)
* React Router DOM
* Axios (HTTP Client)

**Backend:**
* Node.js
* Express.js
* MongoDB & Mongoose (Database)
* Moment.js (Date & Time manipulation)

---

## 🚀 Installation & Setup Guide

To run this project locally on your machine, follow these steps:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed on your computer.

### 2. Clone the Repository
```bash
git clone [https://github.com/your-username/kurunegala-opd-system.git](https://github.com/your-username/kurunegala-opd-system.git)
cd kurunegala-opd-system