# Git Sync Script
Set-Location "C:\Users\teja\Desktop\SyncUp Fork\SyncUpFork"

Write-Host "=== Git Status ===" -ForegroundColor Cyan
git status --short

Write-Host "`n=== Pulling from remote ===" -ForegroundColor Cyan
git pull origin main

Write-Host "`n=== Checking if push is needed ===" -ForegroundColor Cyan
$behind = git rev-list --count origin/main..HEAD
if ($behind -gt 0) {
    Write-Host "Local is $behind commits ahead. Pushing..." -ForegroundColor Yellow
    git push origin main
    Write-Host "`n✅ Successfully synced with remote!" -ForegroundColor Green
} else {
    Write-Host "`n✅ Already in sync with remote!" -ForegroundColor Green
}
