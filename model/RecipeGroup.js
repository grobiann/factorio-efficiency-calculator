/**
 * RecipeGroup - 여러 레시피를 묶어서 하나의 레시피처럼 작동하는 레시피 그룹
 */
export class RecipeGroup {
  constructor(data = {}) {
    this.id = data.id || `group_${Date.now()}`;
    this.name = data.name || "새 레시피 그룹";
    this.recipes = data.recipes || []; // Array of { recipeId, multiplier, type: 'recipe'|'group', forceMultiplier: bool }
  }

  /**
   * 특정 레시피 또는 레시피 그룹 객체 가져오기
   */
  getRecipeOrGroup(entry, allRecipes, allGroups, customRecipeManager = null) {
    if (entry.type === 'group') {
      return allGroups.get(entry.recipeId);
    }
    
    // 커스텀 레시피 먼저 확인
    if (customRecipeManager && typeof customRecipeManager.getRecipe === 'function') {
      const customRecipe = customRecipeManager.getRecipe(entry.recipeId);
      if (customRecipe) return customRecipe;
    }
    
    // 일반 레시피 확인
    return allRecipes[entry.recipeId];
  }

  /**
   * 그룹 내 모든 레시피의 입력/출력을 계산하여 통합
   * @param {Object} allRecipes - Map of recipeId -> Recipe
   * @param {Map} allGroups - Map of groupId -> RecipeGroup
   * @param {Set} visited - 이미 방문한 그룹 ID Set (순환 참조 방지)
   * @param {Object} customRecipeManager - 커스텀 레시피 매니저 (선택사항)
   * @param {Object} factoryConfigView - 공장 설정 뷰 (productivity 계산용)
   * @param {Object} loadedData - 로드된 데이터 (기계/모듈 정보)
   * @returns {Object} { ingredients: [...], results: [...] }
   */
  calculateIO(allRecipes, allGroups = new Map(), visited = new Set(), customRecipeManager = null, factoryConfigView = null, loadedData = null) {
    // 순환 참조 감지 (현재 호출 스택에 이미 있는 경우)
    if (visited.has(this.id)) {
      return { ingredients: [], results: [] };
    }
    
    // 현재 그룹을 방문 목록에 추가 (호출 스택 추적용)
    const newVisited = new Set(visited);
    newVisited.add(this.id);
    
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
        
        const groupIO = group.calculateIO(allRecipes, allGroups, newVisited, customRecipeManager, factoryConfigView, loadedData);
        
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
        
        // productivity 보너스 계산 및 적용 (allow_productivity가 true인 경우만)
        if (recipe.allow_productivity === true && factoryConfigView && loadedData) {
          const productivityBonus = this._calculateProductivityBonus(recipe, factoryConfigView, loadedData);
          if (productivityBonus > 0) {
            const bonusMultiplier = 1 + productivityBonus;
            // results에만 적용
            const bonusedResultsMap = {};
            for (const [itemId, amount] of Object.entries(resultsMap)) {
              bonusedResultsMap[itemId] = amount * bonusMultiplier;
            }
            resultsMap = bonusedResultsMap;
          }
        }
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
    
    // 배열 형식으로 변환 (0.1 미만은 제외 - 소수점 오차 제거)
    const ingredients = Object.entries(netInputs)
      .filter(([name, amount]) => amount >= 0.1)
      .map(([name, amount]) => ({
        type: 'item',
        name,
        amount
      }));
    
    const results = Object.entries(netOutputs)
      .filter(([name, amount]) => amount >= 0.1)
      .map(([name, amount]) => ({
        type: 'item',
        name,
        amount
      }));
    
    return { ingredients, results };
  }

  /**
   * 자동 배율 조정 (forceMultiplier가 false인 레시피들)
   * 이 메서드는 calculateIO와 별도로 명시적으로 호출되어야 함
   */
  autoAdjustMultipliers(allRecipes, allGroups, customRecipeManager, factoryConfigView, loadedData) {
    const visited = new Set();
    // 각 레시피의 첫 번째 생산품 기준으로 필요한 배율 계산
    for (let i = 0; i < this.recipes.length; i++) {
      const recipeEntry = this.recipes[i];
      
      // 첫 번째 레시피는 항상 manual 모드
      if (i === 0) {
        recipeEntry.forceMultiplier = true;
        continue;
      }
      
      // forceMultiplier가 true면 스킵
      if (recipeEntry.forceMultiplier === true) {
        continue;
      }
      
      const recipe = this.getRecipeOrGroup(recipeEntry, allRecipes, allGroups, customRecipeManager);
      if (!recipe) continue;
      
      // 레시피의 첫 번째 생산품 가져오기
      let firstProduct = null;
      let productAmount = 0;
      
      if (recipeEntry.type === 'group') {
        const groupIO = recipe.calculateIO(allRecipes, allGroups, visited, customRecipeManager, factoryConfigView, loadedData);
        if (groupIO.results && groupIO.results.length > 0) {
          firstProduct = groupIO.results[0].name;
          productAmount = groupIO.results[0].amount || 1;
        }
      } else {
        const results = recipe.results;
        if (results && results.length > 0) {
          firstProduct = results[0].name;
          productAmount = this._getExpectedAmount(results[0]);
          
          // productivity 보너스 적용
          if (recipe.allow_productivity === true && factoryConfigView && loadedData) {
            const productivityBonus = this._calculateProductivityBonus(recipe, factoryConfigView, loadedData);
            if (productivityBonus > 0) {
              productAmount *= (1 + productivityBonus);
            }
          }
        }
      }
      
      if (!firstProduct || productAmount <= 0) continue;
      
      // 그룹 내 다른 레시피들의 입출력을 계산하여 순수 필요량 계산 (입력 - 출력)
      let totalInput = 0;  // 다른 레시피들이 소비하는 양
      let totalOutput = 0; // 다른 레시피들이 생산하는 양
      for (let j = 0; j < this.recipes.length; j++) {
        if (i === j) continue; // 자기 자신은 제외
        
        const otherEntry = this.recipes[j];
        const otherRecipe = this.getRecipeOrGroup(otherEntry, allRecipes, allGroups, customRecipeManager);
        if (!otherRecipe) continue;
        
        const otherMultiplier = otherEntry.multiplier || 1;
        
        if (otherEntry.type === 'group') {
          const otherIO = otherRecipe.calculateIO(allRecipes, allGroups, visited, customRecipeManager, factoryConfigView, loadedData);

          // 입력 계산
          for (const ingredient of otherIO.ingredients || []) {
            if (ingredient.name === firstProduct) {
              totalInput += (ingredient.amount || 0) * otherMultiplier;
            }
          }
          
          // 출력 계산
          for (const result of otherIO.results || []) {
            if (result.name === firstProduct) {
              totalOutput += (result.amount || 0) * otherMultiplier;
            }
          }
        } else {
          // 입력 계산
          const ingredients = otherRecipe.ingredients || [];
          for (const ingredient of ingredients) {
            if (ingredient.name === firstProduct) {
              totalInput += this._getExpectedAmount(ingredient) * otherMultiplier;
            }
          }
          
          // 출력 계산
          const results = otherRecipe.results || [];
          for (const result of results) {
            if (result.name === firstProduct) {
              let resultAmount = this._getExpectedAmount(result);
              
              // productivity 보너스 적용
              if (otherRecipe.allow_productivity === true && factoryConfigView && loadedData) {
                const productivityBonus = this._calculateProductivityBonus(otherRecipe, factoryConfigView, loadedData);
                if (productivityBonus > 0) {
                  resultAmount *= (1 + productivityBonus);
                }
              }
              
              totalOutput += resultAmount * otherMultiplier;
            }
          }
        }
      }
      
      // 순수 필요량 계산 (입력 - 출력)
      const netNeed = totalInput - totalOutput;

      // 필요한 배율 계산 및 적용
      if (netNeed > 0 && productAmount > 0) {
        const requiredMultiplier = netNeed / productAmount;
        recipeEntry.multiplier = Math.max(0.01, requiredMultiplier); // 최소 0.01
      } else if (netNeed <= 0) {
        // 필요량이 0 이하면 최소 배율로 설정
        recipeEntry.multiplier = 0.01;
      }
    }
  }

  /**
   * 예상 수량 가져오기 (헬퍼 메서드)
   */
  _getExpectedAmount(item) {
    if (item.amount) return item.amount;
    if (item.amount_min && item.amount_max) {
      return (item.amount_min + item.amount_max) / 2;
    }
    if (item.probability && item.amount_min && item.amount_max) {
      return ((item.amount_min + item.amount_max) / 2) * item.probability;
    }
    return 1;
  }

  /**
   * 레시피에 대한 productivity 보너스 계산
   */
  _calculateProductivityBonus(recipe, factoryConfigView, loadedData) {
    if (!factoryConfigView.selectedModule || !recipe || !loadedData) {
      return 0;
    }

    // 레시피에 맞는 기계 찾기
    const recipeCategory = recipe.category || 'crafting';
    const machines = loadedData.entities?.filter(entity => {
      if (entity.type !== 'assembling-machine') return false;
      if (!Array.isArray(entity.crafting_categories) || entity.crafting_categories.length === 0) return false;
      return entity.crafting_categories.includes(recipeCategory);
    });

    if (!machines || machines.length === 0) {
      return 0;
    }

    // 선호 기계 찾기
    let machine = null;
    if (factoryConfigView.getPreferredMachineForRecipe) {
      machine = factoryConfigView.getPreferredMachineForRecipe(recipe, machines);
    } else {
      machine = machines[0];
    }

    if (!machine || !machine.module_slots) {
      return 0;
    }

    // 모듈 데이터 찾기
    const moduleData = loadedData.modules?.find(m => m.id === factoryConfigView.selectedModule);
    if (!moduleData || !moduleData.effect || !moduleData.effect.productivity) {
      return 0;
    }

    // productivity 효과 * 모듈 슬롯 수
    return moduleData.effect.productivity * machine.module_slots;
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
    // 같은 레시피가 이미 있는지 확인
    const existingIndex = this.recipes.findIndex(r => r.recipeId === recipeId && r.type === type);
    
    if (existingIndex >= 0) {
      // 같은 레시피가 있으면 multiplier를 합산
      this.recipes[existingIndex].multiplier += multiplier;
      
      // 배수 자동 계산
      if (allRecipes && allGroups) {
        this.calculateMultiplier(existingIndex, allRecipes, allGroups);
      }
    } else {
      // 새 레시피 추가
      this.recipes.push({ recipeId, multiplier, type });
      
      // 추가 후 배수 자동 계산
      if (allRecipes && allGroups) {
        this.calculateMultiplier(this.recipes.length - 1, allRecipes, allGroups);
      }
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
