---
title: "Node.js는 왜 싱글 스레드를 고집할까?"
description: "안녕하세요, 장동호입니다!"
date: 2025-05-26
---

안녕하세요, 장동호입니다!


오늘은 Node.js가 어떻게 싱글 스레드로 동시에 여러 작업을 처리하는지 이야기해 보려고 합니다.


# Node.js는 왜 싱글 스레드를 고집할까?


백엔드 개발자의 중요한 임무는 **많은 클라이언트의 요청을 빠르고 안정적으로 처리하는 것**입니다. 사용자가 많아질수록 서버는 효율적으로 자원을 관리하고, 동시에 많은 요청을 무리 없이 처리할 수 있어야 하죠.


기존의 전통적인 서버, 예를 들면 Java나 .NET 같은 환경에서는 요청이 들어올 때마다 **새로운 스레드를 만들어 처리**하곤 했습니다. 이 방식은 직관적이고 동시성을 확보하기 쉬운 방법이긴 하지만, 몇 가지 문제점이 따릅니다. 스레드 수가 많아지면 메모리 사용량이 급격히 늘어나고, 스레드 간 전환(Context Switching) 과정에서 CPU 자원이 낭비됩니다. 특히, 요청 처리 중 I/O 작업(예: 파일 읽기, DB 조회)을 기다리는 동안 CPU는 할 일이 없어 놀고 있게 되는데, 이는 시스템 자원을 비효율적으로 사용하는 것입니다.


이러한 문제를 해결하기 위해 Node.js는 다른 길을 선택했습니다. 바로 **싱글 스레드 + 비동기 I/O** 모델입니다. **Node.js는 하나의 스레드로 자바스크립트 코드를 실행**하면서, **I/O 작업은** **논블로킹 비동기 방식으로 처리**해 CPU가 쉬지 않고 계속 작업을 수행할 수 있도록 했습니다. 덕분에 적은 자원으로도 많은 요청을 효율적으로 처리할 수 있게 된 것입니다.


# JavaScript의 실행 방식 이해하기


![image.png](/posts/attachments/Nodejs%EB%8A%94-%EC%99%9C-%EC%8B%B1%EA%B8%80-%EC%8A%A4%EB%A0%88%EB%93%9C%EB%A5%BC-%EA%B3%A0%EC%A7%91%ED%95%A0%EA%B9%8C/img-01.png)


Node.js를 이해하려면 먼저 자바스크립트가 어떻게 동작하는지부터 짚고 넘어가야 합니다. 자바스크립트는 브라우저에서도, Node.js 환경에서도 **싱글 스레드**로 실행됩니다. 이는 작업을 처리하는 **콜 스택(Call Stack)**이 하나뿐이라는 뜻입니다.


간단한 예시를 살펴볼까요?


```typescript
function third() { 
  console.log('third');
}

function second() {
  console.log('second');
  third();
}

function first() {
  console.log('first');
  second();
}

first();
```


![이미지 출처: https://www.jsv9000.app/](/posts/attachments/Nodejs%EB%8A%94-%EC%99%9C-%EC%8B%B1%EA%B8%80-%EC%8A%A4%EB%A0%88%EB%93%9C%EB%A5%BC-%EA%B3%A0%EC%A7%91%ED%95%A0%EA%B9%8C/img-02.gif)


위 코드를 실행하면 `first → second → third` 순서로 함수가 호출되고, 호출된 순서대로 **스택 구조**에 따라 하나씩 실행됩니다. 함수가 실행되면 콜 스택에 쌓이고, 실행이 끝나면 스택에서 제거됩니다. 이처럼 자바스크립트는 **동기적으로** 작업을 처리합니다.


하지만 실무에서는 네트워크 요청, 데이터베이스 접근, 파일 읽기처럼 시간이 오래 걸리는 작업들이 많습니다. 이를 동기적으로 처리한다면 하나의 작업이 끝날 때까지 다음 작업은 기다려야 하므로, 처리 속도가 매우 느려지겠죠.


# 비동기 처리와 이벤트 루프


![이미지 출처: https://wikidocs.net/223233](/posts/attachments/Nodejs%EB%8A%94-%EC%99%9C-%EC%8B%B1%EA%B8%80-%EC%8A%A4%EB%A0%88%EB%93%9C%EB%A5%BC-%EA%B3%A0%EC%A7%91%ED%95%A0%EA%B9%8C/img-03.png)


Node.js는 이런 상황을 **비동기 이벤트 기반(Event-Driven) 아키텍처**로 해결했습니다. 그 핵심에는 **이벤트 루프(Event Loop)**가 있습니다.


이벤트 루프를 이해하기 위해 커피숍을 예로 들어보겠습니다. 손님이 와서 카운터에서 주문을 하면, 직원은 커피 제조를 다른 바리스타에게 맡기고, 곧바로 다음 손님의 주문을 받습니다. 커피가 다 만들어지면 진동벨이 울리고 손님은 커피를 받아가죠. 이처럼 **요청을 받고, 기다리지 않고 다음 일을 처리하며, 완료되면 알림을 받는 구조**가 바로 이벤트 루프의 작동 방식입니다.


이 구조에서는 시간이 오래 걸리는 작업을 **바로 처리하지 않고** 이벤트 루프를 통해 **비동기적으로 처리**합니다. 작업이 완료되면 해당 작업의 콜백 함수가 **태스크 큐(Task Queue)**에 등록되고, 이벤트 루프는 콜 스택이 비어 있을 때 이 큐에서 작업을 가져와 실행합니다.


이를 실제 코드로 살펴보겠습니다.


```typescript
console.log("1");
setTimeout(() => console.log("2"), 1000);
console.log("3");
```


이 코드를 실행하면 출력 결과는 다음과 같습니다.


```plain text
1
3
2
```


왜 이런 순서로 출력될까요?


![image.png](/posts/attachments/Nodejs%EB%8A%94-%EC%99%9C-%EC%8B%B1%EA%B8%80-%EC%8A%A4%EB%A0%88%EB%93%9C%EB%A5%BC-%EA%B3%A0%EC%A7%91%ED%95%A0%EA%B9%8C/img-04.png)

1. 소스 코드의 첫 번째 라인을 읽어서 콜 스택에 `console.log(”1”)` 함수가 추가됩니다.

![image.png](/posts/attachments/Nodejs%EB%8A%94-%EC%99%9C-%EC%8B%B1%EA%B8%80-%EC%8A%A4%EB%A0%88%EB%93%9C%EB%A5%BC-%EA%B3%A0%EC%A7%91%ED%95%A0%EA%B9%8C/img-05.png)

1. 콜 스택에 있는 `console.log(”1”)`이 실행되어서 1이 출력됩니다.

![image.png](/posts/attachments/Nodejs%EB%8A%94-%EC%99%9C-%EC%8B%B1%EA%B8%80-%EC%8A%A4%EB%A0%88%EB%93%9C%EB%A5%BC-%EA%B3%A0%EC%A7%91%ED%95%A0%EA%B9%8C/img-06.png)

1. 콜 스택에 `setTimeout()`이 추가됩니다.

![image.png](/posts/attachments/Nodejs%EB%8A%94-%EC%99%9C-%EC%8B%B1%EA%B8%80-%EC%8A%A4%EB%A0%88%EB%93%9C%EB%A5%BC-%EA%B3%A0%EC%A7%91%ED%95%A0%EA%B9%8C/img-07.png)

1. `setTimeout()`은 Node.js API입니다. 주어진 시간 동안 대기합니다.

![image.png](/posts/attachments/Nodejs%EB%8A%94-%EC%99%9C-%EC%8B%B1%EA%B8%80-%EC%8A%A4%EB%A0%88%EB%93%9C%EB%A5%BC-%EA%B3%A0%EC%A7%91%ED%95%A0%EA%B9%8C/img-08.png)

1. `setTimeout()`을 기다리는 동안 `console.log(”3”)`을 콜 스택에 추가합니다.

![image.png](/posts/attachments/Nodejs%EB%8A%94-%EC%99%9C-%EC%8B%B1%EA%B8%80-%EC%8A%A4%EB%A0%88%EB%93%9C%EB%A5%BC-%EA%B3%A0%EC%A7%91%ED%95%A0%EA%B9%8C/img-09.png)

1. `console.log(”3”)`을 실행해서 3을 출력합니다.

![image.png](/posts/attachments/Nodejs%EB%8A%94-%EC%99%9C-%EC%8B%B1%EA%B8%80-%EC%8A%A4%EB%A0%88%EB%93%9C%EB%A5%BC-%EA%B3%A0%EC%A7%91%ED%95%A0%EA%B9%8C/img-10.png)

1. 지정된 시간이 지나고 Node.js API에서 `setTimeout()`을 이벤트 루프의 태스크 큐로 추가합니다.

![image.png](/posts/attachments/Nodejs%EB%8A%94-%EC%99%9C-%EC%8B%B1%EA%B8%80-%EC%8A%A4%EB%A0%88%EB%93%9C%EB%A5%BC-%EA%B3%A0%EC%A7%91%ED%95%A0%EA%B9%8C/img-11.png)

1. 태스크 큐에 추가된 `setTimeout()`을 이벤트 루프의 각 단계를 진행하면서 콜 스택에 다시 추가합니다. 이 때, 콜 스택이 비어 있는 경우에만 추가합니다.

![image.png](/posts/attachments/Nodejs%EB%8A%94-%EC%99%9C-%EC%8B%B1%EA%B8%80-%EC%8A%A4%EB%A0%88%EB%93%9C%EB%A5%BC-%EA%B3%A0%EC%A7%91%ED%95%A0%EA%B9%8C/img-12.png)

1. 콜 스택에 추가한 `setTimeout()`의 콜백 함수를 실행해 2를 출력합니다.

이처럼 Node.js는 시간이 오래 걸리는 작업을 기다리지 않고 바로 다음 작업으로 넘어갈 수 있게 해줍니다. 싱글 스레드임에도 비동기 처리를 통해 **마치 동시에 여러 작업을 처리하는 것처럼** 느껴지는 이유가 바로 여기에 있습니다.


# Node.js 내부 구조


![https://blog.usejournal.com/nodejs-architecture-concurrency-model-f71da5f53d1d](/posts/attachments/Nodejs%EB%8A%94-%EC%99%9C-%EC%8B%B1%EA%B8%80-%EC%8A%A4%EB%A0%88%EB%93%9C%EB%A5%BC-%EA%B3%A0%EC%A7%91%ED%95%A0%EA%B9%8C/img-13.png)


Node.js는 단순히 자바스크립트만 실행하는 런타임이 아닙니다. 다양한 기능을 가능하게 해주는 내부 구조가 있고, 그 중심에는 두 가지 핵심 요소가 있습니다.


## 1. V8 엔진 - 자바스크립트를 빠르게 실행


Node.js는 크롬 브라우저에서 사용되는 구글의 V8 엔진을 사용해 자바스크립트 코드를 실행합니다. 우리가 작성한 자바스크립트 코드는 이 엔진에서 해석되고 기계어로 컴파일되어 매우 빠르게 실행됩니다.


하지만 여기서 중요한 사실은 V8은 자바스크립트 문법을 실행할 수 있는 엔진일 뿐, `setTimeout()`, `fs.readFile()` 같은 Node.js 전용 API는 이 엔진 혼자서 처리할 수 없습니다.


## 2. libuv - 비동기 I/O와 이벤트 루프의 핵심


자바스크립트 코드 실행 외의 작업은 대부분 libuv라는 C 기반의 라이브러리가 처리합니다. libuv는 다음과 같은 역할을 합니다.

- 이벤트 루프 구현
- 파일 시스템, 네트워크 요청 등 비동기 I/O 처리
- 스레드 풀 관리

예를 들어, 파일을 읽는 코드가 있다고 해봅시다.


```typescript
const fs = require('fs');
fs.readFile('example.txt', 'utf-8', (err, data) => {
  console.log(data);
});
```


이 코드에서 `fs.readFile()`은 V8이 직접 처리할 수 없습니다. V8은 운영체제에 직접 접근할 수 있는 권한이 없기 때문이죠. 그래서 Node.js는 이 작업을 **libuv에게 위임**합니다. libuv는 백그라운드 스레드 풀 중 하나를 활용해 파일을 읽고, 작업이 끝나면 콜백을 태스크 큐에 등록합니다. 이후 이벤트 루프가 콜 스택이 비는 시점을 기다렸다가 이 콜백을 실행합니다.


이 과정을 정리하면 다음과 같습니다.

1. 자바스크립트 코드 실행 → V8이 처리
2. 비동기 I/O 요청 발생 → libuv가 스레드 풀에서 처리
3. 완료 시 콜백 → 이벤트 루프가 큐에서 가져와 실행

# libuv 스레드 풀


Node.js는 싱글 스레드라고 하지만, 자바스크립트를 실행하는 메인 스레드만 싱글일 뿐입니다. 내부적으로는 libuv가 스레드 풀(기본 4개)을 가지고 있어 블로킹이 발생할 수 있는 작업들을 병렬로 처리할 수 있습니다.


예를 들어, 아래 코드처럼 CPU를 많이 사용하는 연산과 동시에 파일을 읽는 작업이 있을 수 있죠.


```typescript
fs.readFile('bigfile.txt', () => {
  console.log('파일 읽기 완료');
});

for (let i = 0; i < 1e9; i++) {} // CPU 바쁜 작업
console.log('연산 완료');
```


이 경우 파일 읽기 작업은 스레드 풀에서 비동기적으로 처리되므로, CPU 연산과 동시에 진행됩니다.


Node.js의 싱글 스레드 구조만 보고 모든 작업이 순차적으로 처리된다고 오해하면 안 되는 이유입니다.


# 정리

1. Node.js는 싱글 스레드로 동작하지만, libuv와 이벤트 루프 덕분에 I/O 작업은 비동기적으로 병렬 처리됩니다.
2. 이 덕분에 자바스크립트의 단일 스레드 철학을 유지하면서도 높은 처리량과 확장성을 확보할 수 있습니다.
3. 결과적으로, 적은 자원으로도 효율적인 서버 운영이 가능해 API 서버에 특히 적합합니다.

# 참고 자료


[https://medium.com/zigbang/nodejs-event-loop%ED%8C%8C%ED%97%A4%EC%B9%98%EA%B8%B0-16e9290f2b30](https://medium.com/zigbang/nodejs-event-loop%ED%8C%8C%ED%97%A4%EC%B9%98%EA%B8%B0-16e9290f2b30)


[https://sjh836.tistory.com/149](https://sjh836.tistory.com/149)


[https://blog.naver.com/pjt3591oo/221976414901](https://blog.naver.com/pjt3591oo/221976414901)


[https://joe-cho.tistory.com/16](https://joe-cho.tistory.com/16)


[https://evan-moon.github.io/2019/08/01/nodejs-event-loop-workflow/](https://evan-moon.github.io/2019/08/01/nodejs-event-loop-workflow/)


[https://kosaf04pyh.tistory.com/340](https://kosaf04pyh.tistory.com/340)


[https://wikidocs.net/223233](https://wikidocs.net/223233)


[https://darrengwon.tistory.com/953](https://darrengwon.tistory.com/953)
