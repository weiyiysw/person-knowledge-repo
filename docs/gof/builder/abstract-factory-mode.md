---
title: 抽象工厂模式
createTime: 2024/08/25 10:21:53
permalink: /article/gbs23cc2/
---
# 抽象工厂模式

[创建者模式][]

抽象工厂模式，在工厂模式之上发展起来的。工厂模式只能针对一种产品处理，现实生活中往往会有多种类型的产品，这些多种类型的产品通常会有分组的概念。比如手机、平板、电脑，这是三种类型不同的产品。同时生产这三种类型产品的厂商也有很多，如：苹果、小米、华为等。如果此时应用工厂模式，在不同的产品类型之间可能会产生随机组合。但是现实却是不同公司不可能生产其他公司的某一个产品，因此这些不同种类的产品之间是有关系的。使用抽象工厂模式，就可以解决这个问题，使得产生了某个品牌的手机、则必然可以产生同品牌的平板或电脑。

抽象工厂模式，是针对一个产品簇的工厂方法。其UML图如下：

@startuml
interface PersonComputer
interface CellPhone
interface ProductFactory {
  CellPhone createPhone()
  PersonComputer createPersonComputer()
}

class MiPhone implements CellPhone
class Iphone implements CellPhone
class Mac implements PersonComputer
class MiPc implements PersonComputer

class MiFactory implements ProductFactory
class AppleFactory implements ProductFactory

MiFactory ..> MiPhone
MiFactory ..> MiPc

AppleFactory ..> Iphone
AppleFactory ..> Mac
@enduml


[创建者模式]: ./readme.md
