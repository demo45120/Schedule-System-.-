# Schedule Management System

ระบบจัดการประชุมและกิจกรรมของ สกร.ประจำจังหวัดชลบุรี พร้อมการบูรณาการ Google Sheets

---

## 🚀 Deployment Options

### ⭐ ด่วนที่สุด: Render หรือ Railway (แนะนำ)

```bash
# 1️⃣ เตรียม project
npm install

# 2️⃣ Push ไป GitHub
git add .
git commit -m "Ready to deploy"
git push

# 3️⃣ เลือกแพลตฟอร์ม:
#    📊 Render: https://render.com
#    🚄 Railway: https://railway.app
```

👉 ดูรายละเอียดใน **[RENDER_RAILWAY_DEPLOYMENT.md](./RENDER_RAILWAY_DEPLOYMENT.md)**

---

## 🏠 Local Development

### ขั้นตอน 1️⃣ ติดตั้ง Dependencies
```bash
npm install
```

### ขั้นตอน 2️⃣ ตั้งค่า Google Sheets API

1. ไปที่ https://console.cloud.google.com
2. สร้าง Project ใหม่
3. เปิด **Google Sheets API** + **Google Drive API**
4. สร้าง **Service Account** → Download JSON
5. วาง `credentials.json` ลงโฟลเดอร์นี้
6. Share Spreadsheet ให้ Service Account email (Editor role)

### ขั้นตอน 3️⃣ ตั้งค่า Environment
```bash
cp .env.example .env
```

แก้ไข `.env`:
```
SPREADSHEET_ID=YOUR_GOOGLE_SHEET_ID
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
JWT_SECRET=your-secret-key-here
PORT=3000
```

### ขั้นตอน 4️⃣ รันเซิร์ฟเวอร์
```bash
npm start
# เปิด http://localhost:3000
```

---

## 🔑 Demo Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | ผู้ดูแลระบบ |
| `Chaiyo` | `Chaiyo` | เจ้าหน้าที่ |

---

## 📁 โครงสร้าง
- `server.js` - Express + Sheets API
- `index.html` - Frontend
- `package.json` - Dependencies
- `credentials.json` - Google API (ใส่เอง)

---

## 🚀 เสร็จ!
