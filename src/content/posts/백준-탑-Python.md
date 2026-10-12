---
title: "[백준] 탑 (Python)"
description: "bookmark"
date: 2026-02-21
---

[https://www.acmicpc.net/problem/2493](https://www.acmicpc.net/problem/2493)


## 문제 설명

- 왼쪽으로 레이저를 쏘는 각 탑에 대해, 자기보다 왼쪽에 있으면서 가장 먼저 만나는 더 높은 탑의 번호를 구하는 문제

![image.png](/posts/attachments/%EB%B0%B1%EC%A4%80-%ED%83%91-Python/img-01.png)


## 예제 입력/출력

- 예제 입력 1

    ```python
    5
    6 9 5 7 4
    ```

- 예제 출력 1

    ```python
    0 0 2 2 4
    ```


## 제약 조건

- $1 ≤ N ≤ 500,000$
- $1 ≤ h ≤ 100,000,000$

## 문제 풀이


### 1️⃣ 브루트 포스로 문제를 해결할 수 있을까?

- 각 탑에 대해 자기보다 왼쪽에 있는 탑들을 모두 탐색해서 가장 먼저 만나는 더 높은 탑의 번호를 구하는 방법
- 왼쪽에 그런 탑이 없다면 0 출력
- 최악의 경우 $O(N^2)$ 의 시간이 소요되기 때문에 제한 시간내에 해결할 수 없음.

### 2️⃣ 어차피 나보다 낮은 탑은 앞으로도 쓸모 없다.

- 내가 어떤 탑 A보다 더 높다면 A는 내 레이저도 못 막고 앞으로 오는 더 오른쪽 탑들의 레이저도 막지 못한다. (왜? 나라는 더 높은 벽이 이미 생겼으니까)

### 3️⃣ 스택을 이용해 “쓸모 있는 탑”만 관리하자

- 왼쪽 탑들 중에서 <u>**현재 탑의 레이저를 막을 가능성이 있는 탑들만**</u> 스택에 남긴다.
- 스택은 항상 높이가 큰 → 작은 순이 되도록 유지한다.

### 4️⃣ 처리 과정 (왼쪽 → 오른쪽 순회)

- 현재 탑의 높이를 `h`라고 할 때
    1. 스택의 맨 위 탑이 `h`보다 낮다면 앞으로도 수신 탑이 될 수 없으므로 `pop` → 이 과정을 반복
    2. pop이 끝난 뒤
        - 스택이 비어 있다면 왼쪽에 나보다 높은 탑이 없다는 뜻이므로 0 저장
        - 스택이 비어 있지 않다면 스택의 맨 위 탑이 가장 가까운 더 높은 탑이므로 그 번호 저장
    3. 현재 탑 `(번호, 높이)`를 스택에 `push`

### **⏱ 시간 복잡도**

- 각 탑은 한 번 `push`
- 많아야 한 번 `pop`
- 따라서 전체 연산은 $O(N)$

## 풀이 코드


```python
import sys

def sys_input() -> str:
    return sys.stdin.readline().rstrip()


def solve(n: int) -> list[int]:
    arr = list(map(int, sys_input().split()))
    result = [0] * n

    stack = [] # (인덱스, 높이) 형태로 저장
    for i, h in enumerate(arr):
        while stack and h > stack[-1][1]:
            stack.pop()
        result[i] = stack[-1][0] if stack else 0
        stack.append((i + 1, h))

    return result


def main() -> None:
    N = int(sys_input())
    answer = solve(N)
    print(*answer)


if __name__ == "__main__":
    main()
```
