import express from "express";
import Redis from "ioredis";

const app = express();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.use(express.json());

const BANNER_KEY = "app:banner";

app.post("/banner", async (req, res) => {
  const { message } = req.body;
   if (!message) {
    return res.status(400).json({ message: "Banner message is required" });
  }

    await redis.set(BANNER_KEY, message);
    res.json({ message: "Banner updated successfully" ,'success': true });

});

app.get("/banner", async (req, res) => {
  const bannerMessage = await redis.get(BANNER_KEY);
    if (bannerMessage) {
    res.json({ banner: bannerMessage });
    } else {
    res.json({ banner: null, message: "No banner set" });
    }
});


app.delete("/banner", async (req, res) => {
  await redis.del(BANNER_KEY);
    res.json({ message: "Banner removed successfully" ,'success': true });
});


app.get("/banner/exists", async (req, res) => {
    const exists = await redis.exists(BANNER_KEY);
    res.json({ exists: Boolean(exists)});
    // res.json({ exists: !!exists }); // Alternative way to convert to boolean});
});



const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
