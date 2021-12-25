---
layout: post
title: "使用 Jekyll 作为博客的解决方案"
tags:
 - writing
 - share
---

# 0x00 写博客的原因
+ 自身影响力
    + 信息时代下，想要提高自己的影响力就要不断的输出观点。输出观点有两种方式，一种是说，一种是写。不擅长说，那就从写开始。
+ 提高文字能力
    + 对一件事或物进行精确且简短的描述，是团队合作中个体需要掌握的能力。
+ 对不常用知识点备份
    + 前段时间做的项目需要 LightDM 的相关知识，做完一段时间再回头来维护时，发现很多踩过的坑都没记住，又都踩了一遍。所以对知识点进行备份，是有必要的。
+ 帮助他人
    + 在很多接触新问题的时候，一篇文章或一个回答能节省我很多时间；也能通过作者补充的其它信息对所需研究的问题有更深的理解。我相信我的文章也能给部分人带来帮助。


# 0x01 选择 Github Pages + Jekyll 的原因
技术人员在写博客一般有三种选择：
+ 自建服务器，使用相关博客CMS（Wordpress、Typecho）
    + 对博客的掌控力最高，但需要自己维护、安装，自己去解决各种问题，包括但不限于：服务器的费用问题、博客有漏洞的补丁问题、服务器被黑了排后门的问题。
+ 使用现有的博客平台（Medium、掘金、简书、Github Issues）
    + 最简单的写作方式，只需要管自己写。SEO、服务器都不是问题。但博客在第三方平台上，平台有权决定页面布局，是否添加广告，在节日是否添加活动弹窗等，对博客的掌握最弱。
+ 使用静态博客框架（Jekyll、Hexo）+ 静态网站托管服务（Github Pages）
    + 相对省心且对博客有掌握力，使用 git 仓库同步文章，每台运行 git clone 的机器上都会有备份，降低丢失概率。Push 到 Github 上会照常加绿色方块，对 Github全绿患者非常友好：）。

综上所诉，选择 Github Pages + Jekyll。

# 0x02 优化写作流程 
Jekyll 新建每一篇 Post 都需要自己创建文件并且按`年-月-日-文章url.md`的格式去命名，每个文件中还会有一些固定的字段，类似 title、tags。每次创建文章都需要手动复制粘贴。
除此之外，Jekyll 对于图片也没有特别好的管理，所有图片都放一个文件夹？或是创建文章的时候同时创建一个对应文章的图片文件夹？在插入图片的时候把文件相对路径写上？
    
一番搜索后找到两位前辈的方案：[INCLUDING AND MANAGING IMAGES IN JEKYLL](https://eduardoboucas.com/blog/2014/12/07/including-and-managing-images-in-jekyll.html) 和 [CREATE JEKYLL POSTS FROM THE COMMAND LINE](https://gist.github.com/ichadhr/0b4e35174c7e90c0b31b)

优化后即可通过 `thor jekyll:new 文章名称` 命令创建 Post 文件及图片文件夹。
{% raw %}
如需要插入图片使用 `{% include image name="img.png" caption="Image Caption" %}`
{% endraw %}

修改过的 jekyll.thor
```ruby
require "stringex"
class Jekyll < Thor
  desc "new", "create a new post"
  method_option :editor, :default => "subl"
  def new(*title)
    title = title.join(" ")
    date = Time.now.strftime('%Y-%m-%d')
    filename = "_posts/#{date}-#{title.to_url}.markdown"
    foldername = "assets/posts/#{date}-#{title.to_url}"

    if File.exist?(filename)
      abort("#{filename} already exists!")
    end

    puts "Creating new post: #{filename}"
    open(filename, 'w') do |post|
      post.puts "---"
      post.puts "layout: post"
      post.puts "uri: #{date}-#{title.to_url}"
      post.puts "title: \"#{title.gsub(/&/,'&amp;')}\""
      post.puts "tags:"
      post.puts " -"
      post.puts "---"
    end

    puts "Creating new folder: #{foldername}"
    Dir.mkdir(foldername)
  end
end
```

`_includes\image` (无后缀名)

{% raw %}
```html
{% capture imagePath %}{{ page.uri }}/{{ include.name }}{% endcapture %}
{% if include.caption %}
<figure>
    <img src="/assets/posts/{{ imagePath }}" {% if include.alt %} alt="{{ include.alt }}" {% endif %} {% if include.width %} width="{{ include.width }}" {% endif %}/>
    <figcaption>{{ include.caption }}</figcaption>
</figure>
{% else %}
<img src="/assets/posts/{{ imagePath }}" {% if include.alt %} alt="{{ include.alt }}" {% endif %} {% if include.width %} width="{{ include.width }}" {% endif %}/>
{% endif %}
```
{% endraw %}

这里有个坑，img 和 figure 前不能有tab，否则会被 markdown 解析成 code 标签
# 0x03 使用国内CDN提高 Github Pages 的速度
（TODO）