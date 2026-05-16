import express from 'express';
import Redis from 'ioredis';

const app = express();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
app.use(express.json());

app.post('/user/:id/json', async (req, res) => {
    
    await redis.set(`user:${req.params.id}:json`, JSON.stringify(req.body));
    res.json({ message: 'User profile saved successfully', success: true });
});

app.get('/user/:id/json', async (req, res) => {
    const userProfile = await redis.get(`user:${req.params.id}:json`);
    if (userProfile) {
        res.json({ profile: JSON.parse(userProfile) });
    } else {
        res.json({ profile: null, message: 'User profile not found' });
    }
    
});




app.post('/user/:id/hash', async (req, res) => {
    await redis.hset(`user:${req.params.id}:hash`, req.body);
    res.json({ message: 'User profile saved successfully', success: true });
});


app.get('/user/:id/hash', async (req, res) => {
    const userProfile = await redis.hgetall(`user:${req.params.id}:hash`);      
    if (Object.keys(userProfile).length > 0) {
        res.json({ profile: userProfile });
    } else {
        res.json({ profile: null, message: 'User profile not found' });
    }   
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});