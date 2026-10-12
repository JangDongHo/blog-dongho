---
title: "최소 신장 트리(MST, Minimum Spanning Tree) [개념]"
description: "그래프 내의 모든 정점을 포함하는 트리 Spanning Tree = 신장 트리 = 스패닝 트리 Spanning Tree는 그래프의 최소 연결 부분 그래프 이다. - 최소 연결 = 간선의 수가 가장 적다. - n개의 정점을 가지는 그래프의 최소 간선의 개수는 (n-1)개이고, (n-1)개"
date: 2025-03-11
---

# 1. Spanning Tree


## 1.1. Spanning Tree란?

> **그래프 내의 모든 정점을 포함하는 트리**
- Spanning Tree = 신장 트리 = 스패닝 트리
- Spanning Tree는 그래프의 **최소 연결 부분 그래프** 이다.
    - 최소 연결 = 간선의 수가 가장 적다.
    - n개의 정점을 가지는 그래프의 최소 간선의 개수는 (n-1)개이고, (n-1)개의 간선으로 연결되어 있으면 필연적으로 트리 형태가 되고 이것이 바로 Spanning Tree가 된다.
- 즉, 그래프에서 일부 간선을 선택해서 만든 트리

## 1.2. Spanning Tree의 특징


![image.png](/posts/attachments/%EC%B5%9C%EC%86%8C-%EC%8B%A0%EC%9E%A5-%ED%8A%B8%EB%A6%ACMST-Minimum-Spanning-Tree-%EA%B0%9C%EB%85%90/img-01.png)

- DFS, BFS를 이용하여 그래프에서 신장 트리를 찾을 수 있다.
    - 탐색 도중에 사용된 간선만 모으면 만들 수 있다.
- 하나의 그래프에는 많은 신장 트리가 존재할 수 있다.
- Spanning Tree는 트리의 특수한 형태이므로 **모든 정점들이 연결** 되어 있어야 하고 **사이클을 포함해서는 안된다.**
- 따라서 Spanning Tree는 그래프에 있는 **n개의 정점을 정확히 (n-1)개의 간선으로 연결**한다.

## 1.3. Spanning Tree의 사용 사례


통신 네트워크 구축


![image.png](/posts/attachments/%EC%B5%9C%EC%86%8C-%EC%8B%A0%EC%9E%A5-%ED%8A%B8%EB%A6%ACMST-Minimum-Spanning-Tree-%EA%B0%9C%EB%85%90/img-02.png)

- 예를 들어, 회사 내의 모든 전화기를 가장 적은 수의 케이블을 사용하여 연결하고자 하는 경우
- n개의 위치를 연결하는 통신 네트워크를 최소의 링크(간선)을 이용하여 구축하고자 하는 경우, 최소 링크의 수는 (n-1)개가 되고, 따라서 Spanning Tree가 가능해진다.

# 2. MST


## 2.1. MST란?

> Spanning Tree 중에서 사용된 간선들의 가중치 합이 최소인 트리
- **MST = Minimum Spanning Tree = 최소 신장 트리**
- 각 간선의 가중치가 동일하지 않을 때 단순히 가장 적은 간선을 사용한다고 해서 최소 비용이 얻어지는 것은 아니다.
- MST는 간선에 가중치를 고려하여 최소 비용의 Spanning Tree를 선택하는 것을 말한다.
- 즉, 네트워크(가중치를 간선에 할당한 그래프)에 있는 모든 정점들을 가장 적은 수의 간선과 비용으로 연결하는 것이다.

## 2.2. MST의 특징

1. 간선의 가중치의 합이 최소여야 한다.
2. n개의 정점을 가지는 그래프에 대해 반드시 (n-1)개의 간선만을 사용해야 한다.
3. 사이클이 포함되어서는 안된다.

## 2.3. MST의 사용 사례


통신망, 도로망, 유통망에서 길이, 구축 비용, 전송 시간 등을 최소로 구축하려는 경우


![image.png](/posts/attachments/%EC%B5%9C%EC%86%8C-%EC%8B%A0%EC%9E%A5-%ED%8A%B8%EB%A6%ACMST-Minimum-Spanning-Tree-%EA%B0%9C%EB%85%90/img-03.png)


## 2.4. MST의 구현 방법


### 2.4.1. Kruskal MST 알고리즘

> 탐욕적인 방법(greedy method)을 이용하여 네트워크(가중치를 간선에 할당한 그래프)의 모든 정점을 최소 비용으로 연결하는 최적 해답을 구하는 것

![image.png](/posts/attachments/%EC%B5%9C%EC%86%8C-%EC%8B%A0%EC%9E%A5-%ED%8A%B8%EB%A6%ACMST-Minimum-Spanning-Tree-%EA%B0%9C%EB%85%90/img-04.png)

- **과정**
    1. 그래프의 간선들을 가중치의 오름차순으로 정렬한다.
    2. 정렬된 간선 리스트에서 순서대로 사이클을 형성하지 않는 간선을 선택한다.
        - 즉, 가장 낮은 가중치를 먼저 선택한다.
        - 사이클을 형성하는 간선을 제외한다.
    3. 해당 간선을 현재의 MST(최소 비용 신장 트리)의 집합에 추가한다.
- **사이클 생성 여부를 확인하는 방법**
    - 추가할 새로운 간선의 양끝 정점이 같은 집합에 속해 있으면 사이클이 형성
        - 따라서, **추가하고자 하는 간선의 양끝 정점이 같은 집합에 속해 있는지를 먼저 검사**해야 한다.
<details>
<summary>**union-find 알고리즘** 이용</summary>

- Disjoint Set을 표현할 때 사용하는 알고리즘

    ![image.png](/posts/attachments/%EC%B5%9C%EC%86%8C-%EC%8B%A0%EC%9E%A5-%ED%8A%B8%EB%A6%ACMST-Minimum-Spanning-Tree-%EA%B0%9C%EB%85%90/img-05.png)


    ```python
    # 초기화
    MAX_SIZE = 100  # 예시 크기 (필요에 따라 변경)
    root = list(range(MAX_SIZE))  # 각 노드의 부모를 자기 자신으로 초기화
    
    # find 함수 (경로 압축 적용)
    def find(x):
        if root[x] != x:  # 루트가 아니면, 루트 노드를 찾아가며 경로 압축
            root[x] = find(root[x])
        return root[x]
    
    # union 함수 (두 집합을 병합)
    def union(x, y):
        root_x = find(x)
        root_y = find(y)
        if root_x != root_y:  # 이미 같은 집합이 아닐 경우에만 병합
            root[root_y] = root_x  # y의 루트를 x로 변경
    ```


</details>

- **시간 복잡도**
    - union-find 알고리즘을 이용하면 Kruskal 알고리즘의 시간 복잡도는 간선들을 정렬하는 시간에 좌우된다.
    - 즉, 간선 e개를 퀵 정렬과 같은 효율적인 알고리즘으로 정렬한다면 시간 복잡도는 $O(eloge)$가 된다.
    - Prim 알고리즘의 시간 복잡도는 $O(n^2)$이므로
        - 그래프 내에 적은 숫자의 간선만을 가지는 희소 그래프(Sparse Graph)의 경우 Kruskal 알고리즘이 적합하다.
        - 그래프에 간선이 많이 존재하는 밀집 그래프(Dense Graph)의 경우 Prime 알고리즘이 적합하다.

### 2.4.2. Prim MST 알고리즘

> 시작 정점에서부터 출발하여 신장트리 집합을 **단계적으로 확장** 해나가는 방법

![image.png](/posts/attachments/%EC%B5%9C%EC%86%8C-%EC%8B%A0%EC%9E%A5-%ED%8A%B8%EB%A6%ACMST-Minimum-Spanning-Tree-%EA%B0%9C%EB%85%90/img-06.png)

- **과정**
    1. 시작 단계에서는 시작 정점만이 MST 집합에 포함된다.
    2. 앞 단계에서 만들어진 MST 집합에 인접한 정점들 중에서 최소 간선으로 연결된 정점을 선택하여 트리를 확장한다.
    3. 위의 과정을 트리가 (N-1)개의 간선을 가질 때까지 반복한다.
- **구현**

    ```python
    import heapq
    
    def solution(n, costs):
        # 1. 그래프 구성 (인접 리스트)
        graph = {i: [] for i in range(n)}
        for a, b, cost in costs:
            graph[a].append((cost, b))
            graph[b].append((cost, a))
    
        # 2. 최소 신장 트리 (MST) 구성
        total_cost = 0
        visited = set()  # 방문한 노드
        min_heap = [(0, 0)]  # (비용, 시작 정점) - 처음에는 비용 0, 정점 0에서 시작
    
        while len(visited) < n:
            cost, node = heapq.heappop(min_heap)  # 최소 비용 간선 선택
    
            if node in visited:
                continue  # 이미 방문한 노드는 무시
    
            # 3. 방문 처리 및 비용 추가
            visited.add(node)
            total_cost += cost
    
            # 4. 현재 정점에서 갈 수 있는 모든 간선 추가
            for next_cost, next_node in graph[node]:
                if next_node not in visited:
                    heapq.heappush(min_heap, (next_cost, next_node))
    
        return total_cost
    ```

- **시간 복잡도**
    - 주 반복문이 정점의 수 n만큼 반복하고, 내부 반복문이 n번 반복
    - 따라서, Prime 알고리즘의 시간 복잡도는 $O(ElogV)$

### 2.4.3. 알고리즘 비교


| **알고리즘**   | **Prim 알고리즘**                        | **Kruskal 알고리즘**                        |
| ---------- | ------------------------------------ | --------------------------------------- |
| **방식**     | 정점(Vertex) 중심                        | 간선(Edge) 중심                             |
| **작동 원리**  | 하나의 정점에서 시작하여 가장 비용이 낮은 간선을 연결       | 비용이 낮은 간선부터 추가하며 집합을 합침 (Union-Find 사용) |
| **자료구조**   | **우선순위 큐 (Min-Heap)** 사용             | **유니온-파인드 (Union-Find)** 사용             |
| **시간 복잡도** | $O(ElogV)$ (힙 사용)                    | $O(Elog⁡E)$ (정렬 후 유니온-파인드)              |
| **그래프 특성** | **밀집 그래프(Dense Graph)에 유리** (E ≈ V²) | **희소 그래프(Sparse Graph)에 유리** (E ≈ V)    |
| **사이클 검사** | 불필요 (이미 방문한 정점 체크)                   | 필요 (Union-Find로 사이클 방지)                 |


# 참고 자료


[https://gmlwjd9405.github.io/2018/08/28/algorithm-mst.html](https://gmlwjd9405.github.io/2018/08/28/algorithm-mst.html)


[https://gmlwjd9405.github.io/2018/08/29/algorithm-kruskal-mst.html](https://gmlwjd9405.github.io/2018/08/29/algorithm-kruskal-mst.html)


[https://gmlwjd9405.github.io/2018/08/31/algorithm-union-find.html](https://gmlwjd9405.github.io/2018/08/31/algorithm-union-find.html)


[https://gmlwjd9405.github.io/2018/08/30/algorithm-prim-mst.html](https://gmlwjd9405.github.io/2018/08/30/algorithm-prim-mst.html)


[https://c4u-rdav.tistory.com/49](https://c4u-rdav.tistory.com/49)
