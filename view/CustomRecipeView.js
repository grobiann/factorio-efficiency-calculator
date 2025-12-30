import { CustomRecipe, CustomRecipeManager } from "../model/CustomRecipe.js";

/**
 * CustomRecipeView - 커스텀 레시피 관리 UI
 */
export class CustomRecipeView {
  constructor(loadedData, locale) {
    this.manager = new CustomRecipeManager();
    this.loadedData = loadedData;
    this.locale = locale;
    this.selectedRecipeId = null;
  }

  /**
   * 아이템 아이콘 생성
   */
  createItemIcon(itemId, amount = 1) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: inline-flex; flex-direction: column; align-items: center; gap: 2px;';
    
    const container = document.createElement('div');
    container.style.cssText = 'width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #f0f0f0; border: 1px solid #ccc; border-radius: 2px; overflow: hidden;';
    
    const icon = document.createElement('img');
    icon.alt = this.locale.itemName(itemId);
    icon.title = this.locale.itemName(itemId);
    
    // 아이콘 정보 가져오기
    const iconInfo = this.getIconInfo(itemId);
    if (iconInfo && iconInfo.path) {
      icon.src = iconInfo.path;
    } else {
      icon.src = 'data/default-icon.svg';
      icon.style.cssText = 'width: 32px; height: 32px; object-fit: contain;';
    }
    
    container.appendChild(icon);
    wrapper.appendChild(container);
    
    // 수량 표시
    const amountLabel = document.createElement('div');
    amountLabel.style.cssText = 'font-size: 11px; color: #666; font-weight: 500;';
    amountLabel.textContent = amount;
    wrapper.appendChild(amountLabel);
    
    return wrapper;
  }

  /**
   * 아이콘 정보 가져오기
   */
  getIconInfo(itemId) {
    if (!this.loadedData || !this.loadedData.entries) return null;
    
    const searchTypes = ['item', 'module', 'fluid'];
    
    for (const searchType of searchTypes) {
      const entry = this.loadedData.entries.find(e => e.name === itemId && e.type === searchType);
      if (entry && entry.icon) {
        return {
          path: entry.icon,
          size: entry.icon_size || 64,
          mipmaps: entry.mipmap_count || 0
        };
      }
    }
    
    const anyEntry = this.loadedData.entries.find(e => e.name === itemId);
    if (anyEntry) {
      return {
        path: anyEntry.icon || null,
        size: anyEntry.icon_size || 64,
        mipmaps: anyEntry.mipmap_count || 0
      };
    }
    
    return null;
  }

  /**
   * 뷰 렌더링
   */
  render(container) {
    const recipeManagement = container.querySelector('.recipe-management');
    if (!recipeManagement) return;

    // 첫 번째 레시피 자동 선택
    const recipes = this.manager.getAllRecipes();
    if (!this.selectedRecipeId && recipes.length > 0) {
      this.selectedRecipeId = recipes[0].id;
    }

    let html = '<div class="recipe-management-grid">';
    
    // 왼쪽: 레시피 목록 사이드바
    html += '<div class="sidebar-container">';
    html += '<button id="addCustomRecipeBtn" class="btn-primary">새 레시피 추가</button>';
    html += '<div class="list-container">';
    
    if (recipes.length === 0) {
      html += '<p style="color: #999; text-align: center; padding: 20px;">커스텀 레시피가 없습니다.</p>';
    } else {
      for (const recipe of recipes) {
        const isSelected = recipe.id === this.selectedRecipeId;
        const results = recipe.results || [];
        
        // 결과물 아이콘 HTML 생성
        let iconsHtml = '';
        const maxIcons = 1;
        const displayResults = results.slice(0, maxIcons);
        
        for (const result of displayResults) {
          const iconInfo = this.getIconInfo(result.name);
          if (iconInfo && iconInfo.path) {
            iconsHtml += `<img src="${iconInfo.path}" alt="${this.escapeHtml(this.locale.itemName(result.name))}" class="list-item-icon" />`;
          }
        }
        
        if (results.length > maxIcons) {
          iconsHtml += `<span class="list-item-more">+${results.length - maxIcons}</span>`;
        }
        
        html += `
          <div class="list-item ${isSelected ? 'selected' : ''}" data-recipe-id="${recipe.id}">
            <span class="list-item-name">${this.escapeHtml(recipe.name)}</span>
            <div class="list-item-icons">${iconsHtml}</div>
          </div>
        `;
      }
    }
    
    html += '</div></div>';

    // 오른쪽: 상세 정보 영역
    html += '<div class="recipe-detail-container">';
    if (this.selectedRecipeId) {
      const selectedRecipe = this.manager.getRecipe(this.selectedRecipeId);
      if (selectedRecipe) {
        html += this.renderRecipeDetail(selectedRecipe);
      } else {
        html += '<p style="color: #999; text-align: center; padding: 40px;">레시피를 선택하세요.</p>';
      }
    } else {
      html += '<p style="color: #999; text-align: center; padding: 40px;">레시피를 선택하세요.</p>';
    }
    html += '</div>';
    
    html += '</div>';

    recipeManagement.innerHTML = html;

    // 이벤트 리스너 등록
    this.attachEventListeners(container);
  }

  /**
   * HTML 이스케이프
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 레시피 상세 정보 렌더링
   */
  renderRecipeDetail(recipe) {
    let html = '<div class="recipe-detail">';
    
    // 이름 편집 및 삭제 버튼
    html += `
      <div class="recipe-name-edit">
        <input type="text" class="recipe-name-input" value="${this.escapeHtml(recipe.name)}" placeholder="레시피 이름">
        <button class="btn-danger recipe-delete-btn">레시피 삭제</button>
      </div>
    `;

    // 기본 정보
    html += '<div class="recipe-basic-info">';
    html += `
      <label>
        제작 시간:
        <input type="number" class="recipe-energy-input" value="${recipe.energy_required || 1}" step="0.1" min="0.1">
        초
      </label>
      <label>
        카테고리:
        <input type="text" class="recipe-category-input" value="${this.escapeHtml(recipe.category || 'crafting')}" placeholder="crafting">
      </label>
    `;
    html += '</div>';

    // 재료 섹션
    html += '<div class="recipe-section">';
    html += '<h3>재료 (Ingredients)</h3>';
    html += '<div class="recipe-items-list" id="ingredientsList">';
    
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach((ing, index) => {
        html += this.renderItemRow(ing, index, 'ingredient');
      });
    } else {
      html += '<p style="color: #999;">재료가 없습니다.</p>';
    }
    
    html += '</div>';
    html += '<button class="btn-secondary add-ingredient-btn">재료 추가</button>';
    html += '</div>';

    // 결과물 섹션
    html += '<div class="recipe-section">';
    html += '<h3>결과물 (Results)</h3>';
    html += '<div class="recipe-items-list" id="resultsList">';
    
    if (recipe.results && recipe.results.length > 0) {
      recipe.results.forEach((res, index) => {
        html += this.renderItemRow(res, index, 'result');
      });
    } else {
      html += '<p style="color: #999;">결과물이 없습니다.</p>';
    }
    
    html += '</div>';
    html += '<button class="btn-secondary add-result-btn">결과물 추가</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  /**
   * 아이템 행 렌더링
   */
  renderItemRow(item, index, type) {
    const typeLabel = type === 'ingredient' ? '재료' : '결과물';
    return `
      <div class="recipe-item-row" data-index="${index}" data-type="${type}">
        <input type="text" class="item-name-input" value="${this.escapeHtml(item.name)}" placeholder="아이템 ID">
        <input type="number" class="item-amount-input" value="${item.amount}" step="0.1" min="0.1">
        <select class="item-type-select">
          <option value="item" ${item.type === 'item' ? 'selected' : ''}>Item</option>
          <option value="fluid" ${item.type === 'fluid' ? 'selected' : ''}>Fluid</option>
        </select>
        <button class="btn-danger remove-item-btn">✕</button>
      </div>
    `;
  }

  /**
   * 이벤트 리스너 연결
   */
  attachEventListeners(container) {
    // 레시피 목록 아이템 클릭
    const listItems = container.querySelectorAll('.list-item');
    listItems.forEach(item => {
      item.addEventListener('click', () => {
        this.selectedRecipeId = item.dataset.recipeId;
        this.render(container);
      });
    });

    // 새 레시피 추가 버튼
    const addBtn = container.querySelector('#addCustomRecipeBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addRecipe());
    }

    // 레시피 이름 변경
    const nameInput = container.querySelector('.recipe-name-input');
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        const recipe = this.manager.getRecipe(this.selectedRecipeId);
        if (recipe) {
          recipe.name = nameInput.value;
          this.manager.saveToStorage();
          this.updateSidebar(container);
        }
      });
    }

    // 제작 시간 변경
    const energyInput = container.querySelector('.recipe-energy-input');
    if (energyInput) {
      energyInput.addEventListener('input', () => {
        const recipe = this.manager.getRecipe(this.selectedRecipeId);
        if (recipe) {
          recipe.energy_required = parseFloat(energyInput.value) || 1;
          this.manager.saveToStorage();
        }
      });
    }

    // 카테고리 변경
    const categoryInput = container.querySelector('.recipe-category-input');
    if (categoryInput) {
      categoryInput.addEventListener('input', () => {
        const recipe = this.manager.getRecipe(this.selectedRecipeId);
        if (recipe) {
          recipe.category = categoryInput.value;
          this.manager.saveToStorage();
        }
      });
    }

    // 레시피 삭제 버튼
    const deleteBtn = container.querySelector('.recipe-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (confirm('이 레시피를 삭제하시겠습니까?')) {
          this.deleteRecipe(this.selectedRecipeId);
        }
      });
    }

    // 재료 추가 버튼
    const addIngredientBtn = container.querySelector('.add-ingredient-btn');
    if (addIngredientBtn) {
      addIngredientBtn.addEventListener('click', () => {
        const recipe = this.manager.getRecipe(this.selectedRecipeId);
        if (recipe) {
          recipe.addIngredient('iron-plate', 1, 'item');
          this.manager.saveToStorage();
          this.render(container);
        }
      });
    }

    // 결과물 추가 버튼
    const addResultBtn = container.querySelector('.add-result-btn');
    if (addResultBtn) {
      addResultBtn.addEventListener('click', () => {
        const recipe = this.manager.getRecipe(this.selectedRecipeId);
        if (recipe) {
          recipe.addResult('iron-plate', 1, 'item');
          this.manager.saveToStorage();
          this.render(container);
        }
      });
    }

    // 아이템 행 이벤트들
    const itemRows = container.querySelectorAll('.recipe-item-row');
    itemRows.forEach(row => {
      const index = parseInt(row.dataset.index);
      const type = row.dataset.type;
      const recipe = this.manager.getRecipe(this.selectedRecipeId);
      if (!recipe) return;

      // 아이템 이름 변경
      const nameInput = row.querySelector('.item-name-input');
      nameInput.addEventListener('input', () => {
        if (type === 'ingredient') {
          recipe.updateIngredient(index, { name: nameInput.value });
        } else {
          recipe.updateResult(index, { name: nameInput.value });
        }
        this.manager.saveToStorage();
      });

      // 수량 변경
      const amountInput = row.querySelector('.item-amount-input');
      amountInput.addEventListener('input', () => {
        const amount = parseFloat(amountInput.value) || 1;
        if (type === 'ingredient') {
          recipe.updateIngredient(index, { amount });
        } else {
          recipe.updateResult(index, { amount });
        }
        this.manager.saveToStorage();
      });

      // 타입 변경
      const typeSelect = row.querySelector('.item-type-select');
      typeSelect.addEventListener('change', () => {
        if (type === 'ingredient') {
          recipe.updateIngredient(index, { type: typeSelect.value });
        } else {
          recipe.updateResult(index, { type: typeSelect.value });
        }
        this.manager.saveToStorage();
      });

      // 삭제 버튼
      const removeBtn = row.querySelector('.remove-item-btn');
      removeBtn.addEventListener('click', () => {
        if (type === 'ingredient') {
          recipe.removeIngredient(index);
        } else {
          recipe.removeResult(index);
        }
        this.manager.saveToStorage();
        this.render(container);
      });
    });
  }

  /**
   * 사이드바만 업데이트
   */
  updateSidebar(container) {
    const listContainer = container.querySelector('.list-container');
    if (!listContainer) return;

    const recipes = this.manager.getAllRecipes();
    let html = '';
    
    if (recipes.length === 0) {
      html = '<p style="color: #999; text-align: center; padding: 20px;">커스텀 레시피가 없습니다.</p>';
    } else {
      for (const recipe of recipes) {
        const isSelected = recipe.id === this.selectedRecipeId;
        const ingredientsCount = recipe.ingredients ? recipe.ingredients.length : 0;
        const resultsCount = recipe.results ? recipe.results.length : 0;
        html += `
          <div class="list-item ${isSelected ? 'selected' : ''}" data-recipe-id="${recipe.id}">
            <span class="list-item-name">${this.escapeHtml(recipe.name)}</span>
            <span class="list-item-count">${ingredientsCount}→${resultsCount}</span>
          </div>
        `;
      }
    }
    
    listContainer.innerHTML = html;

    // 이벤트 재등록
    const listItems = listContainer.querySelectorAll('.list-item');
    listItems.forEach(item => {
      item.addEventListener('click', () => {
        this.selectedRecipeId = item.dataset.recipeId;
        this.render(container);
      });
    });
  }

  /**
   * 새 레시피 추가
   */
  addRecipe() {
    const newRecipe = new CustomRecipe({
      name: '새 레시피',
      energy_required: 1,
      ingredients: [],
      results: [],
      category: 'crafting'
    });
    this.manager.addRecipe(newRecipe);
    this.selectedRecipeId = newRecipe.id;
    this.render(document.getElementById('custom-recipe-tab'));
    window.dispatchEvent(new Event('custom-content-updated'));
  }

  /**
   * 레시피 삭제
   */
  deleteRecipe(recipeId) {
    this.manager.deleteRecipe(recipeId);
    const recipes = this.manager.getAllRecipes();
    this.selectedRecipeId = recipes.length > 0 ? recipes[0].id : null;
    this.render(document.getElementById('custom-recipe-tab'));
    window.dispatchEvent(new Event('custom-content-updated'));
  }

  /**
   * CustomRecipeManager 반환
   */
  getManager() {
    return this.manager;
  }
}
