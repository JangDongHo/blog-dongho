---
title: "[모던 자바스크립트 Deep Dive] - 21 빌트인 객체"
description: "자바스크립트 객체는 다음과 같이 크게 3개의 객체로 분류할 수 있습니다."
date: 2025-05-21
---

# 21.1. 자바스크립트 객체의 분류


자바스크립트 객체는 다음과 같이 크게 3개의 객체로 분류할 수 있습니다.

1. **표준 빌트인 객체:** ECMAScript 사양에 정의된 객체 (실행 환경에 관계없이 사용할 수 있는 객체)
2. **호스트 객체:** 실행 환경(브라우저 또는 Node.js 환경)에서 추가로 제공하는 객체
3. **사용자 정의 객체:** 사용자가 직접 정의한 객체

# 21.2. 표준 빌트인 객체


자바스크립트는 Object, String, Number, Boolean, Sysmbol, Date, Math, RegExp, Array, Map/Set, WeakMap/WeakSet, Function, Promise, Reflect, Proxy, JSON, Error 등 40여 개의 표준 빌트인 객체를 제공합니다.


이 중에서 Math, Reflect, JSON을 제외한 표준 빌트인 객체는 모두 인스턴스를 생성할 수 있는 생성자 함수 객체입니다. 생성자 함수 객체인 표준 빌트인 객체는 프로토타입 메서드와 정적 메서드가 제공하고 생성자 함수 객체가 아닌 표준 빌트인 객체는 정적 메서드만 제공합니다.


예를 들어, 표준 빌트인 객체 String, Number, Boolean, Function, Array, Date는 생성자 함수로 호출하여 인스턴스를 생성할 수 있습니다.


```typescript
// String 생성자 함수에 의한 String 객체 생성
const strObj = new String('Lee'); // String {"Lee"}
console.log(typeof strObj);       // object

// Number 생성자 함수에 의한 Number 객체 생성
const numObj = new Number(123); // Number {123}
console.log(typeof numObj);     // object

// Boolean 생성자 함수에 의한 Boolean 객체 생성
const boolObj= new Boolean(true); // Boolean {true}
console.log(typeof boolObj);      // object

// Function 생성자 함수에 의한 Function 객체(함수) 생성
const func = new Function('x', 'return x * x'); // ƒ anonymous(x )
console.log(typeof func);                       // function

// Array 생성자 함수에 의한 Array 객체(배열) 생성
const arr = new Array(1, 2, 3); // (3) [1, 2, 3]
console.log(typeof arr);        // object

// RegExp 생성자 함수에 의한 RegExp 객체(정규 표현식) 생성
const regExp = new RegExp(/ab+c/i); // /ab+c/i
console.log(typeof regExp);         // object

// Date 생성자 함수에 의한 Date 객체 생성
const date = new Date();  // Fri May 08 2020 10:43:25 GMT+0900 (대한민국 표준시)
console.log(typeof date); // object
```


생성자 함수인 표준 빌트인 객체가 생성한 인스턴스의 프로토타입은 표준 빌트인 객체의 prototype 프로퍼티에 바인딩된 객체입니다. 예를 들어, 표준 빌트인 객체인 String을 생성자 함수로서 호출하여 생성한 String 인스턴스의 프로토타입은 String.prototype입니다.


```typescript
// String 생성자 함수에 의한 String 객체 생성
const strObj = new String('Lee'); // String {"Lee"}

// String 생성자 함수를 통해 생성한 strObj 객체의 프로토타입은 String.prototype이다.
console.log(Object.getPrototypeOf(strObj) === String.prototype); // true
```


표준 빌트인 객체의 prototype 프로퍼티에 바인딩된 객체는 다양한 기능의 빌트인 프로토타입 메서드를 제공합니다. 그리고 표준 빌트인 객체는 인스턴스 없이도 호출 가능한 빌트인 정적 메서드를 제공합니다.


예를 들어, 표준 빌트인 객체인 Number의 prototype 프로퍼티에 바인딩된 객체, Number.prototype은 다양한 기능의 빌트인 프로토타입 메서드를 제공합니다. 이 프로토타입 메서드는 모든 Number 인스턴스가 상속을 통해 사용할 수 있습니다. 그리고 표준 빌트인 객체인 Number는 인스턴스 없이 정적으로 호출할 수 있는 정적 메서드를 제공합니다.


```typescript
// Number 생성자 함수에 의한 Number 객체 생성
const numObj = new Number(1.5); // Number {1.5}

// toFixed는 Number.prototype의 프로토타입 메서드다.
// Number.prototype.toFixed는 소수점 자리를 반올림하여 문자열로 반환한다.
console.log(numObj.toFixed()); // 2

// isInteger는 Number의 정적 메서드다.
// Number.isInteger는 인수가 정수(integer)인지 검사하여 그 결과를 Boolean으로 반환한다.
console.log(Number.isInteger(0.5)); // false
```


# 21.3. 원시값과 래퍼 객체


그렇다면 문자열이나 숫자, 불리언 등의 원시값이 있는데도 문자열, 숫자, 불리언 객체를 생성하는 String, Number, Boolean 등의 표준 빌트인 생성자 함수가 존재하는 이유가 무엇일까요?


다음 예제를 살펴보겠습니다. 원시값은 객체가 아니므로 프로퍼티나 메서드를 가질 수 없다고 생각할 수도 있지만, 예상과는 다르게 원시값인 문자열이 마치 객체처럼 동작합니다.


```typescript
const str = 'hello';

// 원시 타입인 문자열이 프로퍼티와 메서드를 갖고 있는 객체처럼 동작한다.
console.log(str.length); // 5
console.log(str.toUpperCase()); // HELLO
```


이는 원시값인 문자열, 숫자, 불리언 값의 경우 이들 원시값에 대해 마치 객체처럼 마침표 표기법(또는 대괄호 표기법)으로 접근하면 자바스크립트 엔진이 일시적으로 원시값을 연관된 객체로 변환해 주기 때문에 가능한 일입니다. 이처럼 **원시값에 대해 객체처럼 접근하면 생성되는 임시 객체를 래퍼 객체(wrapper object)**라 합니다. 즉, 원시값을 객체처럼 사용하면 자바스크립트 엔진은 암묵적으로 연관된 객체를 생성하여 객체로 프로퍼티에 접근하거나 메서드를 호출하고 다시 원시값으로 되돌립니다.


다음 예제를 통해 내부 동작을 조금 더 자세히 살펴보겠습니다.


```typescript
const str = 'hi';

// 원시 타입인 문자열이 래퍼 객체인 String 인스턴스로 변환된다.
console.log(str.length); // 2
console.log(str.toUpperCase()); // HI

// 래퍼 객체로 프로퍼티에 접근하거나 메서드를 호출한 후, 다시 원시값으로 되돌린다.
console.log(typeof str); // string
```


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-21-%EB%B9%8C%ED%8A%B8%EC%9D%B8-%EA%B0%9D%EC%B2%B4/img-01.png)


문자열에 대해 마침표 표기법으로 접근하면 그 순간 래퍼 객체인 String 생성자 함수의 인스턴스가 생성되고 문자열은 [[StringData]] 내부 슬롯에 할당됩니다. 이때 문자열 래퍼 객체인 String 생성자 함수의 인스턴스는 String.prototype의 메서드를 상속받아 사용할 수 있습니다. 그 후 래퍼 객체의 처리가 종료되면 래퍼 객체의 [[StringData]] 내부 슬롯에 할당된 원시값으로 원래의 상태, 즉 식별자가 원시값을 갖도록 되돌리고 래퍼 객체는 가비지 컬렉션의 대상이 됩니다.


```typescript
// ① 식별자 str은 문자열을 값으로 가지고 있다.
const str = 'hello';

// ② 식별자 str은 암묵적으로 생성된 래퍼 객체를 가리킨다.
// 식별자 str의 값 'hello'는 래퍼 객체의 [[StringData]] 내부 슬롯에 할당된다.
// 래퍼 객체에 name 프로퍼티가 동적 추가된다.
str.name = 'Lee';

// ③ 식별자 str은 다시 원래의 문자열, 즉 래퍼 객체의 [[StringData]] 내부 슬롯에 할당된 원시값을 갖는다.
// 이때 ②에서 생성된 래퍼 객체는 아무도 참조하지 않는 상태이므로 가비지 컬렉션의 대상이 된다.

// ④ 식별자 str은 새롭게 암묵적으로 생성된(②에서 생성된 래퍼 객체와는 다른) 래퍼 객체를 가리킨다.
// 새롭게 생성된 래퍼 객체에는 name 프로퍼티가 존재하지 않는다.
console.log(str.name); // undefined

// ⑤ 식별자 str은 다시 원래의 문자열, 즉 래퍼 객체의 [[StringData]] 내부 슬롯에 할당된 원시값을 갖는다.
// 이때 ④에서 생성된 래퍼 객체는 아무도 참조하지 않는 상태이므로 가비지 컬렉션의 대상이 된다.
console.log(typeof str, str);
```


다른 숫자, 불리언 값도 마찬가지로 작동합니다. 이처럼 문자열, 숫자, 불리언 은 암묵적으로 생성되는 래퍼 객체에 의해 마치 객체러럼 사용할 수 있으며, 표준 빌트인 객체인 String, Number, Boolean의 프로토타입 메서드 또는 프로퍼티를 참조할 수 있습니다. 따라서 String, Number, Boolean 생성자 함수를 new 연산자와 함께 호출하여 문자열, 숫자, 불리언 인스턴스를 생성할 필요가 없으며 권장하지도 않습니다.


# 21.4. 전역 객체


전역 객체(global object)는 코드가 실행되기 이전 단계에 자바스크립트 엔진에 의해 어떤 객체보다도 먼저 생성되는 특수한 객체이며, 어떤 객체에도 속하지 않은 최상위 객체입니다. 전역 객체는 브라우저 환경에서는 window가 전역 객체를 가리키지만 Node.js 환경에서는 global이 전역 객체를 가리킵니다.


전역 객체는 표준 빌트인 객체와 호스트 객체, 그리고 var 키워드로 선언한 전역 변수와 전역 함수를 프로퍼티로 갖습니다. 즉, 전역 객체는 계층적 구조상 어떤 객체에도 속하지 않은 모든 빌트인 객체의 최상위 객체입니다. 전역 객체가 최상위 객체라는 것은 프로토타입 상속 관계상에서 최상위 객체라는 의미가 아닙니다. 전역 객체 자신은 어떤 객체의 프로퍼티도 아니며 객체의 계층적 구조상 표준 빌트인 객체와 호스트 객체를 프로퍼티로 소유한다는 것을 말합니다.


전역 객체의 특징은 다음과 같습니다.

- 전역 객체는 개발자가 의도적으로 생성할 수 없습니다. 즉, 전역 객체를 생성할 수 있는 생성자 함수가 제공되지 않습니다.
- 전역 객체의 프로퍼티를 참조할 때 window(또는 global)를 생략할 수 있습니다.

```typescript
// 문자열 'F'를 16진수로 해석하여 10진수로 변환하여 반환한다.
window.parseInt('F', 16); // -> 15
// window.parseInt는 parseInt로 호출할 수 있다.
parseInt('F', 16); // -> 15

window.parseInt === parseInt; // -> true
```


단, let이나 const 키워드로 선언한 전역 변수는 전역 객체의 프로퍼티가 아닙니다. let이나 const 키워드로 선언한 전역 변수는 보이지 않는 개념적인 블록(전역 렉시컬 환경의 선언적 환경 레코드) 내에 존재하게 됩니다.


```typescript
let foo = 123;
console.log(window.foo); // undefined
```


전역 객체는 몇 가지 프로퍼티와 메서드를 가지고 있습니다. 전역 객체의 프로퍼티와 메서드는 전역 객체를 가리키는 식별자, 즉 window나 global을 생략하여 참조/호출할 수 있으므로 전역 변수와 전역 함수처럼 사용할 수 있습니다. 이에 대해 살펴봅시다.


## 21.4.1. 빌트인 전역 프로퍼티


빌트인 전역 프로퍼티는 전역 객체의 프로퍼티를 의미합니다. 주로 애플리케이션 전역에서 사용하는 값을 제공합니다.


### Infinity


Infinity 프로퍼티는 무한대를 나타내는 숫자값 Infinity를 갖습니다.


```typescript
// 전역 프로퍼티는 window를 생략하고 참조할 수 있다.
console.log(window.Infinity === Infinity); // true

// 양의 무한대
console.log(3/0);  // Infinity
// 음의 무한대
console.log(-3/0); // -Infinity
// Infinity는 숫자값이다.
console.log(typeof Infinity); // number
```


### NaN


NaN 프로퍼티는 숫자가 아님(Not-a-Number)을 나타내는 숫자값 NaN을 갖습니다. NaN 프로퍼티는 Number.NaN 프로퍼티와 같습니다.


```typescript
console.log(window.NaN); // NaN

console.log(Number('xyz')); // NaN
console.log(1 * 'string');  // NaN
console.log(typeof NaN);    // number
```


### undefined


undefined 프로퍼티는 원시 타입 undefined를 값으로 갖습니다.


```typescript
console.log(window.undefined); // undefined

var foo;
console.log(foo); // undefined
console.log(typeof undefined); // undefined
```


## 21.4.2. 빌트인 전역 함수


빌트인 전역 함수는 애플리케이션 전역에서 호출할 수 있는 빌트인 함수로서 전역 객체의 메서드입니다.


### eval


eval 함수는 자바스크립트 코드를 나타내는 문자열을 받아 런타임에 실행합니다.


```typescript
// 표현식인 문
eval('1 + 2;'); // -> 3
// 표현식이 아닌 문
eval('var x = 5;'); // -> undefined

// eval 함수에 의해 런타임에 변수 선언문이 실행되어 x 변수가 선언되었다.
console.log(x); // 5

// 객체 리터럴은 반드시 괄호로 둘러싼다.
const o = eval('({ a: 1 })');
console.log(o); // {a: 1}

// 함수 리터럴은 반드시 괄호로 둘러싼다.
const f = eval('(function() { return 1; })');
console.log(f()); // 1
```


### isFinite


isFinite 함수는 전달받은 인수가 정상적인 유한수인지 확인하고 그 결과를 반환합니다. 인수가 유한수이면 true를 반환하고, 무한수이면 false를 반환합니다. 전달받은 인수의 타입이 숫자가 아닌 경우, 숫자로 타입을 변환 후 검사를 수행합니다. 이때 인수가 NaN으로 평가되는 값이라면 false를 반환하고, null이면 숫자로 변환했을 때 0이기 때문에 true를 반환합니다.


```typescript
// 인수가 유한수이면 true를 반환한다.
isFinite(0);    // -> true
isFinite(2e64); // -> true
isFinite('10'); // -> true: '10' → 10
isFinite(null); // -> true: null → 0

// 인수가 무한수 또는 NaN으로 평가되는 값이라면 false를 반환한다.
isFinite(Infinity);  // -> false
isFinite(-Infinity); // -> false

// 인수가 NaN으로 평가되는 값이라면 false를 반환한다.
isFinite(NaN);     // -> false
isFinite('Hello'); // -> false
isFinite('2005/12/12'); // -> false
```


### isNaN


isNaN 함수는 주어진 숫자가 NaN인지 확인하고 그 결과를 불리언 타입으로 반환합니다. 마찬가지로 전달받은 인수의 타입이 숫자가 아닌 경우 숫자로 타입을 변환한 후 검사를 수행합니다.


```typescript
// 숫자
isNaN(NaN); // -> true
isNaN(10);  // -> false

// 문자열
isNaN('blabla'); // -> true: 'blabla' => NaN
isNaN('10');     // -> false: '10' => 10
isNaN('10.12');  // -> false: '10.12' => 10.12
isNaN('');       // -> false: '' => 0
isNaN(' ');      // -> false: ' ' => 0

// 불리언
isNaN(true); // -> false: true → 1
isNaN(null); // -> false: null → 0

// undefined
isNaN(undefined); // -> true: undefined => NaN

// 객체
isNaN({}); // -> true: {} => NaN

// date
isNaN(new Date());            // -> false: new Date() => Number
isNaN(new Date().toString()); // -> true:  String => NaN
```


### parseFloat


parseFloat 함수는 전달받은 문자열 인수를 실수(부동 소수점 숫자)로 해석하여 변환합니다.


```typescript
// 문자열을 실수로 해석하여 반환한다.
parseFloat('3.14');  // -> 3.14
parseFloat('10.00'); // -> 10

// 공백으로 구분된 문자열은 첫 번째 문자열만 변환한다.
parseFloat('34 45 66'); // -> 34
parseFloat('40 years'); // -> 40

// 첫 번째 문자열을 숫자로 변환할 수 없다면 NaN을 반환한다.
parseFloat('He was 40'); // -> NaN

// 앞뒤 공백은 무시된다.
parseFloat(' 60 '); // -> 60
```


### parseInt


parseInt 함수는 전달받은 문자열 인수를 정수로 해석하여 반환합니다.


```typescript
// 문자열을 정수로 해석하여 반환한다.
parseInt('10');     // -> 10
parseInt('10.123'); // -> 10
```


### encodeURI/decodeURI


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-21-%EB%B9%8C%ED%8A%B8%EC%9D%B8-%EA%B0%9D%EC%B2%B4/img-02.png)


encodeURI 함수는 완전한 URI를 문자열로 전달받아 이스케이프 처리를 위해 인코딩합니다. URI는 인터넷에 있는 자원을 나타내는 유일한 주소를 말합니다. decodeURI 함수는 인코딩된 URI를 인수로 전달받아 이스케이프 처리 이전으로 디코딩합니다.


```typescript
// 완전한 URI
const uri = 'http://example.com?name=이웅모&job=programmer&teacher';

// encodeURI 함수는 완전한 URI를 전달받아 이스케이프 처리를 위해 인코딩한다.
const enc = encodeURI(uri);
console.log(enc);
// http://example.com?name=%EC%9D%B4%EC%9B%85%EB%AA%A8&job=programmer&teacher

// decodeURI 함수는 인코딩된 완전한 URI를 전달받아 이스케이프 처리 이전으로 디코딩한다.
const dec = decodeURI(enc);
console.log(dec);
// http://example.com?name=이웅모&job=programmer&teacher
```


### encodeURIComponent/decodeURIComponent


encodeURIComponent 함수는 URI 구성 요소(component)를 인수로 전달받아 인코딩합니다. decodeURIComponent 함수는 매개변수로 전달도니 URI 구성 요소를 디코딩합니다.


```typescript
// URI의 쿼리 스트링
const uriComp = 'name=이웅모&job=programmer&teacher';

// encodeURIComponent 함수는 인수로 전달받은 문자열을 URI의 구성요소인 쿼리 스트링의 일부로 간주한다.
// 따라서 쿼리 스트링 구분자로 사용되는 =, ?, &까지 인코딩한다.
let enc = encodeURIComponent(uriComp);
console.log(enc);
// name%3D%EC%9D%B4%EC%9B%85%EB%AA%A8%26job%3Dprogrammer%26teacher

let dec = decodeURIComponent(enc);
console.log(dec);
// 이웅모&job=programmer&teacher

// encodeURI 함수는 인수로 전달받은 문자열을 완전한 URI로 간주한다.
// 따라서 쿼리 스트링 구분자로 사용되는 =, ?, &를 인코딩하지 않는다.
enc = encodeURI(uriComp);
console.log(enc);
// name=%EC%9D%B4%EC%9B%85%EB%AA%A8&job=programmer&teacher

dec = decodeURI(enc);
console.log(dec);
// name=이웅모&job=programmer&teacher
```


## 21.4.3. 암묵적 전역


```typescript
var x = 10; // 전역 변수

function foo () {
  // 선언하지 않은 식별자에 값을 할당
  y = 20; // window.y = 20;
}
foo();

// 선언하지 않은 식별자 y를 전역에서 참조할 수 있다.
console.log(x + y); // 30
```


foo 함수 내의 y는 선언하지 않은 식별자로 마치 선언된 전역 변수처럼 동작합니다. 이는 선언하지 않는 식별자에 값을 할당하면 전역 객체의 프로퍼티가 되기 때문입니다.


foo 함수가 호출되면 자바스크립트 엔진은 y 변수에 값을 할당하기 위해 먼저 스코프 체인을 통해 선언된 변수인지 확인합니다. 이때 foo 함수의 스코프와 전역 스코프 어디에서도 y 변수의 선언을 찾을 수 없으므로 참조 에러가 발생합니다. 하지만 자바스크립트 엔진은 y = 20을 window.y = 20으로 해석하여 전역 객체에 프로퍼티를 동적 생성합니다. 결국 y는 전역 객체의 프로퍼티가 되어 마치 전역 변수처럼 동작하게 되는데, 이러한 현상을 **암묵적 전역(implicit global)**이라 합니다.


```typescript
var x = 10; // 전역 변수

function foo () {
  // 선언하지 않은 식별자에 값을 할당
  y = 20; // window.y = 20;
  console.log(x + y);
}

foo(); // 30

console.log(window.x); // 10
console.log(window.y); // 20

delete x; // 전역 변수는 삭제되지 않는다.
delete y; // 프로퍼티는 삭제된다.

console.log(window.x); // 10
console.log(window.y); // undefined
```
