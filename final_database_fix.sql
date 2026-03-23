-- FINAL DATABASE FIX - Run this entire script in Supabase SQL Editor
-- This will permanently fix the sync issues and set up correct mock data

-- =====================================================
-- STEP 1: Drop the property_summary view if it exists
-- =====================================================
DROP VIEW IF EXISTS property_summary;

-- =====================================================
-- STEP 2: Remove all triggers and functions first
-- =====================================================
DROP TRIGGER IF EXISTS protect_local_properties ON properties;
DROP FUNCTION IF EXISTS prevent_local_property_deletion();

-- =====================================================
-- STEP 3: Clear ALL existing data (in correct order) - FORCE DELETE
-- =====================================================
-- Use TRUNCATE for complete cleanup (faster and more reliable)
TRUNCATE TABLE cached_bookings RESTART IDENTITY CASCADE;
TRUNCATE TABLE user_property_access RESTART IDENTITY CASCADE;
TRUNCATE TABLE properties RESTART IDENTITY CASCADE;

-- Alternative: Force delete with CASCADE if TRUNCATE fails
-- DELETE FROM cached_bookings;
-- DELETE FROM user_property_access;  
-- DELETE FROM properties;

-- =====================================================
-- STEP 4: Insert CORRECT mock properties (the RIGHT list you want)
-- =====================================================
INSERT INTO properties (id, name, property_type, address, city, country, postcode, phone, mobile, email, email_lc, contact_first_name, contact_last_name, data, updated_at) VALUES
(292355, 'Apartment Magnolia', 'apartment', 'Neue Bahnhofstr. 4', 'Berlin', 'Germany', '10115', '+49 30 12345678', '+49 170 1234567', 'magnolia@wagner-service.org', 'magnolia@wagner-service.org', 'Hans', 'Wagner', '{}', NOW()),
(298151, 'Nanas-Auszeit', 'apartment', 'Haselgrundstr. 40', 'Munich', 'Germany', '80689', '+49 89 87654321', '+49 171 7654321', 'nanas@wagner-service.org', 'nanas@wagner-service.org', 'Anna', 'Mueller', '{}', NOW()),
(298245, 'Tiny Bauernhof Plau', 'apartment', 'Dresenower Weg 22', 'Plau am See', 'Germany', '19395', '+49 38735 12345', '+49 172 2345678', 'tiny@wagner-service.org', 'tiny@wagner-service.org', 'Peter', 'Schmidt', '{}', NOW()),
(299735, 'Henrys Cozy Tiny House', 'bungalow', 'Neuenberg 16', 'Plau am See', 'Germany', '19395', '+49 38735 54321', '+49 173 3456789', 'henry@wagner-service.org', 'henry@wagner-service.org', 'Henry', 'Fischer', '{}', NOW()),
(300461, 'Henrys Cozy Tiny House mit Glamping Zelt', 'house', 'Neuenberg 16', 'Plau am See', 'Germany', '19395', '+49 38735 54321', '+49 173 3456789', 'henry@wagner-service.org', 'henry@wagner-service.org', 'Henry', 'Fischer', '{}', NOW());

-- =====================================================
-- STEP 5: Insert CORRECT mock bookings (matching the RIGHT properties)
-- =====================================================
INSERT INTO cached_bookings (id, property_id, first_name, last_name, arrival_date, departure_date, total_nights, num_adult, num_child, price, status, channel, phone, email, data, updated_at) VALUES
(1001, 292355, 'John', 'Smith', '2025-01-15', '2025-01-20', 5, 2, 1, 450.00, 'confirmed', 'Airbnb', '+49 89 111222', 'john.smith@email.de', '{}', NOW()),
(1002, 298151, 'Maria', 'Garcia', '2025-01-18', '2025-01-25', 7, 4, 0, 380.00, 'confirmed', 'Booking.com', '+44 20 333444', 'maria.garcia@email.com', '{}', NOW()),
(1003, 299735, 'David', 'Johnson', '2025-01-22', '2025-01-26', 4, 1, 0, 320.00, 'confirmed', 'Direct', '+49 30 777888', 'david.johnson@email.de', '{}', NOW());

-- =====================================================
-- STEP 6: Grant access to admin users for all properties
-- =====================================================
INSERT INTO user_property_access (user_id, property_id)
SELECT u.id, p.id
FROM users u, properties p
WHERE u.email IN ('freeburner80@gmail.com', 'info@wagner-service.org')
ON CONFLICT (user_id, property_id) DO NOTHING;

-- =====================================================
-- STEP 7: Create protection function for local properties
-- =====================================================
CREATE OR REPLACE FUNCTION prevent_local_property_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent deletion of local properties (ID >= 900000)
    IF OLD.id >= 900000 THEN
        RAISE EXCEPTION 'Cannot delete local property with ID %. Local properties are protected.', OLD.id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 8: Create trigger to protect local properties from sync
-- =====================================================
CREATE TRIGGER protect_local_properties
    BEFORE DELETE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION prevent_local_property_deletion();

-- =====================================================
-- STEP 9: Add constraints to prevent issues
-- =====================================================
-- Ensure unique user-property access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_user_property_access'
    ) THEN
        ALTER TABLE user_property_access 
        ADD CONSTRAINT unique_user_property_access 
        UNIQUE (user_id, property_id);
    END IF;
END $$;

-- =====================================================
-- STEP 10: Create a simple monitoring view
-- =====================================================
CREATE OR REPLACE VIEW property_overview AS
SELECT 
    p.id,
    p.name,
    p.property_type,
    p.city,
    p.country,
    CASE 
        WHEN p.id >= 900000 THEN 'Local'
        ELSE 'Beds24'
    END as source,
    COUNT(cb.id) as active_bookings,
    p.updated_at as last_updated
FROM properties p
LEFT JOIN cached_bookings cb ON p.id = cb.property_id AND cb.status = 'confirmed'
GROUP BY p.id, p.name, p.property_type, p.city, p.country, p.updated_at
ORDER BY p.id;

-- =====================================================
-- STEP 11: Verification queries
-- =====================================================
-- Show counts
SELECT 
    'Properties' as table_name, 
    COUNT(*) as record_count,
    MIN(id) as min_id,
    MAX(id) as max_id
FROM properties
UNION ALL
SELECT 
    'Bookings' as table_name, 
    COUNT(*) as record_count,
    MIN(id) as min_id,
    MAX(id) as max_id
FROM cached_bookings
UNION ALL
SELECT 
    'User Access' as table_name, 
    COUNT(*) as record_count,
    MIN(id) as min_id,
    MAX(id) as max_id
FROM user_property_access;

-- Show the properties that should be visible
SELECT 
    id,
    name,
    property_type,
    city,
    country
FROM properties 
ORDER BY id;

-- Show property overview
SELECT * FROM property_overview;