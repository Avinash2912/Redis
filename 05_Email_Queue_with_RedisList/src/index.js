import express from 'express';
import Redis from 'ioredis';

const app = express();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
app.use(express.json());


const QUEUE_KEY = 'queue:email_queue';

app.post('/emails', async (req, res) => {
    const job ={
        to: req.body.to,
        subject: req.body.subject,
        body: req.body.body,
        createdAt: new Date().toISOString()

    };
    await redis.lpush(QUEUE_KEY, JSON.stringify(job));
    res.json({ message: 'Email enqueued successfully', queued: true });
});


app.get('/emails/process-one', async (req, res) => {
    const jobData = await redis.rpop(QUEUE_KEY);
    if (jobData) {
        const job = JSON.parse(jobData);
        // Simulate email sending
        console.log(`Processing email to: ${job.to}, subject: ${job.subject}`);
        res.json({ message: 'Email processed successfully', job });
    } else {
        res.json({ message: 'No emails to process', job: null });
    }
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});