---
title: decorator
createTime: 2024/08/25 12:32:12
permalink: /article/qce4cs47/
---
# 装饰器模式

[结构型模式][]

## 概念

装饰器模式定义是允许给一个现有的对象增加新功能，而不改变其结构。顾名思义，装饰在这里就是指增加新功能。举例来说，当你买了一套毛坯房，一般来讲都不会直接入住。你会先搞硬装软装，比如铺地板或瓷砖、打柜子，买沙发、买电器等等。等到最后装修完成，你才会入住。这时候装修完成后的房子和之前的毛坯房，其实本质都是房子。其类结构，以Mybatis里的cache接口来说明：

@startuml
interface Cache

class PerpetualCache implements Cache

class LruCache implements Cache {
  Cache delegate;

  public LruCache(Cache cache) {
    this.delegate = cache;
  }
}
@enduml

1. 抽象构件：Cache
2. 具体实现类：PerpetualCache
3. 抽象装饰器类：Cache，在Mybatis将Cache设计为接口，使用decorator pattern时，省去了Decorator类
4. 具体的装饰器类：LruCache，持有具体实现类的对象，并增加自己的功能。


## 装饰器模式的应用

1. 在Java中，典型的装饰器模式就是IO流里的类。Java的IO流分为字节流和字符流。
2. Mybatis里的Cache


[结构型模式]: ./readme.md