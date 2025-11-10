/**
 * Augment Token Login Enhanced - 清晰版本
 * 
 * 主要修改:
 * 1. Session ID 持久化到 context.globalState
 * 2. 重载时恢复 Session ID,避免上下文丢失
 * 3. 移除 updateSessionsData 中的随机 Session ID 生成
 */

const vscode = require('vscode');

class AugmentTokenLoginEnhanced {
  constructor() {
    this.context = null;
    this.logger = this.createLogger();
    this.isInitialized = false;
  }

  createLogger() {
    return {
      info: (msg, ...args) => console.log('[TokenLogin] ' + msg, ...args),
      warn: (msg, ...args) => console.warn('[TokenLogin] ' + msg, ...args),
      error: (msg, ...args) => console.error('[TokenLogin] ' + msg, ...args),
      debug: (msg, ...args) => console.debug('[TokenLogin] ' + msg, ...args)
    };
  }

  /**
   * 注册 Deep Link 处理器
   */
  registerDeepLinkHandler() {
    try {
      if (typeof vscode.window.registerUriHandler === 'function') {
        const handler = {
          handleUri: async (uri) => {
            this.logger.info('Deep link received:', uri.toString());
            
            if (uri.path === '/auth/callback') {
              const query = new URLSearchParams(uri.query);
              const token = query.get('token');
              const tenantURL = query.get('tenantURL');
              
              if (token && tenantURL) {
                await this.updateSessionsData(tenantURL, token);
                vscode.window.showInformationMessage('登录成功!');
              }
            }
          }
        };
        
        vscode.window.registerUriHandler(handler);
        this.logger.info('Deep link handler registered');
      }
    } catch (error) {
      this.logger.error('Failed to register deep link handler:', error);
    }
  }

  /**
   * 初始化方法 - ✅ 修改: 恢复持久化的 Session ID
   */
  async initialize(context) {
    if (this.isInitialized) {
      this.logger.warn('Already initialized');
      return;
    }

    try {
      this.context = context;
      
      // ✅ 恢复或生成持久化的 Session ID
      let sessionId = await context.globalState.get('FAKE_SESSION_ID');
      if (!sessionId) {
        sessionId = this.generateNewSessionId();
        await context.globalState.update('FAKE_SESSION_ID', sessionId);
        this.logger.info('Generated new persistent Session ID:', sessionId);
      } else {
        this.logger.info('Restored persistent Session ID:', sessionId);
      }
      
      // 设置到拦截器
      if (typeof global !== 'undefined' && global.AugmentInterceptor) {
        if (typeof global.AugmentInterceptor.updateFakeSessionId === 'function') {
          global.AugmentInterceptor.updateFakeSessionId(sessionId);
        } else {
          global.AugmentInterceptor.FAKE_SESSION_ID = sessionId;
        }
        this.logger.info('Session ID set to interceptor');
      }
      
      this.registerCommands();
      this.registerDeepLinkHandler();
      
      this.isInitialized = true;
      this.logger.info('Initialization complete');
    } catch (error) {
      this.logger.error('Initialization failed:', error);
      throw error;
    }
  }

  /**
   * 注册命令
   */
  registerCommands() {
    if (!this.context) {
      this.logger.error('Cannot register commands: context is null');
      return;
    }

    const commands = [
      {
        id: 'augment.tokenManagement',
        handler: () => this.handleTokenManagement()
      }
    ];

    commands.forEach(({ id, handler }) => {
      const disposable = vscode.commands.registerCommand(id, handler);
      this.context.subscriptions.push(disposable);
      this.logger.info('Command registered:', id);
    });
  }

  /**
   * 获取 Access Token
   */
  async getAccessToken() {
    try {
      const sessionsData = await this.context.secrets.get('augment.sessions');
      if (!sessionsData) {
        return { success: false, error: '未找到会话数据' };
      }

      const data = JSON.parse(sessionsData);
      return {
        success: true,
        accessToken: data.accessToken || '',
        tenantURL: data.tenantURL || '',
        data: data
      };
    } catch (error) {
      this.logger.error('Failed to get access token:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 设置 Secret
   */
  async setSecret(key, value) {
    try {
      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.context.secrets.store(key, jsonValue);
      this.logger.info('Secret stored:', key);
      return true;
    } catch (error) {
      this.logger.error('Failed to store secret:', error);
      return false;
    }
  }

  /**
   * 更新 Access Token (仅更新token,保留tenantURL)
   */
  async updateAccessToken(accessToken) {
    try {
      const sessionsData = await this.context.secrets.get('augment.sessions');
      let data = {};

      if (sessionsData) {
        try {
          data = JSON.parse(sessionsData);
        } catch (e) {
          this.logger.warn('Failed to parse existing sessions data');
          data = {};
        }
      }

      data.accessToken = accessToken;

      if (!data.scopes) {
        data.scopes = ['email'];
      }

      const success = await this.setSecret('augment.sessions', data);

      if (success) {
        this.logger.info('Access token updated successfully');
        return { success: true, data };
      } else {
        return { success: false, error: 'Failed to store secret' };
      }
    } catch (error) {
      this.logger.error('Failed to update access token:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 更新会话数据 - ✅ 核心修改: 使用持久化的 Session ID
   */
  async updateSessionsData(tenantURL, accessToken) {
    try {
      // 1. 读取现有数据
      const sessionsData = await this.context.secrets.get('augment.sessions');
      let data = {};

      if (sessionsData) {
        try {
          data = JSON.parse(sessionsData);
        } catch (e) {
          this.logger.warn('Failed to parse existing sessions data');
          data = {};
        }
      }

      // 2. 更新数据
      data.tenantURL = tenantURL;
      data.accessToken = accessToken;

      if (!data.scopes) {
        data.scopes = ['email'];
      }

      // 3. 保存到 secrets
      const success = await this.setSecret('augment.sessions', data);

      if (!success) {
        return { success: false, error: 'Failed to store secret' };
      }

      this.logger.info('Sessions data updated successfully');

      // 4. ✅ 修改: 使用持久化的 Session ID,不生成新的
      let sessionId = await this.context.globalState.get('FAKE_SESSION_ID');
      if (!sessionId) {
        sessionId = this.generateNewSessionId();
        await this.context.globalState.update('FAKE_SESSION_ID', sessionId);
        this.logger.info('Generated new persistent Session ID:', sessionId);
      } else {
        this.logger.info('Using existing persistent Session ID:', sessionId);
      }

      // 5. 更新拦截器使用持久化的 Session ID
      if (typeof global !== 'undefined' && global.AugmentInterceptor) {
        if (typeof global.AugmentInterceptor.updateFakeSessionId === 'function') {
          global.AugmentInterceptor.updateFakeSessionId(sessionId);
          this.logger.info('Updated interceptor Session ID via method');
        } else {
          global.AugmentInterceptor.FAKE_SESSION_ID = sessionId;
          this.logger.info('Updated interceptor Session ID directly');
        }
      }

      return { success: true, data };
    } catch (error) {
      this.logger.error('Failed to update sessions data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 格式化 URL
   */
  formatURL(url) {
    if (!url) return '';

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    if (!url.endsWith('/')) {
      url += '/';
    }

    return url;
  }

  /**
   * 验证 Token
   */
  validateToken(token) {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Token不能为空' };
    }

    const trimmed = token.trim();
    if (trimmed.length < 10) {
      return { valid: false, error: 'Token长度似乎太短' };
    }

    return { valid: true, token: trimmed };
  }

  /**
   * 验证 URL
   */
  validateURL(url) {
    if (!url || typeof url !== 'string') {
      return { valid: false, error: 'URL不能为空' };
    }

    try {
      const formatted = this.formatURL(url.trim());
      new URL(formatted);
      return { valid: true, url: formatted };
    } catch {
      return { valid: false, error: 'URL格式不正确' };
    }
  }

  /**
   * 生成新的 Session ID (UUID v4 格式)
   */
  generateNewSessionId() {
    const hex = '0123456789abcdef';
    let uuid = '';

    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        uuid += '-';
      } else if (i === 14) {
        uuid += '4';
      } else if (i === 19) {
        uuid += hex[8 + Math.floor(4 * Math.random())];
      } else {
        uuid += hex[Math.floor(16 * Math.random())];
      }
    }

    return uuid;
  }

  /**
   * 更新拦截器 Session ID - ✅ 已废弃,由 updateSessionsData 处理
   * 保留此方法以兼容旧代码
   */
  async updateInterceptorSessionId() {
    this.logger.warn('updateInterceptorSessionId is deprecated, use updateSessionsData instead');

    // 使用持久化的 Session ID
    let sessionId = await this.context.globalState.get('FAKE_SESSION_ID');
    if (!sessionId) {
      sessionId = this.generateNewSessionId();
      await this.context.globalState.update('FAKE_SESSION_ID', sessionId);
    }

    if (typeof global !== 'undefined' && global.AugmentInterceptor) {
      if (typeof global.AugmentInterceptor.updateFakeSessionId === 'function') {
        global.AugmentInterceptor.updateFakeSessionId(sessionId);
      } else {
        global.AugmentInterceptor.FAKE_SESSION_ID = sessionId;
      }
    }

    return sessionId;
  }

  /**
   * 触发会话变更
   */
  async triggerSessionChange() {
    try {
      const sessionId = await this.updateInterceptorSessionId();
      this.logger.info('Session change triggered with Session ID:', sessionId);

      if (vscode.authentication && typeof vscode.authentication.onDidChangeSessions === 'function') {
        vscode.authentication.onDidChangeSessions(() => {
          this.logger.info('Authentication session changed');
        });
      }
    } catch (error) {
      this.logger.debug('Failed to trigger session change:', error);
    }
  }

  /**
   * 处理 Token 管理
   */
  async handleTokenManagement() {
    try {
      const action = await vscode.window.showQuickPick([
        {
          label: '🔑 直接登录',
          description: '使用租户URL和Token直接登录',
          detail: '输入租户URL和访问令牌进行快速登录'
        },
        {
          label: '📋 获取 accessToken',
          description: '查看当前的 accessToken 和 tenantURL',
          detail: '显示当前存储的认证信息，支持复制和查看完整数据'
        },
        {
          label: '⚙️ 设置 accessToken',
          description: '修改 accessToken 或 tenantURL',
          detail: '更新认证信息，支持仅更新 accessToken 或完整更新会话数据'
        }
      ], {
        placeHolder: '选择要执行的操作'
      });

      if (!action) return;

      if (action.label === '🔑 直接登录') {
        await this.handleDirectLogin();
      } else if (action.label === '📋 获取 accessToken') {
        await this.handleGetAccessToken();
      } else if (action.label === '⚙️ 设置 accessToken') {
        await this.handleSetToken();
      }
    } catch (error) {
      vscode.window.showErrorMessage('操作失败: ' + error.message);
    }
  }

  /**
   * 处理直接登录
   */
  async handleDirectLogin() {
    try {
      const panel = vscode.window.createWebviewPanel(
        'augmentLogin',
        'Augment 登录',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );

      panel.webview.html = this.getLoginWebviewContent();

      panel.webview.onDidReceiveMessage(
        async (message) => {
          switch (message.command) {
            case 'login':
              await this.handleWebviewLogin(message.data, panel);
              break;
            case 'cancel':
              panel.dispose();
              break;
          }
        },
        undefined,
        this.context.subscriptions
      );
    } catch (error) {
      this.logger.error('Failed to show login webview:', error);
      vscode.window.showErrorMessage('无法打开登录界面: ' + error.message);
    }
  }

  /**
   * 处理 Webview 登录
   */
  async handleWebviewLogin(data, panel) {
    try {
      const { tenantURL, accessToken } = data;

      const urlValidation = this.validateURL(tenantURL);
      const tokenValidation = this.validateToken(accessToken);

      if (!urlValidation.valid) {
        panel.webview.postMessage({
          command: 'error',
          field: 'tenantURL',
          message: urlValidation.error
        });
        return;
      }

      if (!tokenValidation.valid) {
        panel.webview.postMessage({
          command: 'error',
          field: 'accessToken',
          message: tokenValidation.error
        });
        return;
      }

      panel.webview.postMessage({
        command: 'loading',
        message: '正在验证登录信息...'
      });

      const result = await this.updateSessionsData(urlValidation.url, tokenValidation.token);

      if (result.success) {
        await this.triggerSessionChange();

        panel.webview.postMessage({
          command: 'success',
          message: '登录成功！'
        });

        setTimeout(async () => {
          panel.dispose();

          const reload = await vscode.window.showInformationMessage(
            '登录成功！建议重载窗口以使更改生效。',
            '重载窗口',
            '稍后'
          );

          if (reload === '重载窗口') {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
          }
        }, 1500);
      } else {
        panel.webview.postMessage({
          command: 'error',
          field: 'general',
          message: '登录失败: ' + result.error
        });
      }
    } catch (error) {
      this.logger.error('Webview login failed:', error);
      panel.webview.postMessage({
        command: 'error',
        field: 'general',
        message: '登录失败: ' + error.message
      });
    }
  }

  /**
   * 获取登录 Webview 内容 (简化版)
   */
  getLoginWebviewContent() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Augment 登录</title>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
        .button-group { display: flex; gap: 10px; margin-top: 20px; }
        button { flex: 1; padding: 10px; border: none; border-radius: 4px; cursor: pointer; }
        .btn-primary { background: #007acc; color: white; }
        .btn-secondary { background: #f0f0f0; color: #333; }
        .error { color: red; font-size: 12px; margin-top: 5px; display: none; }
        .error.show { display: block; }
    </style>
</head>
<body>
    <h1>🔑 Augment 登录</h1>
    <form id="loginForm">
        <div class="form-group">
            <label for="tenantURL">租户URL</label>
            <input type="url" id="tenantURL" placeholder="https://your-tenant.augmentcode.com/" required>
            <div class="error" id="tenantURLError"></div>
        </div>
        <div class="form-group">
            <label for="accessToken">访问令牌</label>
            <input type="password" id="accessToken" placeholder="输入您的访问令牌..." required>
            <div class="error" id="accessTokenError"></div>
        </div>
        <div class="button-group">
            <button type="button" class="btn-secondary" id="cancelBtn">取消</button>
            <button type="submit" class="btn-primary">登录</button>
        </div>
    </form>
    <script>
        const vscode = acquireVsCodeApi();
        const form = document.getElementById('loginForm');
        const cancelBtn = document.getElementById('cancelBtn');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const tenantURL = document.getElementById('tenantURL').value.trim();
            const accessToken = document.getElementById('accessToken').value.trim();
            vscode.postMessage({ command: 'login', data: { tenantURL, accessToken } });
        });

        cancelBtn.addEventListener('click', () => {
            vscode.postMessage({ command: 'cancel' });
        });

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'error') {
                const errorEl = document.getElementById(message.field + 'Error');
                if (errorEl) {
                    errorEl.textContent = message.message;
                    errorEl.classList.add('show');
                }
            }
        });
    </script>
</body>
</html>`;
  }

  /**
   * 处理获取 Access Token
   */
  async handleGetAccessToken() {
    try {
      const result = await this.getAccessToken();

      if (result.success) {
        const maskedToken = result.accessToken && result.accessToken.length > 10
          ? result.accessToken.substring(0, 8) + '...' + result.accessToken.substring(result.accessToken.length - 8)
          : result.accessToken || '未设置';

        const message = `accessToken: ${maskedToken}\ntenantURL: ${result.tenantURL || '未设置'}`;

        const action = await vscode.window.showInformationMessage(
          message,
          '复制 accessToken',
          '显示完整数据'
        );

        if (action === '复制 accessToken' && result.accessToken) {
          await vscode.env.clipboard.writeText(result.accessToken);
          vscode.window.showInformationMessage('accessToken 已复制到剪贴板');
        } else if (action === '显示完整数据') {
          const doc = await vscode.workspace.openTextDocument({
            content: JSON.stringify(result.data, null, 2),
            language: 'json'
          });
          await vscode.window.showTextDocument(doc);
        }
      } else {
        vscode.window.showErrorMessage('获取失败: ' + result.error);
      }
    } catch (error) {
      vscode.window.showErrorMessage('操作失败: ' + error.message);
    }
  }

  /**
   * 处理设置 Token
   */
  async handleSetToken() {
    try {
      const action = await vscode.window.showQuickPick([
        {
          label: '仅更新 accessToken',
          description: '只更新 augment.sessions 中的 accessToken',
          detail: '快速更新：仅修改 accessToken，保留 tenantURL 和权限范围'
        },
        {
          label: '更新会话数据',
          description: '更新 augment.sessions 中的 tenantURL 和 accessToken',
          detail: '完整更新：通过引导输入同时修改 tenantURL 和 accessToken'
        }
      ], {
        placeHolder: '选择更新方式'
      });

      if (!action) return;

      if (action.label === '仅更新 accessToken') {
        const newToken = await vscode.window.showInputBox({
          prompt: '输入新的 accessToken',
          password: true,
          validateInput: (value) => {
            const validation = this.validateToken(value);
            return validation.valid ? null : validation.error;
          }
        });

        if (!newToken) return;

        const result = await this.updateAccessToken(newToken.trim());

        if (result.success) {
          vscode.window.showInformationMessage('accessToken 更新成功！');
        } else {
          vscode.window.showErrorMessage('更新失败: ' + result.error);
        }
      } else {
        const tenantURL = await vscode.window.showInputBox({
          prompt: '输入 tenantURL',
          placeHolder: 'https://your-tenant.augmentcode.com/',
          validateInput: (value) => {
            const validation = this.validateURL(value);
            return validation.valid ? null : validation.error;
          }
        });

        if (!tenantURL) return;

        const accessToken = await vscode.window.showInputBox({
          prompt: '输入 accessToken',
          password: true,
          validateInput: (value) => {
            const validation = this.validateToken(value);
            return validation.valid ? null : validation.error;
          }
        });

        if (!accessToken) return;

        const urlValidation = this.validateURL(tenantURL);
        const tokenValidation = this.validateToken(accessToken);

        if (!urlValidation.valid || !tokenValidation.valid) {
          vscode.window.showErrorMessage('输入验证失败');
          return;
        }

        const result = await this.updateSessionsData(urlValidation.url, tokenValidation.token);

        if (result.success) {
          vscode.window.showInformationMessage('会话数据更新成功！');
        } else {
          vscode.window.showErrorMessage('更新失败: ' + result.error);
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage('操作失败: ' + error.message);
    }
  }

  /**
   * 设置 Token 注入 (风控相关)
   */
  setupTokenInjection() {
    try {
      if (typeof window !== 'undefined' && window.fetch) {
        this.setupFetchInterception();
        this.logger.info('Token injection setup complete');
      } else {
        this.logger.info('Not in browser environment, skipping token injection setup');
      }
    } catch (error) {
      this.logger.error('Failed to setup token injection:', error);
    }
  }

  /**
   * 设置 Fetch 拦截 (风控相关)
   */
  setupFetchInterception() {
    const originalFetch = window.fetch;
    const self = this;

    window.fetch = async function(url, options = {}) {
      try {
        const modifiedOptions = await self.injectTokenToRequest(url, options);
        return originalFetch.call(this, url, modifiedOptions);
      } catch (error) {
        self.logger.error('Token injection failed for fetch request:', error);
        return originalFetch.call(this, url, options);
      }
    };

    this.logger.info('Fetch interception setup complete');
  }

  /**
   * 注入 Token 到请求 (风控相关)
   */
  async injectTokenToRequest(url, options = {}) {
    try {
      const result = await this.getAccessToken();

      if (!result.success || !result.accessToken) {
        return options;
      }

      if (this.isAugmentRequest(url, result.tenantURL)) {
        const headers = options.headers || {};

        // 检查是否已有 Authorization header
        const hasAuth = Object.keys(headers).find(
          key => key.toLowerCase() === 'authorization'
        );

        if (!hasAuth) {
          headers['Authorization'] = 'Bearer ' + result.accessToken;
          this.logger.info('Token injected to request:', url);
        }

        return {
          ...options,
          headers: headers
        };
      }

      return options;
    } catch (error) {
      this.logger.error('Failed to inject token to request:', error);
      return options;
    }
  }

  /**
   * 判断是否为 Augment 请求 (风控相关)
   */
  isAugmentRequest(url, tenantURL) {
    if (!url || !tenantURL) {
      return false;
    }

    try {
      const requestURL = new URL(url);
      const tenantURLObj = new URL(tenantURL);

      // 比较 hostname
      return requestURL.hostname === tenantURLObj.hostname;
    } catch (error) {
      // URL 解析失败,使用字符串匹配
      return url.includes('augmentcode.com') ||
             url.includes('api.augmentcode.com') ||
             (tenantURL && url.includes(tenantURL.replace(/https?:\/\//, '')));
    }
  }

  /**
   * 清理资源
   */
  dispose() {
    this.logger.info('Disposing...');
  }
}

module.exports = AugmentTokenLoginEnhanced;
