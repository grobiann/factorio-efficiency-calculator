/**
 * RecipeGroup - 여러 레시피를 묶어서 하나의 레시피처럼 작동하는 레시피 그룹
 */
export class RecipeGroup {
  constructor(data = {}) {
    this.id = data.id || `group_${Date.now()}`;
    this.name = data.name || "새 레시피 그룹";
    this.recipes = data.recipes || []; // Array of { recipeId, multiplier, type: 'recipe'|'group' }
  }

  /**
   * 특정 레시피 또는 레시피 그룹 객체 가져오기
   */
  getRecipeOrGroup(entry, allRecipes, allGroups) {
    if (entry.type === 'group') {
      return allGroups.get(entry.recipeId);
    }
    return allRecipes[entry.recipeId];
  }

  /**
   * 그룹 내 모든 레시피의 입력/출력을 계산하여 통합
   * @param {Object} allRecipes - Map of recipeId -> Recipe
   * @param {Map} allGroups - Map of groupId -> RecipeGroup
   * @returns {Object} { ingredients: [...], results: [...] }
   */
  calculateIO(allRecipes, allGroups = new Map()) {
    const allInputs = {}; // item -> total amount needed
    const allOutputs = {}; // item -> total amount produced
    
    // 각 레시피/레시피 그룹 처리
    for (const recipeEntry of this.recipes) {
      const multiplier = recipeEntry.multiplier || 1;
      let ingredientsMap, resultsMap;
      
      if (recipeEntry.type === 'group') {
        // 레시피 그룹인 경우
        const group = allGroups.get(recipeEntry.recipeId);
        if (!group) continue;
        
        const groupIO = group.calculateIO(allRecipes, allGroups);
        
        // 레시피 그룹의 입출력을 맵으로 변환
        ingredientsMap = {};
        for (const ing of groupIO.ingredients) {
          ingredientsMap[ing.name] = ing.amount;
        }
        
        resultsMap = {};
        for (const res of groupIO.results) {
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
   * 레시피 그룹을 Recipe처럼 사용할 수 있도록 변환
   * @param {Object} allRecipes - Map of recipeId -> Recipe
   * @param {Map} allGroups - Map of groupId -> RecipeGroup
   * @returns {Object} Recipe-compatible object
   */
  toRecipeFormat(allRecipes, allGroups = new Map()) {
    const io = this.calculateIO(allRecipes, allGroups);
    
    return {
      id: this.id,
      name: this.name,
      type: 'recipe-group',
      energy_required: 1,
      ingredients: io.ingredients,
      results: io.results,
      _isGroup: true,
      _groupData: this
    };
  }

  /**
   * 레시피 또는 레시피 그룹 추가
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
    return new RecipeGroup(data);
  }
}
