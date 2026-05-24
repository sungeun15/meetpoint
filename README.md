# MeetPoint

MeetPoint는 두 사용자가 위치를 공유하고 댓글형 채팅을 주고받으며, 서로에게 공정한 중간 지점 근처 약속 장소를 추천받는 웹 서비스입니다.

메신저, 지도 앱, 장소 검색을 각각 따로 오가지 않고, 친구 선택부터 위치 공유, 채팅, 추천 확인까지 한 흐름으로 이어지는 경험을 목표로 합니다.

## 링크

*   운영 사이트: https://meetpoint-iota.vercel.app/
*   Figma: https://www.figma.com/design/VgR0GBnCXhUsssxozIqfkK/opensource

## 주요 기능

*   닉네임 + 비밀번호 기반 회원가입 및 로그인
*   친구 추가 및 친구 목록 조회
*   댓글형 채팅 UI
*   버튼 클릭 기반 위치 공유
*   지도에서 사용자, 친구, 중심점 표시
*   중심점 기반 장소 추천 10개 제공

## 기술 스택

*   Frontend: Next.js 16, React 19, Tailwind CSS 4
*   Backend: Next.js Route Handlers
*   Database: Supabase
*   Map / Search: Kakao Map API, Kakao Local API
*   Deployment: Vercel

## 시작하기

### 1\. 의존성 설치

```
pnpm install
```

### 2\. 환경 변수 설정

루트 경로에 `.env.local` 파일을 만들고 아래 예시를 참고해 값을 채워 주세요.

```
NEXT_PUBLIC_SUPABASE_URL=https://sample-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_sample-key-value
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample-service-role-key-value
SUPABASE_DATABASE_URL=postgresql://postgres.your-project-ref:[YOUR_PASSWORD]@aws-0-your-region.pooler.supabase.com:5432/postgres
JWT_SECRET=meetpoint-local-jwt-secret-2026-example
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=1234567890abcdef1234567890abcdef
KAKAO_LOCAL_REST_API_KEY=abcdef1234567890abcdef1234567890
CRON_SECRET=meetpoint-local-cron-secret-example
```

환경 변수 설명:

*   `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
*   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: 브라우저에서 사용하는 공개용 Supabase 키
*   `SUPABASE_SERVICE_ROLE_KEY`: 서버 전용 Supabase 관리자 키
*   `SUPABASE_DATABASE_URL`: Supabase 연결/테스트 스크립트용 DB 접속 문자열
*   `JWT_SECRET`: JWT 서명 및 검증에 사용하는 서버 전용 비밀 값
*   `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`: 브라우저에서 Kakao Map SDK를 로드할 때 사용하는 JavaScript 키
*   `KAKAO_LOCAL_REST_API_KEY`: 서버에서 Kakao Local API를 호출할 때 사용하는 REST API 키
*   `CRON_SECRET`: `/api/health/supabase` 운영 헬스체크 인증에 사용하는 서버 전용 비밀 값

주의 사항:

*   실제 비밀 값은 저장소에 커밋하지 마세요.
*   `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DATABASE_URL`, `JWT_SECRET`, `KAKAO_LOCAL_REST_API_KEY`, `CRON_SECRET`는 서버 전용으로 관리해야 합니다.
*   운영 환경과 로컬 환경은 별도 값으로 관리하는 것을 권장합니다.

### 3\. 개발 서버 실행

```
pnpm dev
```

브라우저에서 `http://localhost:3000`을 열어 확인할 수 있습니다.

## 실행 및 검증 명령어

```
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm type-check
```

외부 연동 및 DB 테스트 스크립트:

```
pnpm run test:kakao:sdk
pnpm run test:kakao:local
pnpm run test:supabase
pnpm run test:supabase:schema
pnpm run test:supabase:backfill-addresses
pnpm run test:supabase:table
pnpm run test:supabase:cleanup
```

운영 헬스체크:

*   `/api/health/supabase` Route Handler로 Supabase 테이블 접근 상태를 확인할 수 있습니다.
*   `vercel.json` 에 `0 3 * * *` 일 1회 크론 설정이 포함되어 있습니다.
*   `CRON_SECRET` 환경 변수가 설정되어 있어야 Vercel cron 요청이 통과합니다.

## 프로젝트 구조

```
app/
    about/
    chat/
    components/
    friends/
    login/
    signup/
doc/
    engineering/
    PRD/
    workflow/
scripts/
    test-kakao/
    test-supabase/
```

## 문서 인덱스

### PRD

*   [01.기획](./doc/PRD/01.%EA%B8%B0%ED%9A%8D.md)
*   [02.구조 설계](./doc/PRD/02.%EA%B5%AC%EC%A1%B0%20%EC%84%A4%EA%B3%84.md)
*   [03.기술 설계](./doc/PRD/03.%EA%B8%B0%EC%88%A0%20%EC%84%A4%EA%B3%84.md)
*   [04.ERD](./doc/PRD/04.ERD.md)
*   [05.API 명세서](./doc/PRD/05.API%20%EB%AA%85%EC%84%B8%EC%84%9C.md)
*   [06.DB 스키마 및 SQL 문서](./doc/PRD/06.DB%20%EC%8A%A4%ED%82%A4%EB%A7%88%20%EB%B0%8F%20SQL%20%EB%AC%B8%EC%84%9C.md)
*   [07.화면 명세서](./doc/PRD/07.%ED%99%94%EB%A9%B4%20%EB%AA%85%EC%84%B8%EC%84%9C.md)
*   [08.테스트 체크리스트](./doc/PRD/08.%ED%85%8C%EC%8A%A4%ED%8A%B8%20%EC%B2%B4%ED%81%AC%EB%A6%AC%EC%8A%A4%ED%8A%B8.md)
*   [09.배포 및 환경설정 문서](./doc/PRD/09.%EB%B0%B0%ED%8F%AC%20%EB%B0%8F%20%ED%99%98%EA%B2%BD%EC%84%A4%EC%A0%95%20%EB%AC%B8%EC%84%9C.md)
*   [10.WBS 및 팀원별 작업 분담](./doc/PRD/10.WBS%20%EB%B0%8F%20%ED%8C%80%EC%9B%90%EB%B3%84%20%EC%9E%91%EC%97%85%20%EB%B6%84%EB%8B%B4.md)

### Engineering

*   [JWT 인증 가이드](./doc/engineering/auth/jwt.md)
*   [환경 변수 가이드](./doc/engineering/config/env.md)
*   [Supabase 가이드](./doc/engineering/database/01.supabase.md)
*   [Supabase 연동 테스트](./doc/engineering/database/02.supabase-integration-test.md)
*   [Vercel 배포 가이드](./doc/engineering/deployment/vercel.md)
*   [Kakao Map 사용 가이드](./doc/engineering/external/01.kakao-map.md)
*   [Kakao 테스트 스크립트 사용법](./doc/engineering/external/02.Kakao%20%ED%85%8C%EC%8A%A4%ED%8A%B8%20%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8%20%EC%82%AC%EC%9A%A9%EB%B2%95.md)

### Workflow

*   [Git 및 GitHub 사용법](./doc/workflow/01.Git%20%EB%B0%8F%20GitHub%20%EC%82%AC%EC%9A%A9%EB%B2%95.md)
*   [브랜치 전략 및 작업 흐름](./doc/workflow/02.%EB%B8%8C%EB%9E%9C%EC%B9%98%20%EC%A0%84%EB%9E%B5%20%EB%B0%8F%20%EC%9E%91%EC%97%85%20%ED%9D%90%EB%A6%84.md)

## 배포

운영 배포는 Vercel을 기준으로 관리합니다.

*   운영 주소: https://meetpoint-iota.vercel.app/
*   배포 문서: [09.배포 및 환경설정 문서](./doc/PRD/09.%EB%B0%B0%ED%8F%AC%20%EB%B0%8F%20%ED%99%98%EA%B2%BD%EC%84%A4%EC%A0%95%20%EB%AC%B8%EC%84%9C.md)
*   세부 배포 가이드: [Vercel 배포 가이드](./doc/engineering/deployment/vercel.md)

## License

이 프로젝트는 [MIT License](./LICENSE)를 따릅니다.

## 참고

*   디자인 원본은 Figma를 기준으로 관리합니다.
*   문서 기준 설명은 `doc` 폴더를 우선 확인하세요.
*   발표 자료 문서는 인덱스에서 제외했습니다.