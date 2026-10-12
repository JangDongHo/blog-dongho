---
title: "ES6 문법 정리"
description: "자바스크립트는 매년 새로운 버전으로 업데이트 된다. 노드도 주기적(6개월마다)으로 버전을 올리며 변경된 자바스크립트 문법을 반영하고 있다. 이번 장에서는 자바스크립트 문법에 매우 큰 변화가 있었던 ES6 문법에 대해서 알아보자!"
date: 2024-10-14
---

![image.png](/posts/attachments/ES6-%EB%AC%B8%EB%B2%95-%EC%A0%95%EB%A6%AC/img-01.png)


> [!note]
> 자바스크립트는 매년 새로운 버전으로 업데이트 된다. 노드도 주기적(6개월마다)으로 버전을 올리며 변경된 자바스크립트 문법을 반영하고 있다. 이번 장에서는 자바스크립트 문법에 매우 큰 변화가 있었던 ES6 문법에 대해서 알아보자!


## 목차


# 2.1. ES6


2015년 자바스크립트 문법에 매우 큰 변화가 있었다. 바로 ES2015(ES6)가 등장한 것이다.


2015년을 기점으로 매년 문법 변경 사항이 발표되고 있으며, 새로운 문법 상세에 대해서도 활발한 논의가 이뤄지고 있다. 2024년 현재는 무려 ES2024까지 나왔다!


시대에 뒤쳐지지 않기 위해서는 새로운 자바스크립트 문법과 기능들을 지속적으로 학습하고 적용하는 것이 중요하다. ES6부터 도입된 새로운 기능들은 코드의 가독성과 효율성을 크게 향상시켰기 때문에, 이를 잘 활용하면 더 나은 프로그래밍을 할 수 있다. 따라서 이번 장에서는 ES6의 주요 특징들을 자세히 살펴보고, 실제 코드에 어떻게 적용할 수 있는지 알아보도록 하자.


## 2.1.1. const, let ⭐⭐


보통 자바스크립트를 배울 때는 `var` 변수를 선언하는 방법부터 배운다. 하지만 var은 이제 `const`와 `let`이 대체한다.


먼저 const와 let이 공통적으로 갖는 특징인 **블록 스코프**(범위)에 대해서 알아보자.


```javascript
if (true) {
	var x = 3;
}
console.log(x); // 3

if (true) {
	const y = 3;
}
console.log(y); // Uncaught ReferenceError: y is not defined
```


위 코드에서 x는 정상적으로 출력이 되는데 y는 에러가 발생하는 모습을 확인할 수 있다.


단지 var을 const로 바꿨을 뿐인데 말이다.


왜 에러가 났을까?


`var`은 **함수 스코프**를 가지므로 if문의 블록과 관계없이 접근할 수 있다.


하지만 `const`와 `let`은 **블록 스코프**를 가지므로 블록 밖에서는 변수에 접근할 수 없다.


여기서 블록의 범위는 if, while, for, function 등에서 볼 수 있는 중괄호(`{ }`)이다.


함수 스코프 대신 블록 스코프를 사용함으로써 **호이스팅** 같은 문제도 해결되고 코드 관리도 훨씬 수월해졌다.


### 2.1.1.1 호이스팅 ⭐


호이스팅(Hoisting)은 변수와 함수 선언이 스코프의 최상단으로 끌어올려지는 것처럼 동작하는 자바스크립트의 특성을 말한다.



호이스팅 개념을 이해하기 위해 다음 코드를 살펴보자.


```javascript
console.log(a); // undefined
var a = 10;
console.log(a); // 10
```


이 코드에서 변수 a는 선언되기 전에 사용되었지만, 에러가 발생하지 않고 `undefined`를 출력한다. 이는 var로 선언된 변수가 호이스팅되어 스코프의 최상단으로 끌어올려졌기 때문이다. 실제로 자바스크립트 엔진은 위 코드를 다음과 같이 해석한다.



```javascript
var a;
console.log(a); // undefined
a = 10;
console.log(a); // 10
```


이러한 호이스팅 현상은 코드의 실행 순서를 예측하기 어렵게 만들어 버그의 원인이 될 수 있다. 


### 2.1.1.2 일시적 사각지대(Temporal Dead Zone, TDZ) ⭐


`const`와 `let`도 사실은 호이스팅 현상이 발생하지만, 조금 다른 방식으로 작동한다. `const`와 `let`으로 선언된 변수는 `일시적 사각지대(Temporal Dead Zone, TDZ)`라는 개념이 적용된다. 이는 변수가 선언되기 전에 접근하려고 하면 `ReferenceError`가 발생하는 것을 의미한다.


`TDZ`와 관련된 코드 2개를 한번 살펴보자.


```javascript
console.log(a); // Uncaught ReferenceError: Cannot access 'a' before initialization
const a = 10;
console.log(a); // 10
```


```javascript
let age = 28;

function showAge() {
	console.log(age); // // Uncaught ReferenceError: Cannot access 'age' before initialization
	let age = 20; // ReferenceError
}

showAge();
```


이처럼 `const`와 `let`을 사용하면 값을 할당하기 전에는 `TDZ`가 죽은 공간으로 만들어버리기에 


변수를 선언하기 전에 접근하려는 실수를 방지할 수 있다.


### 2.1.1.3 const와 let의 차이


그렇다면 `const`와 `let`의 차이는 무엇일까?


> [!note]
>
> - **const**
>     - 한 번 값을 할당하면 다른 값을 할당할 수 없다.
>         - 만약 다른 값을 할당하려고 하면 에러가 발생한다.
>     - 초기화할 때 값을 할당하지 않으면 에러가 발생한다.
>     - 상수의 개념


> [!note]
>
> - **let**
>     - 다른 값을 할당할 수 있다.
>     - 초기화할 때 값을 할당하지 않아도 된다.
>     - 변수의 개념


```javascript
const a = 0;
a = 1; // Uncaught TypeError: Assignment to constant variable

let b = 0;
b = 1; // 1

const c; // Uncaught SyntaxError: Missing initializer in const declaration
```


자바스크립트를 사용할 때 한 번 초기화했던 변수에 다른 값을 할당하는 경우는 의외로 적다.


따라서 변수 선언시에는 기본적으로 `const`를 사용하고, 다른 값을 할당해야 하는 상황이 생겼을 때 `let`을 사용하자.


> [!note]
>
> **Q. const와 let과 var을 비교 설명하시오.
> **
>
> const, let, 그리고 var은 자바스크립트에서 변수를 선언하는 키워드들이지만, 각각 다른 특성을 가지고 있습니다. const와 let은 ES6에서 도입된 블록 스코프 변수로, 호이스팅 문제를 해결하고 더 예측 가능한 코드를 작성할 수 있게 해줍니다. 반면 var은 함수 스코프를 가지며, 호이스팅으로 인해 예기치 않은 동작을 일으킬 수 있습니다. const는 재할당이 불가능한 상수를 선언할 때 사용하고, let은 재할당이 필요한 변수에 사용하며, var은 레거시 코드에서 주로 볼 수 있습니다.


## 2.1.2. 템플릿 문자열


큰따옴표나 작은따옴표로 감싸는 기존 문자열과 달리 백틱(```)으로 감싸면 문자열 안에 변수를 넣을 수 있다.


다음은 기존 ES5 문법을 사용한 문자열이다.


```javascript
var num1 = 1;
var num2 = 2;
var result = 3;
var string1 = num1 + ' 더하기 '  + num2 + '는 \'' + result + '\'';
console.log(string1); // 1 더하기 2는 '3'
```


ES2015부터는 다음과 같이 사용해서 가독성을 개선할 수 있다.


```javascript
const num3 = 1;
const num4 = 2;
const result2 = 3;
const string2 = `${num3} 더하기 ${num4}는 ' ${result2}'`;
console.log(string2); // 1 더하기 2는 '3'
```


## 2.1.3 객체 리터럴 ⭐⭐


자바스크립트는 객체 기반의 프로그래밍 언어이며 자바스크립트를 이루고 있는 거의 **“모든 것”**이 객체이다. 따라서 자바스크립트를 정복하기 위해서는 객체에 대해 잘 알고 있어야 한다.


### 2.1.3.1 객체


객체란 무엇일까? 객체는 자바스크립트에서 데이터를 표현하는 방식 중 하나로 key, value 쌍으로 구성된다.


![그림 2-1. 자바스크립트 객체](/posts/attachments/ES6-%EB%AC%B8%EB%B2%95-%EC%A0%95%EB%A6%AC/img-02.png)


### 2.1.3.2 객체 생성 방법


자바스크립트는 prototype 기반 객체지향 언어로서 다양한 객체생성 방법을 지원한다.

> 객체 리터럴
>
> Object 생성자 함수
>
>
> 생성자 함수
>
>
> Object.create 메서드
>
>
> 클래스(ES6)
>
>

이중에서 객체 리터럴을 통한 객체 생성에 대해 알아보도록 하자.


### 2.1.3.3 객체 리터럴


객체 리터럴 방식은 객체 생성 방식 중 가장 일반적이고 간단한 방법으로, 컨텐츠를 그대로 대입하는 방법을 말한다.


```javascript
let myObject = {
  member1Name: member1Value,
  member2Name: member2Value,
  member3Name: member3Value
};
```


위의 형식과 같이 key : value 형식의 data를 직접 입력하는 방법이다.


그러면 이제 객체 리터럴 방식을 통해서 Person이란 객체를 생성해보자.


```javascript
let person = {
  name: ['Bob', 'Smith'],
  age: 32,
  gender: 'male',
  interests: ['music', 'skiing'],
  bio: function() {
    console.log(`${this.name[0]} ${this.name[1]} is ${this.age} years old`);
  },
  greeting: function() {
    console.log(`Hi! I'm ${this.name[0]}.`);
  }
};
```


위의 person 객체에서 bio와 greeting은 함수이다. 객체는 property로 일반 변수 뿐만 아니라 함수 또한 가질 수 있다. 객체에 묶인 함수는 **메서드**라고 표현한다.


### 2.1.3.4 프로퍼티 접근


그렇다면 선언한 프로퍼티에 어떻게 접근 할 수 있을까?


객체의 프로퍼티에 접근하는 두가지 방법이 있다.

- **마침표 표기법**
    - 마침표(`.`)를 통해 접근하는 방법으로, `person.name, person.age` 와 같이 접근할 수 있다.
- **대괄호 표기법**
    - 대괄호(`[]`)를 통해 접근하는 방식으로, `persone['name'], persone['age']` 와 같이 접근한다.
    - 대괄호를 써서 접근할 경우 따옴표로 감싸주지 않으면 `name`이란 변수의 값으로 인식하기 때문에 꼭 감싸주어야 한다.

메서드도 접근 방식은 동일하다.


### 2.1.3.5 프로퍼티 값 갱신 & 생성 & 삭제

- 갱신
    - 이미 존재하는 property의 값을 **수정하면 갱신**된다.
    - `person.name = 'Brown'`과 같이 값을 갱신할 수 있다.
- 생성
    - 존재하지 않는 property의 값을 할당하면 프로퍼티가 **동적으로 생성**된다.
    - `person.address = 'Seoul'`처럼 새로운 property를 할당할 수 있다.
- 삭제
    - 삭제하고자 하는 property를 `delete` 키워드를 붙여 사용한다.
    - 없는 property에 접근했을 시에 에러없이 무시된다.
    - `delete person.age`와 같이 삭제 가능하다.

### 2.1.3.6 ES6 객체 리터럴


ES6에서는 객체 메서드 정의를 더 간단하게 할 수 있다.


다음은 ES6 이전에서 사용되던 oldObject 객체의 예시이다.


```javascript
var sayNode = function() {
  console.log('Node');
};
var es = 'ES';


var oldObject = {
  sayJS: function() {
    console.log('JS');
  },
  sayNode: sayNode,
};
oldObject[es + 6] = 'Fantastic';
oldObject.sayNode(); // Node
oldObject.sayJS(); // JS
console.log(oldObject.ES6); // Fantastic
```


이 코드를 다음과 같이 다시 쓸 수 있다.


```javascript
const newObject = {
  sayJS() {
    console.log('JS');
  },
  sayNode,
  [es + 6]: 'Fantastic',
};
newObject.sayNode(); // Node
newObject.sayJS(); // JS
console.log(newObject.ES6); // Fantastic
```


차이점을 살펴보자.


sayJS 같은 객체의 메서드에 함수를 연결할 때 더는 `콜론(:)`과 `function`을 붙이지 않아도 된다.


`sayNode: sayNode` 처럼 속성명과 변수명이 동일한 경우에는 한 번만 써도 되게 바뀌었다.


자바스크립트에서 다음과 같은 경우가 많이 나오는데, 이때 코드의 중복을 피할 수 있어 편리하다.


```javascript
{ name: name, age: age } // ES5
{ name, age } // ES2015
```


또한, 객체의 속성명은 동적으로 생성할 수 있다.


예전 문법에서는 ES6라는 속성명을 만들려면 객체 리터럴(oldObject) 바깥에서 `[es+6]`를 해야 했다.


하지만 ES6 문법에서는 객체 리터럴 안에 동적 속성을 선언해도 된다.


newObject 안에서 `[es + 6]`가 속성명으로 바로 사용되고 있다.


객체 리터럴에 추가된 문법은 코딩의 편의성을 향상시키고자 만들어진 것이라는 느낌이 강하다. 따라서 익숙해지면 코드의 양을 많이 줄일 수 있다.


> [!note]
>
> **Q. 객체 리터럴과 함수와 클래스의 차이는?
> **
>
> <details>
> <summary>**객체 리터럴:** 단순한 데이터 구조</summary>

> - **사용 상황**: 데이터만 구조화해서 사용하거나, 단순한 동작을 포함할 때.
> - **장점**: 선언과 동시에 객체를 생성하며, 간단하고 직관적임.
> - **단점**: 복잡한 동작이나 상속에는 적합하지 않음.
> - **예시**: 환경설정 정보 관리
>
>     ```javascript
>     const config = {
>       host: "localhost",
>       port: 3000,
>       database: "myapp",
>       getConnectionString() {
>         return `mongodb://${this.host}:${this.port}/${this.database}`;
>       }
>     };
>
>     // 사용
>     console.log(config.getConnectionString()); // "mongodb://localhost:3000/myapp"
>     ```
>
>
> </details>
>
> <details>
> <summary>**함수:** 특정 로직이나 작업을 캡슐화할 때 사용</summary>

> - **사용 상황**: 단일 작업(예: 검증, 처리, 계산 등)을 반복적으로 수행할 때.
> - **장점**: 모듈화가 용이하며, 재사용성이 높음.
> - **단점**: 상태를 저장하거나 객체 지향적인 구조를 지원하지 않음.
> - **예시**: 요청 데이터 검증 로직
>
>     ```javascript
>     function validateUserInput(data) {
>       if (!data.username || data.username.length < 3) {
>         return { isValid: false, error: "Username must be at least 3 characters long." };
>       }
>       if (!data.email || !data.email.includes("@")) {
>         return { isValid: false, error: "Invalid email format." };
>       }
>       return { isValid: true };
>     }
>
>     // 사용
>     const userInput = { username: "jo", email: "test@example.com" };
>     console.log(validateUserInput(userInput)); 
>     // { isValid: false, error: "Username must be at least 3 characters long." }
>     ```
>
>
> </details>
>
> <details>
> <summary>**클래스:** 상태와 동작을 함께 관리할 때 사용</summary>

> - **사용 상황**: 상태와 동작을 하나로 묶어 관리하거나, 여러 인스턴스를 생성해야 할 때.
> - **장점**: 상태를 관리하기 쉽고, 상속 및 확장이 가능.
> - **단점**: 상대적으로 더 많은 코드와 복잡성이 요구됨.
> - **예시**: 사용자 관리 시스템
>
>     ```javascript
>     class User {
>       constructor(username, email) {
>         this.username = username;
>         this.email = email;
>       }
>
>       getProfile() {
>         return `${this.username} (${this.email})`;
>       }
>
>       updateEmail(newEmail) {
>         this.email = newEmail;
>         return this.email;
>       }
>     }
>
>     // 사용
>     const user1 = new User("johndoe", "john@example.com");
>     console.log(user1.getProfile()); // "johndoe (john@example.com)"
>     user1.updateEmail("john.doe@example.com");
>     console.log(user1.getProfile()); // "johndoe (john.doe@example.com)"
>     ```
>
>
> </details>
>
>
> | **개념**     | **예시**            | **사용 목적**                        |
> | ---------- | ----------------- | -------------------------------- |
> | **객체 리터럴** | 서버 설정, 고정값 관리     | 간단한 데이터 구조를 정의하고 관리할 때.          |
> | **함수**     | 데이터 검증, 유틸리티 함수   | 특정 작업이나 로직을 반복적으로 수행할 때.         |
> | **클래스**    | 사용자 관리, 데이터 모델 정의 | 상태와 동작을 함께 관리하거나 여러 인스턴스가 필요할 때. |


## 2.1.4 화살표 함수


```javascript
function add1(x, y) {
  return x + y;
}

const add2 = (x, y) => {
  return x + y;
};

const add3 = (x, y) => x + y;

const add4 = (x, y) => (x + y);
```


화살표 함수에서는 function 선언 대신 `⇒` 기호로 함수를 선언한다.


add1, add2, add3, add4는 모두 같은 기능을 하는 함수이다.


화살표 함수에서는 내부에 return문밖에 없는 경우, return문을 줄일 수 있다.


중괄호 대신 add3, add4처럼 return할 식을 바로 적으면 된다.


```javascript
function not1(x) {
  return !x;
}

const not2 = x => !x;
```


마찬가지로 not1, not2도 같은 기능을 한다.


not2처럼 매개변수가 한 개이면 매개변수를 소괄호로 묶어주지 않아도 된다.


기존 function과 다른 점은 this 바인드 방식이다. 


다음 예제를 살펴보자.


```javascript
var relationship1 = {
  name: 'zero',
  friends: ['nero', 'hero', 'xero'],
  logFriends: function () {
    var that = this; // relationship1을 가리키는 this를 that에 저장
    this.friends.forEach(function (friend) {
      console.log(that.name, friend);
    });
  },
};
relationship1.logFriends();
```


relationship1.Friends() 안의 forEach문에서는 function 선언문을 사용했다.


각자 다른 함수의 스코프의 this를 가지므로 that이라는 변수를 사용해서 relationship1에 간접적으로 접근하고 있다.


```javascript
const relationship2 = {
  name: 'zero',
  friends: ['nero', 'hero', 'xero'],
  logFriends() {
    this.friends.forEach(friend => {
      console.log(this.name, friend);
    });
  },
};
relationship2.logFriends();
```


하지만 relationship2.logFriends() 안의 forEach문에서는 화살표 함수를 사용했다.


따라서 바깥 스코프인 logFriends()의 this를 그대로 사용할 수 있다. 상위 스코프의 this를 그대로 물려받는 것이다.


즉, 기본적으로 화살표 함수를 쓰되, this를 사용해야 하는 경우에는 화살표 함수와 함수 선언문(function) 둘 중 하나를 고르면 된다.


## 2.1.5. 구조 분해 할당


구조 분해 할당을 사용하면 객체와 배열로부터 속성이나 요소를 쉽게 꺼낼 수 있다.


### 2.1.5.1 배열 구조 분해


배열의 요소를 변수에 할당하는 방법이다.


```javascript
const fruits = ["apple", "banana", "cherry"];

// 구조 분해 할당
const [first, second, third] = fruits;

console.log(first);  // "apple"
console.log(second); // "banana"
console.log(third);  // "cherry"
```


특징으로는 순서대로 값이 할당되고, 값 건너뛰기도 가능하다.


```javascript
const [first, , third] = fruits;
console.log(first);  // "apple"
console.log(third);  // "cherry"
```


배열에 값이 없을 때 기본값을 설정할 수 있습니다.


```javascript
const [a, b, c = "default"] = ["x", "y"];
console.log(c); // "default"
```


### 2.1.5.2 객체 구조 분해


객체의 속성을 분해하여 변수에 할당하는 방법이다.


```javascript
const user = { name: "John", age: 25, country: "USA" };

// 구조 분해 할당
const { name, age, country } = user;

console.log(name);    // "John"
console.log(age);     // 25
console.log(country); // "USA"
```


주의할 점으로는 속성 이름과 변수 이름이 동일해야 한다.


만약, 속성 이름과 다른 변수 이름을 사용하고 싶다면 **별칭(alias)**을 설정할 수 있다.


```javascript
const { name: userName, age: userAge } = user;
console.log(userName); // "John"
console.log(userAge);  // 25
```


마찬가지로, 속성이 없는 경우 기본값을 설정할 수 있다.


```javascript
const { name, gender = "unknown" } = user;
console.log(gender); // "unknown"
```


### 2.1.5.3 실제 사용 사례

1. **API 응답 처리**

    ```javascript
    const response = { data: { user: { id: 1, name: "John" } } };
    const { data: { user: { name } } } = response;
    console.log(name); // "John"
    ```

2. **React의 props 처리**

    ```javascript
    function UserProfile({ name, age }) {
      return <div>{name} is {age} years old.</div>;
    }
    ```

3. **옵션 기본값 설정**

    ```javascript
    function setup({ host = "localhost", port = 8080 } = {}) {
      console.log(`Connecting to ${host}:${port}`);
    }
    
    setup({ host: "example.com" }); // "Connecting to example.com:8080"
    ```


구조 분해 할당 문법도 코드 줄 수를 상당히 줄여주므로 유용하다.


특히 노드는 모듈 시스템을 사용하므로 이러한 방식을 자주 쓴다.


## 2.1.6 클래스


클래스(class) 문법도 추가되었다.


하지만 다른 언어처럼 클래스 기반으로 동작하는 것이 아니라 여전히 프로토타입 기반으로 동작한다. 프로토타입 기반 문법을 보기 좋게 클래스로 바꾼 것이라고 이해하면 된다.


### 2.1.6.1 프로토타입 객체


Java, C++과 같은 클래스 기반 객체지향 프로그래밍 언어와 달리 자바스크립트는 프로토타입 기반 객체지향 프로그래밍 언어이다. 따라서 자바스크립트의 동작 원리를 이해하기 위해서는 프로토타입의 개념을 잘 이해하고 있어야 한다.


프로토타입은 클래스와 아주 유사하며, 자바스크립트의 모든 객체 프로토타입은 값을 할당하는 시점에 결정된다.


모든 객체들은 메소드와 속성들을 상속받기 위한 명세로 프르토타입 객체를 가진다.


클래스 처럼 객체의 인스턴스를 위한 명세와 같은 역할을 하는데 객체 본인만이 가진 속성과 메소드에도 접근할 수 있으면서 프로토타입의 것들에도 접근할 수 있다.


자바스크립트에서 함수를 생성할 때 프로토타입 속성이 함수에 붙여진다.


예를 들어 new 키워드로 함수를 호출할 때마다 생성되는 인스턴스는 함수 프로토타입의 모든 속성을 상속한다.


```javascript
const Hello = function(name) {
  this.name = name;
}

Hello['name'] = 'hello'

// Hello에는 hasOwnProperty 메소드가 없지만 아래 구문은 동작한다.
console.log(Hello.hasOwnProperty('name')); // true

console.dir(Hello);
```


![그림 2-2. 구글 크롬에서 Hello 객체 출력 결과](/posts/attachments/ES6-%EB%AC%B8%EB%B2%95-%EC%A0%95%EB%A6%AC/img-03.png)


속성과 메소드들은 각 객체 인스턴스가 아니라 객체 생성자의 `prototype` 속성에 정의되어 있다.


`Hello`에 정의한 `name` 멤버 외에 프로토타입 객체인 `Object`의 다른 멤버들도 존재함을 알 수 있다.


이렇게 자바스크립트의 모든 객체는 자신의 부모 역할을 하는 객체와 연결되어있고 이 부모 객체를 **`프로토타입`**이라고 한다.


이런 방식으로 클래스를 상속하여 사용하는 것 같이 객체 지향 프로그래밍 방식을 사용할 수 있다.


```javascript
hello.toString(); // [Object object]
```


생성되는 모든 객체는 이런 프토토타입 객체에 접근할 수 있고 동적으로 런타임 시에 멤버를 추가할 수도 있다.


![그림 2-3. 프로토타입 객체 접근하기](/posts/attachments/ES6-%EB%AC%B8%EB%B2%95-%EC%A0%95%EB%A6%AC/img-04.png)


### 2.1.6.2 프로토타입 접근하기


프토토타입에 접근하기 위해 `__proto__`(deprecated)를 인스턴스에 사용하거나 `Object.getPrototypeOf(instance)`를 사용할 수 있다.


```javascript
function Hello(name) {
  this.name = name;
}
const hello = new Hello('hello');
Object.getPrototypeOf(hello) === Hello.prototype; // true
```


### 2.1.6.3 네이티브 객체 프로토타입


자바스크립트의 `Array`, `String` 등의 내장 객체 역시 자신의 프로토타입을 가지고 있다.


배열을 선언해 늘 사용하던 `map`, `filter` 등을 사용해 조작하고 문자열을 선언해 `split` 등의 연산을 할 수 있게 해주는 이유이다.


![그림 2-4. 네이티브 객체 프로토타입](/posts/attachments/ES6-%EB%AC%B8%EB%B2%95-%EC%A0%95%EB%A6%AC/img-05.png)


```javascript
const arr = [1,2,3,4,5];
console.log(Object.getPrototypeOf(arr))  //Array prototype
const str = "Hello world!";
console.log(Object.getPrototypeOf(str)) //String prototype
const date = new Date();
console.log(Object.getPrototypeOf(date)) //Date prototype
```


### 2.1.6.4 프로토타입 체인


![그림 2-5. 프로토타입 체인](/posts/attachments/ES6-%EB%AC%B8%EB%B2%95-%EC%A0%95%EB%A6%AC/img-06.png)


모든 객체들은 메소드와 속성을 상속받기 위한 명세로 프로토타입 객체를 가진다고 했다.


이는 프로토타입 객체도 또 다시 상위 프로토타입 객체로부터 상속받을 수 있고 그 상위도 마찬가지인데 이를 `프로토타입 체인`이라고 한다.


다른 객체에 정의된 메소드와 속성을 한 객체에서 사용할 수 있게 해준다.


객체 자신의 것 뿐 아니라 `[[Prototype]]`가 가리키는 링크를 따라 부모 역할을 하는 모든 프로토 타입 객체의 속성이나 메소드에 접근할 수 있다.


```javascript
const obj = {hello: 'world'};
const str = 'hello'
Object.prototype.hi = function() {console.log('hi')};
obj.hi(); // hi
str.hi(); // hi
```


특정 객체에서 특정 속성이나 메소드에 접근할 때 자바스크립트 엔진에서 먼저 객체 본인이 가진 것인지 파악하고 없는 경우 프로토타입 체이닝이 일어나며 부모 역할이 되는 상위 객체를 향해 속성이나 메소드를 탐색해 나가고 존재하는지 찾다가 마지막에는 `Object.prototype`까지 찾는다.


본질적으로 모든 프로토타입이 객체이기 때문에 다른 모든 프로토타입에서도 발생하며 최상위의 `Object.prototype`에서도 찾지 못하게 된다면 `undefined`를 리턴한다.


```javascript
const num = 55;
num.push // undefined;
num.push() // Uncaught TypeError: num.push is not a function
Object.prototype.push = function() {return this + 1};
num.push() // 56;
```


### 2.1.6.5 프로토타입의 이점

- **메모리 효율성**
    - 자바스크립트에서 모든 객체는 **프로토타입을 공유**한다.
    - 객체 자체가 스스로 메소드와 속성을 모두 가지는 대신 여러 객체가 동일한 프로토타입을 공유하도록하고 이를 사용하면 메모리를 효율적으로 사용할 수 있다.
- **객체지향 (스러움)**
    - 프로토타입을 통해 클래스에서 `상속`해 사용하는 것 처럼 다른 객체로부터의 속성과 메소드를 사용할 수 있다.
    - 프로토타입 체인을 통해 가능한 것이며 이를 통해 코드 재사용이 가능해진다.
- **생산성**
    - 프로토타입을 통해 동일한 속성, 동작이 필요한 여러 객체들마다 이를 직접 선언하고 개발할 필요 없이 프로토타입을 이용해 관리할 수 있다.

## Reference


[https://nodejs.org/en/](https://nodejs.org/en/)


[https://thebook.io/080334/](https://thebook.io/080334/)


[https://velog.io/@remon/호이스팅hoistingvar의-문제점](https://velog.io/@remon/호이스팅hoistingvar의-문제점)


[https://velog.io/@seeh_h/%EA%B0%9D%EC%B2%B4-%EB%A6%AC%ED%84%B0%EB%9F%B4](https://velog.io/@seeh_h/%EA%B0%9D%EC%B2%B4-%EB%A6%AC%ED%84%B0%EB%9F%B4)


[https://developer.mozilla.org/ko/docs/Learn/JavaScript/Objects/Basics](https://developer.mozilla.org/ko/docs/Learn/JavaScript/Objects/Basics)


[https://www.nextree.co.kr/p7323/](https://www.nextree.co.kr/p7323/)


[https://poiemaweb.com/js-prototype](https://poiemaweb.com/js-prototype)


[https://velog.io/@pds0309/Javascript-Prototype-%EA%B8%B0%EB%B3%B8-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0](https://velog.io/@pds0309/Javascript-Prototype-%EA%B8%B0%EB%B3%B8-%EC%9D%B4%ED%95%B4%ED%95%98%EA%B8%B0)


> [!note]
>
> **이전 글**
>
> [노드의 핵심 개념과 이벤트 루프 이해하기](https://app.notion.com/p/1595ca9b265e801f9800cd5bbb9c3dd6)


> [!note]
> **다음 글 **
