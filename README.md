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

大师级别的程序员把系统当做故事来讲，可读性是关键所在！

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
首先，先介绍下我们要重构的项目 Length

美国⼈习惯使用很古怪的英制度量单位。英制度量单位的转换经常不是⼗进制的，比如说:

- 1 英尺(foot) = 12 英寸(inch)
- 1 码(yard) = 3 英尺(foot)

请你写一个程序，用于处理英寸、英尺、码之间的转换。例如：

- 1 英尺应该等于 12 英寸
- 1 码应该等于 36 英寸
- 1 英寸应该等于 1/36 码

### 实现代码
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
### 识别坏味道
看完上面的代码什么感觉？ 先感受感受在往下看

有没有感觉到可读性很差？

1. 变量命名不清晰
2. parseTo() 函数逻辑过长警告
3. 重复的字符串

是不是有的小伙伴感觉，问题也不是很大呀。50 行代码都不到，不叫事

而事恰恰就会出现在这个时候，每个大问题都是由小问题堆砌造成的，越来越不清晰的代码将导致维护成本直线上升。

要时刻小心破窗理论
> 此理论认为环境中的不良现象如果被放任存在，会诱使人们仿效，甚至变本加厉。一幢有少许破窗的建筑为例，如果那些窗不被修理好，可能将会有破坏者破坏更多的窗户。最终他们甚至会闯入建筑内，如果发现无人居住，也许就在那里定居或者纵火。一面墙，如果出现一些涂鸦没有被清洗掉，很快的，墙上就布满了乱七八糟、不堪入目的东西；一条人行道有些许纸屑，不久后就会有更多垃圾，最终人们会视若理所当然地将垃圾顺手丢弃在地上。

也许这时候你就要跃跃欲试要改代码了，别着急，在修改代码之前我们还有另外一项很重要的前置工作

### 增加安全网
没有测试的重构就是在耍流氓。我们怎么能保证重构后的逻辑是否和之前的行为一致呢？

为了保证和之前的行为一致，那么我们就需要验证。

而这就是我们需要添加测试的原因所在

换言之没有测试你就无法保证你的重构是安全的、正确的

依据我的从业经验来看，百分之80的项目都没有测试，所以我们先演示一下如何添加测试

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

然后添加一下代码来测试 jest 是否安装成功

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


### 完善测试
首先我们需要在详细的阅读下项目需求，然后增加测试覆盖率，完善安全网

#### 1 英尺应该等于 12 英寸
先补齐这个测试
```
  test('1 英尺应该等于 12 英寸', () => {
    const length = new Length(1,"f").parseTo("inch");
    expect(length.getVal()).toBe(12)
  })
```
在阅读代码的时候发现这个 parseTo 应该是用作转换单位的。
> 技巧：带着问题或者疑问阅读代码

然后带着我们的问题写出对应的测试代码来验证是否是正确的。 

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

ok 通过 

测试帮助我们验证了之前的问题

通过测试结果，我们应该可以得到一个十分明确的结论

初始化一个单位后，通过 parseTo 函数进行单位转换，得到对应的值

刚刚是英尺转英寸，还能再扩展出 英尺转码（yard）

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

##### 重构
写完测试后，我们需要停一下，看看代码是不是清晰可读的、没有重复的。上面的测试逻辑是检测 2 个 Length 是否相等。但是从代码上并没有很直观的表达出来，所以我们重构一下
```
// index.test.js
  test("如果没有对应的转换单位应该返回当前单位", () => {
      const val = 1;
      const unit = "yard"
    - const length = new Length(1,"yard").parseTo('mi');
    - expect(length.getVal()).toBe(val)
    - expect(length.getUint()).toBe(unit)
    + const length = new Length(val,unit);
    + const newLength = length.parseTo("mi");
    + expect(length.equal(newLength)).toBeTruthy()
  });
```
```
// index.js
 + equal(length){
 +   return this.value === length.getVal() && this.unit === length.getUnit();
 + }
```
新增 equal 函数，这样我们一眼就能看出代码的意图所在。


#### 测试覆盖率

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


### 提取字符串常量

目前为止，我们应该能发现一个特别明显的重复：表示"单位"的字符串在多处，这里就是很明显的"重复代码"

这里要强调一下

测试代码和生产代码一样重要 

测试越脏，代码就会变得越脏 最终将会丢失测试,代码开始腐坏

所以测试代码也在我们的重构范围之内

那我们开始吧

记住重构的重点是要小步骤

我决定先把 "yard"、"inch"、"f" 修改成常量

步骤：

1. 先创建常量
```
// index.js
const YARD = "yard"；
```
2. 跑下测试

```
yarn test
```

这里要特别说明一下，可能有的同学会有疑惑这里的操作这么小，有必要还跑测试吗？ 

有必要

如果我们保证每一个步骤都是没有问题的话，那么我们就可以做到不需要调试代码。

当发现修改完之后测试跑不通的时候，立马回退代码

因为我们的每一个步骤都足够的小，并且也能保证回撤后一定是能跑通测试的

3. 利用全局搜索

使用 shift + command + f 打开搜索栏
在搜索栏输入 'yard'
在替换栏输入 YARD
> vscode 开发

![](https://user-gold-cdn.xitu.io/2020/2/5/17013a391a9cf39e?w=818&h=634&f=jpeg&s=80679)

可以看到红圈部分提示可以替换所有（指的是 index.js ）文件

我们点击，替换 index.js 所有的 'yard'

通过 IDE 来修改要比我们手工一个一个的修改要安全的多

还有一个点，我们必须熟练使用快捷键

快捷键的使用能帮助我们提高效率

4. 跑下测试
```
yarn test
```
是的，我们修改完了之后继续跑下测试，保证每一个步骤都是安全的

如法炮制

我们利用上面的步骤把剩下的 "inch" 和 'f' 也都重构掉

最终我们的代码应该是这样的

```
// index.js
const YARD = "yard";
const F = "f";
const INCH = "inch"

……

parseTo(u) {
      let len = this
      if (this.unit === YARD) {
        if (u === F) {
          len = new Length(this.value * 3, u)
        } else if (u === INCH) {
          len = new Length(this.value * 36, u)
        }
      }
  
      if (this.unit === INCH) {
        if (u === YARD) {
          len = new Length(this.value / 36, u)
        } else if (u === F) {
          len = new Length(this.value / 12, u)
        }
      }
  
      if (this.unit === F) {
        if (u === YARD) {
          len = new Length(this.value / 3, u)
        } else if (u === INCH) {
          len = new Length(this.value * 12, u)
        }
      }
  
      return len
    }
```

这时候我们已经把生产代码里面的重复的字符串都修改成常量了

接下来我们用相同的重构手法去处理测试文件 index.test.js 

在我们开始重构的时候应该就能发现第一个问题

我们之前声明的常量是在 index.js 内的，这里我们需要复用这些常量

所以我们创建 consts.js 文件来统一声明常量

```
// consts.js
export const YARD = "yard";
export const F = "f";
export const INCH = "inch"
```

接着去修改 index.js 文件

```
+ import { YARD, F, INCH } from "./consts";
- const YARD = "yard";
- const F = "f";
- const INCH = "inch"
```

跑下测试
```
yarn test
```
ok 测试通过 我们继续去处理 index.test.js 吧

```
// index.test.js
+ import { YARD, F, INCH } from "./consts";
```

重构后的 index.test.js
```
import { Length } from "./index";
import { YARD, F, INCH } from "./consts";
describe("Length", () => {
  test("getVal", () => {
    const length = new Length(100);
    expect(length.getVal()).toBe(100);
  });

  test("1 英尺应该等于 12 英寸", () => {
    const length = new Length(1, F).parseTo(INCH);
    expect(length.getVal()).toBe(12);
  });

  test("9 英尺应该等于 3 码", () => {
    const length = new Length(9, F).parseTo(YARD);
    expect(length.getVal()).toBe(3);
  });

  test("24 英寸应该等于 2 英尺", () => {
    const length = new Length(24, INCH).parseTo(F);
    expect(length.getVal()).toBe(2);
  });

  test("36 英寸应该等于 1 码", () => {
    const length = new Length(36, INCH).parseTo(YARD);
    expect(length.getVal()).toBe(1);
  });

  test("1 码应该等于 3 英尺", () => {
    const length = new Length(1, YARD).parseTo(F);
    expect(length.getVal()).toBe(3);
  });

  test("1 码应该等于 36 英寸", () => {
    const length = new Length(1, YARD).parseTo(INCH);
    expect(length.getVal()).toBe(36);
  });

  test("如果没有对应的转换单位应该返回当前单位", () => {
    const val = 1;
    const unit = YARD;
    const length = new Length(1, YARD).parseTo("mi");
    expect(length.getVal()).toBe(val);
    expect(length.getUint()).toBe(unit);
  });
});
```
至此，我们已经把生产代码和测试代码内的重复字符串全部替换为常量了。这里应该可以初步体会到重构了吧。我们通过每一个安全的小步骤来一点点的重构完。如果你只能记住一句话，那就是小范围修改代码，完事立马运行测试！

### 修改命名
可以发现 "f" 这个命名是没有明确的含义的。

有意义的命名是可读代码的重要前提。

因为有了我们之前的铺垫，这次重构会非常的简单

打开 consts.js 文件

选中 F 然后按下 F2 全局重命名快捷键

着时候在弹出的输入框输入新的名称 FOOT

```
// consts.js
+ const FOOT = "f"
- const F = "f"
```
跑下测试
```
yarn test
```
ok 没有问题

着时候我们发现所有的文件里面的 F 都变成了 FOOT

接着我们把 'f' 也修改一下

```
- const FOOT = "f"
+ const FOOT = "foot"
```
跑下测试
```
yarn test
```
#### 总结

利用好快捷键，可以让我们的重构效率高的起飞

### 提炼函数

#### 提炼isUnit 
让我们在聚焦到 parseTo() 函数上
```
if (this.unit === YARD) {
     if (u === FOOT) {
        ……
     }else if(u === INCH){
         ……
     }
```
会发现这里判断是否为某个单位的时候用了大量的 if 语句，缺乏表达力。我们通过重构来让代码更易读

通过之前的添加测试我们已经很清楚了，一共有 3 个不同的单位可以互相转换

所以先增加判断是否为具体某个单位的函数
```
// index.js

  isYard(unit){
      return unit === YARD;
  }

```
通过函数名我们一眼就能看出这是检测是否为 yard 的处理

跑下测试
```
yarn test
```

接着我们替换第一个 if 语句
```
- if (this.unit === YARD) {
+ if (this.isYard(this.unit))
     if (u === FOOT) {
        ……
     }else if(u === INCH){
         ……
     }
```

跑下测试
```
yarn test
```
如法炮制

我们把剩下所以的 if 语句都替换掉，千万要记得，每进行一步都要跑下测试哟。

看下我们重构后的代码吧
```
  isYard(unit){
      return unit === YARD;
  }

  isFoot(unit){
      return unit === FOOT;
  }

  isInch(unit){
      return unit === INCH;
  }

  parseTo(u) {
      ……
  }

```
有没有感受到我们的代码在一点点的变好

而且很重要的点就是你可以随时停下来。

因为你的代码是一直在可运行的状态。

所以有的小伙伴说我需要2天重构代码，真不好意思，你那不叫重构，叫重写 - -#

#### 提炼计算函数
我们现在应该很明确的知道 parseTo 函数是同时处理了 3 种单位的转换

在《代码整洁之道》函数一章里面提到，好的函数应该是尽可能小的，一个函数只做一件事。

所以这里我们要把每一个单位转换的逻辑都提炼到对应的函数内

我们先创建新的函数
```
  parseYard(u){
      if (this.isFoot(u)) {
        len = new Length(this.value * 3, u);
      } else if (this.isInch(u)) {
        len = new Length(this.value * 36, u);
      }
  }
```
接着跑下测试

```
yarn test
```

继续 把之前的逻辑替换为调用新的函数

```
    if (this.isYard(this.unit)) {
    //   if (this.isFoot(u)) {
    //     len = new Length(this.value * 3, u);
    //   } else if (this.isInch(u)) {
    //     len = new Length(this.value * 36, u);
    //   }
    +    return this.parseYard(u)
    }
```

跑下测试
```
yarn test
```
测试失败了！
```
● Length › 如果没有对应的转换单位应该返回当前单位

   TypeError: Cannot read property 'getVal' of undefined

       7 | 
       8 |   equal(length){
    >  9 |     return this.value === length.getVal() && this.unit === length.getUnit();
         |                                  ^
      10 |   }

Test Suites: 1 failed, 1 total
Tests:       1 failed, 7 passed, 8 total
```
通过测试给我们的反馈，可以意识到问题应该是出在返回的并非是 length 对象。

因为我们的步骤很小，所以我们能很快的把问题锁定在新加的函数 
parseYard() 上

仔细看一下逻辑，发现如果 2 个 if 都没有匹配的话，那么就会返回 undefined 。而通过我们的测试提示，如果没有对应的转换单位应该返回当前单位，所以这里我们应该返回当前的 length 对象
```
  parseYard(u){
      if (this.isFoot(u)) {
        return new Length(this.value * 3, u);
      } else if (this.isInch(u)) {
        return new Length(this.value * 36, u);
      }
    +   return this;
  }
```
跑下测试 
```
yarn test
```
通过啦。

现在我们应该可以进一步的体会到小步骤和安全网的好处了吧。如果测试失败那么我们能很快的定位到问题。

看，我们根本不需要调试代码。

如法炮制 

把剩余的逻辑也都重构完

最终的代码如下
```
  parseYard(u) {……}

  parseInch(u) {……}

  parseFoot(u) {……}

  parseTo(u) {
    if (this.isYard(this.unit)) {
      return this.parseYard(u);
    }

    if (this.isInch(this.unit)) {
      return this.parseInch(u);
    }

    if (this.isFoot(this.unit)) {
      return this.parseFoot(u);
    }
  }
}
```
重构到现在代码的可读性已经很好啦。如果这里后续要增加更多的单位转换的话，那么可以通过重构扩展为多态来解决。

三次法则

第一次做某件事时只管去做；第二次做类似的事会产生反感，但无论如何还是可以去做；第三次再做类似的事，你就应该重构。

正如老话说的：事不过三，三则重构

我认为重构可以很好的平衡设计过度，我们只要遵循三次法则。

因为我们有足够的测试，当代码开始散发出坏味道的时候，我们及时的去重构即可。这样既避免了设计过度，也避免了代码腐烂。


## 总结
我通过一个实际的项目展示了如何进行重构。首先我们先构建安全网，然后通过识别坏味道+小步骤+频繁的运行测试+ide 来快速安全的进行重构。
我们可以随时停下来，因为我们的代码是一直可工作的。

希望这篇文章能让你对"重构怎么做"有一点感觉。

这个示例告诉我们最重要的一点就是重构的节奏。

小步子，并且保证每一步都处于编译通过和测试通过的可工作状态

开展高效有序的重构，关键的心得是：小的步子可以更快前进，请保持代码永远处于可工作状态，小步修改积累起来也能大大改善系统的设计

> 当然，这个实例仍有值得改进的地方，但现在测试仍能全部通过，代码相比初见时已经有了巨大的改善，所以我已经很满足了

## 参考
- 《重构 - 改善既有代码的设计》
- 《代码整洁之道》

### vscode重构快捷键
- 找到所有的引用： Shift+F12
- 同时修改本文件中所有匹配的： Ctrl+F12
- 重命名：比如要修改一个方法名，可以选中后按F2，输入新的名字，回车，会发现所有的文件都修改了
- 跳转到下一个 Error 或 Warning：当有多个错误时可以按 F8 逐个跳转