# Restore and update locale files with new items/recipes

# Define the original Korean translations that we had
$originalKoItems = @{
    "rocket-part" = "로켓 부품"
    "low-density-structure" = "저밀도 구조물"
    "rocket-control-unit" = "로켓 제어 장치"
    "rocket-fuel" = "로켓 연료"
    "beryllium-plate" = "베릴륨 판"
    "iron-ore" = "철 광석"
    "iron-plate" = "철 판"
    "copper-ore" = "구리 광석"
    "copper-plate" = "구리 판"
    "iron-gear-wheel" = "톱니바퀴"
    "copper-cable" = "구리 전선"
    "electronic-circuit" = "기초 회로"
    "advanced-circuit" = "고급 회로"
    "steel-plate" = "강철 판"
    "slag" = "슬래그"
    "inserter" = "인서터"
    "transport-belt" = "컨베이어 벨트"
    "water" = "물"
    "steam" = "증기"
    "petroleum-gas" = "석유 가스"
    "heavy-oil" = "중유"
    "light-oil" = "경유"
    "sulfuric-acid" = "황산"
    "plastic-bar" = "플라스틱"
    "stone" = "돌"
    "coal" = "석탄"
    "wood" = "나무"
    "solid-fuel" = "고체 연료"
    "explosives" = "폭발물"
    "poison-capsule" = "독 캡슐"
    "artillery-shell" = "포탄"
    "uranium-235" = "우라늄-235"
    "processing-unit" = "처리 유닛"
    "electric-engine-unit" = "전기 엔진 유닛"
    "landfill" = "매립지"
    "iron-stick" = "철 막대"
    "kr-electronic-components" = "전자 부품"
    "kr-silicon" = "실리콘"
    "kr-glass" = "유리"
    "kr-lithium" = "리튬"
    "kr-nitric-acid" = "질산"
    "kr-used-pollution-filter" = "사용된 오염 필터"
    "kr-pollution-filter" = "오염 필터"
    "kr-biomass" = "바이오매스"
    "kr-biter-virus" = "바이터 바이러스"
    "kr-tritium" = "삼중수소"
    "kr-ammonia" = "암모니아"
    "kr-nitrogen" = "질소"
    "kr-oxygen" = "산소"
    "kr-hydrogen" = "수소"
    "kr-matter" = "물질"
    "kr-void" = "공허"
    "kr-enriched-iron" = "농축 철"
    "kr-enriched-copper" = "농축 구리"
    "kr-imersite-powder" = "이머사이트 가루"
    "kr-raw-imersite" = "이머사이트 원석"
    "kr-raw-rare-metals" = "희귀 금속 원석"
    "kr-vc-a" = "바이러스 캡슐 A"
    "kr-vc-b" = "바이러스 캡슐 B"
    "kr-vc-c" = "바이러스 캡슐 C"
    "kr-steel" = "강철"
    "kr-steel-plate" = "강철 판"
    "kr-matter-cube" = "물질 큐브"
    "kr-antimatter" = "반물질"
    "empty-barrel" = "빈 통"
    "sulfur" = "황"
    "battery" = "배터리"
    "flying-robot-frame" = "비행 로봇 프레임"
    "iron-chest" = "철 상자"
    "steel-chest" = "강철 상자"
    "accumulator" = "축전지"
    "solar-panel" = "태양 전지판"
    "nuclear-reactor" = "원자로"
    "heat-pipe" = "열 파이프"
    "heat-exchanger" = "열 교환기"
    "steam-turbine" = "증기 터빈"
    "uranium-fuel-cell" = "우라늄 연료봉"
    "used-up-uranium-fuel-cell" = "사용된 우라늄 연료봉"
    "uranium-238" = "우라늄-238"
}

$originalKoRecipes = @{
    "rocket-part" = "로켓 부품"
    "low-density-structure" = "저밀도 구조물"
    "rocket-control-unit" = "로켓 제어 장치"
    "rocket-fuel" = "로켓 연료"
    "iron-plate" = "철 판"
    "copper-plate" = "구리 판"
    "iron-gear-wheel" = "톱니바퀴"
    "copper-cable" = "구리 전선"
    "electronic-circuit" = "기초 회로"
    "advanced-circuit" = "고급 회로"
    "steel-plate" = "강철 판"
    "processing-unit" = "처리 유닛"
    "electric-engine-unit" = "전기 엔진 유닛"
    "plastic-bar" = "플라스틱"
    "solid-fuel-from-petroleum-gas" = "고체 연료 (석유 가스)"
    "solid-fuel-from-light-oil" = "고체 연료 (경유)"
    "solid-fuel-from-heavy-oil" = "고체 연료 (중유)"
    "uranium-processing" = "우라늄 처리"
    "nuclear-fuel" = "핵연료"
    "nuclear-fuel-reprocessing" = "핵연료 재처리"
}

# Load current files
$currentItemsKo = Get-Content "locale\ko\items.json" -Raw | ConvertFrom-Json
$currentRecipesKo = Get-Content "locale\ko\recipes.json" -Raw | ConvertFrom-Json
$currentItemsEn = Get-Content "locale\en\items.json" -Raw | ConvertFrom-Json
$currentRecipesEn = Get-Content "locale\en\recipes.json" -Raw | ConvertFrom-Json

# Create new hashtables with all items
$newItemsKo = [ordered]@{}
$newRecipesKo = [ordered]@{}
$newItemsEn = [ordered]@{}
$newRecipesEn = [ordered]@{}

# Process Korean items
foreach ($prop in $currentItemsKo.PSObject.Properties) {
    $key = $prop.Name
    if ($originalKoItems.ContainsKey($key)) {
        $newItemsKo[$key] = $originalKoItems[$key]
    } else {
        # Keep existing or use key as default
        $newItemsKo[$key] = $prop.Value
    }
}

# Process Korean recipes
foreach ($prop in $currentRecipesKo.PSObject.Properties) {
    $key = $prop.Name
    if ($originalKoRecipes.ContainsKey($key)) {
        $newRecipesKo[$key] = $originalKoRecipes[$key]
    } else {
        $newRecipesKo[$key] = $prop.Value
    }
}

# Process English items - use readable names
foreach ($prop in $currentItemsEn.PSObject.Properties) {
    $key = $prop.Name
    # Convert kebab-case to Title Case
    $readable = ($key -replace '-', ' ').Split(' ') | ForEach-Object { $_.Substring(0,1).ToUpper() + $_.Substring(1) }
    $newItemsEn[$key] = $readable -join ' '
}

# Process English recipes
foreach ($prop in $currentRecipesEn.PSObject.Properties) {
    $key = $prop.Name
    # Convert kebab-case to Title Case
    $readable = ($key -replace '-', ' ').Split(' ') | ForEach-Object { $_.Substring(0,1).ToUpper() + $_.Substring(1) }
    $newRecipesEn[$key] = $readable -join ' '
}

# Save updated files
$newItemsKo | ConvertTo-Json -Depth 10 | Set-Content "locale\ko\items.json" -Encoding UTF8
$newRecipesKo | ConvertTo-Json -Depth 10 | Set-Content "locale\ko\recipes.json" -Encoding UTF8
$newItemsEn | ConvertTo-Json -Depth 10 | Set-Content "locale\en\items.json" -Encoding UTF8
$newRecipesEn | ConvertTo-Json -Depth 10 | Set-Content "locale\en\recipes.json" -Encoding UTF8

Write-Host "Locale files updated!"
Write-Host "Korean items: $($newItemsKo.Count)"
Write-Host "Korean recipes: $($newRecipesKo.Count)"
Write-Host "English items: $($newItemsEn.Count)"
Write-Host "English recipes: $($newRecipesEn.Count)"
