---
title: "Grafana 란 무엇일까?"
description: "이번 글에서는 데이터를 시각화하기 위한 오픈소스 웹 애플리케이션 Grafana에 대해서 정리한다."
date: 2026-02-24
---

이번 글에서는 데이터를 시각화하기 위한 오픈소스 웹 애플리케이션 Grafana에 대해서 정리한다.


Grafana를 사용하면 시각화하고 싶은 데이터를 차트, 그래프, 대시보드 형태로 만들 수 있다.


## Grafana 아키텍처 개요


Grafana가 어떻게 동작하는지 이해하기 위해 일반적인 인프라 구조를 살펴보자.


아래는 간단한 예시이며, 실제 환경에서는 훨씬 더 복잡할 수 있다고 한다.


![image.png](/posts/attachments/Grafana-%EB%9E%80-%EB%AC%B4%EC%97%87%EC%9D%BC%EA%B9%8C/img-01.png)


### 1️⃣ 데이터 생산자 (Data Producer)


데이터 생산자는 시각화하려는 데이터를 실제로 생성하는 주체이다.


어떤 형태로든 데이터를 생성하는 시스템이나 장치가 데이터 생산자가 될 수 있다.

- Jenkins CI 서버
- Rasberry Pi
- 데이터센터의 가상 머신
- Kubernetes Pod
- IoT 센서 (집 안의 센서 등)
- 기상 관측 장비

### 2️⃣ 데이터 소스 (Data Source)


데이터 소스는 보통 데이터베이스이다.

- Prometheus
- InfluxDB
- MySQL 등

이 데이터베이스는 데이터 생산자와 연결되어 있다.


데이터 수집 방식은 데이터 소스 종류에 따라 달라진다.

- **Pull 방식:** 데이터 소스가 데이터 생산자로부터 데이터를 가져감
- **Push 방식**:데이터 생산자가 데이터 소스로 데이터를 전송

예를 들어 Prometheus의 경우,

- 데이터 생산자는 특정 HTTP 엔드포인트를 제공하고
- Prometheus가 해당 엔드포인트를 주기적으로 스크래핑하여
- 데이터를 수집하고 저장한다.

### 3️⃣ Grafana 서버


Grafana 서버는 **프론트엔드 역할**을 하며 데이터를 시각화한다.


작동 방식은 다음과 같다.

1. Grafana가 데이터 소스에 쿼리를 보냄
2. 데이터 소스가 요청된 데이터를 반환
3. 반환된 데이터를 Grafana 대시보드에 표시

## Grafana에서 다루는 데이터 유형


Grafana에서 시각화하는 데이터는 크게 두 가지이다.


### 1️⃣ 메트릭 (Metrics)


메트릭은 시간에 따라 변하는 수치 데이터 (Time-series 데이터)이다.


예시:

- CPU 사용량
- 메모리 사용량
- CPU 또는 GPU 온도

### 2️⃣ 로그 (Logs)


로그는 보통 다음과 같은 형태이다.

- 타임스탬프
- 로그 레벨 (Error, Info, Warn, Debug)
- 상세 메시지

로그 패널에서는 아래와 같은 요소를 확인할 수 있다.

- 개별 로그 항목
- 로그 레벨별 히스토그램 그래프

![이미지 출처: https://blog.pages.kr/2778](/posts/attachments/Grafana-%EB%9E%80-%EB%AC%B4%EC%97%87%EC%9D%BC%EA%B9%8C/img-02.png)


## 정리

- Grafana는 데이터를 시각화하기 위한 강력한 오픈소스 도구이다.
- 차트, 그래프, 대시보드 형태로 데이터를 표현할 수 있다.
- Grafana는 **데이터를 직접 저장하지 않는다.**
- 데이터를 저장하는 **데이터 소스(DB)** 를 연결해 쿼리한 뒤 시각화한다.

## 참고 자료

- [https://www.youtube.com/watch?v=lILY8eSspEo](https://www.youtube.com/watch?v=lILY8eSspEo)
