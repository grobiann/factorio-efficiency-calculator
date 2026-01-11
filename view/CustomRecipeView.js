import { CustomRecipe, CustomRecipeManager } from "../model/CustomRecipe.js";
import { ItemSelectModal } from "./ItemSelectModal.js";
import { ViewHelpers } from "../utils/ViewHelpers.js";

/**
 * CustomRecipeView - 커스텀 레시피 관리 UI
 */
export class CustomRecipeView {
  constructor(loadedData, locale, manager) {
    this.manager = manager;
    this.loadedData = loadedData;
    this.locale = locale;
    this.selectedRecipeId = null;
    this.itemSelectModal = new ItemSelectModal(this);
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
    const iconInfo = ViewHelpers.getIconInfo(this.loadedData, itemId);
    if (iconInfo && iconInfo.path) {
      icon.src = ViewHelpers.resolveAssetPath(iconInfo.path);
    } else {
      icon.src = ViewHelpers.resolveAssetPath('data/default-icon.svg');
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
      // 고정 레시피를 먼저, 일반 레시피를 나중에 정렬
      const sortedRecipes = [...recipes].sort((a, b) => {
        const aFixed = this.manager.isFixedRecipe(a.id);
        const bFixed = this.manager.isFixedRecipe(b.id);
        if (aFixed && !bFixed) return -1;
        if (!aFixed && bFixed) return 1;
        return 0;
      });
      
      for (const recipe of sortedRecipes) {
        const isSelected = recipe.id === this.selectedRecipeId;
        const isFixed = this.manager.isFixedRecipe(recipe.id);
        const results = recipe.results || [];
        
        // 결과물 아이콘 HTML 생성
        let iconsHtml = '';
        const maxIcons = 1;
        const displayResults = results.slice(0, maxIcons);
        
        for (const result of displayResults) {
          const iconInfo = ViewHelpers.getIconInfo(this.loadedData, result.name, result.type || 'item');
          if (iconInfo && iconInfo.path) {
            const iconPath = ViewHelpers.resolveAssetPath(iconInfo.path);
            iconsHtml += `<img src="${iconPath}" alt="${this.escapeHtml(this.locale.itemName(result.name))}" class="list-item-icon" />`;
          }
        }
        
        if (results.length > maxIcons) {
          iconsHtml += `<span class="list-item-more">+${results.length - maxIcons}</span>`;
        }
        
        const displayName = isFixed ? `[고정] ${recipe.name}` : recipe.name;
        
        html += `
          <div class="list-item ${isSelected ? 'selected' : ''}" data-recipe-id="${recipe.id}">
            <span class="list-item-name">${this.escapeHtml(displayName)}</span>
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
    
    const isFixed = this.manager.isFixedRecipe(recipe.id);
    
    // 이름 편집 및 삭제 버튼
    html += `
      <div class="recipe-name-edit">
        <input type="text" class="recipe-name-input" value="${this.escapeHtml(recipe.name)}" placeholder="레시피 이름" ${isFixed ? 'readonly' : ''}>
        ${isFixed ? '' : '<button class="btn-danger recipe-delete-btn">레시피 삭제</button>'}
      </div>
    `;

    // 기본 정보
    html += '<div class="recipe-basic-info">';
    html += `
      <label>
        제작 시간:
        <input type="number" class="recipe-energy-input" value="${recipe.energy_required || 1}" step="0.1" min="0.1" ${isFixed ? 'readonly' : ''}>
        초
      </label>
      <label>
        카테고리:
        <input type="text" class="recipe-category-input" value="${this.escapeHtml(recipe.category || 'crafting')}" placeholder="crafting" ${isFixed ? 'readonly' : ''}>
      </label>
    `;
    html += '</div>';

    // 재료 섹션
    html += '<div class="recipe-section">';
    html += '<h3>재료 (Ingredients)</h3>';
    html += '<div class="recipe-items-list" id="ingredientsList">';
    
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach((ing, index) => {
        html += this.renderItemRow(ing, index, 'ingredient', isFixed);
      });
    } else {
      html += '<p style="color: #999;">재료가 없습니다.</p>';
    }
    
    html += '</div>';
    if (!isFixed) {
      html += '<button class="btn-secondary add-ingredient-btn">재료 추가</button>';
    }
    html += '</div>';

    // 결과물 섹션
    html += '<div class="recipe-section">';
    html += '<h3>결과물 (Results)</h3>';
    html += '<div class="recipe-items-list" id="resultsList">';
    
    if (recipe.results && recipe.results.length > 0) {
      recipe.results.forEach((res, index) => {
        html += this.renderItemRow(res, index, 'result', isFixed);
      });
    } else {
      html += '<p style="color: #999;">결과물이 없습니다.</p>';
    }
    
    html += '</div>';
    if (!isFixed) {
      html += '<button class="btn-secondary add-result-btn">결과물 추가</button>';
    }
    html += '</div>';

    // space_cargo_rocket_launch 레시피인 경우 설정 추가
    if (recipe.id === 'space_cargo_rocket_launch') {
      const settings = this.manager.settings;
      html += '<div class="recipe-section" style="border-top: 2px solid #ddd; margin-top: 20px; padding-top: 20px;">';
      html += '<h3>로켓 발사 설정</h3>';
      html += '<div style="display: flex; flex-direction: column; gap: 15px;">';
      html += `
        <label style="display: flex; flex-direction: column; gap: 5px;">
          <span>화물로켓부품 손실률 (%)</span>
          <input type="number" class="cargo-loss-rate-input" value="${settings.cargoRocketPartLossRate}" min="0" max="100" step="0.1" style="padding: 8px;">
          <small style="color: #666;">0~100% (손실률이 높을수록 더 많은 부품이 필요합니다)</small>
        </label>
        <label style="display: flex; flex-direction: column; gap: 5px;">
          <span>로켓 발사 연료소모량</span>
          <input type="text" class="rocket-fuel-consumption-input" value="${(settings.rocketFuelConsumption / 1000).toFixed(1)}k" style="padding: 8px;">
          <small style="color: #666;">0~999k (예: 50k = 50,000개)</small>
        </label>
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" class="supply-via-cargo-rocket-checkbox" ${settings.supplyViaCargoRocket ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
          <span>연료 및 화물로켓 부품을 화물로켓을 통해 공급</span>
        </label>
      `;
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  /**
   * 아이템 행 렌더링
   */
  renderItemRow(item, index, rowType, isFixed = false) {
    console.log('Rendering item row:', item, index);
    const iconInfo = ViewHelpers.getIconInfo(this.loadedData, item.name, item.type || 'item');
    const iconHtml = ViewHelpers.createItemIconHtml(iconInfo, null);
    return `
      <div class="recipe-item-row" data-index="${index}" data-type="${rowType}">
        <span class="item-icon-cell">${iconHtml}</span>
        <span class="item-name-cell">${this.escapeHtml(item.name)}</span>
        <input type="number" class="item-amount-input" value="${item.amount}" step="0.1" min="0.1" ${isFixed ? 'readonly' : ''}>
        ${isFixed ? '' : '<button class="btn-danger remove-item-btn">✕</button>'}
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

    // space_cargo_rocket_launch 레시피 설정
    const cargoLossRateInput = container.querySelector('.cargo-loss-rate-input');
    if (cargoLossRateInput) {
      cargoLossRateInput.addEventListener('change', () => {
        const inputValue = cargoLossRateInput.value.trim();
        const parsedValue = parseFloat(inputValue);
        let lossRate = 40; // 기본값
        
        // 숫자로 변환 가능하면 반올림하여 정수로 처리
        if (!isNaN(parsedValue)) {
          lossRate = Math.round(parsedValue);
        }
        
        this.manager.updateSettings({
          cargoRocketPartLossRate: Math.max(0, Math.min(100, lossRate))
        });
        this.render(container);
      });
    }

    const rocketFuelInput = container.querySelector('.rocket-fuel-consumption-input');
    if (rocketFuelInput) {
      rocketFuelInput.addEventListener('change', () => {
        let inputValue = rocketFuelInput.value.trim().toLowerCase();
        let fuelConsumption = 50000; // 기본값
        
        // k 단위 파싱
        if (inputValue.endsWith('k')) {
          // k가 붙어있으면 k를 제거하고 천 단위로 변환
          const numValue = parseFloat(inputValue.slice(0, -1));
          if (!isNaN(numValue)) {
            fuelConsumption = numValue * 1000;
          }
        } else {
          // k가 없으면 입력값을 그대로 개수로 사용 (1000 입력 → 1000개 → 1k로 표시)
          const numValue = parseFloat(inputValue);
          if (!isNaN(numValue)) {
            fuelConsumption = numValue;
          }
        }
        
        this.manager.updateSettings({
          rocketFuelConsumption: Math.max(0, Math.min(999000, fuelConsumption))
        });
        this.render(container);
      });
    }

    const supplyViaCargoRocketCheckbox = container.querySelector('.supply-via-cargo-rocket-checkbox');
    if (supplyViaCargoRocketCheckbox) {
      supplyViaCargoRocketCheckbox.addEventListener('change', () => {
        this.manager.updateSettings({
          supplyViaCargoRocket: supplyViaCargoRocketCheckbox.checked
        });
        this.render(container);
      });
    }

    // 레시피 이름 변경
    const nameInput = container.querySelector('.recipe-name-input');
    if (nameInput && !nameInput.readOnly) {
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
    if (energyInput && !energyInput.readOnly) {
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
    if (categoryInput && !categoryInput.readOnly) {
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
      addIngredientBtn.onclick = () => {
        this.showItemSelectModal();
        this.itemSelectModal.onSelect = (itemId, itemType) => {
        const recipe = this.manager.getRecipe(this.selectedRecipeId);
        if (recipe) {
          recipe.addIngredient(itemId, 1, itemType);
          this.manager.saveToStorage();
          this.render(container);
        }
        }
      }
    }

    // 결과물 추가 버튼
    const addResultBtn = container.querySelector('.add-result-btn');
    if (addResultBtn) {
      addResultBtn.onclick = () => {
        this.showItemSelectModal();
        this.itemSelectModal.onSelect = (itemId, itemType) => {
        const recipe = this.manager.getRecipe(this.selectedRecipeId);
        if (recipe) {
          recipe.addResult(itemId, 1, itemType);
          this.manager.saveToStorage();
          this.render(container);
        }
        }
      }
    }

    // 아이템 행 이벤트들
    const itemRows = container.querySelectorAll('.recipe-item-row');
    itemRows.forEach(row => {
      const index = parseInt(row.dataset.index);
      const type = row.dataset.type;
      const recipe = this.manager.getRecipe(this.selectedRecipeId);
      if (!recipe) return;

      // 아이템 이름(읽기전용)이므로 이벤트 바인딩 생략
      // const nameInput = row.querySelector('.item-name-input');
      // if (nameInput) {
      //   nameInput.addEventListener('input', ...);
      // }

      // 수량 변경
      const amountInput = row.querySelector('.item-amount-input');
      if (amountInput) {
        amountInput.addEventListener('input', () => {
          const amount = parseFloat(amountInput.value) || 1;
          if (type === 'ingredient') {
            recipe.updateIngredient(index, { amount });
          } else {
            recipe.updateResult(index, { amount });
          }
          this.manager.saveToStorage();
        });
      }

      // 삭제 버튼
      const removeBtn = row.querySelector('.remove-item-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          if (type === 'ingredient') {
            recipe.removeIngredient(index);
          } else {
            recipe.removeResult(index);
          }
          this.manager.saveToStorage();
          this.render(container);
        });
      }
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
      // 고정 레시피를 먼저, 일반 레시피를 나중에 정렬
      const sortedRecipes = [...recipes].sort((a, b) => {
        const aFixed = this.manager.isFixedRecipe(a.id);
        const bFixed = this.manager.isFixedRecipe(b.id);
        if (aFixed && !bFixed) return -1;
        if (!aFixed && bFixed) return 1;
        return 0;
      });
      
      for (const recipe of sortedRecipes) {
        const isSelected = recipe.id === this.selectedRecipeId;
        const isFixed = this.manager.isFixedRecipe(recipe.id);
        const results = recipe.results || [];
        
        // 결과물 아이콘 HTML 생성
        let iconsHtml = '';
        const maxIcons = 1;
        const displayResults = results.slice(0, maxIcons);
        
        for (const result of displayResults) {
          const iconInfo = ViewHelpers.getIconInfo(this.loadedData, result.name, result.type || 'item');
          if (iconInfo && iconInfo.path) {
            iconsHtml += `<img src="${ViewHelpers.resolveAssetPath(iconInfo.path)}" alt="${this.escapeHtml(this.locale.itemName(result.name))}" class="list-item-icon" />`;
          }
        }
        
        if (results.length > maxIcons) {
          iconsHtml += `<span class="list-item-more">+${results.length - maxIcons}</span>`;
        }
        
        const displayName = isFixed ? `[고정] ${recipe.name}` : recipe.name;
        
        html += `
          <div class="list-item ${isSelected ? 'selected' : ''}" data-recipe-id="${recipe.id}">
            <span class="list-item-name">${this.escapeHtml(displayName)}</span>
            <div class="list-item-icons">${iconsHtml}</div>
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
   * 아이템 선택 모달 표시
   */
  showItemSelectModal() {
    this.itemSelectModal.show();
  }

  /**
   * CustomRecipeManager 반환
   */
  getManager() {
    return this.manager;
  }
}
