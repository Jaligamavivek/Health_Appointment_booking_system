Write-Host "Starting Health Appointment System..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Starting the application..." -ForegroundColor Yellow
npm run dev

Read-Host "Press Enter to exit"