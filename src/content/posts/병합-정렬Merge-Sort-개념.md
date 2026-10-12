---
title: "병합 정렬(Merge Sort) [개념]"
description: "---"
date: 2024-11-14
---

## 1. 병합 정렬(merge sort)이란?


---

- ‘존 폰 노이만(John von Neumann)’이라는 사람이 제안한 방법
- 병합 정렬은 분할 정복(Devide and Conquer) 기법과 재귀 알고리즘을 이용한 정렬 알고리즘

## 2. 기본 컨셉


---


![사진 출처: https://medium.com/javarevisited/visualizing-designing-and-analyzing-the-merge-sort-algorithm-904ceb78a592](/posts/attachments/%EB%B3%91%ED%95%A9-%EC%A0%95%EB%A0%ACMerge-Sort-%EA%B0%9C%EB%85%90/img-01.png)

- 주어진 배열을 원소가 하나 밖에 남지 않을 때까지 계속 둘로 쪼갠 후에 다시 크기 순으로 재배열 하면서 원래 크기의 배열로 합치는 방식

## 3. 병합 정렬 특징


---

- 알고리즘을 큰 그림에서 보면 분할(split) 단계와 방합(merge) 단계로 나눌 수 있으며, 단순히 중간 인덱스를 찾아야 하는 분할 비용보다 모든 값들을 비교해야하는 병합 비용이 크다.
- $O(NlogN)$의 시간 복잡도를 가진다.
    - **분할**: 이미지에서 보는 것과 같이 배열의 수가 8 → 4 → 2 → 1 로 전반적인 반복의 수는 점점 절반으로 줄어들 기 때문에 $O(logN)$의 시간이 소모
    - **병합**: 각 분할된 배열을 합치는 과정에서 배열의 크기인 $N$에 비례하여 시간이 소모된다.

## 4. 병합 정렬 장단점


---

- **장점**:
    - 안정 정렬(Stable Sort)로, 동일한 값의 요소들이 원래 순서대로 유지된다.
    - 배열의 크기에 비해 정렬에 걸리는 시간이 일정하여, 데이터가 클 경우에도 효율적이다.
    - 다른 정렬 방식에 비해 비교적 **간단하고 직관적**이다.
- **단점**:
    - 추가적인 메모리 공간이 필요하므로, 공간 복잡도가 $O(N)$이다.
    - 작은 데이터에 비해 큰 데이터에서 유리한 반면, **데이터가 적을 경우 다른 정렬 알고리즘에 비해 비효율적**일 수 있다.

## 5. 파이썬에서의 병합 정렬


---

- 기본적으로 재귀를 이용해서 병합 정렬을 구현
- 먼저 배열을 더 이상 나눌 수 없을 때 까지 최대한 분할한 후에, 다시 병합하면서 점점 큰 배열을 만들어 나가면 된다.
- 따라서 이 재귀 알고리즘의 Base Case는 입력 배열의 크기가 2보다 작을 때이며, 이 조건에 해당할 때는 배열을 그대로 반환하면 된다.
<details>
<summary>`python` 간단한 방식</summary>

- 파이썬의 리스트 slice notation(arr[start:end])을 사용하여 **간결하게 구현**한 방식
- 리스트 slice를 할 때 **배열의 복제가 일어나므로 메모리 사용 효율이 떨어진다는 단점**이 존재

```python
def merge_sort(arr):
    if len(arr) < 2:
        return arr

    mid = len(arr) // 2
    low_arr = merge_sort(arr[:mid])
    high_arr = merge_sort(arr[mid:])

    merged_arr = []
    l = h = 0
    while l < len(low_arr) and h < len(high_arr):
        if low_arr[l] < high_arr[h]:
            merged_arr.append(low_arr[l])
            l += 1
        else:
            merged_arr.append(high_arr[h])
            h += 1
    merged_arr += low_arr[l:]
    merged_arr += high_arr[h:]
    return merged_arr
```


</details>

<details>
<summary>`python` 메모리 사용량 최적화 방식</summary>

- 병합 결과를 담을 새로운 배열을 매번 생성해서 리턴하지 않고, **인덱스 접근을 이용해 입력 배열을 업데이트 하는 방식** (In-place sort)

```python
def merge_sort(arr):
    def sort(low, high):
        if high - low < 2:
            return
        mid = (low + high) // 2
        sort(low, mid)
        sort(mid, high)
        merge(low, mid, high)

    def merge(low, mid, high):
        temp = []
        l, h = low, mid

        while l < mid and h < high:
            if arr[l] < arr[h]:
                temp.append(arr[l])
                l += 1
            else:
                temp.append(arr[h])
                h += 1

        while l < mid:
            temp.append(arr[l])
            l += 1
        while h < high:
            temp.append(arr[h])
            h += 1

        for i in range(low, high):
            arr[i] = temp[i - low]

    return sort(0, len(arr))
```


</details>


## 참고 자료


[https://gmlwjd9405.github.io/2018/05/08/algorithm-merge-sort.html](https://gmlwjd9405.github.io/2018/05/08/algorithm-merge-sort.html)


[https://www.daleseo.com/sort-merge/](https://www.daleseo.com/sort-merge/)
