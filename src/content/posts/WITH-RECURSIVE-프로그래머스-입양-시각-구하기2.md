---
title: "[WITH RECURSIVE] 프로그래머스 - 입양 시각 구하기(2)"
description: "0부터 23시까지, 각 시간대별로 입양이 몇 건이나 발생했는지 조회하는 SQL을 작성하는 문제 - 다만, 특정 시간대에 입양이 발생하지 않았다면 해당 시간대도 결과에 포함되어야 하며, 건수는 0으로 표시되어야 한다."
date: 2025-03-01
tags:
  - DB
---

## 문제 설명

- 0부터 23시까지, **각 시간대별로 입양이 몇 건이나 발생했는지 조회**하는 SQL을 작성하는 문제
    - <u>_다만, 특정 시간대에 입양이 발생하지 않았다면 해당 시간대도 결과에 포함되어야 하며, 건수는 0으로 표시되어야 한다._</u>

## 예제 출력


| HOUR | COUNT |
| ---- | ----- |
| 0    | 0     |
| 1    | 0     |
| 2    | 0     |
| 3    | 0     |
| 4    | 0     |
| 5    | 0     |
| 6    | 0     |
| 7    | 3     |
| 8    | 1     |
| 9    | 1     |
| 10   | 2     |
| 11   | 13    |
| 12   | 10    |
| 13   | 14    |
| 14   | 9     |
| 15   | 7     |
| 16   | 10    |
| 17   | 12    |
| 18   | 16    |
| 19   | 2     |
| 20   | 0     |
| 21   | 0     |
| 22   | 0     |
| 23   | 0     |


## 문제 풀이

- **`접근`** **재귀적 CTE (Common Table Expression)**
    - 시간대가 없는 경우 0으로 채우기 위해 `WITH RECURSIVE`를 사용하여 0부터 23까지의 숫자를 생성한 후, `LEFT JOIN`을 활용하여 시간대가 없는 경우에도 0을 반환하도록 처리한다.
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
WITH RECURSIVE hours AS (
    SELECT 0 AS hour
    UNION ALL
    SELECT hour + 1 FROM hours WHERE hour < 23
)
SELECT h.hour AS HOUR, 
       COUNT(a.ANIMAL_ID) AS COUNT
FROM hours h
LEFT JOIN ANIMAL_OUTS a ON HOUR(a.DATETIME) = h.hour
GROUP BY h.hour
ORDER BY h.hour;
```


## 참고 자료


[https://dev.mysql.com/doc/refman/8.0/en/with.html#common-table-expressions-recursive](https://dev.mysql.com/doc/refman/8.0/en/with.html#common-table-expressions-recursive)


[https://school.programmers.co.kr/questions/11910?question=11910](https://school.programmers.co.kr/questions/11910?question=11910)


[https://huilife.tistory.com/42](https://huilife.tistory.com/42)
