---
title: 工厂模式
createTime: 2024/08/25 10:21:30
permalink: /article/lyeq7xvt/
---
# 工厂模式

[创建者模式][]

工厂模式是一种创建型模式，也是很常见的模式之一，我们在很多开源项目里都可以看得到。

在了解工厂模式之前，我们先来了解下简单工厂模式。

## 简单工厂模式

简单工厂模式并不是23种设计模式之一，但是在了解工厂模式前有必要先理解简单工厂模式，这有助于我们理解工厂模式，也了解二者之间的区别。

简单工厂模式，是指我们有一个抽象的产品接口，有一系列产品实现了这个抽象接口。我们使用一个工厂类来管理创建对象，创建哪个产品则交由使用者指定。

简单工厂的UML图如下：

@startuml
interface ProductInterface
class ProductA implements ProductInterface
class ProductB implements ProductInterface
class ProductFactory {
	ProductInterface createProduct()
}

ProductFactory -up..> ProductA
ProductFactory -up..> ProductB
@enduml

~~~java
public class ProductFactory {
    public static ProductInterface createProduct(String name) {
        if ("ProductA".equals(name)) {
            return new ProductA();
        } else if ("ProductB".equals(name)) {
            return new ProductB();
        } else {
            throw new RuntimeException("Not support Product")
        }
    }
}
 
public class Demo {
    public void main(String[] args) {
        ProductInterface product = ProductFactory.createProduct("ProductA");
        // use product do sth
    }
}
~~~

可以看出，通过传参，工厂类知道如何创建对应的产品。在Demo了的调用中，传入产品名称，即可获取到产品对象，然后就可以使用产品对象做一些操作了。

如果需要增加一种产品C，我们需要让产品C实现ProductInterface接口。然后，再修改简单工厂里createProduct方法，增加一个if分支。而这违反了开闭原则，对修改关闭、对扩展开放。

注意：由于使用接口，操作需要再接口中定义。

## 工厂模式

了解了简单工厂模式后，使用工厂创建对象我们需要传入指定类型。工厂模式则是针对每一个不同类型的对象提供一个工厂类来创建。

也就是说定义了一个抽象工厂类，定义一个抽象创建方法，由子类工厂来创建对应的产品。这样就避免了简单工厂的弊端，需要指定类型来创建对象。

使用工厂模式，我们通过引入抽象工厂类，在新增产品C的时候，需要同时增加产品C的工厂类实现。达到了对修改关闭，对扩展开放，符合开闭原则。

工厂模式，定义了一个创建对象的接口，让子类来决定将哪个类实例化。工厂模式将一个类的实例化延迟到了其子类。

其UML图如下：

@startuml
interface ProductInterface
class ProductA implements ProductInterface
class ProductB implements ProductInterface

interface ProductFactory
class ProductAFactory implements ProductFactory
class ProductBFactory implements ProductFactory

ProductAFactory -left..> ProductA
ProductBFactory -left..> ProductB
@enduml


在调用的时候

~~~java
public class Demo {
    public void main(String[] args) {
        ProductFactory factory = new ProductAFactory();
        ProductInterface product = factory.createProduct();
    }
}
~~~

工厂模式，在很多开源的项目中都有实现。由于其满足开闭原则，是开源产产品的使用者很方便的扩展自己的工厂类和产品对象，并替换掉开源项目里的默认实现。

[创建者模式]: ./readme.md


