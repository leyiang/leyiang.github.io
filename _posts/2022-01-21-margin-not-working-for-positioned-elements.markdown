---
layout: post
uri: 2022-01-21-margin-not-working-for-positioned-elements
title: "定位元素的margin失效"
tags:
 - css
---


# 0x00 起因
之前研究`xy-ui`时碰到了这个组件(tip, pop-over)

{% include image name="tip-display.png" caption="xy-ui tip样式" %}

组件样式相对简单，不涉及三角形圆角和渐变背景，只需把三角和矩形拼在一起即可。

{% include image name="before.png" caption="::before 为矩形" %}
{% include image name="after.png" caption="::after 为三角" %}

# 0x01 问题
这是一个相对简单的组件，`::before` 的 content 设为 `attr(data-)` 接收tip文字，矩形和小三角调整好布局即可。

但进行复现的时候，还是碰到了意想不到的问题：

{% include image name="problem-showing.png" caption="问题展示" %}

三角由transparent的border实现，目前的定位用到了`bottom`与`transform`(图没截全，根据父元素定位)，现在需要让小三角向下偏移`12px`，以实现我们的需求。

直觉中 `margin-top: 12px` 很轻松就能完成，但问题在于，无论把`margin-top`设置到多少，该三角就是纹丝不动。感兴趣可以在下方的codepen中尝试。

{% include codepen id="qBPzxXJ" %}

# 0x02 最后

经过一番测试，发现在`bottom`设置过的情况下，`margin-top`不起作用。`left`设置过的情况下，`margin-right`不起作用。`top`和`right`也一样。

设置`margin-top: 12px` 不起作用，最后只能换成 `margin-bottom: -12px`。在网上冲浪时没有找到相关解释，等C++补好了去Chromium中找答案。

# 0xFF 更多阅读
+ [xy-tips](https://xy-ui.codelabo.cn/docs/#/xy-tips)