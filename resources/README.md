# Augment 注入增强版 — 功能说明

本增强版在官方扩展基础上进行三重注入（拦截器 + Token 登录增强 + 余额增强），目标是提供更灵活的网络拦截与认证管理体验，并在状态栏显示账户余额信息。

- 拦截器
  - 拦截网络API请求，防止封号。

- Token 登录增强
  - 新增命令：Token Management、Direct Login
  - 支持推送深链 autoAuth/push-login，自动解析 tenantURL/accessToken/Portal
  - 提供 Webview 表单登录、更新 accessToken、查看/复制当前会话信息

- 余额增强
  - 在 VS Code 状态栏显示余额信息
  - 支持从“查看用量/Portal”链接中提取 token
  - 可配置自动刷新间隔/显隐开关
- 一键换号
  - 搭配 https://github.com/zhaochengcube/augment-token-mng 项目实现一键换号、更新余额监控token
  
来源与发布：https://github.com/llpplplp/AugmentInjector
