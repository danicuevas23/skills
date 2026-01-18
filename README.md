# Claude Code Skills

我的 Claude Code 自定义技能集合。

## 技能列表

| 技能 | 说明 |
|------|------|
| [port-allocator](./port-allocator/) | 自动分配和管理开发服务器端口，避免多个 Claude Code 实例之间的端口冲突 |
| [share-skill](./share-skill/) | 将本地 skill 迁移到代码仓库，支持 Git 版本管理和开源 |
| [skill-permissions](./skill-permissions/) | 分析 skill 所需权限，生成一次性授权命令 |

## 安装方法

将本仓库克隆到 `~/.claude/skills/` 或创建符号链接：

```bash
# 方法 1: 克隆到 skills 目录
git clone git@github.com:guo-yu/skills.git ~/Codes/skills

# 方法 2: 创建符号链接
ln -s ~/Codes/skills/port-allocator ~/.claude/skills/port-allocator
ln -s ~/Codes/skills/share-skill ~/.claude/skills/share-skill
ln -s ~/Codes/skills/skill-permissions ~/.claude/skills/skill-permissions
```

## 使用方法

在 Claude Code 中使用斜杠命令：

```
/port-allocator          # 查询/分配端口
/share-skill <name>      # 开源技能
/skill-permissions       # 分析技能权限
```

## 许可证

MIT
