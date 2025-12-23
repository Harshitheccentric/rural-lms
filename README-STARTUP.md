# 🚀 Rural LMS - Quick Start Guide

## ⚡ One-Click Startup (Recommended)

### Windows:
Right-click `start-all.ps1` → **Run with PowerShell**

This will:
- ✅ Kill any existing processes on ports 3000 & 5173
- ✅ Start backend server (Port 3000)
- ✅ Start frontend server (Port 5173)
- ✅ Open two new PowerShell windows (one for each server)

### To Stop Servers:
Right-click `stop-all.ps1` → **Run with PowerShell**

Or simply close the PowerShell windows that opened.

---

## 🔧 Manual Startup (If Scripts Don't Work)

### Step 1: Open Two PowerShell Terminals

### Step 2: Start Backend (Terminal 1)
```powershell
cd D:\cloud_el_2\rural-lms\backend
npm start
```

### Step 3: Start Frontend (Terminal 2)
```powershell
cd D:\cloud_el_2\rural-lms\frontend
npm run dev
```

---

## 🌐 Access Points

- **Frontend Application:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **Speed Test:** http://localhost:3000/api/speed-test

---

## 🔐 Test Accounts

### Student Account
- **Email:** student@test.com
- **Password:** password123

### Educator Account
- **Email:** educator@test.com
- **Password:** password123

---

## ❌ Troubleshooting

### Error: "Port 3000 already in use"

**Solution 1 (Quick):**
```powershell
Get-Process -Name node | Stop-Process -Force
```

**Solution 2 (Manual):**
1. Open Task Manager (Ctrl + Shift + Esc)
2. Find all "Node.js JavaScript Runtime" processes
3. End all Node.js tasks
4. Restart servers

### Error: "Cannot find package.json"

Make sure you're in the correct directory:
```powershell
# For backend
cd D:\cloud_el_2\rural-lms\backend

# For frontend
cd D:\cloud_el_2\rural-lms\frontend
```

### Error: "Module not found"

Install dependencies:
```powershell
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Port 5173 already in use

Kill Vite processes:
```powershell
Get-Process -Name node | Where-Object {$_.MainWindowTitle -like "*Vite*"} | Stop-Process -Force
```

---

## 📦 Project Structure

```
rural-lms/
├── start-all.ps1           ← One-click startup script
├── stop-all.ps1            ← One-click stop script
├── backend/                ← Express.js API server
│   ├── src/
│   │   ├── server.js       ← Entry point
│   │   ├── controllers/    ← Business logic
│   │   ├── routes/         ← API endpoints
│   │   ├── middleware/     ← Auth & validation
│   │   └── config/         ← Database config
│   └── package.json
├── frontend/               ← React + Vite application
│   ├── src/
│   │   ├── App.jsx         ← Main component
│   │   ├── pages/          ← Page components
│   │   ├── components/     ← Reusable components
│   │   ├── context/        ← State management
│   │   └── services/       ← API calls
│   └── package.json
└── README.md
```

---

## ✅ Verification Checklist

After starting, verify:

- [ ] Backend terminal shows "Server running on: http://localhost:3000"
- [ ] Frontend terminal shows "Local: http://localhost:5173"
- [ ] Opening http://localhost:5173 shows the Rural LMS homepage
- [ ] Opening http://localhost:3000/health returns JSON with "success: true"
- [ ] No red error messages in either terminal

---

## 🎯 Next Steps

1. ✅ **Login** - Use test credentials above
2. ✅ **Browse Courses** - Click "View All Courses"
3. ✅ **Enroll** - Select a course and click "Enroll Now"
4. ✅ **Start Learning** - Click on a lesson to begin
5. ✅ **Mark Complete** - Complete lessons to track progress

---

## 🆘 Still Having Issues?

If you encounter any errors:

1. **Check Node.js version:**
   ```powershell
   node --version
   # Should be v16+ (currently using v22.12.0)
   ```

2. **Check npm version:**
   ```powershell
   npm --version
   # Should be v8+
   ```

3. **Clear npm cache:**
   ```powershell
   npm cache clean --force
   ```

4. **Reinstall dependencies:**
   ```powershell
   # Backend
   cd backend
   rm -rf node_modules
   npm install

   # Frontend
   cd frontend
   rm -rf node_modules
   npm install
   ```

---

## 📝 Important Notes

- ⚠️ **Always start backend BEFORE frontend**
- ⚠️ **Don't close PowerShell windows while servers are running**
- ⚠️ **Data is stored in `backend/rural-lms.db` (SQLite database)**
- ⚠️ **To reset database, delete `rural-lms.db` and restart backend**

---

**🎓 Happy Learning with Rural LMS!**
