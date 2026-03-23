-- Restore Mock Data for Properties and Bookings
-- This will clear current data and restore the original mock data

-- First, delete all existing data (in correct order to avoid foreign key constraints)
DELETE FROM cached_bookings;
DELETE FROM user_property_access;
DELETE FROM properties;

-- Insert mock properties (same as original mock data)
INSERT INTO properties (id, name, property_type, address, city, country, postcode, phone, mobile, email, email_lc, contact_first_name, contact_last_name, data, updated_at) VALUES
(292355, 'Apartment Magnolia', 'apartment', 'Neue Bahnhofstr. 4', 'Berlin', 'Germany', '10115', '+49 30 12345678', '+49 170 1234567', 'magnolia@wagner-service.org', 'magnolia@wagner-service.org', 'Hans', 'Wagner', '{}', NOW()),
(298151, 'Nanas-Auszeit', 'apartment', 'Haselgrundstr. 40', 'Munich', 'Germany', '80689', '+49 89 87654321', '+49 171 7654321', 'nanas@wagner-service.org', 'nanas@wagner-service.org', 'Anna', 'Mueller', '{}', NOW()),
(298245, 'Tiny Bauernhof Plau', 'apartment', 'Dresenower Weg 22', 'Plau am See', 'Germany', '19395', '+49 38735 12345', '+49 172 2345678', 'tiny@wagner-service.org', 'tiny@wagner-service.org', 'Peter', 'Schmidt', '{}', NOW()),
(299735, 'Henrys Cozy Tiny House', 'bungalow', 'Neuenberg 16', 'Plau am See', 'Germany', '19395', '+49 38735 54321', '+49 173 3456789', 'henry@wagner-service.org', 'henry@wagner-service.org', 'Henry', 'Fischer', '{}', NOW()),
(300461, 'Henrys Cozy Tiny House mit Glamping Zelt', 'house', 'Neuenberg 16', 'Plau am See', 'Germany', '19395', '+49 38735 54321', '+49 173 3456789', 'henry@wagner-service.org', 'henry@wagner-service.org', 'Henry', 'Fischer', '{}', NOW());

-- Insert mock bookings (using correct column names)
INSERT INTO cached_bookings (id, property_id, first_name, last_name, arrival_date, departure_date, status, price, data, updated_at) VALUES
(1001, 292355, 'John', 'Smith', '2024-01-15', '2024-01-20', 'confirmed', 450.00, '{}', NOW()),
(1002, 298151, 'Maria', 'Garcia', '2024-02-10', '2024-02-15', 'confirmed', 380.00, '{}', NOW()),
(1003, 299735, 'David', 'Johnson', '2024-03-05', '2024-03-10', 'pending', 320.00, '{}', NOW());

-- Grant access to admin users for all properties
INSERT INTO user_property_access (user_id, property_id)
SELECT u.id, p.id
FROM users u, properties p
WHERE u.email IN ('freeburner80@gmail.com', 'info@wagner-service.org')
ON CONFLICT (user_id, property_id) DO NOTHING;