# OTP Service

A lightweight REST API for generating and verifying one-time passwords (OTPs) via phone number, backed by Redis for fast, expiring storage.

## Prerequisites

- [Node.js](https://nodejs.org/) v16+
- A running [Redis](https://redis.io/) instance

## Installation

```bash
npm install
```

## Configuration

| Environment Variable | Default                    | Description                     |
|----------------------|----------------------------|---------------------------------|
| `REDIS_URL`          | `redis://localhost:6379`   | Redis connection string         |
| `PORT`               | `3000`                     | Port the server listens on      |

## Running the Server

```bash
# Development
node index.js

# With custom environment variables
REDIS_URL=redis://your-host:6379 PORT=8080 node index.js
```

## API Reference

### Send OTP

Generates a 6-digit OTP, stores it in Redis with a 30-second TTL, and returns it in the response.

```
POST /otp/send
```

**Request body**

```json
{
  "phoneNumber": "+911234567890"
}
```

**Response**

```json
{
  "message": "OTP sent to +911234567890",
  "otp": "482910"
}
```

> **Note:** In production, remove `otp` from the response and deliver it via SMS instead.

---

### Verify OTP

Validates the submitted OTP against the stored value. Deletes the OTP on successful verification.

```
POST /otp/verify
```

**Request body**

```json
{
  "phoneNumber": "+911234567890",
  "otp": "482910"
}
```

**Response — success (`200`)**

```json
{
  "message": "OTP verified successfully"
}
```

**Response — failure (`400`)**

```json
{
  "message": "Invalid or expired OTP"
}
```

---

### Get OTP TTL

Returns the remaining time-to-live (in seconds) for an OTP. Returns `-2` if the key does not exist or has expired.

```
GET /otp/:phone/ttl
```

**Response**

```json
{
  "ttl": 18
}
```

## Security Considerations

- **Expose the OTP in responses only during development.** In production, send it via a trusted SMS gateway and remove it from the API response.
- OTPs expire after **30 seconds** and are invalidated immediately after successful verification to prevent reuse.
- Consider adding **rate limiting** on `/otp/send` to prevent OTP flooding.
- Restrict `/otp/:phone/ttl` to internal/admin use — it should not be publicly accessible.

## License

MIT