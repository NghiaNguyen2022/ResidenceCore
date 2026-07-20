$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "ResidenceCore - Apply 16L3 + 16L4" -ForegroundColor Cyan
Write-Host "Thu muc hien tai: $PWD"
Write-Host ""

$required = @(
    "server\db\storeLedger.ts",
    "server\routers\modules\residentPortal.ts",
    "server\routers\modules\storeLedger.ts",
    "client\src\pages\MyDuties.tsx"
)

foreach ($path in $required) {
    if (-not (Test-Path $path)) {
        throw "Khong tim thay $path. Hay copy toan bo goi vao thu muc goc ResidenceCore."
    }
}

# Backup current files before applying.
$backupRoot = "_backup_16L3_16L4_" + (Get-Date -Format "yyyyMMdd_HHmmss")
New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null

foreach ($path in $required) {
    $target = Join-Path $backupRoot $path
    New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
    Copy-Item $path $target -Force
}

$serviceSource = (Resolve-Path (Join-Path $PSScriptRoot "server\services\storeDutyAccessService.ts")).Path
$serviceTarget = (Resolve-Path "server\services").Path + "\storeDutyAccessService.ts"
New-Item -ItemType Directory -Force -Path (Split-Path $serviceTarget) | Out-Null

if ($serviceSource -ne $serviceTarget) {
    Copy-Item $serviceSource $serviceTarget -Force
} else {
    Write-Host "File service da nam dung vi tri, bo qua buoc copy." -ForegroundColor DarkGray
}

Write-Host "Dang ap dung 16L3..." -ForegroundColor Yellow
git apply --check (Join-Path $PSScriptRoot "residencecore_viec16l3_store_access_code.patch")
git apply (Join-Path $PSScriptRoot "residencecore_viec16l3_store_access_code.patch")

Write-Host "Dang ap dung 16L4..." -ForegroundColor Yellow
git apply --check (Join-Path $PSScriptRoot "residencecore_viec16l4_store_access_timeout.patch")
git apply (Join-Path $PSScriptRoot "residencecore_viec16l4_store_access_timeout.patch")

Write-Host ""
Write-Host "DA AP DUNG XONG 16L3 + 16L4" -ForegroundColor Green
Write-Host "Backup: $backupRoot" -ForegroundColor DarkGray
Write-Host ""
git status --short

Write-Host ""
Write-Host "Tiep theo chay: pnpm check" -ForegroundColor Cyan
