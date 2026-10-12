---
title: "Jest Cannot find module 해결방법"
description: "컨트롤러 클래스 테스트 코드 작성 중 다음과 같은 에러가 발생했다."
date: 2025-04-02
---

# 🔥 문제 상황


컨트롤러 클래스 테스트 코드 작성 중 다음과 같은 에러가 발생했다.


```typescript
Cannot find module 'src/guards/auth.guard' from 'users/users.controller.ts'
```


# **🔍** 문제 원인


Jest에서 `Cannot find module` 오류는 Jest가 절대경로를 인식하지 못할 때 흔히 발생한다.


나 같은 경우 vscode의 자동 임포트 기능을 적극적으로 이용하고 있는데, 이때 상대경로로 import 되는 경우도 있고, 절대경로로 import되는 경우도 있다.


VS Code에서는 절대 경로든 상대 경로든 아무 문제 없이 작동하지만, Jest로 테스트를 실행할 때는 문제가 발생한다.


```typescript
import { AuthGuard } from 'src/guards/auth.guard'; # 절대경로
import { UserDto } from './dtos/user.dto'; # 상대경로
```


이 문제는 **TypeScript의 경로 설정과 Jest의 경로 설정이 불일치**해서 발생한다고 한다.


VS Code와 Node.js는 `tsconfig.json`의 `baseUrl`과 `paths` 설정을 사용해 모듈을 인식하지만, Jest는 기본적으로 이를 인식하지 못하기 때문이다.


# **💡** 문제 해결


문제를 해결해주기 위해서는 먼저 상대경로와 절대경로를 일관되게 바꿔주어야 했다.


나 같은 경우, 절대경로를 사용하는 것이 앞으로의 코드 유지보수에 있어 더 유리하다고 판단했다.


프로젝트 규모가 커질수록 상대경로는 복잡해지고, 경로 길이가 깊어질수록 가독성이 떨어진다.


따라서, **절대경로로 통일**하여 코드를 작성하기로 했다.


## 1.  vscode 설정 변경


vscode의 `Import Module Specifier`의 기본값은 `shortest`로 되어 있다.


이는 상대경로와 절대경로 중 **더 짧은 경로를 자동으로 선택**하여 import 경로를 지정하는 방식이다.


따라서, 이 설정값을 `non-relative`로 바꿔주어야 한다.


![image.png](/posts/attachments/Jest-Cannot-find-module-%ED%95%B4%EA%B2%B0%EB%B0%A9%EB%B2%95/img-01.png)

1. **단축키**: `Ctrl + Shift + P` (Windows/Linux) 또는 `Cmd + Shift + P` (macOS)
2. **명령어 입력**: `Preferences: Open Settings (UI)`를 입력하고 선택
3. **설정 검색**: 검색창에 `typescript import module specifier` 입력
4. **설정 변경**:
    - `TypeScript › Preferences: Import Module Specifier`를 `non-relative`로 설정
    - (JavaScript에도 동일하게 적용하고 싶다면) `JavaScript › Preferences: Import Module Specifier`도 `non-relative`로 설정

## 2. 파일 임포트 절대경로로 통일


파일 경로를 상대경로와 절대경로를 혼용하지 않고, 절대경로로 통일시킨다.


### Bad


```typescript
import { AuthGuard } from 'src/guards/auth.guard';
import { UserDto } from './dtos/user.dto';
```


### Good


```typescript
import { AuthGuard } from 'src/guards/auth.guard';
import { UserDto } from 'src/users/dtos/user.dto';
```


## 3. jest 설정 추가


Jest에서 절대경로를 인식할 수 있게 하려면 package.json 파일의 jest 설정에 다음과 같은 설정을 추가해야 한다.


```typescript
"jest": {
    "moduleNameMapper": {
      "^src/(.*)$": "<rootDir>/$1"
    },
  }
```


moduleNameMapper는 간단히 말해 Jest가 모듈을 찾을 때 경로를 변환해주는 설정이다.

- `^src/(.*)$'` 는 Jest가 모듈 경로를 찾을 때 사용하는 정규식이다.
    - `^src/`는 경로가 `src/`로 시작하는 모든 경우를 의미한다.
    - `(.*)$`는 `src/` 뒤에 어떤 경로가 오더라도 모두 포함한다는 뜻이다.
    - 예) `src/interceptors/serialize.interceptor`
- `<rootDir>/src/$1` 는 Jest가 경로를 찾기 위해 변환하는 방법을 지정한다.
    - `<rootDir>`는 프로젝트의 최상위 디렉토리를 의미한다.
    - `src/$1`는 앞에서 정규식으로 매칭된 부분을 그대로 사용하겠다는 뜻이다.
    - 따라서, `src/interceptors/serialize.interceptor`와 같은 경로는 다음과 같이 변환되어 Jest가 모듈을 정확히 찾을 수 있게 된다.
        - 변환 전: `src/interceptors/serialize.interceptor`
        - 변환 후: `<rootDir>/src/interceptors/serialize.interceptor`

## 4. 설정 후 확인


Jest 설정 파일을 수정한 후, Jest를 다시 실행하거나 vsc를 종료했다 다시 실행한다.


더 이상 `Cannot find module` 오류가 발생하지 않고, 테스트가 정상적으로 동작하는 것을 확인할 수 있다.


![image.png](/posts/attachments/Jest-Cannot-find-module-%ED%95%B4%EA%B2%B0%EB%B0%A9%EB%B2%95/img-02.png)


# 참고 자료


[https://velog.io/@jhyeom1545/%EC%98%A4%EB%A5%98-%ED%95%B4%EA%B2%B0%EA%B8%B0-jest-Module-not-found-Error](https://velog.io/@jhyeom1545/%EC%98%A4%EB%A5%98-%ED%95%B4%EA%B2%B0%EA%B8%B0-jest-Module-not-found-Error)
