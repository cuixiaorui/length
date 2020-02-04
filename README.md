# length

## 前言
在本篇文章内 我将试图通过一个实际的项目来演示如何正确的重构，让大家感受到重构的魅力所在    

## 什么是重构
"重构"这个词可以用作名词也可以用作动词

### 名词
对软件内部结构的一种调整，目的是在不改变软件可观察行为的前提下，提高可读性，降低其修改成本。

#### 举个栗子
假如你的程序里面有 bug ，那么正确的重构后 bug 应该还存在。这就是不改变外部行为

### 动词
使用一系列重构手法，在不改变软件可观察行为的前提下，调整其结构

### 关键所在
重构的关键在于运用大量微小且保持软件行为的步骤，一步步达到大规模的修改。每个单独的重构要么很小，要么由若干小步骤组合而成。

代码将会很少进入不可工作的状态

通过小步骤的完美组合，整个重构的过程可以不用花费任何时间来调试

## 为何重构
### 重构改进软件的设计
程序的内部设计会随着时间逐步腐败变质，这时候需要重构来帮助代码维持自己该有的状态，改进设计的一个重要方向就是消除重复，重复是万恶之源！

### 重构使软件更容易理解
让代码更好地表达自己的意图--更清晰地说出我想要做的。

大师级别的程序员把系统当做故事来讲，可读性是关键要素！

### 重构帮助找到bug
通过重构，可以深入理解代码的所作所为，还可以把新的理解反映在代码当中。当搞清楚程序结构的同时，想不把 bug 揪出来都难

## 何时重构


### 预备性重构：让添加新功能更容易
最佳时机就在添加新功能之前。有效的重构可以帮助我们更容易的修改逻辑，添加逻辑。通过重构手法减少现有代码的重复

### 帮助理解的重构：使代码更易懂
需要先理解代码在做什么，然后才能着手修改。通过重构手法让这段代码一目了然

### 捡垃圾式重构
我已经理解代码在做什么，但是发现它做得不好，那么可以实施重构。
> 专业的程序员遵守童子军军规——“让营地比你来时更干净”


## 开始重构

### 项目介绍
首先，先介绍下我们要重构的项目 Length，

#### 需求

美国⼈习惯使用很古怪的英制度量单位。英制度量单位的转换经常不是⼗进制的，比如说:

- 1 英尺(foot) = 12 英寸(inch)
- 1 码(yard) = 3 英尺(foot)

请你写一个程序，用于处理英寸、英尺、码之间的转换。例如：

- 1 英尺应该等于 12 英寸
- 1 码应该等于 36 英寸
- 1 英寸应该等于 1/36 码

#### 实现代码
```
export class Length {

  constructor(val, uint) {
    this.value = val
    this.unit = uint
  }

  getVal() {
    return this.value
  }

  getUint() {
    return this.unit
  }

  parseTo(u) {
    let len = this
    if (this.unit === 'yard') {
      if (u === 'f') {
        len = new Length(this.value * 3, u)
      } else if (u === 'inch') {
        len = new Length(this.value * 36, u)
      }
    }

    if (this.unit === 'inch') {
      if (u === 'yard') {
        len = new Length(this.value / 36, u)
      } else if (u === 'f') {
        len = new Length(this.value / 12, u)
      }
    }

    if (this.unit === 'f') {
      if (u === 'yard') {
        len = new Length(this.value / 3, u)
      } else if (u === 'inch') {
        len = new Length(this.value * 12, u)
      }
    }

    return len
  }
}
```
#### 识别坏味道
看完上面的代码什么感觉？？？ 

有没有感觉到可读性很差？

1. 变量命名不清晰
    1. f 是什么？？ 代码啥意思？
    2. u 又是什么鬼？
2. parseTo() 函数逻辑过长警告
3. 重复的字符串

是不是有的小伙伴感觉，问题也不是很大呀。50 行代码都不到，不叫事

而事恰恰就会出现在这个时候，每个大问题都是由小问题堆砌造成的。越来越不清晰的代码导致维护成本直线上升，if 语句无期限的往后叠加，最终都会造成大的问题。 

要时刻小心破窗理论

也许这时候你就要跃跃欲试要改代码了，别着急，在修改代码之前我们还有另外一项很重要的前置工作

### 增加安全网
没有测试的重构就是在耍流氓。我们怎么能保证重构后的逻辑是否和之前的行为一致呢？

为了保证和之前的行为一致，那么我们就需要验证。

而这就是我们需要添加测试的原因所在

换言之没有测试你就无法保证你的重构是安全的、正确的

不过，依据我的从业经验来看，百分之80的项目都没有测试

#### 引入 jest

##### 安装
```
yarn add --dev jest
// 需要 babel 来编译 es6+ 的语法
yarn add --dev babel-jest @babel/core @babel/preset-env
```

##### 添加到 package.json
在 package.json 内添加 test
```
// package.json
{
    "script":{
        "test":"jest"
    }
}
```
##### 创建 babel.config.js
```
module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
    ],
  };
```

##### 创建第一个测试

我们先创建一个 index.test.js 文件

然后添加一下代码来测试 jest 是否安全成功

```
import {Length} from "./index"
descript("Length",()=>{
    test("getVal",()=>{
      const length = new Length(100);
      expect(length.getVal()).toBe(100)
  })
})
```
ok 至此 jest 已经成功引入


#### 完善测试
首先我们需要在详细的阅读下项目需求，然后增加测试覆盖率，完善安全网

##### 1 英尺应该等于 12 英寸
先补齐这个测试
```
  test('1 英尺应该等于 12 英寸', () => {
    const length = new Length(1,"f").parseTo("inch");
    expect(length.getVal()).toBe(12)
  })
```
在阅读代码的时候发现这个 parseTo 应该是作为一个单位转换用的函数。

然后带着我们的猜测写出对应的测试代码来验证是否是正确的。 

运行测试

```
yarn test
```

```
 PASS  ./index.test.js
  Length
    ✓ getVal (3ms)
    ✓ 1 英尺应该等于 12 英寸 (1ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        2.756s
Ran all test suites.
✨  Done in 5.29s.
```

ok 通过 证明我们的猜测是没有问题的

通过上述测试结果 我们应该可以得到一个十分明确的结论

初始化一个单位后，通过 parseTo 函数进行单位转换，得到对应的值

刚刚是英尺转英寸，还能再扩展出 英尺转码码（yard）


##### 9 英尺应该等于 3 码
```
test('9 英尺应该等于  3 码', () => {
    const length = new Length(9,"f").parseTo("yard");
      expect(length.getVal()).toBe(3)
  })
```
这里说明一下为什么知道是9英尺等于 3 码呢

是因为我观察了源码的逻辑

```
// index.js
if (this.unit === 'f') {
    if (u === 'yard') {
        len = new Length(this.value / 3, u)
    } else if (u === 'inch') {
        len = new Length(this.value * 12, u)
    }
  }
```
当 u === yard 的时候就是转化为 码 的逻辑。

所以这个条件分支的测试已经覆盖全面了

如法炮制

我们在把剩下的测试快速的写出来

##### 24 英寸应该等于 2 英尺

```
  test('24 英寸应该等于 2 英尺', () => {
    const length = new Length(24,"inch").parseTo("f");
      expect(length.getVal()).toBe(2)
  })
```
##### 36 英寸应该等于 1 码
```
  test('36 英寸应该等于 1 码', () => {
    const length = new Length(36,"inch").parseTo("yard");
      expect(length.getVal()).toBe(1)
  })
```
##### 1 码应该等于 3 英尺
```
  test("1 码应该等于 3 英尺", () => {
    const length = new Length(1, "yard").parseTo("f");
    expect(length.getVal()).toBe(3);
  });
```

##### 1 码应该等于 36 英寸
```
    test("1 码应该等于 36 英寸", () => {
    const length = new Length(1, "yard").parseTo("inch");
    expect(length.getVal()).toBe(36);
  });
```

##### 如果没有对应的转换单位应该返回当前单位

观察 parseTo 函数
```
function parseTo(){
    let len = this
    ……
    return len
}
```
最后一行 返回了自身

这种逻辑是最容易被忽略的，所以也需要加上测试来保证行为一致

```
  test('如果没有对应的转换单位应该返回当前单位', () => {
      const val = 1;
      const unit = "yard"
      const length = new Length(1,"yard").parseTo('mi');
      expect(length.getVal()).toBe(val)
      expect(length.getUint()).toBe(unit)
  })
```
如何判断是返回自身呢。这里只要判断返回的 length 对应的单位和数值是否和传给 new Length 时候保持一致即可。

这段逻辑也正好验证了 getVal() 和 getUnit() 函数逻辑

好 至此 

我们的安全网已经构建完成了

我们可以查看下当前的测试覆盖率

```
yarn test --coverage
```
可以看到

```
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |    88.89 |     100 |     100 |                   
 index.js |     100 |    88.89 |     100 |     100 | 28,36             
----------|---------|----------|---------|---------|-------------------
```
基本都保持 100% 了

接下来就到了重构的环节啦！

### 重构

#### 替换常量
#### 提炼函数
#### 修改变量





