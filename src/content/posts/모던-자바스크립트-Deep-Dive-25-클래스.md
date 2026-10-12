---
title: "[모던 자바스크립트 Deep Dive] - 25 클래스"
description: "안녕하세요, 장동호입니다!"
date: 2025-07-08
---

안녕하세요, 장동호입니다!


오늘은 클래스에 대해 이야기 해보려고 합니다.


# 클래스란?


---

> _클래스는 객체 지향 프로그래밍에서 특정 객체를 생성하기 위해 변수와 메서드를 정의하는 일종의 틀로, 객체를 정의하기 위한 상태(멤버 변수)와 메서드(함수)로 구성된다. -위키 백과-_

세상에 존재하는 다양한 사물이나 개념들은 각기 고유한 속성이나 행동을 가지고 있습니다. 예를 들어, “자동차”라는 개념을 생각해보면 색상, 제조사, 연식 등의 속성이 있고, 주행하거나 정지하는 등의 행동이 있습니다.


이러한 현실 세계의 개념을 프로그래밍적으로 모델링하기 위해 사용하는 것이 바로 클래스입니다. 클래스는 동일한 속성과 동작을 공유하는 객체들을 만들기 위한 청사진 또는 설계도 역할을 합니다.


실무에선 동일한 구조의 데이터를 반복해서 생성해야 하거나, 특정 동작을 포함한 객체를 여러 개 생성해야 하는 경우가 잦습니다. 이럴 때 `new` 연산자와 생성자 함수를 활용할 수 있습니다. ES6 이후에 도입된 **클래스(class)**라는 문법을 사용하면 객체 지향 프로그래밍에서 사용되는 다양한 기능을 자바스크립트에서도 사용할 수 있습니다.


## 기본 문법


```javascript
class MyClass {
  // 여러 메서드를 정의할 수 있음
  constructor() { ... }
  method1() { ... }
  method2() { ... }
  ...
}
```


`class` 키워드를 사용하면 위와 같은 형태로 클래스를 정의할 수 있습니다.


이렇게 클래스를 정의한 뒤 `new MyClass()`를 호출하면, 클래스 내부에 정의된 메서드와 상태를 가진 객체(인스턴스)가 생성됩니다.


`constructor()`는 클래스의 생성자로, `new` 연산자에 의해 자동으로 호출되며 객체의 초기 상태를 설정하는 역할을 합니다.


## 동작 과정


```javascript
class User {
  constructor(name) {
	  // ❶ 암묵적으로 인스턴스가 생성되고 this에 바인딩된다.
	  console.log(this); // User {}
	  console.log(Object.getPrototypeOf(this) === User.prototype); // true
	  
	  // ❷ this에 바인딩되어 있는 인스턴스를 초기화한다.
    this.name = name;
    
    // ❸ 완성된 인스턴스가 바인딩된 this가 암묵적으로 반환된다.
  }
  sayHi() {
    console.log(this.name);
  }
}

let user = new User("Dongho");
user.sayHi(); // Dongho
```


`new User(”Dongho”)`를 호출하면 자바스크립트는 다음과 같은 순서로 동작합니다.

1. **인스턴스 생성과 this 바인딩**
    - 빈 객체가 생성되고 `this`에 바인딩됩니다.
    - 이 객체의 `[[Prototype]]`은 `User.prototype`으로 설정됩니다.
2. **인스턴스 초기화**
    - `constructor` 함수가 실행됩니다.
    - `this.name = name`이 실행되면서, 인스턴스에 `name` 속성이 추가됩니다.
3. **인스턴스 반환**
    - 클래스의 모든 처리가 끝나면 완성된 인스턴스가 바인딩된 `this`가 암묵적으로 반환됩니다.

![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-25-%ED%81%B4%EB%9E%98%EC%8A%A4/img-01.png)


## 생성자 함수와 클래스의 차이


눈치가 빠른 분들이라면 클래스가 결국 생성자 함수처럼 동작한다는 사실을 눈치채셨을 겁니다. 실제로 자바스크립트에서 class 문법은 기존의 생성자 함수 방식 위에 만들어진 **문법적 설탕(syntactic sugar)**입니다. 즉, `class`는 개발자들의 편의를 위해 생성자 함수를 조금 더 다루기 편하고, 객체지향적으로 보이도록 만든 문법입니다.


아래는 동일한 동작을 하는 생성자 함수의 예시입니다.


```javascript
function User(name) {
  this.name = name;
}

User.prototype.sayHi = function () {
  console.log(this.name);
};

const user = new User("Dongho");
user.sayHi(); // Dongho
```


| 항목       | 생성자 함수               | 클래스 (`class`)                  |
| -------- | -------------------- | ------------------------------ |
| 문법 도입 시기 | 오래됨 (ES5 이전)         | ES6 (2015년) 도입                 |
| 선언 방식    | 함수                   | `class` 키워드                    |
| 생성자 정의   | 일반 함수처럼 정의           | 클래스 내부에 `constructor()` 메서드 작성 |
| 메서드 정의   | `prototype`에 수동으로 할당 | 자동으로 `prototype`에 정의           |
| 호이스팅     | 함수처럼 가능              | `let`처럼 선언 이전 접근 불가            |
| 엄격 모드    | 선택적                  | 항상 strict mode 적용              |


# 클래스 상속


---


그렇다면 자바스크립트에서 클래스 간의 **상속(Inheritance)**은 어떻게 구현할 수 있을까요?


ES6에서는 `extends` 키워드를 사용해 기존 클래스(부모 클래스)를 기반으로 새로운 클래스(자식 클래스)를 만들 수 있습니다. 이렇게 하면 부모 클래스의 속성과 메서드를 자식 클래스가 그대로 물려받아 재사용할 수 있으며, 필요하다면 일부 메서드만 오버라이딩해서 사용할 수도 있습니다.


## 기본 문법


```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a sound.`);
  }
}

class Dog extends Animal {
	// 메서드 오버라이딩
  speak() {
    console.log(`${this.name} barks.`);
  }
}

const myDog = new Dog("Buddy");
myDog.speak(); // "Buddy barks."
```


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-25-%ED%81%B4%EB%9E%98%EC%8A%A4/img-02.png)


## Super 키워드


자바스크립트 클래스에서 `super`는 부모 클래스에 접근하기 위한 키워드입니다.


주로 두 가지 상황에서 사용됩니다.

1. 자식 클래스 생성자(`constructor`) 내부에서 부모 생성자 호출
2. 자식 클래스에서 부모 클래스의 메서드를 호출

### 1. 생성자에서 `super()` 호출


```javascript
class Cat extends Animal {
  constructor(name, color) {
    super(name); // 부모 생성자 호출
    this.color = color;
  }

  info() {
    console.log(`${this.color} cat named ${this.name}`);
  }
}

const cat = new Cat("Milo", "white");
cat.speak(); // Milo makes a sound.
cat.info();  // white cat named Milo
```


자식 클래스가 `constructor`를 갖고 있다면, 반드시 `super()`를 가장 먼저 호출해야 합니다.


그 이유는 자바스크립트에서 자식 클래스는 직접 인스턴스를 생성하지 않고, 부모 클래스에게 인스턴스 생성을 위임하기 때문입니다.


따라서 `super()`가 실행되기 전까지는 `this`가 정의되지 않으며, 이를 사용하면 참조 에러(ReferenceError)가 발생합니다.


자바스크립트 엔진은 클래스 정의를 평가할 때 부모 클래스가 있는지 여부에 따라 내부적으로 `[[ConstructorKind]]` 라는 내부 슬롯을 설정합니다.

- 상속을 받지 않는 일반 클래스나 생성자 함수는 `[[ConstructorKind]]: "base"`
- 상속을 받는 자식 클래스는 `[[ConstructorKind]]: "derived"`

이 내부 슬롯을 통해 자바스크립트 엔진은 클래스가 직접 인스턴스를 만들 수 있는지, 부모에게 위임해야 하는지를 판단합니다.


즉, `derived` 클래스는 `super()`를 통해 부모의 constructor를 먼저 실행해야만 `this` 바인딩이 가능하다는 뜻입니다.


### 2. 메서드에서 `super.method()` 호출


```javascript
class Bird extends Animal {
  speak() {
    super.speak(); // 부모의 speak() 호출
    console.log(`${this.name} chirps.`);
  }
}

const bird = new Bird("Chick");
bird.speak();
// 출력:
// Chick makes a sound.
// Chick chirps.
```


`super`는 부모 클래스의 메서드에 접근할 때도 사용할 수 있습니다.


# Static 키워드


---


`static` 키워드는 클래스 내부에서 정적(static) 메서드 또는 속성을 정의할 때 사용합니다.


정적 메서드는 인스턴스가 아닌 클래스 자체에서 호출할 수 있는 메서드입니다.


```javascript
class Animal {
  // 정적 변수: 클래스에 직접 속함
  static kingdom = "Animalia";

  constructor(name) {
    this.name = name;
  }

  // 정적 메서드: 클래스에 직접 속함
  static describeKingdom() {
    console.log(`All animals belong to the ${this.kingdom} kingdom.`);
  }

  // 인스턴스 메서드: 인스턴스마다 개별 정의됨
  speak() {
    console.log(`${this.name} makes a sound.`);
  }
}

// 정적 멤버 호출 (클래스를 통해 직접 접근)
console.log(Animal.kingdom);          // "Animalia"
Animal.describeKingdom();             // "All animals belong to the Animalia kingdom."

// 인스턴스 생성 및 인스턴스 메서드 호출
const cat = new Animal("Navi");
cat.speak();                          // "Navi makes a sound."

// 아래는 에러: 인스턴스에서 정적 메서드나 변수 접근 불가
// cat.describeKingdom();             // ❌ TypeError
// console.log(cat.kingdom);          // ❌ undefined
```


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-25-%ED%81%B4%EB%9E%98%EC%8A%A4/img-03.png)


인스턴스 멤버는 클래스의 prototype 객체에 저장되어, 인스턴스가 생성될 때 이 프로토타입 체인을 통해 접근됩니다. 즉, `cat.speak()`를 호출하면 내부적으로 cat 객체에서 메서드를 찾고 없으면 `Animal.prototype`에서 메서드를 찾는 구조입니다.


반면에, 정적 멤버는 클래스 자체(`Animal` 함수 객체)에 직접 붙어 있습니다. 따라서 정적 멤버를 호출할 때는 클래스의 프로토타입 체인을 통해 접근합니다.


# Private 키워드


---


```javascript
class Person {
  constructor(name) {
    this.name = name; // 인스턴스 프로퍼티는 기본적으로 public하다.
  }
}

// 인스턴스 생성
const me = new Person('Lee');
console.log(me.name); // Lee
```


자바스크립트 클래스 필드는 기본적으로 public하기 때문에 외부에서 자유롭게 접근 및 변경이 가능합니다. 이로 인해 객체 내부 상태가 의도치 않게 변경될 수 있다는 문제가 있습니다.


이 문제를 해결하기 위해 자바스크립트에서는 `private` 멤버를 정의할 수 있도록 `#` 기호를 사용합니다. `private` 멤버는 클래스 내부에서만 접근 가능하며, 외부에서는 절대 접근할 수 없습니다.


```javascript
class Person {
  // private 필드 정의
  #name = '';

  constructor(name) {
    // private 필드에 값 할당
    this.#name = name;
  }
}

const me = new Person('Lee');
console.log(me.#name);     // SyntaxError: Private field '#name' must be declared in an enclosing class
```


## Getter와 Setter


```javascript
class Person {
  // private 필드 정의
  #name = '';

  constructor(name) {
    // private 필드에 값 할당
    this.#name = name;
  }

  // getter: private 필드 값을 읽을 때 사용
  get Name() {
    return this.#name;
  }
  
  // setter: private 필드 값을 변경할 때 사용
  set name(newName) {
    this.#name = newName;
  }
}

const person = new Person('영희');
console.log(person.name);  // 영희 (getter 호출)

person.name = '철수';      // setter 호출
console.log(person.name);  // 철수
```


클래스의 private 필드에 직접 접근할 수 없으므로, 보통은 `getter`와 `setter` 메서드를 통해 안전하게 값을 읽거나 설정합니다.


# 참고자료


---

- [https://www.youtube.com/watch?v=HujbNZ9IWF8&ab_channel=%EC%9A%B0%EC%95%84%ED%95%9C%ED%85%8C%ED%81%AC](https://www.youtube.com/watch?v=HujbNZ9IWF8&ab_channel=%EC%9A%B0%EC%95%84%ED%95%9C%ED%85%8C%ED%81%AC)
- 모던 자바스크립트 딥다이브 (p451 ~ p502)
- [https://ko.javascript.info/class#ref-1654](https://ko.javascript.info/class#ref-1654)
