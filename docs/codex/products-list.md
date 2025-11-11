제품 리스트 
Context

라우트: /products

타입/스토어: src/types/domain.ts, src/store/products.ts

공용 컴포넌트: src/components/Expiry/ExpiryBadge.tsx, src/components/Qty/QtyText.tsx

Task

모바일 우선 리스트 페이지 구현.

상단 검색바: 입력 즉시 필터링

탭 4개: 전체/냉동/냉장/상온

제품 카드 리스트: 썸네일/텍스트/수량/D-배지

FAB “+”(우하단) → /products/create

UI 요구(세부)

검색바

placeholder="제품명/제조사 검색"

클래스 예: w-full h-11 rounded-full bg-white border border-slate-200 px-4 text-[14px] outline-none

탭(필터)

라벨: 전체/냉동/냉장/상온

선택: bg-slate-900 text-white border-slate-900

비선택: bg-white text-slate-700 border-slate-200

제품 카드(반복) — 3열 구조로 고정

카드 컨테이너: flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200

왼쪽 열(썸네일): w-14 h-14 rounded-xl object-cover bg-slate-100

가운데 열(텍스트 열): flex-1 min-w-0

1행(품명): text-[16px] font-semibold text-slate-900 leading-tight line-clamp-2

2행(메타 + D-배지): mt-1 flex items-center gap-2

좌측 메타: flex-1 min-w-0 truncate text-[13px] text-slate-600 → 제조사 · 단위 · 규격(선택)

우측 D-배지: shrink-0 inline-flex h-6 items-center px-2.5 rounded-full text-[12px]

상태색 규칙: 만료 bg-red-600 text-white, D≤7 bg-amber-100 text-amber-800, 8–30 bg-yellow-100 text-yellow-800, 그 외 bg-slate-100 text-slate-700

오른쪽 열(수량): 카드 컨테이너의 별도 열로 배치

래퍼: self-center shrink-0

숫자: select-none tabular-nums tracking-tight text-[20px] font-black

레이아웃 다이어그램

[썸네일] | [가운데 열: 1행=품명 / 2행= {메타(좌)} {D-배지(우)} ] | [수량]

D-배지는 가운데 열의 2행 우측에만 위치합니다.

수량은 오른쪽 열의 세로 중앙에 배치되어 D-배지와 겹치지 않습니다.

FAB

경로: /products/create

버튼: fixed bottom-6 right-6 w-14 h-14 rounded-full bg-slate-900 text-white grid place-items-center text-2xl shadow-lg

aria-label="제품 등록"

파일 목록 (반드시 이 파일만)

NEW src/pages/ProductsList/index.tsx

Acceptance (체크리스트)




Notes

초기 데이터는 useProducts().items 사용

이미지가 없으면 bg-slate-100에 박스 아이콘 대체 가능

Output (Codex 지시)

src/pages/ProductsList/index.tsx만 Unified Diff로 출력

외부 패키지 추가 금지, Tailwind 유틸만 사용