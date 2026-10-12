---
title: "Prometheus 란 무엇일까?"
description: "이번 글에서는 메트릭 기반 모니터링 시스템인 오픈소스 프로젝트 Prometheus 에 대해 정리한다."
date: 2026-02-24
---

이번 글에서는 메트릭 기반 모니터링 시스템인 오픈소스 프로젝트 **Prometheus** 에 대해 정리한다.


Prometheus는 서버, 컨테이너, 애플리케이션 등에서 발생하는 메트릭 데이터를 수집하고 저장하는 시스템이다.


Grafana와 함께 사용되는 경우가 많으며, 클라우드 네이티브 환경에서 사실상 표준 모니터링 도구로 자리 잡았다.


## Prometheus 아키텍처 개요


Prometheus가 어떻게 동작하는지 이해하기 위해 일반적인 인프라 구조를 살펴보자.


![이미지 출처: https://prometheus.io/docs/introduction/overview/?utm_source=chatgpt.com](/posts/attachments/Prometheus-%EB%9E%80-%EB%AC%B4%EC%97%87%EC%9D%BC%EA%B9%8C/img-01.png)


### **1️⃣ 데이터 생산자 (Exporter / Target)**


Prometheus에서 데이터를 제공하는 주체를 **Target**이라고 부른다.


Prometheus는 각 타겟의 HTTP 엔드포인트(`/metrics`)를 통해 메트릭을 수집한다.


데이터 생산자의 예시는 다음과 같다.

- 애플리케이션 서버 (Spring Boot 등)
- Node Exporter (서버 자원 수집용)
- Kubernetes Pod
- 데이터베이스 (MySQL Exporter 등)
- IoT 장치

Prometheus는 기본적으로 **Pull 방식**을 사용한다.


### 2️⃣ Prometheus 서버


Prometheus 서버는 시스템의 핵심이다.


주요 역할은 다음과 같다.

1. 설정 파일(`prometheus.yml`) 기반으로 타겟 목록 관리
2. 주기적으로 타겟을 스크래핑
3. 수집한 데이터를 **Time-series DB(TSDB)** 형태로 저장
4. PromQL을 통해 쿼리 처리

Prometheus는 **자체 시계열 데이터베이스(TSDB)**를 내장하고 있다.


Grafana와 달리, Prometheus는 실제로 데이터를 저장한다.


### 3️⃣ **Alertmanager (선택 구성)**


Prometheus는 알림 기능도 제공한다.

- 특정 조건을 만족하면 Alert 발생
- Alertmanager가 이를 수신
- Slack, Email, Webhook 등으로 알림 전송

Alertmanager는 [다음 프로젝트](https://prometheus.io/docs/alerting/latest/alertmanager/)와 함께 사용된다.


## **Prometheus의 데이터 모델**


Prometheus는 **시계열(Time-series)** 데이터를 저장한다.


### 메트릭 구성 요소


하나의 메트릭은 다음과 같은 구조를 가진다.


```json
metric_name{label1="value1", label2="value2"} value
```


사용 예시는 다음과 같다.


```json
http_requests_total{method="GET", status="200"} 1024
```


구성 요소를 조금 더 자세히 살펴보자.

- **Metric Name**: http_requests_total
- **Labels**: method, status
- **Value**: 실제 수치 값
- **Timestamp**: 내부적으로 자동 저장

Prometheus의 강력함은 **Label 기반 데이터 모델**에 있다.


이를 통해 동일한 메트릭을 다양한 차원으로 분석할 수 있다.


## **PromQL (Prometheus Query Language)**


Prometheus는 자체 쿼리 언어인 **PromQL**을 제공한다.


사용 예시는 다음과 같다.

- 최근 5분간 평균 CPU 사용률

    ```json
    avg(rate(node_cpu_seconds_total[5m]))
    ```

- HTTP 요청 수 증가량 계산

    ```json
    rate(http_requests_total[1m])
    ```


PromQL은 다음과 같은 기능을 지원한다.

- 집계 (sum, avg, max, min)
- 필터링 (label 조건)
- 시계열 연산
- 함수 기반 계산

## **Prometheus에서 다루는 데이터 유형**


Prometheus는 기본적으로 **메트릭(Metrics)** 만을 다룬다.


### **1️⃣ Counter**

- 누적 값 (예: 총 요청 수)
- 감소하지 않음

### **2️⃣ Gauge**

- 증가/감소 가능한 값
- CPU 사용량, 메모리 사용량 등

### **3️⃣ Histogram**

- 요청 지연 시간 분포 측정

### **4️⃣ Summary**

- 응답 시간과 같은 통계 요약

참고로, 로그(Log)는 Prometheus의 주요 대상이 아니다.


로그 수집은 보통 **Loki** 와 같은 시스템을 사용한다.


## 정리

- Prometheus는 **Pull 기반 메트릭 수집 시스템**이다.
- 자체 시계열 데이터베이스(TSDB)를 내장하고 있다.
- PromQL이라는 강력한 쿼리 언어를 제공한다.
- Grafana와 함께 사용하면 강력한 모니터링 대시보드를 구축할 수 있다.
