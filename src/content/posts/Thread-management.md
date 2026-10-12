---
title: "Thread management"
description: "스레드의 개념과 싱글/멀티 스레드의 차이, 사용자·커널 수준 스레드 구현과 멀티스레딩 모델을 정리한다."
date: 2026-07-31
tags:
  - OS
---

> 김덕수 교수님 운영체제 강의를 듣고 정리한 글입니다.
> - 강의: [YouTube 재생목록](https://www.youtube.com/playlist?list=PLBrGAFAIyf5rby7QylRc6JxU5lzQ9c4tN)
> - 강의 자료: [hpclab](https://hpclab.tistory.com/1)

## 🎯 학습 목표


---

- What is the thread?
- Implementation of thread

## 🔷 스레드의 개념


---


![image.png](/posts/attachments/Thread-management/img-01.png)


![image.png](/posts/attachments/Thread-management/img-02.png)


![image.png](/posts/attachments/Thread-management/img-03.png)

- Light Weight Process (LWP)
- 프로세서(e.g, CPU) 활용의 기본 단위
- 구성 요소
    - Thread ID
    - Register set (PC 등)
    - Stack (i.e. local data)
- 제어 요소 외 코드, 데이터 및 자원들은 프로세스의 다른 스레드들과 공유
- 전통적 프로세스 = 단일 스레드 프로세스

## 🔷 싱글 스레드 vs 멀티 스레드


---


![image.png](/posts/attachments/Thread-management/img-04.png)


> [!note]
>
> ❓ **다중 처리(다중 프로세스) vs 다중 스레드?**
>
> ---


### ✔︎ 스레드 장점

- **사용자 응답성 (Responsiveness)**
    - 일부 스레드의 처리가 지연되어도, 다른 스레드는 작업 계속 처리 가능
- **자원 공유 (Resource sharing)**
    - 자원을 공유해서 효율성 증가 (커널의 개입 피함)
        - 예) 동일 address space에서 스레드 여러 개
- **경제성 (Economy)**
    - 프로세스의 생성, context switch에 비해 효율적
- **멀티 프로세서(multi-processor) 활용**
    - 병렬처리를 통해 성능 향상

### ✔︎ 스레드 사용의 예


![image.png](/posts/attachments/Thread-management/img-05.png)


![image.png](/posts/attachments/Thread-management/img-06.png)


## 🔷 스레드(Thread)의 구현


---

- 사용자 수준 스레드 (User threads)
- 커널 수준 스레드 (Kernel threads)

### ✔︎ 사용자 수준 스레드 (User threads)

- **사용자 영역의** <u>**스레드 라이브러리**</u>**로 구현 됨**
    - 스레드의 생성, 스케줄링 → 개발자 마음
    - POSIX threads, Win32 threads, Java thread API
- **커널은 스레드의 존재를 모름**
    - 커널의 관리(개입)을 받지 않음
        - 생성 및 관리의 부하가 적음, 유연한 관리 가능
        - 이식성(portability)이 높음
    - 커널은 프로세스 단위로 자원 할당
        - 하나의 스레드가 block 상태가 되면, 모든 스레드가 대기 (single-threaded kerrnel의 경우)

![image.png](/posts/attachments/Thread-management/img-07.png)


### ✔︎ 커널 수준 스레드 (Kernel Threads)

- OS(Kernel)이 직접 관리
- **커널 영역에서 스레드의 생성, 관리 수행**
    - Context switching 등 부하(overhead)가 큼
- **커널이 각 스레드를 개별적으로 관리**
    - 프로세스 내 스레드들이 병행 수행 가능
    - 하나의 스레드가 block 상태가 되어도, 다른 스레드는 계속 작업 수행 가능
- Java threads → Java Virtual Machine (JVM)에 의해 생성 관리 됨

![image.png](/posts/attachments/Thread-management/img-08.png)


### ✔︎ 멀티스레딩 모델

- **다대일(n:1) 모델**
    - 사용자 수준 스레드
- **일대일(1:1) 모델**
    - 커널 수준 스레드
- **다대다(n:m) 모델**
    - n > m
    - 혼합형 스레드

![image.png](/posts/attachments/Thread-management/img-09.png)


### ✔︎ 혼합형(n:m) 스레드

- **n개 사용자 수준 스레드 - m개의 커널 스레드 (n > m)**
    - 사용자는 원하는 수 만큼 스레드 사용
    - 커널 스레드는 자신에게 할당된 하나의 사용자 스레드가 block 상태가 되어도, 다른 스레드 수행 가능 (병행 처리 가능)
- **효율적이면서도 유연함**

![image.png](/posts/attachments/Thread-management/img-10.png)
