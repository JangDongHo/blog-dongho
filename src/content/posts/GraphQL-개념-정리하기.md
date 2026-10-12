---
title: "GraphQL 개념 정리하기"
description: "안녕하세요, 장동호입니다!"
date: 2025-05-20
---

안녕하세요, 장동호입니다!


이번 포스팅에서는 백엔드 개발을 공부하거나 프로젝트를 진행하면서 한 번쯤은 고민하게 되는 두 가지 API 방식, **REST**와 **GraphQL**의 차이점에 대해 정리해보려고 합니다.


# 🌱 GraphQL 이란?

> **“클라이언트가 원하는 데이터만 정확하게 요청하고 받을 수 있는 쿼리 언어이자 런타임입니다.”**

GraphQL은 Facebook이 개발한 **API를 위한 쿼리 언어(Query Language)**로, REST API의 한계를 해결하고자 등장했습니다. REST처럼 다양한 엔드포인트를 만들 필요 없이, 하나의 엔드포인트에서 원하는 데이터를 구조화하여 요청할 수 있습니다.


그렇다면 GraphQL을 왜 쿼리 언어라고 부를까요? GraphQL은 이름 그대로, **클라이언트가 서버에 데이터를 요청할 때 사용하는 쿼리 문법**을 가지고 있습니다. 이 쿼리는 마치 SQL과 비슷한 구조를 가지고 있으며, 어떤 데이터를 원하는지 명시적으로 표현할 수 있습니다. 다만, 쓰이는 방식의 차이만 있을 뿐입니다. **SQL**이 **데이터베이스 시스템**에 저장된 데이터를 효율적으로 가져오는 것이 목적이라면, **GraphQL**은 **웹 클라이언트**가 데이터를 서버로 부터 효율적으로 가져오는 것이 목적입니다. SQL의 문장은 주로 백엔드 시스템에서 작성하고 호출 하는 반면, GraphQL의 문장은 주로 클라이언트 시스템에서 작성하고 호출 합니다.


```sql
SELECT name, email FROM user WHERE id = 1;
```


```sql
{
  user(id: 1) {
    name
    email
  }
}
```


# 📦 REST API와 비교


REST API는 URL, METHOD등을 조합하기 때문에 다양한 Endpoint가 존재 합니다. 반면, **GraphQL은 단 하나의 Endpoint**가 존재 합니다. 또한, GrapQL API에서는 **불러오는 데이터의 종류를 쿼리 조합을 통해서 결정** 합니다. 예를 들어, REST API에서는 각 Endpoint마다 데이터베이스 SQL 쿼리가 달라지는 반면, GrapQL API는 GraphQL 스키마의 타입마다 데이터베이스 SQL 쿼리가 달라집니다.


![이미지 출처: https://tech.kakao.com/posts/364](/posts/attachments/GraphQL-%EA%B0%9C%EB%85%90-%EC%A0%95%EB%A6%AC%ED%95%98%EA%B8%B0/img-01.png)


GraphQL을 설명할 때 자주 나오는 비유 중 하나가 바로 **트리 구조를 탐색하는 방식**입니다. 이를 이해하면 GraphQL이 어떻게 데이터를 효율적으로 가져오는지 감이 잡힙니다.


예를 들어, 유저 정보와 유저가 작성한 글 목록을 한 번에 받아온다고 가정해 봅시다. 이때 유저 정보는 트리 구조의 루트 노트가 되고, 이름, 전화번호 같은 기본 정보는 그 밑에 붙은 가지들, 유저가 쓴 글 목록은 또 다른 하위 가지로 생각할 수 있습니다. 글 목록 안에는 각각의 글 제목과 내용이 자식 노드처럼 존재합니다.


```plain text
user (루트)
 ├─ name
 ├─ phone
 └─ posts
     ├─ title
     └─ content
```


기존 REST API는 각 엔드포인트가 하나의 리소스(예: 유저 정보, 글 목록)를 담당하기 때문에, 클라이언트는 먼저 유저 정보 API를 호출하고, 다시 글 목록 API를 별도로 호출해야 합니다. 즉, 트리 구조를 한꺼번에 훑는 것이 아니라, 여러 번에 걸쳐 가지 하나씩 따로 요청하는 셈입니다.


반면에 GraphQL은 **깊이 우선 탐색(DFS, Depth-First Search)** 방식과 비슷한 개념으로 데이터를 한 번에 요청하고 응답받을 수 있습니다. 클라이언트가 필요한 데이터 구조를 쿼리로 작성하면, 서버는 루트부터 시작해 하위 노드로 쭉 내려가면서 필요한 데이터만 추출해 한 번의 요청으로 응답을 줍니다. 즉, 유저의 이름, 전화번호 같은 기본 정보부터 시작해서 그 유저가 작성한 글 제목과 내용까지 한꺼번에 가져올 수 있다는 뜻입니다.


# 🌲 GraphQL의 구조


## **쿼리(Query)와 뮤테이션(Mutation)**


GraphQL에서 **쿼리(Query)**는 데이터를 조회할 때 사용합니다. REST API의 GET 요청과 비슷하다고 생각하면 편합니다. 클라이언트가 필요한 데이터의 구조를 쿼리로 작성해서 서버에 요청하면, 서버는 해당 데이터를 응답으로 보내줍니다.


반면에 **뮤테이션(Mutation)**은 데이터를 변경할 때 사용합니다. 즉, 생성, 수정, 삭제 작업 모두 뮤테이션으로 처리합니다. REST API의 POST, PUT, DELETE 요청과 대응되는 개념이다.


예를 들어, 친구 목록을 조회하는 쿼리와, 친구 정보를 업데이트하는 뮤테이션은 각각 다음과 같이 작성할 수 있습니다.


```graphql
# 쿼리 예시
query {
  friend(id: 1) {
    name
    phone
  }
}

# 뮤테이션 예시
mutation {
  updateFriend(id: 1, phone: "010-1234-5678") {
    success
    message
  }
}
```


## **스키마(Schema)와 타입(Type)**


GraphQL의 가장 핵심은 **스키마(Schema)**입니다. 스키마는 API가 제공하는 데이터의 구조와 타입을 정의한 청사진(설계도)라고 할 수 있습니다. 스키마를 통해 클라이언트는 어떤 쿼리를 요청할 수 있는지, 어떤 데이터 타입을 받을 수 있는지를 알 수 있습니다.


스키마 안에는 여러 **타입(Type)**이 정의되어 있습니다. 예를 들어 `Friend`라는 타입이 있다면, `name`은 문자열(String), `age`는 정수(Int) 타입으로 정의해 놓는 식입니다.


```graphql
type Friend {
  id: ID!
  name: String!
  age: Int
  posts: [Post]
}
```

- 오브젝트 타입: Friend
- 필드: id, name, age, posts
- 스칼라 타입: ID, String, Int 등
- 느낌표(!): 필수 값을 의미(non-nullable)
- 대괄호([ ]): 배열을 의미(array)

## **리졸버(Resolver)**


스키마에 정의된 타입과 필드마다 **리졸버(Resolver)**라는 함수가 붙어 있습니다. 리졸버는 클라이언트의 쿼리를 실제 데이터베이스나 다른 서비스에서 어떻게 가져올지 정의하는 부분입니다. 만약 필드가 스칼라 값(문자열이나 숫자와 같은 원시 타입)인 경우에는 실행이 종료됩니다.. 즉 더 이상의 연쇄적인 호출이 일어나지 않습니다. 하지만 필드의 타입이 스칼라 타입이 아닌 우리가 정의한 타입이라면 해당 타입의 리졸버를 호출하게 됩니다.


```typescript
type User {
  id: ID!
  name: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  user: User!
}
```


이해를 돕기 위해 User와 Post 사이의 1:N 관계를 기준으로, GraphQL에서 리졸버가 어떻게 연쇄적으로 호출되는지 살펴보겠습니다. GraphQL 타입 정의는 다음과 같이 만들 수 있습니다.


```typescript
query {
  user(id: 1) {
    name
    posts {
      title
      content
    }
  }
}
```


이제 id가 1인 유저의 이름과 그 유저가 작성한 게시물들의 제목과 내용을 가져오는 쿼리를 날립니다.


```typescript
const resolvers = {
  Query: {
    user: (parent, args, context, info) => {
	    console.log('1. user 리졸버 실행!');
      return database.findUserById(args.id);
    }
  },
  User: {
    posts: (user) => {
	    console.log('2. posts 리졸버 실행!');
      return database.findPostsByUserId(user.id);
    }
  }
};
```


클라이언트에서 쿼리를 요청하면, 가장 먼저 `Query` 객체의 `user` 리졸버가 실행됩니다. 이 리졸버는 데이터베이스에서 `id`가 1인 유저를 찾아 반환합니다. 주의할 점은 이 시점에서는 아직 `posts`에 대한 정보는 없습니다. 단지 User 객체 하나를 반환할 뿐입니다.


`Query.user` 리졸버가 반환한 유저 객체에는 `posts` 필드가 있습니다. GraphQL은 이 필드를 채우기 위해 `User` 타입의 `posts` 리졸버를 자동으로 호출합니다. 이때의 parent는 바로 앞서 반환된 유저 객체입니다. 즉, `parent.id === 1`이 됩니다. 이후 `userId`가 1인 게시글을 모두 찾아 반환하게 됩니다.


이처럼 리졸버는 **“필드 단위로 실행”** 되기 때문에, 연쇄적으로 호출되며 데이터를 채워나가는 구조입니다.


> [!note]
> 💡 **리졸버 함수는 다음과 같이 총 4개의 인자를 받습니다.**


![GraphQL 파이프라인](/posts/attachments/GraphQL-%EA%B0%9C%EB%85%90-%EC%A0%95%EB%A6%AC%ED%95%98%EA%B8%B0/img-02.png)


# ✏️ 마무리하며


GraphQL을 처음 접했을 때 하나의 API로 클라이언트가 원하는 데이터를 자유롭게 선택해서 가져올 수 있다는 점이 매력적이었습니다. 그런데 리졸버가 어떻게 작동하는지 잘 모르면, 오히려 불필요한 데이터까지 불러오면서 성능을 저하시킬 수도 있다는 걸 알게 됐습니다.


특히 리졸버가 각 필드별로 독립적으로 실행되다 보니, 같은 데이터를 여러 번 호출하는 N+1 문제가 발생하기 쉽습니다. 그래서 리졸버의 흐름과 부모-자식 관계를 이해하고, 효율적으로 데이터를 가져오는 방법을 고민하는 게 중요하다고 생각했습니다.


# 참고 자료


[https://hahahoho5915.tistory.com/63](https://hahahoho5915.tistory.com/63)


[https://tech.kakao.com/posts/364](https://tech.kakao.com/posts/364)


[https://www.partner.bold-9.com/team/backend/6](https://www.partner.bold-9.com/team/backend/6)
