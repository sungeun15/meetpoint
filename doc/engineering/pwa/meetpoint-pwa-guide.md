# MeetPoint PWA 가이드

## 1\. 문서 목적

*   이 문서는 MeetPoint 프로젝트에 적용한 PWA 구성을 운영/개발 관점에서 빠르게 이해하기 위한 문서다.
*   PWA 일반 설명은 필요한 범위로만 간단히 다루고, 현재 프로젝트 구현 상태를 중심으로 정리한다.

## 2\. PWA란 무엇인가 (간단 설명)

PWA(Progressive Web App)는 웹 앱을 앱처럼 설치하고 실행할 수 있게 하는 방식이다.

핵심 요소는 3가지다.

1.  Manifest

*   앱 이름, 아이콘, 시작 경로, 표시 모드(standalone) 같은 앱 메타데이터를 제공한다.

1.  Service Worker

*   캐시 전략과 오프라인 fallback을 제어한다.

1.  Installability 조건

*   HTTPS, 유효한 manifest, service worker 등록 등 브라우저 조건을 만족해야 설치 UI가 나타난다.

## 3\. 현재 프로젝트 적용 범위

### 3-1. Manifest 구성

*   파일: `project/public/manifest.webmanifest`
*   주요 값
    *   `start_url: "/"`
    *   `scope: "/"`
    *   `display: "standalone"`
    *   아이콘: `/icons/*`
*   루트 경로 기준 상대 경로로 작성되어, 루트 배포(`https://meetpoint-iota.vercel.app/`)에 맞는다.

### 3-2. Service Worker 등록

*   파일: `project/app/components/pwa-service-worker.tsx`
*   동작
    *   production 환경에서만 `/sw.js`를 등록한다.
    *   등록 실패는 앱 전체 동작을 막지 않도록 무시한다.

### 3-3. Service Worker 캐시 전략

*   파일: `project/public/sw.js`
*   캐시 분리
    *   `STATIC_CACHE = "meetpoint-static-v2"`
    *   `RUNTIME_CACHE = "meetpoint-runtime-v2"`
*   요청별 전략
    1.  Navigation 요청: `networkFirst` + `/offline.html` fallback
    2.  `/_next/static/` 요청: `cacheFirst`
    3.  아이콘/이미지/manifest 요청: `staleWhileRevalidate`
    4.  그 외 동일 출처 GET: `staleWhileRevalidate`

## 4\. 설치 배너 구조

### 4-1. 배너 UI 컴포넌트

*   파일: `project/app/components/pwa-install-banner.tsx`
*   역할
    *   배너/토스트 UI 렌더링
    *   설치 버튼 클릭 시 액션 실행
    *   hide 버튼(오늘/7일) 처리

### 4-2. 배너 로직 분리 모듈

`project/app/components/pwa/use-pwa-install-state.ts`

*   플랫폼 감지
*   `beforeinstallprompt`, `appinstalled`, `display-mode` 이벤트 구독
*   배너 표시 여부 계산

`project/app/components/pwa/pwa-install-copy.ts`

*   플랫폼별 배너 문구/버튼 라벨 생성

`project/app/components/pwa/pwa-install-actions.ts`

*   설치 액션 정책 분기
*   `prompt`, `manual`, `unsupported` 경로 처리

`project/app/components/pwa/pwa-install-storage.ts`

*   localStorage 접근 캡슐화
*   snapshot 읽기/쓰기 및 마이그레이션 처리

## 5\. 설치 상태 저장 정책 (snapshot)

기존 boolean(`installed=true`) 대신 snapshot 기반으로 저장한다.

### 5-1. 저장 구조

`PwaInstallSnapshot`

*   `dismissUntil: number | null`
*   `lastStandaloneAt: number | null`
*   `lastAppInstalledAt: number | null`

저장 키

*   신규: `meetpoint-install-banner-snapshot`
*   레거시 호환
    *   `meetpoint-install-banner-dismiss-until`
    *   `meetpoint-install-banner-installed`

레거시 키가 남아 있으면 첫 읽기 시 snapshot으로 마이그레이션한다.

### 5-2. 최근 설치 신호 윈도우

*   현재 기준: 30일
*   코드 상수: `RECENT_INSTALL_SIGNAL_WINDOW_IN_MS = 30 * ONE_DAY_IN_MS`

### 5-3. 배너 노출 판단 개요

1.  현재 standalone 모드면 배너 숨김
2.  최근 30일 내 `lastStandaloneAt` 또는 `lastAppInstalledAt`가 있으면 숨김
3.  `dismissUntil`이 미래 시각이면 숨김
4.  그 외에는 플랫폼/설치 가능 상태에 따라 노출

## 6\. 플랫폼별 설치 액션 정책

Desktop Chrome/Edge + prompt 가능

*   브라우저 설치 프롬프트 실행

Android/iOS에서 prompt 미제공

*   수동 설치 안내 메시지 반환

기타 미지원 브라우저

*   unsupported 메시지 반환

즉, 버튼 라벨은 같아도 내부 액션은 플랫폼/브라우저 상태에 따라 분기된다.

## 7\. 현재 동작 체크 포인트

### 7-1. 설치 전

*   배너가 노출된다.
*   `Install MeetPoint`, `Hide for today`, `Hide for 7 days` 버튼이 보인다.

### 7-2. 설치 성공 후

*   설치 성공 토스트가 노출된다.
*   배너는 숨겨진다.
*   이후 브라우저 탭 진입 시 snapshot 조건에 따라 재노출 여부가 결정된다.

### 7-3. 수동 설치 플랫폼

*   설치 버튼 클릭 시 브라우저별 수동 설치 경로 안내 메시지가 노출된다.

## 8\. 한계와 주의사항

1.  브라우저는 앱 삭제 이벤트를 직접 제공하지 않는다.

*   따라서 snapshot은 최근 신호 기반의 추정 정책이다.

1.  완전 오프라인 앱 보장은 아님

*   현재 전략은 fallback과 주요 정적 리소스 안정화에 초점이 있다.

1.  운영 배포 확인 필수

*   운영에서 `/manifest.webmanifest`, `/sw.js` 응답이 실제로 살아 있어야 설치 경험이 정상 동작한다.

## 9\. 배포 전 점검 체크

1.  `pnpm --dir E:\workspace\meetpoint\project lint`
2.  `pnpm --dir E:\workspace\meetpoint\project build`
3.  실기기 점검 문서 수행
    *   `.my_work/Refactoring/project_pwa_device_checklist.md`

## 10\. 관련 파일 목록

*   `project/public/manifest.webmanifest`
*   `project/public/sw.js`
*   `project/app/layout.tsx`
*   `project/app/components/pwa-service-worker.tsx`
*   `project/app/components/pwa-install-banner.tsx`
*   `project/app/components/pwa/use-pwa-install-state.ts`
*   `project/app/components/pwa/pwa-install-storage.ts`
*   `project/app/components/pwa/pwa-install-copy.ts`
*   `project/app/components/pwa/pwa-install-actions.ts`