---
title: "Computer System Overview"
description: "컴퓨터 시스템의 구성 요소와 하드웨어(프로세서, 메모리, 주변장치), 캐시의 동작을 정리한다."
date: 2026-07-12
tags:
  - OS
---

> 김덕수 교수님 운영체제 강의를 듣고 정리한 글입니다.
> - 강의: [YouTube 재생목록](https://www.youtube.com/playlist?list=PLBrGAFAIyf5rby7QylRc6JxU5lzQ9c4tN)
> - 강의 자료: [hpclab](https://hpclab.tistory.com/1)

## PC의 구성 요소

- 하드웨어
    - CPU
    - GPU
    - 메모리
    - HDD/SDD
    - LAN
- 소프트웨어
    - OS

## 운영체제


![image.png](/posts/attachments/Computer-System-Overview/img-01.png)


## 컴퓨터 하드웨어


### 프로세서 (Processor)

> 계산하는 녀석
- CPU
- 그래픽 카드 (GPU)
- 응용 전용 처리장치 등

### 메모리

> 저장하는 녀석
- 주 기억장치 (DDRAM)
- 보조 기억장치 등 (Disk)

### 주변장치

> 그 외
- 키보드/마우스 (입력 장치)
- 모니터, 프린터 (출력 장치)
- 네트워크 모뎀 등 (네트워크 장치)

## 프로세서 (Processor)

- 컴퓨터의 두뇌 (중앙처리장치)
    - 연산 수행
    - 컴퓨터의 모든 장치의 동작 제어

![image.png](/posts/attachments/Computer-System-Overview/img-02.png)


### 레지스터 (Register)

- **프로세서 내부에 있는 메모리**
    - 프로세서가 사용할 데이터 저장
    - 컴퓨터에서 가장 빠른 메모리
- **레지스터의 종류**
    - 용도에 따른 분류
        - 전용 레지스터, 범용 레지스터
    - 사용자가 정보 변경 가능 여부에 따른 분류
        - 사용자 가시 레지스터, 사용자 불가시 레지스터
    - 저장하는 정보의 종류에 따른 분류
        - 데이터 레지스터, 주소 레지스터, 상태 레지스터

![image.png](/posts/attachments/Computer-System-Overview/img-03.png)

- 가시 레지스터 본 적 있나?
    - C 언어 `register int num1 = 10;`
    - 변수 num1은 CPU의 레지스터를 (가능한 한) 사용

![image.png](/posts/attachments/Computer-System-Overview/img-04.png)

- 대부분 전용 레지스터
- 프로그램 카운터(PC), 명령어 레지스터(IR), 누산기(ACC) 정도는 뜻을 알고 있는게 좋음
    - PC → 다음에 실행할 코드의 주소
    - IR → 실행할 명령어를 보관
    - ACC → 계산하는 과정에서 값을 일시적으로 저장

### 프로세서의 동작


![image.png](/posts/attachments/Computer-System-Overview/img-05.png)

- ALU: 산술-논리 연산장치
- ALU는 다양한 레지스터들과 상호작용하며 계산을 수행

### 운영체제와 프로세서 관계

- **프로세서에게 처리할 작업 할당 및 관리**
    - 프로세스(Process) 생성 및 관리
    - 3장
- **프로그램의 프로세서 사용 제어**
    - 프로그램의 프로세서 사용 시간 관리
    - 복수 프로그램간 사용 시간 조율 등
    - 4~5장

## 메모리 (Memory)

- **데이터를 저장하는 장치 (기억장치)**
    - 프로그램(OS, 사용자SW 등), 사용자 데이터 등
- **메모리의 종류**

    ![image.png](/posts/attachments/Computer-System-Overview/img-06.png)


### 주기억장치 (Main memory)

- 프로세서가 수행할 프로그램과 데이터 저장
- DRAM을 주로 사용
    - 프로세서가 접근할 수 있는 친구들 중에선 용량이 크고, 가격이 저렴

![image.png](/posts/attachments/Computer-System-Overview/img-07.png)

- <u>**디스크 입출력 병목현상(I/O bottleneck) 해소**</u>
- CPU Speed ↔ Disk Speed의 갭을 줄이기 위해 Main Moery 계층이 등장
    - CPU가 처리하는 동안 Disk에서 데이터를 끄집어 내서 Main Memory에 저장

## 캐시 (Cache)

- 프로세서 내부에 있는 메모리 (L1, L2 캐시 등)
    - 속도가 빠르고, 가격이 비쌈

![image.png](/posts/attachments/Computer-System-Overview/img-08.png)

- <u>**메인 메모리의 입출력 병목현상 해소**</u>
- 역시 마찬가지로 중간 계층으로 캐시를 둬서 병목현상 해소

### 캐시의 동작

- 일반적으로 HW적으로 관리 됨
- **캐시 히트 (Cache hit)**
    - 필요한 데이터 블록이 캐시 존재
- **캐시 미스 (Cache miss)**
    - 필요한 데이터 블록이 없는 경우

![image.png](/posts/attachments/Computer-System-Overview/img-09.png)

- L1 Cache 크기 → 128kB
- 에게? 그거 가지고 병목현상을 어떻게 해결해요? 라는 의문이 들 수 있음
- 어떻게 해소가 가능한지 자세히 한번 살펴보자.

### 지역성 (Locality)

- **공간적 지역성 (Spatial locality)**
    - 참조한 주소와 인접한 주소를 참조하는 특성
    - 예) 순차적 프로그램 수행
- **시간적 지역성 (Temporal locality)**
    - 한 번 참조한 주소를 곧 다시 참조하는 특성
    - 예) For 문 등의 순환문
- **지역성은 캐시 적중률(cache hit ratio)과 밀접**
    - 알고리즘 성능 향상 위한 중요한 요소 중 하나
- CPU가 **메인 메모리(RAM)** 에서 데이터를 캐시로 가져올 때는**필요한 데이터 하나만 가져오는 것이 아니라 일정 크기의 묶음 단위로 가져옴.**
    - 이 묶음 → **Cache Line (또는 Cache Block)**
    - 보통 64 bytes 정도 크기 (CPU에 따라 다름)
> 위 지역성 특성 때문에 캐시 공간이 작더라도 병목 현상을 충분히 해소시켜줄 수 있다!

![image.png](/posts/attachments/Computer-System-Overview/img-10.png)

- HW가 알아서 한다했잖슴 ㅋㅋ 근데 왜 우리가 알아야함?
- 예시를 살펴보자.
- 2차원 배열의 요소들을 다 더해서 `x` 변수에 집어넣는다고 해보자.
- `a[i][j] vs a[j][i]`
    - `a[j][i]` -> 지속적인 Cache Miss 발생
    - `a[i][j]` → 블록 단위로 Cache Hit 발생 (성능 개선)
- 캐시를 이해하고 있으면 우리 프로그램을 더 효율적으로 짤 수 있음 (위 순서에 따라 10배, 100배 차이)

### 보조기억 장치

- 프로그램과 데이터를 저장
- 프로세서가 직접 접근할 수 없음 (주변장치)
    - 주기억장치를 거쳐서 접근
    - (프로그램/데이터 > 주기억장치) 인 경우는?
        - 가상 메모리(Virtual Memory)
- 용량이 크고, 가격이 저렴

### 메모리와 운영체제

- **메모리 할당 및 관리**
    - 프로그램의 요청에 따른 메모리 할당 및 회수
    - 할당된 메모리 관리
    - 7장
- **가상 메모리 관리**
    - 가상메모리 생성 및 관리
    - 논리주소 → 물리주소 변환
    - 8장

## 시스템 버스 (System Bus)

- 하드웨어들이 데이터 및 신호를 주고 받는 물리적인 통로

![image.png](/posts/attachments/Computer-System-Overview/img-11.png)


![image.png](/posts/attachments/Computer-System-Overview/img-12.png)


![image.png](/posts/attachments/Computer-System-Overview/img-13.png)


## 주변 장치

- 프롯세서와 메모리를 제외한 하드웨어들

![image.png](/posts/attachments/Computer-System-Overview/img-14.png)

- **장치드라이버 관리**
    - 주변 장치 사용을 위한 인터페이스 제공
- **인터럽트 (Interrupt) 처리**
    - 주변 장치의 요청 처리
    - 3장
- **파일 및 디스크 관리**
    - 파일 생성 및 삭제
    - 디스크 공간 관리 등
    - 9~10장
