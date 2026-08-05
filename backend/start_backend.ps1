# start_backend.ps1
Write-Host "Starting Python Blockchain Server on port 5001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\HP\simple-blockchain; .\venv\Scripts\activate; python server.py"

Write-Host "Starting Node.js Backend Server on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\WebTechnology\SnakeEnergyApp\backend; node index.js"

Write-Host "Both servers started in separate windows." -ForegroundColor Yellow
