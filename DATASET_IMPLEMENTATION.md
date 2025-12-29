# 데이터셋 시스템 구현 완료

## 완료된 작업

### 1. 폴더 구조 생성 ✅

새로운 데이터 구조가 만들어졌습니다:

```
data/
└── datasets/
    ├── datasets.json              # 설정 파일
    ├── vanilla/                   # 바닐라 팩토리오
    ├── factorio-2.0/              # 팩토리오 2.0
    ├── krastorio2/                # Krastorio 2 모드
    └── space-exploration/         # Space Exploration 모드
```

각 데이터셋 폴더에는 `items.json`과 `recipes.json`이 포함되어 있습니다.

### 2. 데이터셋 관리 시스템 ✅

**[DatasetManager.js](model/DatasetManager.js)** - 핵심 데이터 관리 클래스:
- 데이터셋 설정 로드
- 여러 데이터셋 병합
- 사용자 선택 저장/불러오기 (localStorage)
- 데이터 재로드

주요 기능:
- `loadDatasetConfig()`: 데이터셋 목록 로드
- `loadData()`: 선택된 데이터셋 병합
- `setEnabled(id, enabled)`: 데이터셋 활성화/비활성화
- `reloadData()`: 변경사항 적용

### 3. 설정 UI ✅

**[DatasetConfigView.js](view/DatasetConfigView.js)** - 사용자 인터페이스:
- 체크박스로 데이터셋 선택
- 각 데이터셋의 이름과 설명 표시
- "데이터 적용" 버튼으로 즉시 반영
- 선택 상태 자동 저장

### 4. 기존 코드 통합 ✅

**[App.js](controller/App.js)** 수정사항:
- DatasetManager 초기화
- 데이터 재로드 함수 추가
- 설정 패널에 데이터셋 UI 통합
- 레시피 맵 재구성 로직

**[style.css](styles/style.css)** 업데이트:
- 데이터셋 UI 스타일링
- 설정 패널 크기 조정
- 스크롤 지원

## 사용 방법

### 사용자 관점

1. **설정 열기**: 우측 상단 ⚙️ 버튼 클릭
2. **데이터 선택**: "데이터 소스 선택" 섹션에서 원하는 모드/버전 체크
3. **적용**: "데이터 적용" 버튼 클릭
4. **자동 저장**: 선택한 설정은 다음 방문시에도 유지됨

### 개발자 관점

#### 새 데이터셋 추가하기

1. **폴더 생성**:
```
data/datasets/my-new-mod/
├── weapons.json
├── buildings.json
└── science.json
```

2. **데이터 파일 작성** (type 필드로 구분):
```json
[
  {
    "type": "item",
    "name": "my-item",
    "stack_size": 100
  },
  {
    "type": "recipe",
    "id": "my-recipe",
    "name": "My Recipe",
    "energy_required": 5,
    "results": [
      { "type": "item", "name": "my-item", "amount": 1 }
    ],
    "ingredients": [
      { "type": "item", "name": "iron-plate", "amount": 5 }
    ]
  }
]
```

3. **datasets.json에 등록**:
```json
{
  "id": "my-new-mod",
  "name": "My New Mod",
  "description": "설명",
  "enabled": false,
  "order": 5,
  "files": [
    "datasets/my-new-mod/weapons.json",
    "datasets/my-new-mod/buildings.json",
    "datasets/my-new-mod/science.json"
  ]
}
```

4. 완료! 설정 UI에 자동으로 나타남

**중요**: 파일명은 자유롭게 지정 가능 (weapons.json, guns.json, items.json 등). 시스템이 `type` 필드를 보고 자동으로 아이템/레시피를 분류합니다.

## 주요 특징

### ✨ 모듈화
- 각 모드/버전이 독립적인 폴더에 분리
- 쉬운 유지보수와 확장

### 🔄 자동 병합
- 여러 데이터셋을 동시 활성화 가능
- order 순서대로 로드 후 병합
- 중복 레시피는 나중 것으로 덮어쓰기

### 💾 영구 저장
- localStorage를 통한 설정 저장
- 브라우저를 닫아도 선택 유지

### 🎨 직관적 UI
- 체크박스로 간단한 선택
- 설명 텍스트로 각 데이터셋 정보 제공
- 즉시 적용 버튼

### 🔌 확장 가능
- 새 데이터셋 추가 용이
- 기존 코드 최소 수정
- 플러그인 방식 설계

## 샘플 데이터

기본 제공 데이터셋:

1. **Vanilla Factorio**: 기본 아이템 (철, 구리, 강철 등)
2. **Factorio 2.0**: 우주 시대 콘텐츠 (로켓 부품, 베릴륨 등)
3. **Krastorio 2**: 모드 전용 아이템 (이머시움, 희귀 금속 등)
4. **Space Exploration**: 우주 탐사 아이템 (아크구체, 나퀴움 등)

## 기술 스택

- **순수 JavaScript (ES6+)**: 모듈 시스템 활용
- **localStorage API**: 설정 영구 저장
- **Fetch API**: 비동기 데이터 로딩
- **CSS Grid/Flexbox**: 반응형 UI

## 파일 목록

### 새로 생성된 파일
- `model/DatasetManager.js` - 데이터 관리 로직
- `view/DatasetConfigView.js` - UI 컴포넌트
- `data/datasets/datasets.json` - 데이터셋 설정
- `data/datasets/vanilla/*` - 바닐라 데이터
- `data/datasets/factorio-2.0/*` - 2.0 데이터
- `data/datasets/krastorio2/*` - 크라스트리오 데이터
- `data/datasets/space-exploration/*` - 우주탐사 데이터
- `data/datasets/README.md` - 가이드 문서

### 수정된 파일
- `controller/App.js` - 데이터셋 시스템 통합
- `styles/style.css` - UI 스타일 추가

## 다음 단계 (선택사항)

### 추가 개선 아이디어:
1. **데이터 검증**: JSON 스키마 검증
2. **의존성 관리**: 데이터셋 간 의존성 명시
3. **충돌 감지**: 레시피 ID 충돌 경고
4. **가져오기/내보내기**: 사용자 설정 공유
5. **온라인 저장소**: 커뮤니티 데이터셋 다운로드
6. **버전 관리**: 데이터셋 버전 추적
7. **미리보기**: 활성화 전 데이터셋 내용 확인

## 테스트 방법

1. 브라우저에서 `index.html` 열기
2. 설정 버튼(⚙️) 클릭
3. 다양한 데이터셋 조합 테스트
4. "데이터 적용" 후 레시피 목록 변경 확인
5. 페이지 새로고침 후 설정 유지 확인

---

**모든 구현이 완료되었습니다!** 🎉

이제 팩토리오 효율 계산기는 다양한 모드와 버전의 데이터를 유연하게 관리할 수 있습니다.
