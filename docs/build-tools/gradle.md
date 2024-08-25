---
title: gradle
createTime: 2024/08/25 09:57:08
permalink: /article/elkipwif/
---
# Gradle

## 仓库配置

针对单个项目

~~~groovy
repositories {
    mavenLocal()
    maven {
        url 'https://maven.aliyun.com/repository/public/'
    }
    maven {
        url 'https://maven.aliyun.com/repository/spring/'
    }
    mavenCentral()
}
~~~

针对全局项目，可在`GRADLE_HOME/init.d/`目录下新建文件：`init.gradle`

~~~groovy
allprojects {
    repositories {
  
        mavenLocal()
  
        maven { url 'https://maven.aliyun.com/repository/public/' }
        maven { url 'https://maven.aliyun.com/repository/spring/'}
        maven { url 'https://maven.aliyun.com/repository/google/'}
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin/'}
        maven { url 'https://maven.aliyun.com/repository/spring-plugin/'}
        maven { url 'https://maven.aliyun.com/repository/grails-core/'}
        maven { url 'https://maven.aliyun.com/repository/apache-snapshots/'}
         
        mavenCentral()
    }
}
~~~