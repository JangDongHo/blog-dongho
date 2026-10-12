---
title: "[프로그래머스] 지게차와 크레인 (Python)"
description: "bookmark"
date: 2026-01-25
---

[https://school.programmers.co.kr/learn/courses/30/lessons/388353](https://school.programmers.co.kr/learn/courses/30/lessons/388353)


## 문제 설명

- 물류 창고에서 **지게차**와 **크레인**을 이용해 출고할 컨테이너를 다 꺼냈을 때, **남은 컨테이너의 수**를 구하는 문제

## 예제 입력/출력


| storage                              | requests                       | result |
| ------------------------------------ | ------------------------------ | ------ |
| ["AZWQY", "CAABX", "BBDDA", "ACACA"] | ["A", "BB", "A"]               | 11     |
| ["HAH", "HBH", "HHH", "HAH", "HBH"]  | ["C", "B", "B", "B", "B", "H"] | 4      |


## 제약 조건

- 2 ≤ `storage` 의 길이 ≤ 50
    - 2 ≤ `storage[0]` 의 길이 ≤ 50
- 1 ≤ `requests` 의 길이 ≤ 100
    - `requests[i]`의 길이가 1: **지게차**를 이용한 출고 요청
    - `requests[i]`의 길이가 2: **크레인**을 이용한 출고 요청

## 문제 풀이


### 1️⃣ 출고 방법 파악

- 출고 방법에는 크게 지게차와 크레인이 존재한다.
- 크레인의 경우 컨테이너의 위치와 관계 없이 출고가 가능하다.
- 반면에 지게차의 경우 컨테이너의 위치가 외부와 연결돼있어야 출고가 가능하다.

### 2️⃣ 전체 흐름 (메인 함수)

- 먼저 `storage`를 2차워 배열로 변환해 `grid`에 저장한다.
- 메인 함수에서는 요청을 순차적으로 처리하면서, 요청 길이에 따라 **지게차 혹은 크레인**을 선택해 실행한다.
- 모든 요청을 처리한 후에는 남은 컨테이너 개수를 반환한다.

```python
def solution(storage, requests):
    grid = [list(row) for row in storage]

    for req in requests:
        if len(req) == 1:
            forklift(grid, req)
        else:
            crane(grid, req[0])

    # 남은 컨테이너 개수
    count = 0
    for col in grid:
        for row in col:
            if row != '.':
                count += 1
    
    return count
```


### 3️⃣ 크레인

- 크레인은 2차원 배열을 모두 순회하며 내가 찾고자 하는 컨테이너인지를 확인하고 꺼낸다.
- 이 경우 시간 복잡도는 $O(n \cdot m)$ 으로, 최악의 경우 2,500번의 탐색이 필요하다.

```python
def crane(grid, target):
    n, m = len(grid), len(grid[0])
    for i in range(n):
        for j in range(m):
            if grid[i][j] == target:
                grid[i][j] = '.'
```


### 4️⃣ 지게차

- 지게차는 조금 까다로운게 내가 꺼내고자 하는 컨테이너가 외부와 연결돼있어야 한다.
- 여기서 외부와 연결돼있는다는 의미는 다음과 같다.
    1. 2차원 배열의 가장자리에 해당 컨테이너가 위치한 경우
    2. 가장자리에 위치해 있지는 않지만, 인접한 방향 중 하나라도 외부와 이어진 통로(`.`)가 존재하는 경우
- 이를 판단하기 위해,
    - 배열의 가장자리부터 시작하여 `.` 칸만을 따라 BFS로 외부와 이어진 통로인지 판별하고,
    - 이후, 제거 대상 컨테이너가 외부와 이어진 통로와 인접해 있는지를 확인하여 제거 여부를 결정한다.

```python
# 외부 통로와 연결돼있는지 체크용
visited = [[False]*m for _ in range(n)]
q = deque()

# 테두리에 있는 '.'을 시작으로 외부와 연결돼있는지 체크 시작 (bfs)
for i in range(n):
    for j in range(m):
        if i == 0 or i == n-1 or j == 0 or j == m-1:
            if grid[i][j] == '.':
                visited[i][j] = True
                q.append((i, j))
```

- 테두리에 있는 `.` 을 시작으로 외부와 연결돼있는지 체크를 시작한다.
- `bfs` 를 위해 가장자리에 `.` 이 있다면 탐색을 이어나가기 위해 큐에 추가해준다.

```python
# 외부와 연결된 모든 '.' 영역 탐색 (내부에 갇힌 '.'은 제외)
dirs = [(1,0), (-1,0), (0,1), (0,-1)]
while q:
    x, y = q.popleft()
    for dx, dy in dirs:
        nx, ny = x + dx, y + dy
        if 0 <= nx < n and 0 <= ny < m:
            if not visited[nx][ny] and grid[nx][ny] == '.':
                visited[nx][ny] = True
                q.append((nx, ny))
```

- 큐가 빌 때까지 외부와 연결된 모든 `.` 영역을 탐색한다.

```python
# 외부와 맞닿아있는 target 컨테이너만 제거
for i in range(n):
    for j in range(m):
        if grid[i][j] == target:
            for dx, dy in dirs:
                ni, nj = i + dx, j + dy
                # 가장자리 밖이거나, 외부와 연결된 통로와 맞닿아 있는 경우
                if not (0 <= ni < n and 0 <= nj < m) or visited[ni][nj]:
                    grid[i][j] = '.'
                    break
```

- BFS 를 통해 `visited` 로 외부와 연결된 통로(`.`) 영역을 모두 표시해두었기 때문에, 제거 대상 컨테이너(`target`)가 해당 외부 통로와 인접해 있는지만 확인하면 된다.
- 컨테이너의 상하좌우 중 하나라도 가장자리 바깥이거나, `visited`가 `True`인 위치가 존재한다면 외부에서 지게차로 접근이 가능한 상태이므로 제거가 가능하다.
- 지게차도 크레인과 마찬가지로 최악의 경우 전체 탐색을 하기에 $O(n * m)$ 시간 복잡도가 소요된다.

## 풀이 코드


![image.png](/posts/attachments/%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%A8%B8%EC%8A%A4-%EC%A7%80%EA%B2%8C%EC%B0%A8%EC%99%80-%ED%81%AC%EB%A0%88%EC%9D%B8-Python/img-01.png)


```python
from collections import deque

def crane(grid, target):
    n, m = len(grid), len(grid[0])
    for i in range(n):
        for j in range(m):
            if grid[i][j] == target:
                grid[i][j] = '.'


def forklift(grid, target):
    n, m = len(grid), len(grid[0])
    
    # 외부 통로와 연결돼있는지 체크용
    visited = [[False]*m for _ in range(n)]
    q = deque()

    # 테두리에 있는 '.'을 시작으로 외부와 연결돼있는지 체크 시작 (bfs)
    for i in range(n):
        for j in range(m):
            if i == 0 or i == n-1 or j == 0 or j == m-1:
                if grid[i][j] == '.':
                    visited[i][j] = True
                    q.append((i, j))

    # 외부와 연결된 모든 '.' 영역 탐색 (내부에 갇힌 '.'은 제외)
    dirs = [(1,0), (-1,0), (0,1), (0,-1)]
    while q:
        x, y = q.popleft()
        for dx, dy in dirs:
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < m:
                if not visited[nx][ny] and grid[nx][ny] == '.':
                    visited[nx][ny] = True
                    q.append((nx, ny))

    # 외부와 맞닿아있는 target 컨테이너만 제거
    for i in range(n):
        for j in range(m):
            if grid[i][j] == target:
                for dx, dy in dirs:
                    ni, nj = i + dx, j + dy
                    # 이미 외부이거나, 외부와 통로가 이어져있는 경우
                    if not (0 <= ni < n and 0 <= nj < m) or visited[ni][nj]:
                        grid[i][j] = '.'
                        break

def solution(storage, requests):
    grid = [list(row) for row in storage]

    for req in requests:
        if len(req) == 1:
            forklift(grid, req)
        else:
            crane(grid, req[0])

    # 남은 컨테이너 개수
    count = 0
    for col in grid:
        for row in col:
            if row != '.':
                count += 1
    
    return count
```
