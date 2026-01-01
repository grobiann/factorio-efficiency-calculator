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
   * @param {Set} visited - 이미 방문한 그룹 ID Set (순환 참조 방지)
   * @param {Object} customRecipeManager - 커스텀 레시피 매니저 (선택사항)
   * @returns {Object} { ingredients: [...], results: [...] }
   */
  calculateIO(allRecipes, allGroups = new Map(), visited = new Set(), customRecipeManager = null) {
    // 순환 참조 감지
    if (visited.has(this.id)) {
      console.warn(`순환 참조 감지: ${this.id}`);
      return { ingredients: [], results: [] };
    }
    
    // 현재 그룹을 방문 목록에 추가
    visited.add(this.id);
    
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
        
        const groupIO = group.calculateIO(allRecipes, allGroups, visited, customRecipeManager);
        
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
        // 일반 레시피 또는 커스텀 레시피인 경우
        let recipe = null;
        
        // 커스텀 레시피 먼저 확인
        if (customRecipeManager && typeof customRecipeManager.getRecipe === 'function') {
          recipe = customRecipeManager.getRecipe(recipeEntry.recipeId);
        }
        
        // 일반 레시피 확인
        if (!recipe) {
          recipe = allRecipes[recipeEntry.recipeId];
        }
        
        if (!recipe) continue;
        
        ingredientsMap = recipe.getIngredientsMap();
        resultsMap = recipe.getResultsMap();
      }

      console.log(`[RecipeGroupView.renderGroupDetail] Processing ${recipeEntry.type} '${recipeEntry.recipeId}' with multiplier ${multiplier}`);
      console.log(`[RecipeGroupView.renderGroupDetail] Processing`, ingredientsMap, resultsMap);
      
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
   * @param {string} recipeId - 레시피 ID
   * @param {number} multiplier - 초기 배수 (기본값 1)
   * @param {string} type - 타입 ('recipe' 또는 'group')
   * @param {Object} allRecipes - 모든 레시피 (배수 자동 계산용, 선택사항)
   * @param {Map} allGroups - 모든 그룹 (배수 자동 계산용, 선택사항)
   */
  addRecipe(recipeId, multiplier = 1, type = 'recipe', allRecipes = null, allGroups = null) {
    this.recipes.push({ recipeId, multiplier, type });
    
    // 추가 후 배수 자동 계산
    if (allRecipes && allGroups) {
      this.calculateMultiplier(this.recipes.length - 1, allRecipes, allGroups);
    }
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
   * 특정 레시피의 배수 자동 계산
   * @param {number} index - 레시피 인덱스
   * @param {Object} allRecipes - 모든 레시피 맵
   * @param {Map} allGroups - 모든 그룹 맵
   */
  calculateMultiplier(index, allRecipes, allGroups) {
    if (index < 0 || index >= this.recipes.length) return;
    
    const recipeEntry = this.recipes[index];
    
    // 현재 레시피의 메인 결과물 찾기
    let mainProduct = null;
    let mainProductAmount = 0;
    
    if (recipeEntry.type === 'group') {
      const group = allGroups.get(recipeEntry.recipeId);
      if (!group) return;
      const groupIO = group.calculateIO(allRecipes, allGroups);
      if (groupIO.results.length > 0) {
        mainProduct = groupIO.results[0].name;
        mainProductAmount = groupIO.results[0].amount;
      }
    } else {
      const recipe = allRecipes[recipeEntry.recipeId];
      if (!recipe) return;
      const results = recipe.results || [];
      if (results.length > 0) {
        mainProduct = results[0].name;
        mainProductAmount = results[0].amount;
      }
    }
    
    if (!mainProduct || mainProductAmount === 0) return;
    
    // 상위 레시피들에서 필요한 이 제품의 총량 계산
    let totalNeeded = 0;
    
    for (let i = 0; i < index; i++) {
      const upperRecipeEntry = this.recipes[i];
      const upperMultiplier = upperRecipeEntry.multiplier || 1;
      
      if (upperRecipeEntry.type === 'group') {
        const group = allGroups.get(upperRecipeEntry.recipeId);
        if (!group) continue;
        const groupIO = group.calculateIO(allRecipes, allGroups);
        for (const ingredient of groupIO.ingredients) {
          if (ingredient.name === mainProduct) {
            totalNeeded += ingredient.amount * upperMultiplier;
          }
        }
      } else {
        const recipe = allRecipes[upperRecipeEntry.recipeId];
        if (!recipe) continue;
        const ingredients = recipe.ingredients || [];
        for (const ingredient of ingredients) {
          if (ingredient.name === mainProduct) {
            totalNeeded += ingredient.amount * upperMultiplier;
          }
        }
      }
    }
    
    // 필요량이 있으면 배수 계산
    if (totalNeeded > 0) {
      const newMultiplier = totalNeeded / mainProductAmount;
      this.recipes[index].multiplier = Math.ceil(newMultiplier * 100) / 100; // 소수점 2자리로 반올림
    }
  }

  /**
   * 모든 레시피의 배수 재계산
   * @param {Object} allRecipes - 모든 레시피 맵
   * @param {Map} allGroups - 모든 그룹 맵
   */
  recalculateAllMultipliers(allRecipes, allGroups) {
    for (let i = 0; i < this.recipes.length; i++) {
      this.calculateMultiplier(i, allRecipes, allGroups);
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
