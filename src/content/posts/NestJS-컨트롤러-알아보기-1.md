---
title: "NestJS 컨트롤러 알아보기 - 1"
description: "지난 포스팅에서는 NestJS 설치법을 알아보았는데, 이번 포스팅에서는 NestJS의 컨트롤러에 대해서 알아본다."
date: 2023-03-05
---

지난 포스팅에서는 NestJS 설치법을 알아보았는데, 이번 포스팅에서는 NestJS의 컨트롤러에 대해서 알아본다.


# 컨트롤러? 뭐하는 친구야?


Nest의 컨트롤러는 MVC 패턴에서 말하는 그 컨트롤러를 말한다.


들어오는 요청(request)을 받고 처리된 결과를 응답(response)로 돌려주는 인터페이스 역할을 한다!


![fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F8M056%2Fbtr1XPQssZH%2FzvYZCiRkcb6Vwie5xc0eC0%2Fimg.png](/posts/attachments/NestJS-%EC%BB%A8%ED%8A%B8%EB%A1%A4%EB%9F%AC-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0-1/img-01.png)


컨트롤러는 엔드포인트 라우팅(routing) 메커니즘을 통해 각 컨트롤러가 받을 수 있는 요청을 분류한다.


컨트롤러를 잘 사용하면 구조적이고 모듈화된 소프트웨어를 작성할 수 있게 된다.


## 라우팅


소스 코드를 살펴보자.


```typescript
// app.controller.ts

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```


NestJS는 서버가 수행해야 하는 많은 귀찮은 작업을 데커레이터로 기술해서, 개발자가 애플리케이션의 핵심 로직에 집중할 수 있도록 도와준다.


@Controller 데커레이터를 클래스에 선언하는 것 만으로도 해당 클래스는 컨트롤러의 역할을 하게 된다!


getHello 함수는 @Get 데커레이터를 가지고 있다.


라우팅 경로는 @Get 데커레이터의 인수로 관리할 수 있는데, 지금은 인수가 없기 때문에 루트 경로로 들어오는 요청을 처리할 수 있다.


한번 포스트맨으로 테스트해보자.


![fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbpimfv%2Fbtr1VewD9V1%2FEtkqZsTduoXNkOGX3LfeGk%2Fimg.png](/posts/attachments/NestJS-%EC%BB%A8%ED%8A%B8%EB%A1%A4%EB%9F%AC-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0-1/img-01.png)


그러면 @Get 데커레이터의 인수를 한번 ‘/hello’ 로 바꿔볼까?


```typescript
@Get('/hello')
  getHello(): string {
    return this.appService.getHello();
  }
```


이제 똑같이 루트 경로로 요청을 보내면 404 Not found 에러를 만나게 된다.


![fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbMcPAp%2Fbtr1XxidQBp%2FJoGSDkoIFxjxTkV2d8khaK%2Fimg.png](/posts/attachments/NestJS-%EC%BB%A8%ED%8A%B8%EB%A1%A4%EB%9F%AC-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0-1/img-01.png)


@Controller 데커레이터에도 인수를 전달할 수 있다.


이를 통해 라우팅 경로의 접두어(prefix)를 지정한다.


예를 들어 @Controller(‘app’)이라고 했다면 이제 http://localhost:3000/app/hello 경로로 접근해야 한다.


보통 컨트롤러가 맡은 리소스의 이름을 지정하는 경우가 많다.


```typescript
@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/hello')
  getHello(): string {
    return this.appService.getHello();
  }
}
```


![fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F8gSdA%2Fbtr1VdkchN9%2FGFVH4nw5PbF02HFFiK5BWk%2Fimg.png](/posts/attachments/NestJS-%EC%BB%A8%ED%8A%B8%EB%A1%A4%EB%9F%AC-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0-1/img-01.png)


## 요청 객체


클라이언트는 요청을 보내면서 종종 서버가 원하는 정보를 함께 전송한다.


예를 들어, 클라이언트에서 사용자가 로그인을 한다면 사용자의 아이디와 패스워드가 함께 서버로 넘어올 것 이다.


Nest는 요청과 함께 전달되는 데이터를 핸들러가 다룰 수 있는 객체로 변환한다.


이렇게 변환된 객체는 @Req 데커레이터를 이용하여 다룰 수 있다.


```typescript
// app.controller.ts

import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() req: Request): string {
    console.log(req.body);
    return this.appService.getHello();
  }
}
```


![fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FtJYli%2Fbtr1Mjk2h5W%2FHotVVwWoSWKiwh3S0U4yfK%2Fimg.png](/posts/attachments/NestJS-%EC%BB%A8%ED%8A%B8%EB%A1%A4%EB%9F%AC-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0-1/img-01.png)


![fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcjEVVC%2Fbtr1WlaYeRo%2FOtrej3e9cH1kkVJN0Nenkk%2Fimg.png](/posts/attachments/NestJS-%EC%BB%A8%ED%8A%B8%EB%A1%A4%EB%9F%AC-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0-1/img-01.png)


하지만, API를 작성할 때 이런 식으로 요청 객체를 직접 다루는 경우는 추천되지 않는다고 한다.


Nest는 @Query(), @Param(), @Body() 데커레이터를 이용해서 요청에 포함된 매개변수, 본문 등을 쉽게 받을 수 있게 만들어두었다.


아래와 같이 코드를 작성하면 위와 동일한 결과를 얻을 수 있다.


```typescript
@Get()
  getHello(@Body() body) {
    console.log(body);
    return this.appService.getHello();
  }
```


# Reference


[책] [nestjs로 배우는 백엔드 프로그래밍](https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=306191959&start=pgooglemc)(한용재 저)
