---
title: adapter
createTime: 2024/08/25 12:29:10
permalink: /article/ruzwtyok/
---
# 适配器模式

[结构型模式][]

从生活中我们能够看到很多需要适配器的场景，比如国内的生活电压是220V，当你出国的时候，你会发现国外使用的电压并不一定是220V，每个国家都有自己的标准。这个时候，如果你拿着国内的充电器想给电子设备充电就需要一个转换器。这个转换器能够把当地的电压转换成符合国标的电压从而给电子设备充电。

@startuml
card EuropeVoltage
card Adapt
card ChineseVoltage

EuropeVoltage <- Adapt
Adapt <- ChineseVoltage
@enduml

适配器模式也是基于这个思路，其定义为将一个接口转换为另一个接口，从而使接口不兼容的类能够一起使用。适配器模式类图：

> 注意：适配器模式既是类模式也是对象模式。

@startuml
interface NewRequest {
  void request()
}

interface OldRequest {
  void specialRequest()
}

interface Adaptor implements NewRequest, OldRequest {
  void request()
  void specialRequest()
}

class AdaptorImpl implements Adaptor {
  void request()

  void specialRequest()
}
@enduml

在实现类中，request方法里调用specialRequest()方法

[结构型模式]: ./readme.md