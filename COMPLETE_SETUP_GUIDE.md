# 🚀 Complete Setup & Testing Guide

## 📋 Overview
This guide will set up your rental management system with:
- **Admin Users**: freeburner80@gmail.com, info@wagner-service.org
- **Server**: 85.215.68.47:5000
- **Mock Data**: 5 properties, 3 bookings
- **Full Permissions**: Both admins can access everything

---

## 🗄️ **STEP 1: Database Setup (Critical)**

### **1.1 Run the Complete SQL Script**
1. **Go to Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy the ENTIRE content from `supabase_auth_trigger.sql`**
4. **Paste it in the SQL Editor**
5. **Click "Run"**

### **1.2 Expected Results**
After running, you should see these results at the bottom:

```
-- Verification Results:
email                    | role  | accessible_properties
freeburner80@gmail.com   | admin | 5
info@wagner-service.org  | admin | 5

table_name           | count
users               | 3 (or more)
properties          | 5
cached_bookings     | 3
user_property_access| 10

Sample Properties: Apartment Magnolia, Nanas-Auszeit, Tiny Bauernhof Plau
Sample Bookings: John Doe, Jane Smith, Hans Mueller
```

### **1.3 Manual Verification**
**Go to Table Editor and check:**
- ✅ **users table**: Both admin emails with role='admin'
- ✅ **properties table**: 5 properties
- ✅ **cached_bookings table**: 3 bookings
- ✅ **user_property_access table**: 10 records (2 users × 5 properties)

---

## 🖥️ **STEP 2: Server Setup**

### **2.1 SSH to Your Server**
```bash
ssh root@85.215.68.47
```

### **2.2 Navigate to Backend Directory**
```bash
cd /var/www/backend
# or wherever your backend is located
```

### **2.3 Run Server Setup**
```bash
# Make script executable
chmod +x server_setup.sh

# Run setup
./server_setup.sh
```

### **2.4 Expected Output**
```
🚀 Setting up Rental Management System...
📛 Stopping existing backend...
🔧 Checking environment variables...
✅ Mock data mode enabled
📦 Installing dependencies...
✅ Database connection successful
🔄 Testing sync functions...
✅ Sync test successful
🔥 Configuring firewall...
🚀 Starting backend...
📊 System Status:
┌────┬─────────┬─────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name    │ mode    │ ↺       │ status  │ cpu      │ memory │ pid  │ watching │ restart  │ unstable │
├────┼─────────┼─────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ backend │ fork    │ 0       │ online  │ 0%       │ 20.0mb │ 1234 │ disabled  │ 0        │ 0        │
└────┴─────────┴─────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┘

📋 Recent Logs:
Starting local sync every 5 minutes
Using mock Beds24 properties data
Properties sync complete: 5 upserted, 0 deleted
Using mock Beds24 bookings data
Bookings sync complete: 3 upserted, 0 deleted
runSync succeed

✅ Setup Complete!
```

---

## 🧪 **STEP 3: System Testing**

### **3.1 Run Automated Tests**
```bash
# Make test script executable
chmod +x test_system.sh

# Run tests
./test_system.sh
```

### **3.2 Expected Test Results**
```
🧪 Testing Rental Management System...
🌐 Testing backend connectivity...
✅ Backend is accessible
🔌 Testing API endpoints...
✅ Properties endpoint requires authentication (correct)
✅ Bookings endpoint requires authentication (correct)
📊 Checking PM2 status...
✅ Backend process is running
📋 Recent backend logs:
Using mock Beds24 properties data
Properties sync complete: 5 upserted, 0 deleted
🗄️  Testing database connection...
✅ All database tables accessible

🎯 Test Summary:
   Backend URL: http://85.215.68.47:5000
   Admin Emails: freeburner80@gmail.com, info@wagner-service.org
```

### **3.3 Manual API Testing**
```bash
# Test API endpoints directly
curl http://85.215.68.47:5000/properties
# Should return: {"error":"missing authorization header"}

curl http://85.215.68.47:5000/bookings  
# Should return: {"error":"missing authorization header"}

# Both responses confirm API is working and requires authentication
```

---

## 🌐 **STEP 4: Frontend Testing**

### **4.1 Check Frontend Configuration**
The frontend `.env.local` has been updated to:
```
VITE_BACKEND_URL="http://85.215.68.47:5000"
```

### **4.2 Restart Frontend (if needed)**
```bash
# If you have a separate frontend server
cd /path/to/frontend
npm run build
# or restart your frontend service
```

### **4.3 Browser Testing**

#### **Login Test:**
1. **Open your frontend application**
2. **Go to login/auth page**
3. **Login with either admin email:**
   - freeburner80@gmail.com
   - info@wagner-service.org
4. **Should login successfully**

#### **Properties Page Test:**
1. **Navigate to Properties page**
2. **Should see:**
   - ✅ **5 properties displayed**:
     - Apartment Magnolia
     - Nanas-Auszeit  
     - Tiny Bauernhof Plau
     - Henrys Cozy Tiny House
     - Henrys Cozy Tiny House mit Glamping Zelt
   - ✅ **"Unterkunft hinzufügen" button** (top right)
   - ✅ **Property details** (address, type, etc.)

#### **Dashboard Page Test:**
1. **Navigate to Dashboard page**
2. **Should see:**
   - ✅ **Statistics cards** (total nights, adults, children, etc.)
   - ✅ **Calendar with bookings** (colored dates)
   - ✅ **Booking table with 3 entries**:
     - John Doe (Dec 20-25)
     - Jane Smith (Dec 22-28)
     - Hans Mueller (Jan 5-10)
   - ✅ **Editable fields** (remarks, check-in, paid)

---

## 🔍 **STEP 5: Troubleshooting**

### **5.1 If Properties Page is Empty**

#### **Check Database:**
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM public.properties;
-- Should return: 5

SELECT u.email, COUNT(upa.property_id) as access_count
FROM public.users u
LEFT JOIN public.user_property_access upa ON u.id = upa.user_id  
WHERE u.email IN ('freeburner80@gmail.com', 'info@wagner-service.org')
GROUP BY u.email;
-- Should show both emails with access_count = 5
```

#### **Check Browser Network:**
1. **Press F12 → Network tab**
2. **Refresh Properties page**
3. **Look for API call to `/properties`**
4. **Should return JSON with 5 properties**

### **5.2 If Backend Not Accessible**

#### **Check PM2:**
```bash
pm2 status
pm2 logs backend --lines 20
```

#### **Check Firewall:**
```bash
sudo firewall-cmd --list-ports
# Should include: 5000/tcp

# If not:
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload
```

#### **Check Process:**
```bash
netstat -tulpn | grep :5000
# Should show process listening on port 5000
```

### **5.3 If Sync Not Working**

#### **Manual Sync Test:**
```bash
cd /var/www/backend
node -e "
require('dotenv').config();
const { scheduledSync } = require('./cron.js');
scheduledSync().then(() => console.log('✅ Success')).catch(console.error);
"
```

#### **Check Environment:**
```bash
grep BEDS24_RERERESH_TOKEN .env.local
# Should show: BEDS24_RERERESH_TOKEN=""
```

---

## ✅ **STEP 6: Final Verification Checklist**

### **Database Verification:**
- [ ] **users table**: 3+ records including both admins
- [ ] **properties table**: 5 records  
- [ ] **cached_bookings table**: 3 records
- [ ] **user_property_access table**: 10+ records

### **Backend Verification:**
- [ ] **PM2 status**: backend shows as "online"
- [ ] **Logs**: Show successful sync every 5 minutes
- [ ] **API**: Returns 401 for unauthenticated requests
- [ ] **Port**: 5000 accessible from internet

### **Frontend Verification:**
- [ ] **Login**: Works with both admin emails
- [ ] **Properties page**: Shows 5 properties + add button
- [ ] **Dashboard**: Shows bookings, calendar, statistics
- [ ] **Network calls**: API requests return data

### **Functionality Verification:**
- [ ] **Add Property**: Button visible and functional
- [ ] **Edit Bookings**: Remarks/check-in/paid fields editable
- [ ] **Statistics**: Calculated correctly
- [ ] **Calendar**: Shows booking dates

---

## 🎯 **Success Criteria**

**Your system is fully operational when:**

1. **Both admin users** (freeburner80@gmail.com, info@wagner-service.org) can login
2. **Properties page** shows all 5 properties with "Add Property" button
3. **Dashboard** shows 3 bookings with statistics and calendar
4. **Backend logs** show successful sync every 5 minutes
5. **All API endpoints** work with proper authentication

**If all checkboxes are ✅, your rental management system is working perfectly!**

---

## 📞 **Quick Commands Reference**

```bash
# Check backend status
pm2 status

# View recent logs  
pm2 logs backend --lines 20

# Restart backend
pm2 restart backend

# Test API
curl http://85.215.68.47:5000/properties

# Check database counts
# (Run in Supabase SQL Editor)
SELECT 'properties' as table_name, COUNT(*) FROM public.properties
UNION ALL SELECT 'bookings', COUNT(*) FROM public.cached_bookings;
```