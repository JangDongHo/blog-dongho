---
title: "NestJS 메트릭 기반 모니터링 시스템 구축 (prom-client, Prometheus, Grafana)"
description: "Grafana 란 무엇일까? Prometheus 란 무엇일까?"
date: 2026-02-25
---

## 사전 지식

- [**Grafana 란 무엇일까?**](https://dongho-blog.kro.kr/posts/3115ca9b-265e-8080-967b-dccd7f169a77)
- [**Prometheus 란 무엇일까?**](https://dongho-blog.kro.kr/posts/3115ca9b-265e-803a-9202-e2297c180be0)

## Prometheus 환경 세팅


### Prometheus 설정


`prometheus.yml`


```json
global:
  scrape_interval:     15s
  evaluation_interval: 15s

rule_files:
  # - "first.rules"
  # - "second.rules"

scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets: ['localhost:9090']
```

- 예제 구성 파일에는 세 가지 구성 블록이 있다.
1. **`global`****: 프로메테우스 서버의 글로벌 설정**
    - `scrape_interval`
        - 데이터를 수집하는 주기
        - Prometheus가 타겟에 가서 메트릭을 긁어오는 간격
        - 예시: 15초마다 서버에 가서 현재 CPU, 메모리 등의 값을 가져옴
    - `evaluation_interval`
        - 규칙을 계산하는 주기
        - 예시: "CPU가 80% 넘었나?”
2. **`rule_files`****: Prometheus 서버가 로드할 규칙의 위치를 지정**
    - 지금은 주석 처리
3. **`scrape_configs`****: Prometheus가 감시할 서버 목록**
    - 기본값은 Prometheus가 자기 자신을 모니터링
        - 왜냐? Prometheus 서버도 메트릭을 제공하는 HTTP 서버이기 때문 ([http://localhost:9090/metrics](http://localhost:9090/metrics))
    - Prometheus는 모든 타겟이 기본적으로 `/metrics` 경로에 메트릭을 노출한다고 가정

### 도커 컴포즈 설정


`docker-compose.yml`


```yaml
prometheus:
  image: prom/prometheus
  ports:
    - '9090:9090'
  volumes:
    - ./infra/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
```


**실행:**


```bash
docker compose up prometheus -d
```


### Prometheus UI 접속

- [http://localhost:9090/](http://localhost:9090/)

![image.png](/posts/attachments/NestJS-%EB%A9%94%ED%8A%B8%EB%A6%AD-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-prom-client-Prometheus-Grafana/img-01.png)


### **PromQL 테스트**

1. **수집 정상 여부 확인**

    ```bash
    up
    ```


    **결과:**


    ```bash
    up{job="prometheus", instance="localhost:9090"}  1
    ```

1. **Prometheus HTTP 요청 수**

    ```bash
    prometheus_http_requests_total
    ```


    **결과:**


    ![image.png](/posts/attachments/NestJS-%EB%A9%94%ED%8A%B8%EB%A6%AD-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-prom-client-Prometheus-Grafana/img-02.png)

1. **메모리 사용량**

    ```bash
    process_resident_memory_bytes
    ```


    **결과:**


    ![image.png](/posts/attachments/NestJS-%EB%A9%94%ED%8A%B8%EB%A6%AD-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-prom-client-Prometheus-Grafana/img-03.png)


## NestJS metrics 생성


[https://github.com/willsoto/nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus)


### 의존성 설치


```bash
npm install @willsoto/nestjs-prometheus prom-client
```


### AppModule 수정


```bash
import { Module } from "@nestjs/common";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";

@Module({
  imports: [PrometheusModule.register()],
})
export class AppModule {}
```


### 도커 컴포즈 설정


`docker-compose.yml`


```bash
app:
  volumes:
    - .:/app
    - /app/node_modules
  ports:
    - '3000:3000'
```


**실행:**


```bash
docker compose up app -d
```


### `/metrics` 엔드포인트 테스트

- [http://localhost:3000/metrics](http://localhost:3000/api/metrics)

```bash
# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total 3.92215

# ... 중략
```


### **Node.js 기본 메트릭(defaultMetrics)**

1. **프로세스(Process) 메트릭**

    | 메트릭                                | 현재 값        | 단위      | 의미               |
    | ---------------------------------- | ----------- | ------- | ---------------- |
    | `process_cpu_user_seconds_total`   | 3.92        | seconds | 사용자 영역 CPU 사용 시간 |
    | `process_cpu_system_seconds_total` | 1.20        | seconds | 시스템 영역 CPU 사용 시간 |
    | `process_cpu_seconds_total`        | 5.12        | seconds | 전체 CPU 사용 시간     |
    | `process_resident_memory_bytes`    | 130,191,360 | bytes   | 실제 물리 메모리 사용량    |
    | `process_virtual_memory_bytes`     | 925,908,992 | bytes   | 가상 메모리           |
    | `process_heap_bytes`               | 407,281,664 | bytes   | 힙 전체 크기          |
    | `process_open_fds`                 | 24          | count   | 열린 파일 디스크립터 수    |
    | `process_max_fds`                  | 1,048,576   | count   | 최대 허용 fd 수       |

1. **이벤트 루프(Event Loop) 상태**

    | 메트릭                                 | 값      | 단위      | 의미           |
    | ----------------------------------- | ------ | ------- | ------------ |
    | `nodejs_eventloop_lag_seconds`      | 0.0064 | seconds | 현재 이벤트 루프 지연 |
    | `nodejs_eventloop_lag_mean_seconds` | 0.0118 | seconds | 평균 지연        |
    | `nodejs_eventloop_lag_p99_seconds`  | 0.0154 | seconds | 99% 지연       |
    | `nodejs_eventloop_lag_max_seconds`  | 0.0517 | seconds | 최대 지연        |

1. **활성 리소스/핸들**

    | 메트릭                             | 값 | 의미                 |
    | ------------------------------- | - | ------------------ |
    | `nodejs_active_resources_total` | 7 | 현재 이벤트루프를 유지하는 리소스 |
    | `nodejs_active_handles_total`   | 5 | 활성 libuv 핸들        |
    | `nodejs_active_requests_total`  | 1 | 활성 요청 수            |

1. **힙 메모리 상태**

    | 메트릭                            | 값          | 단위    |
    | ------------------------------ | ---------- | ----- |
    | `nodejs_heap_size_total_bytes` | 50,823,168 | bytes |
    | `nodejs_heap_size_used_bytes`  | 46,498,680 | bytes |
    | `nodejs_external_memory_bytes` | 2,668,963  | bytes |

1. **GC (Garbage Collection)**

    | 종류          | 실행 횟수 | 총 소요 시간 |
    | ----------- | ----- | ------- |
    | minor       | 3회    | 0.019s  |
    | major       | 3회    | 0.079s  |
    | incremental | 3회    | 0.084s  |


### Prometheus - NestJS 연동


`prometheus.yml` 수정


```bash
scrape_configs:
  - job_name: prometheus
	  metrics_path: /metrics
    static_configs:
      - targets: ['prometheus:9090']

  - job_name: app
    metrics_path: /metrics
    static_configs:
      - targets: ['app:3000']
```


### **PromQL 테스트**

1. **수집 정상 여부 확인**

    ```bash
    up
    ```


    **결과:**


    ```bash
    up{job="app", instance="app:3000"}  1
    up{job="prometheus", instance="prometheus:9090"}  1
    ```

1. **NestJS 메트릭 수집 확인 (프로세스 메모리)**

    ```bash
    process_resident_memory_bytes{job="app"}
    ```


    ![image.png](/posts/attachments/NestJS-%EB%A9%94%ED%8A%B8%EB%A6%AD-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-prom-client-Prometheus-Grafana/img-04.png)

2. **NestJS CPU 사용량 추이(초당 증가량)**

    ```bash
    rate(process_cpu_seconds_total{job="app"}[1m])
    ```


    ![image.png](/posts/attachments/NestJS-%EB%A9%94%ED%8A%B8%EB%A6%AD-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-prom-client-Prometheus-Grafana/img-05.png)

1. **이벤트 루프 지연 확인 (ms 단위로 보기)**

    ```bash
    nodejs_eventloop_lag_p99_seconds{job="app"} * 1000
    ```


    ![image.png](/posts/attachments/NestJS-%EB%A9%94%ED%8A%B8%EB%A6%AD-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-prom-client-Prometheus-Grafana/img-06.png)


---


---


## Grafana 환경 세팅


### **도커 컴포즈 설정**


`docker-compose.yml`


```bash
grafana:
  image: grafana/grafana
  ports:
    - "3002:3000"
  volumes:
    - grafana_data:/var/lib/grafana
  depends_on:
    - prometheus

volumes:
  prometheus_data:
  grafana_data:
```


**실행:**


```bash
docker compose up grafana -d
```


### Grafana 접속

- [http://localhost:3002/](http://localhost:3002/)
    - ID: `admin`
    - PW: `admin`
- 첫 로그인 시 비밀번호 변경 화면이 뜰 수 있음.

![image.png](/posts/attachments/NestJS-%EB%A9%94%ED%8A%B8%EB%A6%AD-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-prom-client-Prometheus-Grafana/img-07.png)


### **Grafana - Prometheus 연동**


**Prometheus Data Source 추가**

1. Grafana 접속 → 왼쪽 메뉴 **Connections**(또는 톱니바퀴 Settings) → **Data sources**
2. **Add data source** → **Prometheus** 선택
3. URL 입력

    ```bash
    http://prometheus:9090
    ```

4. **Save & test**
    - docker-compose 네트워크 안에서 Grafana가 Prometheus를 접근할 때는 `localhost`가 아니라 서비스명(prometheus) 를 써야 함.
    - `Successfully queried the Prometheus API.` 안내 메시지가 뜨는지 확인

        ![image.png](/posts/attachments/NestJS-%EB%A9%94%ED%8A%B8%EB%A6%AD-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-prom-client-Prometheus-Grafana/img-08.png)


![image.png](/posts/attachments/NestJS-%EB%A9%94%ED%8A%B8%EB%A6%AD-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-prom-client-Prometheus-Grafana/img-09.png)


### Grafana 대시보드 확인


**Explore에서 쿼리 테스트**

- 왼쪽 메뉴 **Explore**에서 Prometheus 선택 후 아래 쿼리 실행

```bash
up
```


![image.png](/posts/attachments/NestJS-%EB%A9%94%ED%8A%B8%EB%A6%AD-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-prom-client-Prometheus-Grafana/img-10.png)


### 공개 대시보드 찾기

- [https://grafana.com/grafana/dashboards/](https://grafana.com/grafana/dashboards/)
- 여기서 검색창에 `node.js` 검색
- 원하는 디자인의 대시보드 페이지에 들어가면 Dashboard ID 가 있을텐데 기억해두기
    - 예: [https://grafana.com/grafana/dashboards/11159-nodejs-application-dashboard/](https://grafana.com/grafana/dashboards/11159-nodejs-application-dashboard/)

![image.png](/posts/attachments/NestJS-%EB%A9%94%ED%8A%B8%EB%A6%AD-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-prom-client-Prometheus-Grafana/img-11.png)


### **Node.js/NestJS 대시보드 불러오기**


Grafana는 Import로 공개 대시보드를 쉽게 가져올 수 있음

1. 왼쪽 메뉴 **Dashboards** → **New** → **Import**
2. Dashboard ID로 Import
    - 예시: 11159
3. `DB_PROMETHEUS`는 `prometheus` 선택

    ![image.png](/posts/attachments/NestJS-%EB%A9%94%ED%8A%B8%EB%A6%AD-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-prom-client-Prometheus-Grafana/img-12.png)


### 대시보드 확인


제대로 설정이 됐다면 아래와 같이 대시보드 화면이 잘 나오는 것을 볼 수 있음


![image.png](/posts/attachments/NestJS-%EB%A9%94%ED%8A%B8%EB%A6%AD-%EA%B8%B0%EB%B0%98-%EB%AA%A8%EB%8B%88%ED%84%B0%EB%A7%81-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%B6%95-prom-client-Prometheus-Grafana/img-13.png)


## 참고 자료

- [https://prometheus.io/docs/introduction/first_steps/](https://prometheus.io/docs/introduction/first_steps/)
- [https://grafana.com/docs/grafana/latest/fundamentals/getting-started/first-dashboards/](https://grafana.com/docs/grafana/latest/fundamentals/getting-started/first-dashboards/)
