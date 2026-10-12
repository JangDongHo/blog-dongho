---
title: "GCP e2-small 스왑 메모리 설정하기 (e2-small 메모리 늘리기)"
description: "---"
date: 2024-12-31
---

# 😥 문제


---

- GCP의 **e2-micro** 인스턴스를 사용하고 있는데, 램 메모리가 **1GB**밖에 되지 않아 서버를 빌드하고 배포하는 도중 메모리 부족 현상으로 서버가 다운되는 문제 발생

# 🧐 원인


---

- GCP의 프리티어 `e2-micro`를 사용하고 있는데 램 메모리가 1GB 밖에 되지 않기 때문에 메모리가 부족한 현상
- GCP Compute Engine 무료 조건
<details>
<summary>다음 미국 내 리전 중 한 곳에서 비선점형 `e2-micro` VM 인스턴스 1개</summary>

- 오리건: `us-west1`
- 아이오와: `us-central1`
- 사우스캐롤라이나: `us-east1`

</details>

    - 30GB/월 표준 영구 디스크

# 😎 해결 방법


---


## 1. GCP 인스턴스 유형 변경

- 돈을 써서 인스턴스 유형을 **e2-small** 또는 더 높은 사양으로 변경하여 메모리 문제를 해결하는 방법
- 하지만, 이 방법은 비용이 증가할 수 있고, 단기적으로만 해결되는 경우이기 때문에 다른 대안을 찾아야 했다.

## 2. 스왑 메모리 설정

- `e2-micro` 인스턴스의 메모리는 1GB로 애플리케이션을 배포하기에는 부족
- 따라서, 디스크 공간을 임시 메모리로 사용하여 부족한 메모리 용량을 확장

### 1. **swapfile** 생성


```bash
sudo fallocate -l 4G /swapfile
```

<details>
<summary>저장공간 확인하기</summary>

```shell
df -h
```


|        | Filesystem | Size | Used     | Avail  | Use% | Mounted on |
| ------ | ---------- | ---- | -------- | ------ | ---- | ---------- |
| Before | /dev/root  | 30G  | **5.8G** | 24G    | 21%  | /          |
| After  | /dev/root  | 30G  | **9.8G** | 20G    | 34%  | /          |


</details>


### 2. **swapfile 권한 설정**


```bash
sudo chmod 600 /swapfile
```


### 3. swap 공간 생성


```python
sudo mkswap /swapfile
```

- **mkswap**: Make Swap의 약자로 스왑 파티션이나 스왑 파일을 생성하는 명령어
<details>
<summary>Output</summary>

```bash
Setting up swapspace version 1, size = 4 GiB (4294963200 bytes)
no label, UUID=dd9a48f1-...
```


</details>


### 4. **swapfile 스왑 메모리 추가**


```bash
sudo swapon /swapfile
```


### 5. **swap 파일시스템 설정**

- **시스템 부팅 시마다 자동으로 활성화**되도록 파일시스템을 수정

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```


### 6. **free 명령어로 메모리 상태 확인**

- 스왑 메모리로 4GB가 할당된 모습을 확인

```bash
free -h
```


![image.png](/posts/attachments/GCP-e2-small-%EC%8A%A4%EC%99%91-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0-e2-small-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EB%8A%98%EB%A6%AC%EA%B8%B0/img-01.png)


## 3. 스왑 메모리 삭제

- 추후에 스왑 메모리를 삭제해야 할 수도 있어서 메모리에 삭제에 관한 부분도 기록 해둔다.

### 1. swapfile 비활성화


```bash
sudo swapoff -v /swapfile
```


### 2. free 명령어로 메모리 상태 확인

- 스왑 메모리가 삭제된 모습을 확인

```bash
free -h
```


![image.png](/posts/attachments/GCP-e2-small-%EC%8A%A4%EC%99%91-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0-e2-small-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EB%8A%98%EB%A6%AC%EA%B8%B0/img-02.png)


### 3. `/etc/fstab` 파일에서 스왑 파일 entry를 제거

- `/swapfile none swap sw 0 0` 부분을 제거하거나 주석 처리

```bash
sudo vi /etc/fstab
```


![image.png](/posts/attachments/GCP-e2-small-%EC%8A%A4%EC%99%91-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0-e2-small-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EB%8A%98%EB%A6%AC%EA%B8%B0/img-03.png)


### 4. swapfile 삭제


```bash
sudorm /swapfile
```


# 😎 논의


---

- 저장 공간 많이 안 쓰면 무조건 크게 잡는게 이득 아닌가?
- gcp 권장 스왑 공간은?

## 참고 문헌


[https://velog.io/@dongkyun0713/GDGoC-GCP%EB%A1%9C-%EC%8A%A4%ED%94%84%EB%A7%81-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EB%B0%B0%ED%8F%AC%ED%95%98%EA%B8%B0](https://velog.io/@dongkyun0713/GDGoC-GCP%EB%A1%9C-%EC%8A%A4%ED%94%84%EB%A7%81-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EB%B0%B0%ED%8F%AC%ED%95%98%EA%B8%B0)


[https://diary-developer.tistory.com/32](https://diary-developer.tistory.com/32)


[https://uzzam.dev/40](https://uzzam.dev/40)
