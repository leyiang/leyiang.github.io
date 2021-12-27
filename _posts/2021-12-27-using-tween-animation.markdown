---
layout: post
uri: 2021-12-27-using-tween-animation
title: "JS 中使用补间动画"
tags:
 - js
 - animation
 - tween
---

# 0x00 前言
在没接触`tweening`概念之间，Canvas 动画是个很另人头疼的事。

如果想让方块从A点到B点，则需要在 requestAnimationFrame 中每帧让方块的`x`与`y`属性进行`dx`与`dy`的偏移。在每帧还需要去判断它的位置有没有到达B点，更糟糕的是它很难控制`duration`，想控制的话需要去计算`dx`与`dy`的值，代码非常耦合。

前段时间用`Three.js`的时候发现它对于动画的处理借助了`Tween.js`，了解后发现补间动画很好的解决了我的问题。

# 0x01 补间动画
补间动画简单来说就是在两帧画面中添加过渡帧，另动画效果看起来更加顺畅。听起来很简单，那它究竟是怎么做到的呢？

```math
f(p) = from + (to - from) * p
```

意思是：要获得动画进行到p处某属性的值，用`最开始的值` + `开始到结束相差的值` * `动画播放的百分比`

假设需要 方块在`2`秒内从`(0, 0)`位移到`(100,0)`，想知道在第`1`秒时方块的位置：

```math
p = 1 / 2 = .5 = 50%;
x = 0 + (100 - 0) * .5 = 50
```

由此可得在第`1`秒处，方块的位置是`(50, 0)`，通过上面的式子，我们可以对所有数值属性添加动画

```js
tween.add({
    el: rect,
    keys: ['x', 'y', 'w', 'h'],
    to: [600, 400, 100, 100 ],
    duration: 2000
});
```
{% include image name="rect-basic-animation.gif" caption="补间动画对 x,y,w,h 补间" %}

除此之外，我们还可以添加缓动函数让动画完成不同效果。
```js
// 线性函数
const linear = p => p;

// 渐出
const quadOut = t => 1 - Math.pow( (p-1), 2 );
```

式子就变成：

```math
f(p) = from + (to - from) * ease(p)
```

{% include image name="rect-bounce-animation.gif" caption="Bounce Easing Function" %}

# 0xFF 更多阅读
+ [Easing Functions Cheat Sheet](https://easings.net/#)
+ [Tiny JS tweening library](https://github.com/LiikeJS/Liike)
+ [JavaScript/TypeScript animation engine](https://github.com/tweenjs/tween.js/)