import { ViewHelpers } from "../utils/ViewHelpers.js";

/**
 * FactoryConfigView - 공장 설정 (Preferred Machines) 관리 UI
 */
export class FactoryConfigView {
  constructor(loadedData, locale) {
    this.loadedData = loadedData;
    this.locale = locale;
    this.preferredMachines = [];
    this.selectedModule = null;
    this.loadFromStorage();
  }

  /**
   * 뷰 렌더링
   */
  render(container) {
    this.currentContainer = container;
    const configContainer = container.querySelector('.factory-config-container');
    if (!configContainer) return;

    let html = '<div class="factory-config-wrapper">';
    
    // 제목 및 설명
    html += '<div class="factory-config-header">';
    html += '<h2>공장 설정</h2>';
    html += '<p class="factory-config-description">선호하는 기계와 모듈 설정을 관리합니다. 레시피 그룹에서 이 설정을 우선적으로 사용합니다.</p>';
    html += '</div>';

    // Preferred Machines 섹션
    html += '<div class="preferred-machines-section">';
    html += '<div class="section-header">';
    html += '<h3>Preferred Machines</h3>';
    html += '<button id="addPreferredMachineBtn" class="btn-primary">기계 추가</button>';
    html += '</div>';

    if (this.preferredMachines.length === 0) {
      html += '<p class="no-machines-message">설정된 선호 기계가 없습니다.</p>';
    } else {
      html += '<div class="preferred-machines-list">';
      this.preferredMachines.forEach((machine, index) => {
        html += this.renderMachineCard(machine, index);
      });
      html += '</div>';
    }

    html += '</div>'; // preferred-machines-section

    // Preferred Module 섹션
    html += '<div class="preferred-module-section">';
    html += '<div class="section-header">';
    html += '<h3>Preferred Module</h3>';
    html += '</div>';
    html += '<div class="module-selection-grid">';
    
    if (this.loadedData && this.loadedData.modules) {
      // 모듈을 이름순으로 정렬
      const sortedModules = [...this.loadedData.modules].sort((a, b) => {
        const nameA = this.locale.itemName(a.id).toLowerCase();
        const nameB = this.locale.itemName(b.id).toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      sortedModules.forEach(module => {
        const icon = ViewHelpers.getIconInfo(this.loadedData, module.id, 'module');
        const isSelected = this.selectedModule === module.id;
        html += `<div class="module-selection-item ${isSelected ? 'selected' : ''}" data-module-id="${module.id}">`;
        html += ViewHelpers.createIconHtml(icon, { targetSize: 48 });
        html += `<div class="module-selection-name">${ViewHelpers.escapeHtml(this.locale.itemName(module.id))}</div>`;
        if (isSelected) {
          html += '<div class="selected-indicator">✓</div>';
        }
        html += '</div>';
      });
    }
    
    html += '</div>';
    html += '</div>'; // preferred-module-section
    
    html += '</div>'; // factory-config-wrapper

    configContainer.innerHTML = html;
    this.attachEventListeners(configContainer);
  }

  /**
   * 기계 카드 렌더링
   */
  renderMachineCard(machine, index) {
    const machineIcon = ViewHelpers.getIconInfo(this.loadedData, machine.machineId, 'assembling-machine');

    let html = '<div class="machine-card-compact">';
    
    // 기계 아이콘
    html += '<div class="machine-icon-compact">';
    html += ViewHelpers.createIconHtml(machineIcon, { targetSize: 32 });
    html += '</div>';

    // 기계 이름
    html += '<div class="machine-name-compact">';
    html += ViewHelpers.escapeHtml(this.locale.itemName(machine.machineId));
    html += '</div>';

    // 기계 삭제 버튼
    html += '<div class="machine-actions-compact">';
    html += `<button class="btn-danger remove-machine-compact-btn" data-index="${index}" title="기계 삭제">✕</button>`;
    html += '</div>';

    html += '</div>'; // machine-card-compact

    return html;
  }



  /**
   * 기계 데이터 가져오기
   */
  getMachineData(machineId) {
    if (!this.loadedData || !this.loadedData.entities) return null;
    return this.loadedData.entities.find(e => e.id === machineId && e.type === 'assembling-machine');
  }

  /**
   * 이벤트 리스너 등록
   */
  attachEventListeners(container) {
    // 기계 추가 버튼
    const addMachineBtn = container.querySelector('#addPreferredMachineBtn');
    if (addMachineBtn) {
      addMachineBtn.onclick = () => this.showMachineSelectModal();
    }

    // 기계 삭제 버튼
    container.querySelectorAll('.remove-machine-compact-btn').forEach(btn => {
      btn.onclick = () => {
        const index = parseInt(btn.dataset.index);
        this.removeMachine(index);
      };
    });

    // 모듈 선택 아이템
    container.querySelectorAll('.module-selection-item').forEach(item => {
      item.onclick = () => {
        const moduleId = item.dataset.moduleId;
        this.selectModule(moduleId);
      };
    });
  }

  /**
   * 기계 선택 모달 표시
   */
  showMachineSelectModal() {
    if (!this.loadedData || !this.loadedData.entities) return;

    const machines = this.loadedData.entities.filter(e => e.type === 'assembling-machine');
    
    // 간단한 선택 모달 생성
    let html = '<div class="modal-backdrop">';
    html += '<div class="modal-dialog machine-select-modal">';
    html += '<div class="modal-header">';
    html += '<h3>기계 선택</h3>';
    html += '<button class="modal-close-btn">✕</button>';
    html += '</div>';
    html += '<div class="modal-body">';
    html += '<div class="machine-grid">';
    
    machines.forEach(machine => {
      const icon = ViewHelpers.getIconInfo(this.loadedData, machine.id, 'assembling-machine');
      html += `<div class="machine-grid-item" data-machine-id="${machine.id}">`;
      html += ViewHelpers.createIconHtml(icon, { targetSize: 48 });
      html += `<div class="machine-grid-name">${ViewHelpers.escapeHtml(this.locale.itemName(machine.id))}</div>`;
      html += '</div>';
    });
    
    html += '</div></div></div></div>';

    const modalElement = document.createElement('div');
    modalElement.innerHTML = html;
    document.body.appendChild(modalElement.firstElementChild);

    // 이벤트 리스너
    const modal = document.querySelector('.machine-select-modal');
    const backdrop = document.querySelector('.modal-backdrop');
    
    backdrop.onclick = (e) => {
      if (e.target === backdrop) {
        backdrop.remove();
      }
    };

    modal.querySelector('.modal-close-btn').onclick = () => {
      backdrop.remove();
    };

    modal.querySelectorAll('.machine-grid-item').forEach(item => {
      item.onclick = () => {
        const machineId = item.dataset.machineId;
        this.addMachine(machineId);
        backdrop.remove();
      };
    });
  }



  /**
   * 기계 추가
   */
  addMachine(machineId) {
    this.preferredMachines.push({
      machineId: machineId
    });
    this.saveToStorage();
    this.render(this.currentContainer);
  }

  /**
   * 기계 삭제
   */
  removeMachine(index) {
    this.preferredMachines.splice(index, 1);
    this.saveToStorage();
    this.render(this.currentContainer);
  }

  /**
   * 모듈 선택
   */
  selectModule(moduleId) {
    // 이미 선택된 모듈이면 해제
    if (this.selectedModule === moduleId) {
      this.selectedModule = null;
    } else {
      this.selectedModule = moduleId;
    }
    this.saveToStorage();
    this.render(this.currentContainer);
  }

  /**
   * localStorage에 저장
   */
  saveToStorage() {
    try {
      localStorage.setItem('preferredMachines', JSON.stringify(this.preferredMachines));
      localStorage.setItem('selectedModule', this.selectedModule || '');
    } catch (e) {
      // 저장 실패 시 무시
    }
  }

  /**
   * localStorage에서 로드
   */
  loadFromStorage() {
    try {
      const machinesData = localStorage.getItem('preferredMachines');
      if (machinesData) {
        this.preferredMachines = JSON.parse(machinesData);
      }
      const moduleData = localStorage.getItem('selectedModule');
      if (moduleData) {
        this.selectedModule = moduleData || null;
      }
    } catch (e) {
      // 로드 실패 시 무시
    }
  }

  /**
   * 아이콘 정보 가져오기 (ItemSelectModal용)
   */
  getIconInfo(itemId, itemType = 'item') {
    return ViewHelpers.getIconInfo(this.loadedData, itemId, itemType);
  }

  /**
   * 레시피에 대한 선호 기계 가져오기
   */
  getPreferredMachineForRecipe(recipe, availableMachines) {
    if (!availableMachines || availableMachines.length === 0) {
      return null;
    }

    // 선호 기계 목록에서 사용 가능한 기계 찾기
    for (const preferred of this.preferredMachines) {
      const found = availableMachines.find(m => m.id === preferred.machineId);
      if (found) {
        return found;
      }
    }

    // 없으면 첫 번째 기계 반환
    return availableMachines[0];
  }
}
