/**
 * Translations for UI text
 */
export const translations = {
  ko: {
    // Page title
    pageTitle: "Factorio 효율 계산기",
    
    // Tab navigation
    tabCompare: "비교",
    tabRecipeGroup: "레시피 그룹",
    tabCustomRecipe: "레시피",
    tabFactoryConfig: "공장 설정",
    
    // Settings panel
    settingsLanguage: "언어 / Language",
    settingsDataManagement: "데이터 관리",
    settingsExportData: "데이터 내보내기 (JSON)",
    settingsImportData: "데이터 가져오기 (JSON)",
    settingsDatasetTitle: "데이터 소스 선택",
    settingsDatasetDescription: "사용할 모드/버전 데이터를 선택하세요:",
    settingsDatasetApply: "데이터 적용",
    settingsDatasetLoading: "로딩 중...",
    settingsDatasetApplied: "적용 완료!",
    settingsDatasetError: "오류 발생",
    settingsClearDataTitle: "데이터 초기화",
    settingsClearDataDescription: "모든 레시피 그룹, 커스텀 레시피, 비교 데이터를 삭제합니다. 이 작업은 되돌릴 수 없습니다.",
    settingsClearDataButton: "모든 저장 데이터 제거",
    settingsClearDataConfirm: "정말로 모든 저장된 데이터를 삭제하시겠습니까?\n\n삭제될 데이터:\n- 모든 레시피 그룹\n- 모든 커스텀 레시피\n- 모든 비교 그룹\n\n이 작업은 되돌릴 수 없습니다.",
    settingsClearDataSuccess: "삭제 완료!",
    
    // Compare view
    compareNewGroup: "새 비교그룹 추가",
    compareNoGroups: "비교그룹이 없습니다.",
    compareNoGroupsHint: "왼쪽의 '새 비교그룹 추가' 버튼을 클릭하여 시작하세요.",
    compareSelectGroup: "레시피 그룹을 선택하세요.",
    compareGroupName: "비교 그룹 이름",
    compareDeleteGroup: "그룹 삭제",
    compareRecipeGroup: "레시피 그룹",
    compareOutput: "출력",
    compareInput: "입력",
    compareAddItem: "항목 추가",
    compareSelectItem: "항목 선택",
    compareClose: "닫기",
    compareDefaultGroupName: "비교 그룹",
    
    // Recipe group view
    recipeGroupNew: "새 레시피 그룹 추가",
    recipeGroupNoGroups: "레시피 그룹이 없습니다.",
    recipeGroupSelect: "레시피 그룹을 선택하세요.",
    recipeGroupName: "레시피 그룹 이름",
    recipeGroupDelete: "그룹 삭제",
    recipeGroupAddRecipe: "레시피 추가",
    recipeGroupRecipe: "레시피",
    recipeGroupMultiplier: "배율",
    recipeGroupMode: "모드",
    recipeGroupModeManual: "Manual",
    recipeGroupModeAuto: "Auto",
    recipeGroupInputs: "입력",
    recipeGroupOutputs: "출력",
    recipeGroupDefaultName: "새 레시피 그룹",
    
    // Custom recipe view
    customRecipeNew: "새 레시피 추가",
    customRecipeNoRecipes: "커스텀 레시피가 없습니다.",
    customRecipeName: "레시피 이름",
    customRecipeTime: "제작 시간 (초)",
    customRecipeIngredients: "재료",
    customRecipeResults: "결과물",
    customRecipeAddIngredient: "재료 추가",
    customRecipeAddResult: "결과물 추가",
    customRecipeDelete: "레시피 삭제",
    customRecipeItemSelect: "아이템 선택",
    customRecipeAmount: "수량",
    customRecipeDefaultName: "새 커스텀 레시피",
    
    // Factory config view
    factoryConfigTitle: "공장 설정",
    factoryConfigDescription: "선호하는 기계와 모듈 설정을 관리합니다. 레시피 그룹에서 이 설정을 우선적으로 사용합니다.",
    factoryConfigPreferredMachines: "Preferred Machines",
    factoryConfigAddMachine: "기계 추가",
    factoryConfigNoMachines: "설정된 선호 기계가 없습니다.",
    factoryConfigMachineSelect: "기계 선택",
    factoryConfigPreferredModule: "Preferred Module",
    factoryConfigDeleteMachine: "삭제",
    
    // Common buttons
    btnAddRecipeGroup: "새 레시피 그룹 추가",
    btnAddCustomRecipe: "새 레시피 추가",
    btnAddCompareGroup: "새 비교그룹 추가",
    btnSave: "저장",
    btnCancel: "취소",
    btnDelete: "삭제",
    btnAdd: "추가",
    btnClose: "닫기",
    btnSelect: "선택",
    
    // Common labels
    lblSearch: "검색",
    lblCategory: "카테고리",
    
    // Common units
    unitSeconds: "초",
    
    // Messages
    msgImportSuccess: "데이터를 성공적으로 가져왔습니다. 페이지를 새로고침합니다.",
    msgImportError: "데이터 가져오기 실패: ",
    msgDeleteConfirm: "정말 삭제하시겠습니까?",
    msgNoRecipeGroups: "레시피 그룹이 없습니다.",
    msgNoCustomRecipes: "커스텀 레시피가 없습니다.",
    msgSelectRecipe: "레시피를 선택하세요.",
    msgNoIngredients: "재료가 없습니다.",
    msgNoResults: "결과물이 없습니다.",
    
    // Tooltips
    tooltipGitHub: "GitHub",
    tooltipSettings: "설정",
    
    // Recipe group detail view
    rgDetailOutputs: "출력",
    rgDetailInputs: "입력",
    rgDetailNone: "없음",
    rgDetailRecipeList: "레시피 목록",
    rgDetailRecipe: "레시피",
    rgDetailMultiplier: "배율",
    rgDetailMode: "모드",
    rgDetailManual: "Manual",
    rgDetailAuto: "Auto",
    rgDetailAddRecipe: "레시피 추가",
    rgDetailDeleteGroup: "레시피 그룹 삭제",
    rgDetailSelectRecipe: "레시피 선택",
    rgDetailSelectGroup: "레시피 그룹을 선택하세요.",
    rgDetailGroupName: "레시피 그룹 이름",
    
    // Custom recipe detail view
    crDetailName: "레시피 이름",
    crDetailTime: "제작 시간",
    crDetailIngredients: "재료",
    crDetailResults: "결과물",
    crDetailAddIngredient: "재료 추가",
    crDetailAddResult: "결과물 추가",
    crDetailDelete: "레시피 삭제",
    crDetailSelectItem: "아이템 선택",
    crDetailAmount: "수량",
    crDetailClose: "닫기",
    crDetailCargoRocket: "화물로켓 설정",
    crDetailCargoLossRate: "화물로켓부품 손실률 (%)",
    crDetailCargoLossHint: "0~100% (손실률이 높을수록 더 많은 부품이 필요합니다)",
    crDetailRocketFuel: "로켓 발사 연료소모량",
    crDetailRocketFuelHint: "0~999k (예: 50k = 50,000개)",
    crDetailSupplyViaRocket: "연료 및 화물로켓 부품을 화물로켓을 통해 공급",
    
    // Factory config detail view
    fcDetailTitle: "공장 설정",
    fcDetailDescription: "선호하는 기계와 모듈 설정을 관리합니다. 레시피 그룹에서 이 설정을 우선적으로 사용합니다.",
    fcDetailPreferredMachines: "Preferred Machines",
    fcDetailAddMachine: "기계 추가",
    fcDetailNoMachines: "설정된 선호 기계가 없습니다.",
    fcDetailPreferredModule: "Preferred Module",
    fcDetailDelete: "삭제",
    fcDetailMachineSelect: "기계 선택",
    
    // Compare detail view
    cmpDetailGroupName: "비교 그룹 이름",
    cmpDetailDeleteGroup: "그룹 삭제",
    cmpDetailRecipeGroup: "레시피 그룹",
    cmpDetailOutput: "출력",
    cmpDetailInput: "입력",
    cmpDetailAddItem: "항목 추가",
    cmpDetailSelectItem: "항목 선택",
    cmpDetailClose: "닫기",
    cmpDetailNoGroups: "비교그룹이 없습니다.",
    cmpDetailNoGroupsHint: "왼쪽의 '새 비교그룹 추가' 버튼을 클릭하여 시작하세요."
  },
  
  en: {
    // Page title
    pageTitle: "Factorio Efficiency Calculator",
    
    // Tab navigation
    tabCompare: "Compare",
    tabRecipeGroup: "Recipe Groups",
    tabCustomRecipe: "Recipes",
    tabFactoryConfig: "Factory Config",
    
    // Settings panel
    settingsLanguage: "Language / 언어",
    settingsDataManagement: "Data Management",
    settingsExportData: "Export Data (JSON)",
    settingsImportData: "Import Data (JSON)",
    settingsDatasetTitle: "Select Data Source",
    settingsDatasetDescription: "Choose which mod/version data to use:",
    settingsDatasetApply: "Apply Data",
    settingsDatasetLoading: "Loading...",
    settingsDatasetApplied: "Applied!",
    settingsDatasetError: "Error occurred",
    settingsClearDataTitle: "Reset Data",
    settingsClearDataDescription: "Delete all recipe groups, custom recipes, and comparison data. This action cannot be undone.",
    settingsClearDataButton: "Clear All Saved Data",
    settingsClearDataConfirm: "Are you sure you want to delete all saved data?\n\nData to be deleted:\n- All recipe groups\n- All custom recipes\n- All compare groups\n\nThis action cannot be undone.",
    settingsClearDataSuccess: "Deleted!",
    
    // Compare view
    compareNewGroup: "Add New Compare Group",
    compareNoGroups: "No compare groups.",
    compareNoGroupsHint: "Click 'Add New Compare Group' button on the left to start.",
    compareSelectGroup: "Select a recipe group.",
    compareGroupName: "Compare Group Name",
    compareDeleteGroup: "Delete Group",
    compareRecipeGroup: "Recipe Group",
    compareOutput: "Output",
    compareInput: "Input",
    compareAddItem: "Add Item",
    compareSelectItem: "Select Item",
    compareClose: "Close",
    compareDefaultGroupName: "Compare Group",
    
    // Recipe group view
    recipeGroupNew: "Add New Recipe Group",
    recipeGroupNoGroups: "No recipe groups.",
    recipeGroupSelect: "Select a recipe group.",
    recipeGroupName: "Recipe Group Name",
    recipeGroupDelete: "Delete Group",
    recipeGroupAddRecipe: "Add Recipe",
    recipeGroupRecipe: "Recipe",
    recipeGroupMultiplier: "Multiplier",
    recipeGroupMode: "Mode",
    recipeGroupModeManual: "Manual",
    recipeGroupModeAuto: "Auto",
    recipeGroupInputs: "Inputs",
    recipeGroupOutputs: "Outputs",
    recipeGroupDefaultName: "New Recipe Group",
    
    // Custom recipe view
    customRecipeNew: "Add New Recipe",
    customRecipeNoRecipes: "No custom recipes.",
    customRecipeName: "Recipe Name",
    customRecipeTime: "Crafting Time (seconds)",
    customRecipeIngredients: "Ingredients",
    customRecipeResults: "Results",
    customRecipeAddIngredient: "Add Ingredient",
    customRecipeAddResult: "Add Result",
    customRecipeDelete: "Delete Recipe",
    customRecipeItemSelect: "Select Item",
    customRecipeAmount: "Amount",
    customRecipeDefaultName: "New Custom Recipe",
    
    // Factory config view
    factoryConfigTitle: "Factory Configuration",
    factoryConfigDescription: "Manage preferred machines and module settings. These settings will be prioritized in recipe groups.",
    factoryConfigPreferredMachines: "Preferred Machines",
    factoryConfigAddMachine: "Add Machine",
    factoryConfigNoMachines: "No preferred machines configured.",
    factoryConfigMachineSelect: "Select Machine",
    factoryConfigPreferredModule: "Preferred Module",
    factoryConfigDeleteMachine: "Delete",
    
    // Common buttons
    btnAddRecipeGroup: "Add New Recipe Group",
    btnAddCustomRecipe: "Add New Recipe",
    btnAddCompareGroup: "Add New Compare Group",
    btnSave: "Save",
    btnCancel: "Cancel",
    btnDelete: "Delete",
    btnAdd: "Add",
    btnClose: "Close",
    btnSelect: "Select",
    
    // Common labels
    lblSearch: "Search",
    lblCategory: "Category",
    
    // Common units
    unitSeconds: "sec",
    
    // Messages
    msgImportSuccess: "Data imported successfully. Reloading page.",
    msgImportError: "Failed to import data: ",
    msgDeleteConfirm: "Are you sure you want to delete?",
    msgNoRecipeGroups: "No recipe groups.",
    msgNoCustomRecipes: "No custom recipes.",
    msgSelectRecipe: "Please select a recipe.",
    msgNoIngredients: "No ingredients.",
    msgNoResults: "No results.",
    
    // Tooltips
    tooltipGitHub: "GitHub",
    tooltipSettings: "Settings",
    
    // Recipe group detail view
    rgDetailOutputs: "Outputs",
    rgDetailInputs: "Inputs",
    rgDetailNone: "None",
    rgDetailRecipeList: "Recipe List",
    rgDetailRecipe: "Recipe",
    rgDetailMultiplier: "Multiplier",
    rgDetailMode: "Mode",
    rgDetailManual: "Manual",
    rgDetailAuto: "Auto",
    rgDetailAddRecipe: "Add Recipe",
    rgDetailDeleteGroup: "Delete Recipe Group",
    rgDetailSelectRecipe: "Select Recipe",
    rgDetailSelectGroup: "Select a recipe group.",
    rgDetailGroupName: "Recipe Group Name",
    
    // Custom recipe detail view
    crDetailName: "Recipe Name",
    crDetailTime: "Crafting Time",
    crDetailIngredients: "Ingredients",
    crDetailResults: "Results",
    crDetailAddIngredient: "Add Ingredient",
    crDetailAddResult: "Add Result",
    crDetailDelete: "Delete Recipe",
    crDetailSelectItem: "Select Item",
    crDetailAmount: "Amount",
    crDetailClose: "Close",
    crDetailCargoRocket: "Cargo Rocket Settings",
    crDetailCargoLossRate: "Cargo Rocket Part Loss Rate (%)",
    crDetailCargoLossHint: "0~100% (higher loss rate requires more parts)",
    crDetailRocketFuel: "Rocket Launch Fuel Consumption",
    crDetailRocketFuelHint: "0~999k (e.g., 50k = 50,000 items)",
    crDetailSupplyViaRocket: "Supply fuel and cargo rocket parts via cargo rocket",
    
    // Factory config detail view
    fcDetailTitle: "Factory Configuration",
    fcDetailDescription: "Manage preferred machines and module settings. These settings will be prioritized in recipe groups.",
    fcDetailPreferredMachines: "Preferred Machines",
    fcDetailAddMachine: "Add Machine",
    fcDetailNoMachines: "No preferred machines configured.",
    fcDetailPreferredModule: "Preferred Module",
    fcDetailDelete: "Delete",
    fcDetailMachineSelect: "Select Machine",
    
    // Compare detail view
    cmpDetailGroupName: "Compare Group Name",
    cmpDetailDeleteGroup: "Delete Group",
    cmpDetailRecipeGroup: "Recipe Group",
    cmpDetailOutput: "Output",
    cmpDetailInput: "Input",
    cmpDetailAddItem: "Add Item",
    cmpDetailSelectItem: "Select Item",
    cmpDetailClose: "Close",
    cmpDetailNoGroups: "No compare groups.",
    cmpDetailNoGroupsHint: "Click 'Add New Compare Group' button on the left to start."
  }
};

/**
 * Get translation for current language
 */
export function getTranslation(key, lang = null) {
  const currentLang = lang || localStorage.getItem('uiLanguage') || 'ko';
  return translations[currentLang]?.[key] || translations['ko'][key] || key;
}

/**
 * Update all UI text with current language
 */
export function updateUILanguage(lang) {
  const t = (key) => getTranslation(key, lang);
  
  // Update page title
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) pageTitle.textContent = t('pageTitle');
  
  // Update tab buttons
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    const tabName = tab.dataset.tab;
    if (tabName === 'compare') tab.textContent = t('tabCompare');
    else if (tabName === 'recipe-group') tab.textContent = t('tabRecipeGroup');
    else if (tabName === 'custom-recipe') tab.textContent = t('tabCustomRecipe');
    else if (tabName === 'factory-config') tab.textContent = t('tabFactoryConfig');
  });
  
  // Update settings panel
  const settingsPanel = document.getElementById('settingsPanel');
  if (settingsPanel) {
    const labels = settingsPanel.querySelectorAll('label');
    labels.forEach(label => {
      if (label.getAttribute('for') === 'langSelect') {
        label.textContent = t('settingsLanguage');
      }
    });
    
    const h3 = settingsPanel.querySelector('h3');
    if (h3) h3.textContent = t('settingsDataManagement');
    
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) exportBtn.textContent = t('settingsExportData');
    
    const importBtn = document.getElementById('importDataBtn');
    if (importBtn) importBtn.textContent = t('settingsImportData');
  }
  
  // Update tooltips
  const githubBtn = document.querySelector('.github-btn');
  if (githubBtn) githubBtn.title = t('tooltipGitHub');
  
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) settingsBtn.title = t('tooltipSettings');
  
  // Store current language
  localStorage.setItem('uiLanguage', lang);
}
