---
title: "[자료구조] 해시 테이블(Hash Table)이란? (Feat. JavaScript)"
description: "안녕하세요, 장동호 입니다!"
date: 2025-05-28
---

안녕하세요, 장동호 입니다!


오늘은 해시 테이블에 대해 이야기 해보려고 합니다.


# 해시 테이블(Hash Table)이란?


![이미지 출처: https://velog.io/@soom/Hash-Table-Hash-Collision-Resolution](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-%ED%95%B4%EC%8B%9C-%ED%85%8C%EC%9D%B4%EB%B8%94Hash-Table%EC%9D%B4%EB%9E%80-Feat-JavaScript/img-01.png)


**해시 테이블은 키(key)와 값(value)으로 데이터를 저장하는 자료구조** 중 하나로, 빠르게 데이터를 검색할 수 있는 것이 특징입니다. 해시 테이블이 빠른 검색 속도를 제공하는 이유는 해시 함수를 사용해 데이터의 위치를 직접 계산해 접근하기 때문입니다.


해시 테이블의 구조를 먼저 살펴보겠습니다. 키를 통해 얻고자 하는 데이터는 **버킷(bucket)**에 저장되어 있습니다. 버킷은 여러 개가 존재하며, 여러 버킷들은 배열을 형성합니다. 해시 함수는 키를 인자로 활용해 인덱스를 반환합니다. 이 인덱스가 곧 버킷 배열의 인덱스에 해당합니다. 키를 해시 함수에 통과시켜 원하는 버킷에 접근할 수 있는 것이죠. 이러한 해시 테이블의 핵심은 해시 함수에 있습니다. 해시 함수에 대해 자세히 알아보겠습니다.


# 해시 함수(Hash Function) 역할


**해시 함수**는 **키(key)를 정수로 변환**하고, 그 정수를 이용해 배열의 인덱스를 계산하는 함수입니다. 이 함수는 해시 테이블에서 데이터를 어디에 저장할지 결정하는 핵심 요소입니다.


가장 간단한 해시 함수 방식은 **모듈러 연산(modular arithmetic)** 입니다. 이 방식은 키를 숫자로 변환한 뒤, **배열의 크기(버킷 수)** 로 나눈 나머지를 인덱스로 사용하는 방식입니다.


```typescript
index = hash(key) % M
```


여기서 hash(key)는 키를 정수로 변환한 값이고, M은 해시 테이블(배열)의 크기입니다.


예를 들어, 키 `“apple”`을 해시 함수에 넣어 `3`이라는 숫자가 나왔다면, 내부 배열의 3번 인덱스에 `“apple”`과 관련된 값을 저장하게 됩니다.


# 해시(Hash)값이 충돌하는 경우


![이미지 출처: https://en.wikipedia.org/wiki/Hash_collision](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-%ED%95%B4%EC%8B%9C-%ED%85%8C%EC%9D%B4%EB%B8%94Hash-Table%EC%9D%B4%EB%9E%80-Feat-JavaScript/img-02.png)


모듈러 연산 방식은 간단하고 빠르지만, **서로 다른 키가 같은 인덱스를 반환할 수 있는 문제**가 발생합니다.


예를 들어, 키 `“Sandra Dee”` 를 해시 함수에 넣어 `152`라는 숫자가 나왔다고 가정해보겠습니다.


이 숫자는 해시 테이블의 152번 인덱스, 즉 해당 버킷(bucket)의 위치를 의미합니다.


그런데 문제는 이미 `“John Smith”`라는 키도 해시 함수에 의해 152번 인덱스에 저장되어 있었다면 어떻게 될까요?


이러한 상황을 **해시 충돌(Hash Collision)** 이라고 합니다. 서로 다른 키가 같은 해시 값을 가지는 경우 발생하는 문제로, 해시 테이블에서는 필연적으로 충돌이 발생할 수밖에 없습니다.


이를 적절하게 처리하지 않으면 기존 데이터가 **덮어쓰기(overwrite)** 되거나, **검색이 실패**하게 됩니다.


충돌을 해결하기 위한 대표적인 방식은 다음과 같습니다.


## 1. 체이닝(Chaining)


![이미지 출처: https://velog.io/@soom/Hash-Table-Hash-Collision-Resolution](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-%ED%95%B4%EC%8B%9C-%ED%85%8C%EC%9D%B4%EB%B8%94Hash-Table%EC%9D%B4%EB%9E%80-Feat-JavaScript/img-03.png)


가장 일반적인 방법은 **체이닝**입니다.


충돌이 발생한 버킷에 데이터를 **링크드 리스트**처럼 연결해서 여러 개의 값을 저장할 수 있도록 하는 방식입니다.


같은 인덱스를 공유하더라도 각 데이터를 **순차적으로 연결**하여 저장할 수 있습니다. 데이터를 검색할 때는 해당 버킷의 링크드 리스트를 순회하면서 원하는 키를 찾습니다.


## 2. 개방 주소법(Open Addressing)


![이미지 출처: https://velog.io/@soom/Hash-Table-Hash-Collision-Resolution](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-%ED%95%B4%EC%8B%9C-%ED%85%8C%EC%9D%B4%EB%B8%94Hash-Table%EC%9D%B4%EB%9E%80-Feat-JavaScript/img-04.png)


또 다른 방식은 **개방 주소법**입니다.


이 방법은 충돌이 발생했을 때, **다음 빈 공간을 찾아 저장**하는 방식입니다.


예를 들어 `"Sandra Dee"`가 저장될 152번 버킷이 이미 사용 중이라면 153번 버킷을 확인하고 비어있으면 거기에 저장하고 아니면 계속 다음으로 이동하는 식으로 버킷을 하나씩 옮겨가며 빈 자리를 찾는 방식입니다.


이때 빈 자리를 탐색하는 방법에 따라 여러 방식으로 나뉩니다.


### **1) 선형 탐사(Linear probing)**


충돌이 발생하면 **다음 인덱스를 하나씩 순차적으로 확인**합니다.


가장 간단한 방식이지만, 탐사 이동폭이 고정돼 있는 선형 탐사는 특정 해시값 주변 버킷이 모두 채워져 있는 클러스터링(Clustered) 현상이 발생해 성능이 저하될 가능성이 존재합니다.


![이미지 출처: https://velog.io/@soom/Hash-Table-Hash-Collision-Resolution](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-%ED%95%B4%EC%8B%9C-%ED%85%8C%EC%9D%B4%EB%B8%94Hash-Table%EC%9D%B4%EB%9E%80-Feat-JavaScript/img-05.png)


### **2) 제곱 탐사(Quadratic probing)**


충돌이 발생하면 **제곱 간격**으로 인덱스를 확인합니다.


선형 탐사보다 클러스터링을 줄일 수 있다는 장점이 있지만, 테이블이 꽉 차면 무한 루프에 빠질 수 있어 **적절한 테이블 크기**가 중요합니다.


![이미지 출처: https://velog.io/@soom/Hash-Table-Hash-Collision-Resolution](/posts/attachments/%EC%9E%90%EB%A3%8C%EA%B5%AC%EC%A1%B0-%ED%95%B4%EC%8B%9C-%ED%85%8C%EC%9D%B4%EB%B8%94Hash-Table%EC%9D%B4%EB%9E%80-Feat-JavaScript/img-06.png)


### **3) 이중 해싱(double hashing)**


충돌이 발생했을 때 **두 번째 해시 함수의 값을 이용해 탐색 간격**을 결정합니다. 이중 해싱의 핵심은 탐사할 해시값의 규칙성을 없애버려서 클러스터링을 최소화하는 기법입니다.


다만, 구현이 상대적으로 복잡하고 보조 해시 값이 0이 되지 않도록 주의해야 합니다.


```typescript
// 충돌이 발생하면 두 번째 해시 함수의 값을 이용해 탐색 간격을 설정하는 방식
// 첫 해시 값이 152이고, 보조 해시 값이 7이라면
// 

index = (hash1(key) + i * hash2(key)) % M
```


예를 들어, 첫 해시 값이 152이고, 보조 해시 값이 7이라면 152 -> 159 (152+1x7) -> 166(152+2x7) 순으로 버킷을 탐색합니다.


## 문제점


Open addressing 방식에서는 충돌이 발생했을 때 동일한 해시 테이블 내에서 다른 위치를 찾아 데이터를 저장하는데, 이 과정에서 삭제 시 단순히 해당 자리를 비워버리면, 이후 탐색 시 데이터를 찾지 못하게 되는 문제가 생깁니다.


예를 들어, 어떤 키를 검색하려고 선형 탐사를 하는 도중 중간에 빈 공간을 만나면, 탐색을 멈추고 **"데이터가 없다"고 잘못 판단**하게 되는 것입니다.


이를 해결하기 위해서는 삭제된 자리에 **삭제 마커(예: "deleted" 표시)** 를 남겨서 이후 탐색이 계속될 수 있도록 처리합니다. 하지만 이 방식도 성능 저하를 일으킬 수 있기 때문에, 일정 수준 이상 삭제가 누적되면 **재해싱(rehashing)** 을 고려해야 합니다.


# 해시테이블(Hash Table) 시간 복잡도


해시 테이블은 키(key)와 값(value)을 저장할 때, **해시 함수**를 이용해 데이터를 저장할 위치를 계산함으로써 **평균적으로 O(1)**의 빠른 조회 속도를 자랑하는 자료구조입니다. 하지만 현실에서는 해시 함수가 충돌을 피할 수 없습니다. 서로 다른 키가 같은 인덱스를 반환하는 경우, 이를 처리하기 위해 보통 **체이닝(Chaining)** 같은 충돌 해결 전략을 사용합니다.


체이닝의 경우, 충돌이 발생하면 해당 버킷에 연결 리스트 형태로 데이터를 추가하게 되는데, 이 경우 최악의 경우에는 모든 데이터가 **한 버킷에 연결되는 상황**도 발생할 수 있습니다. 이런 경우 탐색 시 리스트를 끝까지 순회해야 하므로 시간 복잡도는 **O(N)**에 가까워질 수 있습니다.


그래서 충돌을 줄이기 위해 보통 다음과 같은 방식이 사용됩니다.

- 더 정교한 해시 함수 사용
- 버킷 수(테이블 크기)를 충분히 크게 설정
- 개방 주소법에서 충돌 분산 기법 적용 (예: 이중 해싱)

하지만 이러한 방법들은 **더 많은 메모리**를 요구하며, 공간 낭비를 유발할 수 있다는 단점도 함께 존재합니다.


만약 테이블이 **가득 차게 되면**, 해시 테이블은 보통 자동으로 **크기를 두 배로 늘려 리사이징(resize)**합니다. 이 과정에서 **모든 데이터를 다시 해싱**해야 하기 때문에, 심각한 성능 저하가 발생할 수 있습니다. 일반적으로 해시 테이블은 공간 사용률(load factor)이 70% ~ 80%에 도달하면 충돌이 급격히 증가하기 시작합니다. 이를 방지하려면 처음부터 데이터 규모를 고려하여 적절한 크기로 테이블을 설계하거나, 리사이징 비용을 감안한 구현이 필요합니다.


# JavaScript의 Object와 Map


JavaScript에서는 별도의 해시 테이블 클래스를 직접 구현하지 않더라도, 내장 객체(`Object`)와 `Map`을 활용해 해시 테이블과 유사한 기능을 쉽게 사용할 수 있습니다.


## Object


JavaScript의 객체(`{}`)는 본질적으로 **문자열 기반 해시 테이블**처럼 동작합니다.


모든 키는 내부적으로 문자열 또는 심볼(Symbol)로 변환되며, 이에 대한 값을 저장하고 빠르게 조회할 수 있습니다.


```typescript
const user = {
  name: "Dongho",
  age: 24
};

console.log(user["name"]);  // "Dongho"
```


객체는 내부적으로 **해시 함수를 통해 키를 인덱싱**하고 해당 값을 저장하는 구조로 동작하기 때문에, 일반적으로 **O(1)**의 시간복잡도로 데이터를 조회할 수 있습니다.


단, 키는 **문자열 또는 Symbol만 허용**되고 `Map`에 비해 기능이 제한적입니다.


## Map


ES6부터 등장한 `Map`은 객체보다 더 강력한 해시 테이블 역할을 합니다.


```typescript
const userMap = new Map();

userMap.set("name", "Dongho");
userMap.set(123, "ID number");
userMap.set(true, "active");

console.log(userMap.get("name"));  // "Dongho"
console.log(userMap.get(123));     // "ID number"
```


`Map`은 모든 자료형을 키로 사용할 수 있고, `.set()`, `.get()`, `.has()`, `.delete()`와 같은 메서드 기반 API를 제공합니다.


# 참고 자료


[https://www.youtube.com/watch?v=ZBu_slSH5Sk&ab_channel=%EC%89%AC%EC%9A%B4%EC%BD%94%EB%93%9C](https://www.youtube.com/watch?v=ZBu_slSH5Sk&ab_channel=%EC%89%AC%EC%9A%B4%EC%BD%94%EB%93%9C)


[https://mangkyu.tistory.com/102](https://mangkyu.tistory.com/102)


[https://ratsgo.github.io/data%20structure&algorithm/2017/10/25/hash/](https://ratsgo.github.io/data%20structure&algorithm/2017/10/25/hash/)
