#!/bin/bash
# Complete System Testing Script

echo "🧪 Testing Rental Management System..."

SERVER_IP="85.215.68.47"
BACKEND_URL="http://${SERVER_IP}:5000"

# 1. Test Backend Connectivity
echo "🌐 Testing backend connectivity..."
if curl -s --connect-timeout 5 "${BACKEND_URL}" > /dev/null; then
    echo "✅ Backend is accessible"
else
    echo "❌ Backend is not accessible"
    echo "   Check if PM2 is running: pm2 status"
    echo "   Check firewall: sudo firewall-cmd --list-ports"
    exit 1
fi

# 2. Test API Endpoints
echo "🔌 Testing API endpoints..."

# Test properties endpoint (should require auth)
PROPERTIES_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/properties")
if [ "$PROPERTIES_RESPONSE" = "401" ]; then
    echo "✅ Properties endpoint requires authentication (correct)"
elif [ "$PROPERTIES_RESPONSE" = "200" ]; then
    echo "⚠️  Properties endpoint returns data without auth (check middleware)"
else
    echo "❌ Properties endpoint error (HTTP $PROPERTIES_RESPONSE)"
fi

# Test bookings endpoint (should require auth)
BOOKINGS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/bookings")
if [ "$BOOKINGS_RESPONSE" = "401" ]; then
    echo "✅ Bookings endpoint requires authentication (correct)"
elif [ "$BOOKINGS_RESPONSE" = "200" ]; then
    echo "⚠️  Bookings endpoint returns data without auth (check middleware)"
else
    echo "❌ Bookings endpoint error (HTTP $BOOKINGS_RESPONSE)"
fi

# 3. Check PM2 Status
echo "📊 Checking PM2 status..."
if command -v pm2 > /dev/null; then
    pm2 status | grep backend
    if [ $? -eq 0 ]; then
        echo "✅ Backend process is running"
    else
        echo "❌ Backend process not found in PM2"
    fi
else
    echo "❌ PM2 not installed"
fi

# 4. Check Recent Logs
echo "📋 Recent backend logs:"
if command -v pm2 > /dev/null; then
    pm2 logs backend --lines 5 --nostream
else
    echo "❌ Cannot check logs - PM2 not available"
fi

# 5. Database Connection Test
echo "🗄️  Testing database connection..."
cd /var/www/backend 2>/dev/null || cd backend 2>/dev/null || {
    echo "❌ Backend directory not found"
    exit 1
}

node -e "
require('dotenv').config();
const { supabaseAdmin } = require('./supabaseClient.js');

console.log('Testing database tables...');

Promise.all([
    supabaseAdmin.from('users').select('count'),
    supabaseAdmin.from('properties').select('count'), 
    supabaseAdmin.from('cached_bookings').select('count'),
    supabaseAdmin.from('user_property_access').select('count')
]).then(results => {
    console.log('✅ All database tables accessible');
}).catch(err => {
    console.error('❌ Database error:', err.message);
    process.exit(1);
});
" 2>/dev/null || echo "❌ Database connection test failed"

echo ""
echo "🎯 Test Summary:"
echo "   Backend URL: ${BACKEND_URL}"
echo "   Admin Emails: freeburner80@gmail.com, info@wagner-service.org"
echo ""
echo "📝 Manual Tests Needed:"
echo "1. Login to frontend with admin account"
echo "2. Check Properties page shows data"
echo "3. Check Dashboard shows bookings"
echo "4. Test 'Add Property' button appears"