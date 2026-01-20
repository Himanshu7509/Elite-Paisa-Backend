# Elite Paisa Backend API

A comprehensive backend API for financial management with authentication, profile management, and user features.

## Table of Contents
- [Authentication](#authentication)
- [Profile Management](#profile-management)
- [Password Reset](#password-reset)
- [Environment Variables](#environment-variables)
- [Error Handling](#error-handling)

## Authentication

### Signup
- **URL**: `POST /api/auth/signup`
- **Description**: Register a new user
- **Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNo": "1234567890",
  "password": "password123",
  "role": "client"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNo": "1234567890",
    "role": "client"
  }
}
```

### Login
- **URL**: `POST /api/auth/login`
- **Description**: Authenticate user and get token
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNo": "1234567890",
    "role": "client"
  }
}
```

## Profile Management

### Create or Update Profile
- **URL**: `POST /api/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Create a new profile or update existing one
- **Request Body**:
```json
{
  "fullName": "John Doe",
  "panNo": "ABCDE1234F",
  "adharNo": "123456789012",
  "pincode": "123456",
  "phoneNo": "1234567890",
  "phoneNo2": "0987654321",
  "email": "john@example.com",
  "address": "123 Main Street, City",
  "age": 30,
  "bankDetails": [
    {
      "bankName": "State Bank of India",
      "accountNo": "1234567890",
      "accountHolderName": "John Doe",
      "bankBranch": "Main Branch",
      "ifscCode": "SBIN0002499"
    }
  ],
  "profilePic": "https://s3.amazonaws.com/bucket/elite-paisa/profile-pics/image.jpg"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Profile created successfully",
  "profile": {
    "_id": "profile_id",
    "authId": "user_id",
    "fullName": "John Doe",
    "panNo": "ABCDE1234F",
    "adharNo": "123456789012",
    "pincode": "123456",
    "phoneNo": "1234567890",
    "phoneNo2": "0987654321",
    "email": "john@example.com",
    "address": "123 Main Street, City",
    "age": 30,
    "bankDetails": [
      {
        "_id": "bank_details_id",
        "bankName": "State Bank of India",
        "accountNo": "1234567890",
        "accountHolderName": "John Doe",
        "bankBranch": "Main Branch",
        "ifscCode": "SBIN0002499"
      }
    ],
    "profilePic": "https://s3.amazonaws.com/bucket/elite-paisa/profile-pics/image.jpg",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Get My Profile
- **URL**: `GET /api/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get the authenticated user's profile
- **Response**:
```json
{
  "success": true,
  "profile": {
    "_id": "profile_id",
    "authId": "user_id",
    "fullName": "John Doe",
    "panNo": "ABCDE1234F",
    "adharNo": "123456789012",
    "pincode": "123456",
    "phoneNo": "1234567890",
    "phoneNo2": "0987654321",
    "email": "john@example.com",
    "address": "123 Main Street, City",
    "age": 30,
    "bankDetails": [
      {
        "_id": "bank_details_id",
        "bankName": "State Bank of India",
        "accountNo": "1234567890",
        "accountHolderName": "John Doe",
        "bankBranch": "Main Branch",
        "ifscCode": "SBIN0002499"
      }
    ],
    "profilePic": "https://s3.amazonaws.com/bucket/elite-paisa/profile-pics/image.jpg",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Upload Profile Picture
- **URL**: `POST /api/profile/upload/profile-pic`
- **Headers**: `Authorization: Bearer <token>`
- **Form Data**: `profilePic` (file)
- **Description**: Upload a profile picture to S3
- **Response**:
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "profilePic": "https://s3.amazonaws.com/bucket/elite-paisa/profile-pics/image.jpg"
  }
}
```

### Get All Profiles (Admin Only)
- **URL**: `GET /api/profile/all`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get all user profiles (admin only)
- **Response**:
```json
{
  "success": true,
  "profiles": [
    {
      "_id": "profile_id",
      "authId": "user_id",
      "fullName": "John Doe",
      "panNo": "ABCDE1234F",
      "adharNo": "123456789012",
      "pincode": "123456",
      "phoneNo": "1234567890",
      "phoneNo2": "0987654321",
      "email": "john@example.com",
      "address": "123 Main Street, City",
      "age": 30,
      "bankDetails": [],
      "profilePic": "https://s3.amazonaws.com/bucket/elite-paisa/profile-pics/image.jpg",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Specific User Profile (Admin Only)
- **URL**: `GET /api/profile/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get a specific user's profile by ID (admin only)
- **Response**:
```json
{
  "success": true,
  "profile": {
    "_id": "profile_id",
    "authId": "user_id",
    "fullName": "John Doe",
    "panNo": "ABCDE1234F",
    "adharNo": "123456789012",
    "pincode": "123456",
    "phoneNo": "1234567890",
    "phoneNo2": "0987654321",
    "email": "john@example.com",
    "address": "123 Main Street, City",
    "age": 30,
    "bankDetails": [],
    "profilePic": "https://s3.amazonaws.com/bucket/elite-paisa/profile-pics/image.jpg",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Password Reset

### Forgot Password (Send OTP)
- **URL**: `POST /api/password/forgot-password`
- **Description**: Request password reset OTP
- **Request Body**:
```json
{
  "email": "john@example.com"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "OTP sent to your email address"
}
```

### Verify OTP
- **URL**: `POST /api/password/verify-otp`
- **Description**: Verify the OTP received via email
- **Request Body**:
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

### Reset Password
- **URL**: `POST /api/password/reset-password`
- **Description**: Reset password after OTP verification
- **Request Body**:
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Resend OTP
- **URL**: `POST /api/password/resend-otp`
- **Description**: Resend the password reset OTP
- **Request Body**:
```json
{
  "email": "john@example.com"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "OTP resent to your email address"
}
```

## Environment Variables

The application requires the following environment variables in a `.env` file:

```
PORT=5000
JWT_SECRET=your_jwt_secret_key
MONGO_URI=your_mongodb_connection_string
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_resend_from_email
```

## Error Handling

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode only)"
}
```

### Authentication Headers
All protected routes require the following header:
```
Authorization: Bearer <jwt_token>
```