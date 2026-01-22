# Elite Paisa Backend

Elite Paisa is a comprehensive loan management system that enables clients to apply for various types of loans and allows administrators to manage loan products and applications.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Profile Management](#profile-management)
  - [Loan Types](#loan-types)
  - [Loan Applications](#loan-applications)
  - [Document Upload](#document-upload)
- [API Usage Examples](#api-usage-examples)
- [License](#license)

## Features

- **User Authentication**: Secure JWT-based authentication system
- **Profile Management**: Complete user profile with employment and financial details
- **Loan Management**: Comprehensive loan type and application management system
- **Document Upload**: Secure document upload to AWS S3
- **Role-based Access Control**: Different permissions for admin and client users
- **Loan Categories**: Support for multiple loan categories and subcategories

## Tech Stack

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web framework for Node.js
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Token for authentication
- **Multer**: File upload middleware
- **AWS SDK**: Integration with Amazon S3 for document storage
- **Cors**: Cross-origin resource sharing

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Elite-paisa-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see below)

4. Start the server:
```bash
npm start
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/elite-paisa
JWT_SECRET=your-jwt-secret-key
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=your-aws-region
AWS_BUCKET_NAME=your-s3-bucket-name
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login a user |
| POST | `/api/auth/logout` | Logout a user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password/:resetToken` | Reset password |

#### Signup/Register Body Structure

```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phoneNo": "9876543210",
  "password": "SecurePassword123!",
  "role": "client"
}
```

#### Login Body Structure

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

### Profile Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/profile` | Create or update user profile | Private (Client/Admin) |
| GET | `/api/profile` | Get user profile | Private (Client/Admin) |
| PUT | `/api/profile` | Update user profile | Private (Client/Admin) |
| DELETE | `/api/profile` | Delete user profile | Private (Client/Admin) |
| POST | `/api/profile/upload/profile-pic` | Upload profile picture | Private (Client/Admin) |

#### Profile Body Structure

```json
{
  "fullName": "John Doe",
  "panNo": "ABCDE1234F",
  "adharNo": "123456789012",
  "phoneNo": "9876543210",
  "phoneNo2": "9123456789",
  "email": "john.doe@example.com",
  "address": {
    "addressLine": "123 Main Street, Building A",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "age": 30,
  "employmentDetails": {
    "employmentType": "salaried",
    "companyName": "Tech Solutions Pvt Ltd",
    "monthlyIncome": 75000,
    "experience": 5
  },
  "bankDetails": [
    {
      "bankName": "State Bank of India",
      "accountNo": "123456789012",
      "accountHolderName": "John Doe",
      "bankBranch": "Mumbai Central",
      "ifscCode": "SBIN0002499"
    }
  ]
}
```

### Loan Types

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/loan-types` | Create a new loan type | Private (Admin) |
| GET | `/api/loan-types` | Get all loan types | Public |
| GET | `/api/loan-types/:id` | Get loan type by ID | Public |
| PUT | `/api/loan-types/:id` | Update loan type | Private (Admin) |
| DELETE | `/api/loan-types/:id` | Delete loan type | Private (Admin) |

#### Loan Type Body Structure

```json
{
  "loanName": "Personal Loan",
  "loanCategory": "personal",
  "loanSubcategory": "personal",
  "minAmount": 50000,
  "maxAmount": 2000000,
  "interestRate": {
    "min": 10.5,
    "max": 18.0
  },
  "tenure": {
    "minMonths": 6,
    "maxMonths": 60
  },
  "processingFee": "2% + GST",
  "eligibilityCriteria": "Min salary ₹25,000/month, Age 21-60 years",
  "requiredDocuments": ["PAN Card", "Aadhaar Card", "Salary Slips", "Bank Statements"],
  "status": "active"
}
```

### Loan Applications

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/loan-applications/apply` | Apply for a loan | Private (Client) |
| GET | `/api/loan-applications/my` | Get my loan applications | Private (Client) |
| GET | `/api/loan-applications` | Get all loan applications | Private (Admin) |
| GET | `/api/loan-applications/:id` | Get loan application by ID | Private (Client/Admin) |
| PATCH | `/api/loan-applications/:id/status` | Update application status | Private (Admin) |

#### Loan Application Body Structure

```json
{
  "loanTypeId": "6971b905f2f6fd809184fb4b",
  "loanAmount": 500000,
  "tenure": 24,
  "purpose": "Home renovation",
  "monthlyIncome": 60000,
  "existingEMI": 15000,
  "creditScore": 750,
  "documents": {
    "pan": "https://your-bucket.s3.amazonaws.com/elite-paisa/loan-documents/pan/filename.jpg",
    "aadhaar": "https://your-bucket.s3.amazonaws.com/elite-paisa/loan-documents/aadhaar/filename.jpg",
    "bankStatement": "https://your-bucket.s3.amazonaws.com/elite-paisa/loan-documents/bank-statement/filename.pdf",
    "salarySlip": "https://your-bucket.s3.amazonaws.com/elite-paisa/loan-documents/salary-slip/filename.pdf"
  }
}
```

### Document Upload

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/loan-applications/upload/pan` | Upload PAN document | Private (Client) |
| POST | `/api/loan-applications/upload/aadhaar` | Upload Aadhaar document | Private (Client) |
| POST | `/api/loan-applications/upload/bank-statement` | Upload bank statement | Private (Client) |
| POST | `/api/loan-applications/upload/salary-slip` | Upload salary slip | Private (Client) |
| POST | `/api/loan-applications/upload/property-document` | Upload property document | Private (Client) |
| POST | `/api/loan-applications/upload/business-document` | Upload business document | Private (Client) |

## API Usage Examples

### Client Side Operations

#### 1. Apply for a Loan

First, upload required documents:

```bash
curl -X POST \
  http://localhost:5000/api/loan-applications/upload/pan \
  -H 'Authorization: Bearer <client-jwt-token>' \
  -H 'Content-Type: multipart/form-data' \
  -F 'document=@/path/to/pan-card.pdf'
```

Then apply for the loan:

```bash
curl -X POST \
  http://localhost:5000/api/loan-applications/apply \
  -H 'Authorization: Bearer <client-jwt-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "loanTypeId": "6971b905f2f6fd809184fb4b",
    "loanAmount": 500000,
    "tenure": 24,
    "purpose": "Home renovation",
    "monthlyIncome": 60000,
    "existingEMI": 15000,
    "creditScore": 750,
    "documents": {
      "pan": "https://your-bucket.s3.amazonaws.com/elite-paisa/loan-documents/pan/filename.jpg",
      "aadhaar": "https://your-bucket.s3.amazonaws.com/elite-paisa/loan-documents/aadhaar/filename.jpg",
      "bankStatement": "https://your-bucket.s3.amazonaws.com/elite-paisa/loan-documents/bank-statement/filename.pdf",
      "salarySlip": "https://your-bucket.s3.amazonaws.com/elite-paisa/loan-documents/salary-slip/filename.pdf"
    }
  }'
```

#### 2. Get My Loan Applications

```bash
curl -X GET \
  http://localhost:5000/api/loan-applications/my \
  -H 'Authorization: Bearer <client-jwt-token>'
```

### Admin Side Operations

#### 1. Create a Loan Type

```bash
curl -X POST \
  http://localhost:5000/api/loan-types \
  -H 'Authorization: Bearer <admin-jwt-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "loanName": "Home Construction Loan",
    "loanCategory": "home", 
    "loanSubcategory": "home-construction",
    "minAmount": 500000,
    "maxAmount": 5000000,
    "interestRate": {"min": 8.5, "max": 12.0},
    "tenure": {"minMonths": 120, "maxMonths": 360},
    "processingFee": "0.5% + GST",
    "eligibilityCriteria": "Property documents, Income proof",
    "requiredDocuments": ["Property Papers", "PAN", "Aadhaar", "Income Certificate"],
    "status": "active"
  }'
```

#### 2. Get All Loan Applications

```bash
curl -X GET \
  http://localhost:5000/api/loan-applications \
  -H 'Authorization: Bearer <admin-jwt-token>'
```

#### 3. Update Loan Application Status

```bash
curl -X PATCH \
  http://localhost:5000/api/loan-applications/6971b905f2f6fd809184fb4b/status \
  -H 'Authorization: Bearer <admin-jwt-token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "approved",
    "remarks": "All documents verified, credit score satisfactory"
  }'
```

## Supported Loan Categories and Subcategories

### Personal Loans
- Personal Loan
- Instant Personal Loan
- Short-Term Loan
- Emergency Loan
- Wedding Loan
- Travel Loan
- Medical Loan

### Home & Property Loans
- Home Loan
- Home Construction Loan
- Home Renovation Loan
- Land / Plot Loan
- Loan Against Property (LAP)

### Vehicle Loans
- Car Loan (New Car)
- Used Car Loan
- Two-Wheeler Loan
- Commercial Vehicle Loan

### Business Loans
- Business Loan
- Startup Loan
- MSME / SME Loan
- Working Capital Loan
- Machinery Loan
- Invoice / Bill Discounting
- Merchant Cash Advance

### Education Loans
- Education Loan (India)
- Education Loan (Abroad)
- Skill Development Loan

### Agriculture Loans
- Crop Loan
- Equipment / Tractor Loan
- Irrigation Loan
- Kisan Credit Card (KCC)

### Gold & Secured Loans
- Gold Loan
- Fixed Deposit Loan
- Loan Against Shares / Mutual Funds

## License

This project is licensed under the MIT License.