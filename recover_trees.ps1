$repo = 'd:\All Project\Project\Project\smart-dairy-erp\smart-dairy-erp'
$outDir = Join-Path $repo 'recovery-artifacts'
New-Item -ItemType Directory -Path $outDir -Force | Out-Null
$out = Join-Path $outDir 'tree_candidates.txt'

$targets = @(
  'frontend/frontend/src/lib/api.ts',
  'frontend/frontend/src/types/api.ts',
  'frontend/frontend/src/pages/MilkCollectionsPage.tsx',
  'frontend/frontend/src/pages/MilkRateChartsPage.tsx',
  'frontend/frontend/src/pages/SalesPage.tsx',
  'backend/smart-dairy-backend/src/main/java/com/smartdairy/security/SecurityConfig1.java',
  'backend/smart-dairy-backend/src/main/resources/db/migration/V140__create_app_user_table.sql',
  'backend/smart-dairy-backend/src/main/resources/db/migration/V141__migrate_app_user_roles.sql'
)

$lostDir = Join-Path $repo '.git\lost-found\other'
$report = @()
Get-ChildItem -Path $lostDir -File | ForEach-Object {
  $h = $_.Name
  $type = git -C $repo cat-file -t $h
  if ($type -ne 'tree') { return }

  $files = git -C $repo ls-tree -r --name-only $h
  if (-not $files) { return }

  $hits = 0
  $matched = @()
  foreach ($t in $targets) {
    if ($files -contains $t) {
      $hits++
      $matched += $t
    }
  }

  if ($hits -gt 0) {
    $report += [PSCustomObject]@{ tree = $h; hits = $hits; matched = ($matched -join '; ') }
  }
}

$sorted = $report | Sort-Object -Property @{Expression='hits'; Descending=$true}, @{Expression='tree'; Descending=$false}
$sorted | Format-Table -AutoSize | Out-String | Set-Content -Path $out
if ($sorted.Count -gt 0) {
  $best = $sorted[0]
  $bestOut = Join-Path $outDir 'best_tree.txt'
  "BEST_TREE=$($best.tree)" | Set-Content -Path $bestOut
  "BEST_HITS=$($best.hits)" | Add-Content -Path $bestOut
  "BEST_MATCHED=$($best.matched)" | Add-Content -Path $bestOut
}
Write-Output "Wrote $out"
