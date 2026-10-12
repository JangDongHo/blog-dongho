---
title: "package.json 설명할 수 있어?"
description: "누군가 package.json이 뭐냐고 물어봤을 때 나는 다음과 같이 대답할 것 같다."
date: 2023-01-09
---

누군가 package.json이 뭐냐고 물어봤을 때 나는 다음과 같이 대답할 것 같다.

> 그거.. 프로젝트에 대한 설정파일?
>
> npm install 할 때 어떤 패키지들을 다운받을 건지 명시해두는 파일?
>
>

수 개월을 사용을 했지만 구체적으로 설명을 하지는 못했다.


잘 알고 잘 쓸 수 있도록 필요한 `package.json` 한번 제대로 톺아보자.


---


# NPM


NestJS는 Node.js를 기반으로 하므로 npm이라는 패키지(또는 라이브러리) 관리 시스템을 사용할 수 있다.


누구나 자신이 만든 Node.js 기반 라이브러리를 등록하여 다른 사람들이 사용하게 공개할 수 있다.


개발에 필요한 라이브러리가 있다면 간단한 명령어를 통해 npm으로 설치하면 된다.


---


# package.json


Nest 프로젝트를 처음 생성하면 package.json 파일이 만들어지게 된다.


이렇게 만들어진 package.json은 다음과 같은 역할을 한다.

1. 애플리케이션이 필요로 하는 패키지 목록을 나열한다.
2. 각 패키지는 시맨틱 버저닝 규칙으로 필요한 버전을 기술한다.
3. 다른 개발자와 같은 빌드 환경을 구성할 수 있다. 버전이 달라 발생하는 문제를 예방한다.

# package-lock.json


프로젝트 루트 디렉터리에서 npm install 명령을 수행하면 node_moudles 디렉터리와 package-lock.json 파일이 함께 생성된다.


package-lock.json 파일은 node_modules나 package.json 파일의 내용이 바뀌면 npm install 명령을 수행할 때 자동 수정된다.


node_modules 디렉터리는 프로젝트가 필요로 하는 패키지들이 실제로 저장되는 장소이다.


package-lock.json 파일은 package.json에 선언된 패키지들이 설치될 때의 정확한 버전과 서로 간의 의존성을 표현한다.


이 파일이 있기에 팀원들 간에 정확한 개발 환경을 공유할 수 있고, 같은 패키지 설치를 위해 node_modules 디렉터리를 소스 저장소에 따로 공유하지 않아도 된다.


만약, 소스 코드 내에 package-lock.json 파일이 이미 존재한다면 npm install 명령을 수행할 때 이 파일을 기준으로 패키지들을 설치하게 된다.


package-lcok.json 파일은 소스 코드 저장소에서 꼭 관리를 해주어야 한다.


# package.json 파일 분석


```json
{
  "name": "practice-project",
  "version": "0.0.1",
  "description": "",
  "author": "",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
```


## name


패키지의 이름이다. version과 함께 고유한 식별자가 된다.


패키지를 npm에 공개하지 않는다면 신경쓰지 않아도 된다.


## version


패키지의 버전이다. 공개할 패키지를 만들고 있다면 버전명에 신경 써야 한다.


버전과 관련해서는 [다른 블로그](https://blog.outsider.ne.kr/1041)를 참고하길 바란다.


## description


패키지에 대한 설명을 기술한다.


## author


배포자의 이름을 쓰면 된다.


다수의 사람을 표시하기 위해서는 “contributors” 필드로 작성해야 한다.


## private


true로 설정할 경우 공개되지 않는다.


## license


패키지의 라이선스를 기술한다. 공개된 패키지를 사용할 때 참고해야 한다.


## scripts


npm run 명령과 함께 수행할 수 있는 스크립트이다.


예를 들어 npm run build를 수행하면 nest build 명령을 수행하게 된다.


스크립트를 잘 활용하면 풍부한 기능을 구현할 수 있다.


```json
"dependencies": {
    "@nestjs/common": "^9.0.0",
    "@nestjs/core": "^9.0.0",
    "@nestjs/platform-express": "^9.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.2.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^9.0.0",
    "@nestjs/schematics": "^9.0.0",
    "@nestjs/testing": "^9.0.0",
    "@types/express": "^4.17.13",
    "@types/jest": "29.2.4",
    "@types/node": "18.11.18",
    "@types/supertest": "^2.0.11",
    "@typescript-eslint/eslint-plugin": "^5.0.0",
    "@typescript-eslint/parser": "^5.0.0",
    "eslint": "^8.0.1",
    "eslint-config-prettier": "^8.3.0",
    "eslint-plugin-prettier": "^4.0.0",
    "jest": "29.3.1",
    "prettier": "^2.3.2",
    "source-map-support": "^0.5.20",
    "supertest": "^6.1.3",
    "ts-jest": "29.0.3",
    "ts-loader": "^9.2.3",
    "ts-node": "^10.0.0",
    "tsconfig-paths": "4.1.1",
    "typescript": "^4.7.4"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```


## dependencies


패키지가 의존하는 다른 패키지를 기술한다.


프로덕션(실제로 운영하는) 환경에서 필요한 주요 패키지를 선언한다.


## devDependencies


dependencies와 같은 기능을 하지만 개발 환경 또는 테스트 환경에만 필요한 패키지를 여기서 선언한다.


실 사용 서비스에서는 불필요한 패키지를 설치하지 않도록 해야 한다.


## jest


테스팅 라이브러리 Jest를 위한 환경 구성 옵션이다.


NestJS는 기본으로 Jest를 이용한 테스트를 제공한다.


# Reference

- [책] [nestjs로 배우는 백엔드 프로그래밍](https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=306191959&start=pgooglemc)(한용재 저)
- [알고 쓰자 package.json](https://hoya-kim.github.io/2021/09/14/package-json/)
