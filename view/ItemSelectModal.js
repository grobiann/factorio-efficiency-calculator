import { ViewHelpers } from '../utils/ViewHelpers.js';

export class ItemSelectModal {
  constructor(view, onSelect = null) {
    this.view = view;
    this.onSelect = onSelect; // 선택 시 호출될 콜백 함수
  }

  /**
   * 아이템 선택 모달 표시
   */
  show() {
    // 모달 HTML 생성
    let modalHtml = `
      <div class="modal-overlay" id="itemSelectModal">
        <div class="modal-content item-select-modal">
          <div class="modal-header">
            <h3 class="modal-title">아이템 선택</h3>
            <button class="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="item-select-search">
              <input type="text" class="item-search-input" placeholder="검색..." />
            </div>
            <div class="item-select-tabs">
            `;


    // item-group 기반 버튼 추가 (레시피가 있는 그룹만)
    const itemGroups = this.getItemGroups();
    let firstGroupWithItems = null;
    console.log(`[ItemSelectModal.show] Found ${itemGroups.length} item-groups`, itemGroups);
    for (const itemGroup of itemGroups) {
      // 아이템이 있는 item-group만 탭 버튼으로 추가
      const hasItems = this.hasItemsForItemGroup(itemGroup.name);
      if (hasItems) {
        if (!firstGroupWithItems) {
          firstGroupWithItems = itemGroup;
        }
        modalHtml += `<button class="item-tab-btn ${firstGroupWithItems === itemGroup ? 'active' : ''}" data-category="${this.escapeHtml(itemGroup.name)}">${this.escapeHtml(this.view.locale.itemName(itemGroup.name))}</button>`;
      }
    }

    modalHtml += `
            </div>
            <div class="item-select-list" id="itemSelectList">
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
   * item-group 목록 가져오기 (order 순서로 정렬)
   */
  getItemGroups() {
    // 통합 데이터 형식에서는 categories를 item-group으로 사용
    if (this.view.loadedData && this.view.loadedData.categories) {
      const groups = this.view.loadedData.categories.map(cat => ({
        name: cat.id,
        type: 'item-group',
        order: cat.order || cat.id
      })).sort((a, b) => a.order.localeCompare(b.order));
      return groups;
    }
    
    // 레거시 형식: entries에서 item-group 찾기
    if (!this.view.loadedData || !this.view.loadedData.entries) {
      return [];
    }
    
    const itemGroups = this.view.loadedData.entries.filter(entry => entry.type === 'item-group');
    return itemGroups.sort((a, b) => {
      const orderA = a.order || '';
      const orderB = b.order || '';
      return orderA.localeCompare(orderB);
    });
  }

  /**
   * item-group에 아이템이 있는지 확인
   */
  hasItemsForItemGroup(itemGroupName) {
    
    // data.raw 형식: item-subgroup을 통해 레시피 확인
    const subgroups = this.getSubgroupsForItemGroup(itemGroupName);
    if (subgroups.length === 0) {
      return false;
    }
    const subgroupIds = new Set(subgroups.map(sg => sg.id));
    // loadedData.entries에서 type이 item인 것만 사용
    const items = (this.view.loadedData?.entries || []).filter(e => e.type === 'item');
    for (const item of items) {
      if (item.subgroup && subgroupIds.has(item.subgroup)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 특정 item-group에 속한 item-subgroup들 가져오기
   */
  getSubgroupsForItemGroup(itemGroupName) {
    if (!this.view.loadedData || !this.view.loadedData.entries) return [];
    
    // data.raw 형식: item-subgroup의 group 필드가 item-group을 가리킴
    const subgroups = this.view.loadedData.entries.filter(entry => 
      entry.type === 'item-subgroup' && entry.group === itemGroupName
    );
    return subgroups;
  }

  /**
   * 탭 컨텐츠 렌더링 (선택된 탭에 해당하는 아이템 목록 표시)
   */
  renderTabContent(category, searchText) {
    let html = '<div class="item-select-grid">';
    html += this.renderItemGroupRecipes(category, searchText);
    html += '</div>';
    return html;
  }

  /**
   * item-group 기반 아이템 렌더링
   */
  renderItemGroupRecipes(category, searchText) {
    let html = '';
    const itemGroupName = category;
    const subgroups = this.getSubgroupsForItemGroup(itemGroupName);
    console.log(`[ItemSelectModal.renderItemGroupRecipes] Rendering item-group: ${itemGroupName} with ${subgroups.length} subgroups`);
    
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
    let totalItemsChecked = 0;
    let itemsWithSubgroup = 0;
    
    // loadedData.entries에서 type이 item인 것만 사용
    const items = (this.view.loadedData?.entries || []).filter(e => e.type === 'item');
    for (const item of items) {
      totalItemsChecked++;
      if (seenItems.has(item.id)) continue;
      if (item.subgroup) {
        itemsWithSubgroup++;
      }
      if (item.subgroup && itemsBySubgroup.has(item.subgroup)) {
        const itemName = this.view.locale.itemName(item.id);
        if (!searchText || itemName.toLowerCase().includes(searchText.toLowerCase())) {
          itemsBySubgroup.get(item.subgroup).push({
            item: item,
            order: item.order || ''
          });
          seenItems.add(item.id);
        }
      }
    }
    
    // 첫 번째 그리드 닫기
    html += '</div>';
    
    // 서브그룹별로 order 순서대로 정렬 후 렌더링
    for (const subgroup of subgroups) {
      const subgroupItems = itemsBySubgroup.get(subgroup.id);
      if (!subgroupItems || subgroupItems.length === 0) continue;
      
      // order로 정렬
      subgroupItems.sort((a, b) => a.order.localeCompare(b.order));
      
    // 각 서브그룹마다 별도의 그리드 생성
      html += '<div class="item-select-grid item-subgroup-grid">';
      
      // 해당 서브그룹의 아이템들 렌더링
      for (const { item } of subgroupItems) {
        const itemName = this.view.locale.itemName(item.id) || item.id || '';
        
        if (!itemName) {
          console.warn('[ItemSelectModal.renderItemGroupRecipes] Empty tooltip for item:', item.id);
        }
        html += `<div class="item-select-item" data-type="item" data-id="${item.id}" data-tooltip="${this.escapeHtml(itemName)}">`;
        // ViewHelpers를 이용해 아이콘 정보와 아이콘 HTML 생성
        const iconInfo = ViewHelpers.getIconInfo(this.view.loadedData, item.id, item.type || 'item');
        html += ViewHelpers.createItemIconHtml(iconInfo);
        html += `</div>`;
      }
      
      html += '</div>'; // recipe-subgroup-grid 닫기
    }
    
    return html;
  }

  /**
   * 이벤트 리스너 연결
   */
  attachListeners() {
    const modal = document.getElementById('itemSelectModal');
    if (!modal) return;

    const closeButton = modal.querySelector('.modal-close-btn');
    const overlay = modal;
    const items = modal.querySelectorAll('.item-select-item');
    const tabBtns = modal.querySelectorAll('.item-tab-btn');
    const searchInput = modal.querySelector('.item-search-input');
    const itemsContainer = modal.querySelector('#itemSelectList');

    // 닫기 버튼
    if (closeButton) {
      closeButton.addEventListener('click', () => this.close());
    }

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
    let currentCategory = '';
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
    const modal = document.getElementById('itemSelectModal');
    if (!modal) return;

    const items = modal.querySelectorAll('.item-select-item');
    items.forEach(item => {
      item.onclick = () => {
        const type = item.dataset.type;
        const id = item.dataset.id;

        // 콜백이 설정되어 있으면 콜백 실행
        if (this.onSelect) {
          this.onSelect(id, type);
          document.body.classList.remove('modal-open');
          modal.remove();
        }
      };
    });
  }

  /**
   * 모달 닫기
   */
  close() {
    const modal = document.getElementById('itemSelectModal');
    if (modal) {
      modal.remove();
      document.body.classList.remove('modal-open');
    }
  }

    /**
   * HTML 이스케이프
   */
  escapeHtml(text) {
    return ViewHelpers.escapeHtml(text);
  }
}
