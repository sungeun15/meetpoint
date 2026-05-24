# 환경 변수 가이드

## 1\. 문서 목적

이 문서는 MeetPoint에서 사용하는 환경 변수를 한 번에 정리한 기준 문서이다.

무슨 값을 왜 쓰는지, 브라우저에 노출 가능한 값과 서버 전용 값을 어떻게 나눠야 하는지, local과 preview와 production에서 어떻게 관리해야 하는지를 쉽게 이해할 수 있도록 정리한다.

## 2\. 환경 변수 운영 원칙

MeetPoint에서는 환경 변수를 아래 원칙으로 관리한다.

1.  값이 바뀔 수 있는 설정은 코드에 직접 넣지 않고 환경 변수로 분리한다.
2.  브라우저에 노출 가능한 값과 서버 전용 값을 반드시 구분한다.
3.  local, preview, production 환경을 분리해서 관리한다.
4.  실제 비밀 값은 문서에 적지 않고, 변수 이름과 용도만 문서화한다.
5.  값이 누락되면 로그인, 지도, 추천 API, DB 처리 중 일부가 바로 실패할 수 있으므로 배포 전 확인이 필요하다.
6.  운영 헬스체크를 사용한다면 CRON_SECRET 도 함께 관리해야 한다.

가장 중요한 구분은 아래 한 줄이다.

1.  NEXT\_PUBLIC\_ 로 시작하면 브라우저에서도 읽을 수 있는 값
2.  NEXT\_PUBLIC\_ 가 없으면 서버에서만 써야 하는 값

## 3\. 환경별 구분

### 3.1 local

local 은 개발자 PC에서 실행하는 로컬 개발 환경이다.

보통 .env.local 파일이나 로컬 개발 설정을 사용한다.

이 환경에서는 다음을 먼저 확인한다.

1.  로그인 API가 동작하는지
2.  Supabase 연결이 되는지
3.  Kakao Map 이 뜨는지
4.  추천 API가 정상 응답하는지

### 3.2 preview

preview 는 배포 전에 확인하는 테스트용 배포 환경이다.

보통 Pull Request 확인, 기능 점검, 팀 검토용으로 사용한다.

preview 에서는 production 과 같은 구조의 환경 변수를 넣는 편이 안전하다. 그래야 코드 문제인지 환경 변수 문제인지 구분하기 쉽다.

### 3.3 production

production 은 실제 최종 배포 환경이다.

여기에는 실제 운영용 Supabase 값, 실제 JWT 비밀 값, 실제 Kakao 키를 넣는다.

특히 JWT\_SECRET 과 SUPABASE\_SERVICE\_ROLE\_KEY 는 production 에서 더 엄격하게 관리해야 한다.

## 4\. 필수 환경 변수 목록

### 4.1 NEXT\_PUBLIC\_SUPABASE\_URL

역할:

1.  Supabase 프로젝트 URL
2.  브라우저와 서버가 공통으로 참조할 수 있는 기본 주소

특징:

1.  NEXT\_PUBLIC\_ 로 시작하므로 브라우저 노출 가능
2.  보통 Supabase 프로젝트 설정에서 복사함

누락 시 증상:

1.  Supabase 연결 실패
2.  인증 또는 데이터 호출 초기화 실패

### 4.2 NEXT\_PUBLIC\_SUPABASE\_PUBLISHABLE\_KEY

역할:

1.  Supabase의 공개용 publishable key
2.  브라우저에서 Supabase 클라이언트를 만들 때 사용 가능

특징:

1.  공개 가능한 키지만 아무 값이나 넣으면 안 된다.
2.  Supabase 공식 문서와 대시보드 기준으로 publishable key 명칭을 사용한다.
3.  MeetPoint 문서와 환경 변수명은 NEXT\_PUBLIC\_SUPABASE\_PUBLISHABLE\_KEY 기준으로 통일한다.
4.  service role key 와 혼동하면 안 된다.

누락 시 증상:

1.  클라이언트 측 Supabase 연결 실패
2.  초기 사용자 상태 확인 또는 공개 데이터 접근 실패

### 4.3 SUPABASE\_SERVICE\_ROLE\_KEY

역할:

1.  서버에서만 쓰는 Supabase 관리자 권한 키
2.  Route Handler 나 서버 로직에서 안전하게 사용할 값

특징:

1.  절대 브라우저에 노출하면 안 된다.
2.  NEXT\_PUBLIC\_ 를 붙이면 안 된다.

누락 시 증상:

1.  서버 측 DB 처리 실패
2.  권한이 필요한 저장, 조회 로직 실패

### 4.4 JWT\_SECRET

역할:

1.  JWT 서명 생성
2.  JWT 검증

특징:

1.  서버 전용 값이다.
2.  로그인, 회원가입, 보호 API, 보호 페이지 접근 모두 이 값의 영향을 받는다.
3.  충분히 길고 예측하기 어려운 문자열을 사용해야 한다.

누락 시 증상:

1.  로그인 성공 후에도 세션 유지 실패
2.  보호 페이지 접근 실패
3.  보호 API가 401 또는 500으로 실패

### 4.5 NEXT\_PUBLIC\_KAKAO\_MAP\_APP\_KEY

역할:

1.  Kakao Map SDK 로드
2.  지도 렌더링

특징:

1.  브라우저에서 지도를 띄우기 위해 필요한 공개 가능한 키이다.
2.  REST API 키와 다르다.

누락 시 증상:

1.  지도 SDK 로드 실패
2.  chat 화면에서 지도 미표시

### 4.6 KAKAO\_LOCAL\_REST\_API\_KEY

역할:

1.  Kakao Local API 호출
2.  추천 장소 검색

특징:

1.  서버에서만 사용해야 한다.
2.  브라우저 코드에 직접 넣으면 안 된다.

누락 시 증상:

1.  추천 API 호출 실패
2.  장소 후보 조회 실패
3.  지도는 뜨는데 추천 결과가 비정상

### 4.7 SUPABASE\_DATABASE\_URL

역할:

1.  Supabase PostgreSQL 직접 접속 또는 session pooler 접속
2.  DB 점검 및 테스트 스크립트 실행

특징:

1.  서버 전용 값이다.
2.  앱 화면 렌더링 자체의 최소 조건은 아니지만, 테스트 스크립트와 DB 점검에는 필요하다.
3.  session pooler URL 과 direct URL 을 구분해 관리해야 한다.

누락 시 증상:

1.  test:supabase:table 같은 DB 스크립트 실행 실패
2.  스키마 점검 또는 관리자성 DB 검증 실패

### 4.8 CRON\_SECRET

역할:

1.  /api/health/supabase 인증 헤더 검증
2.  Vercel cron 기반 운영 헬스체크 보호

특징:

1.  서버 전용 값이다.
2.  Vercel cron 또는 수동 헬스체크 호출 시 Bearer 토큰으로 사용한다.

누락 시 증상:

1.  /api/health/supabase 가 503 으로 실패
2.  Vercel cron 헬스체크가 정상 동작하지 않음

## 5\. 공개 가능 변수와 비공개 변수 구분

공개 가능 변수:

1.  NEXT\_PUBLIC\_SUPABASE\_URL
2.  NEXT\_PUBLIC\_SUPABASE\_PUBLISHABLE\_KEY
3.  NEXT\_PUBLIC\_KAKAO\_MAP\_APP\_KEY

서버 전용 변수:

1.  SUPABASE\_SERVICE\_ROLE\_KEY
2.  JWT\_SECRET
3.  KAKAO\_LOCAL\_REST\_API\_KEY
4.  SUPABASE\_DATABASE\_URL
5.  CRON\_SECRET

쉽게 구분하면 다음과 같다.

1.  브라우저 코드에서 직접 읽어도 되는 값이면 NEXT\_PUBLIC\_
2.  서버에서만 써야 하는 값이면 NEXT\_PUBLIC\_ 없이 관리

특히 아래 실수는 피해야 한다.

1.  SUPABASE\_SERVICE\_ROLE\_KEY 에 NEXT\_PUBLIC\_ 붙이기
2.  JWT\_SECRET 을 프론트 코드에서 참조하기
3.  KAKAO\_LOCAL\_REST\_API\_KEY 를 클라이언트 컴포넌트에 넣기

## 6\. 로컬 개발 설정 방법

로컬 개발에서는 보통 아래 흐름으로 설정한다.

1.  프로젝트 루트에 로컬 환경 변수 파일을 준비한다.
2.  앱 실행용 핵심 변수와 테스트용 추가 변수를 채운다.
3.  개발 서버를 실행한다.
4.  로그인, 지도, 추천 기능을 차례로 확인한다.

기본 형식:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_DATABASE_URL=...
JWT_SECRET=...
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=...
KAKAO_LOCAL_REST_API_KEY=...
CRON_SECRET=...
```

바로 참고할 수 있도록 전체 .env 형식을 아래에 정리하면 다음과 같다.

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

각 값은 아래처럼 이해하면 된다.

1.  NEXT\_PUBLIC\_SUPABASE\_URL: Supabase 프로젝트 주소
2.  NEXT\_PUBLIC\_SUPABASE\_PUBLISHABLE\_KEY: 브라우저에서 사용 가능한 공개용 Supabase 키
3.  SUPABASE\_SERVICE\_ROLE\_KEY: 서버 전용 Supabase 관리자 키
4.  SUPABASE\_DATABASE\_URL: DB 테스트 스크립트나 직접 접속 점검에 쓰는 서버 전용 연결 문자열
5.  JWT\_SECRET: JWT 서명과 검증에 쓰는 서버 전용 비밀 문자열
6.  NEXT\_PUBLIC\_KAKAO\_MAP\_APP\_KEY: 브라우저에서 지도를 띄울 때 쓰는 Kakao JavaScript 키
7.  KAKAO\_LOCAL\_REST\_API\_KEY: 서버에서 장소 검색에 쓰는 Kakao REST API 키
8.  CRON\_SECRET: 운영 헬스체크 인증에 쓰는 서버 전용 비밀 값

참고:

1.  Supabase 공식 화면과 예시 기준으로, MeetPoint 프로젝트 변수명은 NEXT\_PUBLIC\_SUPABASE\_PUBLISHABLE\_KEY로 고정한다.
2.  문서와 코드, 배포 설정은 같은 이름을 써야 혼동을 줄일 수 있다.

주의:

1.  위 코드는 변수 구조를 보여 주기 위한 예시값이다.
2.  실제 로컬 개발이나 실제 배포에서는 각 서비스에서 발급받은 실제 값으로 바꿔야 한다.
3.  특히 SUPABASE\_SERVICE\_ROLE\_KEY, SUPABASE\_DATABASE\_URL, JWT\_SECRET, CRON\_SECRET 은 절대 공개 저장소에 올리면 안 된다.

주의:

1.  실제 값은 저장소에 커밋하지 않는다.
2.  로컬 테스트 값과 운영 값을 섞지 않는다.

### 6.1 앱 실행 변수와 스키마 변경 변수는 다르다

MeetPoint 앱을 실행하고 기존 테이블에 접근하는 데에는 아래 3개면 충분하다.

1.  NEXT\_PUBLIC\_SUPABASE\_URL
2.  NEXT\_PUBLIC\_SUPABASE\_PUBLISHABLE\_KEY
3.  SUPABASE\_SERVICE\_ROLE\_KEY

하지만 새 테이블 생성, ALTER TABLE, 인덱스 생성 같은 스키마 변경은 앱 실행과 다른 관리자 작업이다.

이 작업은 단순 데이터 조회나 저장보다 더 강한 관리자 경로가 필요하므로, 앱 실행용 기본 변수와 분리해서 관리하는 편이 안전하다.

즉, 기본 .env 문서에는 앱 실행에 꼭 필요한 값만 먼저 두고, PostgreSQL 직접 접속 정보는 선택적인 관리자용 변수로 따로 보는 것이 맞다.

### 6.2 새 테이블 생성까지 하려면 추가 정보가 필요하다

새 테이블 생성이나 직접 SQL 실행이 필요할 때는 아래 중 하나가 더 있어야 한다.

1.  Supabase SQL Editor
2.  PostgreSQL 직접 접속 정보
3.  Supabase CLI migration 환경
4.  별도로 만든 관리자용 내부 스크립트

PostgreSQL 접속 정보는 크게 아래 두 방식으로 볼 수 있다.

1.  session pooler 연결
2.  direct 연결

로컬 개발 환경이나 일반 IPv4 네트워크에서는 session pooler 연결을 먼저 쓰는 편이 안전하다.

direct 연결은 `db.<project-ref>.supabase.co` 호스트를 직접 쓰므로, 네트워크 환경에 따라 IPv6 지원이나 별도 IPv4 구성이 필요할 수 있다.

session pooler 기준 예시는 아래와 같다.

```
SUPABASE_DATABASE_URL=postgresql://postgres.your-project-ref:[YOUR_PASSWORD]@aws-0-your-region.pooler.supabase.com:5432/postgres
```

중요:

1.  pooler URL에서는 사용자명이 `postgres.your-project-ref` 형태가 된다.
2.  host는 `db.`가 아니라 `aws-0-...pooler.supabase.com` 형태를 사용한다.

direct 연결 기준 예시는 아래와 같다.

```
SUPABASE_DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.your-project-ref.supabase.co:5432/postgres?sslmode=require
```

또는 아래처럼 나눠서 관리할 수도 있다.

```
SUPABASE_DB_HOST=db.your-project-ref.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DATABASE_PASSWORD=your-postgres-password
```

주의:

1.  위 값들은 앱 실행에 필수인 기본 변수는 아니다.
2.  DB 스키마 변경이나 직접 접속이 필요할 때만 로컬 관리자용으로 관리한다.
3.  특히 connection string, DB password 같은 값은 절대 공개 저장소에 커밋하지 않는다.

## 7\. 배포 환경 설정 방법

배포 환경에서는 Vercel Project Settings 의 Environment Variables 에 값을 넣는다.

기본 순서는 아래와 같다.

1.  Preview 와 Production 환경을 구분해서 변수 등록
2.  앱 실행과 운영 검증에 필요한 변수를 모두 입력
3.  저장 후 재배포 또는 새 배포 확인

권장 방식:

1.  처음에는 Preview 와 Production 모두 같은 구조로 맞춘다.
2.  이후 필요하면 Preview 전용 테스트 값을 분리한다.

배포 전 마지막 체크:

1.  JWT\_SECRET 누락 여부
2.  KAKAO\_LOCAL\_REST\_API\_KEY 누락 여부
3.  NEXT\_PUBLIC\_KAKAO\_MAP\_APP\_KEY 누락 여부
4.  SUPABASE\_SERVICE\_ROLE\_KEY 를 공개 변수로 잘못 넣지 않았는지 확인
5.  운영 헬스체크를 쓴다면 CRON\_SECRET 누락 여부 확인

## 8\. 누락 또는 오설정 시 증상

NEXT\_PUBLIC\_SUPABASE\_URL 또는 NEXT\_PUBLIC\_SUPABASE\_PUBLISHABLE\_KEY 문제:

1.  Supabase 초기화 실패
2.  로그인 흐름 이상
3.  데이터 읽기 실패

SUPABASE\_SERVICE\_ROLE\_KEY 문제:

1.  서버 DB 처리 실패
2.  Route Handler 내부 저장 로직 실패

JWT\_SECRET 문제:

1.  로그인 후 보호 페이지 이동 실패
2.  새로고침 시 로그아웃처럼 보임
3.  보호 API 401 또는 500 발생

NEXT\_PUBLIC\_KAKAO\_MAP\_APP\_KEY 문제:

1.  지도 화면 미표시
2.  Kakao SDK 로드 실패

KAKAO\_LOCAL\_REST\_API\_KEY 문제:

1.  추천 결과 비정상
2.  장소 검색 실패
3.  서버 로그에 외부 API 인증 실패 표시

CRON\_SECRET 문제:

1.  /api/health/supabase 가 503 으로 응답함
2.  Vercel cron 헬스체크가 실패함

## 9\. 보안 주의 사항

1.  실제 비밀 값은 문서, README, 채팅 로그에 직접 적지 않는다.
2.  JWT\_SECRET 은 충분히 긴 난수 문자열을 사용한다.
3.  SUPABASE\_SERVICE\_ROLE\_KEY 는 서버에서만 사용한다.
4.  KAKAO\_LOCAL\_REST\_API\_KEY 는 브라우저에서 직접 호출하지 않는다.
5.  공개 변수와 비공개 변수를 이름으로 확실히 나눈다.
6.  값이 바뀐 뒤에는 로그인, 지도, 추천 기능을 다시 점검한다.

## 10\. 운영 메모

1.  환경 변수 목록이 바뀌면 deployment/vercel.md 와 함께 같이 갱신한다.
2.  인증 관련 값이 바뀌면 auth/jwt.md 와도 기준을 맞춘다.
3.  GitHub에 올라가는 문서에는 실제 키 값 자체를 넣지 않는다.
4.  Preview 가 정상이어도 Production 값 누락 여부를 마지막에 다시 확인한다.
5.  문제가 생기면 먼저 환경 변수 누락부터 의심하는 것이 가장 빠르다.