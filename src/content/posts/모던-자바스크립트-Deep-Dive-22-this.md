---
title: "[모던 자바스크립트 Deep Dive] - 22 this"
description: "안녕하세요, 장동호입니다!"
date: 2025-05-24
---

안녕하세요, 장동호입니다!


오늘은 자바스크립트 개발자라면 반드시 이해하고 있어야할 `this`에 대해 이야기해보려 합니다.


# 1. `this`란 무엇인가?


객체지향 언어에서 `this`는 일반적으로 **해당 메서드가 속한 객체 자기 자신**을 가리킵니다. 자바스크립트에서도 비슷하게 작동할 거라 예상할 수 있겠지만, 실제로는 조금 다릅니다.


왜냐하면 **자바스크립트 함수는 일급 객체**이기 때문입니다. 다시 말해, 함수는 변수에 할당되거나 인자로 전달될 수 있고, 다른 함수의 반환값이 될 수도 있습니다. 이로 인해 함수가 호출되는 **환경**에 따라 `this`가 가리키는 대상이 달라지게 됩니다.


```typescript
const myFunc = func
```


```typescript
function func1(func2) {}
```


```typescript
function func1() {
	...
	return func1
}
```


# 2. `this`는 어떻게 바인딩될까?


자바스크립트에서 함수가 실행되면 **실행 컨텍스트**가 생성되고, 이 안에 `this`를 포함한 다양한 정보가 저장됩니다. 이 `this`는 **함수가 호출될 때** 어떤 방식으로 호출되느냐에 따라 결정됩니다.


자바스크립트의 `this` 바인딩 규칙은 다음 4가지입니다.

1. **기본 바인딩 (Default Binding)**
2. **암시적 바인딩 (Implicit Binding)**
3. **명시적 바인딩 (Explicit Binding)**
4. **new 바인딩 (Constructor Binding)**

이들 사이에는 **우선순위**가 있으며, 아래로 갈수록 우선순위가 높습니다.


## 2.1. 기본 바인딩 (Default Binding)


```typescript
function showThis() {
  console.log(this);
}
showThis();
```


위처럼 **일반 함수를 호출**하면 `this`는 **전역 객체**를 가리킵니다.

- 브라우저 환경: `window`
- Node.js 환경: `global` (단, 모듈 내부에서는 `{}`)

하지만 **엄격 모드(strict mode)**에선 `this`가 `undefined`가 됩니다.


## 2.2. 암시적 바인딩 (**Implicit Binding)**


```typescript
const person = {
	name: '동호',
	getName() {
		return this.name;
	}
};
console.log(person.getName()); // 동호
```


위처럼 **객체의 메서드로 호출**되면, `this`는 **메서드를 호출한 객체**를 가리킵니다.


즉, `getName()` 함수의 `this`는 `obj`입니다.


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-22-this/img-01.png)


```typescript
const anotherPerson = {
	name: '유진',
};
anotherPerson.getName = person.getName;

console.log(anotherPerson.getName()); // 유진
```


메서드를 다른 객체에 참조로 복사하더라도, 호출 객체에 따라 `this`가 바뀌는 모습을 확인할 수 있습니다.


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-22-this/img-02.png)


```typescript
function printName(callback) {
	console.log(callback());
}

const person = {
	name: '동호',
	getName() {
		return this.name;
	}
};

printName(person.getName); // undefined
```


그렇다면 조금 변형해서 위와 같이 객체의 메서드를 콜백으로 넘겼을 때 `this`가 어떻게 동작하는지 알아보겠습니다. 위 코드에서는 `person.getName`을 `printName`에 넘기고 있는데, 이 구문은 단순히 `person.getName`이라는 메서드를 호출하지 않고 참조해서 함수로 전달하고 있다는 점이 핵심입니다. 이 경우 함수 내부에서의 `this`는 `person`을 참조하지 않습니다. 결과적으로 `this.name`은 `undefined`가 됩니다.


자바스크립트에서 `this`는 함수를 호출하는 방식에 따라 결정됩니다. 위 예제에서 `person.getName`을 콜백으로 넘기면 객체 정보가 끊긴 채로 함수만 호출되기 때문에 `this`는 더 이상 `person`을 가리키지 않고 `undefined`가 되며, 브라우저 환경에서는 전역 객체(`window`)를 가리킬 수도 있습니다.


## 2.3. **명시적 바인딩 (Explicit Binding)**


명시적 바인딩(`call()`, `apply()`, `bind()`)을 사용하면 **함수가 호출되는 방식과 상관없이** **`this`****를 명확하게 지정**할 수 있습니다.


예를 들어, 위 문제를 `bind`를 사용해서 해결할 수 있습니다.


```typescript
function printName(callback) {
  console.log(callback());
}

const person = {
  name: '동호',
  getName() {
    return this.name;
  }
};

printName(person.getName);              // undefined (this가 끊김)
printName(person.getName.bind(person)); // '동호' (this를 명시적으로 고정)
```


`bind`를 사용해 `person`을 명시적으로 `this`에 고정했기 때문에, 호출 방식이 바뀌어도 this가 올바른 객체를 가리킵니다. 따라서, 콜백 함수로 넘겨 호출해도 문제가 없습니다.


`call`과 `apply`는 함수 호출 시점에 this를 **명시적으로 지정**하는 메서드입니다.


두 메서드 모두 첫 번째 인자로 this로 사용할 객체를 넘겨주고, 그 뒤로 함수 인자를 넘깁니다.

- `call`: 함수에 넘기는 인자를 **개별적으로 나열**
- `apply`: 함수에 넘기는 인자를 **배열로 묶어서** 전달

```typescript
function printName(callback) {
  // callback을 호출할 때 this를 person으로 지정
  console.log(callback.call(person));
}

const person = {
  name: '동호',
  getName() {
    return this.name;
  }
};

printName(person.getName); // 동호
```


## 2.4. **new 바인딩 (Constructor Binding)**


```typescript
function Circle(radius) {
  this.radius = radius;
  this.getDiameter = function () {
    return 2 * this.radius;
  };
}

const circle1 = new Circle(5);
const circle2 = new Circle(10);

console.log(circle1.getDiameter()); // 10
console.log(circle2.getDiameter()); // 20
```


위처럼 **생성자 함수 내부**의 `this`는 생성자 함수가 (미래에) **생성할 인스턴스**를 가리킵니다.


일반 함수와 동일한 방법으로 생성자 함수를 정의하고 `new` 연산자와 함께 호출하면 해당 함수는 생성자 함수로 동작합니다.


```typescript
const circle3 = Circle(15);

console.log(circle3); // undefined

console.log(radius); // 15
```


만약 `new` 연산자와 함께 생성자 함수를 호출하지 않으면 생성자 함수가 아니라 일반 함수로 동작합니다. 따라서, 일반 함수로 호출된 `Circle`에는 반환문이 없으므로 암묵적으로 `undefined`를 반환하게 되고, `Circle` 내부의 `this`는 전역 객체를 가리킵니다. (`window.radius = 15`)


# 3. 화살표 함수에서의 `this` 동작 방식


```typescript
function printName(callback) {
  console.log(callback());
}

const person = {
  name: '동호',
  getName() {
    return this.name;
  }
};

printName(() => person.getName()); // 동호
```


화살표 함수(`() ⇒ {}`)는 기존 함수와 다르게 **자신만의** **`this`** **바인딩을 가지지 않습니다**. 대신, **화살표 함수가 선언된 위치의 상위 스코프에 있는** **`this`****를 그대로 사용**합니다. 


**일반 함수**는 호출 방식에 따라 `this`가 동적으로 결정되지만, **화살표 함수**는 자신만의 `this`가 없고, 선언된 위치의 상위 스코프 `this`를 그대로 씁니다. 그래서 콜백으로 넘길 때 화살표 함수로 감싸면, 내부에서 호출하는 일반 함수는 원래 객체의 `this`를 유지할 수 있습니다.


# 참고 자료


[https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000002928532](https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000002928532)


[https://www.youtube.com/watch?v=7RiMu2DQrb4&ab_channel=%EC%9A%B0%EC%95%84%ED%95%9C%ED%85%8C%ED%81%AC](https://www.youtube.com/watch?v=7RiMu2DQrb4&ab_channel=%EC%9A%B0%EC%95%84%ED%95%9C%ED%85%8C%ED%81%AC)
