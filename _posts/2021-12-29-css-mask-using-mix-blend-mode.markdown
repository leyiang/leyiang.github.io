---
layout: post
uri: 2021-12-29-css-mask-using-mix-blend-mode
title: "mix-blend-mode 实现任意形状蒙版"
tags:
- css
- trick
---

# 0x00 闲言少绪

`mix-blend-mode`的`screen`与`multiply`在使用得当的情况下，可以实现任意形状的蒙板效果。

> screen: multiplies the background and the content then complements the result. This will result in content which is brighter than the background-color.
> 
> multiply: the element is multiplied by the background and replaces the background color. The resulting color is always as dark as the background.

简单来说：`screen`可以把黑色变成透明，白色不变。 `multiply`可以把白色变成透明，黑色不变。原理很简单，但应用场景相对难找，我先列几个抛砖引玉。 

# 0x01 文字蒙板

{% include image name="gradient-title.gif" caption="渐变标题" %}

```html
<div class="container">
    <div class="backdrop"></div>
    <div class="content-container">
        <h1>...</h1>
    </div>
</div>
```

HTML 结构如上，backdrop 垫在底下，负责展示渐变。`h1`颜色设为`#FFF`，`content-container`上设置 `mix-blend-mode: multiply`即可。

{% include image name="video-title.gif" caption="视频标题" %}

文字已经镂空，展示视频也不在话下。或者更炫一点？

{% include image name="gradient-title-effect.gif" caption="特殊效果" %}

上述例子用SVG的蒙板同样可以做到，尚在思考孰优孰劣，欢迎一同交流。

# 0xFF 更多阅读
+ [mix-blend-mode](https://css-tricks.com/almanac/properties/m/mix-blend-mode/)
+ [headers-hover-demo](https://github.com/Cuberto/headers-hover-demo)