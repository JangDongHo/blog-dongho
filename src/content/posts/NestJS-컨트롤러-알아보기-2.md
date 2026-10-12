---
title: "NestJS 컨트롤러 알아보기 - 2"
description: "지난 시간에 이어 오늘은 NestJS의 컨트롤러에 대해 자세히 알아본다."
date: 2023-03-06
---

지난 시간에 이어 오늘은 NestJS의 컨트롤러에 대해 자세히 알아본다.


먼저 컨트롤러를 생성할건데, nest CLI를 이용해서 컨트롤러를 생성하는 두 가지 방법이 있다.


첫번째는 컨트롤러만 생성하는 것이고,


```shell
nest g controller Users
```


두번째는 만들고자 하는 리소스의 CRUD 보일러플레이트 코드를 한 번에 생성하는 것이다.


이 글에서는 후자의 방법으로 컨트롤러를 생성해보겠다.


```shell
nest g resource Users
```


서버를 실행하면 어떤 라우팅 패스를 통해 요청을 받을 수 있는지 콘솔 로그를 통해 확인할 수 있다.


```shell
[Nest] 33720  - 2023. 03. 06. 오후 3:42:37     LOG [RoutesResolver] UsersController {/users}: +1ms
[Nest] 33720  - 2023. 03. 06. 오후 3:42:37     LOG [RouterExplorer] Mapped {/users, POST} route +0ms
[Nest] 33720  - 2023. 03. 06. 오후 3:42:37     LOG [RouterExplorer] Mapped {/users, GET} route +1ms
[Nest] 33720  - 2023. 03. 06. 오후 3:42:37     LOG [RouterExplorer] Mapped {/users/:id, GET} route +1ms
[Nest] 33720  - 2023. 03. 06. 오후 3:42:37     LOG [RouterExplorer] Mapped {/users/:id, PATCH} route +1ms
[Nest] 33720  - 2023. 03. 06. 오후 3:42:37     LOG [RouterExplorer] Mapped {/users/:id, DELETE} route +0ms
```


Users 리소스에 대한 CURD 요청 결과를 표로 정리하면 다음과 같다.


| 경로       | HTTP 메서드 | 응답 상태 코드 | 본문                            |
| -------- | -------- | -------- | ----------------------------- |
| /users   | POST     | 201      | This action adds a new user   |
| /users   | GET      | 200      | This action returns all users |
| /users/1 | GET      | 200      | This action returns a #1 user |
| /users/1 | PATCH    | 200      | This action updates a #1 user |
| /users/1 | DELETE   | 200      | This action removes a #1 user |


Nest는 이렇게 응답을 어떤 방식으로 처리할지 미리 정의해뒀다.


string, number, boolean과 같은 자바스크립트 원시 타입을 리턴할 경우 직렬화 없이 바로 보내지만,


객체를 리턴한다면 직렬화를 통해 JSON으로 자동 변환해준다.


그렇다면 만약에 요청을 처리하는 도중 에러가 발생하거나 예외를 던져야 한다면 어떻게 해야 할까?


예를 들어 유저 정보 조회(GET /users/:id)를 요청했는데 id는 1부터 시작하는 규칙을 가지고 있다고 치자.


그러면, id가 1보다 작은 값일 경우 400 Bad Request 예외를 던져야 한다.


```typescript
@Get(':id')
  findOne(@Param('id') id: string) {
    if (+id < 1) {
      throw new BadRequestException('id는 0보다 큰 값이어야 한다.');
    }
    return this.usersService.findOne(+id);
  }
```


다음은 id를 0으로 요청한 결과이다.


```json
{
    "statusCode": 400,
    "message": "id는 0보다 큰 값이어야 한다.",
    "error": "Bad Request"
}
```


## 페이로드 다루기


POST, PUT, PATCH 요청은 보통 처리에 필요한 데이터를 함께 실어 보낸다.


이 데이터 덩어리, 즉 페이로드(payload)를 본문(body)라고 한다.


NestJS에는 데이터 전송 객체(data transfer object, DTO)가 구현되어 있어 본문을 쉽게 다룰 수 있다.


앞서 생성한 User 리소스를 생성하기 위해 POST /users로 들어오는 본문을 CreateUserDto로 받았다.


이제 회원가입을 처리하기 위해 이름과 이메일을 추가해보자.


```typescript
// users/dto/create-user.dto.ts

import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;
}`
```


```typescript
// users/users.controller.ts

@Post()
  create(@Body() createUserDto: CreateUserDto) {
    const { name, email } = createUserDto;

    return `유저를 생성했습니다. 이름: ${name}, 이메일: ${email}`;
  }
```


이제 유저 생성 API를 요청하고 본문에 데이터가 잘 들어가 있는지 확인해보자.


![fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FnVpn2%2Fbtr2Ot6i2gg%2FKWNenNLSBfJTsORKRzO4A0%2Fimg.png](/posts/attachments/NestJS-%EC%BB%A8%ED%8A%B8%EB%A1%A4%EB%9F%AC-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0-2/img-01.png)


GET 요청에서 서버에 전달할 데이터를 포함할 때는 일반적으로 요청 주소에 포함시킨다.


예를 들어 유저 목록을 가져오는 요청은 GET /users?offset=0&limit=10과 같이 페이징 옵션이 포함되도록 구성할 수 있다.


offset은 데이터 목록 중 건너뛸 개수를 의미하고 limit은 offset 이후 몇 개의 데이터를 가져올지 지정한다.


이 두 쿼리 매개변수를 @Query DTO로 묶어 처리할 수 있다.


```typescript
export class GetUsersDto {
	offset: number;
	limit: number;
}
```


# Reference


[책] [nestjs로 배우는 백엔드 프로그래밍](https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=306191959&start=pgooglemc)(한용재 저)
