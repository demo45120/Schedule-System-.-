# 🚀 Deploy to Render or Railway - Quick Start

เลือกแพลตฟอร์มเดียว แล้วทำตามขั้นตอน

---

## 🎯 เลือกแพลตฟอร์มที่เหมาะกับคุณ

### ⚡ Railway (เร็ว, ง่าย, แนะนำสำหรับใหม่)
- ✅ Deploy อัตโนมัติจาก GitHub
- ✅ ตั้งค่า environment variables ง่าย
- ✅ Startup เร็ว (~30 วินาที)
- ✨ Free $5/month credit
- 📍 URL: `your-app.up.railway.app`

### 📊 Render (เสถียร, ฟีเจอร์เยอะ)
- ✅ Deploy ด้วย Git
- ✅ Custom domain support
- ✅ Persistent disk สำหรับ data
- ✨ Free tier พอเพียง
- 📍 URL: `your-app.onrender.com`

---

## 🔧 ขั้นตอนการ Deploy

### Phase 1: เตรียม Code (ทั้ง Render และ Railway)

#### 1️⃣ สร้าง GitHub Repository

```bash
cd /path/to/Schedule-System
git init
git add .
git commit -m "Initial commit - Ready for deployment"
```

จากนั้น push ไปยัง GitHub ใหม่:
```bash
git remote add origin https://github.com/YOUR_USERNAME/Schedule-System.git
git branch -M main
git push -u origin main
```

**สำคัญ:** ต้อง push `credentials.json` ด้วย!
```bash
# ตรวจสอบว่า credentials.json อยู่ในโฟลเดอร์
ls credentials.json  # ต้องมี

# Commit
git add credentials.json
git commit -m "Add Google credentials"
git push
```

---

### Phase 2A: Deploy to Railway ⚡

#### ขั้นที่ 1: สร้าง Railway Account
- ไปที่ https://railway.app
- Click **"Start New Project"**
- เลือก **"Deploy from GitHub repo"**

#### ขั้นที่ 2: Connect GitHub
- Authorization Railway เข้าถึง GitHub
- Select repository: **Schedule-System**
- Railway จะ auto-detect เป็น Node.js project

#### ขั้นที่ 3: ตั้ง Environment Variables
ใน Railway Dashboard:
1. เลือก Service ของคุณ
2. ไปที่ tab **Variables**
3. เพิ่ม:
   ```
   SPREADSHEET_ID=your-actual-sheet-id-here
   JWT_SECRET=your-super-secret-key-2024-change-me
   PORT=3000
   ```
4. **Save**

#### ขั้นที่ 4: Deploy!
- Railway จะ auto-deploy เมื่อ push ไป GitHub
- รอ ~2-3 นาที
- ดูสถานะใน **Deployments** tab
- เมื่อสี่เหลี่ยมเป็นสีเขียว ✅ → Ready!

#### ขั้นที่ 5: ทดสอบ
```bash
# Railway จะให้ URL เช่น:
https://schedule-system.up.railway.app

# ทดสอบ API:
curl https://schedule-system.up.railway.app/api/bootstrap

# เปิดในเบราว์เซอร์:
# https://schedule-system.up.railway.app
```

**ล็อกอินด้วย:**
- Username: `admin`
- Password: `admin123`

---

### Phase 2B: Deploy to Render 📊

#### ขั้นที่ 1: สร้าง Render Account
- ไปที่ https://render.com
- Sign up (ได้ $5 credit)
- ยืนยัน email

#### ขั้นที่ 2: Create Web Service
1. Dashboard → **"New +"** → **"Web Service"**
2. **"Connect GitHub account"** → authorize
3. ค้นหา repository **Schedule-System**
4. เลือก → **"Connect"**

#### ขั้นที่ 3: ตั้งค่า Build & Deploy
- **Name:** `schedule-system`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Plan:** `Free` หรือ `Starter`

#### ขั้นที่ 4: ตั้ง Environment
ใน **Environment** section เพิ่ม:
```
SPREADSHEET_ID=your-actual-sheet-id
JWT_SECRET=your-super-secret-key-change-this
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
```

#### ขั้นที่ 5: Deploy!
- Click **"Create Web Service"**
- รอ build (2-5 นาที)
- ดูความคืบหน้าใน logs
- เมื่อเสร็จ → ได้ URL เช่น: `https://schedule-system.onrender.com`

#### ขั้นที่ 6: ทดสอบ
```bash
curl https://schedule-system.onrender.com/api/bootstrap

# เปิดในเบราว์เซอร์:
# https://schedule-system.onrender.com
```

**ล็อกอินด้วย:**
- Username: `admin`
- Password: `admin123`

---

## ⚠️ ปัญหาที่อาจเจอ

### "credentials.json not found"
```bash
# ใน local folder ตรวจสอบว่าไฟล์มี:
ls credentials.json

# Commit และ push:
git add credentials.json
git commit -m "Add credentials"
git push
```

### "Google Sheets API error"
1. ตรวจสอบ `SPREADSHEET_ID` ถูกต้อง (ดูจาก URL ของ Sheet)
2. Share Spreadsheet ให้ Service Account email
3. ตรวจสอบ Service Account มี role "Editor"

### "Internal Server Error (500)"
ดูที่ Logs ใน Render/Railway console:
- Railway: **Logs** tab
- Render: **Logs** section

### "Cannot find module 'express'"
รอให้ `npm install` เสร็จ (โดยทั่วไป auto)

---

## 📍 Custom Domain (Optional)

หากต้องการ domain ของตัวเอง เช่น `schedule.company.com`:

### Render:
1. Settings → **Custom Domain**
2. ใส่ domain
3. ปรับ DNS records

### Railway:
1. Service Settings → **Custom Domain**
2. ใส่ domain
3. ปรับ DNS เพื่อชี้ไปยัง Railway

---

## 🔄 Auto-Deploy จาก GitHub

ทั้ง Render และ Railway supports auto-deploy:
- ทำการ commit ใหม่ → push ไป GitHub
- Platform จะ auto-detect และ deploy ใหม่ใน ~1-3 นาที
- ไม่ต้องทำอะไรเพิ่มเติม

---

## 📬 Support & Logs

### Railway
- Dashboard → select Service → **Logs** tab
- ดูข้อมูลการทำงาน real-time

### Render
- Dashboard → select Web Service
- scroll ลงไป → **Logs**
- ดู stdout/stderr

---

## ✅ ตรวจสอบว่า Deploy สำเร็จ

1. ❓ ได้ public URL แล้วหรือ?
2. ❓ เปิดในเบราว์เซอร์ได้ไหม?
3. ❓ ล็อกอินด้วย admin/admin123 ได้ไหม?
4. ❓ ดูข้อมูลจาก Google Sheets ได้ไหม?

ถ้าทุกข้อ yes ✅ → **Deploy สำเร็จแล้ว!** 🎉

---

## 📖 More Info

ดู **[RENDER_RAILWAY_DEPLOYMENT.md](./RENDER_RAILWAY_DEPLOYMENT.md)** สำหรับรายละเอียดเพิ่มเติม
