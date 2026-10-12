---
title: "[NestJS] class-validator의 isPhoneNumber는 믿을 수 있을까?"
description: "NestJS에서 휴대전화 번호 유효성 검사를 위해 class-validator의 @IsPhoneNumber('KR') 데코레이터를 편하게 사용할 수 있다."
date: 2025-04-10
---

NestJS에서 휴대전화 번호 유효성 검사를 위해 `class-validator`의 `@IsPhoneNumber('KR')` 데코레이터를 편하게 사용할 수 있다.


```typescript
import { IsPhoneNumber } from 'class-validator';

export class CreateInquiryRequestDto {
  @IsPhoneNumber('KR')
  phone: string;
}
```


그런데 이게 진짜 믿을 수 있는걸까?


처음엔 `@IsPhoneNumber`만 붙이면 끝났다고 생각했다. 실제로도 잘 작동했으니까..


그런데 이상하게도 `011`, `017` 번호도 통과하는 걸 보면서 의문이 생겼다.

> “지금은 다 010으로 쓰는 거 아닌가...? 왜 이게 유효하다고 나오지?”

그래서 이번 글에서는 아래의 내용을 정리해서 소개해보려 한다.

- 왜 `@IsPhoneNumber('KR')`가 011, 016, 017, 019 번호도 통과시키는지
- 실제 우리가 원하는 **"010으로 시작하는 11자리 번호"** 조건을 어떻게 커스텀할 수 있는지
- 그리고 테스트 코드를 통해 우리의 로직이 정확히 작동하는지도

> [!note]
> ⚠️ 본 글에서는 휴대전화 번호(010으로 시작하는 번호)의 유효성 검사만 다루며, 다음과 같은 유선 전화번호는 범위에서 제외한다.


# **📱** 한국 휴대전화 번호, 진짜로 010만 있는 걸까?


사실 예전에는 011, 016, 017, 018, 019 등 다양한 번호들이 존재했다.


통신사마다 서로 다른 식별번호를 사용했고, 한창 휴대폰이 보급되던 시기엔 이 번호들이 공존했다.


하지만 2004년부터 010 번호 통합 정책이 시행되면서 상황이 달라졌다.


신규 가입자에게는 무조건 010 번호가 부여되었고, 기존 사용자들도 번호 이동을 통해 자연스럽게 010으로 통일되었다.


정부는 2021년까지 모든 비(非)010 번호 사용자들을 강제로 전환했고, 지금은 일반 사용자가 011, 016 같은 번호를 쓰는 경우는 사실상 없다.


## 그럼에도 불구하고…


아래와 같은 예외 상황에서는 011~019 번호가 여전히 존재할 수 있다고 한다.


| **상황**                  | **가능성** | **설명**            |
| ----------------------- | ------- | ----------------- |
| 일부 기업 전용폰               | 낮음      | 사내 특수 회선, 장비 등록용  |
| M2M/IoT 회선 (ex. 스마트미터기) | 있음      | 아직 01X 번호 쓰는 곳 존재 |
| 해외 유심 등으로 010 외 번호 부여   | 해외라면 가능 | 하지만 국내에선 드뭄       |


하지만 일반 서비스 사용자 대상이라면 **011~019는 더 이상 존재하지 않는다**고 봐도 무방하다.


# **🤔** 그런데 @IsPhoneNumber는 왜 통과시키는 걸까?


NestJS의 `@IsPhoneNumber('KR')`는 내부적으로 [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js)라는 라이브러리를 사용한다.


이 라이브러리는 Google의 [libphonenumber](https://github.com/google/libphonenumber) 데이터를 기반으로 작동하며, **기술적으로 "가능한 번호"** 인지를 검증할 뿐, **"실제로 사용하는 번호"** 인지를 판단하진 않는다.


즉, 아래 번호들도 유효하다고 판단된다.


```typescript
isValidPhoneNumber('01012345678', 'KR') // ✅ true
isValidPhoneNumber('01112345678', 'KR') // ✅ true
isValidPhoneNumber('01712345678', 'KR') // ✅ true
```


# **🎯** 우리가 원하는 번호 형식은?


실제 서비스에서 요구하는 기준은 단순하다.

1. 010으로 시작
2. 총 11자리 숫자
3. 하이픈(-) 여부는 상관없이 검사

## **🔧** 커스텀 유효성 검사 함수 만들기


```typescript
function isValidPhone(value: string): boolean {
  const onlyDigits = value.replace(/[^0-9]/g, '');
  const phoneRegex = /^010\d{8}$/;
  return phoneRegex.test(onlyDigits);
}
```

- `onlyDigits`
    - 숫자가 아닌 모든 문자를 제거
    - 예: `010-1234-5678` → `01012345678`
    - `[^0-9]`는 숫자가 아닌 문자들을 의미하고, `g`는 전체 문자열에 대해 적용하라는 뜻
- `phoneRegex`
    - `010`으로 시작하고 그 뒤에 정확히 8자리 숫자가 오는 패턴을 정의한 정규표현식
    - 즉, 총 11자리(010 + 8자리 숫자)만 허용한다는 뜻
    - `^`는 문자열의 시작, `$`는 문자열의 끝을 의미하므로, 정확히 이 형식에 일치해야 함.

## **🧪** 테스트 코드로 검증해보기


작성한 유효성 검사 함수가 정말 원하는 대로 동작하는지 확인하려면, 테스트 코드가 필수다.


우리는 아래와 같은 기준을 만족해야 한다.

1. 010으로 시작하는 번호만 허용
2. 하이픈이 포함되어 있어도 통과
3. 그 외의 식별변호(011, 017 등)나 형식은 거절

```typescript
import { isValidPhone } from './phone';

describe('isValidPhone', () => {
  it('올바른 010 형식의 전화번호를 입력하면 성공한다.', () => {
    expect(isValidPhone('01012345678')).toBe(true);
    expect(isValidPhone('010-1234-5678')).toBe(true);
  });

  it('011~019 형식의 전화번호를 입력하면 실패한다.', () => {
    expect(isValidPhone('01112345678')).toBe(false);
    expect(isValidPhone('019-1234-5678')).toBe(false);
  });

  it('11자리가 아닌 전화번호를 입력하면 실패한다.', () => {
    expect(isValidPhone('010123456789')).toBe(false);
    expect(isValidPhone('010-1234-56789')).toBe(false);
  });

  it('숫자가 아닌 문자가 포함되어 있으면 실패한다.', () => {
    expect(isValidPhone('010abcd5678')).toBe(false);
    expect(isValidPhone('010-abcd-5678')).toBe(false);
  });
});
```


# **✍️ 마무리하며**


NestJS에서 `@IsPhoneNumber('KR')`는 기본적으로 잘 동작하는 유효성 검사 도구다.


하지만 010만 허용하는 정책이 필요한 서비스라면, 직접 커스텀 로직을 작성하거나 데코레이터를 만들어야 한다.


이번 글을 계기로 아무리 잘 만들어진 라이브러리 하더라도 그 라이브러리가 우리의 비즈니스 요구사항과 정확히 일치하지 않을 수 있다는 점을 항상 염두에 두어야 한다는 걸 다시금 느꼈다.


앞으로도 어떤 기능이든 “편해서 쓰는 것”을 넘어서, “이게 진짜 내가 원하는 동작을 하고 있는가?”라는 질문을 던지는 습관을 가져보자.


# 참고 자료


[https://namu.wiki/w/010#s-3](https://namu.wiki/w/010#s-3)


[https://www.youtube.com/watch?v=N3ysgr8g8l4&ab_channel=1%EB%B6%84%EB%A7%8C](https://www.youtube.com/watch?v=N3ysgr8g8l4&ab_channel=1%EB%B6%84%EB%A7%8C)
