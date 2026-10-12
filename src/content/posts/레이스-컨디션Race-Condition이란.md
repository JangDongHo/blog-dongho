---
title: "레이스 컨디션(Race Condition)이란?"
description: "NestJS에서 애플리케이션 개발을 진행하다 보면 여러 사용자가 동시에 같은 데이터를 수정하려고 할 때 예상치 못한 결과가 발생하는 상황을 마주할 수 있다. 이러한 문제는 특히 트래픽이 많은 서비스에서 자주 발생하며, 잘못 처리하면 데이터 무결성이 깨지거나, 사용자가 원치 않는 결과를 "
date: 2025-03-13
---

NestJS에서 애플리케이션 개발을 진행하다 보면 여러 사용자가 동시에 같은 데이터를 수정하려고 할 때 예상치 못한 결과가 발생하는 상황을 마주할 수 있다. 이러한 문제는 특히 트래픽이 많은 서비스에서 자주 발생하며, 잘못 처리하면 데이터 무결성이 깨지거나, 사용자가 원치 않는 결과를 얻는 문제로 이어질 수 있다.


이러한 동시성 문제는 왜 발생하는걸까?


# 레이스 컨디션(Race Condition)이란?


레이스 컨디션(Race Condition)이란 두 개 이상의 프로세스(쓰레드)가 동일한 자원을 동시에 수정하려고 할 때 발생하는 문제이다.


예를 들어, 특정 데이터를 수정하는 두 개의 요청이 거의 동시에 도착했을 때, 한 요청이 데이터를 변경하기 전에 다른 요청이 기존 데이터를 읽고 수정하려 한다면, 최종적으로는 저장되는 데이터가 예기치 않은 값이 될 가능성이 높다.


이 문제는 트랜잭션 단위에서 발생하는 데이터 충돌과 관련이 있으며, 특히 데이터베이스를 사용한 애플리케이션에서는 더욱 신경 써야 한다.


## 레이스 컨디션이 왜 위험할까?


레이스 컨디션이 실제로 어떻게 발생하는지 이해하기 위해, 공연 티켓 예매 시스템을 예로 들어보자.


```typescript
await this.dataSource.transaction(async (manager) => {
  // 좌석 정보 조회 (락을 걸지 않음)
  const seat = await manager.findOne(Seat, { where: { id: seatId } });

  if (seat.isReserved) {
    throw new Error('이미 예약된 좌석입니다.');
  }
	
	// 좌석 예약 상태 변경
	seat.isReserved = true;
  await manager.save(seat);
});
```


위 코드는 특정 좌석을 예약하는 트랜잭션을 처리하는 로직이다.


하지만 이 코드에는 심각한 동시성 문제가 존재한다.


User A와 User B가 거의 동시에 같은 좌석을 예약하려고 요청을 보낸다고 가정해보자.


이 경우 실제로는 한 개의 좌석만 있어야 하지만, 두 명이 동시에 예매에 성공하는 상황이 되어 데이터 무결성이 깨지는 문제가 발생한다.


또, 좌석이 이미 예약되었는데 결제가 진행되면, 추후에 환불 등의 추가 작업이 필요해진다.


이 문제를 방지하려면 여러 요청이 동시에 같은 데이터를 수정하지 못하도록 막아야 한다.


# 레이스 컨디션을 예방하는 방법


레이스 컨디션을 방지하기 위해 다양한 기법이 존재하며, 대표적인 방법으로 **낙관적 락(Optimistic Lock)**과 **비관적 락(Pessimistic Lock)**이 있다.


## 1. 낙관적 락(Optimistic Lock)


낙관적 락은 데이터를 읽을 때는 락을 걸지 않고, 업데이트 시점에 충돌이 발생하면 실패 처리하는 방식이다.


즉, “대부분의 경우 동시 수정이 없을 것”이라고 가정하고 동작하며, 실제로 충돌이 발생했을 때만 이를 감지하여 해결한다.


장점은 락을 걸지 않아 대기 시간이 발생하지 않기 때문에 데이터 읽기 시 성능이 뛰어나다는 장점이 있다.


단점으로는 충돌이 발생하면 트랜잭션을 다시 시도해야 하고, 동시에 같은 데이터를 수정하는 경우 업데이트 실패율이 높아질 수 있다.


공연 티켓 예매 시스템을 낙관적 락을 적용하여 해결해보자.


업데이트 시점에 충돌이 발생하면 실패 처리를 한다고 했는데, 그렇다면 충돌은 어떻게 감지할 수 있을까?


낙관적 락에는 버전(Version)을 활용하여 데이터 충돌을 감지한다.


업데이트 시점에 데이터의 버전이 변경되었는지 확인해서 충돌 여부를 판단하는 방식이다.


동작 방식을 살펴보면 다음과 같다.

1. 데이터를 읽을 때, 현재 버전 정보(Version)를 함께 조회한다.
2. 데이터를 수정할 때, 조회했던 버전과 현재 데이터의 버전이 동일한지 확인한다.
3. 만약 버전이 변경되었다면, 다른 트랜잭션에서 먼저 데이터를 수정한 것이므로 예외를 발생시킨다.

TypeORM에서는 `@Version` 데코레이터를 이용하면 자동으로 버전 관리를 할 수 있다.


데이터를 수정할 때 버전이 다르면 충돌로 간주하여 예외를 발생시킨다.


```typescript
import { Entity, PrimaryGeneratedColumn, Column, Version } from 'typeorm';

@Entity()
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isReserved: boolean;

  @Version() // 낙관적 락 적용 (자동으로 버전 관리)
  version: number;
}
```


```typescript
await this.dataSource.transaction(async (manager) => {
  // 좌석 정보 조회 (락을 걸지 않음)
  const seat = await manager.findOne(Seat, { where: { id: seatId } });

  if (seat.isReserved) {
    throw new Error('이미 예약된 좌석입니다.');
  }

  // 동시에 다른 트랜잭션이 변경하면 예외 발생 (버전 체크)
	seat.isReserved = true;
  await manager.save(seat);
});
```


`@Version` 필드는 데이터가 변경될 때마다 자동으로 1씩 증가하며, `UPDATE`시 버전이 다르면 TypeORM에서 자동으로 예외(`OptimisticLockVersionMismatchError`)를 발생시켜 충돌을 감지한다.


충돌을 감지했다면 사용자에게 바로 “다시 시도해주세요” 라는 메시지를 반환하거나, 백엔드에서 재시도 로직을 구현해서 충돌을 해결할 수 있다.


## 2. 비관적 락(Pessimistic Lock)


이제 낙관적 락을 이해했으니, 비관적 락을 활용한 해결 방법을 알아보자.


비관적 락은 **데이터를 조회할 때부터 잠금을 걸어** 다른 트랜잭션이 해당 데이터를 수정하지 못하도록 막는 방식이다.


즉, “누군가 동시에 데이터를 수정하려고 할 가능성이 높다”라고 가정하고, 사전에 충돌을 방지하는 전략이다.


```typescript
await this.dataSource.transaction(async (manager) => {
  // 좌석 정보를 가져옴 (pessimistic_write 잠금 사용)
  const seat = await manager.findOne(Seat, { where: { id: seatId }, lock: { mode: "pessimistic_write" } });

  // 좌석이 이미 예약되었는지 확인
  if (seat.isReserved) {
    throw new Error('이미 예약된 좌석입니다.');
  }

  // 좌석 예약 상태 업데이트
  seat.isReserved = true;
  await manager.save(seat);
});
```


TypeORM에서는 `pessimistic_write` 모드를 사용하여 비관적 락을 적용할 수 있다.


이 락을 획득한 트랜잭션은 해당 레코드에 대한 읽기와 쓰기 작업을 독점한다.


다른 트랜잭션이 해당 레코드에 대한 읽기 또는 쓰기를 시도할 때, 해당 작업을 시도하는 트랜잭션이 완료될 때까지 기다린다.


주의할 점은 다른 트랜잭션이 너무 오래 기다리면 서비스 응답 시간이 길어지고, **데드락(Deadlock)** 위험도 생길 수 있다.


# 참고 자료


[https://barunmo.blogspot.com/2013/06/deadlock.html](https://barunmo.blogspot.com/2013/06/deadlock.html)


[https://docs.nestjs.com/fundamentals/circular-dependency](https://docs.nestjs.com/fundamentals/circular-dependency)


[https://4sii.tistory.com/422](https://4sii.tistory.com/422)


[https://sjh9708.tistory.com/51](https://sjh9708.tistory.com/51)


[https://medium.com/@jeongrolee.tech/typeorm-nest-js-%EC%A0%95%EC%82%B0-cron-%EC%97%90-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94-%EB%9D%BD-f0c29a8500a7](https://medium.com/@jeongrolee.tech/typeorm-nest-js-%EC%A0%95%EC%82%B0-cron-%EC%97%90-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94-%EB%9D%BD-f0c29a8500a7)
