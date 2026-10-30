# FreshMart — Online Grocery Store

React + Vite frontend and Java 21 / Spring Boot backend using **MongoDB**, JWT authentication, Razorpay payments, and SMTP payment-confirmation emails.

## Security
The original uploaded source contained credential-like values. They are removed from runtime configuration in this revision. Rotate any MongoDB Atlas and Razorpay credentials from the previous archive. Never commit real secrets.

## Requirements
- JDK 21, Maven 3.9+, Node.js 20+
- MongoDB local or MongoDB Atlas
- Razorpay test account
- SMTP account/app password for email delivery

## Configuration
Copy `backend/.env.example` values into your operating-system environment or IDE run configuration. Set `MONGODB_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and SMTP variables.

Backend: port **8080**. Vite proxies `/api` and `/ws` to port 8080.

### Windows CMD example
Run from the project root:
```cmd
set MONGODB_URI=mongodb://localhost:27017/freshmart
set JWT_SECRET=replace-with-a-long-random-secret-value
set RAZORPAY_KEY_ID=rzp_test_your_key_id
set RAZORPAY_KEY_SECRET=your_razorpay_test_secret
set MAIL_HOST=smtp.gmail.com
set MAIL_PORT=587
set MAIL_USERNAME=your-sender@gmail.com
set MAIL_PASSWORD=your-google-app-password
set MAIL_FROM=your-sender@gmail.com
cd backend
mvn spring-boot:run
```
For MongoDB Atlas, use your new Atlas URI as `MONGODB_URI`. URL-encode special characters in the password.

Open a second terminal:
```cmd
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

## Authentication
Public registration always creates `ROLE_CUSTOMER`; role values sent by a browser are ignored. Provision admins through a trusted database/bootstrap process. Passwords are BCrypt-hashed and API access uses JWT.

## Payment and email flow
Razorpay orders are created server-side. The backend verifies the Razorpay signature before marking an order paid. The payment record is saved in MongoDB and a confirmation email is sent immediately after successful verification when SMTP is configured. The mock-payment success fallback has been removed. Missing Razorpay credentials fail safely. Configure and verify Razorpay webhooks before production deployment.

A mail-provider failure is logged and does not undo a verified payment. Swagger: `http://localhost:8080/swagger-ui.html`.

## Build
```cmd
cd frontend
npm install
npm run build
cd ..\backend
mvn -DskipTests package
```
