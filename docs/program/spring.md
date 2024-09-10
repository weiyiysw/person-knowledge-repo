# Spring随笔

## Spring事务

在Spring里面，通常有两种方式添加事务，分别是编程式事务和声明式事务。

* 编程式事务：在代码上下文通过自行增加代码开启事务、控制事务提交或回滚。
* 声明式事务：在`public`方法上使用`Transactional`注解，将事物交由Spring管理。

大部分场景下，我们都是使用声明式事务。声明式事务为我们提供了方便、优雅的方式使用事务，减少写冗余的事务性代码。但是其也有一些失效的场景需要注意。

声明式事务的原理是基于代理的，我们知道在Spring中代理是使用`cglib`代理模式，这里不展开了。

> 想了解代理模式，详见[代理模式][]

### 声明式事务失效的场景1：this调用失效

在同一个类里通过`this`调用（注意this是可以省略的），声明式事务失效。这个失效类型非常常见，也是大家很容易忽视的一个点。

不生效的原因：this调用是直接使用了真实对象来执行方法，并不是使用代理对象，而声明式事务必须是代理对象调用才生效。

解决方法也很简单：只需要使用代理对象执行事务方法即可。比如：可以通过`AopProxy.currentProxy()`获取到当前代理对象，使用代理对象调用即可。

~~~java
public interface IDemoService {
  int method1();

  int method2();

  int method3();
}

@Service
public class DemoServiceImpl implements IDemoService {

  @Override
  public int method1() {
    ...do sth
    // 这里调用时，方法2的事物是不生效的
    this.method2();
    ...do other sth
  }

  @Override
  @Transactional
  public int method2() {
    ...do sth
  }

  @Override
  public int method3() {
    ...do sth
    // 通过AopProxy.currentProxy方法获取到代理对象，调用
    IDemoService service = (IDemoService) AopProxy.currentProxy()
    service.method2()
    ...do other sth
  }
}
~~~

### 声明式事务失效的场景2：异步调用失效

前面提到在同一个类中调用事物方法时可以使用`AopProxy.currentProxy()`获取到代理对象，然后再调用事务方法，即可使声明式事务生效。但是这个也并不适用于所有场景。见以下代码示例，异步的场景下就会失效。

~~~java
public interface IDemoService {
  ...

  // 增加method4
  int method4();
}

@Service
public class DemoServiceImpl implements IDemoService {
  ...

  @Override
  public int method4() {
    ...do sth
    // 方法4中，开启异步，在线程池或异步线程中执行事务方法2
    ExecutorService executorService = Executors.newFixedThreadPool(1);
    executorService.execute(() -> {
      // 这里通过AopProxy.currentProxy()去获取代理对象是拿不到的，这里会抛NPE
      IDemoService service = (IDemoService) AopProxy.currentProxy()
      service.method2();
    });
    ...do other sth
  }
}
~~~

那么，这种情况下该怎么解决呢？回到问题的本质上，本质是需要用代理对象调用，声明式事务才会生效。我们需要获取到的代理对象就可以了。既然`AopProxy.currentProxy()`获取不了，我们通过其他方式去获取代理对象是不是也就可以解决了呢？答案是肯定的。

需要获取到代理对象，我们可以在Spring项目里增加一个Spring上下文的工具类，通过工具类获取对应的Bean即可。

~~~java
@Service
public class DemoServiceImpl implements IDemoService {
  ...

  @Override
  public int method4() {
    ...do sth
    // 方法4中，开启异步，在线程池或异步线程中执行事务方法2
    ExecutorService executorService = Executors.newFixedThreadPool(1);
    executorService.execute(() -> {
      DemoService service = SpringContextUtil.getBean(IDemoService.class);
      service.method2();
    });
    ...do other sth
  }
}
~~~

Spring上下文工具类，具体可参考以下代码

~~~java
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Spring容器工具类.
 */
@Component
public class SpringContextUtil implements ApplicationContextAware {
    /**
     * 上下文对象
     */
    private static final AppContainer APP_CONTAINER = new AppContainer();

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) {
        APP_CONTAINER.setApplicationContext(applicationContext);
    }

    /**
     * 获取ApplicationContext.
     *
     * @return
     */
    public static ApplicationContext getApplicationContext() {
        return APP_CONTAINER.getApplicationContext();
    }

    /**
     * 通过clazz，从spring容器中获取bean.
     *
     * @param clazz
     * @param <T>
     * @return
     */
    public static <T> T getBean(Class<T> clazz) {
        return getApplicationContext().getBean(clazz);
    }

    /**
     * 获取某一类型的bean集合.
     *
     * @param clazz
     * @param <T>
     * @return
     */
    public static <T> Map<String, T> getBeans(Class<T> clazz) {
        return getApplicationContext().getBeansOfType(clazz);
    }

    /**
     * 通过name和clazz，从spring容器中获取bean.
     *
     * @param clazz
     * @param <T>
     * @return
     */
    public static <T> T getBean(String name, Class<T> clazz) {
        return getApplicationContext().getBean(name, clazz);
    }
    /**
    * 静态内部类，用于存放ApplicationContext.
    */
    public static class AppContainer {
        private ApplicationContext applicationContext;

        public ApplicationContext getApplicationContext() {
          return applicationContext;
        }

        public void setApplicationContext(ApplicationContext applicationContext) {
          this.applicationContext = applicationContext;
        }
    }

    /**
     * 获取配置文件配置项的值.
     *
     * @param key 配置项key
     */
    public static String getEnvironmentProperty(String key) {
        return getApplicationContext().getEnvironment().getProperty(key);
    }

    /**
     * 获取spring.profiles.active .
     */
    public static String[] getActiveProfile() {
        return getApplicationContext().getEnvironment().getActiveProfiles();
    }
}
~~~

### Spring管理下事务的传播行为

提到事务，首先想到的都是其ACID四大特性。

* A：原子性
* C：一致性
* I：隔离性
* D：持久性

> 不熟悉的同学，请自行查找资料学习。

在Spring管理下，事务的传播行为有七种，分别是

|事务的传播行为|说明|EJB|
|---|---|---|
|REQUIRED|使用当前事务，如果当前没有事务，则创建一个事物执行|✅|
|SUPPORTS|使用当前事务，如果当前没有事务，则无事务方式执行。|✅|
|MANDATORY|使用当前事务，如果当前没有事务，则抛异常。|✅|
|REQUIRES_NEW|创建一个新事物，如果当前存在事务则挂起当前事务。|✅|
|NOT_SUPPORTED|无事务方式执行，如果存在事务则会挂起当前事务。|✅|
|NEVER|无事务方式执行，如果存在事务则会抛错。|✅|
|NESTED|如果当前存在事务，则在嵌套事务中执行。如果当前没有事务，则与REQUIRED类似。|❌|

> 在EJB中，只有前6种行为，最后一个NESTED是没有的。具体可见：javax.transaction.Transactional的TxType属性
> 使用JPA + Hibernate的情况下，NESTED是不生效的。因为Hibernate JPA不支持嵌套事务。
> 抛错NestedTransactionNotSupportedException: JpaDialect does not support savepoints - check your JPA provider's capabilities
> 
> 默认的传播行为是REQUIRED

#### 理解传播行为

根据上面的说明，单个事务的情况下，我们都很容易理解。重点是存在多个事务的情况下，理解其传播行为。我们以两个事务为例：

由于任取两种行为，则会有49种。这里不会列举这么多，我们仅分析场景的几种情况：

|事务组合|说明|回滚|
|---|---|---|
|REQUIRED + REQUIRED|一个事务执行|一起回滚|
|REQUIRED + REQUIRES_NEW|第二个新事务|事务独立，互不影响。|
|REQUIRES + NESTED|第二个为嵌套事务|外部事务异常，回滚全部。内部嵌套事务异常，回滚内部。|

#### 实验REQUIRED + REQUIRES_NEW

请看如下代码：

~~~java
@Override
@Transactional(rollbackFor = Exception.class)
public Integer create(DemoReq req) {
  //
  DemoEntity entity = cvt2Entity(req);
  demoRepository.save(entity);

  // 通过获取代理调用，使得create2支持事务
  DemoImpl svc = (DemoImpl) AopContext.currentProxy();
  svc.create2(req);
  return 1;
}

@Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
public void create2(DemoReq req) {
  DemoEntity entity = cvt2Entity(req);
  // todo测试时，可以修改某个属性使保存的不一样
  demoRepository.save(entity);
  // 构造异常
  return 1 / 0;
}
~~~

上述例子中，`create`和`create2`**都会回滚**。`create2`回滚，很容易理解。那为什么`create`也回滚呢？`REQUIRES_NEW`不是新事务吗？

认真思考一下，就能明白。`create2`抛出异常，异常抛给了调用方`create`。`create`里有异常，自然也就回滚了。

想要`create2`抛异常，不影响`create`。只需要在`create`中调用`create2`的地方加上`try-catch`，在`catch`中把异常吃掉即可。

如果反过来，`create`里抛出异常，会怎么样呢？

~~~java
@Override
@Transactional(rollbackFor = Exception.class)
public Integer create(DemoReq req) {
  ...

  // 其他全部，同上；仅在return前构造异常
  int i = 1 / 0;
  return 1;
}

@Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
public void create2(DemoReq req) {
  DemoEntity entity = cvt2Entity(req);
  // todo测试时，可以修改某个属性使保存的不一样
  demoRepository.save(entity);
  return 1;
}
~~~

先说结论，这里`create`回滚，`create2`正常提交。因为这是两个独立的事务，并且其调用关系是`create`调用`create2`。`create2`无异常，正常提交。`create`有异常，则回滚但不会回滚内部新事务执行的create2。


#### 实验REQUIRES + NESTED

仅需将前面的`create2`的传播行为修改为`Propagation.NESTED`即可。

结论：

1. `create2`抛出异常且`create`未捕获情况下，都回滚了
2. `create2`抛出异常且`create`捕获情况下，回滚`create2`
3. `create`抛出异常且`create2`正常执行的情况下，都回滚了

所以，我们在理解传播行为的小结上，其结论需要再次加上限制条件。

|事务组合|说明|不捕获第二个事务方法异常|捕获第二个事务方法异常|事务一抛异常|
|---|---|---|---|---|
|REQUIRED + REQUIRED|一个事务执行|一起回滚|一起回滚|一起回滚|
|REQUIRED + REQUIRES_NEW|第二个新事务|都回滚了|第二个回滚，第一个不回滚|事务一回滚，事务二正常提交|
|REQUIRES + NESTED|第二个为嵌套事务|都回滚了|第二个回滚，第一个不回滚|一起回滚|

这里说明下，为什么REQUIRED + REQUIRED并且捕获第二个的情况下仍会回滚。因为整体是一个事务，在第二个的事务方法里抛出了异常，Spring将这个事务标记为`rollback`，因此最终都会一起回滚。

### 事务同步管理器

`TransactionSynchronizationManager`事务同步管理器是一个很强大的工具，利用好它对于我们在事务处理的流程上有很大的帮助。

~~~java
/**
 * 在当前线程上注册一个新的事务同步器。
 * synchronizations可以实现一个org.springframework.core.Ordered的接口，使注册的同步器按顺序执行。
 */
public static void registerSynchronization(TransactionSynchronization synchronization)
			throws IllegalStateException {

		Assert.notNull(synchronization, "TransactionSynchronization must not be null");
		Set<TransactionSynchronization> synchs = synchronizations.get();
		if (synchs == null) {
			throw new IllegalStateException("Transaction synchronization is not active");
		}
		synchs.add(synchronization);
}

/** 
 * TransactionSynchronization摘录了其中部分常用接口
 */
public interface TransactionSynchronization extends Flushable {

  default void beforeCommit(boolean readOnly) {
	}

	default void beforeCompletion() {
	}

	default void afterCommit() {
	}

	default void afterCompletion(int status) {
	}
}

/**
 * 真正调用的地方
 */
public abstract class AbstractPlatformTransactionManager {

  private void processCommit(DefaultTransactionStatus status) throws TransactionException {
    ...
    prepareForCommit(status);
		triggerBeforeCommit(status);
		triggerBeforeCompletion(status);
    ...
    try {
			triggerAfterCommit(status);
		}
		finally {
			triggerAfterCompletion(status, TransactionSynchronization.STATUS_COMMITTED);
		}
  }
}
~~~

我们可以使用`TransactionSynchronizationManager.registerSynchronization`注册一个同步器，在同步器里实现`beforeCommit`或`afterCommit`方法。通常业务需求上实现`afterCommit`居多。比如：某个异步调用，必须在事务执行完成之后调用。

### 使用AopContext.currentProxy()报错

报错信息：

~~~
java.lang.IllegalStateException: Cannot find current proxy: Set 'exposeProxy' property on Advised to 'true' to make it available, and ensure that AopContext.currentProxy() is invoked in the same thread as the AOP invocation context.
~~~

问题原因：这是因为没有自动加载AOP配置`AopAutoConfiguration`。

解决方法：

1. 增加注解`@EnableAspectJAutoProxy(exposeProxy = true)`
2. 增加配置spring.aop.auto=true

[代理模式]: ../gof/structure/proxy.md