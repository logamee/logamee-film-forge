# logamee-film-forge

逻辑帧团队开源的内容驱动视频制作 Skill。

它把文章、脚本或口播材料，组织成可验证的 HTML 演示文稿和旁白视频生产流程，覆盖：

- 内容理解与主题提炼
- Storyboard 与逐页规格
- 内容驱动的画面逻辑与动画
- HTML Deck 构建与视觉检查
- TTS 音频、字幕时间轴与口播同步
- 浏览器逐帧录制、音视频合成与最终验收

## 文件结构

- `SKILL.md`：完整工作流与验收规则
- `references/FORM-MAP.md`：内容关系到视觉形式的映射规则
- `references/TOOLKIT.md`：HTML、动画和浏览器录制的工程约束
- `references/cloned-voice-video-production.md`：克隆音色、降噪、字幕和录制流程
- `references/tts-source-selection.md`：TTS 来源选择、探测和元数据记录

## 使用

将本仓库作为 Skill 目录加载到兼容的 Agent 工具中，目录名保持为 `logamee-film-forge`。运行时依赖由使用者按工作流需要提供，例如浏览器自动化工具、ffmpeg、TTS 服务和本地动画库。

本 Skill 不捆绑模型权重、声音、浏览器、JavaScript 库或凭据。

## 许可证

MIT License。版权归属：逻辑帧。
