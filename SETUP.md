# 🚀 Schedule System - Complete Setup Guide

## Status: ✅ Ready (Demo Mode)

Your app is **already running** and accessible via ngrok! But to use **Google Sheets**, follow this checklist.

---

## ✅ What's Done

- ✅ Server running on port 3000
- ✅ Frontend deployed
- ✅ ngrok tunnel active
- ✅ Spreadsheet ID set: `1vU_n01bnUwy03wFXhrG0aiHjsB_JHDUZ3bxTB1MKhok`

---

## 📋 Setup Checklist (Copy-Paste Ready!)

### Step 1: Create Google Cloud Project
```
Go to: https://console.cloud.google.com
- Click "Select a Project" (top left)
- Click "NEW PROJECT"
- Name: Schedule System
- Click "CREATE"
```

### Step 2: Enable APIs
```
In Google Cloud Console:
- Search for "Google Sheets API" → Click → ENABLE
- Search for "Google Drive API" → Click → ENABLE
```

### Step 3: Create Service Account
```
In Google Cloud Console:
- Left menu → "APIs & Services" → "Credentials"
- Click "+ CREATE CREDENTIALS"
- Choose "Service Account"
  - Service Account Name: schedule-bot
  - Click "CREATE AND CONTINUE"
  - Skip grant roles → "CONTINUE"
  - Skip user access → "Done"
```

### Step 4: Download credentials.json
```
In Google Cloud Console:
- Go to "Service Accounts"
- Click "schedule-bot"
- Tab "Keys"
- "Add Key" → "Create new key"
- Choose "JSON"
- Click "Create"

A file "credentials.json" will download.
```

### Step 5: Upload credentials.json
```bash
# Drag the downloaded credentials.json into VS Code
# at /workspaces/Schedule-System-.-/credentials.json

# Verify:
ls -la /workspaces/Schedule-System-.-/credentials.json
```

### Step 6: Share Spreadsheet
```bash
# Get the client email:
cat /workspaces/Schedule-System-.-/credentials.json | grep client_email
# Copy the email (looks like: schedule-bot@project-xxx.iam.gserviceaccount.com)

# Then:
- Go to your Spreadsheet: https://docs.google.com/spreadsheets/d/1vU_n01bnUwy03wFXhrG0aiHjsB_JHDUZ3bxTB1MKhok
- Click "Share"
- Paste the email
- Give "Editor" access
- Click "Share"
```

### Step 7: Restart Server
```bash
# Kill old server
pkill -f "npm start"

# Start fresh
cd /workspaces/Schedule-System-.- && npm start

# You should see: ✅ Google Sheets API initialized
```

---

## 🔗 Current URLs

- **App URL:** https://unmusical-julietta-macroclimatically.ngrok-free.dev
- **Demo Login:** admin / admin123
- **Spreadsheet:** https://docs.google.com/spreadsheets/d/1vU_n01bnUwy03wFXhrG0aiHjsB_JHDUZ3bxTB1MKhok

---

## 🆘 Troubleshooting

**Error: Cannot find module 'express'**
```bash
npm install
```

**Server won't start**
```bash
# Kill all node processes
pkill -f node
pkill -f npm

# Restart
npm start
```

**credentials.json not found**
- Check it's in the right folder: `/workspaces/Schedule-System-.-/credentials.json`
- Filename must be exactly `credentials.json` (lowercase)

**API not working**
- Check ngrok is still running: `ps aux | grep ngrok`
- Check server is running: `curl http://localhost:3000`
- Check .env file has correct SPREADSHEET_ID

---

## 📞 Quick Reference

| What | Where |
|------|-------|
| Google Cloud Console | https://console.cloud.google.com |
| Your Spreadsheet | https://docs.google.com/spreadsheets/d/1vU_n01bnUwy03wFXhrG0aiHjsB_JHDUZ3bxTB1MKhok |
| Code Directory | /workspaces/Schedule-System-.- |
| Server Port | 3000 |
| ngrok Command | `ngrok http 3000` |

---

## ✨ Once Complete

When you see **✅ Google Sheets API initialized** on server start, you're done!

Data will now persist in Google Sheets instead of memory.

---

**Need help? Ask me!** 🎯
