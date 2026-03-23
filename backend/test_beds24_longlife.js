import dotenv from 'dotenv';
import { beds24GetProperties, beds24GetBookings } from './beds24Client.js';

dotenv.config({ path: '.env.local' });

async function testLongLifeToken() {
    console.log('Testing Beds24 Long Life Token...');
    console.log('Token configured:', process.env.BEDS24_LONG_LIFE_TOKEN ? 'Yes' : 'No');
    
    try {
        // Test properties
        console.log('\n--- Testing Properties ---');
        const properties = await beds24GetProperties();
        console.log('Properties found:', properties?.data?.length || 0);
        if (properties?.data?.length > 0) {
            console.log('First property:', properties.data[0]);
        }
        
        // Test bookings
        console.log('\n--- Testing Bookings ---');
        const bookings = await beds24GetBookings();
        console.log('Bookings found:', bookings?.data?.length || 0);
        if (bookings?.data?.length > 0) {
            console.log('First booking:', bookings.data[0]);
        }
        
        console.log('\n✅ Connection successful!');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Full error:', error);
    }
}

testLongLifeToken();