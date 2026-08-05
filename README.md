# 映画（Logamee Film Forge）

官方仓库：<https://github.com/logamee/logamee-film-forge>

逻辑帧团队开源的内容驱动视频制作 Skill 组合。

它把“把文章做成视频”和“检查视频画面是否合格”拆成两个平行 Skill：一个负责生产，一个负责约束。两个 Skill 放在同一个仓库中，但可以分别安装、分别加载、分别使用。

## 两个 Skill

```text
logamee-film-forge/
├── README.md
├── LICENSE
├── logamee-film-forge/
│   ├── SKILL.md
│   └── references/
└── logamee-html-constraint/
    ├── SKILL.md
    └── references/
```

### logamee-film-forge

主流程 Skill，负责把文章、脚本或口播材料制作成带字幕的 HTML 视频和 MP4：

```text
文章或脚本
  → 内容理解
  → 主题提取
  → Storyboard
  → Slide Specs
  → Visual Logic
  → HTML Deck
  → TTS 音频
  → 字幕与音频对齐
  → 浏览器渲染
  → MP4 合成
```

它负责内容、叙事、页面结构、动画、音频、字幕、浏览器录制和最终视频组装。

### logamee-html-constraint

辅助约束 Skill，负责检查 HTML 页面和视频 Deck 是否达到最低质量标准。它不负责生成内容，也不负责替换主题设计。

它检查：

- 字体、字号、行高和 `clamp()` 响应式尺寸
- 间距、舞台尺寸和 16:9 录制安全区
- 文本、字幕、页码、品牌标识之间的碰撞
- 颜色对比度和主题 Token 使用
- GSAP 动画的 0%、25%、50%、75%、100% 状态
- 父容器内部越界和视觉边界穿透
- 字幕是否压缩或遮挡页面内容
- 屏幕文字是否重复字幕
- 二维码、截图、传播图旁是否出现多余解释文字
- 页面是否只是没有语义的“卡片加标题”
- 页面是否有清晰的视觉关系、动作和最终状态
- 一个页面发现的问题是否触发整套 Deck 的同类问题扫描

## 两者如何配合

推荐流程：

```text
加载 logamee-film-forge
  ↓
完成内容理解、Storyboard、Slide Specs、Visual Logic
  ↓
生成 deck.html
  ↓
加载 logamee-html-constraint
  ↓
执行视觉约束和动画状态检查
  ↓
根据检查结果修正 deck.html
  ↓
用户确认视觉版本
  ↓
生成 TTS、字幕和最终 MP4
```

`logamee-film-forge` 是生产流程，`logamee-html-constraint` 是质量门。辅助 Skill 不应该被复制进主 Skill，也不应该被当成主题模板使用。

如果只需要检查已有的 HTML PPT 或视频 Deck，可以单独使用 `logamee-html-constraint`，不需要加载完整的视频生产流程。

## 安装

请把下面这句话复制给你的 Agent：

> 请从 GitHub 仓库 https://github.com/logamee/logamee-film-forge 获取并安装「映画」Skill。

## 使用方式

> 使用「映画」Skill，把这篇内容制作成一个视频。

## 依赖边界

仓库只提供 Skill 文档、检查规则和参考材料，不捆绑运行时依赖、浏览器、TTS 引擎、ffmpeg、GSAP 文件、模型权重或声音资产。

具体项目需要哪些工具，由 Agent 根据当前环境检查并向用户报告。没有经过用户确认，不应静默安装大型模型、下载浏览器或切换 TTS 服务。

## 开源协议

MIT License。详见 [LICENSE](LICENSE)。

## 仓库结构

```text
logamee-film-forge/
├── README.md
├── LICENSE
├── logamee-film-forge/
│   ├── SKILL.md
│   └── references/
│       ├── FORM-MAP.md
│       ├── TOOLKIT.md
│       ├── cloned-voice-video-production.md
│       └── tts-source-selection.md
└── logamee-html-constraint/
    ├── SKILL.md
    └── references/
        └── demo.html
```
