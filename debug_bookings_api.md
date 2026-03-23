# Debug Bookings API Issue

## Problem
- Supabase has 24 bookings in `cached_bookings` table
- Frontend only shows some bookings, not all 24

## Possible Causes

### 1. User Permission Issues
The `fetchFilteredBookings` function checks user permissions:
- If user role is not "guest" or "admin", returns empty array
- If user is "guest" but has no allowed properties, returns empty array

### 2. Property Access Restrictions
For guest users, bookings are filtered by `property_id` in the allowed list.

### 3. Month/Year Filtering
If month/year parameters are passed, only bookings for that specific month are returned.

### 4. Database Query Issues
The query joins with `properties` table - if properties don't exist, bookings might be filtered out.

## Debug Steps

### Step 1: Check User Permissions
Run this in Supabase SQL Editor:
```sql
-- Check user permissions for your email
SELECT 
    u.id,
    u.email,
    u.role,
    COUNT(upa.property_id) as allowed_properties
FROM users u
LEFT JOIN user_property_access upa ON u.id = upa.user_id
WHERE u.email = 'freeburner80@gmail.com'  -- Replace with your email
GROUP BY u.id, u.email, u.role;

-- Check which properties the user has access to
SELECT 
    u.email,
    p.id as property_id,
    p.name as property_name
FROM users u
JOIN user_property_access upa ON u.id = upa.user_id
JOIN properties p ON upa.property_id = p.id
WHERE u.email = 'freeburner80@gmail.com'  -- Replace with your email
ORDER BY p.id;
```

### Step 2: Check Booking-Property Relationship
```sql
-- Check if all bookings have matching properties
SELECT 
    cb.id,
    cb.property_id,
    p.name as property_name,
    cb.first_name,
    cb.last_name,
    cb.arrival_date
FROM cached_bookings cb
LEFT JOIN properties p ON cb.property_id = p.id
ORDER BY cb.arrival_date;

-- Count bookings by property
SELECT 
    cb.property_id,
    p.name,
    COUNT(*) as booking_count
FROM cached_bookings cb
LEFT JOIN properties p ON cb.property_id = p.id
GROUP BY cb.property_id, p.name
ORDER BY cb.property_id;
```

### Step 3: Test the Exact Query Used by Backend
```sql
-- This mimics the backend query for admin users
SELECT 
    cb.id,
    cb.property_id,
    p.name,
    cb.api_source,
    cb.channel,
    cb.status,
    cb.arrival_date,
    cb.departure_date,
    cb.total_nights,
    cb.num_adult,
    cb.num_child,
    cb.first_name,
    cb.last_name,
    cb.email,
    cb.phone,
    cb.mobile,
    cb.price,
    cb.commission,
    cb.remarks,
    cb.check_in,
    cb.paid,
    cb.data
FROM cached_bookings cb
LEFT JOIN properties p ON cb.property_id = p.id
ORDER BY cb.arrival_date;
```

## Quick Fixes to Try

### Fix 1: Ensure User Has Admin Role
```sql
-- Make sure your user is admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'freeburner80@gmail.com';  -- Replace with your email
```

### Fix 2: Grant Access to All Properties
```sql
-- Grant access to all properties for your user
INSERT INTO user_property_access (user_id, property_id)
SELECT u.id, p.id
FROM users u, properties p
WHERE u.email = 'freeburner80@gmail.com'  -- Replace with your email
ON CONFLICT (user_id, property_id) DO NOTHING;
```

### Fix 3: Check API Response
Test the API directly:
- Open browser dev tools
- Go to Network tab
- Refresh the Properties or Dashboard page
- Look for the `/bookings` API call
- Check the response to see how many bookings are returned

## Expected Results
After fixes, you should see all 24 bookings in the frontend matching the data in Supabase.