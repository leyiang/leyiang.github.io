---
title: "KMP Algo"
date: 2024-04-24T12:03:30+08:00
---

# 0x00 缘起

又来欣赏艺术了，今天的主角是[KMP](https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm)

**K**nuth–**M**orris–**P**ratt algorithm, 又看到Knuth大佬了，[TAOCP](https://www-cs-faculty.stanford.edu/~knuth/taocp.html)的作者，图灵奖的获得者。

KMP算法旨在提供一种O(m+n)的模式匹配算法，这个算法的想法其实很符合直觉，算是挺简单的。看了看原理的介绍，就直接上手写了，结果调了几个小时才弄好...

没有吸取到经验的错误，不是个好的错误。

调了几个小时的原因主要是：
1. 对算法的各种条件，各种边界并不很熟悉，写出代码就在猜各种参数。以后写代码之前，必须在之上走几遍，对边界情况要有清晰的认识。
2. 对于算法的核心：`next`数组并不理解, 相当然的以为是我以为的，很多次在写到一半时才发现，我理解的和题义根本不符！还是要认真审题。

# 0x01 原理
给定字符串S="abababab", target="ab", 输出target在S中的index

### 遍历所有可能
```python
for i in range(len(S)):
    s = S[i]
    flag = True
    for ch in target:
        if ch != s:
            flag = False
            break
    return flag
```
这个方法在最好情况下，复杂度为O(n), 如 S="abcd", target="ttt"
两个字符串之前没有交集，比对了一次就退出了。

但对于最差的情况，如 S="aaacaaab", target="aaab"，复杂度为O(m*n)

### 优化
对于情况 S="abbaabbaaba", target="abbaaba", 我们很容易就能想到，中间有那么多重复的aaaa, 是不是能跳过一些比较呢？

第一次比较：
```python
a b b a a b b a a b a
a b b a a b a

a和b不同，break，从S的下一个字符开始
```

对于第一次比较来说，我们得到了两个信息:
1. S和target第7位不同
2. **S和target前6位是一模一样的**

```python
我们完全可以跳过一些字符，从这里(*处)开始比较：
            *
a b b a a b b a a b a
        a b b a a b a
```

为什么可以跳呢？我们仔细看：

```python
                x
(a b) b a (a b) b a a b a
(a b) b a (a b) a
```

在比较出错(a,b) 的前面，都是相等的，而要搜索的字符串，它的前缀(ab)和后缀(ab)是一样的。
所以，我们可以把要要搜索的字符串直接移到后面：

```python
从*处继续比较
                *
(a b) b a (a b) b a a b a
          (a b) b a (a b) a
```

这就是整个算法的核心，怎么样，是不是很符合直觉，也很简单？
(第一遍看不懂很正常，多看几遍，直到能理解为止)

上述的优化，关键是要知道：在比对字符串发生错误的地方(x处)，它左半部分的，相同的前缀、后缀的最大长度是多少。
举例：
```python
                  x
[(a b) b a (a b)] a

第一次比较是在a处出错的，它左半部分, 方括号里, 前缀=后缀的最大长度是2,也就是(a b)
```

所以算法的第一步，就是计算出这些“最大前后缀长度”, 这个有些人叫LPS, 有些人叫next array

```python
对于要搜索的字符串：abbaaba来说，它的LPS为：
LPS[0] = "a"的前后缀最大长度 = 0，有些朋友可能要说了，a同时是自身的前缀和后缀，为什么这里最大长度不是1,而是0呢？
因为：任何字符串都是其自身的前缀和后缀，这个最大长度不能算进去，它没给我们任何信息。

LPS[1] = "ab"的前后缀最大长度 = 0
LPS[2] = "abb"的前后缀最大长度 = 0
LPS[3] = "abba"的前后缀最大长度 = 1 因为"a"="a"
LPS[4] = "abbaa"的前后缀最大长度 = 1
LPS[5] = "abbaab"的前后缀最大长度 = 2,因为"ab"="ab"
```

好了，到这里，我觉得你已经掌握了实现KMP的核心知识了，想办法实现一下吧。（可能复杂度到不了O(m+n)，后面会有优化）


### 使用LPS
现在我们计算好了LPS, 要在比较中使用它了。

方法：
```python
haystack: 草堆，要被搜索的大字符串
needle: 针，要在草堆里找到的小字符串

遍历haystack的每个字符
    字符和needle的第一个字符相等的话：
        比较下一个字符
    不相等的话：
        现在比较的是needle的第0个字符吗？
            是：  让haystack往前去一个字符
            不是：让needle去到LPS[当前字符位置-1]
    当前needle的位置是不是最后？
        是：成功找到了一个位置
        needle回到LPS[倒数第二个字符的位置]
        ^ 解释：(重新看看倒数第二个位置的LPS, 继续比较下去，记住：0-倒数第二都是相同的)
```

### 快速求出LPS
求出LPS最简单（也最慢）的方法是：
```python
m = len(target)
for k in range(len(target)):
    for i in range(m, 0, -1):
        if target[0:i] == target[m-i+1:m+1]:
            LPS[k] = i
```
显然是个O(m^2)的实现

如何优化呢？仔细观察：
```python
getLPS("a") = [0] #一个字符，其LPS为0
getLPS("ab") = [0, ?]
这里的问号就是b的LPS,它的值是什么呢？它是否与前缀相等？不等，所以其LPS就是0,要是等于，就是0+1

getLPS("abc...abc"), LPS为: [0,0,0,...,1,2,?]
这里的问号就是最后一个c的LPS,它的值是什么呢？
看其与 target[2]是否相等，如果是，LPS为2+1，这个2是哪儿来的？
就是问号前面一个LPS,这个LPS=2代表什么？ "abc...ab" 这个字符串中，前缀=后缀的最大长度是2
所以，要获取后一位字符的LPS,看前一位LPS指向的字符，如果相等，最大长度+1


那如果不等于呢？
getLPS("abc...abd"), LPS为: [0,0,0,...,1,2,?]
这里的问号是什么呢？
首先不可能是3,因为不相等
难道是0吗？也不对，万一字符是："abc...aba"呢？这里c和a也不相等,但其LPS显然不是0
答案是：不知道。不知道问号里该放什么。所以我们得试。一个个试。
那怎么试呢？
这个最末位的字符有可能会是某个前缀的后缀，所以，前缀出现在...左边，后缀出现在...右边
等等，"ab"和"ab"不是相同的吗？所以只需要检查左边，会不会出现问号对应的字符d,即可
我们找到LPS问号左右的值：2,这个2的含义是什么？LPS最长为2
2-1, 就是其对应的前缀字符的位置。
那么好了，我们就要检查从0到(2-1), 之间有没有和问号对应字符d相同的
因为是求最大长度，所以从大到小找，找到0了，还没有，就确定问号是0了

我们现在确定的任务是：从(2-1)到0,找有没有d出现。这当然不是个定值，把(2-1)用r替代
我们让r=LPS[r]即可，也就是LPS[问号前一个字符的LPS-1]
想想LPS[r]的含义，左半边的最长相同前后缀。
如果它是0的话，说明没有相同前后缀，问号对应的字符和target[0]比较即可
若不是0,就比较target[LPS[r]]和问号对应的字符，不对的话继续缩小，找到对应前缀，或到0为止
 
 ---
解释了这么多还没解释清楚，这个点我也没有完全理解，后面再填坑吧。
```

```python
cur = 0 #前一位的LPS
for i in range(1, m):
    while cur > 0 and target[cur] != target[i]:
        cur = LMS[cur - 1]

    if target[cur] == target[i]:
        cur += 1
        LMS[i] = cur
```

# 0x02 实践出真知
怎么样？看起来还行吧？想动手试试的话，推荐下面几个题目：
+ [Longest Happy Prefix](https://leetcode.com/problems/longest-happy-prefix/), 这道题和求next array的过程一模一样
+ [Find the Index of the First Occurrence in a String](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/description/)，然后就可以试着写完整的KMP了
+ [P3375 【模板】KMP](https://www.luogu.com.cn/problem/P3375)，完整形态
+ [Number of Subarrays That Match a Pattern II](https://leetcode.com/problems/number-of-subarrays-that-match-a-pattern-ii/) 一个KMP变形问题