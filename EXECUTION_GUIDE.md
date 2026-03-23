# 🚀 Complete Execution Guide for Rental Management System

## 📋 Prerequisites
- CentOS VPS: 85.215.68.47
- Admin emails: freeburner80@gmail.com, info@wagner-service.org
- Supabase project configured
- PM2 installed

## 🔧 Step-by-Step Execution

### Step 1: Database Setup
1. **Go to Supabase Dashboard → SQL Editor**
2. **Copy and paste entire content from `fix_database.sql`**
3. **Click "Run"**
4. **Verify results show both admin users with access to 5 properties**

### Step 2: Server Configuration
```bash
# SSH to your server
ssh root@85.215.68.47

# Make setup script executable
chmod +x server_setup.sh

# Run setup script
./server_setup.sh
```

### Step 3: Frontend Configuration
```bash
# The frontend/.env.local has been updated with:
# VITE_BACKEND_URL="http://85.215.68.47:5000"

# If you have a separate frontend server, restart it:
# npm run build  # or your build command
# pm2 restart frontend  # if using PM2 for frontend
```

### Step 4: System Testing
```bash
# Run the test script
chmod +x test_system.sh
./test_system.sh
```

### Step 5: Manual Verification

#### Database Verification:
1. **Supabase Dashboard → Table Editor**
2. **Check `users` table**: Should have both admin emails with role='admin'
3. **Check `properties` table**: Should have 5 properties
4. **Check `cached_bookings` table**: Should have 3 bookings
5. **Check `user_property_access` table**: Should have 10 records (2 users × 5 properties)

#### Backend Verification:
```bash
# Check PM2 status
pm2 status

# Check logs for success messages
pm2 logs backend --lines 20

# Should see:
# "Using mock Beds24 properties data"
# "Properties sync complete: 5 upserted, 0 deleted"
# "Using mock Beds24 bookings data"
# "Bookings sync complete: 3 upserted, 0 deleted"
# "runSync succeed"
```

#### Frontend Verification:
1. **Open your frontend application**
2. **Login with either admin email:**
   - freeburner80@gmail.com
   - info@wagner-service.org
3. **Go to Properties page**
4. **Should see:**
   - ✅ 5 properties displayed
   - ✅ "Unterkunft hinzufügen" button visible
5. **Go to Dashboard page**
6. **Should see:**
   - ✅ Booking statistics
   - ✅ Calendar with bookings
   - ✅ Booking table with 3 entries

## 🔍 Troubleshooting

### If Properties Page is Empty:
```sql
-- Check user access in Supabase SQL Editor
SELECT u.email, COUNT(upa.property_id) as accessible_properties
FROM public.users u
LEFT JOIN public.user_property_access upa ON u.id = upa.user_id
WHERE u.email IN ('freeburner80@gmail.com', 'info@wagner-service.org')
GROUP BY u.email;
```

### If Backend Not Accessible:
```bash
# Check firewall
sudo firewall-cmd --list-ports

# Should include 5000/tcp
# If not, run:
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload
```

### If Sync Not Working:
```bash
# Manual sync test
cd /var/www/backend
node -e "
require('dotenv').config();
const { scheduledSync } = require('./cron.js');
scheduledSync().then(() => console.log('Success')).catch(console.error);
"
```

## ✅ Success Indicators

### Backend Success:
- ✅ PM2 shows backend as "online"
- ✅ Logs show successful sync every 5 minutes
- ✅ API endpoints return 401 (auth required) or 200 (with data)

### Database Success:
- ✅ users: 3+ records (including both admins)
- ✅ properties: 5 records
- ✅ cached_bookings: 3 records
- ✅ user_property_access: 10+ records

### Frontend Success:
- ✅ Login works with admin emails
- ✅ Properties page shows 5 properties
- ✅ Dashboard shows bookings and statistics
- ✅ "Add Property" button visible for admins

## 🎯 Final Verification

After completing all steps, both admin users should be able to:
1. **Login successfully**
2. **See all 5 properties** on Properties page
3. **See all 3 bookings** on Dashboard
4. **Add new properties** using the form
5. **Edit booking details** (remarks, check-in, paid status)

**System is fully operational when all these features work for both admin emails!**