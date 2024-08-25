---
title: 单例模式
createTime: 2024/08/25 10:21:02
permalink: /article/krz8p4ot/
---
# 单例模式

[创建者模式][]

## 一、什么是单例模式

单例模式是什么？单例模式就是指在一个应用中某个事物有且仅存在一个实例。

## 二、单例模式有什么好处

单例模式是线程安全的。在可以使用单个实例的场景下，使用单实例也比多实例更加节省资源，同时避免系统频繁创建、销毁对象，提升性能。

## 三、如何实现单例模式

实现单例模式的方法有很多种，比如饿汉式、懒汉式、双重检查锁、静态内部类等方法。

### 3.1 饿汉式

~~~java
public class Singleton {
    private static final Singleton INSTANCE = new Singleton();
 
    private Singleton() {}
 
    public static Singleton getInstance() {
        return INSTANCE;   
    }
}
~~~

### 3.2 懒汉式

这个懒汉式写法，在并发的场景存在线程安全问题。

~~~java
public class Singleton {
    private static final Singleton INSTANCE;
 
    private Singleton() {}
 
    public static Singleton getInstance() {
        if (null == INSTANCE) {
            INSTANCE = new Singleton();
        }
        return INSTANCE;
    }
}
~~~

### 3.3 双重检查锁

~~~java
public class Singleton {
    private static final Singleton INSTANCE;
 
    private Singleton() {}
 
    public static Singleton getInstance() {
        if (null == INSTANCE) {
            synchronized(Singleton.class) {
                if (null == INSTANCE) {
                    INSTANCE = new Singleton();
                }
            }
        }
        return INSTANCE;
    }
}
~~~

### 3.4 静态内部类

~~~java
public class Singleton {
    private static final Singleton INSTANCE;
 
    private Singleton() {}
 
    public static Singleton getInstance() {
        return Inner.INSTANCE;
    }
 
    private static class Inner {
        public static final Singleton INSTANCE = new Singleton();
    }
}
~~~

### 3.5 枚举

枚举也是一种单例模式。

[创建者模式]: ./readme.md