// import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'
import { mdEnhancePlugin } from "vuepress-plugin-md-enhance"
import { hopeTheme } from "vuepress-theme-hope"

export default defineUserConfig({
  lang: 'zh-CN',

  title: '我的知识库',
  description: '温故而知新，可以为师矣',

  theme: hopeTheme({
    // logo: 'https://vuejs.press/images/hero.png',
    logo: 'images/IMG_4510.png',

    // 顶部导航
    navbar: [
      {
        text: '编程语言',
        link: '/program-language/',
        children: [
          { text: 'Java', link: '/program-language/java', icon: 'creative' },
          { text: 'Golang', link: '/program-language/golang', icon: 'config' }
        ]
      },
      {
        text: '数据库',
        link: '/database/',
        children: [
          { text: 'Mybatis', link: '/database/orm/mybatis/' }
        ]
      },
      {
        text: '缓存',
        link: '/cache/',
        children: [
          { text: 'redis', link: '/cache/redis' }
        ]
      },
      {
        text: '设计模式',
        link: '/gof/',
        children: [
          { text: '设计原则', link: '/gof/principle/' },
          { text: '创建者模式', link: '/gof/builder/' },
          { text: '行为型模式', link: '/gof/behavior/' },
          { text: '结构型模式', link: '/gof/structure/' }
        ]
      },
      {
        text: '构建工具', 
        link: '/build-tools/',
        children: [
          { text: 'Maven', link: '/build-tools/maven' },
          { text: 'Gradle', link: '/build-tools/gradle' }
        ]
      },
      {
        text: '其他', 
        link: '/other/',
        children: [
          { text: 'jq', link: '/other/jq' },
          { text: 'cpdf', link: '/other/cpdf' },
        ]
      }
    ],

    // 不开启侧边菜单导航
    sidebar: false,
    // 主题插件配置
    plugins: {
      mdEnhance: {
        plantuml: true,
        include: true,
      }
    }
  }),

  bundler: viteBundler(),

  // plugins: [
  //   mdEnhancePlugin({
  //     plantuml: true,
  //     include: true,
  //   }),
  // ]
})
