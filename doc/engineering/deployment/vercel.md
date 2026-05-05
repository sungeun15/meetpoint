# Vercel 배포 가이드

## 1\. 문서 목적

이 문서는 MeetPoint MVP를 Vercel에 배포할 때 필요한 설정과 순서를 정리한 문서이다.

초보자도 따라갈 수 있도록, 어떤 폴더를 배포 대상으로 잡아야 하는지부터 환경 변수, 배포 순서, 배포 후 점검 항목까지 한 번에 정리한다.

## 2\. 적용 범위

이 문서는 MeetPoint MVP 1차 기준으로 아래 범위에 적용한다.

1.  Vercel 프로젝트 생성
2.  GitHub 저장소 연결 배포
3.  Preview, Production 환경 변수 설정
4.  배포 후 인증, API, Kakao 연동 점검

현재 기준 최종 통합 확인은 로컬 작업 폴더에서 진행하더라도, 실제 Vercel 배포는 그 안의 Git 저장소 루트 구조를 기준으로 잡아야 한다.

## 3\. 배포 대상 구조

workspace 안에서는 팀별로 로컬 작업 폴더가 나뉘어 있을 수 있다.

하지만 이런 이름들은 협업을 위한 로컬 폴더 구분일 뿐이다.

실제로 Vercel이 보는 배포 대상은 선택한 Git 저장소의 루트 구조이다. 현재 배포 기준 저장소 루트는 아래처럼 이해하면 된다.

1.  app/
2.  doc/
3.  public/
4.  package.json
5.  next.config.ts
6.  pnpm-lock.yaml
7.  tsconfig.json

즉, Vercel 배포 기준에서는 로컬 작업 폴더명을 Root Directory 로 넣는 것이 아니라, 실제 Git 저장소 루트를 기준으로 잡아야 한다.

정리하면 다음처럼 이해하면 된다.

1.  workspace 기준 작업 폴더명: 로컬 협업용 구분 이름
2.  실제 배포 대상: 해당 작업 폴더 내부의 Git 저장소 루트
3.  Vercel에서 보는 앱 구조: app, public, package.json 이 바로 보이는 루트

## 4\. 사전 준비 사항

### 4.1 Vercel 계정 및 프로젝트 연결

배포 전에 아래 준비가 되어 있어야 한다.

1.  Vercel 계정 생성
2.  GitHub 계정 연결
3.  meetpoint 저장소 접근 가능 상태 확인
4.  배포 대상으로 사용할 브랜치 확인

가장 쉬운 방식은 GitHub 저장소를 Vercel Dashboard에 import 해서 자동 배포 흐름을 쓰는 것이다.

### 4.2 Git 저장소 연결 방식

MeetPoint는 Git 기반 배포를 기본으로 사용한다.

즉, 아래 흐름으로 이해하면 된다.

1.  GitHub 저장소를 Vercel에 연결한다.
2.  지정한 브랜치에 push 하면 Vercel이 자동으로 새 배포를 만든다.
3.  Pull Request 또는 별도 브랜치 배포는 Preview 환경으로 확인할 수 있다.

CLI 배포도 가능하지만, MVP 운영 기준에서는 Git 연동 방식이 가장 관리하기 쉽다.

### 4.3 필수 환경 변수 준비

배포 전에 아래 환경 변수를 미리 준비해야 한다.

1.  NEXT\_PUBLIC\_SUPABASE\_URL
2.  NEXT\_PUBLIC\_SUPABASE\_PUBLISHABLE\_KEY
3.  SUPABASE\_SERVICE\_ROLE\_KEY
4.  JWT\_SECRET
5.  NEXT\_PUBLIC\_KAKAO\_MAP\_APP\_KEY
6.  KAKAO\_LOCAL\_REST\_API\_KEY

이 값이 하나라도 빠지면 인증, 위치 저장, Kakao 지도, 추천 API 중 일부가 바로 실패할 수 있다.

## 5\. Vercel 프로젝트 설정

### 5.1 Framework Preset

Framework Preset 은 Next.js 로 설정한다.

현재 앱은 Next.js 16 기반이므로 Vercel이 자동 감지하는 경우가 많다. 자동 감지가 되면 그대로 사용하면 된다.

### 5.2 Root Directory

가장 중요한 설정이다.

현재 기준에서는 Root Directory 를 별도 하위 폴더로 잡지 않고, 연결한 Git 저장소의 루트를 그대로 사용하는 것이 맞다.

즉, Vercel 화면에서 app, public, package.json 이 바로 보이는 위치가 Root Directory 기준이다.

잘못해서 workspace 전체나 .my\_work 같은 상위 작업 폴더를 기준으로 잡으면 빌드가 실패하거나 엉뚱한 폴더가 배포될 수 있다.

기본값:

```
Root Directory = 저장소 루트
```

보통은 Root Directory 를 비워 두거나 기본값으로 두면 된다.

### 5.3 Install Command

현재 앱에는 pnpm-lock.yaml 이 있으므로 pnpm 기준으로 맞추는 것이 안전하다.

자동 감지가 되면 기본값을 써도 되지만, 수동 입력이 필요하면 아래처럼 설정한다.

```
pnpm install
```

### 5.4 Build Command

package.json 기준 build 스크립트는 next build 이다.

Vercel에서 수동 입력이 필요하면 아래처럼 설정한다.

```
pnpm build
```

자동 감지가 정상이라면 기본값을 그대로 써도 된다.

### 5.5 Output 및 런타임 주의 사항

Next.js 앱이므로 별도 output directory 를 직접 지정하지 않는 것이 기본이다.

주의할 점은 아래와 같다.

1.  Route Handler 를 쓰므로 서버 실행이 필요한 Next.js 앱으로 배포된다고 생각하면 된다.
2.  JWT 검증, Kakao Local API 호출, Supabase 서버 키 사용은 모두 서버 측 동작이다.
3.  브라우저 전용 키와 서버 전용 키를 섞어 넣으면 안 된다.

즉, NEXT\_PUBLIC\_ 로 시작하는 값만 브라우저 노출 가능 값이고, 나머지는 서버 전용 값으로 관리한다.

## 6\. 환경 변수 설정

### 6.1 Production 환경 변수

Production 에는 실제 운영용 값을 넣는다.

최소한 아래 값은 모두 채워야 한다.

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
NEXT_PUBLIC_KAKAO_MAP_APP_KEY
KAKAO_LOCAL_REST_API_KEY
```

JWT\_SECRET 은 충분히 길고 예측하기 어려운 문자열을 사용한다.

### 6.2 Preview 환경 변수

처음에는 Preview 에도 Production 과 동일한 구조의 값을 넣는 편이 안전하다.

이유는 다음과 같다.

1.  Preview 에서만 로그인 실패가 나는 상황을 줄일 수 있다.
2.  PR 확인 중 Kakao 지도나 추천 API가 갑자기 안 되는 문제를 줄일 수 있다.
3.  배포 실패 원인을 코드 문제와 환경 변수 문제로 쉽게 구분할 수 있다.

단, 팀 운영 기준에 따라 Preview 전용 Supabase 프로젝트를 따로 쓸 수도 있다.

### 6.3 민감 정보 관리 원칙

1.  JWT\_SECRET 은 절대 NEXT\_PUBLIC\_ 로 시작하면 안 된다.
2.  SUPABASE\_SERVICE\_ROLE\_KEY 는 서버 전용 값으로만 사용한다.
3.  KAKAO\_LOCAL\_REST\_API\_KEY 는 브라우저 코드에 직접 넣지 않는다.
4.  환경 변수 값은 문서에 실제 값 자체를 적지 않는다.
5.  값 변경 후에는 필요한 경우 재배포해서 반영 여부를 확인한다.

## 7\. 배포 절차

### 7.1 최초 배포

가장 쉬운 최초 배포 순서는 아래와 같다.

1.  Vercel Dashboard 에서 New Project 를 누른다.
2.  GitHub 저장소 sungeun15/meetpoint 를 선택한다.
3.  Framework Preset 이 Next.js 인지 확인한다.
4.  Root Directory 가 저장소 루트인지 확인한다.
5.  Install Command 가 pnpm install 인지 확인한다.
6.  Build Command 가 pnpm build 인지 확인한다.
7.  환경 변수를 모두 입력한다.
8.  Deploy 를 실행한다.

배포가 성공하면 Production URL 이 생성된다.

### 7.2 변경 배포

최초 연결 후에는 보통 아래처럼 동작한다.

1.  GitHub에 코드 push
2.  Vercel이 새 배포 시작
3.  빌드 로그 확인
4.  배포 완료 후 URL 접속

운영 반영 전에는 Preview 에서 먼저 확인하고, 문제 없을 때 main 기준 반영으로 가는 흐름이 가장 안전하다.

### 7.3 Preview 배포 확인

Preview 배포에서는 아래를 먼저 본다.

1.  로그인 페이지가 정상 렌더링되는지
2.  로그인 후 메인으로 이동하는지
3.  API 호출이 401 또는 500 없이 동작하는지
4.  Kakao Map 이 화면에 뜨는지
5.  추천 요청 시 응답이 오는지

배포가 떴는데 기능이 안 되면 대부분 환경 변수, 쿠키, 외부 API 키 설정부터 확인하는 것이 빠르다.

## 8\. 배포 후 점검 체크리스트

### 8.1 인증 흐름 점검

1.  회원가입 성공 후 메인 화면으로 이동하는지 확인한다.
2.  로그인 성공 후 JWT 쿠키 기준으로 보호 페이지 접근이 되는지 확인한다.
3.  로그아웃 후 다시 보호 페이지에 접근하면 로그인 화면으로 돌아가는지 확인한다.
4.  새로고침 후에도 로그인 상태가 유지되는지 확인한다.

### 8.2 API 동작 점검

1.  친구 추가 API가 정상 동작하는지 확인한다.
2.  메시지 저장 및 조회가 정상 동작하는지 확인한다.
3.  위치 저장 API가 정상 동작하는지 확인한다.
4.  추천 API가 200 응답과 기대한 데이터 구조를 반환하는지 확인한다.

### 8.3 Kakao 연동 점검

1.  NEXT\_PUBLIC\_KAKAO\_MAP\_APP\_KEY 로 지도 SDK가 정상 로드되는지 확인한다.
2.  KAKAO\_LOCAL\_REST\_API\_KEY 로 추천 장소 조회가 정상 동작하는지 확인한다.
3.  브라우저 콘솔과 Vercel 로그에 Kakao 관련 오류가 없는지 확인한다.

## 9\. 자주 발생하는 문제

### 9.1 환경 변수 누락

증상:

1.  로그인은 되는데 API가 500으로 실패한다.
2.  Kakao 지도 또는 추천 기능이 동작하지 않는다.
3.  서버 로그에 process.env 관련 undefined가 보인다.

확인:

1.  Vercel Project Settings > Environment Variables 확인
2.  Preview 와 Production 에 모두 값이 들어갔는지 확인
3.  NEXT\_PUBLIC\_ 와 서버 전용 변수 이름을 섞지 않았는지 확인

### 9.2 빌드 실패

증상:

1.  pnpm install 단계 실패
2.  next build 단계 실패
3.  Root Directory 를 잘못 잡아서 package.json 을 찾지 못함

확인:

1.  Root Directory 가 저장소 루트인지 확인
2.  package.json 과 pnpm-lock.yaml 이 해당 디렉토리에 있는지 확인
3.  Vercel 빌드 로그에서 실패 단계 확인

### 9.3 쿠키 및 인증 문제

증상:

1.  로그인 직후 메인으로 안 넘어감
2.  새로고침하면 로그아웃된 것처럼 보임
3.  보호 API가 계속 401 반환

확인:

1.  JWT\_SECRET 이 올바르게 설정되었는지 확인
2.  로그인/회원가입 시 쿠키가 실제로 내려가는지 확인
3.  운영 환경에서 secure 쿠키 처리 조건이 맞는지 확인

### 9.4 외부 API 호출 실패

증상:

1.  Kakao 지도는 뜨는데 추천 결과가 비정상
2.  추천 API 호출 시 서버 에러 발생
3.  외부 API 응답이 막히거나 인증 실패가 남

확인:

1.  KAKAO\_LOCAL\_REST\_API\_KEY 값 확인
2.  호출이 브라우저가 아니라 서버 Route Handler 에서 이뤄지는지 확인
3.  배포 로그에서 외부 호출 실패 메시지 확인

## 10\. 운영 메모

1.  최종 배포 기준 앱은 01\_sungeun15 로 고정한다.
2.  .my\_work 문서는 배포 대상이 아니라 작업 기준 문서이다.
3.  Engineering 문서에서 환경 변수 항목이 바뀌면 env.md 와 함께 같이 갱신한다.
4.  Preview 가 정상이어도 실제 Production 환경 변수 누락 여부를 마지막에 한 번 더 확인한다.
5.  문제가 생기면 Vercel Deployment Logs 와 Runtime Logs 를 먼저 확인한다.