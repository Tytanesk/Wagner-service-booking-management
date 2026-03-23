#!/bin/bash
# Complete Server Setup Script for CentOS VPS (85.215.68.47)

echo "🚀 Setting up Rental Management System..."

# 1. Stop existing backend
echo "📛 Stopping existing backend..."
pm2 stop backend 2>/dev/null || true
pm2 delete backend 2>/dev/null || true

# 2. Navigate to backend directory
cd /var/www/backend || { echo "❌ Backend directory not found"; exit 1; }

# 3. Verify environment variables
echo "🔧 Checking environment variables..."
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found"
    exit 1
fi

# Check if token is empty (for mock data)
if grep -q 'BEDS24_RERERESH_TOKEN=""' .env.local; then
    echo "✅ Mock data mode enabled"
else
    echo "⚠️  Real Beds24 token detected"
fi

# 4. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 5. Test database connection
echo "🗄️  Testing database connection..."
node -e "
require('dotenv').config();
const { supabaseAdmin } = require('./supabaseClient.js');
supabaseAdmin.from('users').select('count').then(result => {
  console.log('✅ Database connection successful');
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
  process.exit(1);
});
" || { echo "❌ Database connection failed"; exit 1; }

# 6. Test sync functions
echo "🔄 Testing sync functions..."
node -e "
require('dotenv').config();
const { scheduledSync } = require('./cron.js');
console.log('Testing sync...');
scheduledSync().then(() => {
  console.log('✅ Sync test successful');
}).catch(err => {
  console.error('❌ Sync test failed:', err.message);
  process.exit(1);
});
" || { echo "❌ Sync test failed"; exit 1; }

# 7. Configure firewall
echo "🔥 Configuring firewall..."
sudo firewall-cmd --permanent --add-port=5000/tcp 2>/dev/null || true
sudo firewall-cmd --reload 2>/dev/null || true

# 8. Start backend with PM2
echo "🚀 Starting backend..."
pm2 start server.js --name backend
pm2 save

# 9. Show status
echo "📊 System Status:"
pm2 status
echo ""
echo "📋 Recent Logs:"
pm2 logs backend --lines 10

echo ""
echo "✅ Setup Complete!"
echo "🌐 Backend URL: http://85.215.68.47:5000"
echo "👥 Admin Users: freeburner80@gmail.com, info@wagner-service.org"
echo ""
echo "🔍 Next Steps:"
echo "1. Run the SQL script in Supabase Dashboard"
echo "2. Restart frontend with new environment"
echo "3. Test login with admin accounts"