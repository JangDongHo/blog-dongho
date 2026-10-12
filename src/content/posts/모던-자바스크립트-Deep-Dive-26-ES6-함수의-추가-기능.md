---
title: "[모던 자바스크립트 Deep Dive] - 26 ES6 함수의 추가 기능"
description: "안녕하세요, 장동호입니다!"
date: 2025-08-11
---

안녕하세요, 장동호입니다!


오늘은 ES6 함수의 추가 기능에 대해 이야기 해보려고 합니다.


# 함수의 구분


---


ES6 이전에는 모든 함수가 일반 함수 호출, 생성자 호출(`new`), 메서드 호출 모두 가능했습니다.


얼핏 보면 하나의 함수를 여러 용도로 사용할 수 있으니 편리해 보이지만, 


사실 이 방식은 의도치 않은 사용을 초래하고 성능 문제로 이어질 수 있습니다


```javascript
var foo = function () {
	return 1;
};

// 일반 함수 호출
foo();

// 생성자 함수 호출
new foo();

// 메서드 호출
var obj = { foo: foo };
obj.foo();
```


자바스크립트 엔진은 함수를 생성할 때 생성자 호출 가능 여부(`constructor`)에 따라 프로토타입 객체를 생성할지 말지를 결정합니다.


ES6 이전에는 모든 함수가 생성자 호출이 가능해야 했기 때문에,


생성자로 쓰지 않을 함수에도 불필요하게 `prototype` 객체가 자동으로 생성되면서 메모리 낭비로 이어졌습니다.


```javascript
// ES6 이전
function sum(a, b) {
  return a + b;
}

console.log(typeof sum.prototype); // "object"
```


위 코드에서 `sum`은 단순 계산용 함수이지만, 내부적으로 prototype 객체가 이미 만들어져 있습니다.


즉, 사용하지 않는 기능(생성자 역할)을 위해 메모리 공간과 초기화 비용을 소비하는 셈이죠.


## ES6 이후의 변화


이러한 문제를 해결하기 위해 ES6에서는 함수를 사용 목적에 따라 세 가지 종류로 명확히 구분했다.


| ES6 함수의 구분    | constructor | prototype | super | arguments |
| ------------- | ----------- | --------- | ----- | --------- |
| 일반 함수(Normal) | O           | O         | X     | O         |
| 메서드(Method)   | X           | X         | O     | O         |
| 화살표 함수(Arrow) | X           | X         | X     | X         |


ES6에서는 함수 정의 형태에 따라 **생성자 호출 가능 여부**를 명확히 구분합니다.

- 생성자 호출 가능 (`constructor: true`) → `prototype` 자동 생성
- 생성자 호출 불가능 (`constructor: false`) → `prototype` 생성 안 함

예를 들어, 화살표 함수와 메서드 축약 표현은 생성자 호출이 불가능하므로 `prototype`도 없습니다.


```javascript
const arrow = () => {};
console.log(arrow.prototype); // undefined

const obj = {
  method() {}
};
console.log(obj.method.prototype); // undefined
```


# ES6 메서드


ES6에서 메서드(Method)라는 용어는 단순히 “객체의 프로퍼티로 할당된 함수”를 의미하지 않습니다.


**오직 메서드 축약 표현으로 정의된 함수**만을 메서드로 간주합니다.


```javascript
const obj = {
  // ES6 메서드
  sayHello() {
    console.log('Hello');
  }
};

obj.sayHello(); // "Hello"
```


위 예제처럼 `function` **키워드 없이** 객체 리터럴 내부에서 정의한 함수가 바로 **ES6 메서드**입니다.


## ES6 메서드의 특징


### 1. 생성자 함수로 호출 불가 (non-constructor)


ES6 메서드는 **생성자 함수로서 호출할 수 없습니다.**


즉, `new` 키워드를 붙이면 **TypeError**가 발생합니다.


```javascript
const obj = {
  sayHello() {
    console.log('Hello');
  }
};

new obj.sayHello(); 
// TypeError: obj.sayHello is not a constructor
```


### 2. `prototype` 프로퍼티 없음


ES6 메서드는 `non-constructor`이기 때문에 메서드에는 `prototype` 객체가 생성되지 않습니다.


```javascript
console.log(obj.sayHello.prototype); // undefined
```


### 3. `[[HomeObject]]`와 `super` 참조


ES6 메서드는 내부적으로 `[[HomeObject]]`라는 숨겨진 프로퍼티를 가집니다.


이 프로퍼티는 메서드가 정의된 객체를 참조하고, `super` 키워드를 사용할 때 부모 메서드를 찾는 데 사용됩니다.


```javascript
const parent = {
  greet() {
    console.log('Hello from parent');
  }
};

const child = {
  greet() {
    super.greet();
    console.log('Hello from child');
  }
};

Object.setPrototypeOf(child, parent);
child.greet();
// Hello from parent
// Hello from child
```


이처럼 ES6 메서드는 본연의 기능(`super`)을 추가하고 의미적으로 맞지 않는 기능(`constructor`)은 제거했습니다.


따라서 메서드를 정의할 때 프로퍼티 값으로 익명 함수 표현식을 할당하는 ES6 이전의 방식은 사용하지 않는 것이 좋습니다.


# ES6 화살표 함수


ES6에서 새롭게 도입된 화살표 함수(Arrow Function)는 기존 함수 표현식보다 간결한 문법뿐만 아니라, 


동작 방식에도 중요한 차이점이 있습니다.


## ES6 화살표 함수의 주요 특징


### 1. 생성자 함수로 호출 불가 (non-constructor)


화살표 함수는 **생성자 함수로서 호출할 수 없습니다**.


즉, `new` 키워드를 붙여 호출하면 오류가 발생합니다.


```javascript
const Arrow = () => {};
new Arrow();
// TypeError: Arrow is not a constructor
```


### **2.** **`prototype`** **프로퍼티 없음**


화살표 함수는 `non-constructor`이기 때문에 `prototype` 객체가 생성되지 않습니다.


```javascript
const arrow = () => {};
console.log(arrow.prototype);// undefined
```


### 3. `this` 바인딩이 정적으로 결정됨


화살표 함수는 자신만의 `this` 바인딩을 가지지 않고, **함수가 선언된 위치의** `this`**를 그대로 사용**합니다.


이는 콜백 함수나 이벤트 핸들러 등에서 흔히 겪는 `this` 문제를 해결하는 데 매우 유용합니다.


```javascript
class Prefixer {
  constructor(prefix) {
    this.prefix = prefix;
  }

  add(arr) {
    // add 메서드는 인수로 전달된 배열 arr을 순회하며 배열의 모든 요소에 prefix를 추가한다.
    // ①
    return arr.map(function (item) {
      return this.prefix + item; // ②
      // -> TypeError: Cannot read property 'prefix' of undefined
    });
  }
}

const prefixer = new Prefixer('-webkit-');
console.log(prefixer.add(['transition', 'user-select']));
```


위 예제를 실행했을 때 기대하는 결과는 ['-webkit-transition', '-webkit-user-select']이지만, 


실제로는 `TypeError: Cannot read property 'prefix' of undefined` 오류가 발생합니다.


이는 `arr.map`에 전달된 콜백 함수 내부의 `this`가 `Prefixer` 인스턴스를 가리키지 않기 때문입니다. 


일반 함수로서 호출된 콜백은 기본적으로 `undefined`(엄격 모드) 또는 전역 객체를 가리키기 때문에, `this.prefix`에 접근할 수 없는 것입니다.


```javascript
add(arr) {
  return arr.map(item => this.prefix + item);
}
```


이 문제를 해결하기 위한 가장 좋은 방법은 **화살표 함수를 사용**하는 것입니다.


이렇게 호출하면, 화살표 함수 내부의 `this`는 `add` **메서드가 호출될 때 바인딩된** `this`**를** **그대로 사용**합니다.


만약 `prefixer.add(['a', 'b'])`처럼 호출했다면

- `add` 메서드 내부의 `this`는 `prefixer` 인스턴스를 가리키고,
- 화살표 함수의 `this`도 동일하게 `prefixer`를 가리키므로,
- `this.prefix`는 `prefixer.prefix` 값(`'-webkit-'`)이 되어 정상 작동합니다.

결과는 `['-webkit-a', '-webkit-b']`가 됩니다.


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-26-ES6-%ED%95%A8%EC%88%98%EC%9D%98-%EC%B6%94%EA%B0%80-%EA%B8%B0%EB%8A%A5/img-01.png)


# 참고 자료

- 모던 자바스크립트 Deep Dive 책 26장
- [https://ko.javascript.info/class-inheritance](https://ko.javascript.info/class-inheritance)
