import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import weatherRoutes from './routes/weatherRoutes';
import favoritesRoutes from './routes/favoritesRoutes';
import authRoutes from './routes/authRoutes';  
import cacheRoutes from './routes/cacheRoutes'; 

const app = express();
const PORT = process.env.PORT || 8080;  

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());


app.use('/cache', cacheRoutes);
app.use('/weather', weatherRoutes);
app.use('/favorites', favoritesRoutes);
app.use('/auth', authRoutes);  

app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${PORT}`);
});
