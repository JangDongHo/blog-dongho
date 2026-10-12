---
title: "헷갈리는 Function, Class, Instance, Object Literal 정의 톺아보기"
description: "프로그래밍을 하다 보면 종종 헷갈리기 쉬운 용어들이 있다. 특히 JavaScript와 Python 같은 객체 지향 언어에서 자주 등장하는 Function, Class, Instance, Object Literal은 그 중에서도 혼란을 주기 쉽다. 이번 포스팅에서는 이 네 가지 개념을 정"
date: 2024-11-22
---

프로그래밍을 하다 보면 종종 헷갈리기 쉬운 용어들이 있다. 특히 JavaScript와 Python 같은 객체 지향 언어에서 자주 등장하는 `Function`, `Class`, `Instance`, `Object Literal`은 그 중에서도 혼란을 주기 쉽다. 이번 포스팅에서는 이 네 가지 개념을 정리해보자.


뉴진스, BTS, 에스파, 싸이의 공통점은 무엇일까? 모두 ‘가수’이다.


가수라는 큰 틀 안에서 그룹이나 개인의 속성에 따라 뉴진스가 되기도 하고, 싸이가 되기도 한다.


## 1. Class - `가수`


---


`Class`는 가수처럼 큰 틀이나 카테고리를 정의하는 역할을 한다.


‘가수’라는 클래스는 공통적인 속성(이름, 장르, 소속사 등)과 행동(공연하기, 앨범 내기)을 정의한다.


### Class는 왜 필요할까?


Class는 하나의 큰 틀이자 설계도이다. 프로그래머는 자신의 생각이나 세상에 존재하는 개념을 Class로 구현한다. Class가 이미 정의되어 있다면, 프로그래머들은 자신에게 필요한 Class를 쉽게 **재사용**할 수 있다는 장점이 있다.


예시를 들어보자. 아래의 가수(Singer)의 클래스는 모든 가수가 공통으로 가질 수 있는 속성(이름, 장르, 타입)을 정의한 틀이다.


```python
class Singer:
    def __init__(self, name, genre, type):
        self.name = name
        self.genre = genre
        self.type = type  # 그룹 또는 솔로
```


## 2. Instance (인스턴스) - `뉴진스`, `BTS`, `에스파`, `싸이`


---


`Instance`는 Class에서 정의된 틀을 바탕으로 만들어진 특정한 객체를 의미한다.


뉴진스, BTS, 에스파, 싸이는 모두 Singer(가수) `Class`에서 파생된 `Instance`이다.


이들은 가수라는 공통적인 특성을 가지고 있지만, 각각의 속성(이름, 장르, 타입)은 서로 다르다.


```python
newjeans = Singer(name="New Jeans", genre="K-pop", type="Group") # 그룹으로 활동
psy = Singer(name="Psy", genre="K-pop", type="Solo") # 솔로로 활동
```


## 3. Function (함수) - `공연하기`, `앨범 내기`


---


`Function`은 특정 작업을 수행하는 코드 블록으로, 모든 가수에게 공통적으로 적용할 수 있는 기능을 정의하는 데 사용한다.


예를 들어, 가수는 모두 “공연하기”, “앨범 내기”등의 행동을 할 수 있으므로, 이를 함수로 정의하여 재사용할 수 있다.


```python
class Singer:
    def __init__(self, name, genre, type):
        self.name = name
        self.genre = genre
        self.type = type
    
    def perform(self): # 공연하기
        print(f"{self.name} is performing!")

    def release_album(self): # 앨범 내기
        print(f"{self.name} has released a new album!")
```


이렇게 `perform()` 함수와 `release_album()` 함수는 가수의 공통적인 행동을 정의한 것으로, 각 `Instance`에서 호출할 수 있다.


### Function vs Class


두 개념 모두 코드의 재사용성을 높여준다는 공통점이 있다.
차이점은 상태를 관리하는 측면에서 두드러진다.



**Class로 객체를 선언하면, 각 객체는 독립적**이다. 하나의 객체의 상태를 변경해도 다른 객체에는 영향을 미치지 않기 때문에 Class는 상태를 관리하기 용이하다.

반면 함수는 여러 상태를 동시에 관리할 수 있다. 정확히 말하면 관리하려는 상태의 개수만큼 변수와 함수를 새롭게 재정의해야 한다.


예시를 들어보자. 가수(Singer)의 앨범을 관리

- **`Function`****으로 앨범 관리하기**

    함수를 사용하면 하나의 상태(앨범)를 처리할 수 있지만, 여러 앨범을 관리하려면 각 앨범에 대한 상태를 별도로 관리해야 한다. 예를 들어, 뉴진스 그룹의 앨범을 관리하는 함수를 작성한다고 가정해보자. 매 앨범마다 새로운 변수를 만들어야 할 것이다.


    ```javascript
    new_jeans_albums = []
    
    def add_album(artist, album):
        new_jeans_albums.append({'artist': artist, 'album': album})
    
    def display_albums():
        for album in new_jeans_albums:
            print(f"{album['artist']} - {album['album']}")
    
    add_album("New Jeans", "Hot Sweet");
    add_album("New Jeans", "Super Shy");
    display_albums();
    
    // 출력:
    // New Jeans - Hot Sweet
    // New Jeans - Super Shy
    ```


    `new_jeans_albums`라는 리스트를 사용해 앨범 정보를 저장하고, `add_album` 함수를 통해 앨범을 추가하며, `display_albums` 함수로 모든 앨범을 출력한다. 하지만 이 방식은 상태를 외부에서 관리해야 하므로, 여러 아티스트의 앨범을 관리할 때 복잡해질 수 있다.


    만약 Class를 이용해 상태를 관리한다면 어떨까?

- **`Class`****로 앨범 관리하기**

    Class를 사용하면, 각 아티스트마다 객체를 생성하여 독립적으로 상태를 관리할 수 있다. 각 객체는 앨범 목록을 관리하며, 필요한 메서드를 통해 상태를 조작할 수 있다.


    ```python
    class Singer:
        def __init__(self, name):
            self.name = name
            self.albums = []
    
        def add_album(self, album):
            self.albums.append(album)
    
        def display_albums(self):
            for album in self.albums:
                print(f"{self.name} - {album}")
    
    # 'New Jeans' 아티스트 객체 생성
    new_jeans = Singer("New Jeans")
    new_jeans.add_album("Hot Sweet")
    new_jeans.add_album("Super Shy")
    new_jeans.display_albums()
    
    # 출력:
    # New Jeans - Hot Sweet
    # New Jeans - Super Shy
    ```


정리하자면, **함수**는 간단한 작업을 반복해서 처리할 때 유용하고, **클래스**는 복잡한 객체를 다루고 상태를 효율적으로 관리할 때 적합하다.


## 4. Object Literal (객체 리터럴) - 간단히 정의된 `가수 객체`


---


`Object Literal`은 클래스 없이도 빠르게 특정 `Instance`를 정의할 때 사용된다.  객체 리터럴은 주로 JavaScript에서 많이 사용된다.


예를 들어, 가수 '싸이'를 정의할 때 클래스 없이 중괄호를 사용해 바로 객체로 만들 수 있다.


이렇게 하면 간단한 정보를 빠르게 정의하고 사용할 수 있다.



```javascript
const psy = {
    name: "Psy",
    genre: "K-pop",
    type: "Solo",
    perform: function() {
        console.log(`${this.name} is performing!`);
    }
};

psy.perform(); // 출력: Psy is performing!
```


## 참고 자료


[https://kevinitcoding.tistory.com/entry/%ED%8C%8C%EC%9D%B4%EC%8D%ACPython-Class%EC%9D%98-%EC%A0%95%EC%9D%98%EC%99%80-%EC%82%AC%EC%9A%A9%EB%B2%95feat-%ED%95%A8%EC%88%98%EC%99%80%EC%9D%98-%EC%B0%A8%EC%9D%B4](https://kevinitcoding.tistory.com/entry/%ED%8C%8C%EC%9D%B4%EC%8D%ACPython-Class%EC%9D%98-%EC%A0%95%EC%9D%98%EC%99%80-%EC%82%AC%EC%9A%A9%EB%B2%95feat-%ED%95%A8%EC%88%98%EC%99%80%EC%9D%98-%EC%B0%A8%EC%9D%B4)
