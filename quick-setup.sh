#!/usr/bin/env bash

# Schedule System - Quick Start for Google Sheets Integration
# This script prepares everything for Google Sheets

set -e

echo "📋 Schedule System - Google Sheets Setup"
echo "========================================"
echo ""

# Check if credentials.json exists
if [ ! -f "./credentials.json" ]; then
    echo "⚠️  credentials.json NOT found!"
    echo ""
    echo "📖 Follow these steps:"
    echo ""
    echo "1️⃣  Go to: https://console.cloud.google.com"
    echo "2️⃣  Create new project → Schedule System"
    echo "3️⃣  Enable APIs:"
    echo "    - Google Sheets API"
    echo "    - Google Drive API"
    echo "4️⃣  Create Service Account:"
    echo "    - Credentials → + Create → Service Account"
    echo "    - Name: schedule-bot"
    echo "    - Skip roles → Done"
    echo "5️⃣  Download JSON Key:"
    echo "    - Service Accounts → schedule-bot"
    echo "    - Keys tab → + Add Key → JSON"
    echo "    - Copy file as 'credentials.json' here"
    echo "6️⃣  Share Spreadsheet:"
    echo "    - Run: cat credentials.json | grep client_email"
    echo "    - Copy that email"
    echo "    - Open Spreadsheet → Share → paste email → Editor"
    echo ""
    echo "❌ Setup incomplete - need credentials.json"
    exit 1
fi

echo "✅ credentials.json found!"
echo ""

# Extract and display client email
CLIENT_EMAIL=$(grep -o '"client_email":"[^"]*"' credentials.json | cut -d'"' -f4)
echo "✅ Service Account: $CLIENT_EMAIL"
echo ""

# Check .env
if grep -q "SPREADSHEET_ID=" .env; then
    SHEET_ID=$(grep "SPREADSHEET_ID=" .env | cut -d'=' -f2)
    echo "✅ Spreadsheet ID: $SHEET_ID"
    echo ""
    echo "📋 Next steps:"
    echo "1. Share Spreadsheet with: $CLIENT_EMAIL"
    echo "   (Give Editor access)"
    echo "2. Restart server: npm start"
    echo "3. Should see: ✅ Google Sheets API initialized"
    echo ""
else
    echo "❌ SPREADSHEET_ID not set in .env"
    exit 1
fi

echo "Done! 🚀"
