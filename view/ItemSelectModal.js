import { ViewHelpers } from '../utils/ViewHelpers.js';
import { BaseModalView } from './BaseModalView.js';

export class ItemSelectModal extends BaseModalView {
  constructor(view, onSelect = null) {
    super(view, onSelect);
  }

  /**
   * 아이템 선택 모달 표시
   */
  show() {
    // 모달 HTML 생성
    let modalHtml = `
      <div class="modal-overlay" id="itemSelectModal">
        <div class="modal-content recipe-select-modal">
          <div class="modal-header">
            <h3 class="modal-title">아이템 선택</h3>
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
    let firstGroupWithItems = null;
    console.log(`[ItemSelectModal.show] Found ${itemGroups.length} item-groups`, itemGroups);
    for (const itemGroup of itemGroups) {
      // 아이템이 있는 item-group만 탭 버튼으로 추가
      const hasItems = this.hasEntriesForItemGroup(itemGroup.name, 'item');
      if (hasItems) {
        if (!firstGroupWithItems) {
          firstGroupWithItems = itemGroup;
        }
        modalHtml += `<button class="modal-tab-btn ${firstGroupWithItems === itemGroup ? 'active' : ''}" data-category="${this.escapeHtml(itemGroup.name)}">${this.escapeHtml(this.view.locale.itemName(itemGroup.name))}</button>`;
      }
    }

    modalHtml += `
            </div>
            <div class="recipe-select-content" id="recipeSelectContent">
              ${this.renderTabContent(firstGroupWithItems ? firstGroupWithItems.name : '')}
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
   * 탭 컨텐츠 렌더링 (선택된 탭에 해당하는 아이템 목록 표시)
   */
  renderTabContent(category, searchText) {
    const itemsData = this.getItemsData(category, searchText);
    return this.renderItemsGrid(itemsData);
  }

  /**
   * 아이템 데이터 수집
   */
  getItemsData(category, searchText) {
    const itemGroupName = category;
    const subgroups = this.getSubgroupsForItemGroup(itemGroupName);
    
    // 서브그룹을 order 순으로 정렬
    subgroups.sort((a, b) => {
      const orderA = a.order || '';
      const orderB = b.order || '';
      return orderA.localeCompare(orderB);
    });
    
    // 서브그룹별로 아이템 수집
    const itemsBySubgroup = new Map();
    
    for (const subgroup of subgroups) {
      itemsBySubgroup.set(subgroup.id, []);
    }
    
    const seenItems = new Set();
    const items = (this.view.loadedData?.entries || []).filter(e => e.type === 'item');
    
    for (const item of items) {
      if (seenItems.has(item.id)) continue;
      if (item.subgroup && itemsBySubgroup.has(item.subgroup)) {
        const itemName = this.view.locale.itemName(item.id);
        if (!searchText || itemName.toLowerCase().includes(searchText.toLowerCase())) {
          const iconInfo = ViewHelpers.getIconInfo(this.view.loadedData, item.id, item.type || 'item');
          const iconHtml = ViewHelpers.createItemIconHtml(iconInfo);
          
          itemsBySubgroup.get(item.subgroup).push({
            type: item.type || 'item',
            id: item.id,
            tooltip: itemName || item.id || '',
            iconHtml: iconHtml,
            order: item.order || ''
          });
          seenItems.add(item.id);
        }
      }
    }
    
    // 서브그룹별로 order 순서대로 정렬
    const result = [];
    for (const subgroup of subgroups) {
      const items = itemsBySubgroup.get(subgroup.id);
      if (!items || items.length === 0) continue;
      
      // order로 정렬
      items.sort((a, b) => a.order.localeCompare(b.order));
      
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
    // 첨 번째 탭 버튼의 category 값을 기본값으로 사용
    const modal = document.getElementById('itemSelectModal');
    if (!modal) return;
    
    const firstActiveTab = modal.querySelector('.modal-tab-btn.active');
    const defaultCategory = firstActiveTab ? firstActiveTab.dataset.category : '';
    
    super.attachListeners('itemSelectModal', 'recipeSelectContent', defaultCategory);
  }

  /**
   * 아이템 선택 시 콜백 동작 (매개변수 순서가 다름)
   */
  onItemSelect(type, id, modalId) {
    // ItemSelectModal은 (id, type) 순서로 콜백 호출
    this.onSelect(id, type);
    this.close(modalId);
  }
}
