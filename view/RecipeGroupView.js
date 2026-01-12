import { RecipeGroup } from "../model/RecipeGroup.js";
import { RecipeSelectModal } from "./RecipeSelectModal.js";
import { ViewHelpers } from "../utils/ViewHelpers.js";
import { getTranslation } from "../utils/Translations.js";

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
    this.expandedFolders = new Set(); // 펼쳐진 폴더 상태 저장
    this.loadFromStorage();
  }

  // Translation helper
  _t(key) {
    return getTranslation(key);
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
    html += `<button id="addGroupBtn" class="btn-primary">${this._t('btnAddRecipeGroup')}</button>`;
    html += '<div class="list-container">';
    
    if (this.groups.size === 0) {
      html += `<p style="color: #999; text-align: center; padding: 20px;">${this._t('msgNoRecipeGroups')}</p>`;
    } else {
      html += this.renderGroupTree();
    }
    
    html += '</div></div>';

    // 오른쪽: 상세 정보 영역
    html += '<div class="group-detail-container">';
    if (this.selectedGroupId && this.groups.has(this.selectedGroupId)) {
      html += this.renderGroupDetail(this.groups.get(this.selectedGroupId));
    } else {
      html += `<p style="color: #999; text-align: center; padding: 40px;">${this._t('rgDetailSelectGroup')}</p>`;
    }
    html += '</div>';
    
    html += '</div>';

    groupManagement.innerHTML = html;

    // 이벤트 리스너 등록
    this.attachEventListeners(groupManagement);
  }

  /**
   * 그룹 트리 구조 렌더링 ("/" 구분자로 계층 구조 표현)
   */
  renderGroupTree() {
    // 1. 그룹들을 트리 구조로 변환
    const tree = this.buildGroupTree();
    
    // 2. 트리를 HTML로 렌더링 (경로 추적 시작)
    return this.renderTreeNode(tree, 0, '');
  }

  /**
   * 그룹 트리 구조 생성
   */
  buildGroupTree() {
    const root = { children: {}, groups: [] };
    
    for (const group of this.groups.values()) {
      const parts = group.name.split('/');
      let current = root;
      
      // 경로를 따라 트리 구조 생성
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i].trim();
        if (!current.children[part]) {
          current.children[part] = { children: {}, groups: [] };
        }
        current = current.children[part];
      }
      
      // 마지막 부분은 실제 그룹
      const lastName = parts[parts.length - 1].trim();
      current.groups.push({ name: lastName, fullName: group.name, group });
    }
    
    return root;
  }

  /**
   * 트리 노드를 HTML로 렌더링
   */
  renderTreeNode(node, depth, path = '') {
    let html = '';
    
    // 폴더들을 먼저 (알파벳순)
    const folders = Object.keys(node.children).sort();
    for (const folderName of folders) {
      const folder = node.children[folderName];
      const folderPath = path ? `${path}/${folderName}` : folderName;
      // base64 인코딩으로 안전한 ID 생성
      const folderId = 'folder-' + btoa(encodeURIComponent(folderPath)).replace(/[^a-zA-Z0-9]/g, '_');
      const isExpanded = this.expandedFolders.has(folderId);
      
      html += `
        <div class="tree-folder" style="padding-left: ${depth * 16}px;">
          <div class="tree-folder-header" data-folder-id="${folderId}">
            <span class="tree-folder-icon">${isExpanded ? '▼' : '▶'}</span>
            <span class="tree-folder-name">${this.escapeHtml(folderName)}</span>
          </div>
          <div class="tree-folder-content" id="${folderId}" style="display: ${isExpanded ? 'block' : 'none'};">
            ${this.renderTreeNode(folder, depth + 1, folderPath)}
          </div>
        </div>
      `;
    }
    
    // 그룹들 (알파벳순)
    const sortedGroups = node.groups.sort((a, b) => a.name.localeCompare(b.name));
    for (const { name, fullName, group } of sortedGroups) {
      const isSelected = group.id === this.selectedGroupId;
      const io = group.calculateIO(this.allRecipes, this.groups, new Set(), this.customRecipeManager);
      const results = io.results || [];
      
      // 결과물 아이콘 (작게, 최대 3개)
      let iconsHtml = '';
      const maxIcons = 3;
      const displayResults = results.slice(0, maxIcons);
      
      for (const result of displayResults) {
        const iconInfo = ViewHelpers.getIconInfo(this.loadedData, result.name, result.type || 'item');
        if (iconInfo) {
          const iconHtml = ViewHelpers.createIconHtml(iconInfo, { 
            showBorder: true,
            targetSize: 24
          });
          iconsHtml += `<span class="tree-item-icon-wrapper">${iconHtml}</span>`;
        }
      }
      
      if (results.length > maxIcons) {
        iconsHtml += `<span class="tree-item-more">+${results.length - maxIcons}</span>`;
      }
      
      html += `
        <div class="tree-item ${isSelected ? 'selected' : ''}" data-group-id="${group.id}" style="padding-left: ${depth * 16}px;">
          <span class="tree-item-name">${this.escapeHtml(name)}</span>
          <div class="tree-item-icons">${iconsHtml}</div>
        </div>
      `;
    }
    
    return html;
  }

  /**
   * 레시피 그룹 상세 정보 렌더링
   */
  renderGroupDetail(group) {
    // 자동 배율 조정 실행 (forceMultiplier가 false인 레시피들에 대해)
    group.autoAdjustMultipliers(this.allRecipes, this.groups, this.customRecipeManager, this.factoryConfigView, this.loadedData);

    const io = group.calculateIO(this.allRecipes, this.groups, new Set(), this.customRecipeManager, this.factoryConfigView, this.loadedData);

    let html = '<div class="group-detail">';
    
    // 이름 편집
    html += `
      <div class="group-name-edit">
        <input type="text" class="group-name-input" value="${this.escapeHtml(group.name)}" placeholder="${this._t('rgDetailGroupName')}">
        <button class="btn-danger group-delete-btn">${this._t('rgDetailDeleteGroup')}</button>
      </div>
    `;

    // 출력/입력 요약
    html += '<div class="group-io-summary">';
    html += '<div class="group-io-section group-outputs">';
    html += `<h4>${this._t('rgDetailOutputs')}</h4>`;
    html += '<div class="group-io-items">';
    const visibleResults = io.results.sort((a, b) => a.name.localeCompare(b.name)); // 이름순 정렬
    if (visibleResults.length === 0) {
      html += `<span style="color: #999;">${this._t('rgDetailNone')}</span>`;
    } else {
      for (const result of visibleResults) {
        const iconInfo = ViewHelpers.getIconInfo(this.loadedData, result.name, result.type || 'item');
        const amount = this.getExpectedAmount(result);
        html += this.createItemIcon(iconInfo, amount);
      }
    }
    html += '</div></div>';

    html += '<div class="group-io-section group-inputs">';
    html += `<h4>${this._t('rgDetailInputs')}</h4>`;
    html += '<div class="group-io-items">';
    const visibleIngredients = io.ingredients.sort((a, b) => a.name.localeCompare(b.name)); // 이름순 정렬
    if (visibleIngredients.length === 0) {
      html += `<span style="color: #999;">${this._t('rgDetailNone')}</span>`;
    } else {
      for (const ingredient of visibleIngredients) {
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
      html += `<p>${this._t('rgDetailSelectRecipe')}</p>`;
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
      const subIO = subGroup.calculateIO(this.allRecipes, this.groups, new Set(), this.customRecipeManager, this.factoryConfigView, this.loadedData);
      
      // 레시피 그룹의 첫 번째 레시피의 allow_productivity 확인
      let groupAllowProductivity = false;
      if (subGroup.recipes.length > 0) {
        const firstRecipeEntry = subGroup.recipes[0];
        const firstRecipe = this.getRecipeObject(firstRecipeEntry);
        if (firstRecipe && !firstRecipe._isGroup) {
          groupAllowProductivity = firstRecipe.allow_productivity === true;
        }
      }
      
      // 레시피 그룹을 레시피처럼 표현
      recipe = {
        id: subGroup.id,
        name: subGroup.name,
        ingredients: subIO.ingredients,
        results: subIO.results,
        _isGroup: true,
        allow_productivity: groupAllowProductivity
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
    html += '<div class="group-recipe-icon">';
    const recipeIcons = this.getRecipeIcon(recipe);
    html += this.createRecipeIcon(recipeIcons);
    html += '</div>';

    // 기계 및 모듈 영역 (연두색 배경)
    // 선택된 모듈이 productivity 모듈인지 확인
    let isProductivityModule = false;
    if (this.factoryConfigView && this.factoryConfigView.selectedModule) {
      const moduleData = this.loadedData?.modules?.find(m => m.id === this.factoryConfigView.selectedModule);
      isProductivityModule = moduleData?.effect?.productivity !== undefined;
    }
    const productivityDisabled = recipe.allow_productivity === false && isProductivityModule;
    html += `<div class="group-recipe-machine-modules ${productivityDisabled ? 'productivity-disabled' : ''}">`;
    
    // 기계 아이콘
    const machine = this.getMachineForRecipe(recipe);
    if (machine) {
      const machineIcon = ViewHelpers.getIconInfo(this.loadedData, machine.id, 'assembling-machine');
      html += ViewHelpers.createIconHtml(machineIcon, { targetSize: 24 });
      
      // 모듈 표시 (기계가 있을 때만 표시 - 별도 컨테이너로 감싸서 비활성 스타일 적용)
      if (this.factoryConfigView && this.factoryConfigView.selectedModule) {
        html += '<div class="module-content">';
        const moduleIcon = ViewHelpers.getIconInfo(this.loadedData, this.factoryConfigView.selectedModule, 'module');
        html += ViewHelpers.createIconHtml(moduleIcon, { targetSize: 24 });
        // 모듈 개수 표시 (기계의 슬롯 수 확인)
        if (machine.module_slots) {
          html += `<span class="module-count">×${machine.module_slots}</span>`;
        }
        html += '</div>';
      }
    } else {
      // 건물이 없는 경우 (커스텀 레시피 등) - 동일한 구조로 빈 아이콘 표시
      const noMachineIcon = {
        type: 'item',
        name: 'no-machine',
        icons: null,
        icon: null
      };
      html += ViewHelpers.createIconHtml(noMachineIcon, { targetSize: 24, placeholder: '🏭' });
      
      // 모듈도 없음 표시
      html += '<div class="module-content">';
      const noModuleIcon = {
        type: 'item',
        name: 'no-module',
        icons: null,
        icon: null
      };
      html += ViewHelpers.createIconHtml(noModuleIcon, { targetSize: 24, placeholder: '❌' });
      html += '</div>';
    }
    
    html += '</div>';

    // 생산품 (productivity 보너스 적용)
    html += '<div class="group-recipe-results">';
    for (const result of results) {
      const iconInfo = ViewHelpers.getIconInfo(this.loadedData, result.name, result.type || 'item');
      let amount = this.getExpectedAmount(result);
      
      // productivity 보너스 계산 (allow_productivity가 true인 경우만)
      if (!recipe._isGroup && recipe.allow_productivity === true && machine) {
        const productivityBonus = this.getProductivityBonus(machine);
        if (productivityBonus > 0) {
          amount *= (1 + productivityBonus);
        }
      }
      
      amount *= (recipeEntry.multiplier || 1);
      html += this.createItemIcon(iconInfo, amount, true);
    }
    html += '</div>';

    // 재료
    html += '<div class="group-recipe-ingredients">';
    for (const ingredient of ingredients) {
      const iconInfo = ViewHelpers.getIconInfo(this.loadedData, ingredient.name, ingredient.type || 'item');
      const amount = this.getExpectedAmount(ingredient) * (recipeEntry.multiplier || 1);
      html += this.createItemIcon(iconInfo, amount, true, ingredient.name, ingredient.type);
    }
    html += '</div>';

    // 배수 입력 (소수점 3자리까지 표시)
    const displayMultiplier = parseFloat((recipeEntry.multiplier || 1).toFixed(3));
    html += '<div class="group-recipe-multiplier">';
    html += `<span class="multiplier-label">×</span>`;
    html += `<input type="number" class="multiplier-input" data-index="${index}" value="${displayMultiplier}" min="0.01" step="0.1" />`;
    html += '</div>';
    
    // 자동 배율 조정 토글 (첫 번째 레시피는 항상 manual, disabled)
    const isAuto = recipeEntry.forceMultiplier !== true;
    const isFirstRecipe = index === 0;
    html += '<div class="group-recipe-auto-multiplier">';
    const autoTitle = isFirstRecipe ? 'First recipe is always manual mode' : (isAuto ? 'Auto multiplier applied' : 'Manual multiplier fixed');
    html += `<label class="toggle-auto-multiplier ${isFirstRecipe ? 'disabled' : ''}" title="${autoTitle}">`;
    html += `<input type="checkbox" class="toggle-checkbox" data-index="${index}" ${isAuto ? 'checked' : ''} ${isFirstRecipe ? 'disabled' : ''}>`;
    html += '<span class="toggle-slider"></span>';
    html += `<span class="toggle-label">${isAuto ? this._t('rgDetailAuto') : this._t('rgDetailManual')}</span>`;
    html += '</label>';
    html += '</div>';

    html += '</div>'; // group-recipe-row

    return html;
  }

  /**
   * 레시피 선택기 렌더링
   */
  renderRecipeSelector() {
    let html = '<div class="recipe-selector">';
    html += `<button class="btn-primary recipe-select-modal-btn">${this._t('rgDetailAddRecipe')}</button>`;
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
   * 레시피 객체 가져오기 (헬퍼 메서드)
   */
  getRecipeObject(recipeEntry) {
    if (recipeEntry.type === 'group') {
      return this.groups.get(recipeEntry.recipeId);
    } else {
      let foundRecipe = null;
      if (this.customRecipeManager && typeof this.customRecipeManager.getRecipe === 'function') {
        foundRecipe = this.customRecipeManager.getRecipe(recipeEntry.recipeId);
      }
      if (!foundRecipe) {
        foundRecipe = this.allRecipes[recipeEntry.recipeId];
      }
      return foundRecipe;
    }
  }

  /**
   * 레시피에 맞는 기계 찾기
   */
  getMachineForRecipe(recipe) {
    if (!recipe || !this.loadedData || !this.loadedData.entities) {
      return null;
    }

    const recipeCategory = recipe.category || 'crafting';

    // assembling-machine 타입의 엔티티에서 crafting_categories가 일치하는 기계들 찾기
    const machines = this.loadedData.entities.filter(entity => {
      // type이 assembling-machine인지 확인
      if (entity.type !== 'assembling-machine') return false;
      
      // crafting_categories가 배열이고 비어있지 않은지 확인
      if (!Array.isArray(entity.crafting_categories) || entity.crafting_categories.length === 0) return false;
      
      // 레시피 카테고리가 포함되어 있는지 확인
      return entity.crafting_categories.includes(recipeCategory);
    });

    if (machines.length === 0) {
      return null;
    }

    // factoryConfigView가 있으면 선호 기계 확인
    if (this.factoryConfigView) {
      return this.factoryConfigView.getPreferredMachineForRecipe(recipe, machines);
    }

    // 없으면 첫 번째 기계 반환
    return machines[0];
  }

  /**
   * 모듈에서 productivity 보너스 계산
   */
  getProductivityBonus(machine) {
    if (!this.factoryConfigView || !this.factoryConfigView.selectedModule || !machine || !machine.module_slots) {
      return 0;
    }

    // 선택된 모듈 데이터 찾기
    const moduleData = this.loadedData?.modules?.find(m => m.id === this.factoryConfigView.selectedModule);
    if (!moduleData || !moduleData.effect || !moduleData.effect.productivity) {
      return 0;
    }

    // productivity 효과 * 모듈 슬롯 수
    const productivityPerModule = moduleData.effect.productivity;
    const totalBonus = productivityPerModule * machine.module_slots;
    
    return totalBonus;
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

    // 폴더 토글
    container.querySelectorAll('.tree-folder-header').forEach(header => {
      header.onclick = () => {
        const folderId = header.dataset.folderId;
        const content = header.parentElement.querySelector('.tree-folder-content');
        const icon = header.querySelector('.tree-folder-icon');
        
        if (content && content.style.display === 'none') {
          content.style.display = 'block';
          icon.textContent = '▼';
          this.expandedFolders.add(folderId);
        } else if (content) {
          content.style.display = 'none';
          icon.textContent = '▶';
          this.expandedFolders.delete(folderId);
        }
      };
    });

    // 레시피 그룹 선택 (tree-item 사용)
    container.querySelectorAll('.tree-item').forEach(item => {
      item.onclick = () => {
        this.selectedGroupId = item.dataset.groupId;
        this.render(this.currentContainer);
      };
    });

    // 기존 list-item도 지원 (호환성)
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

        // 배율 수정 시 자동 배율 모드 끄기
        const recipeEntry = group.recipes[index];
        if (recipeEntry) {
          recipeEntry.multiplier = value;
          recipeEntry.forceMultiplier = true;
        }
        
        this.saveToStorage();
        this.render(this.currentContainer);
      };
    });
    
    // 자동 배율 조정 토글
    container.querySelectorAll('.toggle-checkbox').forEach(checkbox => {
      checkbox.onchange = () => {
        const index = parseInt(checkbox.dataset.index);
        const group = this.groups.get(this.selectedGroupId);
        if (!group) return;
        
        const recipeEntry = group.recipes[index];
        if (!recipeEntry) return;
        
        // forceMultiplier 토글 (체크되면 auto = true, 즉 forceMultiplier = false)
        recipeEntry.forceMultiplier = !checkbox.checked;
        
        // 자동 모드로 전환 시 즉시 배율 재계산
        if (checkbox.checked) {
          group.autoAdjustMultipliers(this.allRecipes, this.groups, this.customRecipeManager, this.factoryConfigView, this.loadedData);
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
      // 로드 실패 시 무시
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
