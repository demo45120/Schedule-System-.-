#!/bin/bash
# Schedule System - Google Sheets Setup Helper
# This script helps verify and test the Google Sheets integration

echo "🔧 Schedule System Setup Checker"
echo "================================"
echo ""

# Check Node.js
echo "✅ Checking Node.js..."
node --version

# Check if server is running
echo ""
echo "✅ Checking server..."
curl -s http://localhost:3000/api/bootstrap | jq . 2>/dev/null || echo "⚠️  Server not responding"

# Check credentials.json
echo ""
echo "✅ Checking credentials.json..."
if [ -f "./credentials.json" ]; then
  echo "✅ credentials.json found"
  cat credentials.json | jq '.client_email' 2>/dev/null || echo "⚠️  credentials.json format issue"
else
  echo "❌ credentials.json NOT found"
  echo "   Need to download from Google Cloud Console"
fi

# Check .env
echo ""
echo "✅ Checking .env..."
cat .env

echo ""
echo "================================"
echo "📋 Next Steps:"
echo "1. Download credentials.json from Google Cloud"
echo "2. Share Spreadsheet with client_email"
echo "3. Run: npm start"
echo "================================"
