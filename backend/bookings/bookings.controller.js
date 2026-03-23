import { fetchFilteredBookings, updateBookingData, runSyncJob } from './bookings.service.js';

export async function getAllBookings(req, res) {
    try {
        // allow admin to override email/name via query params (useful for support)
        const overrideEmail = req.query.email || null;
        const userEmail = overrideEmail || req.user.email || null;
        const { month, year } = req.query;

        const bookings = await fetchFilteredBookings({ userEmail, month, year });
        res.json({ success: true, data: bookings });
    } catch (err) {
        console.error('getAllBookings error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function updateBooking(req, res) {
    try {
        await updateBookingData(req.body.id, req.body.field, req.body.value);
        res.json({ success: true });
    } catch (err) {
        console.error('Update Booking error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
}


export async function triggerSync(req, res) {
    try {
        await runSyncJob();
        res.json({ success: true, message: 'Sync triggered' });
    } catch (err) {
        console.error('triggerSync error', err);
        res.status(500).json({ success: false, error: err.message });
    }
}