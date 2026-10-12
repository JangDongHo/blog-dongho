---
title: "[프로그래머스] 서버 증설 횟수 (JavaScript)"
description: "bookmark"
date: 2026-01-08
---

[https://school.programmers.co.kr/learn/courses/30/lessons/389479](https://school.programmers.co.kr/learn/courses/30/lessons/389479)


## 문제 설명

- 하루(0~23시) 동안 시간대별 게임 이용자 수가 주어질 때, 서버 한 대가 `m`명을 처리하고 증설된 서버가 `k`시간 유지된다는 조건하에 모든 이용자를 감당하기 위한 **최소 서버 증설 횟수**를 구하는 문제

## 예제 입력/출력


| players                                                                      | m | k | result |
| ---------------------------------------------------------------------------- | - | - | ------ |
| [0, 2, 3, 3, 1, 2, 0, 0, 0, 0, 4, 2, 0, 6, 0, 4, 2, 13, 3, 5, 10, 0, 1, 5]   | 3 | 5 | 7      |
| [0, 0, 0, 10, 0, 12, 0, 15, 0, 1, 0, 1, 0, 0, 0, 5, 0, 0, 11, 0, 8, 0, 0, 0] | 5 | 1 | 11     |
| [0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 5, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1]     | 1 | 1 | 12     |


## 제약 조건

- `players` 의 길이 = 24
    - 0 ≤ `players`의 원소 ≤ 1,000
    - `players[i]` = `i`시 ~ `i+1`시 사이의 게임 이용자 수
- 1 ≤ `m` ≤ 1,000
- 1 ≤ `k` ≤ 24

## 문제 풀이


### 서버 운영 규칙

- 서버는 증설한 시점부터 `k`시간 동안 운영된다.
    - `t`시에 증설한 서버 → `[t, t + k)` 시간대에만 사용 가능하다.
- 운영 시간이 끝나면 서버는 자동 반납된다.

### 그리디

- 각 시간 `t`에서 필요한 서버 수는 다음과 같다.

    ```javascript
    필요한 서버 수 = Math.floor(players[t] / m)
    ```

- 서버가 부족해지는 순간에만 최소한으로 증설하면 어떨까?
    - 현재 운영 중인 서버 수 ≥ 필요한 서버 수

        → 아무것도 하지 않는다.

    - 현재 운영 중인 서버 수 < 필요한 서버 수

        **→ 부족한 만큼 즉시 서버를 증설한다.**


### 시뮬레이션

- 나는 하루를 **0시부터 23시까지 순서대로 시뮬레이션**했다.
    1. 현재 운영 중인 서버 수를 확인한다.
    2. 필요한 서버 수를 계산한다.
    3. 부족하면 그만큼 서버를 증설한다. (그리디)
    4. 증설한 서버는 이후 `k`시간 동안 반영한다.
- 이렇게 하면 **매 시간대의 조건을 만족**하면서도 **서버 증설 횟수를 최소로 유지**할 수 있다.

## 풀이 코드


```javascript
function solution(players, m, k) {
    let scaleUpCount = 0;
    
    // activeServers[t]: t 시간에 운영 중인 서버 수
    const activeServers = Array(24).fill(0);
    
    // 시뮬레이션
    for (let hour = 0; hour < players.length; hour++) {
        const running = activeServers[hour];
        const required = Math.floor(players[hour] / m);
        const toAdd = required - running;
        
        // 운영 중인 서버 < 필요한 서버
        if (toAdd > 0) {
            for (let h = hour; h < Math.min(hour + k, players.length); h++) {
                activeServers[h] += toAdd;
            }
            scaleUpCount += toAdd;
        }
    }
    
    return scaleUpCount;
}
```
