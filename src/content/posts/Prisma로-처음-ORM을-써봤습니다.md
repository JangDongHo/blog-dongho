---
title: "Prisma로 처음 ORM을 써봤습니다"
description: "안녕하세요, 장동호입니다!"
date: 2025-05-19
tags:
  - DB
---

안녕하세요, 장동호입니다!


이번 포스팅에서는 최근 GraphQL 과제를 수행하면서 처음으로 사용해 본 Prisma에 대해 정리해보려 합니다.


기존에는 주로 TypeORM을 사용해 왔지만, 이번에 Prisma를 선택하게 되면서 느낀 점과 경험을 공유하고자 합니다. 생소한 만큼 걱정도 있었지만, 실제로 사용해보니 생각보다 빠르게 적응할 수 있었고 생산성 면에서도 꽤 인상 깊은 경험이었습니다.


# **🌱 Prisma란?**


Prisma는 공식 홈페이지에서 이렇게 소개하고 있습니다.

> “Prisma는 TypeScript와 Node.js를 위한 차세대 ORM입니다.”

Prisma는 3가지 주요 컴포넌트를 제공합니다.

1. **Prisma Client**: 자동 생성되는 타입 안전한 쿼리 빌더
2. **Prisma Migrate**: 마이그레이션 도구
3. **Prisma Studio**: GUI 기반 데이터 편집 툴

# **👍🏻 Prisma의 강점**


## 1. 타입 안정성과 자동완성


Prisma의 가장 큰 강점은 **타입 안정성과 뛰어난 자동완성 지원**입니다.


TypeORM의 `QueryBuilder`는 타입 추론이 부족해, 오타나 잘못된 필드명을 컴파일 단계에서 잡아내지 못해 런타임에 에러가 발생하는 경우가 많았습니다.


**TypeORM**


```typescript
const user = await this.usersRepository
  .createQueryBuilder()
  .update(User)
  .set({ name: 'dongho' })
  .where("id = :id", { id: 2 })
  .execute()
```


만약 `.where()` 절 안에 아래 처럼 오타를 낸다면, 컴파일러는 이를 인식하지 못하고 아무런 오류도 발생시키지 않습니다. 이 경우, 런타임에서만 SQL 에러가 발생하게 되어 심각한 경우 **운영 환경에서 오류가 발생하고 이를 사전에 인지하지 못하는** 문제가 생길 수 있습니다.


```typescript
.where("idd = :id", { id: 2 }) // 'idd'는 실제 컬럼명이 아님
```


반면, Prisma는 쿼리를 TypeScript 객체 형태로 작성하고, Prisma 스키마 기반 타입이 강하게 지정되어 있어, 잘못된 필드명이 있으면 IDE나 컴파일러가 즉시 경고를 띄워줍니다.


**Prisma**


```typescript
const user = await prisma.user.update({
  data: {
    name: 'dongho',
  },
  where: {
    idd: 2, // 'idd'는 실제 컬럼명이 아님
  },
})
```


덕분에 Prisma는 타입 안정성 측면에서 훨씬 나은 개발자 경험(DX)을 제공합니다.


## 2. **간결하고 직관적인 모델 정의 및 사용**


### 1) 모델 정의


TypeORM은 클래스와 데코레이터 기반으로 모델을 정의하는 반면, Prisma는 스키마 파일 하나에서 선언적으로 모델을 관리합니다.


**TypeORM**


```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
```


**Prisma**


```typescript
model User {
  id    Int     @id @default(autoincrement())
  name  String
}
```


### 2) DB 연결 설정


TypeORM은 **각 엔티티마다 Repository를 별도로 주입받아야 하지만**, Prisma는 **하나의 클라이언트 인스턴스로 모든 모델에 바로 접근할 수 있습니다.**


**TypeORM**


```typescript
const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  username: 'user',
  ...
  entities: [User, Post, Comment],
});

const userRepo = AppDataSource.getRepository(User);
const postRepo = AppDataSource.getRepository(Post);
const commentRepo = AppDataSource.getRepository(Comment);
```


**Prisma**


```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const user = await prisma.user.findMany();
const post = await prisma.post.findMany();
const comment = await prisma.comment.findMany();
```


### 3) CRUD 작업 처리


**TypeORM**


TypeORM에는 `save()`, `remove()` 외에도 `insert()`, `update()`, `delete()` 같은 메서드가 여러 개 존재합니다. 그런데 이 각각의 메서드가 동작 방식과 사용 용도가 조금씩 달라서 헷갈리기 쉽습니다.


![image.png](/posts/attachments/Prisma%EB%A1%9C-%EC%B2%98%EC%9D%8C-ORM%EC%9D%84-%EC%8D%A8%EB%B4%A4%EC%8A%B5%EB%8B%88%EB%8B%A4/img-01.png)


특히 `save()`와 `remove()` 메소드는 내부에서 여러 작업을 처리하기 때문에, 동작 방식을 제대로 모르면 의도치 않은 데이터 변경이나 삭제가 발생할 수 있어 주의가 필요했습니다. 예를 들어, `save()`는 새 엔티티 삽입과 기존 엔티티 업데이트를 모두 처리하는데, 이 과정에서 연관된 엔티티까지 함께 변경될 수 있어 복잡했습니다. `remove()` 메소드는 실제로 엔티티를 데이터베이스에서 삭제하는 역할을 하지만, 단순히 ID만 가지고 삭제할 수 없고 삭제할 엔티티 객체를 먼저 조회하거나 전달해야 해서 번거로웠습니다.


**Prisma**


반면 Prisma는 각 작업에 대응되는 메서드가 명확하고, 직관적인 네이밍과 타입 안정성을 통해 개발자가 헷갈리지 않도록 잘 설계했다는 느낌을 받았습니다. 예를 들어, `create()`, `update()`, `delete()`가 각각 역할에 딱 맞게 분리되어 있어 자연스럽게 어떤 기능인지 바로 이해할 수 있습니다.


또한 Prisma 공식 문서는 TypeORM 공식 문서와 다르게 각 메서드별 사용법과 옵션을 아주 친절하게 예제와 함께 설명해줘서, 처음 사용하는 사람도 쉽게 이해하고 빠르게 적용할 수 있었습니다.


# **👎🏻 Prisma를 사용하면서 생소했던 부분**


## 1. 데이터 유효성 검증 방식


TypeORM에서는 주로 `class-validator` 같은 라이브러리를 사용해 엔티티에 데코레이터를 붙여 손쉽게 데이터 유효성 검증을 처리할 수 있었지만, Prisma는 검증을 어떻게 해야 할지 감이 잘 오지 않았습니다.


조사를 해보니 Prisma는 보통 `Zod.js` 라이브러리를 사용하여 데이터 유효성 검사를 수행한다고 한다. 이 부분은 추후에 직접 경험하면서 더 자세히 알아보고 적용해볼 계획입니다.


## 2. 변경 사항 반영 방식


TypeORM은 엔티티 코드를 수정하고 서버를 재시작하면 바로 변경 사항이 반영되어 개발하는 동안 빠르게 확인할 수 있었습니다. 그래서 작은 수정도 바로바로 테스트해볼 수 있어 편리했습니다.


반면, Prisma는 스키마 파일을 수정한 뒤 반드시 `prisma generate` 명령어를 실행해 Prisma Client를 다시 생성해야 변경 사항이 코드에 반영됩니다. 이 과정이 자동화되어 있지 않다 보니 처음에는 약간 번거롭고 익숙하지 않게 느껴졌습니다.


## 3. 관계 쿼리 방식


Prisma에서는 관계가 맺어진 데이터를 함께 조회할 때 `include`나 `select` 옵션을 사용합니다. 예를 들어, 특정 사용자의 게시글 목록을 함께 가져오고 싶다면 다음과 같은 코드를 작성해야 합니다.


**Prisma**


```typescript
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      select: {
        title: true,  // 게시글 제목만 가져옴
      },
    },
  },
});
```


**TypeORM**


```typescript
const user = await userRepository.findOne({
  where: { id: 1 },
  relations: ['posts'], // 기본 relations 옵션만으로는 범위 제어가 어려워 QueryBuilder를 사용해야 함
});
```


이 구조는 Prisma를 처음 접하는 입장에서는 다소 낯설게 느껴졌습니다. TypeORM에서는 `relations` 배열에 관계명을 넣기만 해도 자동으로 join이 이루어졌지만, Prisma는 `include`나 `select` 옵션을 사용해 가져올 데이터를 명시적으로 지정해야 합니다. 덕분에 조회 범위를 명확히 제어할 수 있다는 장점이 있지만, 관계가 많아질수록 `include` 옵션이 중첩되며 코드가 복잡해지고, 실수할 가능성도 높아질 수 있다는 점은 주의가 필요하다고 느꼈습니다.


# **✍️** 마무리하며


Prisma는 분명히 매력적인 ORM입니다. 명확하게 분리된 메서드 구조와 타입 안정성 덕분에 코드의 의도를 보다 명확하게 드러낼 수 있었고, 초보 개발자도 실수할 여지를 줄여주는 점에서 큰 장점이 있다고 느꼈습니다. 공식 문서 또한 친절하게 잘 정리되어 있어, 필요한 정보를 찾는 데 어려움이 없었습니다.


하지만 TypeORM에 익숙한 입장에서 Prisma를 처음 사용할 때는 다소 낯선 점들도 분명 있었습니다. 스키마 파일을 수동으로 generate 해야 하는 구조, 데이터 유효성 검증 방식의 차이, include/select 방식의 관계 쿼리 등은 처음에는 조금 헷갈릴 수 있겠다는 생각이 들었습니다. 특히 관계가 깊어질수록 쿼리가 복잡해지는 구조는 주의해서 사용해야 할 것 같습니다.


개인적으로는 Prisma와 TypeORM 모두 장단점이 뚜렷하다고 느꼈고, 각각의 프로젝트 성격이나 팀의 개발 문화에 따라 선택이 달라질 수 있겠다는 생각이 들었습니다. 이번 경험을 통해 ORM에 대해 더 깊이 있게 이해할 수 있었고, 앞으로 실무에서 어떤 ORM을 사용하게 되더라도 더 빠르게 적응할 수 있는 기반이 될 것 같습니다.


앞으로도 Prisma를 더 다양한 프로젝트에 적용해보면서, 궁금했던 부분이나 부족했던 부분들을 하나씩 채워가고 싶습니다. 이 글이 저처럼 TypeORM을 사용하다가 Prisma에 입문하시는 분들께 작은 도움이 되었으면 좋겠습니다.


읽어주셔서 감사합니다! 🙇‍♂️


# 참고 자료


[https://octoping.tistory.com/37](https://octoping.tistory.com/37)


[https://fomaios.tistory.com/entry/Nodejs-Prisma%EB%9E%80-feat-%EC%82%AC%EC%9A%A9%ED%95%B4%EC%95%BC-%EB%90%98%EB%8A%94-%EC%9D%B4%EC%9C%A0](https://fomaios.tistory.com/entry/Nodejs-Prisma%EB%9E%80-feat-%EC%82%AC%EC%9A%A9%ED%95%B4%EC%95%BC-%EB%90%98%EB%8A%94-%EC%9D%B4%EC%9C%A0)


[https://fomaios.tistory.com/entry/Nodejs-TypeORM%EC%9D%B4%EB%9E%80-feat-Typescript-ORM-Library](https://fomaios.tistory.com/entry/Nodejs-TypeORM%EC%9D%B4%EB%9E%80-feat-Typescript-ORM-Library)


[https://octoping.tistory.com/40](https://octoping.tistory.com/40)
