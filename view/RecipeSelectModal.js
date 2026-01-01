/**
 * RecipeSelectModal - 레시피 선택 모달 관리
 */

import { ViewHelpers } from '../utils/ViewHelpers.js';
import { MODAL_CATEGORIES, MODAL_CONFIG } from '../utils/Constants.js';
import { BaseModalView } from './BaseModalView.js';

export class RecipeSelectModal extends BaseModalView {
  constructor(view, onSelect = null) {
    super(view, onSelect);
  }

  /**
   * 레시피 추가 모달 표시
   */
  show() {
    // RecipeGroupView에서 사용할 때만 그룹 체크
    if (this.view.selectedGroupId !== null && this.view.selectedGroupId !== undefined) {
      const group = this.view.groups.get(this.view.selectedGroupId);
      if (!group) return;
    }

    // 모달 HTML 생성
    let modalHtml = `
      <div class="modal-overlay" id="recipeSelectModal">
        <div class="modal-content recipe-select-modal">
          <div class="modal-header">
            <h3 class="modal-title">레시피 추가</h3>
            <button class="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="modal-search">
              <input type="text" class="modal-search-input" placeholder="검색..." />
            </div>
            <div class="modal-tabs">
    `;

    // item-group 기반 버튼 추가 (레시피가 있는 그룹만)
    const itemGroups = this.getItemGroups();
    console.log(`[RecipeSelectModal.show] Found ${itemGroups.length} item-groups`, itemGroups);
    for (const itemGroup of itemGroups) {
      // 레시피가 있는 item-group만 탭 버튼으로 추가
      const hasRecipes = this.hasEntriesForItemGroup(itemGroup.name, 'recipe');
      if (hasRecipes) {
        modalHtml += `<button class="modal-tab-btn" data-category="${MODAL_CATEGORIES.ITEMGROUP_RECIPES_PREFIX}${this.escapeHtml(itemGroup.name)}">${this.escapeHtml(this.view.locale.itemName(itemGroup.name))}</button>`;
      }
    }

    // 레시피 그룹과 커스텀 레시피는 맨 뒤에 추가 (특별한 색깔)
    modalHtml += `
              <button class="modal-tab-btn modal-tab-special active" data-category="${MODAL_CATEGORIES.RECIPE_GROUPS}">레시피 그룹</button>
              <button class="modal-tab-btn modal-tab-special" data-category="${MODAL_CATEGORIES.CUSTOM_RECIPES}">커스텀 레시피</button>
    `;

    modalHtml += `
            </div>
            <div class="recipe-select-content" id="recipeSelectContent">
    `;

    // 기본으로 레시피 그룹 표시
    modalHtml += this.renderTabContent(MODAL_CATEGORIES.RECIPE_GROUPS, '');

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
   * 탭 컨텐츠 렌더링 (선택된 탭에 해당하는 레시피 목록 표시)
   */
  renderTabContent(category, searchText) {
    console.log(`[RecipeSelectModal.renderTabContent] Category: ${category}`);
    const itemsData = this.getItemsData(category, searchText);
    
    // 각 서브그룹의 아이템들 로그 출력
    for (const subgroup of itemsData.subgroups) {
      console.log(`[RecipeSelectModal.renderTabContent] Subgroup: ${subgroup.id}`);
      for (const item of subgroup.items) {
        //console.log(`  - Item name: ${item.id}, tooltip: ${item.tooltip}`, item);
      }
    }
    
    return this.renderItemsGrid(itemsData);
  }

  /**
   * 카테고리에 따른 아이템 데이터 수집
   */
  getItemsData(category, searchText) {
    if (category === MODAL_CATEGORIES.RECIPE_GROUPS) {
      return this.getRecipeGroupsData(searchText);
    } else if (category === MODAL_CATEGORIES.CUSTOM_RECIPES) {
      return this.getCustomRecipesData(searchText);
    } else if (category.startsWith(MODAL_CATEGORIES.ITEMGROUP_RECIPES_PREFIX)) {
      return this.getItemGroupRecipesData(category, searchText);
    }
    return { subgroups: [] };
  }

  /**
   * 레시피 그룹 데이터 수집
   */
  getRecipeGroupsData(searchText) {
    const items = [];
    
    for (const group of this.view.groups.values()) {
      // 현재 선택된 그룹은 제외
      if (group.id === this.view.selectedGroupId) {
        continue;
      }
      if (searchText && !group.name.toLowerCase().includes(searchText.toLowerCase())) {
        continue;
      }

      console.log('[RecipeSelectModal.getRecipeGroupsData]', this.view.allRecipes);
      const io = group.calculateIO(this.view.allRecipes, this.view.groups);
      const firstResult = io.results && io.results.length > 0 ? io.results[0] : null;
      
      // 결과물이 없으면 아이템을 렌더링하지 않음
      if (!firstResult) {
        continue;
      }
      
      const tooltip = group.name || group.id || '';
      const iconInfo = this.view.getIconInfo(firstResult.name);
      const iconHtml = ViewHelpers.createIconHtml(iconInfo);
      
      items.push({
        type: 'group',
        id: group.id,
        tooltip: tooltip,
        iconHtml: iconHtml,
        order: ''
      });
    }
    
    return {
      subgroups: [{
        id: 'default',
        items: items
      }]
    };
  }

  /**
   * 커스텀 레시피 데이터 수집
   */
  getCustomRecipesData(searchText) {
    const items = [];
    const customRecipes = JSON.parse(localStorage.getItem('customRecipes') || '[]');
    
    for (const customRecipe of customRecipes) {
      const recipeName = customRecipe.name || customRecipe.id || '';
      if (searchText && recipeName && !recipeName.toLowerCase().includes(searchText.toLowerCase())) {
        continue;
      }
      
      const recipeIcons = this.view.getRecipeIcon(customRecipe);
      const iconHtml = this.view.createRecipeIcon(recipeIcons);
      
      items.push({
        type: 'recipe',
        id: customRecipe.id,
        tooltip: recipeName,
        iconHtml: iconHtml,
        order: ''
      });
    }
    
    return {
      subgroups: [{
        id: 'default',
        items: items
      }]
    };
  }

  /**
   * item-group 기반 레시피 데이터 수집
   */
  getItemGroupRecipesData(category, searchText) {
    const itemGroupName = category.substring(MODAL_CATEGORIES.ITEMGROUP_RECIPES_PREFIX.length);
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
      recipesBySubgroup.set(subgroup.id, []);
    }
    
    const seenRecipes = new Set();
    const recipes = (this.view.loadedData?.entries || []).filter(e => e.type === 'recipe');
    const items = (this.view.loadedData?.entries || []).filter(e => e.type === 'item' || e.type === 'fluid');
    
    // 아이템 ID -> 서브그룹, order 매핑
    const itemSubgroupMap = new Map();
    const itemOrderMap = new Map();
    for (const item of items) {
      if (item.subgroup) {
        itemSubgroupMap.set(item.id, item.subgroup);
      }
      if (item.order) {
        itemOrderMap.set(item.id, item.order);
      }
    }
    
    for (const recipe of recipes) {
      if (seenRecipes.has(recipe.id)) continue;
      
      // 레시피의 서브그룹 결정 (공통 메서드 사용)
      const itemSubgroup = this.getRecipeSubgroup(recipe, itemSubgroupMap);
      const itemOrder = recipe.main_product 
        ? itemOrderMap.get(recipe.main_product) || ''
        : (recipe.results && recipe.results.length > 0 
            ? itemOrderMap.get(recipe.results[0].name) || ''
            : '');
      
      if (itemSubgroup && recipesBySubgroup.has(itemSubgroup)) {
        const recipeName = this.view.locale.recipeName(recipe.id);
        if (!searchText || recipeName.toLowerCase().includes(searchText.toLowerCase())) {
          const recipeIcons = this.view.getRecipeIcon(recipe);
          const iconHtml = this.view.createRecipeIcon(recipeIcons);
          
          console.log('[RecipeSelectModal.getItemGroupRecipesData] Adding recipe', recipe.id, 'to subgroup', itemSubgroup);
          recipesBySubgroup.get(itemSubgroup).push({
            type: 'recipe',
            id: recipe.id,
            tooltip: recipeName || recipe.id || '',
            iconHtml: iconHtml,
            order: itemOrder
          });
          seenRecipes.add(recipe.id);
        }
      }
    }
    
    // 서브그룹별로 order 순서대로 정렬
    const result = [];
    for (const subgroup of subgroups) {
      const items = recipesBySubgroup.get(subgroup.id);
      if (!items || items.length === 0) continue;
      
      // order로 정렬 (자연스러운 정렬 사용)
      items.sort((a, b) => ViewHelpers.compareOrder(a.order, b.order));
      
      result.push({
        id: subgroup.id,
        items: items
      });
    }
    
    return { subgroups: result };
  }

  /**
   * 이벤트 리스너 연결
   */
  attachListeners() {
    super.attachListeners('recipeSelectModal', 'recipeSelectContent', MODAL_CATEGORIES.RECIPE_GROUPS);
  }

  /**
   * 기본 아이템 선택 동작 (RecipeGroupView용)
   */
  onDefaultItemSelect(type, id, modalId) {
    const group = this.view.groups.get(this.view.selectedGroupId);
    if (group) {
      group.addRecipe(id, 1, type);
      this.view.saveToStorage();
      this.view.render(document.getElementById('recipe-group-tab'));
      this.close(modalId);
    }
  }
}
