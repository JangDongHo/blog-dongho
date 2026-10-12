---
title: "[CASE WHEN THEN END] 프로그래머스 - 언어별 개발자 분류하기"
description: "DEVELOPERS 테이블에서 GRADE별 개발자의 정보를 조회하려 합니다. GRADE는 다음과 같이 정해집니다."
date: 2025-03-02
---

## 문제 설명


`DEVELOPERS` 테이블에서 GRADE별 개발자의 정보를 조회하려 합니다. GRADE는 다음과 같이 정해집니다.

    - A : Front End 스킬과 Python 스킬을 함께 가지고 있는 개발자
    - B : C# 스킬을 가진 개발자
    - C : 그 외의 Front End 개발자

GRADE가 존재하는 개발자의 GRADE, ID, EMAIL을 조회하는 SQL 문을 작성해 주세요.


결과는 GRADE와 ID를 기준으로 오름차순 정렬해 주세요.


## 예제 입력/출력


### SKILLCODES


| NAME       | CATEGORY  | CODE  |
| ---------- | --------- | ----- |
| C++        | Back End  | 4     |
| JavaScript | Front End | 16    |
| Java       | Back End  | 128   |
| Python     | Back End  | 256   |
| C#         | Back End  | 1024  |
| React      | Front End | 2048  |
| Vue        | Front End | 8192  |
| Node.js    | Back End  | 16384 |


### DEVELOPERS


| ID   | FIRST_NAME | LAST_NAME  | EMAIL                    | SKILL_CODE |
| ---- | ---------- | ---------- | ------------------------ | ---------- |
| D165 | Jerami     | Edwards    | jerami_edwards@grepp.co  | 400        |
| D161 | Carsen     | Garza      | carsen_garza@grepp.co    | 2048       |
| D164 | Kelly      | Grant      | kelly_grant@grepp.co     | 1024       |
| D163 | Luka       | Cory       | luka_cory@grepp.co       | 16384      |
| D162 | Cade       | Cunningham | cade_cunningham@grepp.co | 8452       |


### 출력


| GRADE | ID   | EMAIL                    |
| ----- | ---- | ------------------------ |
| A     | D162 | cade_cunningham@grepp.co |
| A     | D165 | jerami_edwards@grepp.co  |
| B     | D164 | kelly_grant@grepp.co     |
| C     | D161 | carsen_garza@grepp.co    |


## 문제 풀이

- **SKILL_CODE의 비트 연산 활용**
    - SKILL_CODE는 각 비트(bit)마다 특정 스킬을 의미하는 2의 제곱수로 저장되어 있다.
    - 특정 개발자가 특정 스킬을 가졌는지 확인하려면 비트 AND 연산자(&)를 사용하면 된다.
        - `SKILL_CODE & 특정 스킬의 CODE > 0` → 해당 스킬을 보유한 개발자

    > [!note]
    > ✋ **비트 연산과 SUM(CODE)의 역할**

- **CASE 문으로 GRADE 분류**
    - `CASE` 문을 활용하여 `GRADE`를 부여

        ```sql
        CASE case_value
            WHEN when_value THEN statement_list
            [WHEN when_value THEN statement_list] ...
            [ELSE statement_list]
        END CASE
        ```

    - **A 등급** → Front End 스킬 & Python 스킬 보유
    - **B 등급** → C# 스킬 보유
    - **C 등급** → Front End 스킬만 보유
- **HAVING을 이용한 필터링**
    - CASE 문에서 어느 조건에도 해당되지 않는 경우 `GRADE` 값이 `NULL`

## 풀이 코드


```sql
WITH FRONT_SKILL AS (
    SELECT CODE AS CODE FROM SKILLCODES WHERE CATEGORY = 'Front End'
),
PYTHON_SKILL AS (
    SELECT CODE AS CODE FROM SKILLCODES WHERE NAME = 'Python'
),
CSHARP_SKILL AS (
    SELECT CODE AS CODE FROM SKILLCODES WHERE NAME = 'C#'
)

SELECT
    CASE
        WHEN (d.SKILL_CODE & (SELECT CODE FROM FRONT_SKILL)) > 0
            AND (d.SKILL_CODE & (SELECT CODE FROM PYTHON_SKILL)) > 0 THEN 'A'
        WHEN (d.SKILL_CODE & (SELECT CODE FROM CSHARP_SKILL)) > 0 THEN 'B'
        WHEN (d.SKILL_CODE & (SELECT CODE FROM FRONT_SKILL)) > 0 THEN 'C'
    END AS GRADE,
    d.ID,
    d.EMAIL
FROM DEVELOPERS AS d
HAVING GRADE IS NOT NULL
ORDER BY GRADE ASC, d.ID ASC;
```


## 참고 자료


[https://dev.mysql.com/doc/refman/8.4/en/case.html](https://dev.mysql.com/doc/refman/8.4/en/case.html)
