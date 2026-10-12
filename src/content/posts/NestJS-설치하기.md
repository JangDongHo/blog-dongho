---
title: "NestJS 설치하기"
description: "NestJS는 Node.js를 기반으로 한다. 따라서 먼저 Node.js 공식 사이트 다운로드 페이지에서 자신에게 맞는 버전의 Node.js를 설치한다. - 안정 버전인 LST를 선택하는 것을 권장 https://nodejs.org/ko/download/"
date: 2023-01-07
---

# NestJS 설치


## 1. Node.js 설치

- NestJS는 Node.js를 기반으로 한다.
- 따라서 먼저 Node.js 공식 사이트 다운로드 페이지에서 자신에게 맞는 버전의 Node.js를 설치한다.
    - 안정 버전인 LST를 선택하는 것을 권장
- [https://nodejs.org/ko/download/](https://nodejs.org/ko/download/)

## 2. NestJS 프로젝트 생성


### nestjs/cli 설치

- Node.js를 설치하면 기본적으로 npm(Node Package Manager)이 함께 설치된다.
    - npm은 라이브러리들을 쉽게 설치, 삭제할 수 있게 해준다.
- 간단한 NestJS 서버를 구성하기 위해 먼저 @nestjs/cli를 설치한다.

```shell
npm install -g @nestjs/cli
```


### 프로젝트 초기화


```shell
nest new project-name
```

- project-name은 임의로 설정 가능
- 설치 도중 패키지 매니저를 어느 것으로 정할지 묻는 화면이 나오면 선호하는 것으로 선택
    - 무난한건 npm
- 설치를 마치면 보일러플레이트 코드가 생성된다.

### 서버 구동해보기


```shell
npm run start:dev
```


서버가 localhost에서 구동된 것을 확인할 수 있다.


```shell
[Nest] 21688  - 2023. 01. 07. 오후 3:49:45     LOG [NestFactory] Starting Nest application...
[Nest] 21688  - 2023. 01. 07. 오후 3:49:45     LOG [InstanceLoader] AppModule dependencies initialized +21ms  
[Nest] 21688  - 2023. 01. 07. 오후 3:49:45     LOG [RoutesResolver] AppController {/}: +4ms
[Nest] 21688  - 2023. 01. 07. 오후 3:49:45     LOG [RouterExplorer] Mapped {/, GET} route +2ms
[Nest] 21688  - 2023. 01. 07. 오후 3:49:45     LOG [NestApplication] Nest application successfully started +2ms
```


### 브라우저로 로컬 서버 접속


브라우저로 로컬 서버(localhost:3000) 접속해서 잘 동작하는지 확인


![fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fd9mkR5%2FbtrVzlvJGvL%2FNLtOiix0Gh6O6drTQh3kT0%2Fimg.png](/posts/attachments/NestJS-%EC%84%A4%EC%B9%98%ED%95%98%EA%B8%B0/img-01.png)


포트는 기본적으로 3000번으로 설정


main.ts 파일을 보면 3000번 포트를 설정했음을 확인할 수 있다.


```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```


# Reference


[책] [nestjs로 배우는 백엔드 프로그래밍](https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=306191959&start=pgooglemc)(한용재 저)
