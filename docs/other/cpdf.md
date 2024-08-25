---
title: cpdf
createTime: 2024/08/25 09:53:06
permalink: /article/g4f98vip/
---
# cpdf

cpdf是一个命令行的工具，用来处理PDF。

[cpdf][]

## 添加目录

给PDF文件添加目录，只准备一个txt格式的目录文件。

其语法格式为：目录层级 目录内容 页码。注意这三个内容以空格隔开。

* 目录层级，从0开始编号，0为第一层目录，1为第二层目录。依次类推
* 目录内容，需要用英文双引号引起来
* 页码，代表该目录在PDF的哪一页

文本内容示例

~~~
0 "第一章 xxx" 1
1 "1.1 xx" 1
1 "1.2 xx" 5
0 "第二章 xxx" 10
0 "第三章 xxx" 20
~~~

假设添加的目录文件名为：bookmarks.txt，使用cpdf给PDF添加目录，执行如下命令。

~~~shell
# in.pdf 修改为你的PDF名称，out.pdf即生成的带目录的PDF，可以自行定义名称
$ cpdf -add-bookmarks bookmarks.txt in.pdf -o out.pdf
~~~



[cpdf]: https://community.coherentpdf.com/