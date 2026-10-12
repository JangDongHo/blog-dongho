---
title: "SQL로 데이터베이스 정의하기 [개념]"
description: "---"
date: 2024-12-29
---

# 1. SQL 기본 개념


---


## 1.1. 구조적 쿼리 언어 (structured query language)

- 줄여서 SQL
- 현업에서 쓰이는 relational DBMS의 표준 언어
- 종합적인 database 언어: DDL + DML + VDL

## 1.2. SQL 주요 용어


| relational data model | SQL    |
| --------------------- | ------ |
| relation              | table  |
| attribute             | column |
| tuple                 | row    |
| domain                | domain |

- SQL에서 relation이란?
    - multiset(= bag) of tuples
    - 중복된 tuple을 허용한다
- SQL은 RDBMS의 표준 언어이지만 실제 구현에 강제가 없기 때문에, RDBMS마다 제공하는 SQL의 스펙이 조금씩 다르다.
    - MySQL ≠ PostgreSQL ≠ Oracle

# 2. MySQL 데이터 유형 (MySQL attribute data type)


---


## 2.1. 숫자 속성 데이터 유형 (numeric attribute data type)


| 종류                         | 설명                                                       | MySQL                            | 사이즈      |
| -------------------------- | -------------------------------------------------------- | -------------------------------- | -------- |
| 정수                         | 정수를 저장할 때 사용                                             | TINYINT                          | 1 byte   |
|                            |                                                          | SMALLINT                         | 2 byte   |
|                            |                                                          | MEDIUMINT                        | 3 byte   |
|                            |                                                          | INT or INTEGER                   | 4 byte   |
|                            |                                                          | BIGINT                           | 8 byte   |
| 부동 소수점 방식
(floating-point) | - 실수(real number)를 저장할 때 사용
- 고정 소수점 방식에 비해 정확하지 않다      | FLOAT                            | 4 byte   |
|                            |                                                          | DOUBLE or
DOUBLE PRECISION       | 8 byte   |
| 고정 소수점 방식
(fixed-point)    | - 실수를 정확하게 저장할 때 사용
- DECIMAL(5, 2) ⇒ [-999.99 ~ 999.99] | DECIMAL or NUMERIC
(널널 vs 엄격 차이) | variable |


## 2.2. 문자열 속성 데이터 유형 (string attribute data type)


| 종류         | 설명                                                                                                                          | MySQL                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 고정 크기 문자열  | - 최대 몇 개의 ‘문자’를 가지는 문자열을 저장할지를 지정
- 저장될 문자열 길이가 최대 길이보다 작으면 나머지를 space로 채워서 저장
- name char(4)일 때 다음과 같이 저장: `a`    , `한국`   | CHAR(n)
(0 ≤ n ≤ 255)              |
| 가변 크기 문자열  | - 최대 몇 개의 ‘문자’를 가지는 문자열을 저장할지를 지정
- 저장될 문자열의 길이 만큼만 저장
- name varchar(4)일 때 다음과 같이 저장: `a`, `한국`                            | VARCHAR(n)
(0 ≤ n ≤ 65,535)        |
| 사이즈가 큰 문자열 | - 사이즈가 큰 문자열을 저장할 때 사용                                                                                                      | TINYTEXT
TEXT
MEDIUM TEXT
LONGTEXT |


## 2.3. 날짜와 시간 속성 데이터 유형 (datetime attribute data type)


| 종류     | 설명                                                                               | MySQL                                                             |
| ------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 날짜     | - 년, 월, 일을 저장
- `YYYY-MM-DD`                                                     | DATE
(’1000-01-01’ ~ ‘9999-12-31’)                                |
| 시간     | - 시, 분, 초를 저장
- `hh:mm:ss` or `hhh:mm:ss`
- `hhh:mm:ss` → 주로 **경과 시간**을 기록할 때 사용 | TIME
(’-838:59:59’ ~ ‘838:59:59’)                                 |
| 날짜와 시간 | - 날짜와 시간을 같이 표현
- `YYYY-MM-DD hh:mm:ss`                                          | DATETIME
(’1000-01-01 00:00:00’ to ‘9999-12-31 23:59:59’)         |
|        | - TIMESTAMP는 time-zone이 반영됨                                                      | TIMESTAMP
(’1970-01-01 00:00:01’ UTC ~ ‘2038-01-19 03:14:07’ UTC) |


## 2.4. 그 외 속성 데이터 유형 (etc attribute data type)


| 종류          | 설명                                                            | MySQL                      |
| ----------- | ------------------------------------------------------------- | -------------------------- |
| byte-string | - (문자열이 아니라) byte string을 저장
- BLOB type은 주로 암호화 키를 저장할 때 사용  | BINARY
VARBINARY
BLOB type |
| boolean     | - true, false를 저장
- MySQL에는 따로 없음                             | TINYINT로 대체해서 사용           |
| 위치 관련       | - 위치 관련 정보를 저장                                                | GEOMETRY
etc               |
| JSON        | - json 형태의 데이터를 저장
- 예) `{”name”: “messi”, “age”: 38}`        | JSON                       |


# 3. 실습 - IT 회사 관련 RDB 만들기


---

- **부서, 사원, 프로젝트** 관련 정보들을 저장할 수 있는 관계형 데이터베이스를 만들자
- 사용할 RDBMS는 MySQL (InnoDB) 기준
- DATABASE vs SCHEMA
    - MySQL에서는 DATABASE와 SCHEMA가 같은 뜻을 의미
        - `CREATE DATABASE company = CREATE SCHEMA company`
    - 다른 RDBMS에서는 의미가 다르게 쓰임
        - 예) PostgreSQL에서는 SCHEMA가 DATABASE의 namespace를 의미

## 3.1. 스키마 설계

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


## 3.1. 데이터베이스 목록 (현재 계정이 접근 가능한 데이터베이스)


```sql
SHOW DATABASES;
```


![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4-%EC%A0%95%EC%9D%98%ED%95%98%EA%B8%B0-%EA%B0%9C%EB%85%90/img-01.png)


## 3.2. 데이터베이스 생성


```sql
CREATE DATABASE company;
```


## 3.3. 현재 선택된 데이터베이스 확인


```sql
SELECT database();
```


![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4-%EC%A0%95%EC%9D%98%ED%95%98%EA%B8%B0-%EA%B0%9C%EB%85%90/img-02.png)


## 3.4. 사용할 데이터베이스 선택하기


```sql
USE company;
```


## 3.5. 데이터베이스 삭제


```sql
DROP DATABASE company;
```


## 3.6. 부서(department) 테이블 생성


```sql
create table DEPARTMENT (
	id         INT          PRIMARY KEY,
	name       VARCHAR(20)  NOT NULL      UNIQUE,
	leader_id  INT
);
```

<details>
<summary>**`PRIMARY KEY`** **Key constraints**</summary>

- 선언 방법
    - attribute가 하나로 구성될 때

        ```sql
        create table PLAYER (
        	id         INT          PRIMARY KEY,
        	...
        );
        ```

    - attribute가 하나 이상으로 구성될 때

        ```sql
        create table PLAYER (
        	team_id        VARCHAR(12),
        	back_number    INT,
        	...
        	PRIMARY KEY (team_id, back_number)
        );
        ```


</details>

<details>
<summary>**`UNIQUE`** **Key constraints**</summary>

- UNIQUE로 지정된 attribute(s)는 중복된 값을 가질 수 없다.
- 단, NULL은 중복을 허용할 수도 있다 (RDBMS 마다 다름)
- 선언 방법
    - attribute가 하나로 구성될 때

        ```sql
        create table PLAYER (
        	id     INT    UNIQUE,
        	...
        );
        ```

    - attribute가 하나 이상으로 구성될 때

        ```sql
        create table PLAYER (
        	team_id        VARCHAR(12),
        	back_number    INT,
        	...
        	UNIQUE (team_id, back_number)
        );
        ```


</details>

<details>
<summary>**`NOT NULL`** **constraint**</summary>

- attribute가 NOT NULL로 지정되면 해당 attribute는 NULL을 값으로 가질 수 없다
- 선언 방법

    ```sql
    create table STUDENT (
    	phone_number   INT    NOT NULL   UNIQUE,
    	...
    );
    ```


</details>


## 3.7. 직원(EMPLOYEE) 테이블 생성


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

<details>
<summary>**`DEFAULT`** **attribute**</summary>

- attribute의 default 값을 정의할 때 사용
- 새로운 tuple을 저장할 때 해당 attribute에 대한 값이 없다면 default 값으로 저장
- 선언 방법

    ```sql
    create table ORDERS (
    	...
    	menu     VARCHAR(15)    DEFAULT '짜장면',
    	...
    );
    ```


</details>

<details>
<summary>**`CHECK`** **constraint**</summary>

- attribute의 값을 제한하고 싶을 때 사용
- 선언 방법
    - attribute가 하나로 구성될 때

        ```sql
        create table EMPLOYEE (
        	...
        	age   INT   CHECK (age >= 20)
        );
        ```

    - attribute가 하나 이상으로 구성될 때

        ```sql
        create table PROJECT (
        	start_date   DATE,
        	end_date     DATE,
        	...
        	CHECK (start_date < end_date)
        );
        ```


</details>

<details>
<summary>**`FOREIGN KEY`** **Referential integrity constraint**</summary>

- attribute(s)가 다른 table의 primary key나 unique key를 참조할 때 사용

    ![image.png](/posts/attachments/SQL%EB%A1%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4-%EC%A0%95%EC%9D%98%ED%95%98%EA%B8%B0-%EA%B0%9C%EB%85%90/img-03.png)

- 선언 방법

    ```sql
    create table EMPLOYEE (
    	...
    	dept_id     INT,
    	
    	FOREIGN KEY (dept_id) 
    			references DEPARTMENT(id)
    			on delete reference_option
    			on update reference_option
    );
    ```


    | reference_option | 설명                          |
    | ---------------- | --------------------------- |
    | CASCADE          | 참조값의 삭제/변경을 그대로 반영          |
    | SET NULL         | 참조값이 삭제/변경 시 NULL로 변경       |
    | RESTRICT         | 참조값이 삭제/변경되는 것을 금지          |
    | NO ACTION        | RESTRICT와 유사                |
    | SET DEFAULT      | 참조값이 삭제/변경 시 default 값으로 변경 |

    - 참고: `SET DEFAULT`는 MySQL에서 제대로 구현이 안 돼있다고 한다.

</details>

<details>
<summary>**constraint 이름 명시하기**</summary>

- 이름을 붙이면 어떤 constraint을 위반했는지 쉽게 파악 가능
- constraint를 삭제하고 싶을 때 해당 이름으로 삭제 가능
- 예시

    ```sql
    create table TEST (
    		age INT CONSTRAINT age_over_20 CHECK (age > 20)
    );
    ```


    | CONSTRAINT age_over_20 이름을 붙였을 때            | CONSTRAINT age_over_20 이름을 생략했을 때          |
    | ------------------------------------------- | ------------------------------------------ |
    | Check constraint ‘age_over_20’ is violated. | Check constraint ‘test_chk_1’ is violated. |


</details>


## 3.8. 프로젝트(PROJECT) 테이블 생성


```sql
create table PROJECT (
	id         INT         PRIMARY KEY,
	name       VARCHAR(20) NOT NULL      UNIQUE,
	leader_id  INT,
	start_date DATE,
	end_date   DATE,
	
	FOREIGN KEY (leader_id) references EMPLOYEE(id)
			on delete SET NULL on update CASCADE,
	CHECK (start_date < end_date)
);
```


## 3.9. 배치(WORKS_ON) 테이블 생성


```sql
create table WORKS_ON (
	empl_id     INT,
	proj_id     INT,
	
	PRIMARY KEY (empl_id, proj_id),
	FOREIGN KEY (empl_id) references EMPLOYEE(id)
	on delete CASCADE on update CASCADE,
	FOREIGN KEY (proj_id) references PROJECT(id)
	on delete CASCADE on update CASCADE
);
```


## 3.10. 부서(department) 테이블 외래키 추가


```sql
ALTER TABLE department ADD FOREIGN KEY (leader_id)
	REFERENCES employee(id)
	on update CASCADE
	on delete SET NULL;
```

- ALTER TABLE 대표 유형

    | 유형              | MySQL                                                          |
    | --------------- | -------------------------------------------------------------- |
    | attribute 추가    | ALTER TABLE employee **ADD** blood VARCHAR(2);                 |
    | attribute 이름 변경 | ALTER TABLE employee **RENAME COLUMN** phone **TO** phone_num; |
    | attribute 타입 변경 | ALTER TABLE employee **MODIFY COLUMN** blood CHAR(2);          |
    | table 이름 변경     | ALTER TABLE logs **RENAME TO** backend_logs;                   |
    | primary key 추가  | ALTER TABLE log **ADD PRIMARY KEY** (id);                      |

    - 이미 서비스 중인 table의 schema를 변경하는 것이라면 변경 작업 때문에 서비스의 백엔드에 영향이 없을지 검토한 후에 변경하는 것이 중요!!

## 3.11. 테이블 삭제


```sql
DROP TABLE table_name;
```


# 4. 결론


---

- database 구조를 정의할 때 중요한 점
    - 만들려는 서비스의 **스펙**과 **데이터 일관성, 편의성, 확장성** 등등을 종합적으로 고려하여 **DB 스키마**를 적절하게 정의하는 것이 중요

## 참고 자료


[https://www.youtube.com/watch?v=c8WNbcxkRhY&list=PLcXyemr8ZeoREWGhhZi5FZs6cvymjIBVe&index=3&ab_channel=%EC%89%AC%EC%9A%B4%EC%BD%94%EB%93%9C](https://www.youtube.com/watch?v=c8WNbcxkRhY&list=PLcXyemr8ZeoREWGhhZi5FZs6cvymjIBVe&index=3&ab_channel=%EC%89%AC%EC%9A%B4%EC%BD%94%EB%93%9C)


[https://extbrain.tistory.com/59](https://extbrain.tistory.com/59)


[https://dev.mysql.com/doc/refman/8.4/en/show-databases.html](https://dev.mysql.com/doc/refman/8.4/en/show-databases.html)


> [!note]
>
> **이전 글**
>
> [관계형 데이터베이스 [개념]](https://app.notion.com/p/15a5ca9b265e80be9d5afa5c4deb3e17)


> [!note]
>
> **다음 글**
>
> [SQL로 데이터베이스에 데이터 추가, 수정, 삭제하기](https://app.notion.com/p/1705ca9b265e806a808acb78d6263839)
