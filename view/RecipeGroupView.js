import { RecipeGroup } from "../model/RecipeGroup.js";
import { RecipeSelectModal } from "./RecipeSelectModal.js";
import { ViewHelpers } from "../utils/ViewHelpers.js";

/**
 * RecipeGroupView - 레시피 그룹 관리 UI
 */
export class RecipeGroupView {
  constructor(allRecipes, recipesByProduct, locale, loadedData, customRecipeManager) {
    this.groups = new Map();
    this.allRecipes = allRecipes; // { recipeId: Recipe } 형태
    this.recipesByProduct = recipesByProduct;
    this.locale = locale;
    this.loadedData = loadedData;
    this.selectedGroupId = null;
    this.customRecipeManager = customRecipeManager;
    this.recipeSelectModal = new RecipeSelectModal(this);
    this.loadFromStorage();
  }

  /**
   * 뷰 렌더링
   */
  render(container) {
    this.currentContainer = container; // 저장
    const groupManagement = container.querySelector('.group-management');
    if (!groupManagement) return;

    // 첫 번째 레시피 그룹 자동 선택
    if (!this.selectedGroupId && this.groups.size > 0) {
      this.selectedGroupId = this.groups.values().next().value.id;
    }

    let html = '<div class="group-management-grid">';
    
    // 왼쪽: 레시피 그룹 목록
    html += '<div class="sidebar-container">';
    html += '<button id="addGroupBtn" class="btn-primary">새 레시피 그룹 추가</button>';
    html += '<div class="list-container">';
    
    if (this.groups.size === 0) {
      html += '<p style="color: #999; text-align: center; padding: 20px;">레시피 그룹이 없습니다.</p>';
    } else {
      for (const group of this.groups.values()) {
        const isSelected = group.id === this.selectedGroupId;
        const io = group.calculateIO(this.allRecipes, this.groups, new Set(), this.customRecipeManager);
        const results = io.results || [];
        
        // 결과물 아이콘 HTML 생성
        let iconsHtml = '';
        const maxIcons = 1;
        const displayResults = results.slice(0, maxIcons);
        
        for (const result of displayResults) {
          let iconInfo = ViewHelpers.getIconInfo(this.loadedData, result.name, result.type || 'item');
          // iconInfo가 배열이면 첫 번째 아이콘 사용
          if (Array.isArray(iconInfo)) {
            iconInfo = iconInfo[0];
          }
          if (iconInfo && iconInfo.path) {
            const iconPath = ViewHelpers.resolveAssetPath(iconInfo.path);
            iconsHtml += `<img src="${iconPath}" alt="${this.escapeHtml(this.locale.itemName(result.name))}" class="list-item-icon" />`;
          }
        }
        
        if (results.length > maxIcons) {
          iconsHtml += `<span class="list-item-more">+${results.length - maxIcons}</span>`;
        }
        
        html += `
          <div class="list-item ${isSelected ? 'selected' : ''}" data-group-id="${group.id}">
            <span class="list-item-name">${this.escapeHtml(group.name)}</span>
            <div class="list-item-icons">${iconsHtml}</div>
          </div>
        `;
      }
    }
    
    html += '</div></div>';

    // 오른쪽: 상세 정보 영역
    html += '<div class="group-detail-container">';
    if (this.selectedGroupId && this.groups.has(this.selectedGroupId)) {
      html += this.renderGroupDetail(this.groups.get(this.selectedGroupId));
    } else {
      html += '<p style="color: #999; text-align: center; padding: 40px;">레시피 그룹을 선택하세요.</p>';
    }
    html += '</div>';
    
    html += '</div>';

    groupManagement.innerHTML = html;

    // 이벤트 리스너 등록
    this.attachEventListeners(groupManagement);
  }

  /**
   * 레시피 그룹 상세 정보 렌더링
   */
  renderGroupDetail(group) {

    console.log('[RecipeGroupView.renderGroupDetail] Rendering detail for group:', group);
    const io = group.calculateIO(this.allRecipes, this.groups, new Set(), this.customRecipeManager);
    console.log('[RecipeGroupView.renderGroupDetail] Rendering detail for group:', io);

    let html = '<div class="group-detail">';
    
    // 이름 편집
    html += `
      <div class="group-name-edit">
        <input type="text" class="group-name-input" value="${this.escapeHtml(group.name)}" placeholder="레시피 그룹 이름">
        <button class="btn-danger group-delete-btn">레시피 그룹 삭제</button>
      </div>
    `;

    // 출력/입력 요약
    html += '<div class="group-io-summary">';
    html += '<div class="group-io-section group-outputs">';
    html += '<h4>출력</h4>';
    html += '<div class="group-io-items">';
    if (io.results.length === 0) {
      html += '<span style="color: #999;">없음</span>';
    } else {
      for (const result of io.results) {
        const iconInfo = ViewHelpers.getIconInfo(this.loadedData, result.name, result.type || 'item');
        const amount = this.getExpectedAmount(result);
        html += this.createItemIcon(iconInfo, amount);
      }
    }
    html += '</div></div>';

    html += '<div class="group-io-section group-inputs">';
    html += '<h4>입력</h4>';
    html += '<div class="group-io-items">';
    if (io.ingredients.length === 0) {
      html += '<span style="color: #999;">없음</span>';
    } else {
      for (const ingredient of io.ingredients) {
        const iconInfo = ViewHelpers.getIconInfo(this.loadedData, ingredient.name, ingredient.type || 'item');
        html += this.createItemIcon(iconInfo, ingredient.amount, true, ingredient.name, ingredient.type);
      }
    }
    html += '</div></div>';
    html += '</div>'; // group-io-summary

    // 레시피 목록
    html += '<div class="group-recipes-container">';
    
    if (group.recipes.length === 0) {
      html += '<div class="group-no-recipes">';
      html += '<p>레시피가 없습니다. 레시피를 선택하세요.</p>';
      html += '</div>';
    } else {
      for (let i = 0; i < group.recipes.length; i++) {
        html += this.renderRecipeRow(group, i);
      }
    }
    
    // 항상 레시피 추가 버튼 표시
    html += this.renderRecipeSelector();
    
    html += '</div>'; // group-recipes-container
    html += '</div>'; // group-detail

    return html;
  }

  /**
   * 레시피 행 렌더링
   */
  renderRecipeRow(group, index) {
    const recipeEntry = group.recipes[index];
    let recipe, ingredients, results;
    if (recipeEntry.type === 'group') {
      // 레시피 그룹인 경우
      const subGroup = this.groups.get(recipeEntry.recipeId);
      if (!subGroup) {
        return `<div class="group-recipe-row">레시피 그룹을 찾을 수 없습니다: ${recipeEntry.recipeId}</div>`;
      }
      const subIO = subGroup.calculateIO(this.allRecipes, this.groups, new Set(), this.customRecipeManager);
      // 레시피 그룹을 레시피처럼 표현
      recipe = {
        id: subGroup.id,
        name: subGroup.name,
        ingredients: subIO.ingredients,
        results: subIO.results,
        _isGroup: true
      };
      ingredients = subIO.ingredients;
      results = subIO.results;
    } else {
      // 일반 레시피 또는 커스텀 레시피인 경우
      let foundRecipe = null;
      if (this.customRecipeManager && typeof this.customRecipeManager.getRecipe === 'function') {
        foundRecipe = this.customRecipeManager.getRecipe(recipeEntry.recipeId);
      }
      if (!foundRecipe) {
        foundRecipe = this.allRecipes[recipeEntry.recipeId];
      }
      recipe = foundRecipe;
      if (!recipe) {
        return `<div class="group-recipe-row">레시피를 찾을 수 없습니다: ${recipeEntry.recipeId}</div>`;
      }

      ingredients = recipe.ingredients || [];
      results = recipe.results || [];
    }

    let html = '<div class="group-recipe-row">';
    
    // 동작 버튼
    html += '<div class="group-recipe-actions">';
    html += `<button class="group-action-btn" data-action="up" data-index="${index}" ${index === 0 ? 'disabled' : ''}>↑</button>`;
    html += `<button class="group-action-btn" data-action="down" data-index="${index}" ${index === group.recipes.length - 1 ? 'disabled' : ''}>↓</button>`;
    html += `<button class="group-action-btn" data-action="copy" data-index="${index}">📋</button>`;
    html += `<button class="group-action-btn group-action-remove" data-action="remove" data-index="${index}">✕</button>`;
    html += '</div>';

    // 제작법 아이콘
    console.log("===== 제작법 아이콘 =====");
    html += '<div class="group-recipe-icon">';
    const recipeIcons = this.getRecipeIcon(recipe);
    html += this.createRecipeIcon(recipeIcons);
    html += '</div>';

    // 생산품
    console.log("===== 생산품 아이콘 =====");
    html += '<div class="group-recipe-results">';
    for (const result of results) {
      const iconInfo = ViewHelpers.getIconInfo(this.loadedData, result.name, result.type || 'item');
      const amount = this.getExpectedAmount(result) * (recipeEntry.multiplier || 1);
      html += this.createItemIcon(iconInfo, amount, true);
      console.log('[RecipeGroupView.renderRecipeRow] 결과물 렌더링:', result.name, amount, iconInfo);
    }
    html += '</div>';

    // 재료
    console.log("===== 재료 아이콘 =====");
    html += '<div class="group-recipe-ingredients">';
    for (const ingredient of ingredients) {
      const iconInfo = ViewHelpers.getIconInfo(this.loadedData, ingredient.name, ingredient.type || 'item');
      const amount = this.getExpectedAmount(ingredient) * (recipeEntry.multiplier || 1);
      html += this.createItemIcon(iconInfo, amount, true, ingredient.name, ingredient.type);
      console.log('[RecipeGroupView.renderRecipeRow] 재료 렌더링:', ingredient.name, amount, iconInfo);
    }
    html += '</div>';

    // 배수 입력
    html += '<div class="group-recipe-multiplier">';
    html += `<span class="multiplier-label">×</span>`;
    html += `<input type="number" class="multiplier-input" data-index="${index}" value="${recipeEntry.multiplier || 1}" min="0.01" step="0.1" />`;
    html += '</div>';

    html += '</div>'; // group-recipe-row

    return html;
  }

  /**
   * 레시피 선택기 렌더링
   */
  renderRecipeSelector() {
    let html = '<div class="recipe-selector">';
    html += '<button class="btn-primary recipe-select-modal-btn">레시피 추가</button>';
    html += '</div>';
    
    return html;
  }

  /**
   * 레시피 아이콘 생성 (icons 배열 지원)
   */
  createRecipeIcon(icons) {
    return ViewHelpers.createRecipeIconHtml(icons);
  }

  /**
   * 아이템 아이콘 생성
   */
  createItemIcon(iconInfo, amount = null, showAmount = true, itemId = null, itemType = null) {
    const dataAttrs = itemId ? `data-item-id="${itemId}" data-item-type="${itemType || 'item'}"` : '';
    return ViewHelpers.createIconHtml(iconInfo, {
      amount: showAmount ? amount : null,
      showBorder: true,
      formatFn: this.formatAmount.bind(this),
      dataAttrs
    });
  }

  /**
   * 레시피 아이콘 정보 가져오기
   */
  getRecipeIcon(recipe) {
    return ViewHelpers.getRecipeIcon(recipe, this.loadedData);
  }

  /**
   * 결과물/재료의 기댓값 계산
   * amount, amount_min, amount_max, probability를 고려
   */
  getExpectedAmount(entry) {
    if (!entry) return 0;

    const probability = entry.probability === undefined ? 1 : Number(entry.probability);
    if (!Number.isFinite(probability) || probability <= 0) return 0;

    const amount = entry.amount !== undefined ? Number(entry.amount) : NaN;
    if (Number.isFinite(amount)) return amount * probability;

    const amountMin = entry.amount_min !== undefined ? Number(entry.amount_min) : NaN;
    const amountMax = entry.amount_max !== undefined ? Number(entry.amount_max) : NaN;
    if (Number.isFinite(amountMin) && Number.isFinite(amountMax)) {
      return ((amountMin + amountMax) / 2) * probability;
    }

    if (Number.isFinite(amountMin)) return amountMin * probability;
    if (Number.isFinite(amountMax)) return amountMax * probability;

    return 0;
  }

  /**
   * 수량 포맷팅
   */
  formatAmount(amount) {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'm';
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'k';
    }
    if (amount % 1 === 0) {
      return amount.toString();
    }
    return amount.toFixed(1);
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
   * 이벤트 리스너 등록
   */
  attachEventListeners(container) {
    // 새 레시피 그룹 추가
    const addBtn = container.querySelector('#addGroupBtn');
    if (addBtn) {
      addBtn.onclick = () => this.addGroup();
    }

    // 레시피 그룹 선택
    container.querySelectorAll('.list-item').forEach(item => {
      item.onclick = () => {
        this.selectedGroupId = item.dataset.groupId;
        this.render(this.currentContainer);
      };
    });

    // 레시피 그룹 이름 변경
    const nameInput = container.querySelector('.group-name-input');
    if (nameInput) {
      nameInput.onchange = () => {
        const group = this.groups.get(this.selectedGroupId);
        if (group) {
          group.name = nameInput.value || '새 레시피 그룹';
          this.saveToStorage();
          this.render(this.currentContainer);
        }
      };
    }

    // 레시피 그룹 삭제
    const deleteBtn = container.querySelector('.group-delete-btn');
    if (deleteBtn) {
      deleteBtn.onclick = () => {
        if (confirm('이 레시피 그룹을 삭제하시겠습니까?')) {
          this.groups.delete(this.selectedGroupId);
          this.selectedGroupId = null;
          this.saveToStorage();
          this.render(this.currentContainer);
        }
      };
    }

    // 레시피 동작 버튼
    container.querySelectorAll('.group-action-btn').forEach(btn => {
      btn.onclick = () => {
        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.index);
        const group = this.groups.get(this.selectedGroupId);
        if (!group) return;

        switch (action) {
          case 'up':
            group.moveRecipeUp(index);
            // 이동된 레시피와 그 위치의 배수 재계산
            group.calculateMultiplier(index - 1, this.allRecipes, this.groups);
            group.calculateMultiplier(index, this.allRecipes, this.groups);
            break;
          case 'down':
            group.moveRecipeDown(index);
            // 이동된 레시피와 그 위치의 배수 재계산
            group.calculateMultiplier(index, this.allRecipes, this.groups);
            group.calculateMultiplier(index + 1, this.allRecipes, this.groups);
            break;
          case 'copy':
            group.copyRecipe(index);
            break;
          case 'remove':
            group.removeRecipe(index);
            // 제거 후 이후 레시피들 배수 재계산
            for (let i = index; i < group.recipes.length; i++) {
              group.calculateMultiplier(i, this.allRecipes, this.groups);
            }
            break;
        }

        this.saveToStorage();
        this.render(this.currentContainer);
      };
    });

    // 배수 입력 필드
    container.querySelectorAll('.multiplier-input').forEach(input => {
      input.onchange = () => {
        const index = parseInt(input.dataset.index);
        const value = parseFloat(input.value);
        const group = this.groups.get(this.selectedGroupId);
        if (!group || isNaN(value) || value <= 0) return;

        group.updateRecipe(index, { multiplier: value });
        
        // 이후 레시피들의 배수 재계산
        for (let i = index + 1; i < group.recipes.length; i++) {
          group.calculateMultiplier(i, this.allRecipes, this.groups);
        }
        
        this.saveToStorage();
        this.render(this.currentContainer);
      };
    });

    // 레시피 추가 버튼 클릭
    const recipeSelectModalBtn = container.querySelector('.recipe-select-modal-btn');
    if (recipeSelectModalBtn) {
      recipeSelectModalBtn.onclick = () => {
        this.showRecipeSelectModal();
      };
    }

    // 재료 클릭 -> 해당 재료를 생산하는 레시피 추가
    container.querySelectorAll('.group-recipe-ingredients .item-icon-slot[data-item-id], .group-recipe-ingredients .group-item-slot[data-item-id]').forEach(slot => {
      slot.style.cursor = 'pointer';
      slot.onclick = () => {
        const itemId = slot.dataset.itemId;
        const itemType = slot.dataset.itemType || 'item';
        this.addRecipeForIngredient(itemId, itemType);
      };
    });

    // 입력 섹션 아이템 클릭 -> 해당 재료를 생산하는 레시피 추가
    container.querySelectorAll('.group-inputs .item-icon-slot[data-item-id]').forEach(slot => {
      slot.style.cursor = 'pointer';
      slot.onclick = () => {
        const itemId = slot.dataset.itemId;
        const itemType = slot.dataset.itemType || 'item';
        this.addRecipeForIngredient(itemId, itemType);
      };
    });
  }

  /**
   * 레시피 선택 모달 표시
   */
  showRecipeSelectModal() {
    this.recipeSelectModal.show();
  }

  /**
   * 재료를 생산하는 레시피 추가
   */
  addRecipeForIngredient(itemId, itemType) {
    const group = this.groups.get(this.selectedGroupId);
    if (!group) return;

    // 최신 recipesByProduct 생성 (레시피 그룹 포함)
    const allRecipes = {};
    
    // 기존 레시피 복사
    for (const [productId, recipes] of Object.entries(this.recipesByProduct)) {
      allRecipes[productId] = [...recipes];
    }
    
    // 현재 모든 레시피 그룹을 레시피로 변환해서 추가
    const Recipe = window.Recipe || class { constructor(data) { Object.assign(this, data); } };
    for (const z of this.groups.values()) {
      const recipeFormat = z.toRecipeFormat(this.allRecipes, this.groups);
      const recipeObj = new Recipe(recipeFormat);
      
      for (const result of recipeFormat.results) {
        const productId = result.name;
        if (!allRecipes[productId]) {
          allRecipes[productId] = [];
        }
        // 중복 체크 (같은 ID가 없을 때만 추가)
        if (!allRecipes[productId].find(r => r.id === recipeObj.id)) {
          allRecipes[productId].push(recipeObj);
        }
      }
    }

    // 해당 아이템을 생산하는 레시피 찾기
    const recipes = allRecipes[itemId];
    if (!recipes || recipes.length === 0) {
      alert(`"${this.locale.itemName(itemId)}"를 생산하는 레시피를 찾을 수 없습니다.`);
      return;
    }

    // 레시피가 여러 개인 경우 선택 모달 표시
    if (recipes.length > 1) {
      this.showRecipeSelectionModal(itemId, recipes);
      return;
    }

    // 레시피가 1개면 바로 추가
    this.addSelectedRecipe(itemId, recipes[0]);
  }

  /**
   * 레시피 선택 모달 표시
   */
  showRecipeSelectionModal(itemId, recipes) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    let modalHtml = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${this.escapeHtml(this.locale.itemName(itemId))} 레시피 선택</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="recipe-selection-list">
    `;

    for (const recipe of recipes) {
      const recipeIcons = this.getRecipeIcon(recipe);
      const recipeName = recipe._isGroup ? recipe.name : this.locale.recipeName(recipe.id);
      
      modalHtml += `
        <div class="recipe-selection-item" data-recipe-id="${recipe.id}" data-is-group="${recipe._isGroup || false}">
          <div class="recipe-selection-icon">
            ${this.createRecipeIcon(recipeIcons)}
          </div>
          <div class="recipe-selection-name">${this.escapeHtml(recipeName)}</div>
        </div>
      `;
    }

    modalHtml += `
          </div>
        </div>
      </div>
    `;

    modal.innerHTML = modalHtml;
    document.body.appendChild(modal);

    // 모달 닫기
    const closeModal = () => {
      modal.remove();
    };

    modal.querySelector('.modal-close').onclick = closeModal;

    // 배경 클릭으로 닫기
    let mouseDownTarget = null;
    modal.addEventListener('mousedown', (e) => {
      mouseDownTarget = e.target;
    });
    modal.addEventListener('mouseup', (e) => {
      if (e.target === modal && mouseDownTarget === modal) {
        closeModal();
      }
      mouseDownTarget = null;
    });

    // 레시피 선택
    modal.querySelectorAll('.recipe-selection-item').forEach(item => {
      item.onclick = () => {
        const recipeId = item.dataset.recipeId;
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
          this.addSelectedRecipe(itemId, recipe);
          closeModal();
        }
      };
    });
  }

  /**
   * 선택된 레시피를 구역에 추가
   */
  addSelectedRecipe(itemId, recipe) {
    const group = this.groups.get(this.selectedGroupId);
    if (!group) return;
    
    // 필요한 수량 계산 (현재 구역에서 이 재료가 얼마나 필요한지)
    let requiredAmount = 0;
    for (const recipeEntry of group.recipes) {
      let ingredientsMap;
      
      if (recipeEntry.type === 'group') {
        const subGroup = this.groups.get(recipeEntry.recipeId);
        if (!subGroup) continue;
        const subIO = subGroup.calculateIO(this.allRecipes, this.groups, new Set(), this.customRecipeManager);
        ingredientsMap = {};
        for (const ing of subIO.ingredients) {
          ingredientsMap[ing.name] = ing.amount;
        }
      } else {
        const r = this.allRecipes[recipeEntry.recipeId];
        if (!r) continue;
        ingredientsMap = r.getIngredientsMap();
      }
      
      if (ingredientsMap[itemId]) {
        requiredAmount += ingredientsMap[itemId] * recipeEntry.multiplier;
      }
    }

    // 새 레시피가 생산하는 양
    let producedAmount;
    if (recipe._isGroup) {
      // 레시피 그룹인 경우
      const results = recipe.results || [];
      const result = results.find(r => r.name === itemId);
      producedAmount = result ? this.getExpectedAmount(result) : 1;
    } else {
      // 일반 레시피인 경우
      const resultsMap = recipe.getResultsMap();
      producedAmount = resultsMap[itemId] || 1;
    }

    // 필요한 배수 계산
    const multiplier = requiredAmount > 0 ? requiredAmount / producedAmount : 1;

    const type = recipe._isGroup ? 'group' : 'recipe';
    group.addRecipe(recipe.id, multiplier, type);
    this.saveToStorage();
    this.render(document.getElementById('recipe-group-tab'));
  }

  /**
   * 새 레시피 그룹 추가
   */
  addGroup() {
    const group = new RecipeGroup();
    this.groups.set(group.id, group);
    this.selectedGroupId = group.id;
    this.saveToStorage();
    this.render(document.getElementById('recipe-group-tab'));
  }

  /**
   * localStorage에 저장
   */
  saveToStorage() {
    const data = Array.from(this.groups.values()).map(z => z.toJSON());
    localStorage.setItem('recipeGroups', JSON.stringify(data));
  }

  /**
   * localStorage에서 로드
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem('recipeGroups');
      if (data) {
        const groups = JSON.parse(data);
        groups.forEach(groupData => {
          const group = RecipeGroup.fromJSON(groupData);
          this.groups.set(group.id, group);
        });
      }
    } catch (e) {
      console.error('Failed to load production zones:', e);
    }
  }

  /**
   * 모든 레시피 그룹을 recipesByProduct에 통합
   */
  integrateIntoRecipeMap(recipesByProduct) {
    const Recipe = window.Recipe || class { constructor(data) { Object.assign(this, data); } };
    
    for (const group of this.groups.values()) {
      const recipeFormat = group.toRecipeFormat(this.allRecipes, this.groups);
      const recipeObj = new Recipe(recipeFormat);
      
      // 각 결과물에 대해 추가
      for (const result of recipeFormat.results) {
        const productId = result.name;
        if (!recipesByProduct[productId]) {
          recipesByProduct[productId] = [];
        }
        recipesByProduct[productId].push(recipeObj);
      }
    }
  }
}
