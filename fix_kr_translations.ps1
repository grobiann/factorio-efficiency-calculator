$jsonPath = "locale\ko\items.json"
$content = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json

# Translations mapping
$translations = @{
    "kr-biofuel" = "바이오 연료"
    "kr-biomass" = "바이오매스"
    "kr-biomethanol" = "바이오메탄올"
    "kr-charged-antimatter-fuel-cell" = "충전된 반물질 연료 셀"
    "kr-charged-matter-stabilizer" = "충전된 물질 안정기"
    "kr-chlorine" = "염소"
    "kr-coke" = "코크스"
    "kr-dirty-water" = "오염수"
    "kr-dt-fuel-cell" = "DT 연료 셀"
    "kr-electronic-components" = "전자 부품"
    "kr-empty-antimatter-fuel-cell" = "빈 반물질 연료 셀"
    "kr-empty-dt-fuel-cell" = "빈 DT 연료 셀"
    "kr-energy-control-unit" = "에너지 제어 장치"
    "kr-enriched-copper" = "농축 구리"
    "kr-enriched-iron" = "농축 철"
    "kr-enriched-rare-metals" = "농축 희귀 금속"
    "kr-fertilizer" = "비료"
    "kr-fuel" = "연료"
    "kr-glass" = "유리"
    "kr-gps-satellite" = "GPS 위성"
    "kr-heavy-water" = "중수"
    "kr-hydrogen" = "수소"
    "kr-hydrogen-chloride" = "염화수소"
    "kr-imersite-crystal" = "이머사이트 결정"
    "kr-imersite-powder" = "이머사이트 가루"
    "kr-imersium-beam" = "이머시움 빔"
    "kr-imersium-gear-wheel" = "이머시움 톱니바퀴"
    "kr-imersium-plate" = "이머시움 판"
    "kr-inserter-parts" = "인서터 부품"
    "kr-iron-beam" = "철 빔"
    "kr-lithium" = "리튬"
    "kr-lithium-chloride" = "염화 리튬"
    "kr-lithium-sulfur-battery" = "리튬 황 배터리"
    "kr-matter" = "물질"
    "kr-matter-cube" = "물질 큐브"
    "kr-matter-stabilizer" = "물질 안정기"
    "kr-mineral-water" = "광천수"
    "kr-nitric-acid" = "질산"
    "kr-nitrogen" = "질소"
    "kr-note-1" = "노트 1"
    "kr-oxygen" = "산소"
    "kr-pollution-filter" = "오염 필터"
    "kr-quartz" = "석영"
    "kr-rare-metals" = "희귀 금속"
    "kr-sand" = "모래"
    "kr-silicon" = "실리콘"
    "kr-steel-beam" = "강철 빔"
    "kr-steel-gear-wheel" = "강철 톱니바퀴"
    "kr-teleportation-gps-module" = "순간이동 GPS 모듈"
    "kr-tritium" = "삼중수소"
}

# Update values
$newContent = [ordered]@{}
foreach ($prop in $content.PSObject.Properties | Sort-Object Name) {
    $key = $prop.Name
    $value = $prop.Value
    
    # If value equals key and we have a translation, use it
    if ($value -eq $key -and $translations.ContainsKey($key)) {
        $newContent[$key] = $translations[$key]
    } else {
        $newContent[$key] = $value
    }
}

# Save
$newContent | ConvertTo-Json -Depth 10 | Out-File $jsonPath -Encoding UTF8 -Force
Write-Host "Updated $($translations.Count) translations"
