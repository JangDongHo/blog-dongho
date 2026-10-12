---
title: "SQL로 데이터 조회하기"
description: "---"
date: 2025-01-09
---

# 1. 지난 포스팅 리마인드


---


[SQL로 데이터베이스 정의하기 [개념]](https://app.notion.com/p/16b5ca9b265e80faae70f3fc89b2b93a) 

- IT 회사 RDB 만들기
    - 부서, 사원, 프로젝트 관련 정보들을 저장할 수 있는 RDB를 지난 포스팅에서 만들어보았다.
    - RDBMS는 MySQL(InnoDB)를 사용

## 1.1. IT 회사 RDB 스키마

- **DEPARTMENT**

    | <u>id</u> | name | leader_id |
    | --------- | ---- | --------- |

- **EMPLOYEE**

    | <u>id</u> | name | birth_date | sex | position | salary | dept_id |
    | --------- | ---- | ---------- | --- | -------- | ------ | ------- |

- **PROJECT**

    | <u>id</u> | name | leader_id | start_date | end_date |
    | --------- | ---- | --------- | ---------- | -------- |

- **WORKS_ON**

    | <u>empl_id</u> | <u>proj_id</u> |
    | -------------- | -------------- |


# 2. 데이터 조회하기 (SELECT)


---


## 2.1. 조회 명령 (SELECT statement)


```sql
SELECT attribute(s)
FROM table(s)
[ WHERE condition(s) ];
```


## 2.2. 실습


### SELECT 기초

- project 22를 리딩(leading)하고 있는 임직원의 ID와 이름과 직군을 알고 싶다.

    ```sql
    SELECT EMPLOYEE.id, EMPLOYEE.name, position
    FROM EMPLOYEE, PROJECT
    WHERE PROJECT.id = 2002 and PROJECT.leader_id = EMPLOYEE.id;
    ```

    - `PROJECT.id = 22` ⇒ selection condition
    - `PROJECT.leader_id = EMPLOYEE.id` ⇒ join condition
    - `EMPLOYEE.id, EMPLOYEE.name, position` ⇒ projection attributes

    ![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0/img-01.png)

- 두 개 이상의 테이블이 조인되면, 동일한 이름의 열이 여러 테이블에 존재하거나 잠재잭으로 존재할 가능성이 있으므로 각 열 이름 앞에 테이블 이름을 명시적으로 지정하는 것을 권장한다.

    ```sql
    SELECT EMPLOYEE.id, EMPLOYEE.name, position
    FROM EMPLOYEE, PROJECT
    WHERE PROJECT.id = 2002 and 
    PROJECT.leader_id = id
    ;
    ```


    ![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0/img-02.png)


### AS 키워드 사용하기

- AS는 테이블에 별칭(alias)을 붙일 때 사용한다.

    ```sql
    SELECT E.id, E.name, position
    FROM EMPLOYEE AS E, PROJECT AS P
    WHERE P.id = 22 and P.leader_id = E.id;
    ```


    ![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0/img-03.png)

- AS는 생략 가능하다.

    ```sql
    SELECT E.id, E.name, position
    FROM EMPLOYEE E, PROJECT P
    WHERE P.id = 2002 and P.leader_id = E.id;
    ```


    ![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0/img-03.png)

- AS는 attribute에도 별칭(alias)을 붙일 수 있다.

    ```sql
    SELECT E.id AS leader_id, E.name AS leader_name, position
    FROM EMPLOYEE E, PROJECT P
    WHERE P.id = 2002 and P.leader_id = E.id;
    ```


    ![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0/img-04.png)


### DISTINCT 키워드 사용하기

- DISTINCT는 SELECT 결과에서 중복되는 tuples를 제외하고 싶을 때 사용한다.
- 디자이너들이 참여하고 있는 프로젝트들의 ID와 이름을 알고 싶다.

    ```sql
    SELECT P.id, P.name
    FROM EMPLOYEE AS E, WORKS_ON AS W, PROJECT AS P
    WHERE E.position = 'DSGN' and
    			E.id = W.empl_id and W.proj_id = P.id;
    ```


    ![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0/img-05.png)

- 중복된 튜플 제거

    ```sql
    SELECT DISTINCT P.id, P.name
    FROM EMPLOYEE AS E, WORKS_ON AS W, PROJECT AS P
    WHERE E.position = 'DSGN' and
    			E.id = W.empl_id and W.proj_id = P.id;
    ```


    ![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0/img-06.png)


### LIKE 키워드 사용하기


| 기능       | 문자  | 설명                                        |
| -------- | --- | ----------------------------------------- |
| LIKE 연산자 |     | 문자열 패턴 매칭(pattern matching)에 사용되는 SQL 연산자 |
| 예약 문자    | `%` | 0개 이상의 문자와 매칭                             |
| 단일 문자 매칭 | `-` | 1개의 문자와 매칭                                |
| 이스케이프 문자 | `\` | 특수 문자를 escape시켜서 일반 문자로 취급                |

- 이름이 N으로 시작하거나 N으로 끝나는 임직원들의 이름을 알고 싶다.

    ```sql
    SELECT name
    FROM EMPLOYEE
    WHERE name LIKE 'N%' OR name LIKE '%N';
    ```


    ![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0/img-07.png)

- 이름에 NG가 들어가는 임직원들의 이름을 알고 싶다.

    ```sql
    SELECT name
    FROM EMPLOYEE
    WHERE name LIKE '%NG%';
    ```


    ![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0/img-08.png)

- 이름이 J로 시작하는, 총 네 글자의 이름을 가지는 임직원들의 이름을 알고 싶다.

    ```sql
    SELECT name
    FROM EMPLOYEE
    WHERE name LIKE 'J____';
    ```


    ![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0/img-09.png)

- %로 시작하거나 _로 끝나는 프로젝트 이름을 찾고 싶다면?

    ```sql
    SELECT name
    FROM PROJECT
    WHERE name LIKE '\%%' OR name LIKE '%\_';
    ```


### * (asterisk) 사용하기

- * (asterisk)는 선택된 tuples의 모든 attributes를 보여주고 싶을 때 사용한다.
- ID가 9인 임직원의 모든 attributes를 알고 싶다.

    ```sql
    SELECT *
    FROM EMPLOYEE
    WHERE id = 9;
    ```


    ![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0/img-10.png)

- 조인된 테이블에서 * (asterisk)로 전체 열 조회하기
    - 결과적으로 조인된 테이블에서 두 테이블의 열이 모두 반환된다.
        - 카티션 곱(Cartesian Product) 방식

    ```sql
    SELECT *
    FROM EMPLOYEE, PROJECT
    WHERE PROJECT.id = 2002 and PROJECT.leader_id = EMPLOYEE.id;
    ```


    ![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0/img-11.png)


### WHERE 절 없는 SELECT

- 테이블에 있는 모든 tuples를 반환한다.
- 모든 임직원의 이름과 생일을 알고 싶다.

    ```sql
    SELECT name, birth_date
    FROM EMPLOYEE;
    ```


    ![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%A1%B0%ED%9A%8C%ED%95%98%EA%B8%B0/img-12.png)


## 참고 자료


[https://www.youtube.com/watch?v=dTBwgWMUguE&list=PLcXyemr8ZeoREWGhhZi5FZs6cvymjIBVe&index=5&ab_channel=%EC%89%AC%EC%9A%B4%EC%BD%94%EB%93%9C](https://www.youtube.com/watch?v=dTBwgWMUguE&list=PLcXyemr8ZeoREWGhhZi5FZs6cvymjIBVe&index=5&ab_channel=%EC%89%AC%EC%9A%B4%EC%BD%94%EB%93%9C)


> [!note]
> **이전 글**
>
> [SQL로 데이터베이스에 데이터 추가, 수정, 삭제하기](https://app.notion.com/p/1705ca9b265e806a808acb78d6263839)


> [!note]
> **다음 글 **
