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
    this.loadFromStorage();
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
    this.recipes.delete(id);
    this.saveToStorage();
  }

  /**
   * localStorage에 저장
   */
  saveToStorage() {
    const data = Array.from(this.recipes.values()).map(r => r.toJSON());
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
      console.error('Failed to load custom recipes:', e);
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
