---
title: "API 서버와 데이터베이스 간 네트워크 지연 문제 해결기 (ft. Supabase 리전 변경)"
description: "안녕하세요, 장동호입니다."
date: 2025-06-08
tags:
  - DB
---

안녕하세요, 장동호입니다.


오늘은 제가 직접 경험한 API 서버와 데이터베이스 간 네트워크 지연 문제, 그리고 Supabase 리전 변경과 데이터 마이그레이션 과정을 공유합니다.


# 문제 상황


어느 날 갑자기 서비스에서 느린 응답 문제가 발생했습니다.


Sentry를 살펴보니, `pg.connect` 함수로 DB에 연결하는 데만 650ms가 걸리고 있었습니다.


0.6초 넘게 DB 연결만 기다리다니, 이건 분명히 문제가 있었다는 신호였죠.


![image.png](/posts/attachments/API-%EC%84%9C%EB%B2%84%EC%99%80-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4-%EA%B0%84-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC-%EC%A7%80%EC%97%B0-%EB%AC%B8%EC%A0%9C-%ED%95%B4%EA%B2%B0%EA%B8%B0-ft-Supabase-%EB%A6%AC%EC%A0%84-%EB%B3%80%EA%B2%BD/img-01.png)


# 문제 원인


우리 서비스는 다음과 같은 구조였어요.


```typescript
한국(클라이언트) → 미국(API 서버) → 한국(DB 서버) → 미국(API 서버) → 한국(클라이언트)
```


API 서버가 미국에 위치해 있어, 데이터베이스 쿼리를 처리하기 위해 한국 DB 서버로 다시 요청을 보내야 했습니다. 


이로 인해 왕복 네트워크 지연이 발생했고, 결과적으로 응답 시간이 길어졌습니다.


![기존 구조 시퀀스 다이어그램](/posts/attachments/API-%EC%84%9C%EB%B2%84%EC%99%80-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4-%EA%B0%84-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC-%EC%A7%80%EC%97%B0-%EB%AC%B8%EC%A0%9C-%ED%95%B4%EA%B2%B0%EA%B8%B0-ft-Supabase-%EB%A6%AC%EC%A0%84-%EB%B3%80%EA%B2%BD/img-02.png)


![개선 구조 시퀀스 다이어그램](/posts/attachments/API-%EC%84%9C%EB%B2%84%EC%99%80-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4-%EA%B0%84-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC-%EC%A7%80%EC%97%B0-%EB%AC%B8%EC%A0%9C-%ED%95%B4%EA%B2%B0%EA%B8%B0-ft-Supabase-%EB%A6%AC%EC%A0%84-%EB%B3%80%EA%B2%BD/img-03.png)


# 해결 과정


현 상황에서 Best Practice는 API 서버를 한국으로 옮기는 것이었으나, 클라우드 프리 티어 정책 때문에 서버를 미국에 계속 두어야 했습니다. 따라서 DB를 미국 리전으로 이전하는 쪽으로 방향을 잡았습니다.


하지만 여기에 한 가지 큰 문제가 있었습니다.


저희는 Supabase라는 관리형 PostgreSQL 서비스를 사용 중이었는데, Supabase는 프로젝트 생성 후 리전 변경을 지원하지 않아, 새 프로젝트를 생성하고 데이터를 마이그레이션하는 방식으로만 리전 이전이 가능했습니다.


이에 저는 `pg_dump`와 `pg_restore`를 활용해 PostgreSQL 백업을 받고, 이를 새 프로젝트에 복원하는 방법을 선택했습니다.


맥OS를 기준으로 진행한 방법은 다음과 같습니다.


## 1. 로컬에 postgresql 설치하기


Supabase에서 데이터를 백업하거나 복원하려면 `pg_dump`, `pg_restore`, `psql` 등 PostgreSQL CLI 도구들이 필요합니다. 이 도구들은 PostgreSQL이 로컬에 설치되어 있어야 사용할 수 있습니다.


macOS에서는 Homebrew를 통해 간편하게 설치할 수 있습니다.


```sql
brew install postgresql@15
```


> [!note]
>
> ❗ **pg_dump: error: server version 트러블슈팅**
>
> 간혹 pg_dump 클라이언트 버전(14.18)과 서버 버전(15.1)이 맞지 않아 오류가 발생할 수 있습니다.
>
>
> Supabase의 현재 버전은 PostgreSQL 15를 기반으로 하고 있으므로, **`postgresql@15`**을 명시적으로 설치하는 것이 버전 호환 측면에서 안전합니다.


설치가 완료되면 다음 명령어로 CLI 도구들이 설치되었는지 확인할 수 있습니다.


```sql
pg_dump --version
pg_restore --version
psql --version
```


## 2. Supabase 새 프로젝트 생성하기


API 서버는 현재 미국 오리건에 위치해 있었고, Supabase에서 선택할 수 있는 미국 리전은 크게 세 가지였습니다.

1. 캘리포니아 (us-west-1)
2. 버지니아 (us-east-1)
3. 오하이오 (us-east-2)

따라서, 오리건(API 서버)과 가장 가까이에 위치한 캘리포니아 리전을 선택하여 DB 서버와의 물리적 거리와 네트워크 지연을 최소화했습니다.


![image.png](/posts/attachments/API-%EC%84%9C%EB%B2%84%EC%99%80-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4-%EA%B0%84-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC-%EC%A7%80%EC%97%B0-%EB%AC%B8%EC%A0%9C-%ED%95%B4%EA%B2%B0%EA%B8%B0-ft-Supabase-%EB%A6%AC%EC%A0%84-%EB%B3%80%EA%B2%BD/img-04.png)


## 3. pg_dump로 기존 프로젝트(DB) 백업 받기


먼저 Supabase에서 제공하는 DB 정보를 바탕으로 `.backup` 파일을 생성합니다.


백업 파일은 로컬에 `backup_name.backup`으로 저장됩니다.


```bash
PGPASSWORD={OLD_
DB_PASSWORD
} pg_dump \
  -U postgres.{OLD_
PROJECT_REF
} \
  -h {OLD_
PROJECT_REGION
}.pooler.supabase.com \
  -p 5432 \
  -F c \
  -d postgres \
  -f ./backup_name.backup
```

- `{OLD_DB_PASSWORD}`: 기존 Supabase 프로젝트의 DB 비밀번호
- `{OLD_PROJECT_REF}`: Supabase 대시보드 상단 URL에 보이는 프로젝트 식별자 (예: `abcdefghijklmn`)
- `{OLD_PROJECT_REGION}`: 기존 Supabase 프로젝트의 리전 (예: `aws-0-ap-northeast-2`)

## 4. pg_restore로 새 프로젝트(DB)에 복원하기


이제 새로운 Supabase 프로젝트에 해당 백업 파일을 복원합니다.


```bash
PGPASSWORD={NEW_DB_PASSWORD} pg_restore \
  -U postgres.{NEW_PROJECT_REF} \
  -h {NEW_PROJECT_REGION}.pooler.supabase.com \
  -p 6543 \
  -d postgres \
  ./backup_name.backup
```

- `{NEW_DB_PASSWORD}`: 새로 만든 Supabase 프로젝트의 DB 비밀번호
- `{NEW_PROJECT_REF}`: Supabase 대시보드 상단 URL에 보이는 새 프로젝트 식별자 (예: `abcdefghijklmn`)
- `{NEW_PROJECT_REGION}`: 새 Supabase 프로젝트의 리전 (예: `aws-0-us-west-1`)

> [!note]
>
> ❗ 
>
> ### **⚠️ 복원 중 오류 메시지가 떴다면?**
>
>
> 실제로 복원 과정에서 아래와 같은 경고 메시지를 받았습니다:
>
>
> ```sql
> pg_restore: 경고: 복원작업에서의 오류들이 무시되었음: 369
> ```
>
>
> 이 메시지는 복원 도중 일부 객체(예: 이미 존재하는 테이블, 누락된 역할, 제약 조건 등)가 복원되지 못했지만 전체 과정은 강제로 진행되었다는 뜻입니다.
>
>
> 하지만 실제로는 테이블 구조, 기존 데이터, 주요 쿼리 실행 모두 정상적으로 작동했기 때문에 **심각한 오류는 아니었습니다.**


# 결과


기존 평균 응답 시간은 **약 650ms**였으나, API 서버와 DB 서버를 같은 미국 리전에 배치한 후에는 **평균 124ms로 약 81% 개선**되었습니다.


![image.png](/posts/attachments/API-%EC%84%9C%EB%B2%84%EC%99%80-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4-%EA%B0%84-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC-%EC%A7%80%EC%97%B0-%EB%AC%B8%EC%A0%9C-%ED%95%B4%EA%B2%B0%EA%B8%B0-ft-Supabase-%EB%A6%AC%EC%A0%84-%EB%B3%80%EA%B2%BD/img-05.png)


# 마무리하며


이 경험을 통해 얻은 교훈은 다음과 같았습니다.

1. 서버와 DB는 가급적 같은 리전에 둬야 한다.
2. Supabase는 리전 변경이 안되니 처음 생성할 때 위치를 신중하게 고르자.
3. 마이그레이션은 생각보다 어렵지 않지만, 사전에 백업 및 테스트는 필수다.

비용 제약(클라우드 프리 티어)을 고려하면서도 퍼포먼스를 챙기기 위해 구조를 고민한 좋은 사례였다고 생각합니다.


이 경험이 비슷한 상황에 놓인 분들에게 도움이 되기를 바랍니다 :)


# 참고 자료


[https://supabase.com/docs/guides/troubleshooting/change-project-region-eWJo5Z](https://supabase.com/docs/guides/troubleshooting/change-project-region-eWJo5Z)


[https://supabase.com/docs/guides/platform/migrating-within-supabase](https://supabase.com/docs/guides/platform/migrating-within-supabase)
