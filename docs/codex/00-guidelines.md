온누리 재고관리 – Codex 공통 규칙(수정 금지)

환경 고정

Vite + React + TypeScript

TailwindCSS (CJS 설정 유지): tailwind.config.cjs, postcss.config.cjs

상태: zustand

라우팅: react-router-dom

외부 라이브러리 추가 금지 (기존 패키지만 사용)

출력 형식

“변경/추가된 파일만” Unified Diff 로 제출

새 파일은 파일 전체 내용 포함

커밋 메시지 예시: feat(products): list page skeleton (wireframe V6)

레이아웃 & 스타일 가이드

모바일 우선, 페이지 컨테이너: px-4 py-3 max-w-[480px] mx-auto

Tailwind 유틸리티 클래스만 사용(별도 CSS 파일 생성 금지)

카드/컨테이너 경계: bg-white border border-slate-200 rounded-2xl

본문 타이포: text-slate-900; 보조: text-slate-600

구분선: border-slate-200; 페이지 배경: bg-surface-50

수량(Qty)와 D-배지 규칙

수량: 배경색 없이 타이포 강조

클래스: select-none tabular-nums tracking-tight text-[20px] font-black

위치: 카드 우측, 세로 중앙

D-배지(아이콘 없음, 인라인)

공통: inline-flex h-6 items-center px-2.5 rounded-full text-[12px]

만료(d < 0): bg-red-600 text-white

임박(0 ≤ d ≤ 7): bg-amber-100 text-amber-800

근접(8 ≤ d ≤ 30): bg-yellow-100 text-yellow-800

여유(> 30): bg-slate-100 text-slate-700

접근성

상호작용 요소는 시맨틱 엘리먼트 사용(button, a 등)

주요 버튼 aria-label 필수, 이미지 alt 필수

경로/파일 이름

문서에 명시된 파일만 수정/생성

폴더/이름 변경 금지. alias(@/) 안 되면 상대경로 사용

데이터/상태

초기엔 더미 데이터 사용(src/store/products.ts)

후속에 API로 바꿀 수 있도록 타입/스토어 인터페이스 유지