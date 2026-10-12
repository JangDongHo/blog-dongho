---
title: "git 여러 커밋(commit) 하나로 합치기"
description: "최근 프로젝트에서 리팩토링을 진행하는 과정에서 여러 번의 커밋이 쌓여 복잡한 히스토리가 되어버렸다."
date: 2025-04-03
---

![image.png](/posts/attachments/git-%EC%97%AC%EB%9F%AC-%EC%BB%A4%EB%B0%8Bcommit-%ED%95%98%EB%82%98%EB%A1%9C-%ED%95%A9%EC%B9%98%EA%B8%B0/img-01.png)


최근 프로젝트에서 리팩토링을 진행하는 과정에서 여러 번의 커밋이 쌓여 복잡한 히스토리가 되어버렸다.


이럴 때 유용한 것이 바로 Git Rebase이다. 이번 글에서는 리베이스를 통해 커밋을 깔끔하게 정리하는 방법을 다뤄본다.


# 1. rebase 사용하기


5개의 커밋 메시지를 합쳐줄거라 `git rebase -i HEAD~5`를 실행한다.


만약 2개의 커밋 메시지만 바꾸고 싶다면 `HEAD~2`를 적으면 된다.


```typescript
git rebase -i HEAD~5
```


# 2. 합치거나 편집할 commit 선택


아래와 같이 vi 창이 뜨면 가장 오래된 커밋(`pick 2bb3042`)은 그대로 두고, 아래 커밋들을 squash(`s`)로 변경하여 합친다.


![git rebase -i HEAD~5 을 수행한 모습](/posts/attachments/git-%EC%97%AC%EB%9F%AC-%EC%BB%A4%EB%B0%8Bcommit-%ED%95%98%EB%82%98%EB%A1%9C-%ED%95%A9%EC%B9%98%EA%B8%B0/img-02.png)


위 처럼 화면이 뜨면 아래처럼 적어주고 `:wq` 를 눌러 다음 단계로 넘어간다.


![git rebase -i HEAD~5 에서 pick ⇒ s 로 변경한 모습](/posts/attachments/git-%EC%97%AC%EB%9F%AC-%EC%BB%A4%EB%B0%8Bcommit-%ED%95%98%EB%82%98%EB%A1%9C-%ED%95%A9%EC%B9%98%EA%B8%B0/img-03.png)


# 3. 커밋 메시지 수정하기


그러면 아래처럼 합쳐진 커밋의 최종 메시지를 작성할 단계가 나온다.


![합쳐진 커밋의 최종 메시지 작성 단계](/posts/attachments/git-%EC%97%AC%EB%9F%AC-%EC%BB%A4%EB%B0%8Bcommit-%ED%95%98%EB%82%98%EB%A1%9C-%ED%95%A9%EC%B9%98%EA%B8%B0/img-04.png)


나 같은 경우 가장 최신 커밋 메시지(5번)를 사용할 거기 때문에 다른건 다 지우고 필요한 부분만 남긴다.


![합쳐진 커밋의 최종 메시지 작성 단계](/posts/attachments/git-%EC%97%AC%EB%9F%AC-%EC%BB%A4%EB%B0%8Bcommit-%ED%95%98%EB%82%98%EB%A1%9C-%ED%95%A9%EC%B9%98%EA%B8%B0/img-05.png)


# 4. 리베이스 후 강제 푸시


리베이스가 완료되면 강제로 푸시한다.


이때 주의할 점은 강제 푸시는 원격 브랜치의 히스토리를 덮어쓴다.


특히 공동 작업 브랜치라면 다른 사람이 작업 중인 커밋이 사라져 문제가 발생할 수 있다.


따라서 다른 팀원과 협업 중이라면 반드시 사전에 공유하고 동의를 받는 것이 좋다.


```typescript
git push -f origin 브랜치명
```


![합쳐진 커밋 메시지](/posts/attachments/git-%EC%97%AC%EB%9F%AC-%EC%BB%A4%EB%B0%8Bcommit-%ED%95%98%EB%82%98%EB%A1%9C-%ED%95%A9%EC%B9%98%EA%B8%B0/img-06.png)


# 참고 자료


[https://korband.tistory.com/33](https://korband.tistory.com/33)
