# scripts/backup.ps1
# Evolve Studio Automated Backup Utility
# Backs up the database state, environment configurations, and project settings.

$BackupDir = "backups\backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
New-Item -ItemType Directory -Force -Path "$BackupDir\config" | Out-Null

Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "  EVOLVE STUDIO BACKUP SYSTEM ACTIVE" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Creating backup snapshot in: $BackupDir" -ForegroundColor Cyan
Write-Host ""

# 1. Back up Supabase Database Schema and Data
Write-Host "[1/3] Dumping database state..." -ForegroundColor Yellow
if (Get-Command npx -ErrorAction SilentlyContinue) {
    # Dump Schema
    npx supabase db dump --local -f "$BackupDir\database_schema.sql" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " - Database schema dumped successfully." -ForegroundColor Green
    } else {
        Write-Host " - Local DB offline or not running. Schema backup skipped." -ForegroundColor Yellow
    }

    # Dump Data
    npx supabase db dump --local --data-only -f "$BackupDir\database_data.sql" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " - Database data tables dumped successfully." -ForegroundColor Green
    }
} else {
    Write-Host " - Supabase CLI not available. Skipping DB dump." -ForegroundColor Yellow
}

# 2. Back up Configurations and Settings
Write-Host ""
Write-Host "[2/3] Packing project environment files..." -ForegroundColor Yellow
$ConfigPaths = @(
    ".env.local",
    "supabase\config.toml",
    "package.json",
    "tsconfig.json",
    "CHECKLIST.md"
)

foreach ($Path in $ConfigPaths) {
    if (Test-Path $Path) {
        Copy-Item -Path $Path -Destination "$BackupDir\config\" -Force
        Write-Host " - Copied: $Path" -ForegroundColor Green
    }
}

# 3. Create Zip Archive of the Backup Snapshot
Write-Host ""
Write-Host "[3/3] Archiving backup snapshot..." -ForegroundColor Yellow
$ZipPath = "$BackupDir.zip"
Compress-Archive -Path "$BackupDir\*" -DestinationPath $ZipPath -Force

# Clean up temporary folder, leaving only the clean zip archive
Remove-Item -Recurse -Force $BackupDir

Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "  BACKUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "  Archive saved to: $ZipPath" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Yellow
