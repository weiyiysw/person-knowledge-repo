---
title: redis
createTime: 2024/08/25 10:08:29
permalink: /article/qwp94qq2/
---
# Redis

## 一、基础结构

Redis的基础结构有string、hash、list、set、zset。

### 1.1 string

string是Redis里最基本的数据结构，存储字符串。

使用set命令设置值，get命令获取值。

~~~shell
# 使用redis-cli访问Redis后，可以使用命令
127.0.0.1:6379> set foo bar
OK
127.0.0.1:6379> get foo
"bar"
~~~

### 1.2 hash

hash结构，也就是类比到Map结构，存储的就是Map

~~~shell
127.0.0.1:6379> hset foo k1 100 k2 120
OK
127.0.0.1:6379> hget foo k1
"100"
127.0.0.1:6379> HGETALL hfoo
1) "k1"
2) "100"
3) "k2"
4) "120"
~~~

### 1.3 list

list集合，可以有重复的元素。

### 1.4 set

set集合，无重复元素。

### 1.5 sorted set

排序集合，俗称zset