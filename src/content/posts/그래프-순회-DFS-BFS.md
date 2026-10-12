---
title: "그래프 순회 (DFS & BFS)"
description: "bookmark"
date: 2024-09-23
---

[https://gliver.tistory.com/36](https://gliver.tistory.com/36)


## 그래프 순회란?

- 그래프 순회(탐색)란 그래프 내의 모든 노드를 한 번씩 방문하는(살펴보는) 것이다.
- 비선형 자료구조인 그래프의 순회(탐색)은 시작 노드를 설정해 주어야 한다.
- **그래프 탐색 알고리즘**
    - **깊이 우선 탐색 (DFS, Depth-Frist Search)**
        - 현재 탐색 중인 노드를 기준으로 연결된 노드를 즉시 방문하는 방식
    - **너비 우선 탐색 (BFS, Breadth-First Search)**
        - 시작 노드를 기준으로 거리가 가까운 노드를 먼저 방문하는 방식

## 깊이 우선 탐색 (DFS)

- 현재 탐색 중인 노드를 기준으로 **연결된 노드를 즉시 방문**하는 방식
- 시간 복잡도: $O(N + M)$
    - $N$: 노드의 개수
    - $M$: 간선의 개수
<details>
<summary>**동작 방식**</summary>

- 시작 노드를 `0`번 노드로 하여 DFS 알고리즘을 수행

![image.png](/posts/attachments/%EA%B7%B8%EB%9E%98%ED%94%84-%EC%88%9C%ED%9A%8C-DFS-BFS/img-01.png)


</details>

<details>
<summary>**예제 코드** (재귀 함수를 이용한 구현)</summary>

```python
N = 5 # number of nodes

# DFS function
def dfs(node):
	global adj_list, visited

	# base case
	if visited[node]: 
		return
	visited[node] = True

	print(node, end=' ')

	# recursive case
	for adj_node in adj_list[node]:
		dfs(adj_node)


adj_list = [[] for _ in range(N)]
visited = [False] * N

# Create Adjacency List
adj_list[0].append(1); adj_list[0].append(2)
adj_list[1].append(4); adj_list[1].append(3)
adj_list[2].append(3)
adj_list[3].append(0)

# Execute Depth-First Search with start node '0'
dfs(0)
```

- `adj_list`: 인접 리스트
- `visited`: 노드의 방문 여부를 체크하기 위한 배열

</details>


## 너비 우선 탐색 (BFS)

- 시작 노드를 기준으로 **거리가 가까운 노드를 먼저 방문**하는 방식
- 시간 복잡도: $O(N+M)$
    - $N$: 노드의 개수
    - $M$: 간선의 개수
<details>
<summary>**동작 방식**</summary>

- 시작 노드를 `0`번 노드로 하여 BFS 알고리즘을 수행

![image.png](/posts/attachments/%EA%B7%B8%EB%9E%98%ED%94%84-%EC%88%9C%ED%9A%8C-DFS-BFS/img-02.png)


</details>

<details>
<summary>**예제 코드** (재귀 함수를 이용한 구현)</summary>

```python
from collections import deque

N = 5 # number of nodes

adj_list = [[] for _ in range(N)]
visited = [False] * N

# Create Adjacency List
adj_list[0].append(1); adj_list[0].append(2)
adj_list[1].append(4); adj_list[1].append(3)
adj_list[2].append(3)
adj_list[3].append(0)

# Execute Breadth-First Search with start node '0'
q = deque()
q.append(0)
visited[0] = True

while q:
    node = q.popleft()
    print(node, end=' ')

    for adj_node in adj_list[node]:
        if visited[adj_node]:
            continue
        q.append(adj_node)
        visited[adj_node] = True
```

- `adj_list`: 인접 리스트
- `visited`: 노드의 방문 여부를 체크하기 위한 배열
- `q`: 방문할 노드들을 담고 있는 큐 자료형

</details>

<details>
<summary>**원리 설명**</summary>

![image.png](/posts/attachments/%EA%B7%B8%EB%9E%98%ED%94%84-%EC%88%9C%ED%9A%8C-DFS-BFS/img-03.png)

1. queue에 시작 노드를 넣는다.
2. 이후에 queue에 들어 있는 원소(노드)를 꺼내며 방문 처리를 하며 노드와 연결된 노드들을 queue에 넣어준다.
3. 이렇게 하면 시작 노드로부터 가까운 노드를 먼저 방문하며 탐색할 수 있게 된다.

</details>


## 내용 정리

- 그래프 순회 알고리즘으로 **깊이 우선 탐색(DFS)**과 **너비 우선 탐색(BFS)**가 있다.
- 두 알고리즘 모두, 노드와 간선을 한 번씩 처리하기 때문에 시간 복잡도는 $O(N + M)$이다.
- **깊이 우선 탐색(DFS)** vs **너비 우선 탐색(BFS)**
    - **일반적인 그래프 순회(탐색)를 구현해야 할 때**
        - DFS와 BFS 모두 사용 가능
    - **시작 노드로부터 가까운 노드 순으로 방문해야 할 때**
        - DFS 불가능 / BFS 가능
- **그러나, 깊이 우선 탐색(DFS)를 공부해야 하는 이유**
    - 그래프 탐색 응용 문제에서 DFS를 기반으로 코드를 작성해야 하는 경우가 종종 있음.
