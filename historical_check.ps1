$repo = 'd:\All Project\Project\Project\smart-dairy-erp\smart-dairy-erp'
$outDir = Join-Path $repo 'recovery-artifacts'
New-Item -ItemType Directory -Path $outDir -Force | Out-Null
$out = Join-Path $outDir 'historical_check.txt'

$commits = @('8988d47','427ede2','0e1eb8a','2402fb2','e854b7a','7c10779','675f79f')
$paths = @(
  'frontend/frontend/src/lib/api.ts',
  'frontend/frontend/src/types/api.ts',
  'frontend/frontend/src/pages/MilkCollectionsPage.tsx',
  'frontend/frontend/src/pages/MilkRateChartsPage.tsx',
  'backend/smart-dairy-backend/src/main/java/com/smartdairy/security/SecurityConfig1.java',
  'backend/smart-dairy-backend/src/main/resources/db/migration/V140__create_app_user_table.sql'
)

$lines = @()
foreach ($c in $commits) {
  $lines += "=== $c ==="
  foreach ($p in $paths) {
    git -C $repo cat-file -e "$c`:$p" 2>$null
    if ($LASTEXITCODE -eq 0) {
      $lines += "FOUND`t$p"
    }
  }
}

$lines | Set-Content -Path $out
Write-Output "Wrote $out"
