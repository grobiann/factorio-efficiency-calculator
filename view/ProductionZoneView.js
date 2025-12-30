import { ProductionZone } from "../model/ProductionZone.js";

/**
 * ProductionZoneView - 생산구역 관리 UI
 */
export class ProductionZoneView {
  constructor(allRecipes, recipesByProduct, locale, loadedData) {
    this.zones = new Map();
    this.allRecipes = allRecipes; // { recipeId: Recipe } 형태
    this.recipesByProduct = recipesByProduct;
    this.locale = locale;
    this.loadedData = loadedData;
    this.selectedZoneId = null;
    this.loadFromStorage();
  }

  /**
   * 뷰 렌더링
   */
  render(container) {
    const zoneManagement = container.querySelector('.zone-management');
    if (!zoneManagement) return;

    // 첫 번째 생산구역 자동 선택
    if (!this.selectedZoneId && this.zones.size > 0) {
      this.selectedZoneId = this.zones.values().next().value.id;
    }

    // 헤더 부분
    let headerHtml = `
      <h2>생산구역 관리</h2>
      <button id="addZoneBtn" class="btn-primary">새 생산구역 추가</button>
    `;

    // 생산구역 목록
    let listHtml = '<div class="zone-list-container">';
    if (this.zones.size === 0) {
      listHtml += '<p style="color: #999; text-align: center; padding: 20px;">생산구역이 없습니다.</p>';
    } else {
      for (const zone of this.zones.values()) {
        const isSelected = zone.id === this.selectedZoneId;
        listHtml += `
          <div class="zone-list-item ${isSelected ? 'selected' : ''}" data-zone-id="${zone.id}">
            <span class="zone-list-name">${this.escapeHtml(zone.name)}</span>
            <span class="zone-list-count">${zone.recipes.length}개 레시피</span>
          </div>
        `;
      }
    }
    listHtml += '</div>';

    // 상세 정보 영역
    let detailHtml = '<div class="zone-detail-container">';
    if (this.selectedZoneId && this.zones.has(this.selectedZoneId)) {
      detailHtml += this.renderZoneDetail(this.zones.get(this.selectedZoneId));
    } else {
      detailHtml += '<p style="color: #999; text-align: center; padding: 40px;">생산구역을 선택하세요.</p>';
    }
    detailHtml += '</div>';

    zoneManagement.innerHTML = headerHtml + listHtml + detailHtml;

    // 이벤트 리스너 등록
    this.attachEventListeners(container);
  }

  /**
   * 생산구역 상세 정보 렌더링
   */
  renderZoneDetail(zone) {
    const io = zone.calculateIO(this.allRecipes, this.zones);
    
    // 최대 재료/생산품 개수 계산
    let maxIngredients = 0;
    let maxResults = 0;
    
    for (const recipeEntry of zone.recipes) {
      let recipe;
      if (recipeEntry.type === 'zone') {
        const subZone = this.zones.get(recipeEntry.recipeId);
        if (subZone) {
          const subIO = subZone.calculateIO(this.allRecipes, this.zones);
          const ingredientsCount = subIO.ingredients ? subIO.ingredients.length : 0;
          const resultsCount = subIO.results ? subIO.results.length : 0;
          maxIngredients = Math.max(maxIngredients, ingredientsCount);
          maxResults = Math.max(maxResults, resultsCount);
        }
      } else {
        recipe = this.allRecipes[recipeEntry.recipeId];
        if (!recipe) continue;
        
        const ingredientsCount = recipe.ingredients ? recipe.ingredients.length : 0;
        const resultsCount = recipe.results ? recipe.results.length : 0;
        
        maxIngredients = Math.max(maxIngredients, ingredientsCount);
        maxResults = Math.max(maxResults, resultsCount);
      }
    }

    let html = '<div class="zone-detail">';
    
    // 이름 편집
    html += `
      <div class="zone-name-edit">
        <input type="text" class="zone-name-input" value="${this.escapeHtml(zone.name)}" placeholder="생산구역 이름">
        <button class="btn-danger zone-delete-btn">생산구역 삭제</button>
      </div>
    `;

    // 출력/입력 요약
    html += '<div class="zone-io-summary">';
    html += '<div class="zone-io-section zone-outputs">';
    html += '<h4>출력</h4>';
    html += '<div class="zone-io-items">';
    if (io.results.length === 0) {
      html += '<span style="color: #999;">없음</span>';
    } else {
      for (const result of io.results) {
        const iconInfo = this.getIconInfo(result.name, result.type || 'item');
        html += this.createItemIcon(iconInfo, result.amount);
      }
    }
    html += '</div></div>';

    html += '<div class="zone-io-section zone-inputs">';
    html += '<h4>입력</h4>';
    html += '<div class="zone-io-items">';
    if (io.ingredients.length === 0) {
      html += '<span style="color: #999;">없음</span>';
    } else {
      for (const ingredient of io.ingredients) {
        const iconInfo = this.getIconInfo(ingredient.name, ingredient.type || 'item');
        html += this.createItemIcon(iconInfo, ingredient.amount);
      }
    }
    html += '</div></div>';
    html += '</div>'; // zone-io-summary

    // 레시피 목록
    html += '<div class="zone-recipes-container">';
    
    if (zone.recipes.length === 0) {
      html += '<div class="zone-no-recipes">';
      html += '<p>레시피가 없습니다. 레시피를 선택하세요.</p>';
      html += this.renderRecipeSelector();
      html += '</div>';
    } else {
      for (let i = 0; i < zone.recipes.length; i++) {
        html += this.renderRecipeRow(zone, i, maxIngredients, maxResults);
      }
    }
    
    html += '</div>'; // zone-recipes-container
    html += '</div>'; // zone-detail

    return html;
  }

  /**
   * 레시피 행 렌더링
   */
  renderRecipeRow(zone, index, maxIngredients, maxResults) {
    const recipeEntry = zone.recipes[index];
    let recipe, ingredients, results;
    
    if (recipeEntry.type === 'zone') {
      // 생산구역인 경우
      const subZone = this.zones.get(recipeEntry.recipeId);
      if (!subZone) {
        return `<div class="zone-recipe-row">생산구역을 찾을 수 없습니다: ${recipeEntry.recipeId}</div>`;
      }
      
      const subIO = subZone.calculateIO(this.allRecipes, this.zones);
      
      // 생산구역을 레시피처럼 표현
      recipe = {
        id: subZone.id,
        name: subZone.name,
        ingredients: subIO.ingredients,
        results: subIO.results,
        _isZone: true
      };
      ingredients = subIO.ingredients;
      results = subIO.results;
    } else {
      // 일반 레시피인 경우
      recipe = this.allRecipes[recipeEntry.recipeId];
      
      if (!recipe) {
        return `<div class="zone-recipe-row">레시피를 찾을 수 없습니다: ${recipeEntry.recipeId}</div>`;
      }
      
      ingredients = recipe.ingredients || [];
      results = recipe.results || [];
    }

    let html = '<div class="zone-recipe-row">';
    
    // 동작 버튼
    html += '<div class="zone-recipe-actions">';
    html += `<button class="zone-action-btn" data-action="up" data-index="${index}" ${index === 0 ? 'disabled' : ''}>↑</button>`;
    html += `<button class="zone-action-btn" data-action="down" data-index="${index}" ${index === zone.recipes.length - 1 ? 'disabled' : ''}>↓</button>`;
    html += `<button class="zone-action-btn" data-action="copy" data-index="${index}">📋</button>`;
    html += `<button class="zone-action-btn zone-action-remove" data-action="remove" data-index="${index}">✕</button>`;
    html += '</div>';

    // 제작법 아이콘
    html += '<div class="zone-recipe-icon">';
    const recipeIconInfo = this.getRecipeIcon(recipe);
    html += this.createItemIcon(recipeIconInfo, null, false);
    html += '</div>';

    // 생산품
    html += '<div class="zone-recipe-results">';
    for (let i = 0; i < maxResults; i++) {
      if (i < results.length) {
        const result = results[i];
        const iconInfo = this.getIconInfo(result.name, result.type || 'item');
        const amount = result.amount * (recipeEntry.multiplier || 1);
        html += this.createItemIcon(iconInfo, amount, true);
      } else {
        html += '<div class="zone-item-slot empty"></div>';
      }
    }
    html += '</div>';

    // 재료
    html += '<div class="zone-recipe-ingredients">';
    for (let i = 0; i < maxIngredients; i++) {
      if (i < ingredients.length) {
        const ingredient = ingredients[i];
        const iconInfo = this.getIconInfo(ingredient.name, ingredient.type || 'item');
        const amount = ingredient.amount * (recipeEntry.multiplier || 1);
        html += this.createItemIcon(iconInfo, amount, true, ingredient.name, ingredient.type);
      } else {
        html += '<div class="zone-item-slot empty"></div>';
      }
    }
    html += '</div>';

    html += '</div>'; // zone-recipe-row

    return html;
  }

  /**
   * 레시피 선택기 렌더링
   */
  renderRecipeSelector() {
    let html = '<div class="recipe-selector">';
    html += '<select class="recipe-select-dropdown">';
    html += '<option value="">선택하세요...</option>';
    
    // 생산구역 그룹
    if (this.zones.size > 0) {
      html += '<optgroup label="생산구역">';
      for (const zone of this.zones.values()) {
        html += `<option value="zone:${zone.id}">${this.escapeHtml(zone.name)}</option>`;
      }
      html += '</optgroup>';
    }
    
    // 레시피 그룹 (제품별로)
    for (const [productId, recipes] of Object.entries(this.recipesByProduct)) {
      const productName = this.locale.itemName(productId);
      html += `<optgroup label="${this.escapeHtml(productName)}">`;
      for (const recipe of recipes) {
        // 생산구역으로 변환된 레시피는 제외
        if (!recipe._isZone) {
          html += `<option value="recipe:${recipe.id}">${this.escapeHtml(this.locale.recipeName(recipe.id))}</option>`;
        }
      }
      html += '</optgroup>';
    }
    
    html += '</select>';
    html += '<button class="btn-primary recipe-select-btn">추가</button>';
    html += '</div>';
    
    return html;
  }

  /**
   * 아이템 아이콘 생성
   */
  createItemIcon(iconInfo, amount = null, showAmount = true, itemId = null, itemType = null) {
    const mipmapOffset = '-64px 0';
    const objectFit = 'none';
    
    let html = `<div class="zone-item-slot ${amount !== null && showAmount ? 'with-amount' : ''}" ${itemId ? `data-item-id="${itemId}" data-item-type="${itemType || 'item'}"` : ''}>`;
    html += `<div class="zone-item-icon">`;
    html += `<img src="${iconInfo.path}" alt="${iconInfo.name}" style="object-fit: ${objectFit}; object-position: ${mipmapOffset};">`;
    html += `</div>`;
    
    if (amount !== null && showAmount) {
      html += `<div class="zone-item-amount">${this.formatAmount(amount)}</div>`;
    }
    
    html += `</div>`;
    
    return html;
  }

  /**
   * 레시피 아이콘 정보 가져오기
   */
  getRecipeIcon(recipe) {
    // 레시피 자체 아이콘이 있으면 사용
    if (recipe.icon) {
      return {
        path: recipe.icon,
        name: recipe.name,
        hasMipmap: recipe.icon_mipmaps > 0
      };
    }
    
    // 없으면 첫 번째 생산품 아이콘 사용
    if (recipe.results && recipe.results.length > 0) {
      return this.getIconInfo(recipe.results[0].name, recipe.results[0].type || 'item');
    }
    
    // 둘 다 없으면 기본 아이콘
    return {
      path: '__base__/graphics/icons/signal/signal_info.png',
      name: recipe.name,
      hasMipmap: false
    };
  }

  /**
   * 아이템/유체 아이콘 정보 가져오기
   */
  getIconInfo(itemId, itemType = 'item') {
    const entries = this.loadedData.entries || [];
    
    // 타입별 우선순위
    const typeOrder = itemType === 'fluid' ? ['fluid', 'item', 'module'] : ['item', 'module', 'fluid'];
    
    for (const type of typeOrder) {
      const entry = entries.find(e => e.name === itemId && e.type === type);
      if (entry && entry.icon) {
        return {
          path: entry.icon,
          name: itemId,
          hasMipmap: entry.icon_mipmaps > 0
        };
      }
    }
    
    return {
      path: '__base__/graphics/icons/signal/signal_info.png',
      name: itemId,
      hasMipmap: false
    };
  }

  /**
   * 수량 포맷팅
   */
  formatAmount(amount) {
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
    // 새 생산구역 추가
    const addBtn = container.querySelector('#addZoneBtn');
    if (addBtn) {
      addBtn.onclick = () => this.addZone();
    }

    // 생산구역 선택
    container.querySelectorAll('.zone-list-item').forEach(item => {
      item.onclick = () => {
        this.selectedZoneId = item.dataset.zoneId;
        this.render(container);
      };
    });

    // 생산구역 이름 변경
    const nameInput = container.querySelector('.zone-name-input');
    if (nameInput) {
      nameInput.onchange = () => {
        const zone = this.zones.get(this.selectedZoneId);
        if (zone) {
          zone.name = nameInput.value || '새 생산구역';
          this.saveToStorage();
          this.render(container);
        }
      };
    }

    // 생산구역 삭제
    const deleteBtn = container.querySelector('.zone-delete-btn');
    if (deleteBtn) {
      deleteBtn.onclick = () => {
        if (confirm('이 생산구역을 삭제하시겠습니까?')) {
          this.zones.delete(this.selectedZoneId);
          this.selectedZoneId = null;
          this.saveToStorage();
          this.render(container);
        }
      };
    }

    // 레시피 동작 버튼
    container.querySelectorAll('.zone-action-btn').forEach(btn => {
      btn.onclick = () => {
        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.index);
        const zone = this.zones.get(this.selectedZoneId);
        if (!zone) return;

        switch (action) {
          case 'up':
            zone.moveRecipeUp(index);
            break;
          case 'down':
            zone.moveRecipeDown(index);
            break;
          case 'copy':
            zone.copyRecipe(index);
            break;
          case 'remove':
            zone.removeRecipe(index);
            break;
        }

        this.saveToStorage();
        this.render(container);
      };
    });

    // 레시피 선택
    const recipeSelectBtn = container.querySelector('.recipe-select-btn');
    if (recipeSelectBtn) {
      recipeSelectBtn.onclick = () => {
        const select = container.querySelector('.recipe-select-dropdown');
        const value = select.value;
        if (!value) return;

        const zone = this.zones.get(this.selectedZoneId);
        if (zone) {
          // zone: 또는 recipe: 접두사로 타입 구분
          if (value.startsWith('zone:')) {
            const zoneId = value.substring(5);
            zone.addRecipe(zoneId, 1, 'zone');
          } else if (value.startsWith('recipe:')) {
            const recipeId = value.substring(7);
            zone.addRecipe(recipeId, 1, 'recipe');
          }
          this.saveToStorage();
          this.render(container);
        }
      };
    }

    // 재료 클릭 -> 해당 재료를 생산하는 레시피 추가
    container.querySelectorAll('.zone-recipe-ingredients .zone-item-slot[data-item-id]').forEach(slot => {
      slot.style.cursor = 'pointer';
      slot.onclick = () => {
        const itemId = slot.dataset.itemId;
        const itemType = slot.dataset.itemType || 'item';
        this.addRecipeForIngredient(itemId, itemType);
      };
    });
  }

  /**
   * 재료를 생산하는 레시피 추가
   */
  addRecipeForIngredient(itemId, itemType) {
    const zone = this.zones.get(this.selectedZoneId);
    if (!zone) return;

    // 최신 recipesByProduct 생성 (생산구역 포함)
    const allRecipes = {};
    
    // 기존 레시피 복사
    for (const [productId, recipes] of Object.entries(this.recipesByProduct)) {
      allRecipes[productId] = [...recipes];
    }
    
    // 현재 모든 생산구역을 레시피로 변환해서 추가
    const Recipe = window.Recipe || class { constructor(data) { Object.assign(this, data); } };
    for (const z of this.zones.values()) {
      const recipeFormat = z.toRecipeFormat(this.allRecipes, this.zones);
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
      const recipeIconInfo = this.getRecipeIcon(recipe);
      const recipeName = recipe._isZone ? recipe.name : this.locale.recipeName(recipe.id);
      
      modalHtml += `
        <div class="recipe-selection-item" data-recipe-id="${recipe.id}" data-is-zone="${recipe._isZone || false}">
          <div class="recipe-selection-icon">
            ${this.createItemIcon(recipeIconInfo, null, false)}
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
    const zone = this.zones.get(this.selectedZoneId);
    if (!zone) return;
    
    // 필요한 수량 계산 (현재 구역에서 이 재료가 얼마나 필요한지)
    let requiredAmount = 0;
    for (const recipeEntry of zone.recipes) {
      let ingredientsMap;
      
      if (recipeEntry.type === 'zone') {
        const subZone = this.zones.get(recipeEntry.recipeId);
        if (!subZone) continue;
        const subIO = subZone.calculateIO(this.allRecipes, this.zones);
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
    if (recipe._isZone) {
      // 생산구역인 경우
      const results = recipe.results || [];
      const result = results.find(r => r.name === itemId);
      producedAmount = result ? result.amount : 1;
    } else {
      // 일반 레시피인 경우
      const resultsMap = recipe.getResultsMap();
      producedAmount = resultsMap[itemId] || 1;
    }

    // 필요한 배수 계산
    const multiplier = requiredAmount > 0 ? requiredAmount / producedAmount : 1;

    const type = recipe._isZone ? 'zone' : 'recipe';
    zone.addRecipe(recipe.id, multiplier, type);
    this.saveToStorage();
    this.render(document.getElementById('production-zone-tab'));
  }

  /**
   * 새 생산구역 추가
   */
  addZone() {
    const zone = new ProductionZone();
    this.zones.set(zone.id, zone);
    this.selectedZoneId = zone.id;
    this.saveToStorage();
    this.render(document.getElementById('production-zone-tab'));
  }
  /**
   * localStorage에 저장
   */
  saveToStorage() {
    const data = Array.from(this.zones.values()).map(z => z.toJSON());
    localStorage.setItem('productionZones', JSON.stringify(data));
  }

  /**
   * localStorage에서 로드
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem('productionZones');
      if (data) {
        const zones = JSON.parse(data);
        zones.forEach(zoneData => {
          const zone = ProductionZone.fromJSON(zoneData);
          this.zones.set(zone.id, zone);
        });
      }
    } catch (e) {
      console.error('Failed to load production zones:', e);
    }
  }

  /**
   * 모든 생산구역을 recipesByProduct에 통합
   */
  integrateIntoRecipeMap(recipesByProduct) {
    const Recipe = window.Recipe || class { constructor(data) { Object.assign(this, data); } };
    
    for (const zone of this.zones.values()) {
      const recipeFormat = zone.toRecipeFormat(this.allRecipes, this.zones);
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
