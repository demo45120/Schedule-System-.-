# Deploy to Render or Railway

เอกสารนี้อธิบายวิธีการ deploy แอปพลิเคชันไปยัง **Render** หรือ **Railway** เพื่อให้เข้าถึงได้จากที่ใดก็ได้

---

## Option 1: Deploy to Render

### ขั้นตอน 1: สร้างบัญชี Render
1. ไปที่ https://render.com
2. สร้างบัญชี (การสมัครครั้งแรกมีเครดิต $5 ฟรี)
3. ยืนยัน email

### ขั้นตอน 2: Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/Schedule-System.git
git branch -M main
git push -u origin main
```

### ขั้นตอน 3: Connection Render to GitHub
1. ใน Render Dashboard คลิก **"New +"** → **"Web Service"**
2. เลือก **"Connect GitHub account"** (ให้สิทธิ์ access)
3. ค้นหา `Schedule-System` repository
4. เลือก repository และคลิก **"Connect"**

### ขั้นตอน 4: ตั้งค่า Deployment
- **Name:** `schedule-system` (หรือชื่ออื่น)
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Plan:** `Free` (หรือ `Starter`)

### ขั้นตอน 5: ตั้งค่า Environment Variables
ในส่วน **Environment** เพิ่มตัวแปร:
```
SPREADSHEET_ID=your-google-sheet-id
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
JWT_SECRET=your-generated-secret-key
```

**สำคัญ:** ต้องอัป `credentials.json` ไปยัง GitHub repository
```bash
# ในโฟลเดอร์โครงการ
cat credentials.json  # ตรวจสอบมี file นี้
git add credentials.json
git commit -m "Add Google credentials"
git push
```

### ขั้นตอน 6: Deploy
1. คลิก **"Create Web Service"**
2. รอให้ build เสร็จ (ประมาณ 2-5 นาที)
3. เมื่อสำเร็จ จะได้ URL เช่น: `https://schedule-system.onrender.com`

### ขั้นตอน 7: เพิ่ม Persistent Storage (Optional)
หากต้องการเก็บ data ตลอดเวลา:
1. ใน **Services** เลือก Web Service ของคุณ
2. ไปที่ **Disks** → **"Add Disk"**
3. ตั้ง **Mount Path:** `/var/data`
4. Save และ deploy ใหม่

---

## Option 2: Deploy to Railway

### ขั้นตอน 1: สร้างบัญชี Railway
1. ไปที่ https://railway.app
2. สร้างบัญชี GitHub (ด้วย GitHub OAuth)
3. ยืนยัน

### ขั้นตอน 2: Push Code to GitHub (เหมือน Render)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/Schedule-System.git
git push -u origin main
```

### ขั้นตอน 3: Create New Project
1. ใน Railway คลิก **"New Project"**
2. เลือก **"Deploy from GitHub"**
3. Connect GitHub account (ให้สิทธิ์)
4. เลือก repository `Schedule-System`
5. Railway จะสร้าง service อัตโนมัติ

### ขั้นตอน 4: ตั้งค่า Environment Variables
1. ใน Project Dashboard เลือก service
2. ไปที่ **Variables** tab
3. เพิ่มตัวแปร:
   ```
   SPREADSHEET_ID=your-google-sheet-id
   GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
   JWT_SECRET=your-generated-secret-key
   PORT=3000
   ```

### ขั้นตอน 5: อัป credentials.json
**สำคัญ:** Railway ต้องการ `credentials.json` เพื่อเข้าถึง Google Sheets
```bash
git add credentials.json
git commit -m "Add Google credentials"
git push
```

### ขั้นตอน 6: Deploy
1. Railroad จะ detect `Procfile` อัตโนมัติ
2. Deploy จะเริ่มโดยอัตโนมัติ
3. เมื่อเสร็จ จะได้ URL เช่น: `https://schedule-system.up.railway.app`

---

## การเปรียบเทียบ

| Feature | Render | Railway |
|---------|--------|---------|
| **Free Tier** | $5/month | $5/month credit |
| **Startup Time** | ปกติ | เร็ว |
| **GitHub Sync** | ✅ | ✅ |
| **Environment Variables** | ✅ | ✅ |
| **Persistent Storage** | ✅ (Disk) | ✅ (Disk) |
| **Custom Domain** | ✅ | ✅ |
| **SSL/HTTPS** | ✅ | ✅ |

---

## การตั้งค่า Domain ที่เป็นของตัวเอง (Custom Domain)

### Render:
1. ในเว็บ Dashboard → **Settings** → **Custom Domain**
2. ใส่ domain ของคุณ เช่น `schedule.example.com`
3. ปรับ DNS records ตามที่ Render บอก

### Railway:
1. ในเว็บ Dashboard → **Settings** → **Custom Domain**
2. ใส่ domain ของคุณ
3. ปรับ DNS settings

---

## ปัญหาทั่วไป

### "credentials.json not found"
```bash
# ตรวจสอบว่า credentials.json อยู่ใน root folder
ls -la credentials.json

# Commit ไปยัง git
git add credentials.json
git commit -m "Add credentials"
git push
```

### "Google Sheets API Error"
- ตรวจสอบ `SPREADSHEET_ID` ถูกต้อง
- ตรวจสอบ Service Account มี permission กับ Spreadsheet
- ใน Google Sheets แชร์ access ให้ email ของ service account

### "Port 3000 already in use"
ไม่เป็นปัญหา—Render/Railway จะแนว PORT อัตโนมัติ

---

## Local Testing ก่อน Deploy

```bash
# Install dependencies
npm install

# ตั้งค่า .env
cp .env.example .env
# แล้วแก้ไข .env ด้วยข้อมูลจริง

# รัน server
npm start

# ทดสอบ API
curl http://localhost:3000/api/bootstrap
```

---

## คำติชม

หากมีปัญหาการ deploy:
1. ตรวจสอบ **Deployment Logs** ใน Render/Railway console
2. ตรวจสอบ **Build Logs** ว่ามี error
3. ตรวจสอบ environment variables ต้องตั้งค่าทั้งหมด

---

**สำเร็จแล้ว!** 🎉 แอป schedule ของคุณตอนนี้สามารถเข้าถึงได้จากที่ใดก็ได้ผ่าน public URL
