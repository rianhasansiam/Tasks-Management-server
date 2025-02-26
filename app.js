import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

import connectDB from "./config/database.js";
import userRoutes from './routes/UserRoutes.js';
import taskRoutes from "./routes/TaskRoutes.js";

connectDB();

app.use(cors({
    origin: ["http://localhost:5173", "https://task-management-cp.web.app"],
    credentials: true,

}));


app.get('/api', (req, res) => {
    res.send('Hello, this api server for Tas-Kit Project');
})


app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);




const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});