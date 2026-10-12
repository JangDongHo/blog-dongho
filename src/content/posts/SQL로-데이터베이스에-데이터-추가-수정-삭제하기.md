---
title: "SQL로 데이터베이스에 데이터 추가, 수정, 삭제하기"
description: "---"
date: 2025-01-03
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


# 2. 데이터 추가하기 (INSERT)


---


## 2.1. 삽입 명령 (INSERT statement)

- **데이터를 하나**만 추가할 때

    ```sql
    INSERT INTO
     table_name VALUES (comma-separated all values);
    ```

- **원하는 속성을 임의로 지정**해서 데이터를 하나만 추가할 때

    ```sql
    INSERT INTO
     table_name (attributes list) 
    				VALUES (attributes list 순서와 동일하게 comma-separated values);
    ```

- **데이터 여러 개**를 추가할 때

    ```sql
    INSERT INTO
     table_name VALUES (…, ..), (…, ..), (…, ..);
    ```


## 2.2. 실습

- 테이블 생성

    ```sql
    create table EMPLOYEE (
    	id         INT         PRIMARY KEY,
    	name       VARCHAR(30) NOT NULL,
    	birth_date DATE,
    	sex        CHAR(1)     CHECK (sex in ('M', 'F')),
    	position   VARCHAR(10),
    	salary      INT        DEFAULT 50000000,
    	dept_id     INT,
    	
    	FOREIGN KEY (dept_id) references DEPARTMENT(id)
    			on delete SET NULL on update CASCADE,
    	CHECK (salary >= 50000000)
    );
    ```

- MESSI 직원 추가

    ```sql
    INSERT INTO EMPLOYEE
    VALUES (1, "MESSI", "1987-02-01", "M", "DEV_BACK", 100000000, null);
    ```

<details>
<summary>Output</summary>

![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4%EC%97%90-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%B6%94%EA%B0%80-%EC%88%98%EC%A0%95-%EC%82%AD%EC%A0%9C%ED%95%98%EA%B8%B0/img-01.png)


</details>

- JANE 직원 추가 (`PRIMARY KEY` Key constraints 위배)

    ```sql
    INSERT INTO EMPLOYEE
    VALUES (1, "JANE", "1996-05-05", "F", "DEV_FRONT", 900000000, null);
    ```

<details>
<summary>Output</summary>

![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4%EC%97%90-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%B6%94%EA%B0%80-%EC%88%98%EC%A0%95-%EC%82%AD%EC%A0%9C%ED%95%98%EA%B8%B0/img-02.png)


</details>

- JANE 직원 추가 (`CHECK` constraint 위배)

    ```sql
    INSERT INTO EMPLOYEE
    VALUES (2, "JANE", "1996-05-05", "F", "DEV_FRONT", 3000, null);
    ```

<details>
<summary>Output</summary>

- `CHECK (salary >= 50000000)`

    ![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4%EC%97%90-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%B6%94%EA%B0%80-%EC%88%98%EC%A0%95-%EC%82%AD%EC%A0%9C%ED%95%98%EA%B8%B0/img-03.png)

- constraint 위배된 내용 확인하는 쿼리문

    ```sql
    SHOW CREATE TABLE employee;
    ```


    ![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4%EC%97%90-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%B6%94%EA%B0%80-%EC%88%98%EC%A0%95-%EC%82%AD%EC%A0%9C%ED%95%98%EA%B8%B0/img-04.png)


</details>

- JANE 직원 추가 (`FOREIGN KEY` Referential integrity constraint 위배)

    ```sql
    INSERT INTO EMPLOYEE
    VALUES (1, "JANE", "1996-05-05", "F", "DEV_FRONT", 900000000, 111);
    ```

<details>
<summary>Output</summary>

- DEPARTMENT에 없는 id값을 외래키로 사용

![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4%EC%97%90-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%B6%94%EA%B0%80-%EC%88%98%EC%A0%95-%EC%82%AD%EC%A0%9C%ED%95%98%EA%B8%B0/img-05.png)


![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4%EC%97%90-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%B6%94%EA%B0%80-%EC%88%98%EC%A0%95-%EC%82%AD%EC%A0%9C%ED%95%98%EA%B8%B0/img-06.png)


</details>

- JANE 직원 추가

    ```sql
    INSERT INTO EMPLOYEE
    VALUES (1, "JANE", "1996-05-05", "F", "DEV_FRONT", 900000000, null);
    ```

<details>
<summary>Output</summary>

![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4%EC%97%90-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%B6%94%EA%B0%80-%EC%88%98%EC%A0%95-%EC%82%AD%EC%A0%9C%ED%95%98%EA%B8%B0/img-01.png)


</details>

- JENNY 직원 추가

    ```sql
    INSERT INTO EMPLOYEE (name, birth_date, sex, position, id)
    VALUES ("JENNY", "2000-10-12", "F", "DEV_BACK", 3);
    ```

<details>
<summary>Output</summary>

![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4%EC%97%90-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%B6%94%EA%B0%80-%EC%88%98%EC%A0%95-%EC%82%AD%EC%A0%9C%ED%95%98%EA%B8%B0/img-01.png)


</details>

- 직원 여러 명 한꺼번에 추가

    ```sql
    INSERT INTO EMPLOYEE VALUES
    		(4, "BROWN", "1996-03-13", "M", "CEO", 120000000, null),
    		(5, "DINGYO", "1990-11-05", "F", "CTO", 110000000, null),
    		(6, "JULIA", "2000-12-19", "M", "DEV_FRONT", 70000000, null),
    ...
    ```

- DEPARTMENT 테이블 데이터 추가

    ```sql
    INSERT INTO DEPARTMENT VALUES
    		(1001, 'headquarter', 4),
    		(1002, 'HR', 6),
    		(1003, 'development', 1),
    		(1004, 'design', 3),
    		(1005, 'product', 13);
    ```

- PROJECT 테이블 데이터 추가

    ```sql
    INSERT INTO PROJECT VALUES
    		(2001, '쿠폰 구매/선물 서비스 개발', 13, '2022-03-10', '2022-07-09'),
    		(2002, '확장성 있게 백엔드 리팩토링', 13, '2022-01-23', '2022-03-23'),
    		(2003, '홈페이지 UI 개선', 11, '2022-05-09', '2022-06-11');
    ```

- WORKS_ON 테이블 데이터 추가

    ```sql
    INSERT INTO WORKS_ON VALUES
    		(5, 2001),
    		(13, 2001),
    		(1, 2001),
    		(8, 2001),
    		...
    ```


# 3. 데이터 수정하기 (UPDATE)


---


## 3.1. 수정 명령 (UPDATE statement)


```sql
UPDATE table_name(s)
SET attribute = value [, attribute = value, .. ]
[ WHERE condition(s) ];
```


## 3.2. 실습

- Messi의 소속팀 정보를 업데이트
    - employee ID가 1인 Messi는 개발(development)팀 소속이다.
    - 개발팀 ID는 1003이다.

    ```sql
    UPDATE EMPLOYEE 
    SET dept_id = 1003 
    WHERE id = 1;
    ```

- 개발팀 연봉을 두 배로 인상하고 싶다.
    - 개발팀 ID는 1003이다.

    ```sql
    UPDATE EMPLOYEE 
    SET salary = salary * 2 
    WHERE dept_id = 1003;
    ```

- 프로젝트 ID 2003에 참여한 임직원의 연봉을 두 배로 인상하고 싶다

    ```sql
    UPDATE EMPLOYEE, WORKS_ON
    SET salary = salary * 2 
    WHERE EMPLOYEE.id = WORKS_ON.empl_id AND WORKS_ON.proj_id = 2003;
    ```

- 회사의 모든 구성원의 연봉을 두 배로 올리자!

    ```sql
    UPDATE EMPLOYEE
    SET salary = salary * 2
    ```


# 4. 데이터 삭제하기 (DELETE)


---


## 4.1. 삭제 명령 (DELETE statement)

- 삭제할 레코드를 지정

    ```sql
    DELETE FROM table_name
    WHERE condition;
    ```

- 테이블의 모든 레코드 삭제 (주의)

    ```sql
    DELETE FROM table_name
    ```


## 4.2. 실습


![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4%EC%97%90-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%B6%94%EA%B0%80-%EC%88%98%EC%A0%95-%EC%82%AD%EC%A0%9C%ED%95%98%EA%B8%B0/img-07.png)

- John이 퇴사를 하게 되면서 employee 테이블에서 John 정보를 삭제해야 한다.
    - John의 employee ID는 8이다.
    - 현재 John은 project 2001에 참여하고 있었다.

    ```sql
    DELETE FROM EMPLOYEE WHERE id = 8;
    ```

- Jane이 휴직을 떠나게 되면서 현재 진행 중인 프로젝트에서 중도하차하게 됐다.
    - Jane의 ID는 2다.

    ```sql
    DELETE FROM WORKS_ON WHERE empl_id = 2;
    ```

- 현재 Dingyo가 두 개의 프로젝트에 참여하고 있었는데 프로젝트 2001에 선택과 집중을 하기로 하고 그 외의 프로젝트에서는 빠지기로 했다.
    - Dingyo의 ID는 5다.

    ```sql
    DELETE FROM WORKS_ON WHERE empl_id = 5 and proj_id != 2001;
    ```

- 회사에 큰 문제가 생겨서 진행중인 모든 프로젝트들이 중단됐다.

    ```sql
    DELETE FROM PROJECT;
    ```


## 참고 자료


[https://www.youtube.com/watch?v=c8WNbcxkRhY&list=PLcXyemr8ZeoREWGhhZi5FZs6cvymjIBVe&index=3&ab_channel=%EC%89%AC%EC%9A%B4%EC%BD%94%EB%93%9C](https://www.youtube.com/watch?v=c8WNbcxkRhY&list=PLcXyemr8ZeoREWGhhZi5FZs6cvymjIBVe&index=3&ab_channel=%EC%89%AC%EC%9A%B4%EC%BD%94%EB%93%9C)


> [!note]
> **이전 글**
>
> [SQL로 데이터베이스 정의하기 [개념]](https://app.notion.com/p/16b5ca9b265e80faae70f3fc89b2b93a)


> [!note]
> **다음 글 **
>
> [SQL로 데이터베이스에 데이터 추가, 수정, 삭제하기](https://app.notion.com/p/1705ca9b265e806a808acb78d6263839)
