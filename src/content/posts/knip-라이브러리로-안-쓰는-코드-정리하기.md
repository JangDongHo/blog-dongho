---
title: "knip 라이브러리로 안 쓰는 코드 정리하기"
description: "AI와 개발-리팩토링을 반복하며 쌓인 안 쓰는 코드를 knip으로 찾아 정리한 과정과 동작 방식을 정리했다."
date: 2026-11-25
tags:
  - JavaScript
  - 리팩토링
  - AI
---

## 들어가며

클로드와 함께 사이드 프로젝트를 진행하면서, 개발-리팩토링-개발-리팩토링을 반복하면서 안 쓰이는 코드들이 늘어난게 눈에 보였다.

이 정리 작업을 어떻게 진행할지 클로드와 이야기를 나눠보다가 knip이라는 라이브러리를 알게 되어 학습해보았다.

## knip 이란?

> Declutter your JavaScript & TypeScript projects
> - knip 소개 글 -

knip는 자바스크립트와 타입스크립트를 사용하는 프로젝트에서 사용하지 않는 파일, 의존성(패키지), 익스포트(export) 등을 찾아 정리하고 가볍게 만드는 라이브러리다.

## 동작 방식

> Advanced analysis starting from fine-grained entry points based on the actual frameworks and tooling in (mono)repos for accurate and actionable results.

1. 프로젝트의 시작점(Entry Point)을 찾는다.
2. import/export 관계를 따라간다.
3. 전체 Module Graph를 구성한다.
4. 그래프에 연결되지 않은 파일과 export를 찾는다.
5. package.json 및 설정 파일까지 분석해 불필요한 의존성을 찾아낸다.

## 조금 더 자세히 들여다보자

knip은 플러그인을 통해 프로젝트가 사용하는 프레임워크나 개발 도구의 구조와 규칙을 파악하고, 이를 바탕으로 분석 대상 파일과 진입점(Entry Point)을 자동으로 찾아낸다.

예를 들어, Next.js 프로젝트를 사용하고 있다면 knip은 `package.json`에 `next`가 설치되어 있는지 확인하고 Next.js 관련 플러그인을 활성화시킨다.

이후 Next.js의 파일 기반 라우팅 규칙을 고려해 `app/page.tsx`, `app/layout.tsx` 등의 파일을 분석 시작점으로 등록한다.

## AST 파싱 및 의존성 그래프 구축

![knip 모듈 그래프 분석](/posts/attachments/knip-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC%EB%A1%9C-%EC%95%88-%EC%93%B0%EB%8A%94-%EC%BD%94%EB%93%9C-%EC%A0%95%EB%A6%AC%ED%95%98%EA%B8%B0/img-01.png)

분석 시작점을 찾았다면 코드를 AST로 변환한다. 여기서 AST(Abstract Syntax Tree)는 추상 구문 트리로, 소스 코드의 문법적 구조를 분석하여 함수 선언, 변수, 호출, import 등의 구성 요소와 관계를 트리 형태로 표현한 자료구조다.

쉽게 말하면, 사람이 읽고 작성하기 쉬운 텍스트 형태의 코드를 컴퓨터가 구조적으로 분석하고 이해할 수 있도록 자료구조로 변환하는 것이다.

![Diagram showing how modules are attached to web pages](https://developer.mozilla.org/en-us/docs/web/javascript/guide/modules/module-loading.svg)

그리고 이 AST에서 필요한 관계 정보를 추출해 [Module Graph(모듈 의존성 그래프)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules/Module_graph)를 구성한다.

위 사진과 같이 import/export를 연결하고 또 연결하다 보면 어딘가에서는 연결되지 않은 노드가 발생할 수 있다.

그러면 knip은 "아 이 친구는 지금 우리 코드에서 필요하지 않은 코드구나!" 라고 판단하여 우리에게 알려준다.

> [!Note]
> knip은 사용되지 않는 것들을 어디까지 파악할까?
> 1. 미사용 파일: 진입점부터 이어지는 그래프에 도달하지 않는 파일
> 2. 미사용 export / 타입: 외부나 다른 파일에서 한 번도 import되지 않는 함수, 변수, 타입, 클래스 등
> 3. 미사용 의존성: `package.json`에 등록되어 있으나 코드나 설정에서 쓰이지 않는 패키지
> 4. 누락, 미해결 참조: 코드에서 쓰지만 `package.json`에 없는 의존성이나 경로를 찾지 못한 import

## 명령어

| 명령어                       | 설명                                         |
| ------------------------- | ------------------------------------------ |
| `npx knip`                | 프로젝트 전체에서 미사용 파일, export, dependency 등을 분석 |
| `npx knip --files`        | 미사용 파일 탐지                                  |
| `npx knip --exports`      | 미사용 export 탐지                              |
| `npx knip --dependencies` | 미사용 dependency 탐지                          |
| `npx knip --dev`          | 개발 환경 관련 분석 (버전에 따라 옵션 확인 필요)              |
| `npx knip --production`   | 프로덕션 기준으로 분석                               |
| `npx knip --fix`          | 지원하는 미사용 항목을 자동 수정                         |

## 실습

![knip 실행 결과](/posts/attachments/knip-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC%EB%A1%9C-%EC%95%88-%EC%93%B0%EB%8A%94-%EC%BD%94%EB%93%9C-%EC%A0%95%EB%A6%AC%ED%95%98%EA%B8%B0/img-02.png)

우리 프로젝트에서 knip 명령어를 돌려보니 결과는 다음과 같았다.

- Unused files (2개)
- Unused dependencies (1개)
- Unused exports (39개)
- Unused exported types (36개)

### 사례1: 사용되지 않는 파일

Unused files는 프로젝트 내에서 다른 파일에서 참조되지 않거나 진입점으로부터 도달하지 못하는 파일이다. 우리 프로젝트에서는 총 2개의 미사용 파일이 검출됐다.

```
Unused files (2)
scripts/auth-schema.mjs  
scripts/check-llm-sql.mjs
```

두 파일은 모두 scripts 폴더에 존재했다. scripts 폴더 안에는 개발 과정에서 특정 작업을 자동화하거나 데이터를 검증하기 위해 LLM이 작성한 파일들이 모여있는 공간이다. 

특히 위 두 파일은 직접적으로 런타임에 필요한 코드는 아니지만,  DB 마이그레이션과 배포 전 검증처럼 운영 과정에서 직접 실행하는 도구였다.

```ts
{ "ignore": ["scripts/*.mjs"] }
```

따라서 두 scripts 폴더 내부의 파일은 knip에 의해서 삭제되지 않도록, ignore 설정을 추가해주었다. 다만 이 방식은 이후 새 스크립트가 생겨도 같은 방식으로 처리되기 때문에 스크립트에 불필요한 파일이 쌓이지는 않는지 검토가 필요해보인다.

### 사례2: 사용되지 않는 의존성

Unused dependencies는 프로젝트 코드에서 사용되지 않는 것으로 판단된 패키지 의존성이다. 우리 프로젝트에서는 총 1개의 미사용 의존성이 검출됐다.

```
Unused dependencies (1)
pretendard  package.json:23:6
```

사용되지 않는 의존성은 바로 pretendard였다. pretendard는 오픈 소스 고딕 계열 글꼴이다.
기존 프로젝트에서는 `next/font/local`을 사용해 Pretendard 폰트를 로컬 폰트로 등록하고 있었다. (역주: 로컬 폰트(Local Font) 란 외부 서버나 CDN에서 폰트를 다운로드하는 대신, 프로젝트에 저장된 폰트 파일을 직접 불러와 사용하는 방식이다.)

```ts
import localFont from "next/font/local";

export const pretendard = localFont({
  src: "..//node_modules/pretendard/.../woff2/PretendardVariable.woff2",
  ...
});
```

여기서 문제가 됐던게 `pretendard` 의존성을 설치한 뒤, `node_modules` 내부에 포함된 폰트 파일을 폴더 경로로 직접 참조하고 있었다. 이 방식은 직접적으로 의존성을 import 해서 사용하는 방식이 아니다 보니 knip의 입장에서는 사용하지 않는 모듈로 인식한 것 같았다.

```ts
import localFont from "next/font/local";

export const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
```

그래서 폰트를 의존성으로 관리하는 방식 대신에, 폰트를 직접 다운로드하여 관리하는 방식으로 변경했다.

### 사례3: 사용되지 않는 export

Unused exports는 외부로 export 되고 있지만 프로젝트 내에서 참조되지 않는 함수, 변수, 클래스들을 나타낸다. 우리 프로젝트에서는 총 39개의 미사용 export 가 검출됐다.

```ts
export const STAR_PLACEHOLDER = "오늘의 별조각을 모두 썼어요";
```

확인 결과, 위 PLACEHOLDER 상수는 해당 파일 내부에서만 쓰이고 있었고 다른 파일에서는 참조하지 않고 있었다.

추측컨대 이 코드는 ai가 다른 코드에서 사용할 것 같아서 미리 export를 했거나, 어딘가에서 사용하고 있었다가 현재는 사용되지 않아 export가 방치된 것으로 보인다.

따라서, 이런 export 남용을 막기 위한 장치가 필요해보였다.

### 사례4: 사용되지 않는 exported type

Unused exported types는 외부로 export 되고 있지만 프로젝트 내에서 참조되지 않는 타입, 인터페이스를 나타낸다. 우리 프로젝트에서는 총 36개의 미사용 export가 검출됐다.

```ts
export type SoulCard = { number: number; name: string; keywords: string[] };
```

마찬 가지로 위 타입 코드도 export는 되어 있지만 다른 파일에서 사용되지 않았다.

## 마무리

AI와 함께 개발하다 보니 기능을 빠르게 구현하고 수정하는 데는 많은 도움을 받고 있지만, 그 과정에서 더 이상 사용하지 않는 코드가 남는 경우도 적지 않았다.

이번에 knip을 사용해 보면서 생각보다 많은 죽은 코드가 있다는 걸 눈으로 확인할 수 있었다. 앞으로 AI를 활용한 개발이 더욱 보편화될수록 코드 작성 속도만큼이나 코드의 품질과 유지보수성을 관리하는 과정도 중요해질 것이라 생각한다.

프로젝트를 진행하면서 적절한 제약과 검증 과정을 도입해 AI가 불필요한 코드를 만들거나 기존 코드의 사용 여부를 놓치는 실수를 방지하고, 이러한 문제가 반복되지 않도록 개발 환경을 개선해 나가 봐야겠다.

## 참고 자료

- https://knip.dev/
- https://github.com/webpro-nl/knip
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules/Module_graph
