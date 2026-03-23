import express from 'express';
import bookingsRoutes from './bookings/bookings.routes.js';
import propertiesRoutes from './properties/properties.routes.js';
// If running locally and START_LOCAL_SYNC=true, start the helper
import './run-local-sync.js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors({
    credentials: true,
}));

app.use('/bookings', bookingsRoutes);
app.use('/properties', propertiesRoutes);
app.get('/', (req, res) => res.send('Beds24 backend running'));


const PORT = process.env.PORT || 4000;
const host = process.env.HOST || '127.0.0.1';

app.listen(PORT, host, () => {
    console.log(`Backend listening on http://${host}:${PORT}`);
});
