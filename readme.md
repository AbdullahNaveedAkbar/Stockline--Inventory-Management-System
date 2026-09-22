# Full-Stack Application

A full-stack application featuring a live React frontend hosted on Vercel and a Spring Boot REST API backend powered by MySQL.

---

## 🌐 Live Application

* **Frontend App:** [Insert Your Vercel Link Here](https://your-app.vercel.app)

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, CSS (Deployed on Vercel)
* **Backend:** Java, Spring Boot, Spring Security, JWT, Spring Data JPA, Maven
* **Database:** MySQL

---

## 🚀 Getting Started & Local Backend Setup

To test and interact with the full application features (User Authentication, Dashboard, and Store Page), you need to run the Spring Boot backend and MySQL database locally on your machine.

### Prerequisites

Ensure you have the following installed:
* **Java Development Kit (JDK 17 or higher)**
* **MySQL Server**
* **IntelliJ IDEA** (or your preferred Java IDE)

---

### Step-by-Step Setup Instructions

#### 1. Clone the Repository

Open your terminal or command prompt and clone the project:

```bash
git clone <YOUR_REPOSITORY_URL>
cd full-stack-app
2. Configure MySQL Database Credentials
Open IntelliJ IDEA.

Go to File > Open and select the backend folder.

Navigate to backend/src/main/resources/application.properties.

Update the MySQL configuration with your local MySQL credentials:

Properties

spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name?createDatabaseIfNotExist=true
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD

3. Run the Backend Server
Make sure your local MySQL Server is running.

In IntelliJ IDEA, locate DemoApplication.java (under src/main/java/FirstSpring/).

Run DemoApplication.java to launch the Spring Boot backend server.

📱 How to Use the Application
Open the live frontend application via your Vercel Link.

Go to the Sign Up page to register a new user account.

Login with your newly created credentials.

After logging in, you will be redirected to the Dashboard / Store Page.

Note: Both the local Spring Boot backend server and the MySQL database must be running simultaneously for user registration, authentication, and store functionality to work properly on the app.