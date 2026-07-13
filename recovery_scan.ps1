$ErrorActionPreference = 'SilentlyContinue'
$repo = 'd:\All Project\Project\Project\smart-dairy-erp\smart-dairy-erp'
$outDir = Join-Path $repo 'recovery-artifacts'
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

$targets = @(
  'frontend/frontend/src/App.tsx',
  'frontend/frontend/src/App.css',
  'frontend/frontend/src/lib/api.ts',
  'frontend/frontend/src/types/api.ts',
  'frontend/frontend/src/pages/MilkCollectionsPage.tsx',
  'frontend/frontend/src/pages/MilkRateChartsPage.tsx',
  'backend/smart-dairy-backend/src/main/java/com/smartdairy/security/SecurityConfig1.java',
  'backend/smart-dairy-backend/src/main/java/com/smartdairy/security/jwt/JwtService.java',
  'backend/smart-dairy-backend/src/main/resources/db/migration/V140__create_app_user_table.sql',
  'backend/smart-dairy-backend/src/main/resources/db/migration/V141__migrate_app_user_roles.sql'
)

$fsck = git -C $repo fsck --full --no-reflogs --unreachable
$fsck | Set-Content -Path (Join-Path $outDir 'fsck.txt')

$commitHashes = @()
foreach ($line in $fsck) {
  if ($line -match '(unreachable|dangling) commit ([0-9a-f]{40})') {
    $commitHashes += $Matches[2]
  }
}
$commitHashes = $commitHashes | Select-Object -Unique

$report = @()
foreach ($h in $commitHashes) {
  $files = git -C $repo ls-tree -r --name-only $h
  if (-not $files) { continue }

  $hit = 0
  $matched = @()
  foreach ($t in $targets) {
    if ($files -contains $t) {
      $hit++
      $matched += $t
    }
  }

  if ($hit -gt 0) {
    $report += [PSCustomObject]@{
      commit = $h
      hits = $hit
      matched = ($matched -join '; ')
    }
  }
}

$sorted = $report | Sort-Object -Property @{Expression='hits'; Descending=$true}, @{Expression='commit'; Descending=$false}
$sorted | Format-Table -AutoSize | Out-String | Set-Content -Path (Join-Path $outDir 'candidate_commits.txt')

if ($sorted.Count -gt 0) {
  $best = $sorted[0]
  "BEST_COMMIT=$($best.commit)" | Set-Content -Path (Join-Path $outDir 'best_commit.txt')
  "BEST_HITS=$($best.hits)" | Add-Content -Path (Join-Path $outDir 'best_commit.txt')
  "BEST_MATCHED=$($best.matched)" | Add-Content -Path (Join-Path $outDir 'best_commit.txt')
}

# quick blob search for known phrases
$patterns = @(
  'Frontend for Backend APIs',
  'Smart Dairy ERP Workspace',
  'MilkCollectionsPage',
  'react-router-dom',
  'class SecurityConfig1',
  'GetAllFarmerService',
  'DailySalesReportRequest',
  '/api/v1/milk-rate-charts'
)

$lostDir = Join-Path $repo '.git\lost-found\other'
$blobMatches = @()
Get-ChildItem -Path $lostDir -File | ForEach-Object {
  $hash = $_.Name
  $type = git -C $repo cat-file -t $hash
  if ($type -ne 'blob') { return }

  $content = git -C $repo cat-file -p $hash
  foreach ($p in $patterns) {
    if ($content -match [regex]::Escape($p)) {
      $blobMatches += "$hash`t$p"
      break
    }
  }
}
$blobMatches | Set-Content -Path (Join-Path $outDir 'blob_matches.txt')

# extract full auth/security classes from unreachable blobs
$restoredRoot = Join-Path $outDir 'restored'
New-Item -ItemType Directory -Path $restoredRoot -Force | Out-Null
$securityRows = @()

Get-ChildItem -Path $lostDir -File | ForEach-Object {
  $hash = $_.Name
  $type = git -C $repo cat-file -t $hash
  if ($type -ne 'blob') { return }

  $content = git -C $repo cat-file -p $hash
  if ($content -notmatch 'package\s+com\.smartdairy\.security(\.[a-zA-Z0-9_]+)*\s*;') { return }

  $packageName = $Matches[0] -replace '^package\s+', '' -replace '\s*;$', ''
  $packagePath = $packageName -replace '\.', '/'

  $className = 'UnknownSecurityClass'
  if ($content -match '\b(class|interface|enum)\s+([A-Za-z0-9_]+)') {
    $className = $Matches[2]
  }

  $targetDir = Join-Path $restoredRoot $packagePath
  New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
  $targetName = "$className.blob-$($hash.Substring(0,8)).recovered.java"
  $targetPath = Join-Path $targetDir $targetName
  $content | Set-Content -Path $targetPath

  $securityRows += [PSCustomObject]@{
    blob = $hash
    class = $className
    package = $packageName
    file = $targetPath
  }
}

$securityRows |
  Sort-Object package, class, blob |
  Format-Table -AutoSize |
  Out-String |
  Set-Content -Path (Join-Path $outDir 'security_blob_index.txt')

Write-Output "Scan completed. Artifacts in recovery-artifacts/."
