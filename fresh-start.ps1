# Fresh Start Script - Removes git history and starts clean
# This is the EASIEST solution

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RIVERNOVA - FRESH GIT START" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  WARNING: This will remove all git history!" -ForegroundColor Yellow
Write-Host "Your files will be safe, but commit history will be lost." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Type 'YES' to continue"

if ($confirm -ne "YES") {
    Write-Host "Cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Step 1: Removing old git history..." -ForegroundColor Green
Remove-Item -Path ".git" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Step 2: Initializing fresh repository..." -ForegroundColor Green
git init

Write-Host "Step 3: Adding all files..." -ForegroundColor Green
git add .

Write-Host "Step 4: Creating initial commit..." -ForegroundColor Green
git commit -m "Initial commit - Rivernova MVP (cleaned)"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ SUCCESS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to GitHub and DELETE the old repository:" -ForegroundColor White
Write-Host "   https://github.com/rivernova-ai/Rivernova/settings" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Create a NEW repository:" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Cyan
Write-Host "   Name: Rivernova" -ForegroundColor White
Write-Host ""
Write-Host "3. Push to the new repository:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/rivernova-ai/Rivernova.git" -ForegroundColor Cyan
Write-Host "   git branch -M main" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Regenerate your API keys!" -ForegroundColor Red
Write-Host "   - Perplexity: https://www.perplexity.ai/settings/api" -ForegroundColor White
Write-Host "   - Anthropic: https://console.anthropic.com/settings/keys" -ForegroundColor White
Write-Host ""
