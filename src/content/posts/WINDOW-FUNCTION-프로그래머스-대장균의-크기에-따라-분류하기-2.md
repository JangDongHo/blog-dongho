---
title: "[WINDOW FUNCTION] 프로그래머스 - 대장균의 크기에 따라 분류하기 2"
description: "대장균 개체의 크기를 내림차순으로 정렬했을 때 4분위로 나눠 개체의 ID와 해당 개체가 속하는 분류를 출력하는 문제 분류 기준: - CRITICAL: 상위 0% 25% - HIGH: 상위 26% 50% - MEDIUM: 상위 51% 75% - LOW: 상위 76% 100%"
date: 2025-03-06
---

## 문제 설명

- 대장균 개체의 크기를 내림차순으로 정렬했을 때 4분위로 나눠 개체의 ID와 해당 개체가 속하는 분류를 출력하는 문제
- 분류 기준:
    - **CRITICAL**: 상위 0% ~ 25%
    - **HIGH**: 상위 26% ~ 50%
    - **MEDIUM**: 상위 51% ~ 75%
    - **LOW**: 상위 76% ~ 100%

## 예제 입력/출력


### ECOLI_DATA


| ID | PARENT_ID | SIZE_OF_COLONY | DIFFERENTIATION_DATE | GENOTYPE |
| -- | --------- | -------------- | -------------------- | -------- |
| 1  | NULL      | 10             | 2019/01/01           | 5        |
| 2  | NULL      | 2              | 2019/01/01           | 3        |
| 3  | 1         | 100            | 2020/01/01           | 4        |
| 4  | 2         | 16             | 2020/01/01           | 4        |
| 5  | 2         | 17             | 2020/01/01           | 6        |
| 6  | 4         | 101            | 2021/01/01           | 22       |
| 7  | 6         | 101            | 2022/01/01           | 23       |
| 8  | 6         | 1              | 2022/01/01           | 27       |


### 출력


| ID | COLONY_NAME |
| -- | ----------- |
| 1  | MEDIUM      |
| 2  | LOW         |
| 3  | HIGH        |
| 4  | MEDIUM      |
| 5  | HIGH        |
| 6  | CRITICAL    |
| 7  | CRITICAL    |
| 8  | LOW         |


## 문제 풀이

- **`접근1`** **윈도우 함수 - RANK()**
    - 대장균 개체의 크기(`SIZE_OF_COLONY`)를 내림차순 정렬한 후, 각 개체의 순위를 매긴다.
    - 개체의 순위를 기준으로 상위 25%씩 4개 그룹(CRITICAL, HIGH, MEDIUM, LOW)으로 분류한다.
    - 같은 크기의 개체는 같은 순위를 가져야 하므로 `RANK()` 또는 `DENSE_RANK()`를 사용할 수 있다.
        - `RANK()`: 동일한 값이면 같은 순위를 부여하지만, 다음 순위를 건너뜀 (ex. 1, 2, 2, 4)
        - `DENSE_RANK()`: 동일한 값이면 같은 순위를 부여하고, 다음 순위를 건너뛰지 않음 (ex. 1, 2, 2, 3)
        - `ROW_NUMBER()`: 동일한 값이라도 무조건 개별 순위를 부여함 (ex. 1, 2, 3, 4)
    - **`RANK()`****와** **`COUNT()`** **활용하여 4분위 구하는 서브 쿼리**

        ```sql
        WITH RANKED AS (
            SELECT ID,
            RANK() OVER (ORDER BY SIZE_OF_COLONY DESC) AS RN,
            COUNT(*) OVER () AS TOTAL_COUNT
            FROM ECOLI_DATA
        )
        ```


        | ID | RN | TOTAL_COUNT |
        | -- | -- | ----------- |
        | 6  | 1  | 8           |
        | 7  | 2  | 8           |
        | 3  | 3  | 8           |

    - **`CASE`** **문을 활용하여 분위별로 그룹화하는 메인 쿼리**

        ```sql
        SELECT ID,
               CASE
                    WHEN RN <= TOTAL_COUNT * 0.25 THEN 'CRITICAL'
                    WHEN RN <= TOTAL_COUNT * 0.5 THEN 'HIGH'
                    WHEN RN <= TOTAL_COUNT * 0.75 THEN 'MEDIUM'
                    ELSE 'LOW'
                END AS COLONY_NAME
        FROM RANKED
        ```


        | ID | COLONY_NAME |
        | -- | ----------- |
        | 1  | MEDIUM      |
        | 2  | LOW         |
        | 3  | HIGH        |

- **`접근2`** **윈도우 함수 - PERCENT_RANK()**
    - `PERCENT_RANK()`는 현재 행의 값보다 작은 파티션 값의 백분율(0~1)을 반환한다.
        - 따라서, `TOTAL_COUNT * 0.25` 같은 추가 계산이 필요없기 때문에 쿼리문이 더 간결해진다.

        ```sql
        WITH RANKED AS (
            SELECT ID,
        				   RANK() OVER (ORDER BY SIZE_OF_COLONY DESC) AS RN,
        				   COUNT(*) OVER () AS TOTAL_COUNT
            FROM ECOLI_DATA
        )
        ```


## 풀이 코드

- **`접근1`** **윈도우 함수 - RANK()**

    ```sql
    WITH RANKED AS (
        SELECT ID,
    				   RANK() OVER (ORDER BY SIZE_OF_COLONY DESC) AS RN,
    				   COUNT(*) OVER () AS TOTAL_COUNT
        FROM ECOLI_DATA
    )
    SELECT ID,
           CASE
                WHEN RN <= TOTAL_COUNT * 0.25 THEN 'CRITICAL'
                WHEN RN <= TOTAL_COUNT * 0.5 THEN 'HIGH'
                WHEN RN <= TOTAL_COUNT * 0.75 THEN 'MEDIUM'
                ELSE 'LOW'
            END AS COLONY_NAME
    FROM RANKED
    ORDER BY ID
    ```

- **`접근2`** **윈도우 함수 - PERCENT_RANK()**

    ```sql
    WITH PERCENT_RANKED AS (
        SELECT ID,
               PERCENT_RANK() OVER (ORDER BY SIZE_OF_COLONY DESC) AS RN
        FROM ECOLI_DATA
    )
    SELECT ID,
           CASE
                WHEN RN <= 0.25 THEN 'CRITICAL'
                WHEN RN <= 0.5 THEN 'HIGH'
                WHEN RN <= 0.75 THEN 'MEDIUM'
                ELSE 'LOW'
            END AS COLONY_NAME
    FROM PERCENT_RANKED
    ORDER BY ID;
    ```


## 참고 자료


[https://dev.mysql.com/doc/refman/8.4/en/window-function-descriptions.html](https://dev.mysql.com/doc/refman/8.4/en/window-function-descriptions.html)


[https://chaemi720.tistory.com/369](https://chaemi720.tistory.com/369)
