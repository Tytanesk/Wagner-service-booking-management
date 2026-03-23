import { runSyncJob } from './bookings/bookings.service.js';
import { runPropertiesSyncJob } from './properties/properties.service.js';

export async function scheduledSync() {
    try {
        await runSyncJob();
        await runPropertiesSyncJob();
        console.log("runSync succeed");
    } catch (err) {
        console.error('scheduledSync failed', err);
    }
}