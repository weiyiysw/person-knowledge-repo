# Mybatis

## 1 基础

Mybatis是一个ORM框架，我们在使用它来操作数据库执行SQL。如何使用Mybatis呢？我们阅读在<a href="https://mybatis.org/mybatis-3/zh_CN/getting-started.html">mybatis官网入门</a>文档可以知道，mybatis操作数据库可以分为三步：

* 第一步，先创建SqlSessionFactory。
* 第二步，从SqlSessionFactory中获得SqlSession对象。
* 第三步，SqlSession对象执行SQL操作。

SqlSessionFactory与SqlSession的类图结构如下：

## 2 SqlSessionFactory源码

### 2.1 源码包结构

如下，是session包的类结构。可以发现在session包里，使用了工厂方法进行设计。其中，SqlSession、SqlSessionFactory、ResultContext、ResultHandler均是接口。

~~~shell
.
├── AutoMappingBehavior.java
├── AutoMappingUnknownColumnBehavior.java
├── Configuration.java
├── ExecutorType.java
├── LocalCacheScope.java
├── ResultContext.java
├── ResultHandler.java
├── RowBounds.java
├── SqlSession.java
├── SqlSessionException.java
├── SqlSessionFactory.java
├── SqlSessionFactoryBuilder.java
├── SqlSessionManager.java
├── TransactionIsolationLevel.java
├── defaults
│   ├── DefaultSqlSession.java
│   ├── DefaultSqlSessionFactory.java
│   └── package-info.java
└── package-info.java
~~~


### 2.2 SqlSessionFactory源码


SqlSessionFactory的接口中，功能有2个：获取SqlSession、获取配置。

~~~java
public interface SqlSessionFactory {

  // 获取SqlSession对象，默认的实现里事物隔离级别为null、不自动提交
  SqlSession openSession();

  // 设置是否自动提交事务，true：自动提交，false：不自动提交
  SqlSession openSession(boolean autoCommit);

  // 从连接中创建
  SqlSession openSession(Connection connection);

  // 设置事物级别
  SqlSession openSession(TransactionIsolationLevel level);

  // 设置执行器类型，执行器类型有SIMLPLE、REUSE、BATCH
  SqlSession openSession(ExecutorType execType);

  SqlSession openSession(ExecutorType execType, boolean autoCommit);

  SqlSession openSession(ExecutorType execType, TransactionIsolationLevel level);

  SqlSession openSession(ExecutorType execType, Connection connection);

  // 获取配置
  Configuration getConfiguration();
}
~~~

SqlSessionFactory默认有2个实现类，DefaultSqlSessionFactory、SqlSessionManager。

### 2.3 DefaultSqlSessionFactory源码

DefaultSqlSessionFactory的实现了SqlSessionFactory接口，其核心功能就是获取SqlSession和配置。</p><p>

构造方法：
~~~java
public DefaultSqlSessionFactory(Configuration configuration) {
  this.configuration = configuration;
}
~~~
 
核心方法
 
~~~java 
 // 创建SqlSession
// 需要三个参数，configuration、executor、autoCommit
// configuration：即配置信息
// executor：执行器，用于执行sql的
// autoCommit：事物是否自动提交
protected SqlSession createSqlSession(Configuration configuration, Executor executor, boolean autoCommit) {
    return new DefaultSqlSession(configuration, executor, autoCommit);
}

// 从DateSource中打开Session
// 这里主要是构建executor，在执行器里加入事物
private SqlSession openSessionFromDataSource(ExecutorType execType, TransactionIsolationLevel level,
      boolean autoCommit) {
    Transaction tx = null;
    try {
      final Environment environment = configuration.getEnvironment();
      final TransactionFactory transactionFactory = getTransactionFactoryFromEnvironment(environment);
      tx = transactionFactory.newTransaction(environment.getDataSource(), level, autoCommit);
      final Executor executor = configuration.newExecutor(tx, execType);
      return createSqlSession(configuration, executor, autoCommit);
    } catch (Exception e) {
      closeTransaction(tx); // may have fetched a connection so lets call close()
      throw ExceptionFactory.wrapException("Error opening session.  Cause: " + e, e);
    } finally {
      ErrorContext.instance().reset();
    }
  }

// 从连接中打开Session
// 这里主要是构建executor，在执行器里加入事物
  private SqlSession openSessionFromConnection(ExecutorType execType, Connection connection) {
    try {
      boolean autoCommit;
      try {
        autoCommit = connection.getAutoCommit();
      } catch (SQLException e) {
        // Failover to true, as most poor drivers
        // or databases won't support transactions
        autoCommit = true;
      }
      final Environment environment = configuration.getEnvironment();
      final TransactionFactory transactionFactory = getTransactionFactoryFromEnvironment(environment);
      final Transaction tx = transactionFactory.newTransaction(connection);
      final Executor executor = configuration.newExecutor(tx, execType);
      return createSqlSession(configuration, executor, autoCommit);
    } catch (Exception e) {
      throw ExceptionFactory.wrapException("Error opening session.  Cause: " + e, e);
    } finally {
      ErrorContext.instance().reset();
    }
  }

// 获取事物工厂，这里先了解
private TransactionFactory getTransactionFactoryFromEnvironment(Environment environment) {
    if (environment == null || environment.getTransactionFactory() == null) {
      return new ManagedTransactionFactory();
    }
    return environment.getTransactionFactory();
}
~~~


### 2.4 SqlSession源码

SqlSession接口其功能可分为以下四类：

1. 执行SELECT、INSERT、UPDATE、DELETE语句；
2. 执行commit、rollback方法；
3. get相关方法：获取配置、获取链接、获取mapper
4. 其他方法：flushStatements、清除缓存、关闭session


SqlSession默认有2个实现类，DefaultSqlSession、SqlSessionManager

### 2.5 SqlSessionManager源码

SqlSessionManager继承了SqlSessionFactory、SqlSession接口，它不仅实现了这两个接口的所有方法，也增加了两类方法newInstance和startManagedSession方法。

~~~java
private final SqlSessionFactory sqlSessionFactory;
private final SqlSession sqlSessionProxy;

private final ThreadLocal<SqlSession> localSqlSession = new ThreadLocal<>();

// 构造方法，
private SqlSessionManager(SqlSessionFactory sqlSessionFactory) {
    this.sqlSessionFactory = sqlSessionFactory;
    this.sqlSessionProxy = (SqlSession) Proxy.newProxyInstance(SqlSessionFactory.class.getClassLoader(),
        new Class[] { SqlSession.class }, new SqlSessionInterceptor());
}

// 其中一个newInstance方法，通过SqlSessionFactoryBuilder构建器获取到SqlSessionFactory，然后创建SqlSessionManager对象
public static SqlSessionManager newInstance(Reader reader) {
    return new SqlSessionManager(new SqlSessionFactoryBuilder().build(reader, null, null));
}
~~~

### 2.2.6 SqlSessionFactoryBuilder

SqlSessionFactoryBuilder构建器，用于构建SqlSessionFactory，核心方法为

~~~java
// 构建XMLConfigBuilder解析器，解析XML数据。即从配置中构建SqlSessionFactory、以及其他信息
public SqlSessionFactory build(Reader reader, String environment, Properties properties) {
    try {
      XMLConfigBuilder parser = new XMLConfigBuilder(reader, environment, properties);
      return build(parser.parse());
    } catch (Exception e) {
      throw ExceptionFactory.wrapException("Error building SqlSession.", e);
    } finally {
      ErrorContext.instance().reset();
      try {
        if (reader != null) {
          reader.close();
        }
      } catch (IOException e) {
        // Intentionally ignore. Prefer previous error.
      }
    }
}

public SqlSessionFactory build(InputStream inputStream, String environment, Properties properties) {
    try {
      XMLConfigBuilder parser = new XMLConfigBuilder(inputStream, environment, properties);
      return build(parser.parse());
    } catch (Exception e) {
      throw ExceptionFactory.wrapException("Error building SqlSession.", e);
    } finally {
      ErrorContext.instance().reset();
      try {
        if (inputStream != null) {
          inputStream.close();
        }
      } catch (IOException e) {
        // Intentionally ignore. Prefer previous error.
      }
    }
}
~~~

## 3. 插件

Mybatis的插件设计是其强大的能力之一，Mybatis的代理是针对方法的代理。在源码中plugin包就是插件源码，让我们看下其目录结构：

~~~shell
.
├── Interceptor.java
├── InterceptorChain.java
├── Intercepts.java
├── Invocation.java
├── Plugin.java
├── PluginException.java
├── Signature.java
└── package-info.java
~~~

@startuml
interface Interceptor
annotation Intercepts
annotation Signature
class InterceptorChain {
  List<Interceptor> interceptors
}
class Plugin {
  Object target
  Interceptor interceptor
}
class Invocation
exception PluginException

/' 关联关系，拦截器链类有多个拦截器的ArrayList'/
Interceptor "n" ---* "1" InterceptorChain 
Interceptor "1" --* "1" Plugin
Intercepts "1" *-- "n" Signature
@enduml


### 3.1 源码分析

我们先来看InterceptorChain的源码，其内部持有Interceptor拦截器的一个list，成员方法也只有3个，分别是添加拦截器、返回拦截器、pluginAll（注入插件）。

在Interceptor接口中，plugin方法是个default的方法，调用了Plugin类的wrap方法将插件包装到目标对象里。用户实现插件需要需要实现intercept方法，在这个方法中加上真正的业务逻辑。intercept方法接受一个Invocation的参数。

~~~java
public class InterceptorChain {

  private final List<Interceptor> interceptors = new ArrayList<>();

  public Object pluginAll(Object target) {
    for (Interceptor interceptor : interceptors) {
	  // 这里调用拦截器的plugin方法，接下来我们看下拦截器接口
      target = interceptor.plugin(target);
    }
    return target;
  }

  public void addInterceptor(Interceptor interceptor) {
    interceptors.add(interceptor);
  }

  public List<Interceptor> getInterceptors() {
	// 这里返回的是一个不可变的List，以防拿到List后添加拦截器，真正添加拦截器只能调用addInterceptor
    return Collections.unmodifiableList(interceptors);
  }

}

public interface Interceptor {

  Object intercept(Invocation invocation) throws Throwable;

  default Object plugin(Object target) {
    return Plugin.wrap(target, this);
  }

  default void setProperties(Properties properties) {
    // NOP
  }

}
~~~

Invocation究竟做了什么呢？请看源码及注释说明

~~~java
public class Invocation {

  // 目标类集合，在构造方法中用于判断，这里其实就是拦截器支持拦截的类的范围，限定在这四个
  private static final List<Class<?>> targetClasses = Arrays.asList(Executor.class, ParameterHandler.class,
      ResultSetHandler.class, StatementHandler.class);
  // 目标对象、方法、属性，可以猜出这是利用了反射
  private final Object target;
  private final Method method;
  private final Object[] args;

  public Invocation(Object target, Method method, Object[] args) {
    // 可以看出Mybatis只支持对Executor、ParameterHandler、ResultSetHandler、StatementHandler四个类的方法进行插件化处理
    // Mybatis核心也是这四个，后续再分析
    if (!targetClasses.contains(method.getDeclaringClass())) {
      throw new IllegalArgumentException("Method '" + method + "' is not supported as a plugin target.");
    }
    this.target = target;
    this.method = method;
    this.args = args;
  }

  public Object getTarget() {
    return target;
  }

  public Method getMethod() {
    return method;
  }

  public Object[] getArgs() {
    return args;
  }

  public Object proceed() throws InvocationTargetException, IllegalAccessException {
    // 在这个proceed方法就很明显了，调用插件的时候执行此方法。
    // 插件拦截Executor、ParameterHandler、ResultSetHandler、StatementHandler四个类里的某个方法，然后反射调用。
    return method.invoke(target, args);
  }

}
~~~

前面的源码，我们能够了解到Mybatis的插件限定在Executor、ParameterHandler、ResultSetHandler、StatementHandler四个类的处理。以及插件最终调用是通过反射调用的。

接下来，我们来看看在Interceptor接口里的plugin方法，Plugin.wrap究竟做了什么？入参是一个Object类型命名为target的变量，方法体也只有一行return Plugin.wrap(target, this)。我们不妨先猜测下，它把目标对象和拦截器包装组合起来，然后返回一个Object，这个Object是什么呢？猜测还是“target对象”，不过是已经内置了拦截器的“target对象”。这个target对象其实是前面四个类的实例对象。

让我们从源码中找寻答案。

~~~java
// Plugin实现了InvocationHandler，还记得JDK的动态代理是如何实现的吗？其中，很重要的一点就是实现接口InvocationHandler
// 也就是说Mybatis的插件实际上是利用了JDK的动态代理来实现的
public class Plugin implements InvocationHandler {

  // 动态代理，持有被代理的对象。看到这里，传入的target原来是被代理的对象。
  private final Object target;
  // 拦截器
  private final Interceptor interceptor;
  // 签名Map，这个先放着，后面再了解
  private final Map<Class<?>, Set<Method>> signatureMap;

  private Plugin(Object target, Interceptor interceptor, Map<Class<?>, Set<Method>> signatureMap) {
    this.target = target;
    this.interceptor = interceptor;
    this.signatureMap = signatureMap;
  }

  // 这个就是在Interceptor接口中调用的wrap方法了，
  public static Object wrap(Object target, Interceptor interceptor) {
    // 从拦截器上获取签名（注解Signature的内容）
    Map<Class<?>, Set<Method>> signatureMap = getSignatureMap(interceptor);

	// 获取target的类、以及接口类，我们知道，使用JDK的动态代理，Proxy创建代理对象的时候，需要使用接口。
    Class<?> type = target.getClass();
    Class<?>[] interfaces = getAllInterfaces(type, signatureMap);
    if (interfaces.length > 0) {
      // 当能获取到接口的时候，就给target创建代理对象，并增加插件。从上面的构造方法可以看到插件传入参数target对象、拦截器、签名map
      return Proxy.newProxyInstance(type.getClassLoader(), interfaces, new Plugin(target, interceptor, signatureMap));
    }
    // 没有则返回原对象，无法注入拦截器
    return target;
  }

  // 由于是JDK动态代理，方法执行的时候就会调用invoke方法
  @Override
  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    try {
      // 从signatureMap中获取Set<Method>，这个集合存储的也是需要被拦截的方法
      Set<Method> methods = signatureMap.get(method.getDeclaringClass());
      if (methods != null && methods.contains(method)) {
        // 执行拦截器，执行接口Interceptor的intercept方法，传入Invocation对象
		// 在intercept方法里实现业务逻辑后，不要忘记了调用proceed方法，这个方法里真正执行被代理的方法
		// 并最终返回
        return interceptor.intercept(new Invocation(target, method, args));
      }
      return method.invoke(target, args);
    } catch (Exception e) {
      throw ExceptionUtil.unwrapThrowable(e);
    }
  }

  private static Map<Class<?>, Set<Method>> getSignatureMap(Interceptor interceptor) {
    // 如果一个类是Mybatis的插件类，只需要将其用注解Intercepts修饰
    Intercepts interceptsAnnotation = interceptor.getClass().getAnnotation(Intercepts.class);
    // issue #251
    if (interceptsAnnotation == null) {
      throw new PluginException(
          "No @Intercepts annotation was found in interceptor " + interceptor.getClass().getName());
    }
    // 然后获取Intercepts里的Signature值
    Signature[] sigs = interceptsAnnotation.value();
    Map<Class<?>, Set<Method>> signatureMap = new HashMap<>();
    for (Signature sig : sigs) {
      // 从signatureMap中获取value，即Set<Method>，如果不存在返回new HashSet<>()
      Set<Method> methods = MapUtil.computeIfAbsent(signatureMap, sig.type(), k -> new HashSet<>());
      try {
        // 读取Signature注解的方法，将其添加到methods里
        Method method = sig.type().getMethod(sig.method(), sig.args());
        methods.add(method);
      } catch (NoSuchMethodException e) {
        throw new PluginException("Could not find method on " + sig.type() + " named " + sig.method() + ". Cause: " + e,
            e);
      }
    }
    return signatureMap;
  }

  private static Class<?>[] getAllInterfaces(Class<?> type, Map<Class<?>, Set<Method>> signatureMap) {
    // 获取到接口类，接口类必须是在签名map里包含的，这步也就是确保创建代理对象必须是我们想要的。
    Set<Class<?>> interfaces = new HashSet<>();
    while (type != null) {
      for (Class<?> c : type.getInterfaces()) {
        if (signatureMap.containsKey(c)) {
          interfaces.add(c);
        }
      }
      type = type.getSuperclass();
    }
    return interfaces.toArray(new Class<?>[0]);
  }

}
~~~


Plugin.wrap究竟做了什么？现在我们能够回答这个问题了，在符合条件的情况下，它会使用JDK的动态代理创建target对象的一个代理对象并返回。


### 3.2 补充

有的同学可能已经发现了，前面InterceptorChain的pluginAll方法，只传入一个Object的target对象，然后再循环里用的一直都是它。这表示在插件里是一个嵌套关系。

假设：配置插件顺序为Demo1、Demo2，target为真实代理对象

* 第一次创建代理Demo1  + target，这两个组合得到新的target’
* 第二次创建代理Demo2 + target‘，得到最终对象

执行顺序，是拦截器2、拦截器1、target的目标方法。

@startuml
card Demo2 {
  card Demo1 {
    card target
  }
}
@enduml

## 4 Executor

Executor执行器接口，在包executor下。这个包除了执行器，还包括parameter、resultset、statement。上一节插件提到的四个接口都在这个包里，这个包是Mybatis的核心功能。

在Mybatis中，我们通过session去执行SQL命令的，这个执行的过程就是依赖Executor。比如select语句，在DefaultSqlSession里由以下这个私有的selectList方法，在这个方法里是executor执行query方法获取结果。


~~~java
// statement 实际为 xml 里 sql片段的 id
// parameter SQL对应的参数
// rowBounds为行边界，映射到sql即limit size, offset（不同的数据库可能不一样）
// handler结果处理器
private <E> List<E> selectList(String statement, Object parameter, RowBounds rowBounds, ResultHandler handler) {
  try {
  // 从配置中获取映射的sql语句，注意这个语句就是写在xml里的原始sql，此时参数并没有被替换
    MappedStatement ms = configuration.getMappedStatement(statement);
    dirty |= ms.isDirtySelect();
  // 执行查询。
    return executor.query(ms, wrapCollection(parameter), rowBounds, handler);
  } catch (Exception e) {
    throw ExceptionFactory.wrapException("Error querying database.  Cause: " + e, e);
  } finally {
    ErrorContext.instance().reset();
  }
}
~~~

如下图所示，Executor的接口以及相关实现类的图。从图中，可以看出主要有四类执行器

1. CachingExecutor
2. BatchExecutor
3. SimpleExecutor
4. ReuseExecutor
  
其中，2、3、4都是集成了BaseExecutor基类。

### 4.1 Executor源码
  
我们先来看下Executor都有哪些接口


~~~java
public interface Executor {

  ResultHandler NO_RESULT_HANDLER = null;

  // 更新
  int update(MappedStatement ms, Object parameter) throws SQLException;

  // 查询，带了cacheKey
  <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler,
      CacheKey cacheKey, BoundSql boundSql) throws SQLException;

  // 查询，在BaseExecutor里底层调了上一个查询接口
  <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler)
      throws SQLException;

  // 游标查询
  <E> Cursor<E> queryCursor(MappedStatement ms, Object parameter, RowBounds rowBounds) throws SQLException;

  // 冲掉Statements
  List<BatchResult> flushStatements() throws SQLException;

  // 提交代码
  void commit(boolean required) throws SQLException;

  // 回滚
  void rollback(boolean required) throws SQLException;

  // 创建CacheKey
  CacheKey createCacheKey(MappedStatement ms, Object parameterObject, RowBounds rowBounds, BoundSql boundSql);

  // 判断是否被缓存了
  boolean isCached(MappedStatement ms, CacheKey key);

  // 清除缓存
  void clearLocalCache();

  // 延迟加载
  void deferLoad(MappedStatement ms, MetaObject resultObject, String property, CacheKey key, Class<?> targetType);

  // 事物
  Transaction getTransaction();

  // 关闭执行器
  void close(boolean forceRollback);

  // 判断执行器是否关闭
  boolean isClosed();

  // 设置执行包装器
  void setExecutorWrapper(Executor executor);

}
~~~

可以看到，方法比较多，只要是执行SQL相关方法、包括事物。

### 4.2 BaseExecutor

在BaseExecutor里，典型的是模板模式的应用。模板模式应用在doUpdate、doQuery、doQueryCursor、doFlushStatements方法，这四个抽象方法在具体的实现类中实现。接下来分类看看这些方法在基类里都做了什么。


~~~java
protected abstract int doUpdate(MappedStatement ms, Object parameter) throws SQLException;

protected abstract List<BatchResult> doFlushStatements(boolean isRollback) throws SQLException;

protected abstract <E> List<E> doQuery(MappedStatement ms, Object parameter, RowBounds rowBounds,
      ResultHandler resultHandler, BoundSql boundSql) throws SQLException;

protected abstract <E> Cursor<E> doQueryCursor(MappedStatement ms, Object parameter, RowBounds rowBounds,
      BoundSql boundSql) throws SQLException;
~~~
      
### 4.3 doUpdate方法

首先看doUpdate方法在基类里的调用

~~~java
@Override
public int update(MappedStatement ms, Object parameter) throws SQLException {
  // 构建信息，以便在执行出异常是进行打印
  ErrorContext.instance().resource(ms.getResource()).activity("executing an update").object(ms.getId());
  if (closed) {
    throw new ExecutorException("Executor was closed.");
  }
  // 清除缓存，任何更新方法，都不会缓存
  clearLocalCache();
  // 执行doUpdate，真正的实现在子类里
  return doUpdate(ms, parameter);
}
~~~
  
### 4.4 doFlushStatements方法
  
~~~java
// 接口定义的方法，默认传值false
@Override
public List<BatchResult> flushStatements() throws SQLException {
  return flushStatements(false);
}
// BaseExecutor里的flushStatements方法，也没有太多特殊处理，仅判断执行器是否被关闭了
public List<BatchResult> flushStatements(boolean isRollBack) throws SQLException {
  if (closed) {
    throw new ExecutorException("Executor was closed.");
  }
  return doFlushStatements(isRollBack);
}
~~~
  
### 4.5 doQueryCursor方法
  
先看游标查询方法

~~~java
@Override
public <E> Cursor<E> queryCursor(MappedStatement ms, Object parameter, RowBounds rowBounds) throws SQLException {
  // 也没有特别的处理，基于参数构建了一个boundSql
  BoundSql boundSql = ms.getBoundSql(parameter);
  return doQueryCursor(ms, parameter, rowBounds, boundSql);
}
~~~
  
### 4.6doQuery方法
  
我们重点看doQuery方法，在接口中有2个query方法，我们可以从下面源码中看出，无缓存参数的query方法内部调用了带缓存参数的query方法。

~~~java
 @Override
 public <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler)
     throws SQLException {
   // 从ms里获取到绑定的SQL
   BoundSql boundSql = ms.getBoundSql(parameter);
   // 创建CacheKey对象，内部我们先不看
   CacheKey key = createCacheKey(ms, parameter, rowBounds, boundSql);
   return query(ms, parameter, rowBounds, resultHandler, key, boundSql);
 }

 @SuppressWarnings("unchecked")
 @Override
 public <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler,
     CacheKey key, BoundSql boundSql) throws SQLException {
   ErrorContext.instance().resource(ms.getResource()).activity("executing a query").object(ms.getId());
   if (closed) {
     throw new ExecutorException("Executor was closed.");
   }
   if (queryStack == 0 && ms.isFlushCacheRequired()) {
     clearLocalCache();
   }
   List<E> list;
   try {
    // 查询栈的作用，后续再了解
    queryStack++;
    // 如果resultHandler为空，则先从缓存中获取数据，获取不到再查数据库
    list = resultHandler == null ? (List<E>) localCache.getObject(key) : null;
    if (list != null) {
      // StatementType = CALLABLE 才进行解析一些参数，CALLABLE一般用于存储过程
      handleLocallyCachedOutputParameters(ms, key, parameter, boundSql);
    } else {
      // 从数据库中查询数据
      list = queryFromDatabase(ms, parameter, rowBounds, resultHandler, key, boundSql);
    }
  } finally {
    queryStack--;
  }
  if (queryStack == 0) {
    for (DeferredLoad deferredLoad : deferredLoads) {
      deferredLoad.load();
    }
    // issue #601
    deferredLoads.clear();
    if (configuration.getLocalCacheScope() == LocalCacheScope.STATEMENT) {
      // issue #482
      clearLocalCache();
    }
  }
  return list;
}

private <E> List<E> queryFromDatabase(MappedStatement ms, Object parameter, RowBounds rowBounds,
  ResultHandler resultHandler, CacheKey key, BoundSql boundSql) throws SQLException {
  List<E> list;
  localCache.putObject(key, EXECUTION_PLACEHOLDER);
  try {
    // 执行查询doQuery，真正的实现在子类中
    list = doQuery(ms, parameter, rowBounds, resultHandler, boundSql);
  } finally {
    localCache.removeObject(key);
  }
  // 设置缓存
  localCache.putObject(key, list);
  if (ms.getStatementType() == StatementType.CALLABLE) {
    localOutputParameterCache.putObject(key, parameter);
  }
  return list;
}
~~~


## 5 StatementHandler

在Executor的实现类里，我们可以看到最后真正调用的是StatementHandler的方法执行更新或查询。接下来，我们来了解StatementHandler，看看它到底是怎么执行SQL。

下图是StatementHandler的类图。可以看到StatementHandler的类图结构其实和Executor接口很像。都有一个基类、三个实际的子类继承基类、还有一个是使用装饰器模式的功能类。

1. BaseStatementHandler
2. SimpleStatementHandler：对应到JDBC的Statement
3. PreparedStatementHandler：对应到JDBC的PreparedStatement
4. CallableStatementHandler：对应到JDBC的CallableStatement，即存储过程
5. RoutingStatementHandler：路由StatementHandler，使用了装饰器模式，使其能够根据不同的类型，路由到不同的handler实例。

接下来，先看下接口StatementHandler有哪些方法

~~~java
public interface StatementHandler {
  //
  Statement prepare(Connection connection, Integer transactionTimeout) throws SQLException;

  // 参数化，将SQL里的占位，替换为参数
  void parameterize(Statement statement) throws SQLException;

  // 批量执行器使用
  void batch(Statement statement) throws SQLException;

  // 执行修改SQL
  int update(Statement statement) throws SQLException;

  // 执行查询
  <E> List<E> query(Statement statement, ResultHandler resultHandler) throws SQLException;

  // 执行游标查询
  <E> Cursor<E> queryCursor(Statement statement) throws SQLException;

  // 获取绑定的SQL
  BoundSql getBoundSql();

  // 获取参数ParameterHandler
  ParameterHandler getParameterHandler();

}
~~~

### 5.1 BaseStatementHandler

抽象类BaseStatementHandler实现了接口里`getBoundSql`、`getParameterHandler`、`prepare`三个方法。这意味着，子类必须实现接口的parameterize、batch、udpate、query、queryCursor5个方法。

~~~java
public Statement prepare(Connection connection, Integer transactionTimeout) throws SQLException {
    ErrorContext.instance().sql(boundSql.getSql());
    Statement statement = null;
    try {
      statement = instantiateStatement(connection);
      setStatementTimeout(statement, transactionTimeout);
      setFetchSize(statement);
      return statement;
    } catch (SQLException e) {
      closeStatement(statement);
      throw e;
    } catch (Exception e) {
      closeStatement(statement);
      throw new ExecutorException("Error preparing statement.  Cause: " + e, e);
    }
  }

protected abstract Statement instantiateStatement(Connection connection) throws SQLException;
~~~

在prepare方法里，定义了抽象方法instantiateStatement方法。这个方法在子类中实现，用于实例化Statement对象。

从前面类继承我们可以知道BaseStatementHandler有3个实现类，分别是SimpleStatementHandler、PreparedStatementHandler、CallableStatementHandler。这三个分别对应了JDBC里的Statement、PreparedStatement、CallableStatement。我们分别来看下这三个类是如何实例化对应的Statement对象的 SimpleStatementHandler

~~~java
@Override
protected Statement instantiateStatement(Connection connection) throws SQLException {
  if (mappedStatement.getResultSetType() == ResultSetType.DEFAULT) {
    return connection.createStatement();
  }
  return connection.createStatement(mappedStatement.getResultSetType().getValue(), ResultSet.CONCUR_READ_ONLY);
}
~~~

需要注意，这里的SimpleStatementHandler和SimpleExecutor并没有对应关系。SimpleExecutor也可以执行PreparedStatement、CallableStatement。
  
### 5.2 PreparedStatement
  
~~~java
@Override
protected Statement instantiateStatement(Connection connection) throws SQLException {
  String sql = boundSql.getSql();
  if (mappedStatement.getKeyGenerator() instanceof Jdbc3KeyGenerator) {
    String[] keyColumnNames = mappedStatement.getKeyColumns();
    if (keyColumnNames == null) {
      return connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
    } else {
      return connection.prepareStatement(sql, keyColumnNames);
    }
  }
  if (mappedStatement.getResultSetType() == ResultSetType.DEFAULT) {
    return connection.prepareStatement(sql);
  } else {
    return connection.prepareStatement(sql, mappedStatement.getResultSetType().getValue(),
        ResultSet.CONCUR_READ_ONLY);
  }
}
~~~

~~~java
@Override
protected Statement instantiateStatement(Connection connection) throws SQLException {
  String sql = boundSql.getSql();
  if (mappedStatement.getResultSetType() == ResultSetType.DEFAULT) {
    return connection.prepareCall(sql);
  }
  return connection.prepareCall(sql, mappedStatement.getResultSetType().getValue(), ResultSet.CONCUR_READ_ONLY);
}
~~~

## 6 ParameterHandler

参数处理器接口作用是给预编译的SQL的参数赋值。在深入了解ParameterHandler之前，我们先来复习下JDBC是怎么执行查询的。

### 6.1 JDBC查询

#### JDBC实例

直接使用JDBC查询数据库有以下步骤：

1. 注册驱动
2. 获取链接
3. 创建Statement
4. 执行Statement，获取ResultSet
5. 解析ResultSet，获取数据

~~~java
@Slf4j
public class JdbcDemo {
    public static void main(String[] args) throws ClassNotFoundException, SQLException {
        // 1、注册驱动
        Class.forName("com.mysql.cj.jdbc.Driver");

        // 2、获取链接对象
        String dbUrl = "jdbc:mysql://127.0.0.1:3306/ysw_pd?useUnicode=true&characterEncoding=UTF-8&rewriteBatchedStatements=true&serverTimezone=Asia/Shanghai";
        Connection conn = DriverManager.getConnection(dbUrl, "root", "yourpassword");

        // 3、获取执行的SQL
        Statement stat = conn.createStatement();
        String sql = "select * from my_password";
        // 4、执行SQL，获取到结果集
        ResultSet rs = stat.executeQuery(sql);
        log.info("rs: {}", rs.toString());

        // 5、解析ResultSet，每一次next都是遍历行属性值
        while (rs.next()) {
            long id = rs.getLong("id");
            String sysName = rs.getString("sys_name");
            log.info("id: {}, sysName: {}", id, sysName);
        }

        // 6、关闭资源
        rs.close();
        stat.close();
        conn.close();
    }
}
~~~

#### JDBC Statement

从前面可以得知，执行SQL是通过Statement来处理的。Statement在包java.sql里，这是一个接口。我们查看下它的类图结构，可以看到还有PreparedStatement、CallableStatement。其实从这里也可以看出来，前面提到的StatementHandler的三个实现SimpleStatementHandler、PreparedStatementHandler、CallableStatementHandler，分别对应着Statement、PreparedStatement、CallableStatement。

SimpleStatementHandler里的parameterize方法为空，意味着执行无输入参数的SQL。

这里作用里提到的静态SQL语句要和Mybatis里的StaticSqlSource区别开，前者只是无输入参数的SQL可以直接执行。而后者StaticSqlSource则可以是带?参数的SQL参数是固定的，这里的static是相对于Dynamic来说的，即和DynamicSqlSource有区别。

### 6.2 PreparedStatement实例

如下是PreparedStatement的一个实例，可以看出使用了?作为占位符，给?参数赋值后即可执行获得结果ResultSet。在Mybatis里我们所有的SQL默认都是以Prepared的。

~~~java 
// 预编译的SQL使用 ? 作为占位符，然后需要赋值
PreparedStatement pstmt = con.prepareStatement("UPDATE EMPLOYEES SET SALARY = ? WHERE ID = ?");
pstmt.setBigDecimal(1, sal);
pstmt.setInt(2, 110592);

// 执行预编译SQL，获取结果
ResultSet rs = pstmt.executeQuery();
~~~

### 6.3 ParameterHandler源码

ParameterHandler的源码很简单，只有两个方法。一个是获取参数对象，另一个就是设置参数。

~~~java
public interface ParameterHandler {

  Object getParameterObject();

  void setParameters(PreparedStatement ps) throws SQLException;

}
~~~

在Mybatis中其实现也只有一个

~~~java
public class DefaultParameterHandler implements ParameterHandler {

  private final TypeHandlerRegistry typeHandlerRegistry;

  private final MappedStatement mappedStatement;
  private final Object parameterObject;
  private final BoundSql boundSql;
  private final Configuration configuration;

  public DefaultParameterHandler(MappedStatement mappedStatement, Object parameterObject, BoundSql boundSql) {
    this.mappedStatement = mappedStatement;
    this.configuration = mappedStatement.getConfiguration();
    this.typeHandlerRegistry = mappedStatement.getConfiguration().getTypeHandlerRegistry();
    this.parameterObject = parameterObject;
    this.boundSql = boundSql;
  }

  @Override
  public Object getParameterObject() {
    return parameterObject;
  }

  @Override
  public void setParameters(PreparedStatement ps) {
    ErrorContext.instance().activity("setting parameters").object(mappedStatement.getParameterMap().getId());
    // 参数映射是在执行查询时通过ms.getBoundSql赋值，执行更新时，创建StatementHandler时通过ms.getBoundSql赋值
    List<ParameterMapping> parameterMappings = boundSql.getParameterMappings();
    // ParameterMapping（参数映射）这个不为空，才需要进行参数替换。预编译的SQL语句参数是问号代替的
    if (parameterMappings != null) {
      MetaObject metaObject = null;
      for (int i = 0; i < parameterMappings.size(); i++) {
        ParameterMapping parameterMapping = parameterMappings.get(i);
        // 参数的模式，必须是不是OUT继续获取值。
        if (parameterMapping.getMode() != ParameterMode.OUT) {
          Object value;
          // 获取参数映射的属性名称
          String propertyName = parameterMapping.getProperty();
          if (boundSql.hasAdditionalParameter(propertyName)) { // issue #448 ask first for additional params
            // 如果是动态SQL模式，则需要从额外的参数里获取属性名对应的值
            value = boundSql.getAdditionalParameter(propertyName);
          } else if (parameterObject == null) {
            value = null;
          } else if (typeHandlerRegistry.hasTypeHandler(parameterObject.getClass())) {
            // 参数有自己的类型处理器，则返回参数对象
            value = parameterObject;
          } else {
            // 利用反射，MetaObject获取参数值
            if (metaObject == null) {
              metaObject = configuration.newMetaObject(parameterObject);
            }
            value = metaObject.getValue(propertyName);
          }
          TypeHandler typeHandler = parameterMapping.getTypeHandler();
          JdbcType jdbcType = parameterMapping.getJdbcType();
          if (value == null && jdbcType == null) {
            jdbcType = configuration.getJdbcTypeForNull();
          }
          try {
            // 参数赋值
            typeHandler.setParameter(ps, i + 1, value, jdbcType);
          } catch (TypeException | SQLException e) {
            throw new TypeException("Could not set parameters for mapping: " + parameterMapping + ". Cause: " + e, e);
          }
        }
      }
    }
  }

}
~~~