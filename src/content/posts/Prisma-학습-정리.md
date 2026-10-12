---
title: "Prisma 학습 정리"
description: "Prisma는 최근 Node.js 생태계에서 가장 선호되는 ORM 중 하나이다. 기존 ORM들이 “코드로 테이블을 묘사”하려 했다면, Prisma는 스키마 파일 하나로 DB와 코드를 동시에 제어한다는 철학을 가지고 있다."
date: 2026-01-18
---

- Prisma는 최근 Node.js 생태계에서 가장 선호되는 ORM 중 하나이다.
- 기존 ORM들이 “코드로 테이블을 묘사”하려 했다면, Prisma는 **스키마 파일 하나로 DB와 코드를 동시에 제어**한다는 철학을 가지고 있다.

## 1️⃣ Prisma의 심장: `schema.prisma`

- Prisma 학습의 시작과 끝은 스키마 파일이다. 여기서 세 가지를 정의한다.
    1. **DataSource**: 어떤 DB를 쓰는지 (MySQL, PostgreSQL 등)
    2. **Generator**: 어떤 클라이언트를 만들 것인지 (보통 `prisma-client-js`)
    3. **Data Models**: 실제 테이블 구조와 관계

```typescript
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client"
  output   = "./generated"
}

model User {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  published Boolean  @default(false)
  title     String   @db.VarChar(255)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}

enum Role {
  USER
  ADMIN
}
```


## 2️⃣ 핵심 명령어와 동작 방식

- Prisma의 작업 흐름은 **스키마 수정 → DB 반영(Migrate) → 코드 생성(Generate)** 순서로 이루어진다.

### 1. `npx prisma migrate dev` (DB와 동기화)

- 스키마 파일의 변경 사항을 실제 데이터베이스에 반영하는 과정이다.
- 내가 바꾼 스키마를 DB에 물리적으로 적용하는 명령어라고 이해하면 된다.
- **역할**: 스키마 파일을 분석해 SQL문(Migration file)을 생성하고, 이를 DB에 실행한다.
- **결과**: DB 테이블 구조가 바뀌고, 프로젝트 내 `prisma/migrations` 폴더에 어떤 변경이 있었는지 기록(히스토리)이 남는다.

### 2. `npx prisma generate` (코드로 변환)

- Prisma의 가장 강력한 기능으로, 스키마를 바탕으로 **TypeScript 전용 클라이언트 코드**를 만든다.
- DB 구조를 내 코드(VS Code)가 인식할 수 있게 타입을 만들어내는 작업이다. 이 덕분에 오타를 내면 코드 실행 전 에러를 잡아준다.
- **역할**: `node_modules/.prisma/client` 위치에 나만을 위한 맞춤형 라이브러리를 생성한다.
- **결과**: 내가 만든 `User`, `Post` 모델에 대한 타입 정의와 메서드가 자동으로 만들어진다.

## 3️⃣ Prisma의 내부 동작 원리 (Query Enigne)

- Prisma는 다른 ORM과 달리 내부적으로 **Rust로 작성된 Query Engine**을 사용한다.
    1. **Binary 방식**: Node.js 위에서 단순히 코드가 도는게 아니라, 아주 빠른 고성능 엔진(Binary)이 백그라운드에서 SQL을 생성하고 실행한다.
    2. **흐름**: 개발자가 `prisma.user.findMany()` 호출
        - Prisma Client가 이 요청을 **Query Engine**으로 전달
        - Query Engine이 최적화된 SQL을 생성하여 DB에 질의
        - DB 결과를 다시 JavaScript 객체로 변환하여 반환

## 4️⃣ 왜 Prisma를 쓰나요?

- **강력한 자동 완성**: User 모델에 없는 필드를 조회하려고 하면 코딩 중에 바로 빨간 줄이 뜬다. 이로써 휴먼 에러를 원천 봉쇄한다.
- **직관적인 관계 조회**: Join 같은 복잡한 개념 대신 `include: { posts: true }` 같은 방식으로 연관 데이터를 아주 쉽게 가져올 수 있다.
- **DB 시각화**: npx prisma studio를 입력하면 웹 브라우저에서 DB 데이터를 GUI로 바로 확인하고 수정할 수 있는 관리 도구를 제공한다.

## 5️⃣ `migrate dev` vs `migrate deploy`


| **구분**        | **migrate dev (개발용)**           | **migrate deploy (운영용)**     |
| ------------- | ------------------------------- | ---------------------------- |
| **주요 목적**     | 스키마 변경 사항 반영 + **마이그레이션 파일 생성** | 생성된 마이그레이션 파일을 **DB에 적용만 함** |
| **대상 환경**     | 로컬 개발 환경                        | 스테이징, 프로덕션(실제 서비스) 환경        |
| **Shadow DB** | **사용함** (변경 사항 검증용 임시 DB)       | 사용하지 않음                      |
| **데이터 유지**    | 상황에 따라 **DB 초기화(Reset) 가능성 있음** | **절대 초기화하지 않음** (데이터 보존)     |
| **자동 실행**     | `prisma generate`가 자동으로 실행됨     | `prisma generate`를 실행하지 않음   |


### 1. `npx prisma migrate dev`: 설계도를 그리고 실험하기

- 개발 중에는 스키마를 수시로 바꾼다. 이때 사용하는 이 명령어는 단순히 DB를 바꾸는 것 이상의 일을 한다.
    - **마이그레이션 파일 생성**: `prisma/migrations` 폴더 안에 SQL 파일을 자동으로 만들어 기록을 남긴다.
    - **Shadow Database 활용**: Prisma는 보이지 않는 곳에 임시 DB(Shadow DB)를 하나 더 만들어, 내가 바꾼 스키마가 기존 기록들과 충돌하지 않는지 미리 계산해 본다.
    - **DB Reset 경고**: 만약 스키마가 꼬여서 정상적인 업데이트가 불가능하면 모든 데이터를 다시 만들까요? 라고 물어본다. 개발 중엔 편하지만, 운영 중에 이런 일이 생기면 재앙이다!
    - **클라이언트 갱신**: 성공하면 즉시 `prisma generate`를 실행해 최신 타입 정보를 내 코드에 반영한다.

### 2. `npx prisma migrate deploy`: 검증된 설계도만 실행하기

- 실제 서비스 중인 서버에 배포할 때는 절대 새로운 마이그레이션 파일을 만들거나 DB를 초기화해서는 안 된다.
    - **단순 실행**: 이미 개발 단계(migrate dev)에서 만들어져서 Git에 올라온 SQL 파일들만 순서대로 읽어서 DB에 반영한다.
    - **안전 제일**: Shadow DB를 만들지 않으며, 만약 DB 구조와 마이그레이션 파일이 충돌하면 에러를 내고 멈춘다. **데이터를 지울 시도조차 하지 않기 때문에 안전하다.**
    - **CI/CD 최적화**: 서버 배포 자동화 공정(CI/CD)에서 DB 구조를 업데이트할 때 이 명령어를 사용한다.

### 권장되는 전체 작업 흐름 (Workflow)

1. 로컬: `schema.prisma` 수정
2. 로컬: `npx prisma migrate dev —name add_user_age` 실행 (SQL 파일 생성 및 로컬 DB 반영)
3. 코드 리뷰: 생성된 SQL 파일과 코드를 Git에 `push`
4. 배포 스크립트에서 `npx prisma migrate deploy` 실행 (서버 DB에 SQL 반영)

## 6️⃣ Github Actions 워크플로우 예시


```typescript
name: Prisma CI Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test-migration:
    runs-on: ubuntu-latest

    # 1. DB 서비스를 Docker 컨테이너로 띄웁니다.
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        # DB가 준비될 때까지 기다리는 헬스체크
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      # 2. 환경 변수 설정 (서비스 컨테이너로 연결)
      - name: Run Prisma Validate & Migrate
        env:
          # 서비스 컨테이너의 포트와 정보를 설정합니다.
          DATABASE_URL: postgresql://user:password@localhost:5432/test_db
        run: |
          # 스키마 파일 문법 체크
          npx prisma validate
          
          # 마이그레이션 파일들이 에러 없이 실행되는지 확인
          npx prisma migrate deploy
          
          # 클라이언트 생성이 잘 되는지도 확인
          npx prisma generate
```

- `servcies` (Docker 컨테이너)
    - Github Actions는 테스트를 위해 깨끗한 DB를 즉석에서 만들어주는 기능을 제공한다/
    - **역할**: 로컬에서 `npx prisma migrate dev`를 하듯, CI용 가상 DB를 생성한다.
    - **목적**: 실제 DB와 동일한 환경에서 마이그레이션 SQL이 문법에 맞는지, 제약 조건(Unique, Foreign Key 등)이 꼬이지 않았는지 완벽하게 테스트할 수 있다.
- `npx prisma validate`
    - **역할**: schema.prisma 파일에 오타가 있거나, 모델 간 관계 설정이 논리적으로 틀렸을 경우 즉시 에러를 발생시킨다.
    - **목적**: DB 연결 없이도 수행되므로 가장 빠르게 오류를 잡아낼 수 있다.
- `npx prisma migrate deploy`
    - **역할**: Git에 올라온 `prisma/migrations` 폴더 안의 모든 SQL 파일을 순서대로 실행한다.
    - **목적**: 만약 개발자가 로컬에서 `migrate dev`를 실행해놓고 마이그레이션 SQL 파일을 Git에 커밋하지 않았다면, 여기서 “DB 구조와 스키마가 일치하지 않는다”는 에러가 발생하며 배포를 막아준다.

### 만약 마이그레이션 실패한다면?

- 이 CI가 실패하면 Github Pull Request 화면에 빨간색 `X` 표시가 뜬다. 이때 확인해야 할 체크리스트는 다음과 같다.
    1. **누락된 파일:** `prisma/migrations` 폴더 안에 새로운 폴더와 `migration.sql`이 포함되어 있는지 확인한다.
    2. **스키마 불일치**: `schema.prisma` 내용과 마이그레이션 SQL 파일의 내용이 서로 다른 경우이다.
    3. **충돌(Conflict)**: 동료가 먼저 올린 마이그레이션 파일과 내 마이그레이션 파일이 동일한 순서(타임스탬프)를 가지고 있거나 구조가 충돌하는 경우이다.

### 추가 팁: **`prisma migrate diff`**

- 최근 실무에서는 스키마 드리프트(Schema Drift)를 방지하기 위해 아래 명령어를 CI에 추가하기도 한다.

    ```bash
    npx prisma migrate diff --from-schema ... --to-db ...
    ```

- 이는 현재 내 코드 상의 스키마와 실제 DB의 구조 사이에 차이점이 있는지 직접 비교해주는 아주 강력한 도구이다.

## 7️⃣ 마이그레이션 롤백 전략

- Prisma는 공식적으로 `migrate rollback` 같은 “되돌리기” 명령어를 지원하지 않는다.
- 이는 Prisma가 “**전진형 마이그레이션(Forward-only migrations)**” 철학을 따르기 때문이다.
- 즉, “뒤로 돌아가기보다는 문제를 해결한 새 마이그레이션을 앞으로 쌓는 것”이 데이터 안정성에 더 낫다고 판단한 것이다.

### 전략 1: 롤-포워드(Roll-forward, 권장)

- 문제가 생긴 부분을 수정한 뒤, 새로운 마이그레이션 파일을 만들어 배포하는 방식이다.
- **과정:**
    1. 로컬에서 `schema.prisma`의 오류를 수정한다.
    2. `npx prisma migrate dev —name fix_error`를 통해 수정된 마이그레이션 파일을 생성한다.
    3. 운영 서버에 이 새로운 파일을 포함해 다시 `npx prisma migrate deploy`를 실행한다.
- **언제 쓰나**: 데이터가 파괴되지 않았고, 단순히 스키마 구조의 오류인 경우

### 전략 2: 수동 롤백 & `migrate resolve` (실패 시 복구)

- 마이그레이션이 실행되다가 중간에 멈춰서 DB가 “실패 상태(Failed)”로 남았을 때 사용한다.
- **과정**:
    1. **수동 SQL 실행**: DB 관리 도구에 접속하여 에러가 난 SQL의 반대 작업을 직접 실행한다. (예: 생성되다 만 컬럼 삭제)
    2. 상태 해결: Prisma는 실패한 기록을 DB 내 `_prisma_migrations` 테이블에 남긴다. 이를 “해결됨” 처리해줘야 다음 배포가 가능하다.

    ```bash
    # 특정 마이그레이션을 롤백한 것으로 표시
    npx prisma migrate resolve --rolled-back "20231027_init"
    ```

- **언제 쓰나**: 마이그레이션이 절반만 성공해서 DB가 꼬였을 때.

![image.png](/posts/attachments/Prisma-%ED%95%99%EC%8A%B5-%EC%A0%95%EB%A6%AC/img-01.png)


### 전략 3: DB 백업 복구 (최후의 수단)

- 데이터가 대량으로 유실되거나 제어 불가능한 수준으로 꼬였다면 백업본으로 복구해야 한다.
- **주의**: 이 과정은 서비스 중단을 동반할 수 있으므로 매우 신중해야 한다.

### 왜 Prisma는 롤백 명령어가 없을까?

- 전통적인 ORM(Sequelize 등)은 `down` 메서드를 통해 롤백을 지원했지만, 다음과 같은 위험이 있었다.
    - **데이터 유실**: down 과정에서 실수로 컬럼을 지우면 그 안의 데이터는 영구히 사라진다.
    - **불확실성**: 롤백용 SQL이 항상 완벽하게 반대 동작을 보장하지 않는다.
- Prisma는 차라리 **실패한 지점을 명확히 확인하고, 수동으로 고친 뒤 다시 전진하라**는 명확한 가이드를 주는 방식을 택한 것이다.

### 운영 배포 사고를 막는 3가지 실무 팁

- 신입 개발자가 롤백 상황 자체를 막지 않기 위해 꼭 지켜야 할 습관이다.
1. **`_prisma_migrations`** **테이블 이해하기**: DB에 이 이름의 테이블이 자동으로 생긴다. 여기에 어떤 마이그레이션이 성공/실패했는지 기록되니, 문제가 생기면 이 테이블을 먼저 조회해 봐라.
2. **데이터가 있는 컬럼 수정 주의**: `Required`가 아닌 컬럼을 `Required`로 바꿀 때, 기존 데이터에 `null`이 있으면 마이그레이션은 100% 실패한다. 미리 기본값(`default`)을 주거나 데이터를 정리해야 한다.
3. **스테이징 환경 테스트**: 운영 DB와 똑같은 복사본 DB(스테이징)에서 먼저 `migrate deploy`를 실행해보고 성공하면 운영에 적용한다.

> [!note]
> **핵심 요약**
>
> - Prisma는 자동 롤백 명령어가 없다.
> - 실패 시 **수동으로 SQL 복구** 후 `npx prisma migrate resolve --rolled-back [명칭]`을 실행해 상태를 맞춘다.
> - 가장 좋은 방법은 문제를 해결한 **새 마이그레이션을 배포(Roll-forward)** 하는 것이다.


## 참고 자료

- [https://velog.io/@wndbsgkr/Prisma에서-Down-Migration을-생성해보자](https://velog.io/@wndbsgkr/Prisma%EC%97%90%EC%84%9C-Down-Migration%EC%9D%84-%EC%83%9D%EC%84%B1%ED%95%B4%EB%B3%B4%EC%9E%90)
