---
title: "[자료구조] B트리(B-Tree)의 개념, 특징"
description: "우리는 과거에 이진 탐색 트리(Binary Search Tree, BST)에 대해 배운 적이 있다."
date: 2025-04-13
---

# BST(이진 탐색 트리) 복습


![image.png](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-B%ED%8A%B8%EB%A6%ACB-Tree%EC%9D%98-%EA%B0%9C%EB%85%90-%ED%8A%B9%EC%A7%95/img-01.png)


우리는 과거에 **이진 탐색 트리(Binary Search Tree, BST)**에 대해 배운 적이 있다.


간단히 말하면 BST는 다음과 같은 특징을 갖는다.

1. **모든 노드의 왼쪽 서브트리**에는 해당 노드보다 **작은 값**만 존재하고,
2. **모든 노드의 오른쪽 서브트리**에는 해당 노드보다 **큰 값**만 존재한다.

예를 들어, 어떤 노드의 값이 20이라면 왼쪽 자식에는 20보다 작은 값, 오른쪽 자식에는 20보다 큰 값이 들어나는 구조다.


그리고 이 BST의 중요한 제약이 하나 있다.


바로, 각 노드는 최대 자식 노드를 2개까지만 가질 수 있다는 것이다.


그래서 이름이 ‘이진(Binary)’ 탐색 트리이다.


# 그런데, 자식 노드를 3개로 만들고 싶다면?


이런 생각이 들 수 있다.

> “BST는 자식이 두 개까지만 되는데, 세 개나 네 개는 안 되는 걸까?”

이 의문에서 출발한 자료구조가 바로 **B트리**이다.


B트리는 BST에서 한 발 더 나아가, **자식 노드를 2개 이상** 가질 수 있도록 만든 자료구조이다.


![image.png](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-B%ED%8A%B8%EB%A6%ACB-Tree%EC%9D%98-%EA%B0%9C%EB%85%90-%ED%8A%B9%EC%A7%95/img-02.png)


그럼 어떻게 자식 노드를 3개로 만들 수 있을까?


BST에서는 부모 노드의 값을 기준으로 왼쪽/오른쪽으로 값을 나눴다.


이 아이디어를 확장해보면 자식 노드를 세 개 이상 만들 수 있다.

- 부모 노드에는 두 개의 키 값(K1, K2) 을 저장한다.
- 그러면 자식 노드를 세 개로 분기할 수 있다.
    - 왼쪽 자식: K1보다 작은 값
    - 가운데 자식: K1보다 크고 K2보다 작은 값
    - 오른쪽 자식: K2보다 큰 값

즉, BST에서의 “좌우로만 나누는 기준”을 “범위 기준으로 분리” 하여 더 많은 자식을 두는 형태로 발전시킨 것이다.


# B트리의 구조적 확장


![image.png](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-B%ED%8A%B8%EB%A6%ACB-Tree%EC%9D%98-%EA%B0%9C%EB%85%90-%ED%8A%B9%EC%A7%95/img-03.png)


사실 자식 노드를 기준으로 설명했지만, 우리는 트리를 다룰 때 **자식 노드 = 서브트리(Subtree)** 로도 생각할 수 있다.


그래서 위에서 말한 각각의 자식 노드는 모두 서브트리로 확장될 수 있다.

- 왼쪽 서브트리: 모든 노드가 K보다 작은 값
- 가운데 서브트리: 모든 노드가 K1보다 크고 K2보다 작은 값
- 오른쪽 서브트리: 모든 노드가 K2보다 큰 값

이런 방식으로 전체 트리를 구성하면, 기존의 이진 탐색 트리처럼 탐색 성질을 유지하면서도 **자식 수를 유연하게 조절할 수 있는 트리**를 만들 수 있다.


# B트리의 핵심 특징 정리


지금까지의 설명을 정리해보자.


| **BST**      | **B트리**             |
| ------------ | ------------------- |
| 자식 노드 최대 2개  | 자식 노드 2개 이상 가능      |
| 노드에 값 하나 저장  | 노드에 값 여러 개 저장       |
| 탐색 기준: 하나의 값 | 탐색 기준: 여러 값으로 범위 나눔 |


B트리는 BST의 성질을 확장해서 만든 자료구조로, **한 노드가 여러 개의 값을 가지고, 자식 노드도 여러 개 둘 수 있다는 점**이 특징이다.


그래서 B트리는 흔히 “**BST의 일반화된 형태**” 라고도 불린다.


# B트리의 주요 파라미터들


B트리를 정의할 때 가장 중요한 값이 있다.


바로, **한 노드가 최대로 가질 수 있는 자식 노드의 개수**이다.


이 값을 보통 `m`이라고 부른다.


그리고 `m차 B트리`라고 표현한다.


예를 들어, `3차 B트리`는 **하나의 노드가 최대 3개의 자식을 가질 수 있는 B트리**를 의미한다.


이 m값에 따라 자연스럽게 결정되는 값들이 있다.


| $m$         | 각 노드의 최대 자녀 노드 수   |
| ----------- | ------------------ |
| $m - 1$     | 각 노드의 최대 key 수     |
| $⌈m/2⌉$     | 각 노드의 최소 자녀 노드 수 * |
| $⌈m/2⌉ - 1$ | 각 노드의 최소 key 수 **  |


$⌈ \ ⌉$ _기호: ‘올림’을 의미
* root node, leaf node 제외
** root node 제외_


![image.png](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-B%ED%8A%B8%EB%A6%ACB-Tree%EC%9D%98-%EA%B0%9C%EB%85%90-%ED%8A%B9%EC%A7%95/img-02.png)


# B트리의 삽입


이번에는 B트리에 데이터를 삽입하는 방식을 실제 예제를 통해 단계별로 정리해보자.


삽입 과정에서 중요한 세 가지 포인트가 있다.

1. 추가는 항상 leaf 노드에 한다.
2. 노드 안 데이터는 오름차순 정렬되어야 한다.
3. 노드가 넘치면 가운데(median) key를 기준으로 좌우 key들은 **분할(split)**하고 가운데 key는 **승격(promote)**한다.

3차 B트리 데이터 삽입을 예로 들어보자.


---


**1 추가**


![image.png](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-B%ED%8A%B8%EB%A6%ACB-Tree%EC%9D%98-%EA%B0%9C%EB%85%90-%ED%8A%B9%EC%A7%95/img-04.png)

- 트리가 비어 있는 상태에서 시작한다.
- 노드가 넘치지 않기 때문에 그대로 1을 삽입한다.
- 👉 문제가 없으므로 그대로 유지한다.

---


**15 추가**


![image.png](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-B%ED%8A%B8%EB%A6%ACB-Tree%EC%9D%98-%EA%B0%9C%EB%85%90-%ED%8A%B9%EC%A7%95/img-05.png)

- 삽입 시 노드 내부 데이터는 항상 오름차순 정렬되어야 한다.
- 👉 여전히 노드가 넘치지 않으므로 그대로 유지한다.

---


**2 추가**


![image.png](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-B%ED%8A%B8%EB%A6%ACB-Tree%EC%9D%98-%EA%B0%9C%EB%85%90-%ED%8A%B9%EC%A7%95/img-06.png)

- 2를 넣으면 노드에 들어갈 수 있는 최대 key 개수 `m - 1`개를 초과한다.

![image.png](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-B%ED%8A%B8%EB%A6%ACB-Tree%EC%9D%98-%EA%B0%9C%EB%85%90-%ED%8A%B9%EC%A7%95/img-07.png)

- 노드 내부 데이터를 오름차순 정렬한다.
- 가운데 값인 2를 **승격(promote)**시킨다.
- 왼쪽(1), 오른쪽(15)으로 노드를 **분할(split)** 한다.

![image.png](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-B%ED%8A%B8%EB%A6%ACB-Tree%EC%9D%98-%EA%B0%9C%EB%85%90-%ED%8A%B9%EC%A7%95/img-08.png)


---


**5 추가**


![image.png](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-B%ED%8A%B8%EB%A6%ACB-Tree%EC%9D%98-%EA%B0%9C%EB%85%90-%ED%8A%B9%EC%A7%95/img-09.png)

- 이제부터는 삽입할 때 항상 leaf 노드에 삽입해야 한다.
- 루트 노드의 값은 2, 삽입할 값은 5
- 즉, 5 > 2 이므로 오른쪽 자식(15)쪽으로 내려간다.

![image.png](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-B%ED%8A%B8%EB%A6%ACB-Tree%EC%9D%98-%EA%B0%9C%EB%85%90-%ED%8A%B9%EC%A7%95/img-10.png)

- 오른쪽 노드(15)에 5를 넣고, 오름차순 정렬한다.

---


## **반복 삽입을 통해 완성되는 B트리의 특징**


여러 데이터를 순차적으로 삽입하면서 분할과 승격 과정을 거치다 보면, 결국 아래와 같은 형태의 트리 구조가 만들어진다.


![image.png](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-B%ED%8A%B8%EB%A6%ACB-Tree%EC%9D%98-%EA%B0%9C%EB%85%90-%ED%8A%B9%EC%A7%95/img-11.png)


삽입 과정을 거치면서 알 수 있는 B트리의 주요한 특징은 다음과 같다.


### 1. 모든 리프 노드가 동일한 레벨에 위치한다.

- B트리는 항상 **균형 잡힌 트리(balanced tree)**를 유지한다.
    - 루트에서 모든 리프 노드까지의 깊이는 동일하다.
    - 어떤 노드도 너무 깊거나 얕지 않게 균형을 맞춰준다.
    - 따라서 삽입/삭제가 반복되더라도 **트리의 높이가 급격히 커지지 않는다.**

### 2. 평균 / 최악의 탐색 성능 = O(logN)

- 이 균형 잡힌 구조는 탐색 성능에 큰 이점을 가져다준다.
- 트리의 높이는 $log N$ 수준으로 얕기 때문에, **탐색 성능이 항상 일정하게 빠르다.**

# 참고 자료


[https://www.youtube.com/watch?v=bqkcoSm_rCs&ab_channel=%EC%89%AC%EC%9A%B4%EC%BD%94%EB%93%9C](https://www.youtube.com/watch?v=bqkcoSm_rCs&ab_channel=%EC%89%AC%EC%9A%B4%EC%BD%94%EB%93%9C)


[https://yeongjaekong.tistory.com/38](https://yeongjaekong.tistory.com/38)


[https://product.kyobobook.co.kr/detail/S000214014967?utm_source=google&utm_medium=cpc&utm_campaign=googleSearch&gt_network=g&gt_keyword=&gt_target_id=dsa-604712360775&gt_campaign_id=9979905549&gt_adgroup_id=132556570510&gad_source=1](https://product.kyobobook.co.kr/detail/S000214014967?utm_source=google&utm_medium=cpc&utm_campaign=googleSearch&gt_network=g&gt_keyword=&gt_target_id=dsa-604712360775&gt_campaign_id=9979905549&gt_adgroup_id=132556570510&gad_source=1)
