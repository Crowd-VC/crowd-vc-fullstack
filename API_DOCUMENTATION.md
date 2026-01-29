# CrowdVC API Documentation

Complete API reference for the CrowdVC platform.

---

## Table of Contents

1. [Pools API](#pools-api)
2. [Pitches API](#pitches-api)
3. [Contributions API](#contributions-api)
4. [Voting API](#voting-api)
5. [Users API](#users-api)
6. [Admin - Pools API](#admin-pools-api)
7. [Admin - Pitches API](#admin-pitches-api)
8. [Email API](#email-api)

---

## Pools API

### Get All Active Pools
Retrieve all active pools available for investors.

**Endpoint:** `GET /api/pools`

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "category": "string",
    "status": "active | upcoming | closed",
    "fundingGoal": "number",
    "currentFunding": "number",
    "votingDeadline": "ISO 8601 date",
    "minContribution": "number",
    "maxContribution": "number | null",
    "contractAddress": "string",
    "fundingDuration": "number | null",
    "acceptedToken": "string | null",
    "startupCount": "number",
    "contributorCount": "number"
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### Get Pool Details
Retrieve detailed information about a specific pool including startups and votes.

**Endpoint:** `GET /api/pools/{id}`

**Path Parameters:**
- `id` (string, required) - Pool ID

**Query Parameters:**
- `userId` (string, optional) - User ID to check if they have voted

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "status": "active | upcoming | closed",
  "fundingGoal": "number",
  "currentFunding": "number",
  "votingDeadline": "ISO 8601 date",
  "minContribution": "number",
  "maxContribution": "number | null",
  "contractAddress": "string",
  "startups": [
    {
      "id": "string",
      "title": "string",
      "summary": "string",
      "voteCount": "number"
    }
  ],
  "userVoted": "boolean",
  "userVote": {
    "pitchId": "string",
    "createdAt": "ISO 8601 date"
  } | null
}
```

**Status Codes:**
- `200` - Success
- `404` - Pool not found
- `500` - Server error

---

## Pitches API

### Create Pitch
Submit a new pitch to the platform.

**Endpoint:** `POST /api/pitches`

**Request Body:**
```json
{
  "pitchId": "string (required)",
  "userId": "string (wallet address, optional)",
  "title": "string (required)",
  "summary": "string (required)",
  "elevatorPitch": "string (required)",
  "industry": "string (required)",
  "companyStage": "string (required)",
  "teamSize": "string (required)",
  "location": "string (required)",
  "website": "string (optional)",
  "oneKeyMetric": "string (required)",
  "fundingGoal": "number | 'custom' (required)",
  "customAmount": "number (optional)",
  "productDevelopment": "number (optional)",
  "marketingSales": "number (optional)",
  "teamExpansion": "number (optional)",
  "operations": "number (optional)",
  "timeToRaise": "string (optional)",
  "expectedROI": "string (optional)",
  "pitchDeckUrl": "string (optional)",
  "pitchVideoUrl": "string (optional)",
  "imageUrl": "string (optional)",
  "demoUrl": "string (optional)",
  "prototypeUrl": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "submissionId": "string",
    "title": "string",
    "status": "pending",
    "reviewTimeline": "3-5 business days",
    ...
  },
  "message": "Pitch submitted successfully"
}
```

**Status Codes:**
- `201` - Created successfully
- `500` - Server error

---

### Get All Pitches
Retrieve all pitches with optional status filtering.

**Endpoint:** `GET /api/pitches`

**Query Parameters:**
- `status` (string, optional) - Filter by status: `pending`, `approved`, `rejected`, `in-pool`, `under-review`, `shortlisted`, `needs-more-info`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "string",
      "submissionId": "string",
      "title": "string",
      "summary": "string",
      "status": "string",
      "createdAt": "ISO 8601 date",
      ...
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### Get User Pitches
Retrieve all pitches for a specific user by wallet address.

**Endpoint:** `GET /api/pitches/user/{address}`

**Path Parameters:**
- `address` (string, required) - Wallet address

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "status": "string",
      "submissionId": "string",
      "createdAt": "ISO 8601 date",
      ...
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing wallet address
- `500` - Server error

---

### Send Pitch Status Email
Send status notification email to pitch submitter.

**Endpoint:** `POST /api/pitch-status`

**Request Body:**
```json
{
  "pitchId": "string (required)",
  "status": "approved | rejected (required)",
  "reason": "string (optional)",
  "customNotes": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "string",
  "message": "Email sent successfully"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `404` - Pitch not found
- `500` - Server error

---

## Contributions API

### Create Contribution
Record a new contribution to a pool.

**Endpoint:** `POST /api/contributions`

**Request Body:**
```json
{
  "poolId": "string (required)",
  "userId": "string (required)",
  "walletAddress": "string (required)",
  "amount": "number (required, must be positive)",
  "platformFee": "number (optional, defaults to 5)",
  "gasFee": "number (optional, defaults to 0)",
  "transactionHash": "string (optional)"
}
```

**Response:**
```json
{
  "id": "string",
  "poolId": "string",
  "userId": "string",
  "walletAddress": "string",
  "amount": "number",
  "platformFee": "number",
  "gasFee": "number",
  "status": "confirmed",
  "transactionHash": "string | null",
  "createdAt": "ISO 8601 date"
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - Invalid request
- `500` - Server error

---

### Get Contributions
Retrieve contributions by pool or user.

**Endpoint:** `GET /api/contributions`

**Query Parameters (one required):**
- `poolId` (string, optional) - Get contributions for a specific pool
- `userId` (string, optional) - Get contributions for a specific user

**Response:**
```json
[
  {
    "id": "string",
    "poolId": "string",
    "userId": "string",
    "walletAddress": "string",
    "amount": "number",
    "platformFee": "number",
    "gasFee": "number",
    "status": "pending | confirmed | failed",
    "transactionHash": "string | null",
    "createdAt": "ISO 8601 date"
  }
]
```

**Status Codes:**
- `200` - Success
- `400` - Missing required parameter
- `500` - Server error

---

### Get Contribution by ID
Retrieve a specific contribution.

**Endpoint:** `GET /api/contributions/{id}`

**Path Parameters:**
- `id` (string, required) - Contribution ID

**Response:**
```json
{
  "id": "string",
  "poolId": "string",
  "userId": "string",
  "walletAddress": "string",
  "amount": "number",
  "status": "pending | confirmed | failed",
  "transactionHash": "string | null",
  ...
}
```

**Status Codes:**
- `200` - Success
- `404` - Contribution not found
- `500` - Server error

---

### Update Contribution Status
Update the status of a contribution.

**Endpoint:** `PATCH /api/contributions/{id}`

**Path Parameters:**
- `id` (string, required) - Contribution ID

**Request Body:**
```json
{
  "status": "pending | confirmed | failed (required)",
  "transactionHash": "string (optional)"
}
```

**Response:**
```json
{
  "id": "string",
  "status": "string",
  "transactionHash": "string | null",
  "updatedAt": "ISO 8601 date",
  ...
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid status
- `404` - Contribution not found
- `500` - Server error

---

## Voting API

### Cast Vote
Vote for a startup in a pool.

**Endpoint:** `POST /api/pools/{id}/vote`

**Path Parameters:**
- `id` (string, required) - Pool ID

**Request Body:**
```json
{
  "pitchId": "string (required)",
  "userId": "string (required)",
  "walletAddress": "string (required)"
}
```

**Response:**
```json
{
  "id": "string",
  "poolId": "string",
  "pitchId": "string",
  "userId": "string",
  "walletAddress": "string",
  "createdAt": "ISO 8601 date"
}
```

**Status Codes:**
- `201` - Vote cast successfully
- `400` - Missing required fields or duplicate vote
- `500` - Server error

---

## Users API

### Get User by Wallet Address
Retrieve user information by wallet address.

**Endpoint:** `GET /api/users/{address}`

**Path Parameters:**
- `address` (string, required) - Wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "walletAddress": "string",
    "name": "string | null",
    "userType": "startup | investor | admin",
    "createdAt": "ISO 8601 date"
  } | null
}
```

**Status Codes:**
- `200` - Success (returns null data if user not found)
- `400` - Missing wallet address
- `500` - Server error

---

### Create or Update User
Create a new user or update existing user by wallet address.

**Endpoint:** `PUT /api/users/{address}`

**Path Parameters:**
- `address` (string, required) - Wallet address

**Request Body:**
```json
{
  "email": "string (required for new users)",
  "name": "string (optional)",
  "userType": "startup | investor | admin (optional, defaults to 'startup')"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "walletAddress": "string",
    "name": "string | null",
    "userType": "string",
    "createdAt": "ISO 8601 date"
  },
  "message": "Profile created successfully" | "Profile updated successfully"
}
```

**Status Codes:**
- `200` - Updated successfully
- `201` - Created successfully
- `400` - Invalid request
- `409` - Email already in use
- `500` - Server error

---

## Admin - Pools API

### Get All Pools (Admin)
Retrieve all pools (admin access).

**Endpoint:** `GET /api/admin/pools`

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "category": "string",
    "status": "active | upcoming | closed",
    "fundingGoal": "number",
    "currentFunding": "number",
    "votingDeadline": "ISO 8601 date",
    "contractAddress": "string",
    ...
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### Create Pool (Admin)
Create a new investment pool with smart contract integration.

**Endpoint:** `POST /api/admin/pools`

**Request Body:**
```json
{
  "id": "string (optional, auto-generated if not provided)",
  "name": "string (required)",
  "description": "string (required)",
  "category": "string (required)",
  "votingDeadline": "ISO 8601 date (required)",
  "status": "active | upcoming | closed (optional, defaults to 'upcoming')",
  "fundingGoal": "number (optional, defaults to 0)",
  "minContribution": "number (optional, defaults to 1000)",
  "maxContribution": "number (optional)",
  "contractAddress": "string (required)",
  "fundingDuration": "number (optional)",
  "acceptedToken": "string (optional)"
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "status": "string",
  "contractAddress": "string",
  "createdAt": "ISO 8601 date",
  ...
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - Missing required fields
- `500` - Server error

---

### Get Pool by ID (Admin)
Retrieve a specific pool.

**Endpoint:** `GET /api/admin/pools/{id}`

**Path Parameters:**
- `id` (string, required) - Pool ID

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "status": "string",
  ...
}
```

**Status Codes:**
- `200` - Success
- `404` - Pool not found
- `500` - Server error

---

### Update Pool Status (Admin)
Update the status of a pool.

**Endpoint:** `PATCH /api/admin/pools/{id}`

**Path Parameters:**
- `id` (string, required) - Pool ID

**Request Body:**
```json
{
  "status": "active | closed | upcoming (required)"
}
```

**Response:**
```json
{
  "id": "string",
  "status": "string",
  "updatedAt": "ISO 8601 date",
  ...
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid status
- `404` - Pool not found
- `500` - Server error

---

### Get Pool Startups (Admin)
Retrieve all startups assigned to a pool.

**Endpoint:** `GET /api/admin/pools/{id}/startups`

**Path Parameters:**
- `id` (string, required) - Pool ID

**Response:**
```json
[
  {
    "id": "string",
    "title": "string",
    "summary": "string",
    "status": "string",
    ...
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### Assign Startup to Pool (Admin)
Add a startup (pitch) to a pool.

**Endpoint:** `POST /api/admin/pools/{id}/startups`

**Path Parameters:**
- `id` (string, required) - Pool ID

**Request Body:**
```json
{
  "pitchId": "string (required)"
}
```

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `201` - Assigned successfully
- `400` - Missing pitchId or validation error
- `500` - Server error

---

### Remove Startup from Pool (Admin)
Remove a startup from a pool.

**Endpoint:** `DELETE /api/admin/pools/{id}/startups`

**Path Parameters:**
- `id` (string, required) - Pool ID

**Query Parameters:**
- `pitchId` (string, required) - Pitch ID to remove

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing pitchId
- `500` - Server error

---

## Admin - Pitches API

### Get All Pitches with User Details (Admin)
Retrieve all pitches with associated user information.

**Endpoint:** `GET /api/admin/pitches`

**Response:**
```json
{
  "pitches": [
    {
      "id": "string",
      "title": "string",
      "summary": "string",
      "status": "string",
      "user": {
        "id": "string",
        "email": "string",
        "name": "string",
        "walletAddress": "string"
      },
      "submissionId": "string",
      "createdAt": "ISO 8601 date",
      ...
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### Get Pitch by ID (Admin)
Retrieve detailed information about a specific pitch.

**Endpoint:** `GET /api/admin/pitches/{id}`

**Path Parameters:**
- `id` (string, required) - Pitch ID

**Response:**
```json
{
  "pitch": {
    "id": "string",
    "title": "string",
    "summary": "string",
    "elevatorPitch": "string",
    "status": "string",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "walletAddress": "string"
    },
    "industry": "string",
    "companyStage": "string",
    "fundingGoal": "number",
    ...
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Pitch not found
- `500` - Server error

---

### Update Pitch Status (Admin)
Approve or reject a pitch and send notification email.

**Endpoint:** `PATCH /api/admin/pitches/{id}`

**Path Parameters:**
- `id` (string, required) - Pitch ID

**Request Body:**
```json
{
  "status": "approved | rejected (required)",
  "adminId": "string (required)",
  "reason": "string (optional)",
  "customNotes": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "pitch": {
    "id": "string",
    "status": "string",
    "updatedAt": "ISO 8601 date",
    ...
  },
  "emailSent": true | false
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `404` - Pitch not found
- `500` - Server error

---

## Email API

### Send Email (Resend Integration)
Send transactional emails using Resend service.

**Endpoint:** `POST /api/send`

**Request Body:**
```json
{
  "email": "string (required)",
  "firstName": "string (required)"
}
```

**Response:**
```json
{
  "id": "string",
  "from": "CrowdVC <onboarding@resend.dev>",
  "to": "string",
  "created_at": "ISO 8601 date"
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

## Error Response Format

All endpoints return errors in a consistent format:

```json
{
  "error": "Error message description",
  "details": "Optional detailed error information"
}
```

Or for endpoints with success flags:

```json
{
  "success": false,
  "error": "Error message description",
  "message": "Optional additional context"
}
```

---

## Status Code Reference

- `200` - OK (successful GET, PATCH, DELETE)
- `201` - Created (successful POST)
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Notes

1. **Authentication**: Currently, most admin endpoints have TODO comments for authentication. Implementation required.
2. **Date Format**: All dates are in ISO 8601 format.
3. **Wallet Addresses**: Must be valid Ethereum addresses (starting with "0x").
4. **Smart Contracts**: Pool creation requires a valid contract address.
5. **Email Service**: Uses Resend API (requires `RESEND_API_KEY` environment variable).
6. **User Creation**: When submitting pitches, users are automatically created if they don't exist.
7. **Vote Uniqueness**: One vote per user per pool (enforced at database level).

---

*Last updated: 2026-01-29*
