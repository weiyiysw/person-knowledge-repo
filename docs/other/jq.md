---
title: jq
createTime: 2024/08/25 09:46:20
permalink: /article/tap25r4o/
---
# jq

jq是一个命令行小工具，快速处理JSON数据，在全平台都可以使用。

[jq官网][]

## 使用示例1

假设需要处理的JSON文件如下：

~~~json
{
    "code": "0",
    "message": "success",
    "items": [
        {
            "id": "1",
            "name": "Alice"
        },
        {
            "id": "2",
            "name": "Bob"
        }
    ]
}
~~~

为了操作方便将其保存在文件中并命名为`jq-test.json`

~~~shell
# 快速提取items里的所有id数据
$ jq '.items[].id' jq-test.json
 
# 快速提取code值
$ jq '.code' jq-test.json
 
# 按顺序提取name
$ jq '.items[1].name' jq-test.json
 
# 压缩文件
$ cat jq-test.json | jq -c > test.json
 
$ cat test.json
{"code":0,"items":[{"id":"1","name":"yishiwei"},{"id":"2","name":"John"}]}
~~~



[jq官网]: https://jqlang.github.io/jq/