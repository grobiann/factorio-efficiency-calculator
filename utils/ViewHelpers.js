/**
 * ViewHelpers - View 클래스들의 공통 유틸리티 함수들
 */
export class ViewHelpers {
  /**
   * HTML 이스케이프
   * @param {string} text - 이스케이프할 텍스트
   * @returns {string} 이스케이프된 HTML
   */
  static escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 숫자 포맷팅 (비교 뷰용 - 소수점 정밀도 높음)
   * @param {number} num - 포맷할 숫자
   * @returns {string} 포맷된 문자열
   */
  static formatNumber(num) {
    if (num === 0) return '0';
    if (Math.abs(num) >= 1000) return num.toFixed(0);
    if (Math.abs(num) >= 10) return num.toFixed(1);
    if (Math.abs(num) >= 1) return num.toFixed(2);
    return num.toFixed(3);
  }

  /**
   * 수량 포맷팅 (생산구역용 - k 표기 지원)
   * @param {number} amount - 포맷할 수량
   * @returns {string} 포맷된 문자열
   */
  static formatAmount(amount) {
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'k';
    }
    if (amount % 1 === 0) {
      return amount.toString();
    }
    return amount.toFixed(1);
  }

  /**
   * 아이콘 정보 가져오기
   * @param {Object} loadedData - 데이터셋
   * @param {string} itemId - 아이템 ID
   * @param {string} type - 아이템 타입 (item, fluid, module)
   * @returns {Object|null} 아이콘 정보 객체 또는 null
   */
  static getIconInfo(loadedData, itemId, type = 'item') {
    if (!loadedData || !loadedData.entries) return null;

    const searchTypes = type === 'fluid' 
      ? ['fluid', 'item', 'module'] 
      : ['item', 'module', 'fluid'];

    for (const searchType of searchTypes) {
      const entry = loadedData.entries.find(
        e => e.name === itemId && e.type === searchType
      );
      if (entry && entry.icon) {
        return {
          path: entry.icon,
          size: entry.icon_size || 64,
          mipmaps: entry.mipmap_count || 0,
          name: itemId
        };
      }
    }

    // 타입 무관 검색 (fallback)
    const anyEntry = loadedData.entries.find(e => e.name === itemId);
    if (anyEntry && anyEntry.icon) {
      return {
        path: anyEntry.icon,
        size: anyEntry.icon_size || 64,
        mipmaps: anyEntry.mipmap_count || 0,
        name: itemId
      };
    }

    return null;
  }

  /**
   * 아이템 아이콘 HTML 생성
   * @param {Object} iconInfo - 아이콘 정보 객체
   * @param {number|null} amount - 표시할 수량
   * @param {Function} formatFn - 숫자 포맷 함수 (기본: formatNumber)
   * @returns {string} 아이콘 HTML
   */
  static createItemIconHtml(iconInfo, amount = null, formatFn = ViewHelpers.formatNumber) {
    let html = '<div class="zone-item-slot">';

    if (iconInfo && iconInfo.path) {
      html += '<div class="zone-item-icon">';
      
      const iconSize = iconInfo.size || 64;
      let totalWidth = iconSize;
      for (let i = 1; i < (iconInfo.mipmaps || 0); i++) {
        totalWidth += iconSize / Math.pow(2, i);
      }
      
      const scale = 32 / iconSize;
      const imgWidth = totalWidth * scale;
      const imgHeight = iconSize * scale;

      html += `<img src="${iconInfo.path}" alt="${iconInfo.name || ''}" style="width: ${imgWidth}px; height: ${imgHeight}px; object-fit: none; object-position: -64px 0;">`;
      html += '</div>';

      if (amount !== null && amount !== undefined) {
        html += `<div class="zone-item-amount">${formatFn(amount)}</div>`;
      }
    }

    html += '</div>';
    return html;
  }

  /**
   * IO 섹션 HTML 생성 (출력/입력)
   * @param {Array} items - 아이템 배열 [{name, amount, type}]
   * @param {string} sectionType - 'outputs' 또는 'inputs'
   * @param {string} title - 섹션 제목
   * @param {Object} loadedData - 데이터셋
   * @param {Function} formatFn - 숫자 포맷 함수
   * @returns {string} IO 섹션 HTML
   */
  static createIOSectionHtml(items, sectionType, title, loadedData, formatFn = ViewHelpers.formatNumber) {
    let html = `<div class="zone-io-section zone-${sectionType}">`;
    html += `<h4>${title}</h4>`;
    html += '<div class="zone-io-items">';
    
    if (items.length === 0) {
      html += '<span style="color: #999;">없음</span>';
    } else {
      for (const item of items) {
        const iconInfo = ViewHelpers.getIconInfo(loadedData, item.name, item.type || 'item');
        html += ViewHelpers.createItemIconHtml(iconInfo, item.amount, formatFn);
      }
    }
    
    html += '</div></div>';
    return html;
  }

  /**
   * 빈 메시지 HTML 생성
   * @param {string} message - 표시할 메시지
   * @returns {string} 메시지 HTML
   */
  static createEmptyMessage(message) {
    return `<p class="compare-empty-message">${ViewHelpers.escapeHtml(message)}</p>`;
  }

  /**
   * 모달 닫기 이벤트 설정
   * @param {HTMLElement} modal - 모달 엘리먼트
   * @param {HTMLElement} closeBtn - 닫기 버튼
   */
  static attachModalCloseEvents(modal, closeBtn) {
    const closeModal = () => modal.remove();
    
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    // 배경 클릭으로 닫기 (mousedown/up 트래킹)
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
  }

  /**
   * 사이드바 목록 아이템 HTML 생성
   * @param {string} name - 항목 이름
   * @param {number|string} count - 카운트 표시
   * @param {boolean} isActive - 선택 여부
   * @param {string} dataAttr - data 속성 (예: data-zone-id="...")
   * @param {string} className - 추가 클래스명
   * @returns {string} 목록 아이템 HTML
   */
  static createSidebarItemHtml(name, count, isActive, dataAttr, className = 'list-item') {
    const activeClass = isActive ? 'active' : '';
    let html = `<div class="${className} ${activeClass}" ${dataAttr}>`;
    html += `<span class="${className}-name">${ViewHelpers.escapeHtml(name)}</span>`;
    html += `<span class="${className}-count">${count}</span>`;
    html += '</div>';
    return html;
  }

  /**
   * 디바운스 함수 생성
   * @param {Function} func - 실행할 함수
   * @param {number} delay - 지연 시간 (ms)
   * @returns {Function} 디바운스된 함수
   */
  static debounce(func, delay) {
    let timeoutId = null;
    return function(...args) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * 배열을 맵으로 변환
   * @param {Array} array - 변환할 배열
   * @param {string|Function} keyGetter - 키를 가져올 속성명 또는 함수
   * @returns {Map} 변환된 맵
   */
  static arrayToMap(array, keyGetter) {
    const map = new Map();
    const getKey = typeof keyGetter === 'function' 
      ? keyGetter 
      : (item) => item[keyGetter];
    
    for (const item of array) {
      map.set(getKey(item), item);
    }
    return map;
  }

  /**
   * 유효한 배열인지 확인
   * @param {*} value - 확인할 값
   * @returns {boolean} 유효한 배열 여부
   */
  static isValidArray(value) {
    return Array.isArray(value) && value.length > 0;
  }

  /**
   * 안전한 숫자 파싱
   * @param {*} value - 파싱할 값
   * @param {number} defaultValue - 기본값
   * @returns {number} 파싱된 숫자
   */
  static parseNumber(value, defaultValue = 0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
}
