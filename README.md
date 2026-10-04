<div align="center">

<img src="https://cdn.jsdelivr.net/gh/logamee/logamee-film-forge@main/assets/logo.svg" width="320" alt="映画 Logamee Film Forge logo" />

# 映画 · Logamee Film Forge

**把文章变成有口播、有字幕、能录制的演示视频。**

逻辑帧团队开源的内容驱动视频制作 Skill 组合。

一个负责生产，一个负责约束。两个 Skill 放在同一个仓库里，可以分别安装、分别加载、分别使用。

</div>

---

[![License](https://img.shields.io/github/license/logamee/logamee-film-forge?style=flat&logo=opensourceinitiative&logoColor=white&color=4CAF50)](LICENSE)
[![Stars](https://img.shields.io/github/stars/logamee/logamee-film-forge?style=flat&logo=github&logoColor=white&color=FFB74D)](https://github.com/logamee/logamee-film-forge)
[![Version](https://img.shields.io/badge/version-1.20.0-607D8B?style=flat&logo=git&logoColor=white)](https://github.com/logamee/logamee-film-forge)
[![Platform](https://img.shields.io/badge/macOS%20%7C%20Linux%20%7C%20Windows-9C27B0?style=flat&logo=apple&logoColor=white)](logamee-film-forge/SKILL.md)
[![Claude](https://img.shields.io/badge/Claude-000000?style=flat&logo=anthropic&logoColor=white)](logamee-film-forge/SKILL.md)
[![Hermes](https://img.shields.io/badge/Hermes-1565C0?style=flat)](logamee-film-forge/SKILL.md)
[![Codex](https://img.shields.io/badge/Codex-10A37F?style=flat)](logamee-film-forge/SKILL.md)
[![Cursor](https://img.shields.io/badge/Cursor-6B21A8?style=flat&logo=cursor&logoColor=white)](logamee-film-forge/SKILL.md)
[![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-24292F?style=flat&logo=github&logoColor=white)](logamee-film-forge/SKILL.md)
[![QoderWork](https://img.shields.io/badge/QoderWork-8B5CF6?style=flat)](logamee-film-forge/SKILL.md)
[![WorkBuddy](https://img.shields.io/badge/WorkBuddy-EF4444?style=flat)](logamee-film-forge/SKILL.md)
[![Coze](https://img.shields.io/badge/Coze-7C3AED?style=flat&logo=coze&logoColor=white)](logamee-film-forge/SKILL.md)
[![TRAE](https://img.shields.io/badge/TRAE-0D9488?style=flat)](logamee-film-forge/SKILL.md)

---

## 目录

- [这是什么](#这是什么)
- [两个 Skill](#两个-skill)
- [完整流程](#完整流程)
- [归档与清理](#归档与清理)
- [两者如何配合](#两者如何配合)
- [快速开始](#快速开始)
- [使用方式](#使用方式)
- [依赖边界](#依赖边界)
- [仓库结构](#仓库结构)
- [贡献](#贡献)
- [开源协议](#开源协议)

## 这是什么

它把「把内容做成视频」和「检查视频画面是否合格」拆成两个平行
Skill：

- **logamee-film-forge** — 生产流程：文章 → Storyboard → HTML Deck → TTS → 字幕 → MP4
- **logamee-html-constraint** — 质量门：检查字体、间距、动画、字幕、越界等最低质量标准

演示效果见：[微信公众号文章](https://mp.weixin.qq.com/s/scYzvNoLG4q6dhvFX2yFsw)。

仓库只提供 Skill 文档、检查规则、参考材料和一个可复用的增量渲染辅助
脚本，不捆绑运行时依赖。

## 两个 Skill

### logamee-film-forge

主流程 Skill，负责把文章、脚本或口播材料制作成带字幕的 HTML 视频和
MP4。它同时支持：

- `deck`：独立页面、逐页审核、逐页缓存，适合 PPT 型知识视频。
- `film`：Scene/Shot 连续时间线，适合真正的连续视频表达。

用户只需要关心下面十五个节点：

```text
1. 确认项目范围与工作目录
2. 检测制作环境
3. 确认并保存来源材料
4. 审核内容理解
5. 审核口播稿
6. 审核视觉方向与主题
7. 审核 Storyboard
8. 审核静态排版
9. 审核无音频动画
10. 审核配合本地音频的真实动画
11. 选择并生成正式音频
12. 根据正式音频生成精确字幕与时间轴
13. 审核正式音画同步预览
14. 增量渲染并合成
15. 验证并交付
```

前 13 步是素材、设计、音频与审核，后 2 步是渲染、验证与交付。缓存、
哈希、冻结规格和诊断清单属于内部机制，不会额外增加用户审批节点。

交付后可以把项目转为 `archived-editable`。归档默认保留能够继续修改
单页、复用正式音频并重新合成完整视频的源链；渲染缓存、临时语音、旧版
审核稿和截图只能作为清理候选，必须先按路径列出用途、可再生性和删除
代价，再获得用户对具体路径的确认。完整约束见
[归档与清理参考](logamee-film-forge/references/archive-and-cleanup.md)。

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
- 页面是否只是没有语义的「卡片加标题」
- 页面是否有清晰的视觉关系、动作和最终状态
- 一个页面发现的问题是否触发整套 Deck 的同类问题扫描

## 两者如何配合

推荐配合流程：

```text
加载 logamee-film-forge
  ↓
完成十五步中的内容、Storyboard、静态排版和动画审核
  ↓
加载 logamee-html-constraint
  ↓
执行视觉约束和动画状态检查
  ↓
根据检查结果修正 deck.html
  ↓
用户确认正式同步预览
  ↓
增量渲染、合成并验证 MP4
```

`logamee-film-forge` 是生产流程，`logamee-html-constraint` 是质量门。辅助 Skill 不应该被复制进主 Skill，也不应该被当成主题模板使用。

如果只需要检查已有的 HTML PPT 或视频 Deck，可以单独使用 `logamee-html-constraint`，不需要加载完整的视频生产流程。

## 仓库结构

```text
logamee-film-forge/
├── README.md
├── LICENSE
├── assets/
│   ├── logo.svg
│   └── scan-follow.webp
├── logamee-film-forge/
│   ├── SKILL.md
│   └── references/
│       ├── FORM-MAP.md
│       ├── TOOLKIT.md
│       ├── index.md
│       ├── project-setup-and-source.md
│       ├── storyboard-and-freeze.md
│       ├── approval-preview-workflow.md
│       ├── audio-review-and-sync.md
│       ├── render-and-delivery.md
│       ├── incremental-rendering.md
│       ├── archive-and-cleanup.md
│       ├── deck-art-direction.md
│       ├── deck-visual-design-standard.md
│       ├── deck-design-and-html.md
│       ├── film-mode.md
│       ├── hyperframes-adaptation.md
│       ├── cloned-voice-video-production.md
│       └── tts-source-selection.md
│   └── scripts/
│       └── render_deck_incrementally.mjs
└── logamee-html-constraint/
    ├── SKILL.md
    └── references/
        └── demo.html
```

## 完整流程

四种审核预览必须保持语义不同：

| 阶段 | 入口 | 音频 | 动画时钟 | 审核重点 |
|---|---|---|---|---|
| 静态排版 | `?review=1` | 无 | 不播放 | 字体、层级、留白、碰撞、首屏关系 |
| 无音频动画 | `?motionPreview=1` | 无 | 独立演示时间线 | 动画顺序、语义动作、过渡和落定状态 |
| 本地音频同步 | `?audioPreview=1` | 临时本地音频 | 本地音频时钟 | 口播、字幕、Cue、动画是否同步 |
| 正式同步预览 | `?preview=1` | 正式音频 | 正式音频和精确时间戳 | 最终审核、控制、导航和全片关系 |

静态排版和无音频动画都可以显示字幕，但不使用字幕节点驱动动画。正式
音频生成后，必须从当前音频重新生成字幕时间、Cue 和总时间线。

对 `deck` 模式，页面内容按稳定 `unitId` 独立缓存。修改单页时只重渲染
受影响页面及必要的边界，最后重新合成完整视频；不会因为最终要得到一个
MP4 就重新录制所有页面。

## 归档与清理

归档不是把项目压缩成一个 MP4。默认的可编辑归档至少保留项目配置、来源
与口播稿、Storyboard、冻结规格、当前 HTML、正式音频、字幕与时间轴、素材、
渲染清单、诊断报告和最终成片，并生成 `archive-manifest.md` 记录恢复方式。
只有在用户明确确认精确路径后，才可以删除缓存、临时音频、旧审核稿、截图
或其他中间文件。

## 快速开始

请把下面这句话复制给你的 Agent：

> 请从 GitHub 仓库 https://github.com/logamee/logamee-film-forge 获取并安装「映画」Skill。

手动安装（可选）：

```bash
# 把 Skill 复制到对应 Agent 的技能目录
cp -R logamee-film-forge ~/.hermes/skills/       # Hermes
cp -R logamee-film-forge ~/.claude/skills/       # Claude Code
cp -R logamee-film-forge ~/.codex/skills/        # Codex
cp -R logamee-html-constraint ~/.hermes/skills/
cp -R logamee-html-constraint ~/.claude/skills/
cp -R logamee-html-constraint ~/.codex/skills/
```

## 使用方式

> 使用「映画」Skill，把这篇内容制作成一个视频。

## 依赖边界

仓库只提供 Skill 文档、检查规则、参考材料和渲染辅助脚本，不捆绑
浏览器、TTS 引擎、ffmpeg、GSAP 文件、模型权重或声音资产。

具体项目需要哪些工具，由 Agent 根据当前环境检查并向用户报告。没有经过用户确认，不应静默安装大型模型、下载浏览器或切换 TTS 服务。

Whisper 等时间戳工具应优先安装在用户级共享环境，由多个项目复用；不要把模型或虚拟环境复制到每个视频项目里。

## 贡献

欢迎提交 Issue 和 Pull Request。改进建议请说明动机和效果，不要只改措辞。

- 报告问题：[GitHub Issues](https://github.com/logamee/logamee-film-forge/issues)
- 提交代码：[Pull Requests](https://github.com/logamee/logamee-film-forge/pulls)

## 关注逻辑帧

<div align="center">

<table>
<tr>
<td align="center">
我是逻辑帧的一号员工 姜磺<br>
关注我，学习更多 AI 方向的技术
</td>
<td>
<img src="https://cdn.jsdelivr.net/gh/logamee/logamee-film-forge@main/assets/scan-follow.webp" width="480" alt="扫码或搜索关注逻辑帧" />
</td>
</tr>
</table>

</div>

## 开源协议

[MIT License](LICENSE)

Copyright (c) 2026 Logamee contributors
