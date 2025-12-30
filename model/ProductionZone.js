/**
 * ProductionZone - 여러 레시피를 묶어서 하나의 레시피처럼 작동하는 생산 구역
 */
export class ProductionZone {
  constructor(data = {}) {
    this.id = data.id || `zone_${Date.now()}`;
    this.name = data.name || "새 생산구역";
    this.recipes = data.recipes || []; // Array of { recipeId, multiplier, type: 'recipe'|'zone' }
  }

  /**
   * 특정 레시피 또는 생산구역 객체 가져오기
   */
  getRecipeOrZone(entry, allRecipes, allZones) {
    if (entry.type === 'zone') {
      return allZones.get(entry.recipeId);
    }
    return allRecipes[entry.recipeId];
  }

  /**
   * 구역 내 모든 레시피의 입력/출력을 계산하여 통합
   * @param {Object} allRecipes - Map of recipeId -> Recipe
   * @param {Map} allZones - Map of zoneId -> ProductionZone
   * @returns {Object} { ingredients: [...], results: [...] }
   */
  calculateIO(allRecipes, allZones = new Map()) {
    const allInputs = {}; // item -> total amount needed
    const allOutputs = {}; // item -> total amount produced
    
    // 각 레시피/생산구역 처리
    for (const recipeEntry of this.recipes) {
      const multiplier = recipeEntry.multiplier || 1;
      let ingredientsMap, resultsMap;
      
      if (recipeEntry.type === 'zone') {
        // 생산구역인 경우
        const zone = allZones.get(recipeEntry.recipeId);
        if (!zone) continue;
        
        const zoneIO = zone.calculateIO(allRecipes, allZones);
        
        // 생산구역의 입출력을 맵으로 변환
        ingredientsMap = {};
        for (const ing of zoneIO.ingredients) {
          ingredientsMap[ing.name] = ing.amount;
        }
        
        resultsMap = {};
        for (const res of zoneIO.results) {
          resultsMap[res.name] = res.amount;
        }
      } else {
        // 일반 레시피인 경우
        const recipe = allRecipes[recipeEntry.recipeId];
        if (!recipe) continue;
        
        ingredientsMap = recipe.getIngredientsMap();
        resultsMap = recipe.getResultsMap();
      }
      
      // 입력 누적
      for (const [itemId, amount] of Object.entries(ingredientsMap)) {
        allInputs[itemId] = (allInputs[itemId] || 0) + (amount * multiplier);
      }
      
      // 출력 누적
      for (const [itemId, amount] of Object.entries(resultsMap)) {
        allOutputs[itemId] = (allOutputs[itemId] || 0) + (amount * multiplier);
      }
    }
    
    // 내부 소비 제거: 출력이 입력으로도 사용되는 경우
    const netInputs = {};
    const netOutputs = {};
    
    for (const [itemId, inputAmount] of Object.entries(allInputs)) {
      const outputAmount = allOutputs[itemId] || 0;
      const netInput = inputAmount - outputAmount;
      
      if (netInput > 0) {
        netInputs[itemId] = netInput;
      }
    }
    
    for (const [itemId, outputAmount] of Object.entries(allOutputs)) {
      const inputAmount = allInputs[itemId] || 0;
      const netOutput = outputAmount - inputAmount;
      
      if (netOutput > 0) {
        netOutputs[itemId] = netOutput;
      }
    }
    
    // 배열 형식으로 변환
    const ingredients = Object.entries(netInputs).map(([name, amount]) => ({
      type: 'item',
      name,
      amount
    }));
    
    const results = Object.entries(netOutputs).map(([name, amount]) => ({
      type: 'item',
      name,
      amount
    }));
    
    return { ingredients, results };
  }

  /**
   * 생산구역을 Recipe처럼 사용할 수 있도록 변환
   * @param {Object} allRecipes - Map of recipeId -> Recipe
   * @param {Map} allZones - Map of zoneId -> ProductionZone
   * @returns {Object} Recipe-compatible object
   */
  toRecipeFormat(allRecipes, allZones = new Map()) {
    const io = this.calculateIO(allRecipes, allZones);
    
    return {
      id: this.id,
      name: this.name,
      type: 'production-zone',
      energy_required: 1,
      ingredients: io.ingredients,
      results: io.results,
      _isZone: true,
      _zoneData: this
    };
  }

  /**
   * 레시피 또는 생산구역 추가
   */
  addRecipe(recipeId, multiplier = 1, type = 'recipe') {
    this.recipes.push({ recipeId, multiplier, type });
  }

  /**
   * 레시피 제거
   */
  removeRecipe(index) {
    this.recipes.splice(index, 1);
  }

  /**
   * 레시피 업데이트
   */
  updateRecipe(index, updates) {
    if (this.recipes[index]) {
      Object.assign(this.recipes[index], updates);
    }
  }

  /**
   * 레시피 이동 (위로)
   */
  moveRecipeUp(index) {
    if (index > 0 && index < this.recipes.length) {
      const temp = this.recipes[index];
      this.recipes[index] = this.recipes[index - 1];
      this.recipes[index - 1] = temp;
    }
  }

  /**
   * 레시피 이동 (아래로)
   */
  moveRecipeDown(index) {
    if (index >= 0 && index < this.recipes.length - 1) {
      const temp = this.recipes[index];
      this.recipes[index] = this.recipes[index + 1];
      this.recipes[index + 1] = temp;
    }
  }

  /**
   * 레시피 복사
   */
  copyRecipe(index) {
    if (this.recipes[index]) {
      const copy = { ...this.recipes[index] };
      this.recipes.splice(index + 1, 0, copy);
    }
  }

  /**
   * JSON 직렬화
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      recipes: this.recipes
    };
  }

  /**
   * JSON에서 복원
   */
  static fromJSON(data) {
    return new ProductionZone(data);
  }
}
