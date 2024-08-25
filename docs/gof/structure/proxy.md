---
title: proxy
createTime: 2024/08/25 12:19:45
permalink: /article/corlp7cw/
---
# 代理模式

[结构型模式][]


代理模式，是一种结构型模式。代理顾名思义，即存在一个代理对象代替被代理对象处理所有事情。类比到生活中，就像经纪人与明星之间的关系。经纪人就是代理人，明星就是被代理人。明星的参加商演活动，但是在参加商演活动前、后和主办方对接的事宜都是由经过经纪人处理。

代理模式可以分为静态代理和动态代理。在Java语言中，动态代理可以细分为JDK动态代理和CGLIB两种模式。

## 一、静态代理

静态代理，即在代码中通过代理对象来处理被代理对象的所有事情。如下代码示例，静态代理Broker代理了SuperStar，在superstar做某事之前、之后都有额外的处理。

~~~java
public class SuperStar {
	void doSth() {
		System.out.println("明星演出");
	}
}

// 经纪人
public class Broker {
	private SuperStar superStar;
	
	void beforeDoSth() {
		System.out.println("演出前");
	}

	void afterDoSth() {
		System.out.println("演出后");
	}

	void doSth() {
		beforeDoSth();
		superStar.doSth();
		afterDoSth();
	}
}
~~~


## 二、JDK动态代理

从前面的静态代理示例，我们可以知道在使用静态代理的时候需要创建代理类，在代理类中持有被代理对象。通过调用代理类，达到在被代理对象执行某个方法前、后加入相关逻辑操作。但是这也存在局限，

* 局限1：如果SuperStar存在doSth2()方法，也必须在Broker里实现对应的doSth2()才能代理；
* 局限2：如果存在非SuperStar，比如公司法人或普通人，也需要相同的代理处理逻辑呢？这就不得不为公司法人或普通人建对应的代理类。（当然可以使用抽象类，在这个场景下也算一种解决方法）

针对静态代理的存在的局限问题，JDK引入了动态代理的解决方案。动态代理，可以为同一类的行为进行代理，而不必创建对应的代理类。即支持动态生成代理类。


如下：我们有一个Person的接口，里面有2个方法eat()、drink()，同时有2个实现类分别是Man和Women。如果这是我们用静态代理的话，有两个方案：
1. 在静态代理里实现多个代理方法，当方法更多时，这个代理类将会变得庞大而无法维护；
2. 实现多个代理类，代理类会变得很多，难以维护

~~~java
public interface Person {
	void eat();
	void drink();
}

public class Man implements Person {
    @Override
    public void eat() {
        System.out.println("男人吃饭");
    }

    @Override
    public void drink() {
        System.out.println("男人喝水");
    }
}

public class Women implements Person {
    @Override
    public void eat() {
        System.out.println("女人吃饭");
    }

    @Override
    public void drink() {
        System.out.println("女人喝水");
    }
}
~~~

使用JDK的动态代理实现

~~~java
public class PersonInterceptor implements InvocationHandler {
	// 被代理的对象
	private Object target;

    public PersonInterceptor(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        try {
			// 执行方法前处理
            System.out.println("吃东西前洗手");
            Object invoke = method.invoke(target, args);
			// 执行方法后处理
            System.out.println("吃东西后擦嘴");
            return invoke;
        } catch (Exception e) {
            throw e;
        }
    }
}

// 调用类
public class ProxyDemo {
    public static void main(String[] args) {
		// 给拦截器传入需要被代理的对象
        Person o1 = (Person) Proxy.newProxyInstance(Person.class.getClassLoader(),
                new Class[] { Person.class }, new PersonInterceptor(new Man()));
        o1.eat();
		o1.drink();

        Person o2 = (Person) Proxy.newProxyInstance(Person.class.getClassLoader(),
                new Class[] { Person.class }, new PersonInterceptor(new Women()));
        o2.eat();
		o2.drink();
    }
}
~~~

如上述代码，我们即实现了一个简单的JDK代理。在PersonInterceptor中持有了被代理对象的实例，然后通过反射，执行调用的方法。使用JDK动态代理时，需要实现接口InvocationHandler，在实现里做代理的逻辑处理。通过Proxy的newProxyInstance方法创建代理类实例时，第二个传入的参数必须是接口。也就是说JDK的动态代理使用，实现类必须有接口。

JDK动态代理是基于Java的反射机制实现的。JDK动态代理之所以是因为**代理类本身已经extends了Proxy，而java是不允许多重继承的**，但是允许实现多个接口

## 三、CGLIB动态代理

由于JDK动态代理的缺陷，实现类必须有接口才可以实现动态代理，否则没办法使用。因此，业界有了CGLIB代理方案。

如果你使用的是JDK1.8，可以引入以下两个包来使用cglib。如果是JDK17，则会抛错InaccessibleObjectException。见[jdk17使用cglib异常][]，这是由于cglib库现在没有人维护了不支持新版本的JDK。（据说JDK9就不支持了，没验证过）

~~~xml
<dependency>
    <groupId>cglib</groupId>
    <artifactId>cglib</artifactId>
    <version>3.3.0</version>
</dependency>

<dependency>
    <groupId>cglib</groupId>
    <artifactId>cglib-nodep</artifactId>
    <version>3.3.0</version>
</dependency>

<!-- jdk17 可以使用spring提供修复的，我这里使用了6.1.0的版本，其他可用的版本未验证 -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <version>6.1.0</version>
    <scope>compile</scope>
</dependency>
~~~

~~~java
public class Cat {
    public Cat() {
    }

    public void eat() {
        System.out.println("Cat eat");
    }

    public void drink() {
        System.out.println("Cat drink");
    }
}

public class EatLogInterceptor implements MethodInterceptor {

    public void before() {
        System.out.println("吃东西前：" + System.currentTimeMillis());
    }

    public void after() throws InterruptedException {
        Thread.sleep(1000);
        System.out.println("吃东西后：" + System.currentTimeMillis());
    }

    @Override
    public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
        before();
        // 注意这里调用的事invokeSuper，指调用原始类方法
        // method.invoke执行的是子类的方法，由于现在没有子类，如果调用的话，则会死循环
        Object o1 = methodProxy.invokeSuper(o, objects);
        after();
        return o1;
    }
}

public class CglibDemo {

    public static void main(String[] args) {
        EatLogInterceptor eatLogInterceptor = new EatLogInterceptor();
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(Cat.class);
        enhancer.setCallback(eatLogInterceptor);

        // 创建代理对象
        Cat proxy = (Cat) enhancer.create();
        proxy.eat();

        System.out.println("=========分割线===========");

		// 设置多个方法的代理，针对不同的方法执行不同的代理，需要设置callbacks、CallbackFilter，通过CallbackFilter控制回调哪个方法
        Enhancer enhancer1 = new Enhancer();
        enhancer1.setSuperclass(Cat.class);
        enhancer1.setCallbacks(new Callback[]{new EatLogInterceptor(), new DrinkLogInterceptor()});
        enhancer1.setCallbackFilter(new CatProxyFilter());
        Cat proxy2 = (Cat) enhancer1.create();
        proxy2.eat();
        proxy2.drink();
    }
}

public class DrinkLogInterceptor implements MethodInterceptor {
    public void before() {
        System.out.println("喝水前：" + System.currentTimeMillis());
    }

    public void after() throws InterruptedException {
        Thread.sleep(1000);
        System.out.println("喝水后：" + System.currentTimeMillis());
    }

    @Override
    public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
        before();
        // 注意这里调用的事invokeSuper，指调用原始类方法
        // method.invoke执行的是子类的方法，由于现在没有子类，如果调用的话，则会死循环
        Object o1 = methodProxy.invokeSuper(o, objects);
        after();
        return o1;
    }
}

public class CatProxyFilter implements CallbackFilter {
    @Override
    public int accept(Method method) {
        // 针对不同的方法设置拦截器
        if ("eat".equals(method.getName())) {
            // 返回Callback列表的第一个拦截器
            return 0;
        }
        // 返回Callback列表的第二个拦截器
        return 1;
    }
}
~~~

cglib动态代理：基于ASM机制实现，通过生成业务类的子类作为代理类。因此，如果类被final修饰了，是无法进行代理的。

JDK动态代理的优势：
* 最小化依赖关系，减少依赖意味着简化开发和维护，JDK 本身的支持，可能比 cglib 更加可靠。
* 平滑进行 JDK 版本升级，而字节码类库通常需要进行更新以保证在新版 Java 上能够使用。
* 代码实现简单。

cglib 代理的优势：

* 无需实现接口，达到代理类无侵入
* 只操作我们关心的类，而不必为其他相关类增加工作量。
* 高性能


[结构型模式]: ./readme.md
[jdk17使用cglib异常]: https://stackoverflow.com/questions/70952621/inaccessibleobjectexception-when-trying-to-create-cglib-spring-proxy