---
title: "Grafana Loki 란 무엇일까?"
description: "이번 글에서는 로그 기반 모니터링 시스템인 오픈소스 프로젝트 Grafana Loki 에 대해 정리한다."
date: 2026-02-26
---

이번 글에서는 로그 기반 모니터링 시스템인 오픈소스 프로젝트 [**Grafana Loki**](https://grafana.com/oss/loki/) 에 대해 정리한다.


Loki는 서버, 컨테이너, 애플리케이션 등에서 발생하는 **로그(Log) 데이터**를 수집하고 저장하는 시스템이다.


Grafana와 함께 사용되는 경우가 많으며, 클라우드 네이티브 환경에서 **Prometheus와 짝을 이루는 로그 시스템**으로 자리 잡았다.


---


## Loki 아키텍처 개요


Loki가 어떻게 동작하는지 이해하기 위해 일반적인 로그 수집 구조를 살펴보자.


![이미지 출처: https://grafana.com/oss/loki/](/posts/attachments/Grafana-Loki-%EB%9E%80-%EB%AC%B4%EC%97%87%EC%9D%BC%EA%B9%8C/img-01.png)


### 1. 로그 수집기 (Promtail / Agent)


Loki에서 로그를 수집하는 에이전트로 가장 많이 사용되는 것은 [**Promtail**](https://grafana.com/docs/loki/latest/send-data/promtail/) 이다.


Promtail의 역할은 다음과 같다.

- 서버의 로그 파일 읽기
- Kubernetes Pod 로그 수집
- 로그에 Label 추가
- Loki 서버로 Push 전송

Prometheus가 Pull 방식인 것과 달리, 


Loki는 기본적으로 **Push 방식**을 사용한다.


### 2. Loki 서버


Loki 서버는 크게 다음 구성 요소로 나뉜다.

- **Distributor** → 로그 수신 및 분산
- **Ingester** → 로그 압축 및 저장
- **Querier** → 쿼리 처리
- **Object Storage** → S3, GCS 등에 로그 저장

![이미지 출처: https://engineering.fancode.com/open-source-log-aggregation-by-loki-dbf671dbee8d](/posts/attachments/Grafana-Loki-%EB%9E%80-%EB%AC%B4%EC%97%87%EC%9D%BC%EA%B9%8C/img-02.png)


### 3. Grafana (시각화)


Grafana는 Loki와 자연스럽게 통합된다.

- 로그 검색
- 로그 기반 대시보드
- 메트릭 + 로그 연계 분석
- 알림 설정 가능

Prometheus + Loki + Grafana 조합은


클라우드 네이티브 환경의 표준 스택으로 사용된다.


---


## Loki의 데이터 모델


Loki는 로그를 다음과 같은 구조로 저장한다.


![image.png](/posts/attachments/Grafana-Loki-%EB%9E%80-%EB%AC%B4%EC%97%87%EC%9D%BC%EA%B9%8C/img-03.png)


구성 요소를 살펴보자.

- **Timestamp**: 로그 발생 시간
- **Labels**: app, cluster
- **Content**: 실제 로그 문자열

Loki의 핵심 철학은 **Prometheus와 동일한 Label 기반 모델**이라고 한다.


즉, 메트릭과 로그가 동일한 방식으로 분류된다.


이 덕분에 메트릭과 로그 연계 분석이 가능하다는 장점이 있다.


또한, Loki의 가장 큰 특징은 **로그 전체를 인덱싱하지 않는다**는 것이다.


기존 로그 시스템(예: Elasticsearch 등)과 달리,


Loki는 **Label만 인덱싱**하고 실제 로그 본문은 압축 저장한다.


이 구조 덕분에 다음과 같은 장점을 가진다.

- 저장 비용 감소
- 운영 복잡도 감소
- 높은 확장성 확보

---


## Loki 기본 설정 구조


가장 단순한 예시부터 살펴보자.


```yaml
auth_enabled: false

server:
  http_listen_port: 3100

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: filesystem
      schema: v13
      index:
        prefix: index_
        period: 24h

storage_config:
  filesystem:
    directory: /loki/chunks

limits_config:
  reject_old_samples: true
  reject_old_samples_max_age: 168h
```


### 1. server


```yaml
server:
  http_listen_port: 3100
```

- Loki의 HTTP 서버 포트
- `/metrics`
- `/ready`
- `/loki/api/v1/push`
- `/loki/api/v1/query`

여기서 Promtail이 push하고, Grafana가 query한다.


### 2. common


공통 설정 블록이다.


```yaml
common:
  path_prefix: /loki
  replication_factor: 1
```

- 데이터 저장 기본 경로
- 복제 개수 설정
- ring(노드 간 분산 관리) 설정

이 설정은 분산 모드에서 매우 중요하다.


### 3. schema_config (**가장 중요 ⭐**)


Loki 저장 구조의 핵심 설정이다.


```yaml
schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: filesystem
      schema: v13
```

- 인덱스 저장 방식
- chunk 저장 방식
- 스키마 버전

### 4. storage_config


실제 로그 데이터 저장 위치를 정의한다.


**파일 시스템 저장 예시**


```yaml
storage_config:
  filesystem:
    directory: /loki/chunks
```


**S3 저장 예시**


```yaml
storage_config:
  aws:
    s3: s3://access_key:secret_key@region/bucket
```

- Loki는 S3, GCS, Azure Blob, Filesystem 모두 지원한다고 한다.

### 5. limits_config


운영에서 매우 중요한 설정이다.


```yaml
limits_config:
  ingestion_rate_mb: 8
  ingestion_burst_size_mb: 16
  max_query_length: 168h
```

- 초당 수신량 제한
- 쿼리 길이 제한
- 최대 스트림 개수 제한

---


## LogQL (Loki Query Language)


Loki는 자체 쿼리 언어인 **LogQL**을 제공한다.


LogQL은 PromQL과 유사하지만 로그 전용 기능이 추가되었다.


### 기본 로그 검색


```json
{app="backend", level="error"}
```


### 특정 문자열 포함 로그 검색


```json
{app="backend"} |= "timeout"
```


### 로그를 메트릭처럼 집계


최근 5분간 에러 로그 개수 계산:


```json
count_over_time({app="backend", level="error"}[5m])
```


LogQL은 다음 기능을 지원한다.

- Label 필터링
- 문자열 필터 (|=, !=, |~ 정규식)
- 로그 파싱 (json, regexp)
- 메트릭 변환 함수

---


## Loki에서 다루는 데이터 유형


Loki는 기본적으로 **로그(Log)** 만을 다룬다.


Prometheus와 비교하면 다음과 같다.


| 구분     | Prometheus | Loki              |
| ------ | ---------- | ----------------- |
| 데이터 유형 | 메트릭        | 로그                |
| 수집 방식  | Pull       | Push              |
| 저장 방식  | TSDB       | Label 인덱스 + 압축 로그 |
| 쿼리 언어  | PromQL     | LogQL             |


---


## Loki의 장점

1. **비용 효율적**
    - 전체 로그 인덱싱 X
    - 객체 스토리지 활용 가능
    - 대용량 로그 저장에 유리
2. **Prometheus와 자연스러운 통합**
    - 동일한 Label 기반 모델을 사용하기 때문에
        - 메트릭 → 해당 시점 로그 확인
        - 로그 급증 → 관련 메트릭 분석

---


## 정리

- Loki는 **로그 수집 및 저장 시스템**이다.
- 로그 전체가 아닌 **Label만 인덱싱**한다.
- LogQL을 통해 로그 검색 및 집계가 가능하다.
- Prometheus와 함께 사용하면 강력한 관측(Observability) 환경을 구축할 수 있다.
- Grafana와 통합하여 메트릭 + 로그를 동시에 분석할 수 있다.
