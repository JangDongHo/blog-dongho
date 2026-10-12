---
title: "[모던 자바스크립트 Deep Dive] - 19 프로토타입"
description: "Java, C++과 같은 클래스 기반 객체지향 프로그래밍 언어와 달리 자바스크립트는 프로토타입 객체지향 프로그래밍 언어이다. 따라서 자바스크립트의 동작 원리를 이해하기 위해서는 프로토타입의 개념을 잘 이해하고 있어야 한다."
date: 2025-04-30
---

# 19.1. 프로토타입 객체


Java, C++과 같은 클래스 기반 객체지향 프로그래밍 언어와 달리 자바스크립트는 프로토타입 객체지향 프로그래밍 언어이다. 따라서 자바스크립트의 동작 원리를 이해하기 위해서는 프로토타입의 개념을 잘 이해하고 있어야 한다.


클래스 기반 객체지향 프로그래밍 언어는 객체 생성 이전에 클래스를 정의하고 이를 통해 객체(인스턴스)를 생성한다. 하지만 프로토타입 기반 객체지향 프로그래밍 언어는 클래스 없이도 객체를 생성할 수 있다.


자바스크립트의 모든 객체는 자신의 부모 역할을 담당하는 객체와 연결되어 있다. 그리고 이것은 마치 객체 지향의 상속 개념과 같이 부모 객체의 프로퍼티 또는 메소드를 상속받아 사용할 수 있게 한다. 이러한 부모 객체를 **Prototype(프로토타입) 객체** 또는 줄여서 Prototype(프로토타입)이라 한다.


Prototype 객체는 생성자 함수에 의해 생성된 각각의 객체에 공유 프로퍼티를 제공하기 위해 사용한다.


```javascript
const person = { name: 'Lee' };
```


![크롬 브라우저의 콘솔에서 출력한 객체의 프로퍼티](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-19-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85/img-01.png)


ECMAScript spec에서는 **자바스크립트의 모든 객체는 [[Prototype]]이라는 내부 슬롯(internal slot)을 가진다. [[Prototype]]의 값은 null 또는 객체이며 상속을 구현하는데 사용된다. [[Prototype]] 객체의 데이터 프로퍼티는 get 액세스를 위해 상속되어 자식 객체의 프로퍼티처럼 사용할 수 있다. 하지만 set 액세스는 허용되지 않는다.** 라고 되어있다.


[[Prototype]]의 값은 Prototype(프로토타입) 객체이며 __proto__ accessor property로 접근할 수 있다. __proto__ 프로퍼티에 접근하면 내부적으로 Object.getPrototypeOf가 호출되어 프로토타입 객체를 반환한다.


person 객체는 __proto__ 프로퍼티로 자신의 부모 객체(프로토타입 객체)인 Object.prototype을 가리키고 있다.


```javascript
const person = { name: 'Lee' };

console.log(person.__proto__ === Object.prototype); // true
```


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-19-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85/img-02.png)


객체를 생성할 때 프로토타입은 결정된다. 결정된 프로토타입 객체는 다른 임의의 객체로 변경할 수 있다. 이것은 부모 객체인 프로토타입을 동적으로 변경할 수 있다는 것을 의미한다. 이러한 특징을 활용하여 객체의 상속을 구현할 수 있다.


# 19.2. [[Prototype]] vs prototype 프로퍼티


모든 객체는 하나의 프로토타입 객체를 갖는다. 그리고 모든 객체는 자신의 프로토타입 객체를 가리키는 [[Prototype]] 내부 슬롯(internal slot)을 갖으며 상속을 위해 사용된다.


함수도 객체이므로 [[Prototype]] 내부 슬롯을 갖는다. 그런데 함수 객체는 일반 객체와 달리 prototype 프로퍼티도 소유하게 된다. 주의할 점은 prototype 프로퍼티는 프로토타입 객체를 가리키는 [[Prototype]] 내부 슬롯은 다르다는 것이다.


```javascript
function Person(name) {
  this.name = name;
}

var foo = new Person('Lee');

console.dir(Person); // prototype 프로퍼티가 있다.
console.dir(foo);    // prototype 프로퍼티가 없다.
```

- [[Prototype]]
    - 함수를 포함한 모든 객체가 가지고 있는 **내부 슬롯**
    - **객체의 입장에서 자신의 부모 역할을 하는 프로토타입 객체를 가리키며 함수 객체의 경우** **`Function.prototype`****를 가리킨다.**

        ```javascript
        console.log(Person.__proto__ === Function.prototype);
        ```

- prototype 프로퍼티
    - 함수 객체만 가지고 있는 **프로퍼티**
    - **함수 객체가 생성자로 사용될 때 이 함수를 통해 생성될 객체의 부모 역할을 하는 객체(프로토타입 객체)를 가리킨다.**

        ```javascript
        console.log(Person.prototype === foo.__proto__);
        ```


# 19.3. constructor 프로퍼티


프로토타입 객체는 constructor 프로퍼티를 갖는다. 이 constructor 프로퍼티는 객체의 입장에서 자신을 생성한 객체를 가리킨다.


예를 들어 Person() 생성자 함수에 의해 생성된 객체를 foo라 하자. 이 foo 객체를 생성한 객체는 Person() 생성자 함수이다. 이때 foo 객체 입장에서 자신을 생성한 객체는 Person() 생성자 함수이며, foo 객체의 프로토타입 객체는 Person.prototype이다. 따라서 프로토타입 객체 Person.prototype의 constructor 프로퍼티는 Person() 생성자 함수를 가리킨다.


```javascript
function Person(name) {
  this.name = name;
}

var foo = new Person('Lee');

// Person() 생성자 함수에 의해 생성된 객체를 생성한 객체는 Person() 생성자 함수이다.
console.log(Person.prototype.constructor === Person);

// foo 객체를 생성한 객체는 Person() 생성자 함수이다.
console.log(foo.constructor === Person);

// Person() 생성자 함수를 생성한 객체는 Function() 생성자 함수이다.
console.log(Person.constructor === Function);
```


# 19.4. Prototype chain


자바스크립트는 특정 객체의 프로퍼티나 메소드에 접근하려고 할 때 해당 객체에 접근하려는 프로퍼티 또는 메소드가 없다면 [[Prototype]]이 가리키는 링크를 따라 자신의 부모 역할을 하는 프로토타입 객체의 프로퍼티나 메소드를 차례대로 검색한다. 이것을 프로토타입 체인이라 한다.


```javascript
var student = {
  name: 'Lee',
  score: 90
}

// Object.prototype.hasOwnProperty()
console.log(student.hasOwnProperty('name')); // true
```


student 객체는 hasOwnProperty 메소드를 가지고 있지 않으므로 false가 반환되어야 하나 true가 출력되었다. 이는 student 객체의 [[Prototype]]이 가리키는 링크를 따라가서 student 객체의 부모 역할을 하는 프로토타입 객체 (Object.prototype)의 메소드 hasOwnProperty를 호출하였기 때문에 가능한 것이다.


```javascript
var student = {
  name: 'Lee',
  score: 90
}

console.log(student.hasOwnProperty('name')); // true
console.log(student.__proto__ === Object.prototype); // true
console.log(Object.prototype.hasOwnProperty('hasOwnProperty')); // true
```


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-19-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85/img-03.png)

> 객체 리터럴을 사용하여 객체를 생성한 경우, 그 객체의 프로토타입 객체는 Object.prototype이다.

## 19.4.1. 객체 리터럴 방식으로 생성된 객체의 프로토타입 체인


객체 생성 방법은 3가지가 있다.

1. 객체 리터럴
2. 생성자 함수
3. Object() 생성자 함수

객체 리터럴 방식으로 생성된 객체는 결국 내장 함수(Built-in)인 Object() 생성자 함수로 객체를 생성하는 것을 단순화시킨 것이다. 자바스크립트 엔진은 객체 리터럴로 객체를 생성하는 코드를 만나면 내부적으로 Object() 생성자 함수를 사용하여 객체를 생성한다.


Object() 생성자 함수는 물론 함수이다. 따라서 함수 객체인 Object() 생성자 함수는 일반 객체와 달리 prototype 프로퍼티가 있다.

- prototype 프로퍼티는 함수 객체가 생성자로 사용될 때 이 함수를 통해 생성된 객체의 부모 역할을 하는 객체(프로토타입 객체)를 가리킨다.
- [[Prototype]]은 객체의 입장에서 자신의 부모 역할을 하는 객체, 즉 프로토타입 객체를 가리킨다.

```javascript
var me = {
  name: 'Lee',
  gender: 'male',
  sayHello: function(){
    console.log('Hi! my name is ' + this.name);
  }
};

console.log(me.__proto__ === Object.prototype);                 // true
console.log(Object.prototype.constructor === Object);           // true
console.log(Object.__proto__ === Function.prototype);           // true
console.log(Function.prototype.__proto__ === Object.prototype); // true
```


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-19-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85/img-04.png)

> 객체 리터럴을 사용하여 객체를 생성한 경우, 그 객체의 프로토타입 객체는 Object.prototype이다.

## 19.4.2. 생성자 함수로 생성된 객체의 프로토타입 체인


생성자 함수로 객체를 생성하기 위해서는 우선 생성자 함수를 정의하여야 한다.


[함수를 정의하는 방식](/1df5ca9b265e80a18056da38a6ab7ed2#1df5ca9b265e809da45af12070b18df1)은 4가지가 있다.


| **함수 정의 방식**    | **예시**                                                | **생성자 함수로 
사용 가능 여부** |
| --------------- | ----------------------------------------------------- | --------------------- |
| 함수 선언문          | `function add(x, y) { return x + y; }`                | ✅ 가능                  |
| 함수 표현식          | `const add = function(x, y) { return x + y; }`        | ✅ 가능                  |
| Function 생성자 함수 | `const add = new Function('x', 'y', 'return x + y');` | ✅ 가능                  |
| 화살표 함수          | `const add = (x, y) => x + y;`                        | ❌ **불가능**             |


중요한 점은 함수 선언문과 함수 표현식은 둘 다 내부적으로 함수 리터럴을 사용해 Function 객체를 생성한다. 따라서 어떠한 방식으로 함수 객체를 생성하여도 모든 함수 객체의 prototype 객체는 Function.prototype이다. 다만, 화살표 함수는 내부에 [[Construct]]와 prototype이 없기 때문에 new 키워드로 호출할 수 없다.


```javascript
// 생성자 함수
function Person(name) {
  this.name = name;
  this.gender = gender;
  this.sayHello = function() {
	  console.log(`Hi! My name is ${this.name}`);
  };
}

// me 객체를 생성한 생성자 함수는 Person이다.
const me = new Person('Lee', 'male');

console.log(me.__proto__ === Person.prototype);                 // true
console.log(Person.prototype.__proto__ === Object.prototype);   // true
console.log(Person.prototype.constructor === Person);           // true
console.log(Person.__proto__ === Function.prototype);           // true
console.log(Function.prototype.__proto__ === Object.prototype); // true
```


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-19-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85/img-05.png)


me 객체의 프로토타입 객체 Person.prototype 객체와 Person() 생성자 함수의 프로토타입 객체인 Function.prototype의 프로토타입 객체는 Object.prototype 객체이다.


이는 객체 리터럴 방식이나 생성자 함수 방식이나 결국은 모든 객체의 부모 객체인 Object.prototype 객체에서 프로토타입 체인이 끝나기 때문이다. 이때 Object.prototype 객체를 **프로토타입 체인의 종점(End of prototype chain)**이라 한다.


# 19.5. 프로토타입 객체의 확장


프로토타입 객체도 객체이므로 일반 객체와 같이 프로퍼티를 추가하거나 삭제할 수 있다. 그리고 이렇게 추가하거나 삭제된 프로퍼티는 즉시 프로토타입 체인에 반영된다.


```javascript
// 생성자 함수
function Person(name) {
  this.name = name;
}

// 프로토타입 메서드 추가
Person.prototype.sayHello = function () {
  console.log(`Hi! My name is ${this.name}`);
};

// me 객체를 생성한 생성자 함수는 Person이다.
const me = new Person('Lee');

// hasOwnProperty는 Object.prototype의 메서드다.
console.log(me.hasOwnProperty('name')); // true
```


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-19-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85/img-06.png)


생성자 함수 Person은 프로토타입 객체 Person.prototype과 prototype 프로퍼티에 의해 바인딩되어 있다. 위의 예에서는 Person.prototype 객체에 메소드 sayHello를 추가하였다. 이때 sayHello 메소드는 프로토타입 체인에 반영된다. 따라서 Person 생성자 함수를 통해 생성된 모든 객체는 프로토타입에 추가된 sayHello 메소드를 상속받아 자신의 메서드처럼 사용할 수 있다.


```javascript
// 생성자 함수
function Person(name) {
  this.name = name;
}

// 프로토타입 메서드 추가
Person.prototype.sayHello = function () {
  console.log(`Hi! My name is ${this.name}`);
};

const me = new Person('Lee');
const you = new Person('Kim');

me.sayHello();  // Hi! My name is Lee
you.sayHello(); // Hi! My name is Kim
```


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-19-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85/img-07.png)


# 19.6. 프로토타입 객체의 교체


객체를 생성할 때 프로토타입은 결정된다. 결정된 프로토타입 객체는 다른 임의의 객체로 교체할 수 있다. 이것은 부모 객체인 프로토타입을 동적으로 교체할 수 있다는 것을 의미한다. 이러한 특징을 활용하여 객체의 상속을 구현할 수 있다.


이때 주의할 것은 프로토타입 객체를 중간에 교체하면 기존 객체와 새로 생성되는 객체가 서로 다른 프로토타입 체인을 갖게 된다는 점이다. 즉, 이미 생성된 객체는 이전에 설정된 프로토타입을 그대로 유지하고, 프로토타입을 변경한 이후에 생성된 객체만 새로운 프로토타입을 참조하게 된다.


```javascript
function Person(name) {
  this.name = name;
}

var me = new Person('Lee');

// 프로토타입 객체의 변경
Person.prototype = { gender: 'male' };

var you = new Person('Kim');

console.log(me.gender); // undefined
console.log(you.gender); // 'male'

console.log(me.constructor); // Person(name)
console.log(you.constructor); // Object()
```


![프로토타입 객체 교체 전](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-19-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85/img-08.png)


![프로토타입 객체 교체 후](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-19-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85/img-09.png)


프로토타입으로 교체한 객체 리터럴에는 constructor 프로퍼티가 없다. constructor 프로퍼티는 자바스크립트 엔진이 프로토타입을 생성할 때 암묵적으로 추가한 프로퍼티다. 따라서 you 객체의 생성자 함수를 검색하면 Person이 아닌 Object가 나온다.


# 19.7. 프로토타입 체인 동작 조건


객체의 프로퍼티를 참조하는 경우, 해당 객체에 프로퍼티가 없는 경우, 프로토타입 체인이 동작한다.


객체의 프로퍼티에 값을 할당하는 경우, 프로토타입 체인이 동작하지 않는다. 이는 객체에 해당 프로퍼티가 있는 경우, 값을 재할당하고 해당 프로퍼티가 없는 경우는 해당 객체에 프로퍼티를 동적으로 추가하기 때문이다.


```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.gender = 'male';

var me = new Person('Lee');
var you = new Person('Kim');

console.log(me.gender);
console.log(you.gender);

me.gender = 'female';

console.log(me.gender); // 'female'
console.log(you.gender); // 'male'
```


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-19-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85/img-10.png)


me 객체의 gender 프로퍼티에 값을 할당하면 프로토타입 체인이 발생하여 Person.prototype 객체의 gender 프로퍼티에 값을 재할당하는 것이 아니라 me 객체에 프로퍼티를 동적으로 추가한다.


# 참고 자료


[https://poiemaweb.com/js-prototype](https://poiemaweb.com/js-prototype)


[https://github.com/wikibook/mjs/blob/master/19.md](https://github.com/wikibook/mjs/blob/master/19.md)
