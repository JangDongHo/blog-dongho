---
title: "[모던 자바스크립트 Deep Dive] - 18 함수와 일급 객체"
description: "일급 객체는 프로그래밍 언어에서 다른 값들과 동일하게 다뤄질 수 있는 객체를 말한다."
date: 2025-04-28
---

# 18.1. 일급 객체


일급 객체는 프로그래밍 언어에서 **다른 값들과 동일하게 다뤄질 수 있는 객체**를 말한다.


1급 객체의 조건은 다음과 같다.

1. 변수에 할당할 수 있다.
2. 함수의 인자로 전달할 수 있다.
3. 함수의 반환값으로 사용할 수 있다.

대부분의 프로그래밍 언어에서 **숫자**와 같은 기본 데이터 타입은 1급 객체의 조건을 만족한다. 예를 들어, 숫자는 변수에 저장하고, 함수에 인자로 전달하며, 함수에서 반환값으로 받을 수 있다.


일급 객체는 숫자와 같은 기본 데이터 타입뿐만 아니라, 함수도 포함할 수 있다. 자바스크립트는 함수가 일급 객체로 다뤄지는 언어다. 즉, 함수는 변수에 저장할 수 있고, 다른 함수에 인자로 전달하거나, 다른 함수에서 반환값으로 사용할 수 있다.


```javascript
// 함수 할당
const greet = function(name) {
  return `Hello, ${name}!`;
};

// 함수 인자로 전달
function executeGreeting(greetingFunction, name) {
  return greetingFunction(name);
}

console.log(executeGreeting(greet, "Alice"));  // "Hello, Alice!"
```


위 코드에서 `greet` 함수는 변수에 할당되어, `executeGreeting` 함수의 인자로 전달되고, `executeGreeting` 함수는 `greet` 함수를 실행하는 역할을 한다.


## 18.1.1. 1급 객체가 중요한 이유


함수가 1급 객체라는 사실은 겉으로 봤을 땐 그리 특별하지 않다. 함수를 그냥 주고받을 수 있다는 것 뿐이지만 이것이 아주 큰 차이점을 만든다.


가장 중요한 장점은 바로 **고차 함수(High-Order Functions)**가 가능하다는 점이다. 자바스크립트의 `each`, `filter`, `map`, `sort` 등의 함수들이 얼마나 편리한지는 잘 알고 있을 것이다. 인자로 목적에 맞는 함수를 하나 넘겨주면 아주 쉽게 처리가 된다.


```javascript
const numbers = [1, 2, 3, 4];
const squaredNumbers = numbers.map(function(num) {
  return num * num;
});

console.log(squaredNumbers);  // [1, 4, 9, 16]
```


위 코드에서 **map 함수**는 배열을 순회하며 각 요소에 대해 **함수**를 실행한다. 이처럼 **함수를 매개변수로 전달**하여 매우 **유연하고 간결한 코드**를 작성할 수 있다.


## 18.1.2. 다른 언어와의 차이


자바스크립트에서 **함수는 1급 객체**이지만, 다른 언어에서는 그렇지 않다. 예를 들어, **자바**에서는 Comparator와 같은 인터페이스를 사용하여 비교 작업을 할 때, **함수 대신 객체를 전달**해야 한다. 이 경우, 함수를 매개변수로 전달하려면 새로운 클래스를 작성해야 하는 번거로움이 있다.


```java
Collections.sort(list, new Comparator<Integer>() {
  public int compare(Integer o1, Integer o2) {
    return o1 - o2;
  }
});
```


하지만 자바스크립트에서는 **함수를 인자로 직접 전달**할 수 있기 때문에, **직접적인 비교 함수**만 전달하면 된다.


```javascript
list.sort(function(o1, o2) {
  return o1 - o2; // 오름차순 정렬
});
```


이처럼 **자바스크립트**에서는 함수의 **1급 객체**로서의 특성을 활용하여 간단하고 유연하게 코드를 작성할 수 있지만, **자바**와 같은 다른 언어에서는 **객체 기반의 접근 방식**을 사용해야 하므로 구현 방식이 다를 수 있다.


# 18.2. 함수 객체의 프로퍼티


함수는 객체다. 따라서 함수도 프로퍼티를 가질 수 있다. 브라우저 콘솔에서 `console.dir` 메서드를 사용하여 함수 객체의 내부를 들여다보자.


```javascript
function square(number) {
  return number * number;
}

console.dir(square);
```


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-18-%ED%95%A8%EC%88%98%EC%99%80-%EC%9D%BC%EA%B8%89-%EA%B0%9D%EC%B2%B4/img-01.png)


square 함수의 모든 프로퍼티의 프로퍼티 어트리뷰트를 `Object.getOwnPropertyDescriptors` 메서드로 확인해 보면 다음과 같다.


```javascript
function square(number) {
  return number * number;
}

console.log(Object.getOwnPropertyDescriptors(square));
/*
{
  length: {value: 1, writable: false, enumerable: false, configurable: true},
  name: {value: "square", writable: false, enumerable: false, configurable: true},
  arguments: {value: null, writable: false, enumerable: false, configurable: false},
  caller: {value: null, writable: false, enumerable: false, configurable: false},
  prototype: {value: {...}, writable: true, enumerable: false, configurable: false}
}
*/

// __proto__는 square 함수의 프로퍼티가 아니다.
console.log(Object.getOwnPropertyDescriptor(square, '__proto__')); // undefined

// __proto__는 Object.prototype 객체의 접근자 프로퍼티다.
// square 함수는 Object.prototype 객체로부터 __proto__ 접근자 프로퍼티를 상속받는다.
console.log(Object.getOwnPropertyDescriptor(Object.prototype, '__proto__'));
// {get: ƒ, set: ƒ, enumerable: false, configurable: true}
```


이처럼 `arguments`, `caller`, `length`, `name`, `prototype` 프로퍼티는 모두 함수 객체의 데이터 프로퍼티다. 이들 프로퍼티는 일반 객체에는 없는 함수 객체 고유의 프로퍼티다. 하지만 `__proto__`는 접근자 프로퍼티이며, 함수 객체 고유의 프로퍼티가 아니라 `Object.prototype` 객체의 프로퍼티를 상속받은 것을 알 수 있다. `Object.prototype` 객체의 프로퍼티는 모든 객체가 상속받아 사용할 수 있다. 즉, `Object.prototype` 객체의 `__proto__` 접근자 프로퍼티는 모든 객체가 사용할 수 있다.


상속에 대해서는 다음 장에서 자세히 살펴보고, 이제 함수 객체의 프로퍼티에 대해 하나씩 살펴보도록 하자.


## 18.2.1. arguments 프로퍼티


함수 객체의 arguments 프로퍼티 값은 arguments 객체다. arguments 객체는 함수 호출 시 전달된 인수(argument)들의 정보를 담고 있는 순회 가능한(iterable) 유사 배열 객체이며, 함수 내부에서 지역 변수처럼 사용된다.


자바스크립트는 함수의 매개변수와 인수의 개수가 일치하는지 확인하지 않는다. 따라서 함수 호출 시 매개변수 개수만큼 인수를 전달하지 않아도 에러가 발생하지 않는다.


```javascript
function multiply(x, y) {
  console.log(arguments);
  return x * y;
}

console.log(multiply());        // NaN
console.log(multiply(1));       // NaN
console.log(multiply(1, 2));    // 2
console.log(multiply(1, 2, 3)); // 2
```


함수를 정의할 때 선언한 매개변수는 함수 몸체 내부에서 변수와 동일하게 취급된다. 즉, 함수가 호출되면 함수 몸체 내에서 암묵적으로 매개변수가 선언되고 undefined로 초기화된 이후 인수가 할당된다.


선언된 매개변수의 개수보다 인수를 적게 전달했을 경우 인수가 전달되지 않은 매개변수는 undefined로 초기화된 상태를 유지하고, 더 많이 전달할 경우 초과된 인수는 무시된다.


그렇다고 초과된 인수가 그냥 버려지는 것은 아니고, 모든 인수는 암묵적으로 arguments 객체의 프로퍼티로 보관된다.


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-18-%ED%95%A8%EC%88%98%EC%99%80-%EC%9D%BC%EA%B8%89-%EA%B0%9D%EC%B2%B4/img-02.png)


arguments 객체는 인수를 프로퍼티 값으로 소유하며 프로퍼티 키는 인수의 순서를 나타낸다. arguments 객체의 callee 프로퍼티는 호출되어 arguments 객체를 생성한 함수, 즉 함수 자신을 가리키고 arguments 객체의 length 프로퍼티는 인수의 개수를 가리킨다.


> [!note]
> 💡 **arguments 객체의 Symbol(Symbol.iterator) 프로퍼티**


arguments 객체는 매개변수 개수를 확정할 수 없는 **가변 인자 함수**를 구현할 때 유용하다.


```javascript
function sum() {
  let res = 0;

  // arguments 객체는 length 프로퍼티가 있는 유사 배열 객체이므로 for 문으로 순회할 수 있다.
  for (let i = 0; i < arguments.length; i++) {
    res += arguments[i];
  }

  return res;
}

console.log(sum());        // 0
console.log(sum(1, 2));    // 3
console.log(sum(1, 2, 3)); // 6
```


arguments 객체는 배열 형태로 인자 정보를 담고 있지만 실제 배열이 아닌 유사 배열 객체(array-like object)다. 유사 배열 객체란 length 프로퍼티를 가진 객체로 for 문으로 순회할 수 있는 객체를 말한다. 유사 배열 객체는 배열이 아니므로 배열 메서드를 사용할 경우 에러가 발생한다. 따라서 유사 배열 객체를 배열처럼 다루기 위한 몇 가지 방법을 알아보자.


```javascript
// ES5 Array.prototype.slice.call()

function example() {
    var args = Array.prototype.slice.call(arguments);
    console.log(args);
}
example(1, 2, 3);  // [1, 2, 3]
```


```javascript
// ES6 Array.from()

function example() {
    var args = Array.from(arguments);
    console.log(args);
}
example(1, 2, 3);  // [1, 2, 3]
```


```javascript
// ES6 전개 연산자(...)

function example() {
    var args = [...arguments];
    console.log(args);
}
example(1, 2, 3);  // [1, 2, 3]
```


> [!note]
> 💡 **유사 배열 객체와 이터러블**


## 18.2.2. caller 프로퍼티


caller 프로퍼티는 ECMAScript 사양에 포함되지 않은 비표준 프로퍼티다. 함수 객체의 caller 프로퍼티는 함수 자신을 호출한 함수를 가리킨다. 참고로 표준화될 예정도 없는 프로퍼티이므로 사용하지 말고 참고로만 알아두라고 한다.


```javascript
function foo(func) {
  return func();
}

function bar() {
  return 'caller : ' + bar.caller;
}

// 브라우저에서의 실행한 결과
console.log(foo(bar)); // caller : function foo(func) {...}
console.log(bar());    // caller : null
```


## 18.2.3. length 프로퍼티


함수 객체의 length 프로퍼티는 함수를 정의할 때 선언한 매개변수의 개수를 가리킨다.


```javascript
function foo() {}
console.log(foo.length); // 0

function bar(x) {
  return x;
}
console.log(bar.length); // 1

function baz(x, y) {
  return x * y;
}
console.log(baz.length); // 2
```


이 때 주의할 점은 arguments 객체의 length 프로퍼티는 인자의 개수를 가리키고, 함수 객체의 length 프로퍼티는 매개변수의 개수를 가리킨다는 점이다. 


## 18.2.4. name 프로퍼티


함수 객체의 name 프로퍼티는 함수 이름을 나타낸다.


```javascript
// 기명 함수 표현식
var namedFunc = function foo() {};
console.log(namedFunc.name); // foo

// 함수 선언문(Function declaration)
function bar() {}
console.log(bar.name); // bar
```


익명 함수 표현식의 경우 name 프로퍼티는 ES5와 ES6에서 동작을 달리하므로 주의해야 한다.


```javascript
// 익명 함수 표현식
var anonymousFunc = function() {};
// ES5: name 프로퍼티는 빈 문자열을 값으로 갖는다.
// ES6: name 프로퍼티는 함수 객체를 가리키는 변수 이름을 값으로 갖는다.
console.log(anonymousFunc.name); // anonymousFunc
```


## 18.2.5. __proto__ 접근자 프로퍼티


모든 객체는 [[Prototype]] 이라는 내부 슬롯을 갖는다. [[Prototype]] 내부 슬롯은 객체지향 프로그래밍의 상속을 구현하는 프로토타입 객체를 가리킨다.


__proto__ 프로퍼티는 [[Prototype]] 내부 슬롯이 가리키는 프로토타입 객체에 접근하기 위해 사용하는 접근자 프로퍼티다. 내부 슬롯에는 직접 접근할 수 없고 간접적인 접근 방법을 제공하는 경우에 한하여 접근할 수 있다.


```javascript
const obj = { a: 1 };

// 객체 리터럴 방식으로 생성한 객체의 프로토타입 객체는 Object.prototype이다.
console.log(obj.__proto__ === Object.prototype); // true

// 객체 리터럴 방식으로 생성한 객체는 프로토타입 객체인 Object.prototype의 프로퍼티를 상속받는다.
// hasOwnProperty 메서드는 Object.prototype의 메서드다.
console.log(obj.hasOwnProperty('a'));         // true
console.log(obj.hasOwnProperty('__proto__')); // false
```


> [!note]
> 💡 **hasOwnProperty 메서드**


## 18.2.6. prototype 프로퍼티


prototype 프로퍼티는 생성자 함수로 호출할 수 있는 함수 객체, 즉 constructor만이 소유하는 프로퍼티다. 일반 객체와 생성자 함수로 호출할 수 없는 non-constructor에는 prototype 프로퍼티가 없다.


```javascript
// 함수 객체는 prototype 프로퍼티를 소유한다.
(function () {}).hasOwnProperty('prototype'); // -> true

// 일반 객체는 prototype 프로퍼티를 소유하지 않는다.
({}).hasOwnProperty('prototype'); // -> false
```


prototype 프로퍼티는 함수가 객체를 생성하는 생성자 함수로 호출될 때 생성자 함수가 생성할 인스턴스의 프로토타입 객체를 가리킨다.


# 참고 자료


[https://bestalign.github.io/dev/first-class-object/](https://bestalign.github.io/dev/first-class-object/)


[https://m.yes24.com/Goods/Detail/92742567](https://m.yes24.com/Goods/Detail/92742567)
