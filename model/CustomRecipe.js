/**
 * CustomRecipe - 사용자 정의 레시피
 */
export class CustomRecipe {
  constructor(data = {}) {
    this.id = data.id || `custom_${Date.now()}`;
    this.name = data.name || "New Custom Recipe";
    this.type = "custom-recipe";
    this.energy_required = data.energy_required || 1;
    this.ingredients = data.ingredients || [];
    this.results = data.results || [];
    this.category = data.category || "crafting";
  }

  /**
   * 재료 추가
   * @param {string} itemId - 아이템 ID
   * @param {number} amount - 수량
   * @param {string} itemType - 아이템 타입
   * @throws {Error} 잘못된 파라미터인 경우
   */
  addIngredient(itemId, amount, itemType = 'item') {
    if (!itemId || typeof itemId !== 'string') {
      throw new Error('Invalid itemId: must be a non-empty string');
    }
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid amount: must be a positive number');
    }
    
    this.ingredients.push({
      type: itemType,
      name: itemId,
      amount: amount
    });
  }

  /**
   * 재료 제거
   * @param {number} index - 제거할 인덱스
   */
  removeIngredient(index) {
    if (index >= 0 && index < this.ingredients.length) {
      this.ingredients.splice(index, 1);
    }
  }

  /**
   * 재료 업데이트
   * @param {number} index - 업데이트할 인덱스
   * @param {Object} updates - 업데이트할 필드
   */
  updateIngredient(index, updates) {
    if (index >= 0 && index < this.ingredients.length) {
      Object.assign(this.ingredients[index], updates);
    }
  }

  /**
   * 결과물 추가
   * @param {string} itemId - 아이템 ID
   * @param {number} amount - 수량
   * @param {string} itemType - 아이템 타입
   * @throws {Error} 잘못된 파라미터인 경우
   */
  addResult(itemId, amount, itemType = 'item') {
    if (!itemId || typeof itemId !== 'string') {
      throw new Error('Invalid itemId: must be a non-empty string');
    }
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid amount: must be a positive number');
    }
    
    this.results.push({
      type: itemType,
      name: itemId,
      amount: amount
    });
  }

  /**
   * 결과물 제거
   * @param {number} index - 제거할 인덱스
   */
  removeResult(index) {
    if (index >= 0 && index < this.results.length) {
      this.results.splice(index, 1);
    }
  }

  /**
   * 결과물 업데이트
   * @param {number} index - 업데이트할 인덱스
   * @param {Object} updates - 업데이트할 필드
   */
  updateResult(index, updates) {
    if (index >= 0 && index < this.results.length) {
      Object.assign(this.results[index], updates);
    }
  }

  /**
   * 재료를 맵 형태로 반환 { itemId: amount }
   */
  getIngredientsMap() {
    if (!Array.isArray(this.ingredients) || this.ingredients.length === 0) return {};
    const map = {};
    for (const entry of this.ingredients) {
      if (!entry || !entry.name) continue;
      const amount = entry.amount || 0;
      if (amount <= 0) continue;
      map[entry.name] = (map[entry.name] || 0) + amount;
    }
    return map;
  }

  /**
   * 결과물을 맵 형태로 반환 { itemId: amount }
   */
  getResultsMap() {
    if (!Array.isArray(this.results) || this.results.length === 0) return {};
    const map = {};
    for (const entry of this.results) {
      if (!entry || !entry.name) continue;
      const amount = entry.amount || 0;
      if (amount <= 0) continue;
      map[entry.name] = (map[entry.name] || 0) + amount;
    }
    return map;
  }

  /**
   * JSON 직렬화
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      energy_required: this.energy_required,
      ingredients: this.ingredients,
      results: this.results,
      category: this.category
    };
  }

  /**
   * JSON에서 복원
   */
  static fromJSON(data) {
    return new CustomRecipe(data);
  }
}

/**
 * CustomRecipeManager - 커스텀 레시피 관리
 */
export class CustomRecipeManager {
  constructor() {
    this.recipes = new Map();
    this.fixedRecipeIds = new Set(); // 고정 레시피 ID 추적
    this.settings = this.loadSettings(); // 설정 로드
    this.loadFromStorage();
    this.initializeFixedRecipes(); // 고정 레시피 초기화
  }

  /**
   * 설정 로드
   */
  loadSettings() {
    try {
      const data = localStorage.getItem('fixedRecipeSettings');
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      // 로드 실패 시 기본값 사용
    }
    // 기본 설정
    return {
      cargoRocketPartLossRate: 40, // 화물로켓부품 손실률 (0~100%)
      rocketFuelConsumption: 50000, // 로켓 발사 연료소모량 (0~999k)
      supplyViaCargoRocket: false // 연료 및 화물로켓 부품을 화물로켓을 통해 공급
    };
  }

  /**
   * 설정 저장
   */
  saveSettings() {
    try {
      localStorage.setItem('fixedRecipeSettings', JSON.stringify(this.settings));
    } catch (e) {
      // 저장 실패 시 무시
    }
  }

  /**
   * 설정 업데이트
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    // 고정 레시피 재초기화
    this.initializeFixedRecipes();
  }

  /**
   * 고정 레시피 초기화
   */
  initializeFixedRecipes() {
    // 우주 화물 로켓 발사 레시피
    const spaceCargoRocketLaunchId = 'space_cargo_rocket_launch';
    
    // 입력: 화물로켓부품 100개 고정
    let cargoRocketPartsInput = 100;
    let rocketFuel = this.settings.rocketFuelConsumption ?? 50000;
    
    // 출력: 손실률을 반영 (손실률 40%면 100개 입력 -> 60개 출력)
    const lossRate = this.settings.cargoRocketPartLossRate ?? 40;
    const cargoRocketPartsOutput = Math.floor(cargoRocketPartsInput * (100 - lossRate) / 100);
    
    // 화물로켓을 통해 공급하는 경우 입력 수량 #배
    const supplyViaCargoRocket = this.settings.supplyViaCargoRocket ?? false;
    if (supplyViaCargoRocket) {
      let rocketFuelSlots = (rocketFuel / 100) / 10; // 1슬롯당 10연료
      let cargoRocketPartsSlots = (cargoRocketPartsInput - cargoRocketPartsOutput) / 5; // 1슬롯당 5개 부품
      let supplyMultiplier = 500 / (500 - rocketFuelSlots - cargoRocketPartsSlots);
      cargoRocketPartsInput = cargoRocketPartsInput * supplyMultiplier;
      rocketFuel = rocketFuel * supplyMultiplier;
    }
    
    const rocketLaunchRecipe = new CustomRecipe({
      id: spaceCargoRocketLaunchId,
      name: '우주 화물 로켓 발사',
      energy_required: 1,
      ingredients: [
        { type: 'item', name: 'rocket-fuel', amount: rocketFuel },
        { type: 'item', name: 'se-cargo-rocket-section', amount: cargoRocketPartsInput }
      ],
      results: [
        { type: 'item', name: 'se-cargo-rocket-section', amount: cargoRocketPartsOutput }
      ],
      category: 'rocket-launch'
    });
    this.recipes.set(spaceCargoRocketLaunchId, rocketLaunchRecipe);
    this.fixedRecipeIds.add(spaceCargoRocketLaunchId);
  }

  /**
   * 레시피 추가
   */
  addRecipe(recipe) {
    this.recipes.set(recipe.id, recipe);
    this.saveToStorage();
  }

  /**
   * 레시피 가져오기
   */
  getRecipe(id) {
    return this.recipes.get(id);
  }

  /**
   * 모든 레시피 가져오기
   */
  getAllRecipes() {
    return Array.from(this.recipes.values());
  }

  /**
   * 레시피 업데이트
   */
  updateRecipe(id, updates) {
    const recipe = this.recipes.get(id);
    if (recipe) {
      Object.assign(recipe, updates);
      this.saveToStorage();
    }
  }

  /**
   * 레시피 삭제
   */
  deleteRecipe(id) {
    // 고정 레시피는 삭제 불가
    if (this.fixedRecipeIds.has(id)) {
      return false;
    }
    this.recipes.delete(id);
    this.saveToStorage();
    return true;
  }

  /**
   * 레시피가 고정 레시피인지 확인
   */
  isFixedRecipe(id) {
    return this.fixedRecipeIds.has(id);
  }

  /**
   * localStorage에 저장
   */
  saveToStorage() {
    // 고정 레시피는 저장하지 않음 (항상 초기화에서 생성됨)
    const data = Array.from(this.recipes.values())
      .filter(r => !this.fixedRecipeIds.has(r.id))
      .map(r => r.toJSON());
    localStorage.setItem('customRecipes', JSON.stringify(data));
  }

  /**
   * localStorage에서 로드
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem('customRecipes');
      if (data) {
        const recipes = JSON.parse(data);
        recipes.forEach(recipeData => {
          const recipe = CustomRecipe.fromJSON(recipeData);
          this.recipes.set(recipe.id, recipe);
        });
      }
    } catch (e) {
      // 로드 실패 시 무시
    }
  }

  /**
   * 커스텀 레시피를 Recipe 객체로 변환하여 recipesByProduct에 통합
   */
  integrateIntoRecipeMap(recipesByProduct) {
    for (const customRecipe of this.recipes.values()) {
      // 각 결과물에 대해 recipesByProduct에 추가
      const Recipe = window.Recipe || class { constructor(data) { Object.assign(this, data); } };
      const recipeObj = new Recipe(customRecipe.toJSON());
      
      for (const result of customRecipe.results) {
        const productId = result.name;
        if (!recipesByProduct[productId]) {
          recipesByProduct[productId] = [];
        }
        recipesByProduct[productId].push(recipeObj);
      }
    }
  }
}
