---
title: Java8CollectorToMap
createTime: 2024/08/24 22:27:44
permalink: /article/rkba0int/
---
### Collectors.toMap请注意

在Java8中使用Java Stream API能够使我们的代码更加简洁、优雅，但是在使用过程中也是存在一些坑的。

当我们使用Collectors.toMap的时候，可以很方便的将我们要的数据转换成Map结构。在toMap的函数中，value值不能为null，否则会抛出NPE。

~~~java
public class User {

  private Long id;
  private String name;
  // ... 省略setter and getter
}

public Map<Long, String> cvtMap(List<User> userList) {
  // 如果userList里的name存在null值，那么这里会抛NPE
  // 在源码中，检查了Value不能为null的
  return userList.stream().collect(Collectors.toMap(User::getId, User::getName));
}
~~~