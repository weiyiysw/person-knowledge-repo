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

### 声明式事务失效场景2：异步调用失效

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

### 事务的传播机制

敬请期待~~

[代理模式]: ../gof/structure/proxy.md