# 데이터셋 시스템 가이드

## 개요

팩토리오 효율 계산기에 모듈화된 데이터셋 시스템이 추가되었습니다. 이제 여러 모드와 버전의 데이터를 분리하여 관리하고, 사용자가 원하는 데이터만 선택적으로 활성화할 수 있습니다.

## 폴더 구조

```
data/
├── datasets/
│   ├── datasets.json          # 데이터셋 설정 파일
│   ├── vanilla/               # 바닐라 팩토리오
│   │   ├── items.json
│   │   └── recipes.json
│   ├── factorio-2.0/          # 팩토리오 2.0 (우주 시대)
│   │   ├── items.json
│   │   └── recipes.json
│   ├── krastorio2/            # Krastorio 2 모드
│   │   ├── items.json
│   │   └── recipes.json
│   └── space-exploration/     # Space Exploration 모드
│       ├── items.json
│       └── recipes.json
```

## 데이터셋 설정 (datasets.json)

각 데이터셋은 다음 속성을 가집니다:

- **id**: 고유 식별자
- **name**: 표시 이름
- **description**: 설명
- **enabled**: 기본 활성화 여부
- **order**: 로딩 순서 (낮은 숫자가 먼저)
- **files**: 데이터 파일 경로 배열

### 예시:

```json
{
  "datasets": [
    {
      "id": "vanilla",
      "name": "Vanilla Factorio",
      "description": "Basic Factorio items and recipes",
      "enabled": true,
      "order": 1,
      "files": [
        "datasets/vanilla/items.json",
        "datasets/vanilla/recipes.json",
        "datasets/vanilla/weapons.json",
        "datasets/vanilla/buildings.json"
      ]
    }
  ]
}
```

### 데이터 파일 형식

각 파일은 `type` 필드로 아이템과 레시피를 구분합니다:

```json
[원하는 이름의 JSON 파일 생성 (예: `weapons.json`, `science.json`, `buildings.json`)
   
   각 파일에서 `type` 필드로 아이템과 레시피를 구분:
   
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

3. **datasets.json 수정**: 새 데이터셋 정의 추가

```json
{
  "id": "my-mod",
  "name": "My Custom Mod",
  "description": "Custom mod data",
  "enabled": false,
  "order": 10,
  "files": [
    "datasets/my-mod/weapons.json",
    "datasets/my-mod/buildings.json",
    "datasets/my-mod/science.json"
  ]   { "type": "item", "name": "copper-plate", "amount": 5 }
    ]
  }
]
```

**중요**: 파일명은 자유롭게 지정할 수 있습니다 (weapons.json, buildings.json, science.json 등). 시스템은 각 항목의 `type` 필드를 보고 자동으로 아이템과 레시피를 분류합니다.

## 새 데이터셋 추가하기

1. **폴더 생성**: `data/datasets/` 아래에 새 폴더 생성 (예: `my-mod/`)

2. **데이터 파일 추가**: 
   - `items.json`: 아이템 목록
   - `recipes.json`: 레시피 목록

3. **datasets.json 수정**: 새 데이터셋 정의 추가

```json
{
  "id": "my-mod",
  "name": "My Custom Mod",
  "description": "Custom mod data",
  "enabled": false,
  "order": 10,
  "files": {
    "items": "datasets/my-mod/items.json",
    "recipes": "datasets/my-mod/recipes.json"
  }
}
```

## 사용자 인터페이스

### 데이터셋 선택

1. 우측 상단의 설정 버튼(⚙️) 클릭
2. "데이터 소스 선택" 섹션에서 원하는 데이터셋 체크/해제
3. "데이터 적용" 버튼 클릭하여 변경사항 적용

### 저장

선택한 데이터셋 설정은 브라우저의 localStorage에 자동 저장되어 다음 방문시에도 유지됩니다.

## 데이터 병합 방식

- 여러 데이터셋을 활성화하면 자동으로 병합됩니다
- 낮은 `order` 값을 가진 데이터셋이 먼저 로드됩니다
- 같은 ID를 가진 레시피는 나중에 로드된 데이터셋의 것으로 덮어씁니다
- 이를 통해 모드가 바닐라 레시피를 수정하는 경우를 처리할 수 있습니다

## 주요 컴포넌트

### DatasetManager (model/DatasetManager.js)

데이터셋 로딩 및 관리를 담당하는 핵심 클래스:

- `loadDatasetConfig()`: datasets.json 로드
- `loadData()`: 활성화된 데이터셋의 데이터 로드 및 병합
- `setEnabled(id, enabled)`: 데이터셋 활성화/비활성화
- `reloadData()`: 데이터 재로드

### DatasetConfigView (view/DatasetConfigView.js)

데이터셋 선택 UI를 담당:

- 체크박스 형태로 데이터셋 목록 표시
- 사용자가 선택한 데이터셋을 localStorage에 저장
- "데이터 적용" 버튼으로 변경사항 적용

## 레시피 데이터 형식

레시피는 다음 형식을 따릅니다:

```json
{
  "recipes": [
    {
      "id": "iron-plate",
      "name": "Iron Plate",
      "type": "recipe",
      "energy_required": 3.2,
      "results": [
        { "type": "item", "name": "iron-plate", "amount": 1 }
      ],
      "ingredients": [
        { "type": "item", "name": "iron-ore", "amount": 1 }
      ]
    }
  ]
}
```

## 향후 개선 사항

- [ ] 데이터셋 간 의존성 관리
- [ ] 충돌 감지 및 경고
- [ ] 데이터셋 메타데이터 (작성자, 버전 등)
- [ ] 온라인 데이터셋 저장소
- [ ] 데이터셋 가져오기/내보내기

## 문제 해결

### 데이터가 로드되지 않을 때

1. 브라우저 콘솔(F12)에서 에러 확인
2. 파일 경로가 올바른지 확인
3. JSON 형식이 유효한지 확인
4. localStorage를 지우고 다시 시도

### 레시피가 표시되지 않을 때

1. 해당 데이터셋이 활성화되어 있는지 확인
2. 레시피 ID가 고유한지 확인
3. 레시피 형식이 올바른지 확인
