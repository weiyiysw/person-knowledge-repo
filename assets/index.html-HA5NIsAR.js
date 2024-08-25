import{_ as a}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as n,c as l,a as s,d as t,w as h,b as e,o as k,e as p}from"./app-CEs6gMf8.js";const r={},d=s("h1",{id:"工厂模式",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#工厂模式"},[s("span",null,"工厂模式")])],-1),A=e(`<p>工厂模式是一种创建型模式，也是很常见的模式之一，我们在很多开源项目里都可以看得到。</p><p>在了解工厂模式之前，我们先来了解下简单工厂模式。</p><h2 id="简单工厂模式" tabindex="-1"><a class="header-anchor" href="#简单工厂模式"><span>简单工厂模式</span></a></h2><p>简单工厂模式并不是23种设计模式之一，但是在了解工厂模式前有必要先理解简单工厂模式，这有助于我们理解工厂模式，也了解二者之间的区别。</p><p>简单工厂模式，是指我们有一个抽象的产品接口，有一系列产品实现了这个抽象接口。我们使用一个工厂类来管理创建对象，创建哪个产品则交由使用者指定。</p><p>简单工厂的UML图如下：</p><img src="https://www.plantuml.com/plantuml/svg/SoWkIImgAStDuShCAqajIajCJbK8ACfFAKqkyOG9S2Nd91ONmuGT5J9p2t9ISrFpIee9A7KYNgbROd99Vb6bGZKN9xf2XUIYrCIILAYmXYPNBHSNcYxTqW8zFJku2_5BEt4vfEQb0BqC0000" alt=""><div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" data-title="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;"> ProductFactory</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> static</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;"> ProductInterface</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> createProduct</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;">String</span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;--shiki-light-font-style:inherit;--shiki-dark-font-style:italic;"> name</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">        if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> (</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;ProductA&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">equals</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(name)) {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">            return</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> ProductA</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        } </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">else</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> if</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> (</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;ProductB&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">equals</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(name)) {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">            return</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> ProductB</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        } </span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">else</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">            throw</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> RuntimeException</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;Not support Product&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">)</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">        }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">}</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;"> </span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;"> Demo</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> main</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;">String</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">[] </span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;--shiki-light-font-style:inherit;--shiki-dark-font-style:italic;">args</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;">        ProductInterface</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;"> product</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> =</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;"> ProductFactory</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">createProduct</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#50A14F;--shiki-dark:#98C379;">&quot;ProductA&quot;</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">);</span></span>
<span class="line"><span style="--shiki-light:#A0A1A7;--shiki-dark:#7F848E;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">        // use product do sth</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看出，通过传参，工厂类知道如何创建对应的产品。在Demo了的调用中，传入产品名称，即可获取到产品对象，然后就可以使用产品对象做一些操作了。</p><p>如果需要增加一种产品C，我们需要让产品C实现ProductInterface接口。然后，再修改简单工厂里createProduct方法，增加一个if分支。而这违反了开闭原则，对修改关闭、对扩展开放。</p><p>注意：由于使用接口，操作需要再接口中定义。</p><h2 id="工厂模式-1" tabindex="-1"><a class="header-anchor" href="#工厂模式-1"><span>工厂模式</span></a></h2><p>了解了简单工厂模式后，使用工厂创建对象我们需要传入指定类型。工厂模式则是针对每一个不同类型的对象提供一个工厂类来创建。</p><p>也就是说定义了一个抽象工厂类，定义一个抽象创建方法，由子类工厂来创建对应的产品。这样就避免了简单工厂的弊端，需要指定类型来创建对象。</p><p>使用工厂模式，我们通过引入抽象工厂类，在新增产品C的时候，需要同时增加产品C的工厂类实现。达到了对修改关闭，对扩展开放，符合开闭原则。</p><p>工厂模式，定义了一个创建对象的接口，让子类来决定将哪个类实例化。工厂模式将一个类的实例化延迟到了其子类。</p><p>其UML图如下：</p><img src="https://www.plantuml.com/plantuml/svg/SoWkIImgAStDuShCAqajIajCJbK8ACfFAKqkyOG9S2Nd91ONmuGT5J9p2t9ISrFpIee9A7N2gnJJHhV4v9Byeaeq-w2YMCp2gjw9i7ekTADrSrBJIlJqxE1sSg4RXgx2YSiXDIy566u0" alt=""><p>在调用的时候</p><div class="language-java line-numbers-mode" data-highlighter="shiki" data-ext="java" data-title="java" style="--shiki-light:#383A42;--shiki-dark:#abb2bf;--shiki-light-bg:#FAFAFA;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes one-light one-dark-pro vp-code"><code><span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> class</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;"> Demo</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;">    public</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> void</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> main</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">(</span><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;">String</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">[] </span><span style="--shiki-light:#383A42;--shiki-dark:#E06C75;--shiki-light-font-style:inherit;--shiki-dark-font-style:italic;">args</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">)</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;"> {</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;">        ProductFactory</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;"> factory</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> =</span><span style="--shiki-light:#A626A4;--shiki-dark:#C678DD;"> new</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;"> ProductAFactory</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">();</span></span>
<span class="line"><span style="--shiki-light:#C18401;--shiki-dark:#E5C07B;">        ProductInterface</span><span style="--shiki-light:#E45649;--shiki-dark:#E06C75;"> product</span><span style="--shiki-light:#383A42;--shiki-dark:#56B6C2;"> =</span><span style="--shiki-light:#E45649;--shiki-dark:#E5C07B;"> factory</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">.</span><span style="--shiki-light:#4078F2;--shiki-dark:#61AFEF;">createProduct</span><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">();</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">    }</span></span>
<span class="line"><span style="--shiki-light:#383A42;--shiki-dark:#ABB2BF;">}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>工厂模式，在很多开源的项目中都有实现。由于其满足开闭原则，是开源产产品的使用者很方便的扩展自己的工厂类和产品对象，并替换掉开源项目里的默认实现。</p>`,21);function c(g,B){const i=n("RouteLink");return k(),l("div",null,[d,s("p",null,[t(i,{to:"/gof/builder/"},{default:h(()=>[p("创建者模式")]),_:1})]),A])}const u=a(r,[["render",c],["__file","index.html.vue"]]),F=JSON.parse('{"path":"/article/lyeq7xvt/","title":"工厂模式","lang":"zh-CN","frontmatter":{"title":"工厂模式","createTime":"2024/08/25 10:21:30","permalink":"/article/lyeq7xvt/"},"headers":[{"level":2,"title":"简单工厂模式","slug":"简单工厂模式","link":"#简单工厂模式","children":[]},{"level":2,"title":"工厂模式","slug":"工厂模式-1","link":"#工厂模式-1","children":[]}],"git":{"createdTime":1724591575000,"updatedTime":1724591575000,"contributors":[{"name":"weiyiysw","email":"weiyiysw37@gmail.com","commits":1}]},"readingTime":{"minutes":2.64,"words":792},"filePathRelative":"gof/builder/factory-mode.md","localizedDate":"2024年8月25日"}');export{u as comp,F as data};
