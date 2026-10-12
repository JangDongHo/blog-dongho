---
title: "자바스크립트 Promise 개념 & 예제 총정리"
description: "안녕하세요, 장동호 입니다!"
date: 2025-05-30
---

안녕하세요, 장동호 입니다!


오늘은 자바스크립트 비동기 처리의 핵심인 `Promise`에 대해 알아보겠습니다.


# Promise가 무엇인가요?

> **"A Promise is an object that may produce a single value some time in the future."**

자바스크립트에서 **Promise(프로미스)**는 **비동기 처리**에 사용되는 객체입니다.


쉽게 말해, **“아직 값은 없지만, 미래에 생길 값을 약속하는 객체”**라고 이해하면 됩니다.


**비동기 처리**란 무엇일까요?


자바스크립트는 **동기적**으로 작동하는 언어입니다. 즉, 한 줄씩 코드를 순차적으로 실행합니다.


하지만 시간이 오래 걸리는 작업이 있을 경우, 그 작업이 끝날 때까지 기다리면 전체 코드 실행이 멈춰버립니다.


이를 해결하기 위한 방법이 바로 **비동기 처리**입니다.


# Promise가 왜 필요할까요?


예를 들어 서버에서 상품 정보를 가져와야 한다고 합시다.


다음은 jQuery를 사용한 예시입니다.


```typescript
$.get('url/products/1', function(response) {
  console.log(response);
});
```


이 코드는 서버로부터 데이터를 가져오는 데 시간이 걸립니다.


만약 이 데이터가 도착하기 전에 다음 작업을 실행하면 **오류**가 발생하거나 **빈 화면**이 뜰 수 있습니다.


이 문제를 해결하기 위해 등장한 것이 바로 **Promise**입니다.


# 콜백 함수와 Promise의 차이점


기존에는 비동기 처리를 위해 **콜백 함수**를 많이 사용했습니다.


```typescript
function getData(callbackFunc) {
  $.get('url/products/1', function(response) {
    callbackFunc(response);
  });
}

getData(function(data) {
  console.log(data);
});
```


위 코드를 Promise로 바꿔보면 다음과 같습니다.


```typescript
function getData() {
  return new Promise(function(resolve, reject) {
    $.get('url/products/1', function(response) {
      resolve(response);
    });
  });
}

getData().then(function(data) {
  console.log(data);
});
```


콜백 함수로 처리하던 구조에서 `new Promise()`, `resolve()`, `then()`과 같은 프로미스 API를 사용한 구조로 바뀌었습니다. 이제 하나씩 어떤 역할들을 하는지 함께 알아보겠습니다.


# Promise의 3가지 상태


Promise를 이해할 때 가장 핵심이 되는 개념은 바로 **상태(State)**입니다.
Promise는 **비동기 작업의 진행 상황을 표현**하기 위해 총 3가지 상태를 갖습니다.


| **상태**          | **설명**                   |
| --------------- | ------------------------ |
| `Pending(대기)`   | 아직 비동기 작업이 완료되지 않은 상태    |
| `Fulfilled(이행)` | 비동기 작업이 성공적으로 완료된 상태     |
| `Rejected(실패)`  | 비동기 작업이 실패했거나 오류가 발생한 상태 |


![이미지 출처: https://inpa.tistory.com/entry/JS-📚-비동기처리-Promise](/posts/attachments/%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Promise-%EA%B0%9C%EB%85%90-%EC%98%88%EC%A0%9C-%EC%B4%9D%EC%A0%95%EB%A6%AC/img-01.png)


## 1. Pending (대기)


**아직 결과가 나오지 않은 상태**입니다.


비동기 작업이 시작되었지만, `resolve()`나 `reject()`가 호출되지 않은 상태를 의미합니다.


```typescript
const promise = new Promise((resolve, reject) => {
  // 아직 resolve도 reject도 호출되지 않음
  setTimeout(() => {
    resolve("완료");
  }, 2000);
});
```


이 경우, 2초 동안은 `Pending` 상태입니다.


UI 로딩 스피너를 보여주거나, 아직 완료되지 않은 작업을 관리할 때 이 상태를 감지해서 활용할 수 있습니다.


## 2. Fulfilled (이행)


비동기 작업이 **성공적으로 완료**되어 `resolve()`가 호출되면 이 상태가 됩니다.


```typescript
const promise = new Promise((resolve, reject) => {
  resolve("성공!");
});

promise.then(result => {
  console.log(result); // 출력: 성공!
});
```


여기서 `resolve("성공!")`이 호출되면서 상태는 `Fulfilled`가 되고, `then()`에 등록한 콜백이 실행됩니다.


API 요청, 파일 읽기, 이미지 로딩 등 성공적으로 끝났을 때 다음 동작을 연결하는 데 사용됩니다.


## 3. Rejected (실패)


비동기 작업 중에 **문제가 생기거나 실패했을 경우**, `reject()`가 호출되어 이 상태로 바뀝니다.


```typescript
const promise = new Promise((resolve, reject) => {
  reject("에러 발생!");
});

promise
  .then(result => {
    console.log("이행됨:", result);
  })
  .catch(error => {
    console.error("실패됨:", error); // 출력: 실패됨: 에러 발생!
  });
```


서버 오류, 파일 없을 때, 네트워크 장애 등 **예외 상황을 처리하는 핵심적인 상태**입니다.


`catch()` 블록을 통해 안정적인 에러 처리를 할 수 있습니다.


# Promise 핸들러


Promise가 생성되면, 그 작업은 이미 진행 중이고 언젠가는 성공하거나 실패할 것입니다. 그 성공/실패 결과를 `.then()`, `.catch()`, `.finally()` 핸들러를 통해 받아 다음 후속 작업을 수행할 수 있습니다. 프로미스 핸들러는 프로미스의 상태에 따라 실행되는 콜백 함수라고 보면 됩니다.


| 핸들러          | **설명**                                                   |
| ------------ | -------------------------------------------------------- |
| `.then()`    | 프로미스가 이행(`fulfilled`)되었을 때 실행할 콜백 함수를 등록하고, 새로운 프로미스를 반환 |
| `.catch()`   | 프로미스가 거부(`rejected`)되었을 때 실행할 콜백 함수를 등록하고, 새로운 프로미스를 반환  |
| `.finally()` | 프로미스가 이행되거나 거부될 때 상관없이 실행할 콜백 함수를 등록하고, 새로운 프로미스를 반환     |


## Promise 체이닝


Promise 체이닝이란, Promise 핸들러를 연달아 연결하는 것을 말합니다. 이렇게 하면 여러 개의 비동기 작업을 순차적으로 수행할 수 있습니다.


예를 들어 아래는 `doSomething` 함수를 호출하여 프로미스를 생성하고, `then` 메서드를 통해 이행 핸들러를 연결하는 과정을 보여줍니다. 각 이행 핸들러는 이전 프로미스의 값에 50을 더한 값을 반환하고, 마지막 이행 핸들러는 최종 값을 콘솔에 출력하게 됩니다.


```typescript
function doSomething() {
  return new Promise((resolve, reject) => {
      resolve(100)
  });
}

doSomething()
    .then((value1) => {
        const data1 = value1 + 50;
        return data1
    })
    .then((value2) => {
        const data2 = value2 + 50;
        return data2
    })
    .then((value3) => {
        const data3 = value3 + 50;
        return data3
    })
    .then((value4) => {
        console.log(value4); // 250 출력
    })
```


이런식으로 체이닝이 가능한 이유는 `then` 핸들러에서 값을 리턴하면, 그 반환값은 자동으로 프로미스 객체로 감싸져 반환되기 때문입니다. 그리고 다음 `then` 핸들러에서 반환된 프로미스 객체를 받아 처리하는 것입니다. 그래서 프로미스의 상태를 흐름도로 표현하자면 아래와 같이 됩니다.


![이미지 출처: https://joshua1988.github.io/web-development/javascript/promise-for-beginners/](/posts/attachments/%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-Promise-%EA%B0%9C%EB%85%90-%EC%98%88%EC%A0%9C-%EC%B4%9D%EC%A0%95%EB%A6%AC/img-02.png)


Promise 체이닝 도중에 **오류가 발생하면** 그 이후의 `.then()`은 건너뛰고, 가장 가까운 `.catch()`로 흐름이 이동합니다.


```typescript
function doSomething() {
  return new Promise((resolve, reject) => {
    resolve(100);
  });
}

doSomething()
  .then((value1) => {
    const data1 = value1 + 50;
    return data1;
  })
  .then((value2) => {
    throw new Error("중간에서 오류 발생!");
    const data2 = value2 + 50;
    return data2;
  })
  .then((value3) => {
    // 이 부분은 건너뜀
    const data3 = value3 + 50;
    return data3;
  })
  .catch((error) => {
    console.error("에러 처리:", error.message); // 에러 처리: 중간에서 오류 발생!
  });
```


`.catch()` 이후에 다시 `.then()`을 연결하면, **에러를 처리한 뒤 이어서 실행**이 가능합니다.


```typescript
doSomething()
  .then((value1) => {
    throw new Error("에러 발생");
  })
  .catch((error) => {
    console.log("에러 처리됨:", error.message);
    return 200; // 에러 처리 후 새로운 값 리턴
  })
  .then((value2) => {
    console.log("정상 흐름 복구됨:", value2); // 200 출력
  });
```


`.finally()`는 성공이든 실패든 무조건 마지막에 실행됩니다. 당연한 얘기지만, `finally`는 다음 핸들러에 값을 전달하지 않습니다.


```typescript
doSomething()
  .then((value1) => {
    console.log("1단계:", value1); // 100
    return value1 + 50;
  })
  .catch((err) => {
    console.error("에러 발생:", err.message);
    return 0; // 에러 발생해도 이후 처리를 위해 기본값 설정
  })
  .finally(() => {
    console.log("모든 작업 완료 (성공/실패와 무관하게 실행됨)");
  });
```


# Promise 정적 메서드


Promise는 단순히 비동기 흐름 제어만 제공하는 것이 아니라, 여러 개의 프로미스를 관리하거나 생성할 수 있는 다양한 정적 메서드를 제공합니다.


## Promise.resolve()


주어진 값을 성공 상태(fulfilled)의 프로미스로 감쌉니다.


주로 비동기 로직을 작성할 때, 값 하나를 프로미스로 취급하고 싶을 때 사용합니다.


```typescript
Promise.resolve(100)
  .then((value) => {
    console.log(value); // 100 출력
  });
```


## Promise.reject()


주어진 이유를 가지는 실패 상태(rejected)의 프로미스를 생성합니다.


테스트나 조건에 따라 강제로 실패한 Promise를 생성하고 싶을 때 사용합니다.


```typescript
Promise.reject(new Error("오류 발생"))
  .catch((error) => {
    console.error(error.message); // 오류 발생 출력
  });
```


## Promise.all()


이제 여러 개의 비동기 작업을 병렬로 처리하거나, 그 상태를 관리하는 정적 메서드들을 살펴볼 차례입니다.


`Promise.all()`은 전달된 **모든 프로미스가 성공**해야 `.then()`이 실행됩니다.


하나라도 실패하면 `.catch()`로 넘어갑니다.


```typescript
Promise.all([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
])
  .then((results) => {
    console.log(results); // [1, 2, 3]
  })
  .catch((err) => {
    console.error("하나라도 실패 시 실행됨");
  });
```


## Promise.allSettled()


모든 프로미스가 **성공하든 실패하든 상관없이** 결과를 배열로 반환합니다.


실패가 있어도 `.catch()`로 빠지지 않고, 결과를 모두 수집합니다.


각 항목은 `{ status: 'fulfilled' | 'rejected', value | reason }` 형태 입니다.


```typescript
Promise.allSettled([
  Promise.resolve("성공1"),
  Promise.reject("실패1"),
  Promise.resolve("성공2"),
])
  .then((results) => {
    console.log(results);
    /*
    [
      { status: 'fulfilled', value: '성공1' },
      { status: 'rejected', reason: '실패1' },
      { status: 'fulfilled', value: '성공2' }
    ]
    */
  });
```


## Promise.any()


전달된 프로미스 중 **하나라도 성공하면** 바로 성공을 반환합니다.


모든 프로미스가 실패해야만 `.catch()`로 넘어갑니다.


```typescript
Promise.any([
  Promise.reject("에러1"),
  Promise.reject("에러2"),
  Promise.resolve("성공1"),
])
  .then((result) => {
    console.log("첫 성공:", result); // "성공1"
  })
  .catch((err) => {
    console.error("모두 실패했을 때만 실행됨");
  });
```


## Promise.race()


가장 먼저 완료되는(성공 또는 실패) 프로미스의 결과를 반환합니다.


속도가 가장 빠른 결과에만 관심이 있을 때 사용합니다.


```typescript
const fast = new Promise((resolve) =>
  setTimeout(() => resolve("빠름"), 100)
);
const slow = new Promise((resolve) =>
  setTimeout(() => resolve("느림"), 1000)
);

Promise.race([fast, slow]).then((value) => {
  console.log(value); // 빠름
});
```


# 콜백 지옥을 이은 Promise 지옥


ES6에서 등장한 Promise는 콜백 지옥(Callback Hell)을 해결하기 위한 구세주처럼 등장했습니다.


하지만 콜백 못지않게 프로미스의 `then()` 메서드가 지나치게 체인되어 반복되면 콜백 지옥과 크게 다르지 않은Promise 지옥이 발생합니다.


```typescript
doSomething().then((res1) => {
  doAnother(res1).then((res2) => {
    doMore(res2).then((res3) => {
      console.log(res3);
    });
  });
});
```


이를 또다시 극복하기 위해 나온 자바스크립트 신세대 문법이 있는데 바로 `async/await` 키워드입니다. `async/await` 키워드는 ES8에서 도입된 비동기 처리를 위한 문법으로, 프로미스를 기반으로 하지만 `then`과 `catch` 메서드를 사용하지 않고 비동기 작업을 수행할 수 있습니다. `async/await` 키워드를 사용하면 비동기 작업을 마치 동기 작업처럼 쓸 수 있어서 코드가 간결하고 가독성이 좋아지게 됩니다.


```typescript
async function run() {
  try {
    const res1 = await doSomething();
    const res2 = await doAnother(res1);
    const res3 = await doMore(res2);
    console.log(res3);
  } catch (err) {
    console.error(err);
  }
}
```


`async/await` 문법에 대해서는 추후 다른 포스팅에서 자세히 다루겠습니다.


# 정리

1. **Promise는 비동기 작업의 성공/실패 상태를 표현**하는 객체로, 콜백 지옥을 해결하기 위해 ES6에서 도입되었습니다.
2. `.then()`, `.catch()`, `.finally()`**를 이용한 체이닝 구조**는 가독성을 높이고 비동기 흐름을 명확하게 만듭니다.
3. **Promise는 값을 반환하거나 예외를 던져 다음 핸들러로 전달**되기 때문에, 흐름 제어 및 에러 처리가 유연합니다.

# 참고 자료


[https://joshua1988.github.io/web-development/javascript/promise-for-beginners/](https://joshua1988.github.io/web-development/javascript/promise-for-beginners/)


[https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000002928532](https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000002928532)


[https://inpa.tistory.com/entry/JS-%F0%9F%93%9A-%EB%B9%84%EB%8F%99%EA%B8%B0%EC%B2%98%EB%A6%AC-Promise](https://inpa.tistory.com/entry/JS-%F0%9F%93%9A-%EB%B9%84%EB%8F%99%EA%B8%B0%EC%B2%98%EB%A6%AC-Promise)
