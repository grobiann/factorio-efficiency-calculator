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
import { getTranslation } from '../utils/Translations.js';

/**
 * CompareView - 레시피 그룹과 레시피 비교
 */
export class CompareView {
  constructor(groups, customRecipeManager, allRecipes, locale, loadedData, recipesByProduct, recipeGroupView, factoryConfigView) {
    this.groups = groups;
    this.customRecipeManager = customRecipeManager;
    this.allRecipes = allRecipes;
    this.locale = locale;
    this.loadedData = loadedData;
    this.recipesByProduct = recipesByProduct;
    this.recipeGroupView = recipeGroupView;
    this.factoryConfigView = factoryConfigView;
    
    // 비교 그룹 관리
    this.compareGroups = [];
    this.nextGroupId = 1;
    this.selectedGroupIndex = 0;
    this.expandedFolders = new Set(); // 펼쳐진 폴더 상태 저장
    
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
   * Get translation helper
   */
  _t(key) {
    return getTranslation(key);
  }

  /**
   * 뷰 렌더링
   */
  render(container) {
    const compareTab = container.querySelector('#compare-tab');
    if (!compareTab) return;

    // 렌더링 전에 모든 레시피 그룹의 배율 자동 조정
    this._autoAdjustAllGroups();

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
    html += `<button class="${CSS_CLASSES.PRIMARY}">${this._t('btnAddCompareGroup')}</button>`;
    html += '<div class="list-container">';
    
    if (this.compareGroups.length === 0) {
      html += `<p style="color: #999; text-align: center; padding: 20px;">${this._t('cmpDetailNoGroups')}</p>`;
    } else {
      html += this._buildGroupTree();
    }
    
    html += '</div></div>';
    return html;
  }

  /**
   * 그룹 트리 구조 렌더링
   * @private
   */
  _buildGroupTree() {
    const tree = this._buildTree();
    return this._renderTreeNode(tree, 0, '');
  }

  /**
   * 트리 구조 생성
   * @private
   */
  _buildTree() {
    const root = { children: {}, items: [] };
    
    for (let i = 0; i < this.compareGroups.length; i++) {
      const group = this.compareGroups[i];
      const parts = group.name.split('/');
      let current = root;
      
      for (let j = 0; j < parts.length - 1; j++) {
        const part = parts[j].trim();
        if (!current.children[part]) {
          current.children[part] = { children: {}, items: [] };
        }
        current = current.children[part];
      }
      
      const lastName = parts[parts.length - 1].trim();
      current.items.push({ name: lastName, fullName: group.name, index: i, group });
    }
    
    return root;
  }

  /**
   * 트리 노드를 HTML로 렌더링
   * @private
   */
  _renderTreeNode(node, depth, path = '') {
    let html = '';
    
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
            <span class="tree-folder-name">${ViewHelpers.escapeHtml(folderName)}</span>
          </div>
          <div class="tree-folder-content" id="${folderId}" style="display: ${isExpanded ? 'block' : 'none'};">
            ${this._renderTreeNode(folder, depth + 1, folderPath)}
          </div>
        </div>
      `;
    }
    
    const sortedItems = node.items.sort((a, b) => a.name.localeCompare(b.name));
    for (const item of sortedItems) {
      const isActive = item.index === this.selectedGroupIndex;
      const group = item.group;
      
      // 그룹의 아이템들로부터 아이콘 생성 (최대 3개)
      let iconsHtml = '';
      const maxIcons = 3;
      const displayItems = group.items.slice(0, maxIcons);
      
      for (const groupItem of displayItems) {
        // 각 아이템의 결과물 첫 번째 아이콘 가져오기
        const io = this._calculateIO(groupItem);
        const results = io.results || [];
        if (results.length > 0) {
          const result = results[0];
          const iconInfo = ViewHelpers.getIconInfo(this.loadedData, result.name, result.type || 'item');
          if (iconInfo) {
            const iconHtml = ViewHelpers.createIconHtml(iconInfo, { 
              showBorder: true,
              targetSize: 24
            });
            iconsHtml += `<span class="tree-item-icon-wrapper">${iconHtml}</span>`;
            break; // 첫 번째 아이콘만
          }
        }
      }
      
      if (group.items.length > maxIcons) {
        iconsHtml += `<span class="tree-item-more">+${group.items.length - maxIcons}</span>`;
      }
      
      html += `
        <div class="tree-item ${isActive ? 'selected' : ''}" data-index="${item.index}" style="padding-left: ${depth * 16}px;">
          <span class="tree-item-name">${ViewHelpers.escapeHtml(item.name)}</span>
          <div class="tree-item-icons">${iconsHtml}</div>
        </div>
      `;
    }
    
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
      html += `<p style="color: #999; margin-bottom: 20px;">${this._t('cmpDetailNoGroups')}</p>`;
      html += `<p style="color: #666; margin-bottom: 20px;">${this._t('cmpDetailNoGroupsHint')}</p>`;
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
    html += `<input type="text" class="compare-group-name-input" value="${ViewHelpers.escapeHtml(group.name)}" placeholder="${this._t('cmpDetailGroupName')}">`;
    html += `<button class="${CSS_CLASSES.DANGER} delete-compare-group-btn">${this._t('cmpDetailDeleteGroup')}</button>`;
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
    html += `<th class="compare-name-col">${this._t('cmpDetailRecipeGroup')}</th>`;
    html += `<th class="compare-output-col">${this._t('cmpDetailOutput')}</th>`
    html += `<th class="compare-input-col">${this._t('cmpDetailInput')}</th>`;
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
    
    // 수량이 0.5 이하인 항목 필터링 및 이름순 정렬
    const visibleItems = items.filter(item => item.amount > 0.5)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    if (visibleItems.length === 0) {
      return '<span class="compare-io-empty">-</span>';
    }
    
    let html = '<div class="compare-io-icons">';
    for (const item of visibleItems) {
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
    html += `<span>${this._t('cmpDetailAddItem')}</span>`;
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
    this.recipeSelectModal.show();
  }

  /**
   * 레시피 선택 콜백
   * @private
   */
  _onRecipeSelected(type, id) {
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

    // 폴더 토글
    container.querySelectorAll('.tree-folder-header').forEach(header => {
      header.addEventListener('click', () => {
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
      });
    });

    // 그룹 선택 (tree-item)
    container.querySelectorAll('.tree-item').forEach(item => {
      item.addEventListener('click', () => {
        this.selectedGroupIndex = parseInt(item.dataset.index);
        this.render(document);
      });
    });

    // 기존 list-item도 지원 (호환성)
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
    if (itemType === ENTRY_TYPES.GROUP) {
      // 레시피 그룹인 경우 해당 그룹 선택
      this.recipeGroupView.selectedGroupId = itemId;
    } else {
      // 일반 레시피 또는 커스텀 레시피인 경우 새 레시피 그룹 생성
      // 커스텀 레시피 매니저에서 먼저 찾고, 없으면 allRecipes에서 찾음
      const recipe = this.customRecipeManager.getRecipe(itemId) || this.allRecipes[itemId];
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

    // 폴더 구조로 렌더링
    let html = '';
    if (this.compareGroups.length === 0) {
      html = `<p style="color: #999; text-align: center; padding: 20px;">${this._t('cmpDetailNoGroups')}</p>`;
    } else {
      html = this._buildGroupTree();
    }
    sidebar.innerHTML = html;
    
    // 이벤트 재등록
    // 폴더 토글 이벤트
    sidebar.querySelectorAll('.tree-folder-header').forEach(header => {
      header.addEventListener('click', () => {
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
      });
    });
    
    // 그룹 선택 이벤트
    const groupItems = sidebar.querySelectorAll('.tree-item');
    groupItems.forEach(item => {
      item.addEventListener('click', () => {
        this.selectedGroupIndex = parseInt(item.dataset.index);
        this.render(document);
      });
    });
  }

  /**
   * 모든 레시피 그룹의 배율 자동 조정
   * @private
   */
  _autoAdjustAllGroups() {
    // 먼저 groups Map의 모든 레시피 그룹의 배율을 조정
    for (const group of this.groups.values()) {
      group.autoAdjustMultipliers(this.allRecipes, this.groups, this.customRecipeManager, this.factoryConfigView, this.loadedData);
    }
    
    // 비교 그룹에 포함된 모든 레시피 그룹의 배율 조정 (중복이지만 확실하게)
    for (const compareGroup of this.compareGroups) {
      for (const item of compareGroup.items) {
        if (item.type === ENTRY_TYPES.GROUP && item.data) {
          item.data.autoAdjustMultipliers(this.allRecipes, this.groups, this.customRecipeManager, this.factoryConfigView, this.loadedData);
        }
      }
    }
  }

  /**
   * IO 계산
   * @private
   */
  _calculateIO(item) {
    if (item.type === ENTRY_TYPES.GROUP) {
      return item.data.calculateIO(this.allRecipes, this.groups, new Set(), this.customRecipeManager, this.factoryConfigView, this.loadedData);
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
      // 저장 실패 시 무시
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
      // 로드 실패 시 무시
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
