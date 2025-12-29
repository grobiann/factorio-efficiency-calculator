$ErrorActionPreference = 'Stop'

# Load base Korean translations
$baseKo = Get-Content "locale\ko\items_base.json" -Raw -Encoding UTF8 | ConvertFrom-Json

# Load current generated files
$currentItemsKo = Get-Content "locale\ko\items.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$currentRecipesKo = Get-Content "locale\ko\recipes.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$currentItemsEn = Get-Content "locale\en\items.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$currentRecipesEn = Get-Content "locale\en\recipes.json" -Raw -Encoding UTF8 | ConvertFrom-Json

# Create ordered hashtables
$newItemsKo = [ordered]@{}
$newRecipesKo = [ordered]@{}
$newItemsEn = [ordered]@{}
$newRecipesEn = [ordered]@{}

# Process Korean items - merge base translations with current
foreach ($prop in $currentItemsKo.PSObject.Properties | Sort-Object Name) {
    $key = $prop.Name
    # Check if we have a base translation
    $baseValue = $baseKo.PSObject.Properties | Where-Object { $_.Name -eq $key } | Select-Object -ExpandProperty Value -ErrorAction SilentlyContinue
    if ($baseValue) {
        $newItemsKo[$key] = $baseValue
    } else {
        # Use the key as default (will be translated later)
        $newItemsKo[$key] = $key
    }
}

# For recipes, use same as items for now
foreach ($prop in $currentRecipesKo.PSObject.Properties | Sort-Object Name) {
    $key = $prop.Name
    $baseValue = $baseKo.PSObject.Properties | Where-Object { $_.Name -eq $key } | Select-Object -ExpandProperty Value -ErrorAction SilentlyContinue
    if ($baseValue) {
        $newRecipesKo[$key] = $baseValue
    } else {
        $newRecipesKo[$key] = $key
    }
}

# Process English - convert kebab-case to Title Case
foreach ($prop in $currentItemsEn.PSObject.Properties | Sort-Object Name) {
    $key = $prop.Name
    # Convert kebab-case to Title Case
    $words = $key -split '-'
    $readable = ($words | ForEach-Object { 
        if ($_.Length -gt 0) {
            $_.Substring(0,1).ToUpper() + $_.Substring(1)
        }
    }) -join ' '
    $newItemsEn[$key] = $readable
}

foreach ($prop in $currentRecipesEn.PSObject.Properties | Sort-Object Name) {
    $key = $prop.Name
    $words = $key -split '-'
    $readable = ($words | ForEach-Object { 
        if ($_.Length -gt 0) {
            $_.Substring(0,1).ToUpper() + $_.Substring(1)
        }
    }) -join ' '
    $newRecipesEn[$key] = $readable
}

# Save files with UTF8 encoding
$newItemsKo | ConvertTo-Json -Depth 10 | Out-File "locale\ko\items.json" -Encoding UTF8 -Force
$newRecipesKo | ConvertTo-Json -Depth 10 | Out-File "locale\ko\recipes.json" -Encoding UTF8 -Force
$newItemsEn | ConvertTo-Json -Depth 10 | Out-File "locale\en\items.json" -Encoding UTF8 -Force
$newRecipesEn | ConvertTo-Json -Depth 10 | Out-File "locale\en\recipes.json" -Encoding UTF8 -Force

Write-Host "Locale files updated successfully!"
Write-Host "Korean items: $($newItemsKo.Count)"
Write-Host "Korean recipes: $($newRecipesKo.Count)"
Write-Host "English items: $($newItemsEn.Count)"
Write-Host "English recipes: $($newRecipesEn.Count)"
