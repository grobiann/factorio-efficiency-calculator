# Extract item and recipe names from Factorio data files
$itemsMap = @{}
$recipesMap = @{}

# Load Factorio 2.0 items
Write-Host "Loading Factorio 2.0 items..."
$itemData = Get-Content "data\factorio-2.0\item.json" -Raw | ConvertFrom-Json
foreach ($item in $itemData) {
    if ($item.name) {
        $itemsMap[$item.name] = $item.name
    }
}

# Load Factorio 2.0 fluids
Write-Host "Loading Factorio 2.0 fluids..."
if (Test-Path "data\factorio-2.0\fluid.json") {
    $fluidData = Get-Content "data\factorio-2.0\fluid.json" -Raw | ConvertFrom-Json
    foreach ($fluid in $fluidData) {
        if ($fluid.name) {
            $itemsMap[$fluid.name] = $fluid.name
        }
    }
}

# Load Factorio 2.0 recipes
Write-Host "Loading Factorio 2.0 recipes..."
$recipeData = Get-Content "data\factorio-2.0\recipe.json" -Raw | ConvertFrom-Json
foreach ($recipe in $recipeData) {
    if ($recipe.name) {
        $recipesMap[$recipe.name] = $recipe.name
    }
}

# Load Krastorio2 items
Write-Host "Loading Krastorio2 items..."
if (Test-Path "data\krastorio2\items\items.json") {
    $kr2ItemData = Get-Content "data\krastorio2\items\items.json" -Raw | ConvertFrom-Json
    foreach ($item in $kr2ItemData) {
        if ($item.name) {
            $itemsMap[$item.name] = $item.name
        }
    }
}

# Load Krastorio2 fluids
Write-Host "Loading Krastorio2 fluids..."
if (Test-Path "data\krastorio2\fluids.json") {
    $kr2FluidData = Get-Content "data\krastorio2\fluids.json" -Raw | ConvertFrom-Json
    foreach ($fluid in $kr2FluidData) {
        if ($fluid.name) {
            $itemsMap[$fluid.name] = $fluid.name
        }
    }
}

# Load Krastorio2 recipes from all recipe files
Write-Host "Loading Krastorio2 recipes..."
$kr2RecipeFiles = Get-ChildItem "data\krastorio2\recipes" -Filter "*.json"
foreach ($file in $kr2RecipeFiles) {
    $kr2RecipeData = Get-Content $file.FullName -Raw | ConvertFrom-Json
    foreach ($recipe in $kr2RecipeData) {
        if ($recipe.name) {
            $recipesMap[$recipe.name] = $recipe.name
        }
    }
}

# Load existing locale files
$existingItemsKo = @{}
$existingRecipesKo = @{}
$existingItemsEn = @{}
$existingRecipesEn = @{}

if (Test-Path "locale\ko\items.json") {
    $koItems = Get-Content "locale\ko\items.json" -Raw | ConvertFrom-Json
    foreach ($prop in $koItems.PSObject.Properties) {
        $existingItemsKo[$prop.Name] = $prop.Value
    }
}
if (Test-Path "locale\ko\recipes.json") {
    $koRecipes = Get-Content "locale\ko\recipes.json" -Raw | ConvertFrom-Json
    foreach ($prop in $koRecipes.PSObject.Properties) {
        $existingRecipesKo[$prop.Name] = $prop.Value
    }
}
if (Test-Path "locale\en\items.json") {
    $enItems = Get-Content "locale\en\items.json" -Raw | ConvertFrom-Json
    foreach ($prop in $enItems.PSObject.Properties) {
        $existingItemsEn[$prop.Name] = $prop.Value
    }
}
if (Test-Path "locale\en\recipes.json") {
    $enRecipes = Get-Content "locale\en\recipes.json" -Raw | ConvertFrom-Json
    foreach ($prop in $enRecipes.PSObject.Properties) {
        $existingRecipesEn[$prop.Name] = $prop.Value
    }
}

# Merge with existing data
foreach ($key in $itemsMap.Keys) {
    if (-not $existingItemsKo.ContainsKey($key)) {
        $existingItemsKo[$key] = $key
    }
    if (-not $existingItemsEn.ContainsKey($key)) {
        $existingItemsEn[$key] = $key
    }
}

foreach ($key in $recipesMap.Keys) {
    if (-not $existingRecipesKo.ContainsKey($key)) {
        $existingRecipesKo[$key] = $key
    }
    if (-not $existingRecipesEn.ContainsKey($key)) {
        $existingRecipesEn[$key] = $key
    }
}

# Sort keys
$sortedItemsKo = [ordered]@{}
$existingItemsKo.Keys | Sort-Object | ForEach-Object { $sortedItemsKo[$_] = $existingItemsKo[$_] }

$sortedRecipesKo = [ordered]@{}
$existingRecipesKo.Keys | Sort-Object | ForEach-Object { $sortedRecipesKo[$_] = $existingRecipesKo[$_] }

$sortedItemsEn = [ordered]@{}
$existingItemsEn.Keys | Sort-Object | ForEach-Object { $sortedItemsEn[$_] = $existingItemsEn[$_] }

$sortedRecipesEn = [ordered]@{}
$existingRecipesEn.Keys | Sort-Object | ForEach-Object { $sortedRecipesEn[$_] = $existingRecipesEn[$_] }

# Save to files
Write-Host "Saving locale files..."
$sortedItemsKo | ConvertTo-Json -Depth 10 | Set-Content "locale\ko\items.json" -Encoding UTF8
$sortedRecipesKo | ConvertTo-Json -Depth 10 | Set-Content "locale\ko\recipes.json" -Encoding UTF8
$sortedItemsEn | ConvertTo-Json -Depth 10 | Set-Content "locale\en\items.json" -Encoding UTF8
$sortedRecipesEn | ConvertTo-Json -Depth 10 | Set-Content "locale\en\recipes.json" -Encoding UTF8

Write-Host ""
Write-Host "Complete!"
Write-Host "Total items: $($sortedItemsKo.Count)"
Write-Host "Total recipes: $($sortedRecipesKo.Count)"
