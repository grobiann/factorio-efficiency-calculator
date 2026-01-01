import { ViewHelpers } from '../utils/ViewHelpers.js';

/**
 * BaseModalView - 모달 뷰의 베이스 클래스
 * 공통 모달 로직을 제공합니다.
 */
export class BaseModalView {
  constructor(view, onSelect = null) {
    this.view = view;
    this.onSelect = onSelect;
  }

  /**
   * 모달 생성 및 DOM에 추가
   * @param {string} modalId - 모달의 고유 ID
   * @param {string} modalClass - 모달의 CSS 클래스
   * @param {string} title - 모달 제목
   * @param {string} bodyContent - 모달 본문 HTML
   */
  createModal(modalId, modalClass, title, bodyContent) {
    const modalHtml = `
      <div class="modal-overlay" id="${modalId}">
        <div class="modal-content ${modalClass}">
          <div class="modal-header">
            <h3 class="modal-title">${ViewHelpers.escapeHtml(title)}</h3>
            <button class="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body">
            ${bodyContent}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.classList.add('modal-open');
    
    return document.getElementById(modalId);
  }

  /**
   * 모달 닫기
   * @param {HTMLElement} modal - 닫을 모달 엘리먼트
   */
  closeModal(modal) {
    if (modal) {
      document.body.classList.remove('modal-open');
      modal.remove();
    }
  }

  /**
   * 기본 모달 이벤트 리스너 연결
   * @param {HTMLElement} modal - 모달 엘리먼트
   */
  attachBaseListeners(modal) {
    if (!modal) return;

    // 닫기 버튼
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => this.closeModal(modal);
    }

    // 오버레이 클릭
    modal.onclick = (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    };

    // ESC 키
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeModal(modal);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  /**
   * 검색 필터 기능
   * @param {string} searchText - 검색어
   * @param {string} targetText - 대상 텍스트
   * @returns {boolean} 매치 여부
   */
  matchesSearch(searchText, targetText) {
    if (!searchText) return true;
    return targetText.toLowerCase().includes(searchText.toLowerCase());
  }

  /**
   * 탭 전환 로직
   * @param {HTMLElement} modal - 모달 엘리먼트
   * @param {Function} renderCallback - 탭 컨텐츠 렌더링 콜백
   * @param {string} itemsContainerId - 아이템 컨테이너 ID
   */
  setupTabSwitching(modal, renderCallback, itemsContainerId) {
    const tabBtns = modal.querySelectorAll('.modal-tab-btn');
    const itemsContainer = modal.querySelector(`#${itemsContainerId}`);
    const searchInput = modal.querySelector('.modal-search-input');

    if (!itemsContainer) return;

    let currentCategory = tabBtns[0]?.dataset.category || '';

    tabBtns.forEach(btn => {
      btn.onclick = () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        itemsContainer.innerHTML = renderCallback(currentCategory, searchInput?.value || '');
        this.attachItemListeners(modal);
      };
    });

    if (searchInput) {
      searchInput.oninput = () => {
        itemsContainer.innerHTML = renderCallback(currentCategory, searchInput.value);
        this.attachItemListeners(modal);
      };
    }
  }

  /**
   * 아이템 클릭 리스너 (서브클래스에서 구현)
   * @param {HTMLElement} modal - 모달 엘리먼트
   */
  attachItemListeners(modal) {
    // 서브클래스에서 구현
    throw new Error('attachItemListeners must be implemented by subclass');
  }

  /**
   * item-group 목록 가져오기
   */
  getItemGroups() {
    if (this.view.loadedData && this.view.loadedData.categories) {
      return this.view.loadedData.categories.map(cat => ({
        name: cat.id,
        type: 'item-group',
        order: cat.order || cat.id
      })).sort((a, b) => a.order.localeCompare(b.order));
    }
    
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
   * 특정 item-group에 속한 item-subgroup들 가져오기
   */
  getSubgroupsForItemGroup(itemGroupName) {
    if (!this.view.loadedData || !this.view.loadedData.entries) return [];
    
    const subgroups = this.view.loadedData.entries.filter(entry => 
      entry.type === 'item-subgroup' && entry.group === itemGroupName
    );
    return subgroups;
  }

  /**
   * 레시피의 서브그룹 결정 (공통 로직)
   * @param {Object} recipe - 레시피 객체
   * @param {Map} itemSubgroupMap - 아이템 ID -> 서브그룹 매핑
   * @returns {string|null} 서브그룹 ID
   */
  getRecipeSubgroup(recipe, itemSubgroupMap) {
    // 1. recipe.subgroup이 있으면 그것을 사용
    if (recipe.subgroup) {
      return recipe.subgroup;
    }
    
    // 2. main_product의 subgroup
    if (recipe.main_product) {
      const subgroup = itemSubgroupMap.get(recipe.main_product);
      if (subgroup) return subgroup;
    }
    
    // 3. results[0]의 subgroup
    if (recipe.results && recipe.results.length > 0) {
      const firstResultName = recipe.results[0].name;
      const subgroup = itemSubgroupMap.get(firstResultName);
      if (subgroup) return subgroup;
    }
    
    return null;
  }

  /**
   * item-group에 특정 타입의 엔트리가 있는지 확인
   * @param {string} itemGroupName - item-group 이름
   * @param {string} entryType - 확인할 엔트리 타입 ('item', 'recipe' 등)
   * @returns {boolean} 엔트리 존재 여부
   */
  hasEntriesForItemGroup(itemGroupName, entryType) {
    const subgroups = this.getSubgroupsForItemGroup(itemGroupName);
    console.log(`[BaseModalView.hasEntriesForItemGroup] Checking entries of type '${entryType}' in item-group '${itemGroupName}' with ${subgroups.length} subgroups.`);
    if (subgroups.length === 0) {
      return false;
    }
    
    const subgroupIds = new Set(subgroups.map(sg => sg.id));
    
    if (entryType === 'recipe') {
      // 레시피의 경우 특별한 서브그룹 결정 로직 적용
      const recipes = (this.view.loadedData?.entries || []).filter(e => e.type === 'recipe');
      const items = (this.view.loadedData?.entries || []).filter(e => e.type === 'item' || e.type === 'fluid');
      
      // 아이템 ID -> 서브그룹 매핑
      const itemSubgroupMap = new Map();
      for (const item of items) {
        if (item.subgroup) {
          itemSubgroupMap.set(item.id, item.subgroup);
        }
      }
      
      for (const recipe of recipes) {
        const itemSubgroup = this.getRecipeSubgroup(recipe, itemSubgroupMap);
        if (itemSubgroup && subgroupIds.has(itemSubgroup)) {
          return true;
        }
      }
      return false;
    } else {
      // 다른 엔트리 타입은 기존 로직 사용
      const entries = (this.view.loadedData?.entries || []).filter(e => e.type === entryType);
      for (const entry of entries) {
        if (entry.subgroup && subgroupIds.has(entry.subgroup)) {
          return true;
        }
      }
      return false;
    }
  }

  /**
   * 아이템 그리드 렌더링 (공통 렌더링 로직)
   * @param {Object} itemsData - { subgroups: [{ id, items: [{ type, id, tooltip, iconHtml, order }] }] }
   * @returns {string} 렌더링된 HTML
   */
  renderItemsGrid(itemsData) {
    let html = '<div class="recipe-select-grid">';
    
    // 첫 번째 그리드 닫기
    html += '</div>';
    
    // 서브그룹별로 렌더링
    for (const subgroup of itemsData.subgroups) {
      if (!subgroup.items || subgroup.items.length === 0) continue;
      
      // 각 서브그룹마다 별도의 그리드 생성
      html += '<div class="recipe-select-grid recipe-subgroup-grid">';
      
      // 해당 서브그룹의 아이템들 렌더링
      for (const item of subgroup.items) {
        html += `<div class="recipe-select-item" data-type="${item.type}" data-id="${item.id}" data-tooltip="${ViewHelpers.escapeHtml(item.tooltip)}">`;
        html += item.iconHtml;
        html += `</div>`;
      }
      
      html += '</div>'; // recipe-subgroup-grid 닫기
    }
    
    html += '</div>'; // modal-grid 닫기
    
    return html;
  }

  /**
   * 모달 닫기
   * @param {string} modalId - 모달 ID
   */
  close(modalId) {
    const modal = document.getElementById(modalId);
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

  /**
   * 모달 이벤트 리스너 연결
   * @param {string} modalId - 모달 ID
   * @param {string} contentId - 컨텐트 컨테이너 ID
   * @param {string} defaultCategory - 기본 카테고리
   */
  attachListeners(modalId, contentId, defaultCategory = '') {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal-close-btn');
    const overlay = modal;
    const searchInput = modal.querySelector('.modal-search-input');
    const tabBtns = modal.querySelectorAll('.modal-tab-btn');
    const itemsContainer = modal.querySelector(`#${contentId}`);

    // Tooltip 요소 생성
    this.createTooltip();

    // 닫기 버튼
    if (closeBtn) {
      closeBtn.onclick = () => {
        this.removeTooltip();
        this.close(modalId);
      };
    }

    // 오버레이 클릭
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        this.removeTooltip();
        this.close(modalId);
      }
    };

    // ESC 키
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.removeTooltip();
        this.close(modalId);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // 탭 버튼
    let currentCategory = defaultCategory;
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        itemsContainer.innerHTML = this.renderTabContent(currentCategory, searchInput ? searchInput.value : '');
        this.attachItemListeners(modalId);
      };
    });

    // 검색
    if (searchInput) {
      searchInput.oninput = () => {
        itemsContainer.innerHTML = this.renderTabContent(currentCategory, searchInput.value);
        this.attachItemListeners(modalId);
      };
    }

    // 아이템 클릭 리스너
    this.attachItemListeners(modalId);
  }

  /**
   * 아이템 클릭 리스너
   * @param {string} modalId - 모달 ID
   */
  attachItemListeners(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const items = modal.querySelectorAll('.recipe-select-item');
    items.forEach(item => {
      // Tooltip 표시
      item.onmouseenter = (e) => {
        const tooltip = item.dataset.tooltip;
        if (tooltip) {
          const rect = item.getBoundingClientRect();
          this.showTooltip(tooltip, rect, item);
        }
      };

      item.onmouseleave = () => {
        this.hideTooltip();
      };

      // 클릭 이벤트
      item.onclick = () => {
        this.hideTooltip();
        const type = item.dataset.type;
        const id = item.dataset.id;
        
        // 콜백이 설정되어 있으면 콜백 실행
        if (this.onSelect) {
          this.onItemSelect(type, id, modalId);
        } else {
          // 기본 동작: 각 모달에서 오버라이드
          this.onDefaultItemSelect(type, id, modalId);
        }
      };
    });
  }

  /**
   * Tooltip 요소 생성
   */
  createTooltip() {
    if (!this.tooltipElement) {
      this.tooltipElement = document.createElement('div');
      this.tooltipElement.className = 'modal-tooltip';
      document.body.appendChild(this.tooltipElement);
    }
  }

  /**
   * Tooltip 표시
   */
  showTooltip(text, rect, element) {
    if (!this.tooltipElement) return;
    
    this.tooltipElement.textContent = text;
    this.updateTooltipPosition(rect);
    this.tooltipElement.classList.add('show');
  }

  /**
   * Tooltip 위치 업데이트 (아이템 기준 고정 offset)
   */
  updateTooltipPosition(rect) {
    if (!this.tooltipElement) return;
    
    const offset = 10;
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    
    // 기본: 아이템 아래쪽 중앙
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    let top = rect.bottom + offset;
    
    // 화면 아래쪽을 벗어나면 위쪽에 표시
    if (top + tooltipRect.height > window.innerHeight) {
      top = rect.top - tooltipRect.height - offset;
    }
    
    // 화면 왼쪽을 벗어나면 조정
    if (left < offset) {
      left = offset;
    }
    
    // 화면 오른쪽을 벗어나면 조정
    if (left + tooltipRect.width > window.innerWidth) {
      left = window.innerWidth - tooltipRect.width - offset;
    }
    
    this.tooltipElement.style.left = `${left}px`;
    this.tooltipElement.style.top = `${top}px`;
  }

  /**
   * Tooltip 숨기기
   */
  hideTooltip() {
    if (this.tooltipElement) {
      this.tooltipElement.classList.remove('show');
    }
  }

  /**
   * Tooltip 제거
   */
  removeTooltip() {
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = null;
    }
  }

  /**
   * 아이템 선택 시 콜백 동작 (서브클래스에서 오버라이드 가능)
   */
  onItemSelect(type, id, modalId) {
    this.onSelect(type, id);
    this.close(modalId);
  }

  /**
   * 기본 아이템 선택 동작 (서브클래스에서 구현)
   */
  onDefaultItemSelect(type, id, modalId) {
    // 서브클래스에서 구현
  }
}
