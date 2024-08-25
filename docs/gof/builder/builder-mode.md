---
title: 构建器模式
createTime: 2024/08/25 10:22:16
permalink: /article/lgcozrvh/
---
# 构造器模式

[创建者模式][]

构造器模式相对来说比较简单，适用于属性多的场景、创建对象复杂的场景。在开源的项目里也是很常见的一种设计模式，比如：OkHttp项目构建请求Client、谷歌guava项目构建cache。

~~~java
public class Example {
    private String field1;
    private String field2;
 
    private Example() {}
 
    private Example(String field1, String field2) {
        this.field1 = field1;
        this.field2 = field2;
    }
 
    public static ExampleBuilder builder() {
        return new ExampleBuilder();
    }
 
    public static class ExampleBuilder {
 
        private String field1;
        private String field2;
 
        public ExampleBuilder() {
        }
 
        public ExampleBuilder setField1(String val) {
            this.field1 = val;
            return this;
        }
 
        public ExampleBuilder setField2(String val) {
            this.field2 = val;
            return this;
        }
 
        public Example build() {
            return new Example(this.field1, this.field2);
        }
    }
}
~~~

[创建者模式]: ./readme.md