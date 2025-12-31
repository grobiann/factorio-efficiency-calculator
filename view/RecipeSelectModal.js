/**
 * RecipeSelectModal - 레시피 선택 모달 관리
 */

// 카테고리 상수
const CATEGORY = {
  RECIPE_GROUPS: 'recipegroup-recipes',
  CUSTOM_RECIPES: 'custom-recipes',
  ITEMGROUP_RECIPES_PREFIX: 'itemgroup-recipes'
};

export class RecipeSelectModal {
  constructor(view) {
    this.view = view;
  }

  /**
   * 레시피 추가 모달 표시
   */
  show() {
    const group = this.view.groups.get(this.view.selectedGroupId);
    if (!group) return;

    // 모달 HTML 생성
    let modalHtml = `
      <div class="modal-overlay" id="recipeAddModal">
        <div class="modal-content recipe-add-modal">
          <div class="modal-header">
            <h3 class="modal-title">레시피 추가</h3>
            <button class="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="recipe-add-search">
              <input type="text" class="recipe-search-input" placeholder="검색..." />
            </div>
            <div class="recipe-add-tabs">
              <button class="recipe-tab-btn active" data-category="${CATEGORY.RECIPE_GROUPS}">레시피 그룹</button>
              <button class="recipe-tab-btn" data-category="${CATEGORY.CUSTOM_RECIPES}">커스텀 레시피</button>
    `;

    // item-group 기반 버튼 추가 (레시피가 있는 그룹만)
    const itemGroups = this.getItemGroups();
    for (const itemGroup of itemGroups) {
      // 레시피가 있는 item-group만 탭 버튼으로 추가
      if (this.hasRecipesForItemGroup(itemGroup.name)) {
        modalHtml += `<button class="recipe-tab-btn" data-category="${CATEGORY.ITEMGROUP_RECIPES_PREFIX}${this.escapeHtml(itemGroup.name)}">${this.escapeHtml(this.view.locale.itemName(itemGroup.name))}</button>`;
      }
    }

    modalHtml += `
            </div>
            <div class="recipe-add-items" id="recipeAddItems">
    `;

    // 기본으로 레시피 그룹 표시
    modalHtml += this.renderTabContent(CATEGORY.RECIPE_GROUPS, '');

    modalHtml += `
            </div>
          </div>
        </div>
      </div>
    `;

    // 모달 추가
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.classList.add('modal-open');

    // 이벤트 리스너 등록
    this.attachListeners();
  }

  /**
   * item-group 목록 가져오기 (order 순서로 정렬)
   */
  getItemGroups() {
    if (!this.view.loadedData || !this.view.loadedData.entries) return [];
    
    const itemGroups = this.view.loadedData.entries.filter(entry => entry.type === 'item-group');
    return itemGroups.sort((a, b) => {
      const orderA = a.order || '';
      const orderB = b.order || '';
      return orderA.localeCompare(orderB);
    });
  }

  /**
   * 특정 item-group에 속한 item-subgroup들 가져오기
   */
  getSubgroupsForItemGroup(itemGroupName) {
    if (!this.view.loadedData || !this.view.loadedData.entries) return [];
    
    return this.view.loadedData.entries.filter(entry => 
      entry.type === 'item-subgroup' && entry.group === itemGroupName
    );
  }

  /**
   * item-group에 레시피가 있는지 확인
   */
  hasRecipesForItemGroup(itemGroupName) {
    const subgroups = this.getSubgroupsForItemGroup(itemGroupName);
    const subgroupNames = new Set(subgroups.map(sg => sg.name));
    
    // 모든 레시피를 탐색하여 서브그룹에 맞는 레시피가 있는지 확인
    for (const recipes of Object.values(this.view.recipesByProduct)) {
      for (const recipe of recipes) {
        if (recipe._isGroup) continue;
        
        // 레시피의 결과 아이템들을 확인
        const results = recipe.results || [];
        
        for (const result of results) {
          // 결과 아이템의 subgroup과 order 확인
          const itemData = this.view.loadedData.entries.find(e => 
            e.name === result.name && (e.type === 'item' || e.type === 'fluid')
          );
          
          if (itemData && subgroupNames.has(itemData.subgroup)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  /**
   * 탭 컨텐츠 렌더링 (선택된 탭에 해당하는 레시피 목록 표시)
   */
  renderTabContent(category, searchText) {
    let html = '<div class="recipe-add-grid">';

    if (category === CATEGORY.RECIPE_GROUPS) {
      html += this.renderRecipeGroupRecipes(searchText);
    } else if (category === CATEGORY.CUSTOM_RECIPES) {
      html += this.renderCustomRecipes(searchText);
    } else if (category.startsWith(CATEGORY.ITEMGROUP_RECIPES_PREFIX)) {
      html += this.renderItemGroupRecipes(category, searchText);
    }

    html += '</div>';
    return html;
  }

  /**
   * 레시피 그룹 렌더링
   */
  renderRecipeGroupRecipes(searchText) {
    let html = '';
    
    for (const group of this.view.groups.values()) {
      // 현재 선택된 그룹은 제외
      if (group.id === this.view.selectedGroupId) {
        continue;
      }
      if (searchText && !group.name.toLowerCase().includes(searchText.toLowerCase())) {
        continue;
      }
      const io = group.calculateIO(this.view.allRecipes, this.view.groups);
      const firstResult = io.results && io.results.length > 0 ? io.results[0] : null;
      
      // 결과물이 없으면 아이템을 렌더링하지 않음
      if (!firstResult) {
        continue;
      }
      
      html += `<div class="recipe-add-item" data-type="group" data-id="${group.id}" title="${this.escapeHtml(group.name)}">`;
      const iconInfo = this.view.getIconInfo(firstResult.name);
      if (iconInfo && iconInfo.path) {
        html += `<img src="${iconInfo.path}" alt="${this.escapeHtml(group.name)}" class="recipe-add-icon" />`;
      } else {
        html += `<div class="recipe-add-icon-placeholder">?</div>`;
      }
      html += `</div>`;
    }
    
    return html;
  }

  /**
   * 커스텀 레시피 렌더링
   */
  renderCustomRecipes(searchText) {
    let html = '';
    const customRecipes = JSON.parse(localStorage.getItem('customRecipes') || '[]');
    
    for (const customRecipe of customRecipes) {
      const recipeName = customRecipe.name || customRecipe.id;
      if (searchText && !recipeName.toLowerCase().includes(searchText.toLowerCase())) {
        continue;
      }
      
      html += `<div class="recipe-add-item" data-type="recipe" data-id="${customRecipe.id}" title="${this.escapeHtml(recipeName)}">`;
      const recipeIcons = this.view.getRecipeIcon(customRecipe);
      html += this.view.createRecipeIcon(recipeIcons);
      html += `</div>`;
    }
    
    return html;
  }

  /**
   * item-group 기반 레시피 렌더링
   */
  renderItemGroupRecipes(category, searchText) {
    let html = '';
    const itemGroupName = category.substring(CATEGORY.ITEMGROUP_RECIPES_PREFIX.length);
    const subgroups = this.getSubgroupsForItemGroup(itemGroupName);
    
    // 서브그룹을 order 순으로 정렬
    subgroups.sort((a, b) => {
      const orderA = a.order || '';
      const orderB = b.order || '';
      return orderA.localeCompare(orderB);
    });
    
    // 서브그룹별로 레시피 수집
    const recipesBySubgroup = new Map();
    
    for (const subgroup of subgroups) {
      recipesBySubgroup.set(subgroup.name, []);
    }
    
    const seenRecipes = new Set();
    
    // 모든 레시피를 탐색하여 서브그룹별로 분류
    for (const recipes of Object.values(this.view.recipesByProduct)) {
      for (const recipe of recipes) {
        if (recipe._isGroup || seenRecipes.has(recipe.id)) continue;
        
        // 레시피의 결과 아이템들을 확인
        const results = recipe.results || [];
        
        for (const result of results) {
          // 결과 아이템의 subgroup과 order 확인
          const itemData = this.view.loadedData.entries.find(e => 
            e.name === result.name && (e.type === 'item' || e.type === 'fluid')
          );
          
          if (itemData && itemData.subgroup && recipesBySubgroup.has(itemData.subgroup)) {
            const recipeName = this.view.locale.recipeName(recipe.id);
            if (!searchText || recipeName.toLowerCase().includes(searchText.toLowerCase())) {
              recipesBySubgroup.get(itemData.subgroup).push({
                recipe: recipe,
                order: itemData.order || ''
              });
              seenRecipes.add(recipe.id);
            }
            break;
          }
        }
      }
    }
    
    // 첫 번째 그리드 닫기
    html += '</div>';
    
    // 서브그룹별로 order 순서대로 정렬 후 렌더링
    for (const subgroup of subgroups) {
      const subgroupRecipes = recipesBySubgroup.get(subgroup.name);
      if (!subgroupRecipes || subgroupRecipes.length === 0) continue;
      
      // order로 정렬
      subgroupRecipes.sort((a, b) => a.order.localeCompare(b.order));
      
      // 각 서브그룹마다 별도의 그리드 생성
      html += '<div class="recipe-add-grid recipe-subgroup-grid">';
      
      // 해당 서브그룹의 레시피들 렌더링
      for (const { recipe } of subgroupRecipes) {
        const recipeName = this.view.locale.recipeName(recipe.id);
        
        html += `<div class="recipe-add-item" data-type="recipe" data-id="${recipe.id}" title="${this.escapeHtml(recipeName)}">`;
        const recipeIcons = this.view.getRecipeIcon(recipe);
        html += this.view.createRecipeIcon(recipeIcons);
        html += `</div>`;
      }
      
      html += '</div>'; // recipe-subgroup-grid 닫기
    }
    
    // 마지막에 빈 그리드 열기 (다음 카테고리를 위해)
    html += '<div class="recipe-add-grid">';
    
    return html;
  }

  /**
   * 이벤트 리스너 연결
   */
  attachListeners() {
    const modal = document.getElementById('recipeAddModal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal-close-btn');
    const overlay = modal;
    const searchInput = modal.querySelector('.recipe-search-input');
    const tabBtns = modal.querySelectorAll('.recipe-tab-btn');
    const itemsContainer = modal.querySelector('#recipeAddItems');

    // 닫기 버튼
    closeBtn.onclick = () => {
      document.body.classList.remove('modal-open');
      modal.remove();
    };

    // 오버레이 클릭
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        document.body.classList.remove('modal-open');
        modal.remove();
      }
    };

    // ESC 키
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        document.body.classList.remove('modal-open');
        modal.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // 탭 버튼
    let currentCategory = CATEGORY.RECIPE_GROUPS;
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        itemsContainer.innerHTML = this.renderTabContent(currentCategory, searchInput.value);
        this.attachItemListeners();
      };
    });

    // 검색
    searchInput.oninput = () => {
      itemsContainer.innerHTML = this.renderTabContent(currentCategory, searchInput.value);
      this.attachItemListeners();
    };

    // 아이템 클릭 리스너
    this.attachItemListeners();
  }

  /**
   * 레시피 아이템 클릭 리스너
   */
  attachItemListeners() {
    const modal = document.getElementById('recipeAddModal');
    if (!modal) return;

    const items = modal.querySelectorAll('.recipe-add-item');
    items.forEach(item => {
      item.onclick = () => {
        const type = item.dataset.type;
        const id = item.dataset.id;
        
        const group = this.view.groups.get(this.view.selectedGroupId);
        if (group) {
          group.addRecipe(id, 1, type);
          this.view.saveToStorage();
          this.view.render(document.getElementById('recipe-group-tab'));
          document.body.classList.remove('modal-open');
          modal.remove();
        }
      };
    });
  }

  /**
   * HTML 이스케이프
   */
  escapeHtml(text) {
    return this.view.escapeHtml(text);
  }
}
