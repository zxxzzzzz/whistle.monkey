### mock monkey 项目的集合

### 使用方法
#### 概述
- 一个mock工具。基于whistle的插件机制，会对所有通过whistle的请求进行解析。如果符合需要mock的条件。就是使用mock数据。
- 工具分三个包，monkey-core,核心mock包，类似于mock.js库，可以把一个符合规则的模板，生成成json数据。ui包，使用于whistle的界面展现。server包，提供给whistle使用，用于解析流经whistle的的请求，并根据情况返回mock数据。
- 该工具无侵入性，不需要修改项目代码就可以使用。

#### ui界面介绍
![界面](https://cdn.nlark.com/yuque/0/2021/png/1384813/1631150770266-1079d76b-a3d0-40e6-9dbe-0d8dcb32d29b.png)

#### 模板介绍
- 模板语法类似mockjs,但是加入了动态语言执行的功能。可以通过js语句生成更丰富的数据
- 比较于mockjs增加了入参验证，这样在mock的时候就能判断自己的入参的正确性
- examples 有模板的用例
![模板](https://cdn.nlark.com/yuque/0/2021/png/1384813/1631152295343-85657277-a68a-4146-960d-f155947ec2c2.png)
![返回结果](https://cdn.nlark.com/yuque/0/2021/png/1384813/1631152639260-f57b37bf-6e08-4441-a678-01802b360f89.png)

##### 模板语法详解
- 模板的构造
  模板必须要有下面几个字段。当你新建一个文件（在被监测的文件夹里）时，会自动在新建的文本上填写这几个基本的参数。同时，如果你直接复制一个json对象到文件里时，程序会根据情况把他自动format到yaml格式（会自动补充必须字段）。
  ```yaml
  request:
    url: ''
  response:
    body: ''
  ```
  - 额外的配置
    - delay 声明该请求延迟多久响应，单位是ms
     ```yaml
    delay: 1000
    request:
      url: ''
    response:
      body: ''
    ```
- 数组数据动态生成
数组数据的生成依赖 a<10> 这样的语法。比如
```yaml
'a<2>':
  b: 1
```
生成的数据为
```json
a:[1,1]
```
当<>里数据不是一个number,或者可以parseInt为number的字符串的话。生成的数据就会变成一个key-value对象，而不是一个数组。额外的，当<>里的值是布尔值false的话，该对象不会被生成。
- 动态语句
    1+1+1会被执行，结果会变成3。动态语句提供了许多工具函数。
    ```yaml
    a: 1+1+1
    ```
  - 工具函数
      提供了lodash,dayjs,ramda,faker,validator等工具库
      - lodash: `a: _.random(1,10)`
      - dayjs: `a: dayjs()`
      - ramda: `a: R.add(1,10)`
      - faker: `a: faker.phone()` ``a:fake`{{phone}}` ``
      - validator: 主要使用于入参验证`a: v.isEmail` 入参对应值a,会被自动传入函数v.isEmail
  - 上下文
    模板
    ```yaml
    'a<3>':
      b: index
    ```
    生成的数据
    ```json
    a:[{b:0},{b:1},{b:2}]
    ```
    模板语句执行时会有丰富的上下文
      - 来自入参
      - 来自生成的数据本身
      - 来自生成算法的添加（比如生成数组的子结构下面可以使用index,表面这处于数组第几个）

#### 额外的功能
- 当你需要屏蔽某个模板时，你可以在`.ignore`里书写规则。匹配库使用 micromatch
- 当你需要添加额外的函数时，你可以写一个js文件，然后把要使用的函数 exports出去（commonjs的导出包）。

### roadmap
- [ ] 报错系统的完善。要把任何造成模板不能用的问题都上报到ui.
- [x] 请求参数验证
- [x] 把json 自动format成可用的yaml格式
- [ ] 核心mock的算法重写，把递归调用转换成walk
