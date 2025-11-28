# 🔧 Troubleshooting Guide

## Issue: Can't reach localhost:3000

### Solution 1: Manual Start
1. **Open Command Prompt or PowerShell**
2. **Navigate to your project folder**:
   ```bash
   cd "C:\Users\SATYA POOJITH\Downloads\health-appointment-system_(3)[1]\health-appointment-system (2)"
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the application**:
   ```bash
   npm run dev
   ```

### Solution 2: Use the Batch File
1. **Double-click** `start-app.bat` in your project folder
2. Wait for it to install dependencies and start

### Solution 3: Use PowerShell Script
1. **Right-click** on `start-app.ps1`
2. **Select** "Run with PowerShell"

## Expected Output
When working correctly, you should see:
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
✓ Ready in 2.5s
```

## Common Issues

### Issue: "ENOENT: no such file or directory"
**Solution**: Make sure you're in the correct project directory

### Issue: "Port 3000 already in use"
**Solution**: 
```bash
npx kill-port 3000
npm run dev
```

### Issue: Turbopack errors
**Solution**: The config has been updated to use webpack instead

### Issue: Dependencies not installed
**Solution**:
```bash
npm install
npm run dev
```

## Manual Commands

If the scripts don't work, run these commands one by one:

```bash
# 1. Navigate to project directory
cd "your-project-path"

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser to http://localhost:3000
```

## Verify Setup

Once running, you should be able to:
1. ✅ Open http://localhost:3000 in browser
2. ✅ See the HealthCare homepage
3. ✅ Click "Sign Up" and "Login" buttons
4. ✅ Navigate through the application

## Still Having Issues?

1. **Check Node.js version**: `node --version` (should be 18+)
2. **Check npm version**: `npm --version`
3. **Clear npm cache**: `npm cache clean --force`
4. **Delete node_modules**: `rmdir /s node_modules` then `npm install`
5. **Check firewall/antivirus** blocking port 3000

## Success Indicators

✅ **Working**: Browser shows HealthCare homepage with blue/green gradient
❌ **Not Working**: "This site can't be reached" or connection errors

The application should load the beautiful healthcare homepage with navigation and hero section.