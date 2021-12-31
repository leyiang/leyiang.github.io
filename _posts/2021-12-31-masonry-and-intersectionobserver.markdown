---
layout: post
uri: 2021-12-31-masonry-and-intersectionobserver
title: "瀑布流与 Intersection Observer"
tags:
 - js
---

# 0x01 瀑布流(Masonry)

最近在研究瀑布流布局，调查一番发现有[许多实现方式](https://css-tricks.com/piecing-together-approaches-for-a-css-masonry-layout/)。权衡一下最终还是选择了 JS + transform 定位去实现。

+ 能够按行排序
+ transform + transition 在拖动时展示动画比较方便
+ 与其它方式相比效果更好，兼容也更好

原理：先把第一行铺满，接着找最短的一列添加新图片，直到所有图片都添加完毕。

# 0x02 图片加载

`瀑布流`一般与`无限滚动`相互搭配，每次从后台取一定量的图片，滚动条快到底后再次请求。这里最好是后台返回时就把图片的大小给返回。

否则需要前端去判断图片大小，会带来无法妥协的体验问题。图片需要 `load` 后才能获取大小，一般有两种做法：

+ Promise.all 等待所有图片加载完毕后再添加到DOM中

  问题在于图片较多以及加载速度较慢时，会带来较长的等待时间
  
+ 加载完一张图片直接添加到到DOM中

  顺序会乱，与技术选型的条件相悖

# 0x03 Intersection Observer

{% include image name="load-show.png" caption="加载展示" %}

使用`Intersection Observer`监听`瀑布流Container`下方的 div，如果在可视范围内，则拉取新图片。但问题在于`Intersection Observer`在一开始只会触发一次，`callback`中动态添加了图片我们无法确定图片是否多到让滚动条出现，从而可以正常触发滚动逻辑。

所以在 Observer 的 Callback 中，需要添加相关逻辑
```js
/**
 * If there's still blank area in first page
 */
if( entries[0].isIntersecting && false ) {

    /**
     * Un-observe scroll-notify element
     */
    io.unobserve( scroll );

    /**
     * After a period of time, re-observe it
     * So the intersection observer callback will be triggered to add more images
     */
    setTimeout(() => {
        io.observe( scroll );
    }, 100 );
}
```

# 0xFF 更多阅读
+ [Approaches for a CSS Masonry Layout](https://css-tricks.com/piecing-together-approaches-for-a-css-masonry-layout/)
+ [Magic-Grid](https://github.com/e-oj/Magic-Grid)
+ [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)