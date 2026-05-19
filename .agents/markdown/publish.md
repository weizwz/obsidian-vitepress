# Obsidian 插件发布流程

当前项目已配置了完整的 GitHub Actions 自动化发布工作流。要发布新版本，请严格按照以下步骤操作：

## 1. 更新版本号

在以下两个文件中同步更新版本号（必须保持一致）：

- `manifest.json` 中的 `"version"` 字段
- `package.json` 中的 `"version"` 字段

## 2. 提交并推送代码

将所有修改（包括功能代码和版本号修改）提交并推送到 GitHub 的主分支：

```bash
git add .
git commit -m "chore: release x.x.x"
git push
```

## 3. 打 Tag 并推送

为当前提交创建一个与版本号对应的 Tag，并推送到远程仓库（假设版本号为 `1.0.2`）：

```bash
git tag 1.0.2
git push origin 1.0.2
```

_(也可以使用 `git push --tags` 推送所有本地新 Tag)_

## 4. 自动化发版

推送 Tag 后，GitHub Actions 会自动触发执行以下任务：

- 配置 Node 20 及 pnpm 环境
- 依靠 `pnpm-lock.yaml` 进行确定的依赖安装 (`pnpm install --frozen-lockfile`)
- 编译并打包产物到 `dist/` 目录 (`pnpm run build`)
- 为产物生成符合 Obsidian 官方安全规范的构建源码校验（Artifact Attestations）
- 自动创建带有 Release Notes 的 GitHub Release 并附带 `main.js`, `styles.css`, `manifest.json`

## 常见问题处理

- **误打 Tag**：如果打错了 Tag，删除本地和远程的 Tag 重新打：
  ```bash
  git tag -d 1.0.2
  git push origin :refs/tags/1.0.2
  ```
- **依赖问题**：如果你安装了新依赖，请务必提交 `pnpm-lock.yaml` 文件，否则 CI 构建校验会报错或失败。
