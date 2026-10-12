---
title: "NestJS 로그 기반 모니터링 시스템 구축 (Promtail, Grafana Loki)"
description: "Grafana Loki 란 무엇일까? Promtail 이란 무엇일까?"
date: 2026-02-26
---

## 사전 지식

- [**Grafana Loki 란 무엇일까?**](https://dongho-blog.kro.kr/posts/3135ca9b-265e-8018-9a9e-e1d08bc02506)
- [**Promtail 이란 무엇일까?**](https://dongho-blog.kro.kr/posts/3135ca9b-265e-8005-8ff4-f321aca4de60)

## 목표

- Loki(로그 저장/조회) + Promtail(로그 수집/전송) + Grafana(조회 UI) 구성
- 도커 컨테이너 로그 파일을 Promtail이 읽어서 Loki로 전송
- Grafana에서 LogQL로 조회
- (옵션) Prometheus가 Loki/Promtail 메트릭을 스크랩해서 모니터링

## Grafana Loki 환경 세팅


### 단일 노드용 `loki.yml` 설정


```yaml
auth_enabled: false

server:
  http_listen_port: 3100
```

- `auth_enabled`: Loki가 요청을 받을 때 인증을 요구할지 여부
- `http_listen_port`: Loki HTTP API가 열리는 포트

```yaml
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
```

- `path_prefix`: Loki가 데이터를 저장할 “루트 디렉토리”

    ```yaml
    /loki
     ├── chunks
     ├── index
     ├── rules
     └── compactor
    ```

    - Docker에서는 반드시 volume으로 유지해야 함:
- `storage (filesystem)`
    - `chunks_directory`: 실제 로그 데이터가 저장되는 위치
    - `rules_directory`: Alerting / Recording Rule 저장 위치
- `replication_factor`: 로그를 몇 개 복제해서 저장할지
- `ring:` Loki 분산 해시 구조 설정
    - `store: inmemory`: ring 정보를 메모리에만 저장

```yaml
schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: filesystem
      schema: v13
      index:
        prefix: index_
        period: 24h
```

- `schema_config`: Loki가 로그를 어떤 구조로 저장할지 정의하는 버전 관리 설정
    - Loki는 시간이 지나면서 저장 구조가 바뀌어옴.
    - 그래서 언제부터 어떤 스키마를 쓸지 지정하는 방식
- `from`: 이 날짜 이후 들어오는 로그부터 이 스키마 적용
- `store`: 어떤 저장 엔진을 사용할지 (요즘은 TSDB 모드가 기본/권장)
- `object_store:` chunk 데이터를 어디에 저장할지
- `schema`: Loki 내부 데이터 포맷 버전
- `index`: Loki 인덱스 설정
    - `prefix`: 인덱스 파일 이름 앞에 붙는 접두어 (예: `index_2024-02-26`)
    - `period`: 인덱스를 며칠 단위로 나눌지

```yaml
limits_config:
  reject_old_samples: true
  reject_old_samples_max_age: 2160h
  retention_period: 2160h
```

- `reject_old_samples`: 오래된 로그를 받을지 말지 설정
- `reject_old_samples_max_age`: “얼마나 오래된 로그까지 허용할지” 기준 시간 (수집할 때 기준)
- `retention_period`: 저장된 로그를 얼마나 오래 보관할지

```yaml
compactor:
  working_directory: /loki/compactor
  retention_enabled: true
  compaction_interval: 1h
  delete_request_store: filesystem
```

- `working_directory`: 삭제 작업을 위한 임시 처리 공간
- `retention_enabled`: retention_period 설정 on/off
- `compaction_interval`: 정리 작업을 얼마나 자주 돌릴지
- `delete_request_store`: 삭제 요청(Deletion Request)”을 어디에 저장할지 정하는 설정

## Promtail 환경 세팅


### `promtail.yml` 설정


```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push
```

- `server`:
    - `grpc_listen_port`: Promtail의 HTTP 서버 포트 (메트릭 `/metrics`, 헬스 체크 등 확인용)
    - `grpc_listen_port`: gRPC 서버 포트 (일반 Loki 연동에선 필요 없음 / 비활성화 = 0)
- `positions.filename`: 로그를 어디까지 읽었는지 기록하는 체크포인트 파일 (중복 수집 방지)
- `clients.url`: 수집한 로그를 전송할 Loki 서버 API 주소

```yaml
scrape_configs:
  - job_name: docker

    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s

    relabel_configs:
      # 컨테이너 이름 정리 (/ 제거)
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: container

      # 이미지 이름 라벨 추가
      - source_labels: ['__meta_docker_container_image']
        target_label: image

      # compose 서비스명 (docker-compose 쓸 때 유용)
      - source_labels: ['__meta_docker_container_label_com_docker_compose_service']
        target_label: service

    pipeline_stages:
      - docker: {}
```

- `docker_sd_configs`: 현재 실행 중인 모든 컨테이너 자동 발견
    - `host`: Promtail이 Docker API에 접속할 경로
    - `refresh_interval`: Docker API를 주기적으로 조회해서 새로 생성되거나 종료된 컨테이너를 감지하는 주기
- `relabel_configs:` Docker 메타데이터 → Loki 라벨로 변환하는 과정
    - `source_labels`: 가져올 원본 메타데이터 라벨
    - `regex`: 정규식
    - `target_label`: Loki에 저장될 최종 라벨 이름
- `pipeline_stages`: Promtail이 로그를 Loki로 보내기 전에 가공(파싱, 필터링, 변환)하는 단계들의 모음
    - `docker`: Docker의 json-file 로그 형식을 자동으로 파싱해주는 단계

## Docker Compose 설정


### `dokcer-compose.yml`


```yaml
prometheus:
  image: prom/prometheus:v3.10.0
  ports:
    - '9090:9090'
  volumes:
    - ./infra/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus

loki:
  image: grafana/loki:3.6.0
  ports:
    - '3100:3100'
  volumes:
    - ./infra/loki/loki.yml:/etc/loki/local-config.yaml
    - loki_data:/loki

promtail:
  image: grafana/promtail:3.6.0
  ports:
    - '9080:9080'
  volumes:
    - ./infra/promtail/promtail.yml:/etc/promtail/config.yml
    - /var/run/docker.sock:/var/run/docker.sock
    - promtail_positions:/var/lib/promtail

grafana:
  image: grafana/grafana:12.3
  ports:
    - '3001:3000'
  environment:
    - GF_SECURITY_ADMIN_USER=${GF_SECURITY_ADMIN_USER}
    - GF_SECURITY_ADMIN_PASSWORD=${GF_SECURITY_ADMIN_PASSWORD}
    - GF_SERVER_ROOT_URL=${GF_SERVER_ROOT_URL}
    - GF_SERVER_SERVE_FROM_SUB_PATH=true
  volumes:
    - grafana_data:/var/lib/grafana
    - ./infra/grafana/provisioning/datasources:/etc/grafana/provisioning/datasources
    
volumes:
  prometheus_data:
  grafana_data:
  loki_data:
  promtail_positions:
```


## Loki - Grafana 연동


### Data Source 추가

1. 왼쪽 메뉴 → ⚙️ Settings
2. **Connections → Data Sources**
3. **Add data source**
4. **Loki 선택**

![image.png](/posts/attachments/NestJS-%EB%A1%9C%EA%B7%B8-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-Promtail-Grafana-Loki/img-01.png)


### **Loki URL 입력**


```yaml
http://loki:3100
```


![image.png](/posts/attachments/NestJS-%EB%A1%9C%EA%B7%B8-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-Promtail-Grafana-Loki/img-02.png)


### 로그 조회 테스트

1. 왼쪽 메뉴 → **Explore**
2. Data source → Loki 선택
3. 쿼리 입력:

```yaml
{service="nginx"}
```


![image.png](/posts/attachments/NestJS-%EB%A1%9C%EA%B7%B8-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-Promtail-Grafana-Loki/img-03.png)


## Prometheus가 Loki/Promtail 메트릭을 스크랩해서 모니터링


### `prometheus.yml` 파일 수정


```yaml
scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ['prometheus:9090']
    metrics_path: /metrics

  - job_name: app
    static_configs:
      - targets: ['app:3000']
    metrics_path: /api/metrics

  - job_name: loki
    static_configs:
      - targets: ['loki:3100']
    metrics_path: /metrics

  - job_name: promtail
    static_configs:
      - targets: ['promtail:9080']
    metrics_path: /metrics
```


`up` 쿼리로 메트릭 정상적으로 수집되는지 확인


![image.png](/posts/attachments/NestJS-%EB%A1%9C%EA%B7%B8-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-Promtail-Grafana-Loki/img-04.png)


## 참고 자료

- [**Docker Container Logging using Promtail**](https://gist.github.com/ruanbekker/c6fa9bc6882e6f324b4319c5e3622460)
