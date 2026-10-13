---
title: "조회수 API의 DB 병목을 Redis로 해결하기"
description: "boostus는 부스트캠프 수료생들의 블로그 글을 한 곳에서 모아볼 수 있는 아카이빙 서비스다."
date: 2026-04-13
tags:
  - DB
---

## 배경


---


boostus는 부스트캠프 수료생들의 블로그 글을 한 곳에서 모아볼 수 있는 아카이빙 서비스다.


메인 피드에서 글을 클릭할 때마다 조회수가 올라가는 구조였는데, 초기에는 가장 단순한 방식으로 구현했다.


```sql
UPDATE posts SET view_count = view_count + 1 WHERE id = ?
```


요청이 들어올 때마다 DB에 직접 `UPDATE`를 쿼리를 날리는 방식이다. 


로컬에서 테스트할 때도 잘 됐고, 팀원들끼리 쓸 때도 느리다는 느낌이 없었다.


그런데 “실제로 사람이 몰리면 어떻게 되지?” 라는 생각이 들었다. 


부스트캠프 신청 날에 예비 지원자들이 한꺼번에 메인 피드를 열면 트래픽이 순간적으로 튈 수 있지 않을까?


## 가설 검증


---


막연한 걱정을 확인하고 싶어서 로컬에서 k6로 부하 테스트를 돌려봤다.


1,000명이 동시에 조회수 증가 API를 호출하는 시나리오였다.


결과가 생각보다 심각했다.


| 지표        | 결과        |
| --------- | --------- |
| 평균 응답 시간  | 2.51초     |
| p95 응답 시간 | 3.80초     |
| 처리량 (RPS) | 251 req/s |


p95가 3.8초라는 게 처음엔 감이 잘 안 왔다.


찾아보니 “상위 5%의 요청이 3.8초 이상 걸렸다”는 의미였다. 100명 중 5명은 API 요청 응답을 받는 데 4초 가까이 걸린다는 거다.


실제 서비스였다면 정말 끔찍한 숫자가 아닐 수 없다.


## 문제 원인


---


처음엔 인덱스 문제인가 싶었다. 그런데 `WHERE id = ?` 로 PK를 직접 찍는 쿼리에 인덱스 문제가 생길 리 없었다. 왜냐하면 기본적으로 RDBMS는 PK에 대해 자동으로 인덱스를 생성하고, 해당 쿼리는 항상 인덱스를 타는 $O(log N)$ 수준의 빠른 조회가 보장되기 때문이다.


좀 더 찾아보니 MySQL의 UPDATE는 **row-level lock**을 건다는 걸 알게 됐다. 동시에 1,000개의 요청이 같은 row에 `UPDATE`를 시도하면, 한 번에 하나씩 lock을 잡고 순서대로 처리해야 한다. 나머지 요청들은 lock이 풀릴 때까지 대기하고, 그게 쌓이면서 응답 시간이 늘어나는 거였다.


![image.png](/posts/attachments/%EC%A1%B0%ED%9A%8C%EC%88%98-API%EC%9D%98-DB-%EB%B3%91%EB%AA%A9%EC%9D%84-Redis%EB%A1%9C-%ED%95%B4%EA%B2%B0%ED%95%98%EA%B8%B0/img-01.png)


## 문제 해결


---


처음엔 DB 레벨에서 뭔가 할 수 있을 것 같아서 찾아봤는데, 결국 “요청마다 DB를 건드린다”는 구조를 바꾸지 않는 한 근본적인 해결이 안 된다는 걸 깨달았다.


그래서 어떤 방식으로 문제를 해결할지 고민하다가 요청마다 DB에 접근해서 조회수 증가를 시키는게 아니라, **메모리 기반 저장소에 조회수를 먼저 누적한 뒤 일정 주기로 DB에 반영하는 방식으로 구조를 변경하기로 했다.**


### 후보 1. 인메모리


처음에는 애플리케이션 내부 메모리를 활용해 조회수를 누적하는 방안을 고려했다. 


구현이 단순하고 추가 인프라가 필요 없다는 장점이 있었지만, 다음과 같은 한계가 있었다.

- 서버가 여러 대로 확장될 경우 인스턴스 간 데이터 공유가 어렵다.
- 조회수 증가 연산에서 동시성 문제가 발생할 수 있다.
- NestJS 서버 재시작 시 데이터가 유실된다.
- TTL과 같은 만료 정책을 직접 구현해야 하므로, 중복 조회 방지 로직 관리가 복잡해진다.

### 후보 2. Redis


그 다음으로는 Redis를 활용해 조회수를 누적하는 방안을 검토했다.


추가 인프라가 필요하다는 단점이 있었지만, 다음과 같은 장점이 있었다.

- 네트워크 기반 인메모리 저장소로 여러 서버 인스턴스 간 데이터 공유가 가능하다.
- `INCR` 연산을 통해 조회수를 원자적으로 증가시킬 수 있어 동시성 문제를 효과적으로 처리할 수 있다.
- NestJS 서버 재시작 시 Redis는 데이터가 유실되지 않는다.
- TTL 기능을 제공해준다.

결과적으로 확장성, 데이터 정합성, 운영 안정성, 개발 편의성 측면에서 Redis 도입의 이점이 크다고 판단하여 최종적으로 Redis를 채택했다.


하지만 Redis를 도입하면서 신경써야 하는 부분들도 분명 존재했는데, 이 부분은 뒤에서 다시 다루겠다.


## 설계


---


구현의 핵심 아이디어는 다음과 같다.


조회 요청이 발생할 때마다 DB에 직접 접근해 조회수를 증가시키는 대신, **Redis에 조회수 증가분을 누적한 뒤 일정 주기로 DB에 일괄 반영하는 방식으로 설계했다.**


### 조회수 증가분 누적


![image.png](/posts/attachments/%EC%A1%B0%ED%9A%8C%EC%88%98-API%EC%9D%98-DB-%EB%B3%91%EB%AA%A9%EC%9D%84-Redis%EB%A1%9C-%ED%95%B4%EA%B2%B0%ED%95%98%EA%B8%B0/img-02.png)


위 그림은 조회 요청이 들어왔을 때 **조회수 증가를 처리하는 앞단 구조**를 나타낸다.


사용자가 게시글을 조회하면 Client에서 `/api/posts/:id/view` 요청이 발생하고, 해당 요청은 NestJS 서버로 전달된다.


기존에는 이 시점에서 DB에 직접 접근하여 조회수를 증가시켰지만, 개선 이후에는 DB를 거치지 않고 Redis에 조회수 증가분을 먼저 기록하도록 변경했다.


예를 들어, 게시글 ID가 1인 경우 `view:count:1` 과 같은 key에 대해 Redis의 `INCR` 연산을 수행하여 조회수를 1 증가시킨다.


동시 요청이 발생하더라도 Redis의 `INCR` 연산은 매우 빠르게 처리되며, DB에서 발생하던 row-level lock 경쟁 없이 조회수를 증가시킬 수 있다.


### 조회수 증가분 DB에 반영 (배치 처리)


Redis에 저장되는 조회수 증가분은 DB에 반영되지 않으면 아무런 쓸모가 없다. Redis에 누적된 조회수 증가분을 일정 주기로 DB에 반영하는 구조를 뒷단에 설계해야 한다.


구체적으로는 스케줄러를 통해 주기적으로 Redis에 저장된 조회수 데이터를 조회한 뒤, 각 게시글별 증가분을 DB에 반영하도록 구현했다.


![image.png](/posts/attachments/%EC%A1%B0%ED%9A%8C%EC%88%98-API%EC%9D%98-DB-%EB%B3%91%EB%AA%A9%EC%9D%84-Redis%EB%A1%9C-%ED%95%B4%EA%B2%B0%ED%95%98%EA%B8%B0/img-03.png)


그림을 통해 동작 과정을 살펴보자.


먼저 NestJS는 일정 주기(예: 5초)마다 Redis에 저장된 조회수 증가분을 조회한다.


이때 `view:count:{postId}` 형태의 key들을 순회하면서, 각 게시글별로 누적된 조회수 값을 가져온다.


![image.png](/posts/attachments/%EC%A1%B0%ED%9A%8C%EC%88%98-API%EC%9D%98-DB-%EB%B3%91%EB%AA%A9%EC%9D%84-Redis%EB%A1%9C-%ED%95%B4%EA%B2%B0%ED%95%98%EA%B8%B0/img-04.png)


이후 가져온 증가본을 기반으로, 각 게시글에 대해 `view_count = view_count + N` 형태의 `UPDATE` 쿼리를 실행하여 DB에 한 번씩 반영한다.


예를 들어 `Redis에 view:count:1 = 11`이 저장되어 있다면, DB의 `post` 테이블에서 해당 게시글(`id = 1`)의 `view_count`를 `view_count = view_count + 11` 형태로 한 번에 반영한다.


DB 반영이 완료된 이후에는 Redis에 저장된 해당 key를 초기화하거나 삭제하여, 동일한 증가분이 중복 반영되지 않도록 처리한다.


## 구현


---


### Redis 명령어 정리


구현에 앞서, 필요한 Redis 명령어에 대해 간단히 살펴보고 넘어가자.


이번 구현에서 핵심적으로 사용한 명령어는 `INCR`, `GET`, `DEL`, `SADD`, `SMEMBERS` 이다.

- `INCR` : 해당 key의 값을 1 증가시키는 명령어로, 조회수 증가 시 사용
- `GET` : 배치 작업에서 누적된 조회수 값을 가져오기 위해 사용
- `DEL` : DB 반영 이후 Redis에 저장된 값을 초기화하기 위해 사용
- `SADD` : 변경이 발생한 게시글 ID를 Set에 저장하여, 이후 배치 처리 대상에 포함시키기 위해 사용
- `SMEMBERS` : Set에 저장된 게시글 ID 목록을 조회하여, 실제로 변경된 데이터만 처리하기 위해 사용

### 의존성 설치


```bash
npm install ioredis @nestjs/schedule
```


### Redis 설정


먼저 Redis를 NestJS의 의존성 주입(DI)을 활용하여 Provider 형태로 구성했다.


```typescript
// redis.provider.ts
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export const REDIS = Symbol('REDIS');

export const redisProvider = {
  provide: REDIS,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    return new Redis({
      host: config.getOrThrow('REDIS_HOST'),
      port: Number(config.getOrThrow('REDIS_PORT')),
      password: config.get('REDIS_PASSWORD') || undefined,
    });
  },
};
```


이후 RedisProvider를 Module로 분리하여, 다른 서비스에서 재사용할 수 있도록 구성했다.


```typescript
// redis.module.ts
import { Module } from '@nestjs/common';
import { redisProvider } from './redis.provider';

@Module({
  providers: [redisProvider],
  exports: [redisProvider],
})
export class RedisModule {}
```


이와 같이 구성하면 서비스 계층에서는 Redis 클라이언트를 직접 생성하지 않고, DI를 통해 주입받아 사용할 수 있어 코드의 결합도를 낮출 수 있다.


```typescript
constructor(@Inject(REDIS) private readonly redis: Redis) {}
```


### 조회수 증가분 누적


조회 요청이 발생하면, DB에 직접 접근하지 않고 Redis에 조회수 증가분을 먼저 누적하도록 구현했다.


`ViewCountService`의 `incrementViewCount` 메서드는 게시글 ID를 기반으로 `view:count:{id}` 형태의 key를 생성한 뒤, `INCR` 연산을 통해 조회수를 증가시킨다.


또한 조회수 증가와 함께 해당 게시글 ID를 `view:dirty`라는 Set에 저장한다.


```typescript
// view-count.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class ViewCountService {
  constructor(private readonly redisService: RedisService) {}

  async incrementViewCount(resourceId: number) {
    const countKey = `view:count:${resourceId}`;
    const dirtyKey = `view:dirty`;

    await this.redisService.client
      .pipeline()
      .incr(countKey)
      .sadd(dirtyKey, String(resourceId))
      .exec();
  }
}
```


이때 `pipeline`을 사용하여 `INCR`와 `SADD` 명령어를 한 번에 처리함으로써 Redis와의 네트워크 요청 횟수를 줄이고 성능을 최적화했다.


또한 `view:dirty` Set에 변경된 게시글 ID를 함께 기록함으로써,
이후 배치 작업에서는 전체 key를 조회하는 대신 **실제로 변경이 발생한 데이터만 효율적으로 처리**할 수 있도록 했다.


```typescript
// post.service.ts
import { Injectable } from '@nestjs/common';
import { ViewCountService } from './view-count.service';

@Injectable()
export class PostService {
  constructor(
    private readonly viewCountService: ViewCountService,
  ) {}

  async incrementPostView(postId: number) {
    const post = await this.findPostById(postId);
    if (!post) { 
	    throw new NotFoundException();
    }
    
    this.viewCountService.incrementViewCount(postId);
  }
}
```


그리고 게시글 조회 시 `ViewCountService`를 호출하여 조회수 증가를 처리하도록 구성했다.


### 조회수 배치 반영 구현


Redis에 누적된 조회수 증가분을 DB에 반영하기 위해, 스케줄러 기반의 배치 작업을 구현했다.


배치 작업은 5초마다 실행되며, Redis에 저장된 조회수 증가분을 조회한 뒤 DB에 반영하는 역할을 한다.


전체 코드는 다음과 같다. ORM은 Prisma를 사용했다.


```typescript
// view-flush.service.ts
@Injectable()
export class ViewFlushService {
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly prisma: PrismaService,
  ) {}

  @Interval(5000) // 5초마다 실행
  async flush() {
    const dirtyKey = `view:dirty`;

    // 1. 변경된 게시글 ID 조회
    const ids = await this.redis.smembers(dirtyKey);
    if (ids.length === 0) return;

    // 2. Redis에서 조회수 증가분 조회 (pipeline)
    const pipeline = this.redis.pipeline();
    for (const id of ids) {
      pipeline.get(`view:count:${id}`);
    }
    const results = await pipeline.exec();

    const updates: { id: number; delta: number }[] = [];

    if (results) {
      for (let i = 0; i < ids.length; i++) {
        const [, raw] = results[i];
        if (!raw) continue;

        const delta = Number(raw);
        if (delta > 0) {
          updates.push({ id: Number(ids[i]), delta });
        }
      }
    }

    // 3. DB 반영
    await this.prisma.$transaction(
      updates.map(({ id, delta }) =>
        this.prisma.post.update({
          where: { id },
          data: { viewCount: { increment: delta } },
        }),
      ),
    );

    // 4. Redis 정리
    const delPipeline = this.redis.pipeline();
    for (const { id } of updates) {
      delPipeline.del(`view:count:${id}`);
    }
    await delPipeline.exec();

    await this.redis.srem(dirtyKey, ...ids);
  }
}
```


코드가 너무 길어서 조금 끊어서 살펴보자.

1. **변경된 게시글 ID 조회**

```typescript
const dirtyKey = `view:dirty`;
const ids = await this.redis.smembers(dirtyKey);

if (ids.length === 0) return;
```


조회수 증가 시 `SADD`로 저장해둔 `view:dirty` Set을 통해 **실제로 변경이 발생한 게시글 ID만 조회**한다.


이를 통해 전체 key를 순회하는 대신, 필요한 데이터만 효율적으로 처리할 수 있다.

1. **Redis에서 조회수 증가분 조회**

```typescript
const pipeline = this.redis.pipeline();
for (const id of ids) {
  pipeline.get(`view:count:${id}`);
}
const results = await pipeline.exec();
```


각 게시글에 대해 Redis에 누적된 조회수 증가분을 조회한다.


이때 `pipeline`을 사용하여 여러 GET 요청을 한 번에 처리함으로써 네트워크 요청 횟수를 줄이고 성능을 최적화했다.


이후 결과를 순회하며 `delta`(증가량)를 추출하고, DB에 반영할 데이터 목록을 구성한다.

1. **DB 반영 (batch update)**

```typescript
await this.prisma.$transaction(
  updates.map(({ id, delta }) =>
    this.prisma.post.update({
      where: { id },
      data: { viewCount: { increment: delta } },
    }),
  ),
);
```


Redis에 가져온 증가분을 기반으로 `view_count = view_count + N` 형태로 DB에 반영한다.


이 과정을 트랜잭션으로 묶어, **여러 게시글의 조회수 업데이트가 원자적으로 수행되도록 구성했다.**

1. **Redis 데이터 정리**

```typescript
const delPipeline = this.redis.pipeline();
for (const { id } of updates) {
  delPipeline.del(`view:count:${id}`);
}
await delPipeline.exec();

await this.redis.srem(dirtyKey, ...ids);
```


DB 반영이 완료된 이후에는 Redis에 저장된 데이터를 정리한다.

- 조회수 증가분 key 삭제 (`DEL`)
- dirty set에 처리된 ID 제거 (`SREM`)

이를 통해 동일한 증가분이 중복 반영되는 것을 방지한다.


### 전체 흐름 정리

1. 조회 요청 시 Redis에 조회수 증가분 누적 (`INCR`)
2. 변경된 ID를 dirty set에 기록 (`SADD`)
3. 배치 작업이 주기적으로 실행
4. dirty set 기반으로 변경된 데이터 조회
5. DB에 `+N` 형태로 반영
6. Redis 데이터 정리

## 결과


---


Redis 기반 배치 처리 구조를 도입한 이후, 조회수 API의 성능을 측정한 결과는 다음과 같다.


| 지표        | Before (동기 처리) | After (Redis 배치) | 개선 효과               |
| --------- | -------------- | ---------------- | ------------------- |
| 평균 응답 시간  | 2.51초          | 0.88초            | 약 65% 감소            |
| p95 응답 시간 | 3.80초          | 1.57초            | 약 58% 감소            |
| 처리량 (RPS) | 251 req/s      | 581 req/s        | 약 2.3배 증가           |
| DB 쓰기 횟수  | 1,000건         | 0건               | 요청 처리 과정에서 DB 쓰기 제거 |
| **에러율**   | 0%             | 0%               | -                   |


조회수 증가 로직을 Redis 기반 비동기 구조로 변경하면서, **응답 시간과 처리량 모두에서 유의미한 성능 개선**을 확인할 수 있었다.


특히 요청마다 수행되던 DB UPDATE를 제거함으로써 동일 row에 대한 lock 경합이 사라졌고, 이로 인해 p95 응답 시간이 크게 감소했다.


또한 DB write를 배치 처리로 전환하면서 요청 처리 과정에서는 DB 접근이 발생하지 않게 되어, 전체적인 처리량(RPS)이 약 2배 이상 증가했다.


다만, 위 성능 측정 결과는 로컬 환경에서 진행된 테스트이기 때문에 실제 운영 환경과는 차이가 있을 수 있다.


로컬 환경에서는 네트워크 지연, 실제 트래픽 패턴 등이 충분히 반영되지 않기 때문에, 실제 서비스 환경에서는 성능 결과가 달라질 수 있다.


따라서 이번 결과는 절대적인 수치라기보다는, **구조 변경을 통해 병목을 완화하고 성능을 개선할 수 있음을 확인한 지표로 해석하는 것이 적절하다.**


## 트레이드오프


---


앞서 Redis를 도입하여 조회수 증가 로직을 개선하면서 DB 병목 문제를 해결할 수 있었다.


하지만 이러한 구조는 좋은 성능을 내는 대신, 일부 데이터 정합성과 운영 측면에서 고려해야 할 트레이드오프가 존재한다.


이 섹션에서는 이러한 트레이드오프와 그에 대한 판단 과정을 정리해보고자 한다.


### 1) 조회수가 바로 반영되지 않는다.


첫번째로, 실시간 정합성이 느슨해진다. 조회수가 Redis에서 DB로 반영되기까지 5초의 딜레이가 생긴다. 사용자의 입장에서는 “내가 방금 본 글인데 조회수가 아직 안 올랐네?” 라는 상황이 발생할 수 있다.


하지만 조회수는 정확한 실시간 값보다 대략적인 추세가 중요한 데이터라는 판단이 있었다. 유튜브나 Velog 같은 서비스도 조회수를 실시간으로 DB에 반영하지 않는다. 수용 가능한 트레이드오프라고 봤다.


### 2) Redis 장애 시 데이터 유실 가능성이 있다.


두번째로, Redis에 누적된 조회수 증가분이 DB에 반영되기 전에 Redis 장애가 발생할 경우 일부 조회수 데이터가 유실될 수 있다.


특히 배치 주기 동안 Redis에만 존재하고 DB에 반영되지 않은 값들은, Redis 재시작이나 장애 상황에서 사라질 가능성이 있다.


하지만 마찬가지로 조회수는 약간의 오차가 허용되는 데이터이기 때문에, 이러한 유실 가능성을 수용 가능한 트레이드오프로 판단했다.


추가적으로 학습을 하니 Redis의 persistence(RDB/AOF) 설정을 통해 데이터 유실을 일부 완화할 수 있다고 한다.


### 3) Redis 메모리 사용량이 증가한다.


세번째로, Redis는 메모리 기반 저장소이기 때문에 저장 가능한 데이터의 크기에 한계가 있다.


조회수 증가분과 dirty set을 지속적으로 저장하는 구조이기 때문에, 트래픽이 많아질 경우 Redis 메모리 사용량이 빠르게 증가할 수 있다.


이를 방지하기 위해 배치 주기를 짧게 설정하여 Redis에 데이터가 장시간 쌓이지 않도록 했고, 불필요한 데이터는 즉시 삭제하여 메모리 사용량을 관리하도록 했다.


### 4) DB와 Redis는 하나의 트랜잭션으로 묶을 수 없다.


네번째로, Redis와 DB는 서로 다른 시스템이기 때문에 하나의 트랜잭션으로 묶을 수 없다. 따라서 DB 반영과 데이터 정리 작업을 원자적으로 처리할 수 없기 때문에, 일부 상황에서는 데이터 불일치기 발생할 수 있다.


특히 DB 반영이 성공한 이후 Redis 정리 과정에서 장애가 발생하면,동일한 증가분이 다음 배치에서 다시 반영되어 중복 증가가 발생할 수 있다.


이 문제는 어떻게 하면 해결할 수 있을지 조금 더 고민을 해봐야겠다.
