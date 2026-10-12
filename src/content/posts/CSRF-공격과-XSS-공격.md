---
title: "CSRF 공격과 XSS 공격"
description: "CSRF (사이트 간 요청 위조)는 로그인된 사용자가 자신의 의도와 상관없이, 공격자가 원하는 행동(요청)을 서버에 전송하게 만드는 것이다."
date: 2025-11-08
---

# CSRF(Cross-Site Request Forgery) 공격

- CSRF (사이트 간 요청 위조)는 로그인된 사용자가 자신의 의도와 상관없이, 공격자가 원하는 행동(요청)을 서버에 전송하게 만드는 것이다.

## 😈 공격 사례 (2008년 옥션)

1. 옥션 관리자 중 한 명이 관리 권한을 가지고 회사 내에서 작업을 하던 중 메일 조회 (관리자로서 유효한 쿠키를 갖고 있음)
2. 해커는 태그가 들어간 코드가 담긴 이메일을 보낸다. 관리자는 이미지 크기가 0이므로 전혀 알지 못한다.

    ```plain text
    <img src="<http://auction.com/changeUserAccount?id=admin&password=admin>" width="0" height ="0">
    ```

3. 피해자가 이메일을 열어볼 때, 이미지 파일을 받아오기 위해 URL이 열린다.
4. 해커가 원하는 대로 관리자의 계정이 id와 pw 모두 admin인 계정으로 변경된다.
> 피해 규모: 1800만 명의 개인정보가 해킹

## 🤔 무엇이 문제였을까?

- 비밀번호를 변경할 때, `/changeUserAccount` 처럼 간단한 GET 요청으로 처리했다. (나쁜 설계)
- 브라우저는 요청이 오면, 해당 도메인의 쿠키를 붙여서 서버로 요청을 보낸다.
- 요청을 받는 서버에서는 쿠키(신분)만 보고 요청의 출처(진짜 의도)를 확인하지 않았다.

## 🛡️ 어떻게 막을 수 있을까?


### 1️⃣ SameSite 쿠키 속성 설정

- SameSite 속성은 브라우저가 쿠키를 어떤 상황에서 전송할지 제한하는 기능이다.
- 이 속성만 잘 설정해줘도 CSRF 공격을 대부분 막을 수 있다.
- 주요 옵션
    1. `Strict`: 다른 사이트에서의 요청에서는 쿠키를 전송하지 않는다.
    2. `Lax`: Strict와 비슷하지만, 주소창에 URL 입력 후 엔터를 누른다거나, 다른 사이트에서 내 사이트 링크를 클릭해서 이동하는 등 일부 예외적인 GET 요청은 허용한다. (요즘 많은 브라우저의 기본값)
    3. `None`: 예전 방식. 모든 요청에 쿠키를 보낸다. (CSRF에 취약)
- 왜 `Strict`가 아닌 `Lax`가 기본값일까?
    - 사용자가 메일이나 다른 사이트에서 링크를 클릭해 내 사이트로 이동했을 때 세션 쿠키가 Strict라면, 브라우저는 외부 사이트에서 시작된 GET 요청에 대해 쿠키를 보내지 않는다.
    - 이 경우 악의적인 행동이 아님에도 불구하고 로그인 상태가 유지되지 않아, 사용자 경험이 저해된다.
    - 따라서, 비교적 안전한 HTTP 메서드(GET 등)에 한정해서는 쿠키 전송을 허용한다.
- 주의할 점
    - 구형 브라우저에서는 SameSite를 지원하지 않을 가능성이 존재한다.

### 2️⃣ 안티 CSRF 토큰 사용

- "이 요청은 내가 발급한 페이지에서 온 것이 맞다"는 비밀 증표(Token)를 심어두는 방식이다.
- **동작 과정**
    1. 사용자가 비밀번호 변경 폼(`GET /password-form`)에 접속한다.
    2. 서버는 랜덤 문자열(CSRF 토큰)을 생성한다. (예: `xyz-123-abc-789`)
    3. 서버는 이 토큰 값을 사용자의 세션에 저장하고, 동시에 HTML 폼에도 몰래 숨겨둔다.

        ```html
        <form action="/change-password" method="POST">
          <input type="password" name="new_pw">
          <input type="hidden" name="csrf_token" value="xyz-123-abc-789">
          <button type="submit">변경</button>
        </form>
        ```

    4. 사용자가 '변경' 버튼을 누르면(POST 요청), 폼 데이터와 함께 `csrf_token` 값이 서버로 전송된다.
    5. 서버는 요청을 받으면, 사용자 세션에 저장해 둔 토큰과 요청으로 넘어온 토큰이 일치하는지 비교한다.
- **주의할 점**
    - 서버가 사용자별 상태(state)를 기억하고 있어야하기 때문에 stateful 해진다.

### 3️⃣ Bearer Token / Authorization 헤더 사용

- JWT를 쿠키가 아닌 헤더에 인증 정보를 포함시키는 방법도 있다.
- CSRF는 주로 브라우저가 쿠키를 자동 전송할 때 발생하는데, 헤더 방식이면 CSRF 위험이 없다.

# XSS (Cross-site Scripting) 공격

- XSS(교차 사이트 스크립팅)는 악의적인 사용자가 공격하려는 사이트에 스크립트를 넣는 기법을 말한다.
- Cross-Site Scripting의 약자인데, CSS(Cascading Style Sheet)와 혼동이 올 수 있어 XSS라고 부른다고 한다.
- 공격에 성공하면 사이트에 접속한 사용자는 삽입된 코드를 실행하게 되며, 보통 의도치 않은 행동을 수행시키거나 쿠키나 세션 토큰 등의 민감한 정보를 탈취한다.
- XSS 공격은 "서버를 속이는 CSRF"와 달리, "사용자의 브라우저를 속이는 공격"이다.

## 😈 공격 과정

1. 공격자가 취약한 서버의 입력란(게시판, 댓글, 닉네임 등)에 `<script>alert('XSS');</script>`와 같은 악성 스크립트를 입력한다.
2. 서버는 입력된 데이터를 제대로 검증하지 않고 그대로 데이터베이스에 저장한다.
3. 다른 사용자 'A'가 해당 페이지에 접속하면, 서버는 악성 스크립트가 포함된 응답을 내보낸다.
4. 'A'의 브라우저는 해당 스크립트가 신뢰하는 도메인에서 왔기 때문에 안전하다고 판단하고 스크립트를 실행한다.
5. 실행된 스크립트는 'A'의 세션 쿠키를 탈취하거나, 계정 정보를 읽거나, 페이지를 조작하는 등의 악성 행위를 수행한다.

## 🛡️ 어떻게 막을 수 있을까?


### 1️⃣ 필터 제작

- 사용자의 입력 데이터가 HTML 태그로 해석되지 않도록 변환한다.
    - `<`를 `&lt;`로
    - `>`를 `&gt;`로
    - `"`를 `&quot;`로
    - `'`를 `&#x27;`로
- HTML을 허용해야 하는 경우(예: 게시판 에디터), 허용된 태그 목록(Whitelist)을 정하고 그 외의 위험한 태그 속성 (`script`, `onload`, `onerror` 등)은 모두 제거한다.
- 전문적인 보안 업체나 거대 기업에서 만든 라이브러리를 사용하는 것도 추천한다. (예: [OWASP Antisamy](https://www.owasp.org/index.php/Category:OWASP_AntiSamy_Project), [NAVER Lucy XSS Filter](https://github.com/naver/lucy-xss-filter), ESAPI 등)

### 2️⃣ 콘텐츠 보안 정책 (Content Security Policy, CSP) 사용

- 스크립트 실행에 대한 정책(조건)을 설정해 알 수 없는 스크립트가 실행되는 것을 예방할 수 있다.
    - `Content-Security-Policy: default-src 'self';`
    - 이 헤더는 "이 페이지는 오직 이 도메인(`self`)에서 온 스크립트만 실행할 수 있다"고 브라우저에 명령하여, 외부에서 주입된 악성 스크립트의 실행을 차단한다.

```html
<script src="<https://mywebsite.com/js/app.js>"></script> // 허용
<script src="<https://evil.com/malware.js>"></script> // 불허
```


### 3️⃣ 쿠키 보안 설정

- 세션 쿠키에 HttpOnly 속성을 설정한다.
- 이 속성이 있으면 JavaScript가 해당 쿠키에 접근할 수 없다. (`document.cookie`로 읽을 수 없음)

### 참고 자료

- [https://maker5587.tistory.com/62](https://maker5587.tistory.com/62)
- [https://namu.wiki/w/CSRF](https://namu.wiki/w/CSRF)
- [https://namu.wiki/w/XSS](https://namu.wiki/w/XSS)
