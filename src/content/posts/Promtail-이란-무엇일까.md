---
title: "Promtail 이란 무엇일까?"
description: "이번 글에서는 Loki의 로그 수집 에이전트인 오픈소스 프로젝트 Promtail 에 대해 정리한다."
date: 2026-02-26
---

이번 글에서는 Loki의 로그 수집 에이전트인 오픈소스 프로젝트 [**Promtail**](https://grafana.com/docs/loki/latest/send-data/promtail/) 에 대해 정리한다.


Promtail은 서버, 컨테이너, Kubernetes 환경에서 발생하는 **로그를 수집하여 Loki로 전송하는 경량 에이전트**이다.


보통 [**Grafana Loki**](https://grafana.com/oss/loki/) 와 함께 사용되며, Loki 스택에서 로그 수집을 담당하는 핵심 구성 요소다.


> [!note]
> 🚨 Grafana Labs가 2025년 2월 13일부로 Promtail을 장기 지원(LTS) 모드로 전환했습니다. LTS 모드로 전환되면서 Promtail의 신규 기능 개발은 종료됐으며, 보안 업데이트와 버그 수정만 지원되고 있습니다. Promtail을 대체할 기술로는 [Grafana Alloy](https://grafana.com/docs/alloy/latest/)가 있습니다.


---


## Promtail 아키텍처 개요


Promtail이 어떻게 동작하는지 전체 흐름을 살펴보자.


### 1. 로그 소스 (Log Source)


Promtail은 다음과 같은 로그를 수집할 수 있다.

- 서버의 파일 로그 (`/var/log/*.log`)
- Docker 컨테이너 로그
- Kubernetes Pod 로그
- systemd journal
- 표준 출력(stdout) 로그

특히 Kubernetes 환경에서 많이 사용된다고 한다.


### 2. **Promtail (수집 및 가공)**


Promtail의 주요 역할은 다음과 같다.

1. 로그 파일 감시 (tail)
2. 로그 파싱
3. Label 추가
4. Loki로 Push 전송

Prometheus가 메트릭을 Pull 방식으로 수집하는 것과 달리,


Promtail은 로그를 **Push 방식**으로 Loki에 전송한다.


### 3. Loki 서버로 전송


Promtail은 수집한 로그를 HTTP API를 통해 Loki에 전송한다.


이때 Promtail은 다음과 같은 기능을 수행한다.

- Label 기반으로 로그를 그룹화
- 배치 단위로 압축 전송
- 재시도 로직 내장 (네트워크 장애 대비)

---


## Promtail 설정 구조


Promtail은 `promtail.yaml` 설정 파일을 기반으로 동작한다.


기본 구조는 다음과 같다.


```json
server:
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://localhost:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: varlogs
          __path__: /var/log/*.log
```


구성 요소를 자세히 살펴보자.


### server

- Promtail 자체 HTTP 서버 설정
- 헬스 체크 및 메트릭 노출

### positions

- 어디까지 로그를 읽었는지 저장
- 재시작 시 이어서 읽기 가능

### clients

- 로그를 전송할 Loki 서버 주소

### scrape_configs

- 어떤 로그를 수집할지 정의
- Prometheus와 유사한 설정 구조

---


## 왜 Promtail에 HTTP 서버가 필요할까?


Promtail은 단순히 로그만 보내는 프로그램이 아니라,


**자기 상태를 외부에 노출하는 역할**도 한다.


### 1. 헬스 체크 (Health Check)


Promtail은 다음과 같은 엔드포인트를 제공한다.


```yaml
http://localhost:9080/ready
```

- 준비 상태 확인
- 컨테이너 헬스 체크 용도

### 2. **Prometheus 메트릭 노출**


Promtail도 메트릭을 가진다.

- 수집한 로그 개수
- 전송 실패 횟수
- 재시도 횟수
- 현재 큐에 쌓인 로그 수

이 메트릭은 다음 경로에서 확인 가능하다.


```yaml
http://localhost:9080/metrics
```


이걸 Prometheus가 scrape할 수 있다.


---


## **Pipeline Stages (로그 가공 단계)**


Promtail의 강력한 기능 중 하나는 **Pipeline Stage**이다.


로그를 Loki로 보내기 전에 가공할 수 있다.


예시:


```yaml
pipeline_stages:
  - json:
      expressions:
        level: level
        message: msg
  - labels:
      level:
  - timestamp:
      source: time
      format: RFC3339
```


가능한 처리 작업은 다음과 같다.

- JSON 파싱
- 정규식 추출
- 특정 필드 Label 변환
- 타임스탬프 재설정
- 로그 필터링

즉, Promtail은 단순 수집기가 아니라 


**경량 로그 처리 파이프라인 엔진** 역할도 수행한다.


---


## Promtail의 장점

1. **가볍고 단순함**
    - 리소스 사용량 낮음
    - 설치 및 설정 간단
2. **Loki와 완벽한 통합**
    - Label 기반 모델 공유
    - 자동 재시도 및 배치 처리

---


## 정리

- Promtail은 **Loki에 로그를 전달하는 에이전트**이다.
- 로그를 수집하고, 가공하고, Label을 붙여 전송한다.
- 자체 저장 기능은 없다.
- Loki 스택에서 **로그 수집 담당 컴포넌트**이다.
