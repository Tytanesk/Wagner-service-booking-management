import { scheduledSync } from './cron.js';
import dotenv from 'dotenv';
dotenv.config();

/**
* If you run backend locally and want an automatic sync every 5 minutes,
* set START_LOCAL_SYNC=true in your env and run `node run-local-sync.js` or import it.
*/
if (process.env.START_LOCAL_SYNC == "true") {
    console.log('Starting local sync every 5 minutes');
    // run immediately, then every 5 minutes
    scheduledSync();
    setInterval(scheduledSync, process.env.SYNC_INTERVAL_MINUTES * 60 * 1000);
}