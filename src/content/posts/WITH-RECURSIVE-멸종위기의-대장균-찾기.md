---
title: "[WITH RECURSIVE] 멸종위기의 대장균 찾기"
description: "각 세대별 자식이 없는 개체의 수(COUNT)와 세대(GENERATION)를 출력하는 문제"
date: 2025-03-07
tags:
  - DB
---

## 문제 설명

- 각 세대별 자식이 없는 개체의 수(`COUNT`)와 세대(`GENERATION`)를 출력하는 문제

## 예제 출력


### ECOLI_DATA


| ID | PARENT_ID | SIZE_OF_COLONY | DIFFERENTIATION_DATE | GENOTYPE |
| -- | --------- | -------------- | -------------------- | -------- |
| 1  | NULL      | 10             | 2019/01/01           | 5        |
| 2  | NULL      | 2              | 2019/01/01           | 3        |
| 3  | 2         | 100            | 2020/01/01           | 4        |
| 4  | 2         | 16             | 2020/01/01           | 4        |
| 5  | 2         | 17             | 2020/01/01           | 6        |
| 6  | 4         | 101            | 2021/01/01           | 22       |
| 7  | 4         | 101            | 2022/01/01           | 23       |
| 8  | 6         | 1              | 2022/01/01           | 27       |


### 출력


| COUNT | GENERATION |
| ----- | ---------- |
| 1     | 1          |
| 2     | 2          |
| 1     | 3          |
| 1     | 4          |


## 문제 풀이

- **`접근`** **재귀적 CTE (Common Table Expression)**
    - 재귀적인 방법으로 세대(`GENERATION`)를 계산하고 자식이 없는 대장균을 찾는 방법
    - **표현식**

        ```sql
        WITH RECURSIVE 뷰_이름 AS
        (
        	SELECT ...      -- 초기 SQL
        	UNION ALL
        	SELECT ...      -- 반복할 SQL (반복을 멈출 WHERE절 포함)
        )
        ```

    - **예시**

        ```sql
        WITH RECURSIVE cte (n) AS
        (
          SELECT 1
          UNION ALL
          SELECT n + 1 FROM cte WHERE n < 5
        )
        SELECT * FROM cte;
        ```

        - 이 명령문을 실행하면 다음 결과가 생성 된다.

        ```sql
        +------+
        | n    |
        +------+
        |    1 |
        |    2 |
        |    3 |
        |    4 |
        |    5 |
        +------+
        ```

    - **동작 과정**
        - `SELECT 1`

            ```sql
            +------+
            | n    |
            +------+
            |    1 |
            +------+
            ```

        - `UNION ALL`
            - 앞으로 반복문을 실행하면서 나온 결과를 모두 합친다.
        - `SELECT n + 1 FROM cte WHERE n < 5`
            - n이 가지고 있는 직전 row set 값이 5보다 작을 때, n+1인 row set을 하나 만든다는 뜻
            - 첫번째 반복문에서는 n = 1이므로 반복문을 통해 아래의 row set이 생성

                ```sql
                +------+
                | n    |
                +------+
                |    2 |
                +------+
                ```

            - 이를 `UNION ALL` 하면 다음과 같아진다.

                ```sql
                +------+
                | n    |
                +------+
                |    1 |
                |    2 |
                +------+
                ```

            - 이걸 직전 row set 값이 4일때까지 반복하므로, 결과적으로 1~5값이 담긴 cte 뷰가 생성된다.

## 풀이 코드


```sql
-- 세대 계산 테이블
WITH RECURSIVE generations AS (
    -- 최초 부모가 없는 대장균 개체는 1세대
    SELECT ID, PARENT_ID, 1 AS GENERATION
    FROM ECOLI_DATA
    WHERE PARENT_ID IS NULL
    
    UNION ALL
    
    -- 재귀적으로 각 개체의 자식을 찾아 세대 계산
    SELECT e.ID, e.PARENT_ID, g.GENERATION + 1
    FROM ECOLI_DATA e
    JOIN generations g
    ON e.PARENT_ID = g.ID
)
SELECT COUNT(*) AS COUNT, G.GENERATION
FROM generations AS G
WHERE NOT EXISTS (
    -- 자식이 없는 개체들 탐색
    SELECT 1
    FROM ECOLI_DATA AS E
    WHERE E.PARENT_ID = G.ID
)
GROUP BY GENERATION
ORDER BY GENERATION
```


## 참고 자료


[https://dev.mysql.com/doc/refman/8.0/en/with.html#common-table-expressions-recursive](https://dev.mysql.com/doc/refman/8.0/en/with.html#common-table-expressions-recursive)
