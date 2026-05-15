import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());


const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

function otpKey(phoneNumber) {
  return `otp:${phoneNumber}`;
}

app.post("/otp/send", async (req, res) => {
  const { phoneNumber } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await redis.set(otpKey(phoneNumber), otp, "EX", 30,); // OTP expires in 30 seconds
  res.json({ message: `OTP sent to ${phoneNumber}`, otp });
});

app.post("/otp/verify", async (req, res) => {
  const { phoneNumber, otp } = req.body;
  const storedOtp = await redis.get(otpKey(phoneNumber));

  if (storedOtp === otp) {
    await redis.del(otpKey(phoneNumber)); // Invalidate OTP after successful verification
    res.json({ message: "OTP verified successfully" });
  } else {
    res.status(400).json({ message: "Invalid or expired OTP" });
  }
});

const PORT = process.env.PORT || 3000;

app.get("/otp/:phone/ttl", async (req, res) => {
  const { phone } = req.params;
  const ttl = await redis.ttl(otpKey(phone));
  res.json({ ttl });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

