---
title: "Codex와 Obsidian 연동하기"
description: "최근에 안드레 카파시의 LLM 위키 라는 아티클을 읽은 적이 있음 LLM 위키로 지식을 복리로 쌓는 방법에 대한 내용인데 나도 한번 내가 공부한 내용이나 개발하면서 겪은 문제들을 LLM이 참고할 수 있는 형태로 만들어보고 싶었음 이를 위해 Obsidian Local REST API와 o"
date: 2026-06-02
---

## 🔷 서론

- 최근에 안드레 카파시의 [LLM 위키](https://yozm.wishket.com/magazine/detail/3711/) 라는 아티클을 읽은 적이 있음
- LLM 위키로 지식을 복리로 쌓는 방법에 대한 내용인데 나도 한번 내가 공부한 내용이나 개발하면서 겪은 문제들을 LLM이 참고할 수 있는 형태로 만들어보고 싶었음
- 이를 위해 Obsidian Local REST API와 obisidan-mcp-server를 이용해 Codex와 Obsidian을 연동해봄

## 🔷 Obsidian Local Rest API 란?

- 앱 안에서 실행되는 로컬 HTTP API 서버
- 옵시디언은 기본적으로 사람이 GUI로 노트를 읽고 쓰는 앱
- 그런데 외부 프로그램이 옵시디언 노트를 가져오거나 수정하려면 통로가 필요
- 그 통로를 만들어주는 플러그인이 Obsidian Local REST API

```plain text
Obsidian 앱
 └─ Local REST API 플러그인
     └─ http://127.0.0.1:27123
```

- 이 플러그인을 켜면 내 컴퓨터 안에서만 접근 가능한 API 서버가 뜸
- 예를 들어 외부 프로그램이 이런 식으로 요청 가능

```plain text
curl -H "Authorization: Bearer API_KEY" \
  http://127.0.0.1:27123/vault/
```

- 그러면 Obsidian vault 안의 파일 목록을 가져올 수 있음
    - Obsidian valut -> 옵시디언이 관리하는 노트 폴더

## 🔷 Obsidian-mcp-server 란?

- AI 도구가 옵시디언을 사용할 수 있게 해주는 중간 번역 서버
- Codex, Claude, Cursor 같은 AI 도구는 보통 옵시디언 REST API의 세부 주소를 직접 알지 못함
- 예를 들어 AI의 입장에서는 이런 REST API들을 직접 다루기 어려움

```plain text
GET /vault/
GET /vault/{filename}
POST /vault/{filename}
PATCH /vault/{filename}
```

- 그래서 `obsidian-mcp-server`가 중간에 서서 AI가 이해하는 MCP tool 형태로 바꿔줌
- 예를 들면 AI에게는 이런 도구처럼 보임

```plain text
obsidian_list_notes
obsidian_get_note
obsidian_search_notes
obsidian_write_note
obsidian_append_to_note
```

- 즉, Obisidian MCP Server는 AI와 Obsidian Local REST API 사이의 어댑터 역할

### 둘의 차이


| 구분     | Obsidian Local REST API | Obsidian MCP Server                 |
| ------ | ----------------------- | ----------------------------------- |
| 실행 위치  | Obsidian 앱 내부 플러그인      | 별도 Node.js 서버 또는 npx 프로세스           |
| 역할     | Obsidian vault에 직접 접근   | AI 도구와 Obsidian API 사이를 중계          |
| 통신 방식  | HTTP REST API           | MCP 프로토콜, 보통 stdio 또는 HTTP          |
| 사용하는 쪽 | 외부 앱, 스크립트, MCP 서버      | Codex, Claude, Cursor 같은 MCP client |
| 필요한 이유 | Obsidian 데이터를 외부에 노출    | AI가 Obsidian을 tool처럼 쓰게 함           |


### 전체 흐름


```plain text
Codex
  ↓ 1. "Obsidian에서 노트 찾아줘"
Obsidian MCP Server
  ↓ 2. MCP tool 호출을 REST API 요청으로 변환
Obsidian Local REST API
  ↓ 3. Obsidian vault에서 파일 읽기
Obsidian Vault
  ↑ 4. 노트 내용 반환
Obsidian Local REST API
  ↑ 5. REST 응답 반환
Obsidian MCP Server
  ↑ 6. MCP 응답으로 변환
Codex
  ↑ 7. 노트 내용을 보고 답변
```


```plain text
1. Codex가 obsidian_search_notes tool을 호출
2. Obsidian MCP Server가 요청을 받음
3. MCP Server가 Local REST API에 검색 요청을 보냄
4. Local REST API가 Obsidian vault에서 관련 노트를 찾음
5. 찾은 결과를 MCP Server에 반환
6. MCP Server가 결과를 Codex가 이해할 수 있는 MCP 응답으로 변환
7. Codex가 사용자에게 결과를 보여줌
```


### 1. Obsidian에서 Local REST API 플러그인 설치


```plain text
설정 → 커뮤니티 플러그인 → 탐색
```

- Local REST API 플러그인 설치하고 활성화

    ![Pasted_image_20260602114450.png](/posts/attachments/Codex%EC%99%80-Obsidian-%EC%97%B0%EB%8F%99%ED%95%98%EA%B8%B0/img-01.png)

- 이후 API Key 복사

    ![Pasted_image_20260602114835.png](/posts/attachments/Codex%EC%99%80-Obsidian-%EC%97%B0%EB%8F%99%ED%95%98%EA%B8%B0/img-02.png)

- 비암호화(HTTP) 서버 활성화

    ![Pasted_image_20260602131224.png](/posts/attachments/Codex%EC%99%80-Obsidian-%EC%97%B0%EB%8F%99%ED%95%98%EA%B8%B0/img-03.png)


### 2. Obsidian REST API가 켜졌는지 테스트


```bash
curl -H "Authorization: Bearer $OBSIDIAN_API_KEY" \
  http://127.0.0.1:27123/
```

- `$OBSIDIAN_API_KEY` 에 위에서 복사한 API key 넣기

![image.png](/posts/attachments/Codex%EC%99%80-Obsidian-%EC%97%B0%EB%8F%99%ED%95%98%EA%B8%B0/img-04.png)


### 3. Codex 설정 파일에 직접 등록하기

- macOS/Linux 기준으로 `~/.codex/config.toml` 에 Codex 사용자 설정 파일이 위치

```bash
vim ~/.codex/config.toml
```

- 아래 내용을 추가

```toml
[mcp_servers.obsidian]
command = "npx"
args = ["-y", "obsidian-mcp-server@latest"]
startup_timeout_sec = 20
tool_timeout_sec = 60

[mcp_servers.obsidian.env]
MCP_TRANSPORT_TYPE = "stdio"
MCP_LOG_LEVEL = "info"
OBSIDIAN_API_KEY = "여기에_Obsidian_Local_REST_API_KEY"
OBSIDIAN_BASE_URL = "http://127.0.0.1:27123"
```

- OBSIDIAN_API_KEY 에는 위에서 복사한 API key 넣기

### 4. Codex에서 테스트

- Codex를 실행하고 `/mcp`를 입력해서 obsidian 서버가 보이는지 확인

    ![Pasted_image_20260602132004.png](/posts/attachments/Codex%EC%99%80-Obsidian-%EC%97%B0%EB%8F%99%ED%95%98%EA%B8%B0/img-05.png)

- 그 다음 Obsidian mcp 사용해서 내 노트 목록 가져와달라고 요청

![Pasted_image_20260602132720.png](/posts/attachments/Codex%EC%99%80-Obsidian-%EC%97%B0%EB%8F%99%ED%95%98%EA%B8%B0/img-06.png)

- 연동 성공 !
