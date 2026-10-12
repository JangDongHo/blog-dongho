---
title: "[백준] 회전하는 큐 (Python)"
description: "bookmark"
date: 2026-02-23
---

[https://www.acmicpc.net/problem/1021](https://www.acmicpc.net/problem/1021)


## 문제 설명

- 순환 큐에서 원하는 원소가 앞에 올 때까지 왼쪽/오른쪽 중 더 적게 움직이는 방향으로 회전시키는 과정을 반복해, 그 회전 횟수의 총합을 구하는 문제

## 예제 입력/출력

- 입력1

    ```plain text
    10 3
    1 2 3
    ```

- 출력1

    ```plain text
    0
    ```


## 제약 조건

- $1 ≤ N ≤ 50$
- $1 ≤ M < N$
- `targets`는 1부터 N까지의 서로 다른 정수

## 문제 풀이

- 이 문제의 핵심은 “원형 구조에서 특정 원소(`target`)를 맨 앞으로 가져오는 최소 이동 횟수를 반복적으로 구하는 문제” 이다.
- 여기서 `target`이란 이번 단계에서 반드시 꺼내야 하는 목표 원소를 의미한다.

### 1️⃣ 초기 상태

- 1부터 N까지의 원소가 순서대로 들어있는 원형 구조를 만든다.
- 목표는 주어진 순서대로 원소를 제거하는 것이다.
- 비용은 회전 연산(왼쪽/오른쪽)만 계산하고, 맨 앞 원소를 제거하는 연산은 비용에 포함되지 않는다.

### 2️⃣ 각 원소를 꺼내는 전략

- 각 target에 대해 다음 과정을 반복한다.
1. **현재 위치 파악**
    - 현재 원형 구조에서 target이 맨 앞(인덱스 0)에서 몇 칸 떨어져 있는지 파악한다.
    - 이 값을 `idx`라고 하자.
2. **두 방향 중 선택**
    - 원형 구조이기 때문에 두 가지 이동 방법이 존재한다.
        1. 왼쪽으로 이동한다.
        2. 오른쪽으로 이동한다.
    - 필요한 이동 횟수는 다음과 같다.
        - 왼쪽 이동 비용 = `idx`
        - 오른쪽 이동 비용 = `len(q) - idx`
3. **최소 비용 선택 (그리디)**
    - 두 이동 비용 중 더 적은 방향으로 회전한다.
    - 해당 이동 비용을 누적한다.
4. **`target`** **제거**
    - `target`이 맨 앞에 오면 제거한다.
    - 이 연산은 비용에 포함되지 않는다.
    - 그리고 다음 `target`으로 넘어가 위 과정을 반복한다.

### 3️⃣ 핵심 정리


이 문제는 다음 과정을 반복하는 시뮬레이션 문제다.

1. 목표 원소(target)의 현재 위치 계산
2. 원형 거리의 최소값 선택
3. 회전 후 제거
4. 누적 비용 계산

## 풀이 코드


```python
from collections import deque

import sys


def sys_input() -> str:
    return sys.stdin.readline().rstrip()


def solve(n: int, targets: list[int]) -> int:
    q = deque(range(1, n + 1))
    min_count = 0

    for t in targets:
        idx = q.index(t)

        if idx <= len(q) - idx:
            q.rotate(-idx)
            min_count += idx
        else:
            q.rotate(len(q) - idx)
            min_count += len(q) - idx

        q.popleft()

    return min_count


def main() -> None:
    N, _ = map(int, sys_input().split())
    targets = list(map(int, sys_input().split()))

    answer: int = solve(N, targets)
    print(answer)


if __name__ == "__main__":
    main()
```


### 참고

- `deque.rotate(k)`
    - `k > 0` → 오른쪽 회전
    - `k < 0` → 왼쪽 회전
- 위 코드는 아래 코드와 동일한 역할을 한다.

    ```python
    # 왼쪽 회전
    for _ in range(idx):
    		q.append(q.popleft())
    		
    # 오른쪽 회전
    for _ in range(idx):
    		q.appendleft(q.pop())
    ```
