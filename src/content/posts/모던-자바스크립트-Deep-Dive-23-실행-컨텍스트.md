---
title: "[모던 자바스크립트 Deep Dive] - 23 실행 컨텍스트"
description: "안녕하세요, 장동호입니다!"
date: 2025-05-25
---

안녕하세요, 장동호입니다!


오늘은 **실행 컨텍스트**란 무엇이며, 자바스크립트 엔진이 코드를 어떻게 평가하고 실행하는지 함께 알아보겠습니다.


# 실행 컨텍스트란?


한 마디로 요약하자면, **코드를 실행하는 데 필요한 모든 환경 정보를 담고 있는 객체**입니다. 실행 컨텍스트는 변수나 함수 선언, 스코프 체인, this 바인딩 등 **코드가 제대로 실행되기 위해 필요한 정보들을 관리**합니다. 


실행 컨텍스트를 바르게 이해하면 자바스크립트가 내부적으로 어떻게 실행되는지 알 수 있습니다. 이는 자바스크립트가 식별자와 식별자 바인딩을 관리하는 방식과 호이스팅이 발생하는 이유, 클로저의 동작 방식을 이해하는 데 도움을 줍니다.


## 실행 컨텍스트는 언제 생성될까?


자바스크립트 코드는 크게 세 가지 종류로 나뉘고, 각각의 코드가 실행될 때 실행 컨텍스트가 생성됩니다.


| 코드 종류     | 설명                                | 생성되는 실행 컨텍스트               |
| --------- | --------------------------------- | -------------------------- |
| 전역 코드     | 전역에 존재하는 소스코드를 말한다.               | Global Execution Context   |
| 함수 내부 코드  | 함수 내부에 존재하는 소스코드를 말한다.            | Function Execution Context |
| eval() 코드 | eval 함수에 인수로 전달되어 실행되는 소스코드를 말한다. | Eval Execution Context     |


## 실행 컨텍스트의 생성과 실행 과정


자바스크립트 엔진은 코드를 두 단계로 나누어 처리합니다.


### 1. 평가 (Creation Phase)

- 실행 컨텍스트가 생성됩니다.
- 변수, 함수 선언만 먼저 처리됩니다. (호이스팅 발생)
- 스코프에 변수 이름과 함수 이름을 미리 등록해둡니다.

### 2. 실행(Execution Phase)

- 등록된 식별자들을 실제로 실행합니다.
- 값을 할당하고, 함수를 호출합니다.

이 과정을 통해 자바스크립트는 위에서 아래로 코드를 차근차근 실행해 나갑니다.


## 실행 컨텍스트는 어디에 저장될까?


모든 실행 컨텍스트는 **실행 컨텍스트 스택(Call Stack)**에 저장됩니다. 함수가 호출될 때마다 스택 위에 새로운 실행 컨텍스트가 쌓이고, 함수 실행이 끝나면 해당 컨텍스트는 스택에서 제거됩니다.


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-23-%EC%8B%A4%ED%96%89-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8/img-01.png)


아래 코드의 동작 과정을 살펴봅시다.


```typescript
const x = 1;

function foo() {
  const y = 2;

  function bar() {
    const z = 3;
    console.log(x + y + z);
  }

  bar();
}

foo(); // 결과: 6
```

1. **전역 코드의 평가**
    - 전역 실행 컨텍스트 생성
    - 전역 변수 x, 전역 함수 foo를 실행 컨텍스트에 등록
2. **전역 코드의 실행**
    - 전역 변수 x에 값 할당, 전역 함수 foo 호출
3. **foo 함수 코드의 평가**
    - foo가 호출되면서 전역 코드의 실행은 일시 중단되고 코드의 제어권이 foo 함수 내부로 이동
    - foo 함수 실행 컨텍스트 생성
    - 지역변수 y, 중첩함수 bar가 foo 함수 실행 컨텍스트에 등록
4. **foo 함수 코드의 실행**
    - 지역 변수 y에 값이 할당
    - 중첩 함수 bar 호출
5. **bar 함수 코드의 평가**
    - 중첩 함수 bar가 호출되면 foo 함수 코드의 실행은 일시 중단되고 코드의 제어권이 bar 함수 내부로 이동
    - bar 함수 실행 컨텍스트 생성
    - 지역변수 z가 bar 함수 실행 컨텍스트에 등록
6. **bar 함수 코드의 실행**
    - 지역 변수 z에 값 할당
    - console.log() 호출
    - bar 함수 종료
7. **foo 함수 코드로 복귀**
    - bar 함수가 종료되면 자바스크립트 엔진은 bar 함수 실행 컨텍스트를 실행 컨텍스트 스택에서 팝하여 제거
    - foo 함수는 더이상 실행할 코드가 없으므로 종료
8. **전역 코드로 복귀**
    - foo 함수 실행 컨텍스트 제거
    - 전역 실행 컨텍스트 제거

실행 컨텍스트의 **최상위에 존재하는 실행 컨텍스트는 언제나 현재 실행중인 코드의 실행 컨텍스트**입니다.


## 실행 컨텍스트 내부 구조


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-23-%EC%8B%A4%ED%96%89-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8/img-02.png)


실행 컨텍스트 내부에는 `VariableEnvironment`, `LexicalEnvironment`, `this 바인딩`이 있습니다.


### 1. Variable Environment

- 선언된 변수나 함수 정보를 저장합니다.
- 최초 생성 시점의 정보(스냅샷)를 기억합니다.

### 2. Lexical Environment

- 현재 실행 중인 식별자(변수/함수)와 그 값이 담긴 곳입니다.
- 실시간으로 업데이트됩니다.
- <u>**변수 검색 및 참조가 이루어지는 핵심 공간**</u>입니다.

### 3. this 바인딩

- 현재 컨텍스트에서 this가 무엇을 가리키는지 결정합니다.
- 전역 컨텍스트에서는 `window`(브라우저) 또는 `global`(Node.js), 함수에서는 호출 방식에 따라 달라집니다.

# 렉시컬 환경이란?


**렉시컬 환경(Lexical Environment)**은 **식별자와 식별자에 바인딩된 값, 그리고 상위 스코프에 대한 참조를 기록하는 자료구조**입니다. 실행 컨텍스트 스택(Call Stack)이 코드의 실행 순서를 관리한다면 렉시컬 환경은 스코프와 식별자를 관리합니다.


![image.png](/posts/attachments/%EB%AA%A8%EB%8D%98-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Deep-Dive-23-%EC%8B%A4%ED%96%89-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8/img-03.png)


렉시컬 환경은 `EnvironmentRecord`, `OuterLexicalEnvironmentReference`로 구성됩니다.


## 1. Environment Record


`Environment Record`는 현재 **스코프 내에 선언된 식별자(identifier)** 와 그에 **바인딩된 값(value)** 을 실제로 저장하고 있는 **실제 "저장소" 역할**을 합니다.


```typescript
function foo() {
  let x = 10;
  const y = 20;
  function bar() {}
}
```


위 코드를 실행할 때 foo 함수가 호출되면 새로운 실행 컨텍스트가 생성되고, 그 안에는 렉시컬 환경이 만들어집니다. 


그리고 그 렉시컬 환경의 `Environment Record`에는 다음과 같은 정보들이 저장됩니다.


| 식별자 | 값          |
| --- | ---------- |
| x   | 10         |
| y   | 20         |
| bar | function() |


호이스팅이 일어나는 이유를 실행 컨텍스트와 연관지어 생각해봅시다.


**실행 컨텍스트는 코드 평가 단계(creation phase)에서 컨텍스트와 관련된 코드의 식별자 정보들을** **`EnvironmentRecord`****에 수집****하게 됩니다.** 그래서 실제로 코드를 실행하기 이전에 식별자에 접근할 수 있는 것이 마치 코드가 끌어올려진 것 처럼 느껴지게 되어 **호이스팅 현상**이 발생하게 됩니다.


## 2. OuterLexical Environment Reference


`Outer Lexical Environment Reference`는 현재 렉시컬 환경에서 **바로 바깥의 렉시컬 환경을 참조하는 포인터**입니다.
쉽게 말해, **스코프 체인을 연결해주는 역할**을 합니다.


```typescript
let a = 1;

function outer() {
  let b = 2;

  function inner() {
    let c = 3;
    console.log(a + b + c); // 6
  }

  inner();
}

outer();
```


위 코드에서 `inner` 함수의 렉시컬 환경은 다음처럼 연결됩니다.

1. `Environment Record`: `c = 3`
2. `OuterLexicalEnvironmentReference`: `outer` 함수의 렉시컬 환경 → `b = 2`
3. 그리고 다시 그 `outer`의 Outer Reference → 전역 렉시컬 환경 → `a = 1`

이런 식으로 참조가 연결되며, 자바스크립트 엔진은 변수를 찾기 위해 바깥 렉시컬 환경을 **체이닝하며 탐색**합니다. 이게 바로 **스코프 체인(Scope Chain)**이 작동하는 방식입니다.


# 정리

- 자바스크립트의 코드를 실행하는데 스코프, 식별자, 코드 실행 순서 등의 관리가 필요합니다. 이것을 관리해주는 객체가 실행 컨텍스트 입니다.
- 실행 컨텍스트 스택은 코드 실행 순서를 관리해 주고, 렉시컬 환경(`LexicalEnvironment`)은 식별자와 식별자에 바인딩 된 값, 상위 스코프에 대한 참조를 관리합니다.
- 렉시컬 환경의 Record는 호이스팅과 연관되어 있고, Outer는 스코프체이닝과 연관되어 있습니다.

# 참고 자료


[https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000002928532](https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000002928532)


[https://www.youtube.com/watch?v=EWfujNzSUmw&ab_channel=%EC%9A%B0%EC%95%84%ED%95%9C%ED%85%8C%ED%81%AC](https://www.youtube.com/watch?v=EWfujNzSUmw&ab_channel=%EC%9A%B0%EC%95%84%ED%95%9C%ED%85%8C%ED%81%AC)


[https://www.datoybi.com/execution-context/](https://www.datoybi.com/execution-context/)
