---
title: "The Euclidean Algorithm"
date: 2024-01-25T21:34:40-05:00
math: true
---

## 0x00 最大公因数

两数 $$a, b$$ 的最大公因数指的是：能被$$a,b$$同时整除的因子中最大的一个

令$$g$$为 $$a,b$$的最大公因数，记作$$g=\gcd(a,b$$)

## 0x01 有用的性质
$$g=\gcd(a,b)$$, $$a$$ 和 $$b$$ 可以写作 $$a=gm, b=gn$$

其中$$m,n$$互质 (若mn有公因子，提出来后和g相乘，g就不是最大公因数)

$$a-b=gm-gn=g(m-n)$$

对于a,b两数的最大公因数g，也一定是a-b的因子

那么，g是不是b, a-b的最大公因子呢？

## 0x02 证明g是a-b与b的最大公因子

已知mn互质
$$b=g*n, a-b=g(m-n)$$,只要证明(m-n)与n互质，就可证明g是a-b与b的最大公因子

用反证法：假设(m-n)与n不互质，则(m-n)与n必有一个因子t

$$n=tx, (m-n)=ty$$, 把$$n=t*x$$代入

$$m-tx=ty \\ m = ty+tx, \\ m=t(x+y) \\ n=t$$x

此时我们发现m与n有公因子t,与已知其互质相矛盾。

则(m-n)与n必定互质

g必定是a-b与b的最大公因数

## 0x03 怎么用?
要求简单数字的最大公因数很简单，可能一眼就能看出来

但对于超级大的数字来说，就没那么简单了。

根据上述性质，我们知道，对于a,b的gcd,同样是b与a-b的gcd

那么我们就可以把复杂问题简化，对于两个超级大的数字a和b,（假设a>b）

我们只需找 b和a-b的最大公因数即可...就这么递归减下去，减到b与a-b相等即可

两个相等的数的gcd,就是自身喽

## 0x04 例子
假设，要求 20 与 15 的gcd

=>只求 15 与 5的gcd即可

=>只求 5 与 10的gcd即可

=>只求 5 与 5的gcd即可

则，20 与 15的最大公因数是 5

## 0x05 更进一步
上述方法，叫作[the subtraction-based version](https://en.wikipedia.org/wiki/Euclidean_algorithm#cite_ref-23)

目前最常见的形式，是把减法用求余代替

gcd(a, b) = gcd(b, a mod b)

证明方法类似，此处略

```javascript
function gcd(a, b)
    while b ≠ 0
        t := b
        b := a mod b
        a := t
    return a
```
