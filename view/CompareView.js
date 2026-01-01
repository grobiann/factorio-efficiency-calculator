import { ViewHelpers } from '../utils/ViewHelpers.js';
import { RecipeSelectModal } from './RecipeSelectModal.js';
import { 
  STORAGE_KEYS, 
  ENTRY_TYPES, 
  ERROR_MESSAGES,
  IO_SECTION_TYPES,
  IO_SECTION_TITLES,
  UI_CONFIG,
  CSS_CLASSES
} from '../utils/Constants.js';

/**
 * CompareView - 레시피 그룹과 레시피 비교
 */
export class CompareView {
  constructor(groups, customRecipeManager, allRecipes, locale, loadedData, recipesByProduct, recipeGroupView) {
    this.groups = groups;
    this.customRecipeManager = customRecipeManager;
    this.allRecipes = allRecipes;
    this.locale = locale;
    this.loadedData = loadedData;
    this.recipesByProduct = recipesByProduct;
    this.recipeGroupView = recipeGroupView;
    
    // 비교 그룹 관리
    this.compareGroups = [];
    this.nextGroupId = 1;
    this.selectedGroupIndex = 0;
    
    // RecipeSelectModal 생성 (콜백 방식)
    this.recipeSelectModal = new RecipeSelectModal(
      {
        groups: this.groups,
        allRecipes: this.allRecipes,
        recipesByProduct: this.recipesByProduct,
        locale: this.locale,
        loadedData: this.loadedData,
        selectedGroupId: null,
        getIconInfo: this.getIconInfo.bind(this),
        getRecipeIcon: this.getRecipeIcon.bind(this),
        createRecipeIcon: this.createRecipeIcon.bind(this)
      },
      (type, id) => this._onRecipeSelected(type, id)
    );
    
    this._loadFromStorage();
  }

  /**
   * 뷰 렌더링
   */
  render(container) {
    const compareTab = container.querySelector('#compare-tab');
    if (!compareTab) return;

    compareTab.innerHTML = this._buildHtml();
    this._attachEvents(compareTab);
  }

  /**
   * 전체 HTML 구조 생성
   * @private
   */
  _buildHtml() {
    let html = '<div class="compare-management">';
    html += this._buildSidebar();
    html += this._buildDetailSection();
    html += '</div>';
    return html;
  }

  /**
   * 사이드바 HTML 생성
   * @private
   */
  _buildSidebar() {
    let html = '<div class="sidebar-container">';
    html += `<button class="${CSS_CLASSES.PRIMARY}">새 비교그룹 추가</button>`;
    html += '<div class="list-container">';
    
    if (this.compareGroups.length === 0) {
      html += '<p style="color: #999; text-align: center; padding: 20px;">비교그룹이 없습니다.</p>';
    } else {
      for (let i = 0; i < this.compareGroups.length; i++) {
        const group = this.compareGroups[i];
        const isActive = i === this.selectedGroupIndex;
        html += `
          <div class="list-item ${isActive ? 'selected' : ''}" data-index="${i}">
            <span class="list-item-name">${ViewHelpers.escapeHtml(group.name)}</span>
            <span class="list-item-count">(${group.items.length})</span>
          </div>
        `;
      }
    }
    
    html += '</div></div>';
    return html;
  }

  /**
   * 상세 영역 HTML 생성
   * @private
   */
  _buildDetailSection() {
    let html = '<div class="compare-group-detail">';
    
    if (this.compareGroups.length > 0) {
      html += this._buildGroupDetail(this.compareGroups[this.selectedGroupIndex]);
    } else {
      html += '<div style="text-align: center; padding: 40px;">';
      html += '<p style="color: #999; margin-bottom: 20px;">비교그룹이 없습니다.</p>';
      html += '<p style="color: #666; margin-bottom: 20px;">왼쪽의 "새 비교그룹 추가" 버튼을 클릭하여 시작하세요.</p>';
      html += '</div>';
    }
    
    html += '</div>';
    return html;
  }

  /**
   * 그룹 상세 정보 렌더링
   * @private
   */
  _buildGroupDetail(group) {
    let html = '<div class="compare-detail-container">';
    
    // 그룹 헤더
    html += this._buildGroupHeader(group);

    // 비교 그리드
    html += this._buildCompareGrid(group);
    
    html += '</div>';
    return html;
  }

  /**
   * 그룹 헤더 생성
   * @private
   */
  _buildGroupHeader(group) {
    let html = '<div class="compare-group-header">';
    html += `<input type="text" class="compare-group-name-input" value="${ViewHelpers.escapeHtml(group.name)}" placeholder="비교 그룹 이름">`;
    html += `<button class="${CSS_CLASSES.DANGER} delete-compare-group-btn">그룹 삭제</button>`;
    html += '</div>';
    return html;
  }

  /**
   * 비교 그리드 생성
   * @private
   */
  _buildCompareGrid(group) {
    let html = '<div class="compare-section">';
    html += '<table class="compare-table">';
    
    // 헤더 행
    html += '<thead>';
    html += '<tr>';
    html += '<th class="compare-name-col">레시피 그룹</th>';
    html += '<th class="compare-output-col">출력</th>'
    html += '<th class="compare-input-col">입력</th>';
    html += '<th class="compare-action-col"></th>';
    html += '</tr>';
    html += '</thead>';
    
    html += '<tbody>';
    
    // 선택된 항목들
    for (let i = 0; i < group.items.length; i++) {
      html += this._buildCompareRow(group.items[i], i);
    }
    
    // 추가 버튼 행
    html += this._buildAddRow();
    
    html += '</tbody>';
    html += '</table></div>';
    return html;
  }

  /**
   * 비교 테이블 행 렌더링
   * @private
   */
  _buildCompareRow(item, index) {
    const io = this._calculateIO(item);

    let html = '<tr class="compare-row">';
    
    // 이름 셀
    html += '<td class="compare-name-cell">';
    html += `<span class="compare-item-name clickable" data-item-type="${item.type}" data-item-id="${item.id}">${ViewHelpers.escapeHtml(item.data.name)}</span>`;
    html += '</td>';
    
    // 출력 셀
    html += '<td class="compare-output-cell">';
    html += this._buildIOIcons(io.results);
    html += '</td>';
    
    // 입력 셀
    html += '<td class="compare-input-cell">';
    html += this._buildIOIcons(io.ingredients);
    html += '</td>';
    
    // 액션 셀 (삭제 버튼)
    html += '<td class="compare-action-cell">';
    html += `<button class="compare-row-remove" data-index="${index}">✕</button>`;
    html += '</td>';
    
    html += '</tr>';
    return html;
  }

  /**
   * IO 아이콘 리스트 생성
   * @private
   */
  _buildIOIcons(items) {
    if (!items || items.length === 0) {
      return '<span class="compare-io-empty">-</span>';
    }
    
    let html = '<div class="compare-io-icons">';
    for (const item of items) {
      const iconInfo = ViewHelpers.getIconInfo(this.loadedData, item.name, item.type || 'item');
      html += ViewHelpers.createItemIconHtml(iconInfo, item.amount, ViewHelpers.formatAmount);
    }
    html += '</div>';
    return html;
  }

  /**
   * 추가 버튼 행 렌더링
   * @private
   */
  _buildAddRow() {
    let html = '<tr class="compare-add-row">';
    html += '<td colspan="4" class="compare-add-cell">';
    html += '<button class="compare-add-btn">';
    html += '<svg class="compare-plus-icon" viewBox="0 0 24 24" width="20" height="20">';
    html += '<path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>';
    html += '</svg>';
    html += '<span>항목 추가</span>';
    html += '</button>';
    html += '</td>';
    html += '</tr>';
    return html;
  }

  /**
   * 선택 모달 표시
   * @private
   */
  _showSelectionModal() {
    console.log('[CompareView] 모달 열기 시작');
    this.recipeSelectModal.show();
  }

  /**
   * 레시피 선택 콜백
   * @private
   */
  _onRecipeSelected(type, id) {
    console.log('[CompareView] 선택된 항목:', type, id);
    let data;
    if (type === 'group') {
      data = this.groups.get(id);
    } else if (type === 'recipe') {
      // 커스텀 레시피 찾기
      const customRecipes = JSON.parse(localStorage.getItem('customRecipes') || '[]');
      data = customRecipes.find(r => r.id === id);
      if (!data) {
        // 일반 레시피
        data = this.allRecipes[id];
      }
    } else {
      // 일반 레시피
      data = this.allRecipes[id];
    }
    
    if (data) {
      this.compareGroups[this.selectedGroupIndex].items.push({ 
        type: type === 'group' ? ENTRY_TYPES.GROUP : ENTRY_TYPES.RECIPE, 
        id, 
        data 
      });
      this._saveToStorage();
      this.render(document);
    }
  }

  /**
   * 모달 항목 선택 이벤트 연결
   * @private
   */
  _attachModalItemEvents(modal) {
    const itemBtns = modal.querySelectorAll('.compare-modal-item');
    itemBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const id = btn.dataset.id;
        
        const data = type === ENTRY_TYPES.GROUP 
          ? this.groups.get(id)
          : this.customRecipeManager.getRecipe(id);
        
        if (data) {
          this.compareGroups[this.selectedGroupIndex].items.push({ type, id, data });
          this._saveToStorage();
          modal.remove();
          this.render(document);
        }
      });
    });
  }

  /**
   * 모달 리스트 생성
   * @private
   */
  _buildModalList() {
    let html = '<div class="compare-modal-list">';
    
    const currentGroup = this.compareGroups[this.selectedGroupIndex];
    
    // 레시피 그룹
    for (const [groupId, group] of this.groups) {
      if (!this._isItemSelected(currentGroup, ENTRY_TYPES.GROUP, groupId)) {
        html += `<button class="compare-modal-item" data-type="${ENTRY_TYPES.GROUP}" data-id="${groupId}">`;
        html += `<span>${ViewHelpers.escapeHtml(group.name)}</span>`;
        html += `</button>`;
      }
    }
    
    // 레시피
    const recipes = this.customRecipeManager.getAllRecipes();
    for (const recipe of recipes) {
      if (!this._isItemSelected(currentGroup, ENTRY_TYPES.RECIPE, recipe.id)) {
        html += `<button class="compare-modal-item" data-type="${ENTRY_TYPES.RECIPE}" data-id="${recipe.id}">`;
        html += `<span>${ViewHelpers.escapeHtml(recipe.name)}</span>`;
        html += `</button>`;
      }
    }
    
    html += '</div>';
    return html;
  }

  /**
   * 항목이 이미 선택되었는지 확인
   * @private
   */
  _isItemSelected(group, type, id) {
    return group.items.some(item => item.type === type && item.id === id);
  }

  /**
   * 이벤트 리스너 연결
   * @private
   */
  _attachEvents(container) {
    this._attachGroupManagementEvents(container);
    this._attachCompareEvents(container);
  }

  /**
   * 그룹 관리 이벤트 연결
   * @private
   */
  _attachGroupManagementEvents(container) {
    // 그룹 추가
    const addGroupBtn = container.querySelector('.sidebar-container .btn-primary');
    if (addGroupBtn) {
      addGroupBtn.addEventListener('click', () => this._addGroup());
    }

    // 그룹 선택
    const groupItems = container.querySelectorAll('.list-item');
    groupItems.forEach(item => {
      item.addEventListener('click', () => {
        this.selectedGroupIndex = parseInt(item.dataset.index);
        this.render(document);
      });
    });

    // 그룹 이름 변경
    const nameInput = container.querySelector('.compare-group-name-input');
    if (nameInput) {
      const debouncedUpdate = ViewHelpers.debounce(() => {
        this.compareGroups[this.selectedGroupIndex].name = nameInput.value;
        this._saveToStorage();
        this._updateSidebar(container);
      }, UI_CONFIG.DEBOUNCE_DELAY);
      
      nameInput.addEventListener('input', debouncedUpdate);
    }

    // 그룹 삭제
    const deleteGroupBtn = container.querySelector('.delete-compare-group-btn');
    if (deleteGroupBtn) {
      deleteGroupBtn.addEventListener('click', () => this._deleteGroup());
    }
  }

  /**
   * 비교 항목 이벤트 연결
   * @private
   */
  _attachCompareEvents(container) {
    // 항목 추가
    const addBtn = container.querySelector('.compare-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this._showSelectionModal();
      });
    }

    // 항목 제거
    const removeBtns = container.querySelectorAll('.compare-row-remove');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        this._removeItem(index);
      });
    });

    // 이름 클릭 -> 레시피 그룹 탭으로 이동
    const nameElements = container.querySelectorAll('.compare-item-name.clickable');
    nameElements.forEach(nameEl => {
      nameEl.addEventListener('click', () => {
        const itemType = nameEl.dataset.itemType;
        const itemId = nameEl.dataset.itemId;
        this._navigateToRecipeGroup(itemType, itemId);
      });
    });
  }

  /**
   * 레시피 그룹 탭으로 이동
   * @private
   */
  _navigateToRecipeGroup(itemType, itemId) {
    console.log('[CompareView] 레시피 그룹 탭으로 이동:', itemType, itemId);
    if (itemType === ENTRY_TYPES.GROUP) {
      // 레시피 그룹인 경우 해당 그룹 선택
      this.recipeGroupView.selectedGroupId = itemId;
    } else {
      // 일반 레시피 또는 커스텀 레시피인 경우 새 레시피 그룹 생성
      // 커스텀 레시피 매니저에서 먼저 찾고, 없으면 allRecipes에서 찾음
      const recipe = this.customRecipeManager.getRecipe(itemId) || this.allRecipes[itemId];
      console.log('[CompareView] 새 레시피 그룹 생성용 레시피:', recipe);
      if (recipe) {
        this.recipeGroupView.addGroup();
        const newGroupId = this.recipeGroupView.selectedGroupId;
        const newGroup = this.recipeGroupView.groups.get(newGroupId);
        if (newGroup) {
          newGroup.name = `${recipe.name} 그룹`;
          newGroup.addRecipe(itemId, 1, 'recipe');
          this.recipeGroupView.saveToStorage();
          
          // 비교 항목에서 레시피를 새 레시피 그룹으로 교체
          const currentGroup = this.compareGroups[this.selectedGroupIndex];
          if (currentGroup) {
            const itemIndex = currentGroup.items.findIndex(item => 
              item.type === ENTRY_TYPES.RECIPE && item.id === itemId
            );
            if (itemIndex !== -1) {
              // 레시피를 레시피 그룹으로 교체
              currentGroup.items[itemIndex] = {
                type: ENTRY_TYPES.GROUP,
                id: newGroupId,
                data: newGroup
              };
              this._saveToStorage();
            }
          }
        }
      }
    }
    
    // 레시피 그룹 탭으로 전환
    const recipeGroupTab = document.querySelector('.tab-btn[data-tab="recipe-group"]');
    if (recipeGroupTab) {
      recipeGroupTab.click();
    }
  }

  /**
   * 그룹 추가
   * @private
   */
  _addGroup() {
    const newGroup = {
      id: this.nextGroupId++,
      name: `비교 그룹 ${this.nextGroupId - 1}`,
      items: []
    };
    this.compareGroups.push(newGroup);
    this.selectedGroupIndex = this.compareGroups.length - 1;
    this._saveToStorage();
    this.render(document);
  }

  /**
   * 그룹 삭제
   * @private
   */
  _deleteGroup() {
    this.compareGroups.splice(this.selectedGroupIndex, 1);
    this.selectedGroupIndex = Math.max(0, this.selectedGroupIndex - 1);
    this._saveToStorage();
    this.render(document);
  }

  /**
   * 항목 제거
   * @private
   */
  _removeItem(index) {
    this.compareGroups[this.selectedGroupIndex].items.splice(index, 1);
    this._saveToStorage();
    this.render(document);
  }

  /**
   * 사이드바만 업데이트
   * @private
   */
  _updateSidebar(container) {
    const sidebar = container.querySelector('.list-container');
    if (!sidebar) return;

    let html = '';
    for (let i = 0; i < this.compareGroups.length; i++) {
      const group = this.compareGroups[i];
      const isActive = i === this.selectedGroupIndex;
      html += `
        <div class="list-item ${isActive ? 'selected' : ''}" data-index="${i}">
          <span class="list-item-name">${ViewHelpers.escapeHtml(group.name)}</span>
          <span class="list-item-count">(${group.items.length})</span>
        </div>
      `;
    }
    sidebar.innerHTML = html;
    
    // 이벤트 재등록
    const groupItems = sidebar.querySelectorAll('.list-item');
    groupItems.forEach(item => {
      item.addEventListener('click', () => {
        this.selectedGroupIndex = parseInt(item.dataset.index);
        this.render(document);
      });
    });
  }

  /**
   * IO 계산
   * @private
   */
  _calculateIO(item) {
    if (item.type === ENTRY_TYPES.GROUP) {
      return item.data.calculateIO(this.allRecipes, this.groups);
    }
    return {
      ingredients: item.data.ingredients || [],
      results: item.data.results || []
    };
  }

  /**
   * localStorage에 저장
   * @private
   */
  _saveToStorage() {
    try {
      const data = {
        groups: this.compareGroups.map(g => ({
          id: g.id,
          name: g.name,
          items: g.items.map(item => ({ type: item.type, id: item.id }))
        })),
        nextGroupId: this.nextGroupId,
        selectedIndex: this.selectedGroupIndex
      };
      localStorage.setItem(STORAGE_KEYS.COMPARE_GROUPS, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save compare groups:', e);
    }
  }

  /**
   * localStorage에서 로드
   * @private
   */
  _loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPARE_GROUPS);
      if (!data) return;

      const parsed = JSON.parse(data);
      if (!parsed || !ViewHelpers.isValidArray(parsed.groups)) return;

      this.compareGroups = parsed.groups.map(g => ({
        id: g.id,
        name: g.name,
        items: g.items.map(item => {
          let data;
          if (item.type === ENTRY_TYPES.GROUP) {
            data = this.groups.get(item.id);
          } else {
            // 커스텀 레시피 또는 일반 레시피
            data = this.customRecipeManager.getRecipe(item.id) || this.allRecipes[item.id];
          }
          return data ? { type: item.type, id: item.id, data } : null;
        }).filter(Boolean)
      }));

      this.nextGroupId = parsed.nextGroupId || this.compareGroups.length + 1;
      this.selectedGroupIndex = Math.min(
        parsed.selectedIndex || 0,
        this.compareGroups.length - 1
      );
    } catch (e) {
      console.error('Failed to load compare groups:', e);
    }
  }

  /**
   * 아이콘 정보 가져오기 (RecipeSelectModal용)
   */
  getIconInfo(itemId, itemType = 'item') {
    return ViewHelpers.getIconInfo(this.loadedData, itemId, itemType);
  }

  /**
   * 레시피 아이콘 정보 가져오기 (RecipeSelectModal용)
   */
  getRecipeIcon(recipe) {
    return ViewHelpers.getRecipeIcon(recipe, this.loadedData);
  }

  /**
   * 레시피 아이콘 생성 (RecipeSelectModal용)
   */
  createRecipeIcon(icons) {
    return ViewHelpers.createRecipeIconHtml(icons);
  }
}
