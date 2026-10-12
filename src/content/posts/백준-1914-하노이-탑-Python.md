---
title: "[백준] 1914 하노이 탑 (Python)"
description: "bookmark"
date: 2026-03-01
---

[https://www.acmicpc.net/problem/1914](https://www.acmicpc.net/problem/1914)


## 문제 설명

- 서로 다른 크기의 원판 n개를 규칙(한 번에 하나만 이동, 큰 원판 위에 작은 원판만 가능)을 지키면서 **1번 장대에서 3번 장대로 최소 횟수로 옮기는 이동 순서를 구하는 문제**

![image.png](/posts/attachments/%EB%B0%B1%EC%A4%80-1914-%ED%95%98%EB%85%B8%EC%9D%B4-%ED%83%91-Python/img-01.png)


## 예제 입력/출력

- 입력1

    ```plain text
    3
    ```

- 출력1

    ```plain text
    7
    1 3
    1 2
    3 2
    1 3
    2 1
    2 3
    1 3
    ```


## 제약 조건

- $1 ≤ N ≤ 100$

## 문제 풀이


### 아이디어

- 하노이 탑 문제는 큰 원판을 옮기기 위해 작은 원판들을 어떻게 처리할 것인가를 생각해야 하는 문제이다.
- 가장 큰 원판인 n번 원판에 집중해보자.
- n번 원판을 1번 장대에서 3번 장대로 옮기려면, 그 위에 쌓여있는 n-1개의 원판이 모두 다른 장대로 이동되어 있어야 한다.
- 왜냐하면 규칙 상 큰 원판 위에 작은 원판을 두는 건 가능하지만, 작은 원판 위에 큰 원판을 올릴 수 없기 때문이다.
- 따라서 n번 원판을 3번 장대로 이동시키기 위해서는 먼저 위의 n-1개의 원판을 보조 장대(2번 장대)로 옮겨야 한다.

### 동작 과정

- 위 아이디어를 정리하면 다음과 같은 3단계 과정이 된다.
    1. n-1개의 원판을 1번 장대에서 2번 장대로 옮긴다.
    2. n번 원판을 1번 장대에서 3번 장대로 옮긴다.
    3. n-1개의 원판을 2번 장대에서 3번 장대로 옮긴다.
- **즉, 큰 문제(n개)는 작은 문제(n-1개) + 1번 이동 + 작은 문제(n-1개) 로 구성된다.**
- 이 구조가 바로 재귀적 사고의 핵심이다.

### 예시 (원판 3개)

- 원판이 3개있다고 가정하자. (크기: A < B < C)
- 실제 이동 순서는 다음과 같다.
    1. A를 1번 → 3번
    2. B를 1번 → 2번
    3. A를 3번 → 2번 → (A, B를 2번 장대로 이동 완료)
    4. C를 1번 → 3번 → (가장 큰 원판 이동)
    5. A를 2번 → 1번
    6. B를 2번 → 3번
    7. A를 1번 → 3번 → (A, B를 3번 장대로 이동 완료)

### **재귀적 구조와 점화식**

- 위 과정을 구조적으로 정리하면 다음과 같다.
    - 2개의 원판(A, B)을 2번 장대로 이동
    - 가장 큰 원판(C)를 3번 장대로 이동
    - 다시 2개의 원판(A, B)을 3번 장대로 이동
- $T(n)$을 원판 $n$개를 옮기는 데 필요한 최소 이동 횟수라고 하면,
    - $T(3) = T(2) + 1 + T(2)$
- 이를 점화식으로 나타내면 아래와 같다.
    - $T(n) = 2T(n - 1) + 1$
- $T(1) = 1$일 때, 실제 값을 계산해보면 다음과 같다.
    - n이 1일 때, 횟수는 1
    - n이 2일 때, 횟수는 3
    - n이 3일 때, 횟수는 7
    - n이 4일 때, 횟수는 15
    - n이 5일 때, 횟수는 31
- 위 수열은 $2^n - 1$ 형태를 따르기 때문에, 일반항은 다음과 같다.
    - $T(n) = 2^n - 1$

### **Base Case & Recursive Case**

1. **Base Case**
    - `n == 0`일 때 return
    - n이 0이면 옮길 원판이 없으므로 재귀를 종료한다.

```python
if n == 0:
    return
```

1. **Recursive Case**
    - `n-1`개를 보조 장대로 이동
    - `n`번째 원판 이동
    - `n-1`개를 목적지로 이동

```python
recursive(a, 6-a-b, n-1)
print(a, b)
recursive(6-a-b, b, n-1)
```


### 🤔 N > 20일 때 과정까지 출력하면 어떻게 될까?

- $2^{100} - 1$ → 1,267,650,600,228,229,401,496,703,205,375
- 이정도 크기는 리스트에 저장하는 것도 불가능하고, 출력해야할 줄 수도 $10^{30}$개 수준이므로 시간적으로도 물리적으로도 불가능하다.
- 따라서 문제에서는 $N ≤ 20$ 일 때만 이동 과정을 출력하도록 제한하는 것 같다.

## 풀이 코드


```python
import sys


def sys_input() -> str:
	return sys.stdin.readline().rstrip()


def sys_output() -> str:
	return sys.stdout


def recursive(a: int, b: int, n: int, out: list[tuple[int, int]]):
	# Base Case
	if n == 0:
		return

	# Recursive Case
	recursive(a, 6-a-b, n-1, out)
	out.append((a, b))
	recursive(6-a-b, b, n-1, out)


def solve(n: int) -> list[tuple[int, int]]:
	out = []
	recursive(1, 3, n, out)
	return out


def main() -> None:
	N = int(sys_input())

	print(2 ** N - 1)
	if N <= 20:
		answer = solve(N)
		for x, y in answer:
			print(x, y)


if __name__ == "__main__":
	main()
```


## 참고 자료

- 파이썬에서 제한하는 함수 호출 스택 깊이 = 1,000
- [https://blog.encrypted.gg/943](https://blog.encrypted.gg/943)
- [https://bgspro.tistory.com/6](https://bgspro.tistory.com/6)
