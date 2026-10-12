---
title: "[백준] 16918 봄버맨 (Python)"
description: "bookmark"
date: 2026-02-06
---

[https://www.acmicpc.net/problem/16918](https://www.acmicpc.net/problem/16918)


## 문제 설명

- 폭탄을 설치해놓은 초기 상태가 주어졌을 때, N초가 흐른 후의 격자판 상태를 구하는 문제

## 예제 입력/출력

- 예제 입력 1

    ```python
    6 7 3
    .......
    ...O...
    ....O..
    .......
    OO.....
    OO.....
    ```

- 예제 출력 1

    ```python
    OOO.OOO
    OO...OO
    OOO...O
    ..OO.OO
    ...OOOO
    ...OOOO
    ```


## 제약 조건

- 

## 문제 풀이


### 1️⃣ 시뮬레이션


![image.png](/posts/attachments/%EB%B0%B1%EC%A4%80-16918-%EB%B4%84%EB%B2%84%EB%A7%A8-Python/img-01.png)


먼저 초 단위로 봄버맨이 어떤 행동을 하는지를 그림으로 그려보았다.

- 0초: 봄버맨이 일부 칸에 폭탄을 설치해 놓는다. (입력값)
- 1초: 아무 일도 일어나지 않는다.
- 2초: 빈 칸에

## 풀이 코드


```python
R, C, N = map(int, input().split())

grid = [list(input()) for _ in range(R)]
booms = [[-1] * C for _ in range(R)]

for r in range(R):
    for c in range(C):
        if grid[r][c] == 'O':
            booms[r][c] = 3

dx = [-1, 1, 0, 0]
dy = [0, 0, -1, 1]

for t in range(1, N + 1):

    # 1. 시간 감소
    for r in range(R):
        for c in range(C):
            if booms[r][c] != -1:
                booms[r][c] -= 1

    # 2. 짝수 초 → 설치
    if t % 2 == 0:
        for r in range(R):
            for c in range(C):
                if grid[r][c] == '.':
                    grid[r][c] = 'O'
                    booms[r][c] = 3

    # 3. 홀수 초 → 폭발 (폭발 위치 기억해뒀다가 한꺼번에 터뜨리기)
    else:
        explode = []
        for r in range(R):
            for c in range(C):
                if booms[r][c] == 0:
                    explode.append((r, c))

        for r, c in explode:
            booms[r][c] = -1
            grid[r][c] = '.'

            for d in range(4):
                nr = r + dx[d]
                nc = c + dy[d]

                if 0 <= nr < R and 0 <= nc < C:
                    booms[nr][nc] = -1
                    grid[nr][nc] = '.'

for r in range(R):
    print("".join(grid[r]))
```
