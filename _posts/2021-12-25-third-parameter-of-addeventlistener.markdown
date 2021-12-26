---
layout: post
uri: 2021-12-25-third-parameter-of-addeventlistener
title: "addEventListener 方法第三个参数的作用"
tags:
-
---

长话短说（TLDR）: 对不会冒泡的事件进行事件委托

# 0x00 前因
我需要完成一个效果：鼠标在进入某个 元素 时可以改变颜色、改变大小，显示文字，如下图所示

{% include image name="effect-showing.gif" %}

我的想法是小球由 DIV 构成，实时跟随鼠标，进入其它元素的效果由 html 定义。

```html
// 进入此按钮范围的时候，小球会加上`color`这个类，实现修改颜色
<button class="magnet" data-cursor="color">Change Color</button>

// 进入此按钮范围的时候，小球会设置 textContent 并修改大小
<button class="magnet" data-text="Click!">Set Text</button>
```

# 0x01 如何实现？
+ 在 init 函数执行时，select 所有带有 data-[支持的命令] 属性的元素，并给每一个元素加上事件。

    这种方式比较直观，但并不完美。当开发者添加了一个动态添加卡片的功能，并希望当鼠标移入时有相应的效果，此时我们就无法优雅地完成该需求。
  
+ 利用事件冒泡的原理，使用事件委托的形式实现

    这种方式能解决上述情况，但需要一定的学习成本。

# 0x02 事件委托绑定事件
JavaScript 中默认使用冒泡的事件捕捉方式，点击子元素，父元素也会被通知。请尝试点击 inner BTN 和 div (粉色区域) 并观察 console 中的信息。

{% include codepen id="QWqOBpE" %}
{% include image name="bubble.png" caption="事件冒泡" %}

所以我们需要做的，就是让开发者给定一个`container`，我们只对`container`绑定事件，然后通过`e.target`去判断属性。

进展顺利！那么我们如何判断鼠标进入呢？

第一个能想到的事件是`mouseover` 和 `mouseout`，尝试实现一下！

```js
this.container.addEventListener("mouseover", event => {
  const target = event.target;

  if( target.dataset.cursor ) {
    this.el.classList.add( target.dataset.cursor );
  }

  if( target.dataset.text ) {
    this.el.classList.add("text");
    this.text.textContent = target.dataset.text;
  }
});

this.container.addEventListener("mouseout", event => {
  const target = event.target;

  if( target.dataset.cursor ) {
    this.el.classList.remove( target.dataset.cursor );
  }

  if( target.dataset.text ) {
    this.el.classList.remove("text");
    this.text.textContent = "";
  }
});

```

{% include image name="mouseout-bug.gif" %}

简单的元素没有问题，但HTML只要稍微有一点嵌套，效果就会出问题。这是因为 mouseenter, mouseout 是通过焦点来判定的。

当鼠标在粉色区域时，浏览器判定 鼠标进入了 div，**一切正常**，但当鼠标移动到 Magnet Mouse 上的时候，浏览器判定焦点在按钮上，而不在 div 上，所以按钮会有一个`mouseover`, div 会收到一个 `mouseout`， 这就是效果出问题的原因，我们应该选择`mouseenter`和`mouseleave`，这才是更符合需求的事件。

# 0x03 问题
但问题在于，`mouseenter`和`mouseleave`是不会向上冒泡的，我们没法使用事件委托去完成该需求。这时候，终于到了本文的重点——addEventListener的第三个参数。

{% include image name="mdn-addeventlistener.png" caption="MDN 对第三个参数的描述" %}

历史上网景与IE对于事件的触发顺序有不同的看法

网景认为应当是：`body -> div -> button` (Capture)

IE则认为应当是：`button -> div -> body` (Bubble)

{% include image name="w3c-model.png" caption="W3C 事件模型" %}

而 W3C 则是：我全都要。我们可以通过 addEventListener 的第三个参数指定使用 capture 或 bubble。
在这里，`mouseenter` 虽然不会向上冒泡，但我们可以使用 capture 强行让 container 监听到子元素的 `mouseenter` 事件， 完美解决需求！
# 0xFF 更多阅读
+ [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
+ [事件顺序](https://www.quirksmode.org/js/events_order.html)