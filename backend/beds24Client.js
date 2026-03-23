import axios from 'axios';

const BEDS24_BASE = process.env.BEDS24_BASE_URL || 'https://api.beds24.com/v2'; // fallback

// Mock data for when BEDS24_REFRESH_TOKEN is empty - CORRECT DATA
const MOCK_PROPERTIES = [
    {
        id: 292355,
        name: "Apartment Magnolia",
        propertyType: "apartment",
        address: "Neue Bahnhofstr. 4",
        city: "Berlin",
        country: "Germany",
        postcode: "10115",
        phone: "+49 30 12345678",
        mobile: "+49 170 1234567",
        email: "magnolia@wagner-service.org",
        contactFirstName: "Hans",
        contactLastName: "Wagner"
    },
    {
        id: 298151,
        name: "Nanas-Auszeit",
        propertyType: "apartment",
        address: "Haselgrundstr. 40",
        city: "Munich",
        country: "Germany",
        postcode: "80689",
        phone: "+49 89 87654321",
        mobile: "+49 171 7654321",
        email: "nanas@wagner-service.org",
        contactFirstName: "Anna",
        contactLastName: "Mueller"
    },
    {
        id: 298245,
        name: "Tiny Bauernhof Plau",
        propertyType: "apartment",
        address: "Dresenower Weg 22",
        city: "Plau am See",
        country: "Germany",
        postcode: "19395",
        phone: "+49 38735 12345",
        mobile: "+49 172 2345678",
        email: "tiny@wagner-service.org",
        contactFirstName: "Peter",
        contactLastName: "Schmidt"
    },
    {
        id: 299735,
        name: "Henrys Cozy Tiny House",
        propertyType: "bungalow",
        address: "Neuenberg 16",
        city: "Plau am See",
        country: "Germany",
        postcode: "19395",
        phone: "+49 38735 54321",
        mobile: "+49 173 3456789",
        email: "henry@wagner-service.org",
        contactFirstName: "Henry",
        contactLastName: "Fischer"
    },
    {
        id: 300461,
        name: "Henrys Cozy Tiny House mit Glamping Zelt",
        propertyType: "house",
        address: "Neuenberg 16",
        city: "Plau am See",
        country: "Germany",
        postcode: "19395",
        phone: "+49 38735 54321",
        mobile: "+49 173 3456789",
        email: "henry@wagner-service.org",
        contactFirstName: "Henry",
        contactLastName: "Fischer"
    }
];

const MOCK_BOOKINGS = [
    {
        id: 1001,
        property_id: 292355,
        first_name: "John",
        last_name: "Smith",
        arrival_date: "2025-12-31",
        departure_date: "2026-01-05",
        total_nights: 5,
        adults: 2,
        children: 1,
        price: 450.00,
        status: "confirmed",
        channel: "Airbnb",
        phone: "+49 89 111222",
        email: "john.smith@email.de"
    },
    {
        id: 1002,
        property_id: 298151,
        first_name: "Maria",
        last_name: "Garcia",
        arrival_date: "2025-12-28",
        departure_date: "2026-01-02",
        total_nights: 5,
        adults: 2,
        children: 0,
        price: 380.00,
        status: "confirmed",
        channel: "Booking.com",
        phone: "+49 89 333444",
        email: "maria.garcia@email.com"
    },
    {
        id: 1003,
        property_id: 298245,
        first_name: "David",
        last_name: "Johnson",
        arrival_date: "2026-01-15",
        departure_date: "2026-01-20",
        total_nights: 5,
        adults: 1,
        children: 0,
        price: 320.00,
        status: "confirmed",
        channel: "Direct",
        phone: "+49 30 777888",
        email: "david.johnson@email.de"
    },
    {
        id: 1004,
        property_id: 300461,
        first_name: "Anna",
        last_name: "Mueller",
        arrival_date: "2026-01-10",
        departure_date: "2026-01-17",
        total_nights: 7,
        adults: 4,
        children: 2,
        price: 560.00,
        status: "confirmed",
        channel: "Airbnb",
        phone: "+49 171 555666",
        email: "anna.mueller@email.de"
    },
    {
        id: 1005,
        property_id: 292355,
        first_name: "Peter",
        last_name: "Schmidt",
        arrival_date: "2026-02-14",
        departure_date: "2026-02-21",
        total_nights: 7,
        adults: 2,
        children: 0,
        price: 630.00,
        status: "confirmed",
        channel: "Booking.com",
        phone: "+49 30 999888",
        email: "peter.schmidt@email.de"
    },
    {
        id: 1006,
        property_id: 298151,
        first_name: "Lisa",
        last_name: "Weber",
        arrival_date: "2026-01-25",
        departure_date: "2026-01-30",
        total_nights: 5,
        adults: 3,
        children: 1,
        price: 400.00,
        status: "confirmed",
        channel: "Direct",
        phone: "+49 89 444555",
        email: "lisa.weber@email.de"
    }
];

async function getToken() {
    const longLifeToken = process.env.BEDS24_LONG_LIFE_TOKEN;
    const refreshToken = process.env.BEDS24_RERERESH_TOKEN;
    
    // If Long Life token is provided, use it directly
    if (longLifeToken && longLifeToken.trim() !== '') {
        console.log('Using Beds24 Long Life token');
        return longLifeToken;
    }
    
    // Fallback to refresh token method
    if (!refreshToken) throw new Error('Neither BEDS24_LONG_LIFE_TOKEN nor BEDS24_RERERESH_TOKEN is set');
    
    console.log('Using Beds24 refresh token');
    const url = `${BEDS24_BASE}/authentication/token`;
    try {
        const res = await axios.get(url, { headers: { 'Content-Type': 'application/json', 'refreshToken': refreshToken }, timeout: 20000 });
        return res.data.token;
    } catch (err) {
        console.error('Get token from refresh token err:', err);
        throw err;
    }
}

function isUsingMockData() {
    const longLifeToken = process.env.BEDS24_LONG_LIFE_TOKEN;
    const refreshToken = process.env.BEDS24_RERERESH_TOKEN;
    
    // Use real data if either token is provided
    return (!longLifeToken || longLifeToken.trim() === '') && 
           (!refreshToken || refreshToken.trim() === '');
}

export const beds24 = axios.create({
    baseURL: BEDS24_BASE,
    headers: { 'Content-Type': 'application/json' }
});


/**
* Fetch bookings from Beds24 or return mock data
* @param {object} params - query params to forward to Beds24 API
*/
export async function beds24GetBookings(params = {}) {
    if (isUsingMockData()) {
        console.log('Using mock bookings data');
        return { data: MOCK_BOOKINGS };
    }

    const token = await getToken();
    try {
        const res = await beds24.get('/bookings', {
            params,
            headers: {
                'token': token
            }
        });
        return res.data;
    } catch (err) {
        console.error('Get bookings err:', err);
    }
}


/**
* Create or update bookings in Beds24
* @param {Array<object>} payload
*/
export async function beds24SetBookings(payload = []) {
    if (isUsingMockData()) {
        console.log('Mock mode: Cannot update bookings in Beds24');
        return { success: false, message: 'Mock mode active' };
    }

    const token = await getToken();
    const res = await beds24.post('/bookings', payload, {
        headers: {
            token: token
        }
    });
    return res.data;
}

/**
* Extract properties from booking data if properties API fails
*/
export async function extractPropertiesFromBookings() {
    try {
        const bookingsData = await beds24GetBookings();
        const bookings = bookingsData?.data || [];
        
        if (bookings.length === 0) {
            return { data: [] };
        }
        
        // Extract unique properties from bookings using the correct field names
        const propertyMap = new Map();
        
        bookings.forEach(booking => {
            const propertyId = booking.propertyId; // Use propertyId (not property_id)
            if (propertyId && !propertyMap.has(propertyId)) {
                // Map property IDs to known names
                const propertyNames = {
                    292355: 'Apartment Magnolia',
                    298151: 'Nanas-Auszeit', 
                    298245: 'Tiny Bauernhof Plau',
                    299735: 'Henrys Cozy Tiny House',
                    300461: 'Henrys Cozy Tiny House mit Glamping Zelt'
                };
                
                propertyMap.set(propertyId, {
                    id: propertyId,
                    name: propertyNames[propertyId] || `Property ${propertyId}`,
                    propertyType: 'apartment',
                    address: null,
                    city: null,
                    country: booking.country2 || null,
                    email: null,
                    phone: null,
                    contactFirstName: null,
                    contactLastName: null
                });
            }
        });
        
        const properties = Array.from(propertyMap.values());
        console.log(`Extracted ${properties.length} properties from bookings data:`, properties.map(p => `${p.id}: ${p.name}`));
        
        return { data: properties };
        
    } catch (err) {
        console.error('Error extracting properties from bookings:', err);
        return { data: [] };
    }
}
export async function beds24GetProperties() {
    if (isUsingMockData()) {
        console.log('Using mock properties data');
        return { data: MOCK_PROPERTIES };
    }

    try {
        const token = await getToken();
        console.log('Fetching properties with token...');
        
        // Try different endpoints that might work
        const endpoints = [
            '/properties',
            '/property',
            '/inventory'
        ];
        
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying endpoint: ${endpoint}`);
                const res = await beds24.get(endpoint, {
                    headers: {
                        'token': token
                    }
                });
                
                console.log(`${endpoint} response status:`, res.status);
                console.log(`${endpoint} data:`, res.data);
                
                if (res.data && (res.data.data || res.data.length > 0)) {
                    console.log('Properties found:', res.data?.data?.length || res.data?.length || 0);
                    return res.data;
                }
            } catch (endpointErr) {
                console.log(`${endpoint} failed:`, endpointErr.response?.status, endpointErr.response?.data?.error);
            }
        }
        
        // If all endpoints fail, return empty data structure
        console.log('All property endpoints failed, returning empty data');
        return { data: [] };
        
    } catch (err) {
        console.error('Get properties error:', err.response?.status, err.response?.data);
        console.error('Full error:', err.message);
        
        // Return empty data instead of throwing
        return { data: [] };
    }
}