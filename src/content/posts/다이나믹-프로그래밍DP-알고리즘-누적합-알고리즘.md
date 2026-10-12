---
title: "다이나믹 프로그래밍(DP) 알고리즘 : 누적합 알고리즘"
description: "누적합 알고리즘은 영어로 Prefix Sum 알고리즘이라고 많이 부른다. (전저리 후에) 1차원 배열 또는 2차원 배열에서 연속된 구간의 합을 O(1)만에 구하는 알고리즘이다."
date: 2024-08-11
---

## 1. 누적합 알고리즘이란?

- 누적합 알고리즘은 영어로 **Prefix Sum 알고리즘**이라고 많이 부른다.
- (전저리 후에) 1차원 배열 또는 2차원 배열에서 연속된 구간의 합을 $O(1)$만에 구하는 알고리즘이다.

## 2. 1차원 배열에서 누적합 알고리즘

- 배열의 길이를 $N$이라고 할 때, $O(N)$의 전처리를 수행하면 된다.
- **DP 테이블 설계**
<details>
<summary>$psum[n]$: $1$~$n$번째 원소까지의 합</summary>

![4a69eba7-b7c4-4e85-88ed-fee355aa49ff.png](/posts/attachments/%EB%8B%A4%EC%9D%B4%EB%82%98%EB%AF%B9-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8DDP-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EB%88%84%EC%A0%81%ED%95%A9-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98/img-01.png)


</details>

- **관계식**
<details>
<summary>$psum[n] = psum[n-1] + arr[n]$</summary>

![89e2911a-5e34-48c5-9542-9f90f39bbaaa.png](/posts/attachments/%EB%8B%A4%EC%9D%B4%EB%82%98%EB%AF%B9-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8DDP-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EB%88%84%EC%A0%81%ED%95%A9-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98/img-02.png)


</details>

- $a$부터 $b$까지 원소의 합을 구하는 방법
<details>
<summary>$psum[b] - psum[a-1]$</summary>

![image.png](/posts/attachments/%EB%8B%A4%EC%9D%B4%EB%82%98%EB%AF%B9-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8DDP-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EB%88%84%EC%A0%81%ED%95%A9-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98/img-03.png)


</details>

<details>
<summary>예제코드</summary>

```python
def get_sum(a, b): # a부터 b까지의 원소의 합 반환
	global psum
	return psum[b] - psum[a - 1]

N = 9

arr = [0, 1, 3, 10, -2, 3, -4, 10, 3, 8] # 1인덱스
psum = [0] * (N + 1)

# psum 갱신
for n in range(1, N + 1):
	psum[n] = psum[n - 1] + arr[n]

# 2부터 8까지의 합
print(get_sum(2, 8))
```


</details>


## 3. 2차원 배열에서 누적합 알고리즘

- 2차원 배열의 세로 길이를 $N$, 가로 길이를 $M$이라고 할 때, $O(NM)$의 전처리를 수행하면 된다.
- **DP 테이블 설계**
<details>
<summary>$psum[n][m]$: $(1, 1)$부터 $(n, m)$까지의 2차원 합</summary>

![image.png](/posts/attachments/%EB%8B%A4%EC%9D%B4%EB%82%98%EB%AF%B9-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8DDP-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EB%88%84%EC%A0%81%ED%95%A9-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98/img-04.png)


</details>

- **관계식**
<details>
<summary>$psum[n][m] = (psum[n][m-1] + psum[n-1][m] - psum[n-1][m-1]) + arr[n][m]$</summary>

![image.png](/posts/attachments/%EB%8B%A4%EC%9D%B4%EB%82%98%EB%AF%B9-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8DDP-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EB%88%84%EC%A0%81%ED%95%A9-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98/img-05.png)


</details>

- **(sy, sx)부터 (ey, ex)까지의 2차원 합 구하는 방법**
<details>
<summary>$psum[ey][ex] - (psum[ey][sx-1] + psum[sy-1][ex] - psum[sy-1][sx-1])$</summary>

![image.png](/posts/attachments/%EB%8B%A4%EC%9D%B4%EB%82%98%EB%AF%B9-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8DDP-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98-%EB%88%84%EC%A0%81%ED%95%A9-%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98/img-06.png)


</details>

<details>
<summary>예제코드</summary>

```python
def get_sum(sy, sx, ey, ex): # (sy, sx)부터 (ey, ex)까지의 2차원 합 반환
	global psum
	return psum[ey][ex] - (psum[ey][sx - 1] + psum[sy - 1][ex] - psum[sy - 1][sx - 1])

N = 4
M = 5

arr = [
	[0, 0, 0, 0, 0, 0],
	[0, 10, 10, 3, 8, 4],
	[0, 9, 8, 4, 1, 10],
	[0, 7, 6, 5, 6, 5],
	[0, 2, 6, 6, 4, 10]
]
psum = [[0 for _ in range(M + 1)] for _ in range(N + 1)]

# psum 갱신
for n in range(1, N + 1):
	for m in range(1, M + 1):
		psum[n][m] = (psum[n - 1][m] + psum[n][m - 1] - psum[n - 1][m - 1]) + arr[n][m]

# (3, 3)부터 (4, 5)까지의 2차원 합
print(get_sum(3, 3, 4, 5))
```


</details>


## 4. 누적합 알고리즘은 언제 쓸까?

<details>
<summary>1차원 배열의 누적합</summary>

- 연속된 합의 구간을 여러 번 구해야 할 때 쓰면 효율적이다.
    - $O(N^3)$ → $O(N^2)$

</details>

<details>
<summary>2차원 배열의 누적합</summary>

- (직사각형 모양의) 2차원 합을 여러 번 구해야 할 때 쓰면 효율적이다.
    - $O((NM)^3) → O((NM)^2)$

</details>

- 관련 문제
    - [BOJ 11659](https://www.acmicpc.net/problem/11659)
    - [BOJ 11660](https://www.acmicpc.net/problem/11660)
