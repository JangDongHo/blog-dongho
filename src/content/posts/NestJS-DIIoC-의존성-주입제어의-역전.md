---
title: "[NestJS] DI/IoC (의존성 주입/제어의 역전)"
description: "안녕하세요, 장동호 입니다!"
date: 2025-06-13
---

안녕하세요, 장동호 입니다!


오늘은 NestJS의 모듈 간 결합 방식과 의존성 관리의 핵심 개념인 **DI(Dependency Injection), IoC(Inversion of Control)**에 대해 다뤄보려고 합니다.


# 싱글턴 패턴 (Singleton Pattern)


싱글턴 패턴이란, 하나의 클래스에 대해 오직 하나의 인스턴스만을 생성해서 사용하는 디자인 패턴입니다.

- 예를 들어, 로깅 클래스를 사용할 때마다 `new logger()`를 호출하는 대신 **하나의 인스턴스만 공유**해서 사용하는 방식입니다.
- NestJS에서는 `@Module`, `@Injectable`, `@Controller` 등의 **데코레이터가 붙은 클래스들이 모두 싱글턴**으로 관리됩니다.
- 인스턴스를 매번 생성하거나 삭제할 필요가 없기 때문에 **메모리 효율** 면에서도 유리합니다.
- 보통 **생성자를 통해 의존성을 주입**받으며, `private readonly`를 통해 외부에서 수정되지 않도록 보호합니다.

# DI(Dependency Injection)과 IoC(Inversion of Control)


## IoC (제어의 역전)


IoC는 말 그대로 제어의 흐름이 역전되는 것을 의미합니다.

- 기존에는 클래스의 인스턴스를 개발자가 직접 `new`로 생성하고 생명주기를 관리했습니다.
- 하지만 NestJS에서는 이러한 책임을 **프레임워크가 대신** 해줍니다.
- 즉, **객체의 생성, 주입, 소멸 등 모든 생명주기 관리**를 프레임워크가 담당하고, 개발자는 **비즈니스 로직 구현에만 집중**하면 됩니다.
> 프레임워크에게 “이게 필요해!”라고만 알려주면, 알아서 생성하고 넣어주는 것!

![이미지 출처: https://sjh9708.tistory.com/29](/posts/attachments/NestJS-DIIoC-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85%EC%A0%9C%EC%96%B4%EC%9D%98-%EC%97%AD%EC%A0%84/img-01.png)


위의 그림과 같이 A 클래스를 사용할 때마다 직접 인스턴스를 생성하면 어떤 문제가 발생할까요?

- 시간이 지나 A클래스가 E클래스로 바뀌면 모든 사용처를 직접 다 바꿔줘야 합니다. (강한 결합)
- A의 인스턴스의 생명주기 관리를 B와 C에서 담당해야 합니다.
- 즉, 프로그래머의 입장에서는 메모리 관리까지 신경써주어야 하며, 실수는 곧 Memory Leak으로 이어질 수 있습니다.

## DI (의존성 주입)


DI는 클래스가 **필요한 의존 객체를 직접 생성하지 않고 외부에서 주입**받는 구조를 말합니다.

- 예를 들어 클래스 B가 클래스 A의 기능이 필요하다면, B에서 A를 직접 생성하지 않고, NestJS가 A를 생성하고 B에 주입해줍니다.
- NestJS는 이 과정을 생성자 주입 방식으로 제공합니다.

```typescript
@Injectable()
class AService {
  // A의 로직
}

@Injectable()
class BService {
  constructor(private readonly aService: AService) {}
}
```


![이미지 출처: https://sjh9708.tistory.com/29](/posts/attachments/NestJS-DIIoC-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%A3%BC%EC%9E%85%EC%A0%9C%EC%96%B4%EC%9D%98-%EC%97%AD%EC%A0%84/img-02.png)


인스턴스의 생성과 생명주기 관리, 의존성 주입을 Nest가 담당합니다.

- 다른 클래스에서 A가 필요하면 B의 Module에서 필요한 것을 요청을 해두고, A를 받을 곳인 생성자에만 명시해두면 Nest가 알아서 관리 해준다는 것입니다.
- 이럴 경우 싱글턴 패턴으로 하나의 인스턴스만 생성하고, 관리는 프레임워크가 해주므로 프로그래머는 Memory Leak의 위험을 줄일 수 있습니다.
- 또한 A 대신 의존해야 할 대상이 바뀌는 경우에도 인스턴스를 사용하는 쪽은 바꿀 필요 없이, Module에서 등록만 바꾸면 됩니다. (느슨한 결합)

# 정리

- `@Injectable`, `@Controller`, `@Module` 등의 데코레이터가 붙은 클래스는 DI 컨테이너에 등록됩니다.
- 최초 한 번 인스턴스를 생성한 후, 필요 시 재사용합니다.
- NestJS의 DI 컨테이너가 Module에 등록된 의존성을 파악합니다.
- 생성자를 통해 의존성을 주입합니다.

# 참고 자료


[https://sjh9708.tistory.com/29](https://sjh9708.tistory.com/29)
