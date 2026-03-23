import express from 'express';
import { getAllBookings, updateBooking, triggerSync } from './bookings.controller.js';
import { supabaseAuthMiddleware, adminOnly } from '../util/middleware.js';


const router = express.Router();


// public (authenticated) endpoint used by frontend to fetch cached bookings for the logged-in user
// Optional query params: month, year. Admins may pass ?email=... or ?name=... to override.
router.get('/', supabaseAuthMiddleware, getAllBookings);

router.post('/update', supabaseAuthMiddleware, updateBooking);

// admin endpoint to trigger immediate sync (useful for local testing or admin UI)
router.post('/sync', supabaseAuthMiddleware, adminOnly, triggerSync);


export default router;