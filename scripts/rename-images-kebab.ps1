# Renames files and subfolders under /images to kebab-case (remove &, lowercase, punctuation -> hyphen).
# Skips *.md. Preserves real extensions.
# Writes rename-images-map.json: original relative path -> final path (from images/ root, forward slashes).
param(
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
  [string]$MapOut = (Join-Path $PSScriptRoot "rename-images-map.json")
)

$ErrorActionPreference = "Stop"
$imagesRoot = Join-Path $RepoRoot "images"
if (-not (Test-Path -LiteralPath $imagesRoot)) {
  throw "images folder not found: $imagesRoot"
}

function Normalize-Base([string]$base) {
  $s = $base -replace '&', ''
  $s = $s.ToLowerInvariant()
  $s = $s -replace '[^a-z0-9]+', '-'
  $s = $s.Trim('-')
  if ([string]::IsNullOrWhiteSpace($s)) { return "item" }
  return $s
}

function Get-UniqueFileName([string]$base, [string]$ext, [System.Collections.Generic.HashSet[string]]$used) {
  $b = $base
  $name = "$b$ext"
  $i = 2
  while ($used.Contains($name)) {
    $name = "$b-$i$ext"
    $i++
  }
  [void]$used.Add($name)
  return $name
}

function Get-UniqueFolderName([string]$base, [System.Collections.Generic.HashSet[string]]$taken) {
  $b = $base
  $name = $b
  $i = 2
  while ($taken.Contains($name)) {
    $name = "$b-$i"
    $i++
  }
  [void]$taken.Add($name)
  return $name
}

function Update-MapValuesForDirRename([hashtable]$map, [string]$oldPrefix, [string]$newPrefix) {
  $op = $oldPrefix.Replace('\', '/').TrimEnd('/') + '/'
  $np = $newPrefix.Replace('\', '/').TrimEnd('/') + '/'
  foreach ($k in @($map.Keys)) {
    $v = $map[$k]
    if ($v.StartsWith($op, [StringComparison]::OrdinalIgnoreCase)) {
      $map[$k] = $np + $v.Substring($op.Length)
    }
  }
}

function To-Rel([string]$full) {
  $full.Substring($imagesRoot.Length).TrimStart('\', '/').Replace('\', '/')
}

$allFiles = @(Get-ChildItem -LiteralPath $imagesRoot -Recurse -File |
  Where-Object { $_.Extension -notmatch '^\.md$' -and $_.Name -ne "README.md" })

$pathMap = @{}
foreach ($f in $allFiles) {
  $rel = To-Rel $f.FullName
  $pathMap[$rel] = $rel
}

# --- Phase 1: file basenames ---
$byDir = $allFiles | Group-Object -Property { $_.DirectoryName }
foreach ($grp in $byDir) {
  $used = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
  foreach ($f in ($grp.Group | Sort-Object Name)) {
    $ext = $f.Extension.ToLowerInvariant()
    $oldBase = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
    $nb = Normalize-Base $oldBase
    $newFileName = Get-UniqueFileName $nb $ext $used
    $oldRel = To-Rel $f.FullName
    $dirRel = To-Rel $f.DirectoryName
    $newRel = if ($dirRel) { "$dirRel/$newFileName" } else { $newFileName }
    if ($oldRel -ceq $newRel) { continue }
    $pathMap[$oldRel] = $newRel
    if ($f.Name.Equals($newFileName, [StringComparison]::OrdinalIgnoreCase) -and $f.Name -cne $newFileName) {
      $tmp = $newFileName + '.__rencase__'
      Rename-Item -LiteralPath $f.FullName -NewName $tmp
      Rename-Item -LiteralPath (Join-Path $f.DirectoryName $tmp) -NewName $newFileName
    } else {
      Rename-Item -LiteralPath $f.FullName -NewName $newFileName
    }
  }
}

# --- Phase 2: directories deepest-first ---
$dirs = @(Get-ChildItem -LiteralPath $imagesRoot -Recurse -Directory | Sort-Object { $_.FullName.Length } -Descending)

foreach ($dir in $dirs) {
  $parentPath = $dir.Parent.FullName
  $taken = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
  Get-ChildItem -LiteralPath $parentPath -Directory | ForEach-Object { [void]$taken.Add($_.Name) }
  [void]$taken.Remove($dir.Name)

  $leaf = Normalize-Base $dir.Name
  $candidate = Get-UniqueFolderName $leaf $taken
  if ($dir.Name -ceq $candidate) { continue }

  $oldPrefixFull = $dir.FullName
  $oldPrefixRel = (To-Rel $oldPrefixFull) + "/"
  # Windows: case-only renames need a temp name (NTFS is case-insensitive).
  if ($dir.Name.Equals($candidate, [StringComparison]::OrdinalIgnoreCase)) {
    $tmp = $candidate + '.__rencase__'
    Rename-Item -LiteralPath $dir.FullName -NewName $tmp
    $tmpFull = Join-Path $parentPath $tmp
    Rename-Item -LiteralPath $tmpFull -NewName $candidate
  } else {
    Rename-Item -LiteralPath $dir.FullName -NewName $candidate
  }
  $newPrefixFull = Join-Path $parentPath $candidate
  $newPrefixRel = (To-Rel $newPrefixFull) + "/"
  Update-MapValuesForDirRename $pathMap $oldPrefixRel $newPrefixRel
}

$out = [ordered]@{}
foreach ($k in ($pathMap.Keys | Sort-Object { $_.Length } -Descending)) {
  $v = $pathMap[$k]
  if ($null -ne $v -and -not [string]::Equals($k, $v, [StringComparison]::Ordinal)) {
    $out[$k.Replace('\', '/')] = $v.Replace('\', '/')
  }
}
$out | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $MapOut -Encoding UTF8
Write-Host "Wrote $($out.Count) mapping entries to $MapOut"
