!(function () {
  'use strict'
  console.log('[AugmentInterceptor] ✅ IIFE 开始执行!')

  // 延迟显示弹窗,确保 vscode 模块已加载
  let vscodeModule = null
  try {
    vscodeModule = require('vscode')
  } catch (e) {
    console.error('[AugmentInterceptor] ❌ 无法加载 vscode 模块:', e)
  }

  try {
    const _0xe403a5 = require('vscode')
    if (
      _0xe403a5 &&
      _0xe403a5.window &&
      typeof _0xe403a5.window.registerUriHandler === 'function'
    ) {
      const _0x45d721 = _0xe403a5.window.registerUriHandler.bind(
        _0xe403a5.window
      )
      let _0x5ce410 = null
      const _0x5989d5 = (_0x2b225a) => {
        try {
          const _0xf855a8 = _0x2b225a && (_0x2b225a.path || '')
          return (
            _0xf855a8 === '/autoAuth' ||
            _0xf855a8 === 'autoAuth' ||
            _0xf855a8 === '/push-login' ||
            _0xf855a8 === 'push-login'
          )
        } catch (_0x3fcb62) {
          return false
        }
      }
      _0xe403a5.window.registerUriHandler = function (_0x1aa628) {
        const _0x1d91ef = {
          handleUri: async (_0x2a5858) => {
            try {
              if (_0x5ce410 && _0x5989d5(_0x2a5858)) {
                return await _0x5ce410(_0x2a5858)
              }
            } catch (_0x20adcb) {
              try {
                console.warn(
                  '[AugmentCompositeUri] deep-link handle failed:',
                  _0x20adcb
                )
              } catch (_0x2a62f8) {}
            }
            try {
              return _0x1aa628 && typeof _0x1aa628.handleUri === 'function'
                ? _0x1aa628.handleUri(_0x2a5858)
                : undefined
            } catch (_0x3962d7) {
              try {
                console.warn(
                  '[AugmentCompositeUri] delegate handle failed:',
                  _0x3962d7
                )
              } catch (_0x35c745) {}
            }
          },
        }
        return _0x45d721(_0x1d91ef)
      }
      const _0x277fb2 =
        typeof globalThis !== 'undefined'
          ? globalThis
          : typeof global !== 'undefined'
          ? global
          : {}
      _0x277fb2.Augment = _0x277fb2.Augment || {}
      _0x277fb2.Augment.setUriHandler = function (_0x13e258) {
        _0x5ce410 = _0x13e258
      }
    }
  } catch (_0x25151e) {
    console.error('[AugmentInterceptor] ❌ URI Handler 初始化失败:', _0x25151e)
  }
  console.log('[AugmentInterceptor] ✅ URI Handler 初始化完成')
  const _0x4f1e4a = function () {
    const _0x1fb7e0 = '0123456789abcdef'
    let _0x6c7206 = ''
    for (let _0x465b35 = 0; _0x465b35 < 36; _0x465b35++) {
      _0x6c7206 +=
        _0x465b35 === 8 ||
        _0x465b35 === 13 ||
        _0x465b35 === 18 ||
        _0x465b35 === 23
          ? '-'
          : _0x465b35 === 14
          ? '4'
          : _0x465b35 === 19
          ? _0x1fb7e0[8 + Math.floor(4 * Math.random())]
          : _0x1fb7e0[Math.floor(16 * Math.random())]
    }
    return _0x6c7206
  }

  // Session ID 持久化逻辑 (参考 augment-account-manager-1.0.28)
  function getStoredSessionId() {
    try {
      const fs = require('fs')
      const path = require('path')
      const os = require('os')
      const dir = path.join(os.homedir(), '.augmentpool')
      const file = path.join(dir, 'session.json')

      if (!fs.existsSync(file)) {
        return null
      }

      const data = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (data && data.sessionId) {
        console.log('[AugmentInterceptor] 📖 从文件系统读取到 sessionId:', data.sessionId)
        return data.sessionId
      }
      return null
    } catch (e) {
      console.warn('[AugmentInterceptor] ⚠️ 读取 sessionId 失败:', e.message)
      return null
    }
  }

  // 初始化 Session ID: 优先使用文件中的,否则生成新的
  let FAKE_SESSION_ID = getStoredSessionId()
  if (!FAKE_SESSION_ID) {
    // 生成新的 Session ID
    FAKE_SESSION_ID = _0x4f1e4a()
    console.log('[AugmentInterceptor] 🆕 生成新的 Session ID:', FAKE_SESSION_ID)

    // 保存到文件系统
    try {
      const fs = require('fs')
      const path = require('path')
      const os = require('os')
      const dir = path.join(os.homedir(), '.augmentpool')
      const file = path.join(dir, 'session.json')

      // 确保目录存在
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      // 保存 Session ID
      fs.writeFileSync(file, JSON.stringify({ sessionId: FAKE_SESSION_ID }, null, 2), 'utf8')
      console.log('[AugmentInterceptor] 💾 新 Session ID 已保存到文件系统')
    } catch (e) {
      console.warn('[AugmentInterceptor] ⚠️ 保存 Session ID 失败:', e.message)
    }

    // 弹窗显示新生成的 Session ID
    if (vscodeModule && vscodeModule.window) {
      setTimeout(() => {
        try {
          vscodeModule.window.showInformationMessage(`🆕 新 Session ID: ${FAKE_SESSION_ID.substring(0, 8)}...`)
        } catch (e) {
          console.error('[AugmentInterceptor] ❌ 弹窗失败:', e)
        }
      }, 1000)
    }
  } else {
    console.log('[AugmentInterceptor] 🎯 使用已保存的 Session ID:', FAKE_SESSION_ID)

    // 弹窗显示已保存的 Session ID
    if (vscodeModule && vscodeModule.window) {
      setTimeout(() => {
        try {
          vscodeModule.window.showInformationMessage(`🎯 已保存 Session ID: ${FAKE_SESSION_ID.substring(0, 8)}...`)
        } catch (e) {
          console.error('[AugmentInterceptor] ❌ 弹窗失败:', e)
        }
      }, 1000)
    }
  }

  const _0x49d423 = {
      'chat-stream': {
        enabled: true,
        description: '聊天流端点拦截器',
      },
      'record-request-events': {
        enabled: true,
        description: '请求事件记录端点拦截器',
      },
      'report-feature-vector': {
        enabled: true,
        description: '特征向量报告端点拦截器',
      },
    },
    _0x36ff72 = {
      'chat-stream': {
        shouldIntercept: function (_0x33292b) {
          return (
            typeof _0x33292b === 'string' && _0x33292b.includes('/chat-stream')
          )
        },
        processRequest: function (_0x397927) {
          try {
            let _0x7af81 = _0x397927.body || _0x397927.data
            if (!_0x7af81) {
              return { modified: false }
            }
            if (typeof _0x7af81 === 'string') {
              try {
                _0x7af81 = JSON.parse(_0x7af81)
              } catch (_0x5a43e0) {
                return { modified: false }
              }
            }
            if (
              _0x7af81 &&
              typeof _0x7af81 === 'object' &&
              _0x7af81.hasOwnProperty('blobs')
            ) {
              const _0x56bcc2 = _0x7af81.blobs || {}
              return (
                (_0x7af81.blobs = {
                  checkpoint_id: Object.prototype.hasOwnProperty.call(
                    _0x56bcc2,
                    'checkpoint_id'
                  )
                    ? _0x56bcc2.checkpoint_id
                    : null,
                  added_blobs: [],
                  deleted_blobs: [],
                }),
                {
                  modified: true,
                  body: JSON.stringify(_0x7af81),
                  data: JSON.stringify(_0x7af81),
                }
              )
            }
            return { modified: false }
          } catch (_0x4ca25f) {
            return { modified: false }
          }
        },
        isSpecial: true,
      },
      'record-request-events': {
        shouldIntercept: function (_0x5d6c33) {
          return (
            typeof _0x5d6c33 === 'string' &&
            _0x5d6c33.includes('/record-request-events')
          )
        },
        processRequest: function (_0x1507e6) {
          function _0x3e46cf() {
            const _0x110a15 = '0123456789abcdef'
            let _0x372f96 = ''
            for (let _0x4222cd = 0; _0x4222cd < 36; _0x4222cd++) {
              _0x372f96 +=
                _0x4222cd === 8 ||
                _0x4222cd === 13 ||
                _0x4222cd === 18 ||
                _0x4222cd === 23
                  ? '-'
                  : _0x4222cd === 14
                  ? '4'
                  : _0x4222cd === 19
                  ? _0x110a15[8 + Math.floor(4 * Math.random())]
                  : _0x110a15[Math.floor(16 * Math.random())]
            }
            return _0x372f96
          }
          function _0x19cc3a(_0x47576a) {
            if (typeof _0x47576a !== 'string') {
              return false
            }
            return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
              _0x47576a
            )
          }
          function _0x835658(_0x2a5b07, _0x1438fb = new Map()) {
            if (typeof _0x2a5b07 !== 'object' || _0x2a5b07 === null) {
              return _0x2a5b07
            }
            if (Array.isArray(_0x2a5b07)) {
              return _0x2a5b07.map((_0x46059b) =>
                _0x835658(_0x46059b, _0x1438fb)
              )
            }
            const _0x2b1891 = {}
            for (const [_0x2eeb94, _0x12ec6f] of Object.entries(_0x2a5b07)) {
              _0x2eeb94 === 'conversation_id' && _0x19cc3a(_0x12ec6f)
                ? (!_0x1438fb.has(_0x12ec6f) &&
                    _0x1438fb.set(_0x12ec6f, _0x3e46cf()),
                  (_0x2b1891[_0x2eeb94] = _0x1438fb.get(_0x12ec6f)))
                : (_0x2b1891[_0x2eeb94] =
                    typeof _0x12ec6f === 'object'
                      ? _0x835658(_0x12ec6f, _0x1438fb)
                      : _0x12ec6f)
            }
            return _0x2b1891
          }
          try {
            if (_0x1507e6.body || _0x1507e6.data) {
              const _0x57d9ef =
                  typeof _0x1507e6.body === 'string'
                    ? _0x1507e6.body
                    : typeof _0x1507e6.data === 'string'
                    ? _0x1507e6.data
                    : JSON.stringify(_0x1507e6.body || _0x1507e6.data || {}),
                _0x301117 = JSON.parse(_0x57d9ef),
                _0x5444ca = _0x835658(_0x301117, new Map())
              return JSON.stringify(_0x5444ca)
            }
            return _0x1507e6.body || _0x1507e6.data || {}
          } catch (_0x4eed79) {
            return _0x1507e6.body || _0x1507e6.data || {}
          }
        },
        isSpecial: false,
      },
      'report-feature-vector': {
        shouldIntercept: function (_0x29e9b5) {
          return (
            typeof _0x29e9b5 === 'string' &&
            _0x29e9b5.includes('/report-feature-vector')
          )
        },
        processRequest: function (_0x4089da) {
          function _0x47aeb8() {
            let _0x61af29 = ''
            for (let _0x568c93 = 0; _0x568c93 < 64; _0x568c93++) {
              _0x61af29 += '0123456789abcdef'[Math.floor(16 * Math.random())]
            }
            return _0x61af29
          }
          try {
            if (_0x4089da.body || _0x4089da.data) {
              const _0x23f3de =
                  typeof _0x4089da.body === 'string'
                    ? _0x4089da.body
                    : typeof _0x4089da.data === 'string'
                    ? _0x4089da.data
                    : JSON.stringify(_0x4089da.body || _0x4089da.data || {}),
                _0xf2db6f = JSON.parse(_0x23f3de)
              if (
                _0xf2db6f.feature_vector &&
                typeof _0xf2db6f.feature_vector === 'object'
              ) {
                const _0x3f36fa = {
                  _0x31d34e: _0x3d0bcc + '#' + _0x47aeb8(),
                  _0x31d34e: _0x47aeb8(),
                  _0x31d34e: _0x3256bb,
                  _0x31d34e: _0x3256bb,
                }
                for (const [_0x31d34e, _0x3256bb] of Object.entries(
                  _0xf2db6f.feature_vector
                )) {
                  if (typeof _0x3256bb === 'string') {
                    const _0x51c4e2 = _0x3256bb.includes('#')
                      ? _0x3256bb.split('#')[1]
                      : _0x3256bb
                    if (_0x51c4e2 && /^[0-9a-fA-F]{64}$/.test(_0x51c4e2)) {
                      if (_0x3256bb.includes('#')) {
                        const _0x3d0bcc = _0x3256bb.split('#')[0]
                      } else {
                      }
                    } else {
                    }
                  } else {
                  }
                }
                _0xf2db6f.feature_vector = _0x3f36fa
              }
              return JSON.stringify(_0xf2db6f)
            }
            return _0x4089da.body || _0x4089da.data || {}
          } catch (_0x31e68c) {
            return _0x4089da.body || _0x4089da.data || {}
          }
        },
        isSpecial: false,
      },
    },
    _0x5ad653 = new Map()
  function initializeInterceptors() {
    for (const [_0x55f869, _0x21488c] of Object.entries(_0x49d423)) {
      if (!_0x21488c.enabled) {
        continue
      }
      const _0x245372 = _0x36ff72[_0x55f869]
      _0x245372 && _0x5ad653.set(_0x55f869, _0x245372)
    }
  }
  function processInterceptedRequest(_0x8dc99d, _0x21486b) {
    for (const [_0x135e30, _0x488914] of _0x5ad653) {
      try {
        if (_0x488914.shouldIntercept(_0x8dc99d)) {
          if (!_0x488914.isSpecial) {
            return {
              type: 'modify',
              data: _0x488914.processRequest(_0x21486b),
              endpoint: _0x135e30,
            }
          } else {
            const _0x3f34ed = _0x488914.processRequest(_0x21486b)
            if (_0x3f34ed && _0x3f34ed.modified) {
              return {
                type: 'modify',
                data: _0x3f34ed,
              }
            }
          }
        }
      } catch (_0x10e5dc) {
        console.error('[Interceptor] Error processing request:', _0x10e5dc)
      }
    }
    return null
  }
  function isSessionId(_0x3fd0b1) {
    if (typeof _0x3fd0b1 !== 'string') {
      return false
    }
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        _0x3fd0b1
      )
    ) {
      return true
    }
    if (/^[0-9a-f]{32}$/i.test(_0x3fd0b1)) {
      return true
    }
    if (_0x3fd0b1.toLowerCase().includes('session')) {
      return true
    }
    return false
  }
  function updateFakeSessionId(_0x3bf807) {
    if (_0x3bf807 && typeof _0x3bf807 === 'string') {
      FAKE_SESSION_ID = _0x3bf807
      console.log('[AugmentInterceptor] SessionId updated to:', _0x3bf807)

      // 同时保存到文件系统
      try {
        const fs = require('fs')
        const path = require('path')
        const os = require('os')
        const dir = path.join(os.homedir(), '.augmentpool')
        const file = path.join(dir, 'session.json')

        // 确保目录存在
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }

        // 保存 Session ID
        fs.writeFileSync(file, JSON.stringify({ sessionId: _0x3bf807 }, null, 2), 'utf8')
        console.log('[AugmentInterceptor] 💾 Session ID saved to file system')
      } catch (e) {
        console.warn('[AugmentInterceptor] ⚠️ Failed to save Session ID to file:', e.message)
      }

      return true
    }
    return false
  }
  function getCurrentSessionId() {
    return FAKE_SESSION_ID
  }
  initializeInterceptors()
  console.log('[AugmentInterceptor] 我命由我不由天\uFF01')
  const _0x552698 = require
  require = function (_0x3f0f7d) {
    const module = _0x552698.apply(this, arguments)
    if (_0x3f0f7d === 'http' || _0x3f0f7d === 'https') {
      const _0x417d4a = module.request
      module.request = function (_0x272749, _0x393223) {
        const _0x35c6cf =
            _0x272749.url ||
            _0x272749.protocol +
              '//' +
              (_0x272749.hostname || _0x272749.host) +
              (_0x272749.path || ''),
          _0x235f69 = {
            url: _0x35c6cf,
            method: _0x272749.method || 'GET',
            headers: _0x272749.headers || {},
            body: null,
            data: null,
          },
          _0x3f575c = _0x417d4a.apply(this, arguments),
          _0x44ea3b = _0x3f575c.write,
          _0x55f5da = _0x3f575c.end
        _0x3f575c.write = function (_0xf2ca54) {
          return (
            _0xf2ca54 &&
              ((_0x235f69.body = (_0x235f69.body || '') + _0xf2ca54.toString()),
              (_0x235f69.data = _0x235f69.body)),
            _0x44ea3b.apply(this, arguments)
          )
        }
        if (_0x272749.headers) {
          for (const [_0x466250, _0x441afe] of Object.entries(
            _0x272749.headers
          )) {
            if (_0x466250.toLowerCase() === 'x-request-session-id') {
              isSessionId(_0x441afe) &&
                (_0x272749.headers[_0x466250] = FAKE_SESSION_ID)
              break
            }
          }
        }
        return (
          (_0x3f575c.end = function (_0x403873) {
            _0x403873 &&
              ((_0x235f69.body = (_0x235f69.body || '') + _0x403873.toString()),
              (_0x235f69.data = _0x235f69.body))
            const _0xc21372 = processInterceptedRequest(_0x35c6cf, _0x235f69)
            if (_0xc21372 && _0xc21372.type === 'modify' && _0xc21372.data) {
              if (typeof _0xc21372.data === 'object' && _0xc21372.data.body) {
                _0x403873 = _0xc21372.data.body
              } else {
                typeof _0xc21372.data === 'string' &&
                  (_0x403873 = _0xc21372.data)
              }
            }
            return _0x55f5da.call(this, _0x403873)
          }),
          _0x3f575c
        )
      }
    }
    return (
      _0x3f0f7d === 'axios' &&
        module.interceptors &&
        module.interceptors.request &&
        module.interceptors.request.use(
          function (_0x254ea0) {
            const _0xd003ba = {
                url: _0x254ea0.url,
                method: _0x254ea0.method,
                headers: _0x254ea0.headers || {},
                body: _0x254ea0.data || null,
                data: _0x254ea0.data || null,
              },
              _0x80c3dc = processInterceptedRequest(_0x254ea0.url, _0xd003ba)
            if (_0x80c3dc && _0x80c3dc.type === 'modify' && _0x80c3dc.data) {
              if (typeof _0x80c3dc.data === 'object' && _0x80c3dc.data.body) {
                _0x254ea0.data = _0x80c3dc.data.body
              } else {
                typeof _0x80c3dc.data === 'string' &&
                  (_0x254ea0.data = _0x80c3dc.data)
              }
            }
            return (
              _0x254ea0.headers &&
                _0x254ea0.headers['x-request-session-id'] &&
                isSessionId(_0x254ea0.headers['x-request-session-id']) &&
                  (_0x254ea0.headers['x-request-session-id'] = FAKE_SESSION_ID),
              _0x254ea0
            )
          },
          function (_0x20e7a5) {
            return Promise.reject(_0x20e7a5)
          }
        ),
      module
    )
  }
  if (
    typeof global !== 'undefined' &&
    global.fetch &&
    !global['_fetchIntercepted']
  ) {
    const _0xcd6893 = global.fetch
    global.fetch = async function (_0x28b2e8, _0x1f9ab6 = {}) {
      try {
        const _0x444064 = { ..._0x1f9ab6 },
          _0x55d8ce = {
            url: _0x28b2e8,
            method: _0x444064.method || 'GET',
            headers: _0x444064.headers || {},
            body: _0x444064.body || null,
            data: _0x444064.body || null,
          },
          _0x44acec = processInterceptedRequest(_0x28b2e8, _0x55d8ce)
        if (_0x44acec && _0x44acec.type === 'modify' && _0x44acec.data) {
          if (typeof _0x44acec.data === 'object' && _0x44acec.data.body) {
            _0x444064.body = _0x44acec.data.body
          } else {
            typeof _0x44acec.data === 'string' &&
              (_0x444064.body = _0x44acec.data)
          }
        }
        if (_0x444064.headers) {
          const _0x46ef31 = new Headers(_0x444064.headers)
          _0x46ef31.has('x-request-session-id') &&
            isSessionId(_0x46ef31.get('x-request-session-id')) &&
              _0x46ef31.set('x-request-session-id', FAKE_SESSION_ID)
          _0x444064.headers = _0x46ef31
        }
        return _0xcd6893.call(this, _0x28b2e8, _0x444064)
      } catch (_0x287597) {
        return (
          console.error(
            '[AugmentInterceptor] Error in fetch interceptor:',
            _0x287597
          ),
          _0xcd6893.call(this, _0x28b2e8, _0x1f9ab6)
        )
      }
    }
    Object.setPrototypeOf(global.fetch, _0xcd6893)
    Object.defineProperty(global.fetch, 'name', { value: 'fetch' })
    global['_fetchIntercepted'] = true
  }
  if (
    typeof XMLHttpRequest !== 'undefined' &&
    !XMLHttpRequest['_intercepted']
  ) {
    const _0x5e3f2c = XMLHttpRequest
    global.XMLHttpRequest = class extends _0x5e3f2c {
      constructor() {
        super()
        this['_augment_url'] = null
        this['_augment_method'] = null
        this['_augment_headers'] = {}
      }
      ['open'](_0x20a40a, _0x3baba3, _0x3e22c1, _0x2ef384, _0x5d5abd) {
        return (
          (this['_augment_url'] = _0x3baba3),
          (this['_augment_method'] = _0x20a40a),
          super.open(_0x20a40a, _0x3baba3, _0x3e22c1, _0x2ef384, _0x5d5abd)
        )
      }
      ['setRequestHeader'](_0x1dd291, _0x135901) {
        this['_augment_headers'] = this['_augment_headers'] || {}
        this['_augment_headers'][_0x1dd291] = _0x135901
        if (
          _0x1dd291.toLowerCase() === 'x-request-session-id' &&
          isSessionId(_0x135901)
        ) {
          return super.setRequestHeader(_0x1dd291, FAKE_SESSION_ID)
        }
        return super.setRequestHeader(_0x1dd291, _0x135901)
      }
      async ['send'](_0x3b0672) {
        try {
          const _0x4074a0 = {
              url: this['_augment_url'],
              method: this['_augment_method'],
              headers: this['_augment_headers'] || {},
              body: _0x3b0672 || null,
              data: _0x3b0672 || null,
            },
            _0x194c8b = processInterceptedRequest(
              this['_augment_url'],
              _0x4074a0
            )
          if (_0x194c8b && _0x194c8b.type === 'modify' && _0x194c8b.data) {
            if (typeof _0x194c8b.data === 'object' && _0x194c8b.data.body) {
              _0x3b0672 = _0x194c8b.data.body
            } else {
              typeof _0x194c8b.data === 'string' && (_0x3b0672 = _0x194c8b.data)
            }
          }
        } catch (_0xec3a13) {
          console.error(
            '[AugmentInterceptor] Error in XMLHttpRequest interceptor:',
            _0xec3a13
          )
        }
        return super.send(_0x3b0672)
      }
    }
    XMLHttpRequest['_intercepted'] = true
  }
  const FAKE_IDENTIFIERS = {
    uuid: [8, 4, 4, 4, 12]
      .map((_0x33b41e) =>
        Array.from(
          { length: _0x33b41e },
          () => '0123456789ABCDEF'[Math.floor(16 * Math.random())]
        ).join('')
      )
      .join('-'),
    serialNumber: (() => {
      const _0x14e517 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      return (
        'C02' +
        Array.from(
          { length: 8 },
          () => _0x14e517[Math.floor(36 * Math.random())]
        ).join('')
      )
    })(),
    macAddress:
      'Mac-' +
      Array.from(
        { length: 16 },
        () => '0123456789ABCDEF'[Math.floor(16 * Math.random())]
      ).join(''),
    windowsGuid:
      '{' +
      [8, 4, 4, 4, 12]
        .map((_0x43c847) =>
          Array.from(
            { length: _0x43c847 },
            () => '0123456789ABCDEF'[Math.floor(16 * Math.random())]
          ).join('')
        )
        .join('-') +
      '}',
    productId: (() => {
      const _0x748a5e = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      return Array.from(
        { length: 20 },
        () => _0x748a5e[Math.floor(36 * Math.random())]
      ).join('')
    })(),
    windowsSerial: (() => {
      const _0x46231b = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      return Array.from(
        { length: 10 },
        () => _0x46231b[Math.floor(36 * Math.random())]
      ).join('')
    })(),
  }
  function spoofIoregOutput(_0x11c8d5) {
    if (!_0x11c8d5 || typeof _0x11c8d5 !== 'string') {
      return _0x11c8d5
    }
    let _0x197f72 = _0x11c8d5
    _0x197f72 = _0x197f72.replace(
      /"IOPlatformUUID"\s*=\s*"[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}"/g,
      '"IOPlatformUUID" = "' + FAKE_IDENTIFIERS.uuid + '"'
    )
    _0x197f72 = _0x197f72.replace(
      /"IOPlatformSerialNumber"\s*=\s*"[A-Z0-9]+"/g,
      '"IOPlatformSerialNumber" = "' + FAKE_IDENTIFIERS.serialNumber + '"'
    )
    return (
      (_0x197f72 = _0x197f72.replace(
        /"board-id"\s*=\s*<"Mac-[0-9A-Fa-f]+">/g,
        '"board-id" = <"' + FAKE_IDENTIFIERS.macAddress + '">'
      )),
      _0x197f72
    )
  }
  function spoofWindowsRegistryOutput(_0x3cff27) {
    if (!_0x3cff27 || typeof _0x3cff27 !== 'string') {
      return _0x3cff27
    }
    let _0x22f542 = _0x3cff27
    _0x22f542 = _0x22f542.replace(
      /(MachineGuid\s+REG_SZ\s+)\{[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}\}/g,
      '$1' + FAKE_IDENTIFIERS.windowsGuid
    )
    _0x22f542 = _0x22f542.replace(
      /(ProductId\s+REG_SZ\s+)[A-Z0-9\-]+/g,
      '$1' + FAKE_IDENTIFIERS.productId
    )
    return (
      (_0x22f542 = _0x22f542.replace(
        /(SerialNumber\s+REG_SZ\s+)[A-Z0-9]+/g,
        '$1' + FAKE_IDENTIFIERS.windowsSerial
      )),
      _0x22f542
    )
  }
  function spoofGitOutput(_0x419d4d, _0x124ba4) {
    return _0x419d4d &&
      typeof _0x124ba4 === 'string' &&
      _0x419d4d.includes('git ')
      ? ''
      : _0x124ba4
  }
  if (typeof require !== 'undefined') {
    const _0xfff8cc = _0x552698
    require = function (_0x35d15e) {
      const module = _0xfff8cc.apply(this, arguments)
      if (_0x35d15e === 'child_process') {
        const _0x3beae3 = module.exec,
          _0x11b3e5 = module.execSync,
          _0x214fc0 = module.spawn
        module.exec = function (_0x4a6b91, _0x203be9, _0x2b2dbe) {
          if (typeof _0x4a6b91 === 'string') {
            return _0x3beae3.call(
              this,
              _0x4a6b91,
              _0x203be9,
              function (_0x303526, _0x228238, _0x17d9ab) {
                if (_0x303526) {
                  return _0x4a6b91.includes('git ')
                    ? _0x2b2dbe(null, '', _0x17d9ab || '')
                    : _0x2b2dbe(_0x303526, _0x228238, _0x17d9ab)
                }
                if (_0x228238) {
                  let _0x2e6f57 = '',
                    _0x3f80ba = false
                  if (_0x4a6b91.includes('ioreg')) {
                    _0x2e6f57 = spoofIoregOutput(_0x228238)
                    _0x3f80ba = true
                  } else {
                    if (_0x4a6b91.includes('git ')) {
                      _0x2e6f57 = spoofGitOutput(_0x4a6b91, _0x228238)
                      _0x3f80ba = true
                    } else {
                      ;(_0x4a6b91.includes('REG.exe QUERY') ||
                        _0x4a6b91.includes('reg query') ||
                        _0x4a6b91.includes('wmic') ||
                        _0x4a6b91.includes('systeminfo')) &&
                        ((_0x2e6f57 = spoofWindowsRegistryOutput(_0x228238)),
                        (_0x3f80ba = true))
                    }
                  }
                  _0x2b2dbe(null, _0x3f80ba ? _0x2e6f57 : _0x228238, _0x17d9ab)
                } else {
                  _0x2b2dbe(null, '', _0x17d9ab || '')
                }
              }
            )
          }
          return _0x3beae3.apply(this, arguments)
        }
        module.execSync = function (_0x49fccf, _0x13dea6) {
          if (typeof _0x49fccf !== 'string') {
            return _0x11b3e5.apply(this, arguments)
          }
          try {
            const _0x49551c = _0x11b3e5.apply(this, arguments)
            if (_0x49551c && _0x49551c.length > 0) {
              const _0x4c3815 = _0x49551c.toString()
              let _0x531211 = '',
                _0x3d9dab = false
              if (_0x49fccf.includes('ioreg')) {
                _0x531211 = spoofIoregOutput(_0x4c3815)
                _0x3d9dab = true
              } else {
                if (_0x49fccf.includes('git ')) {
                  _0x531211 = spoofGitOutput(_0x49fccf, _0x4c3815)
                  _0x3d9dab = true
                } else {
                  ;(_0x49fccf.includes('REG.exe QUERY') ||
                    _0x49fccf.includes('reg query') ||
                    _0x49fccf.includes('wmic') ||
                    _0x49fccf.includes('systeminfo')) &&
                    ((_0x531211 = spoofWindowsRegistryOutput(_0x4c3815)),
                    (_0x3d9dab = true))
                }
              }
              return Buffer.from(_0x3d9dab ? _0x531211 : _0x4c3815)
            }
            return Buffer.from('')
          } catch (_0x5db4bb) {
            if (_0x49fccf.includes('git ')) {
              return Buffer.from('')
            }
            throw _0x5db4bb
          }
        }
        module.spawn = function (_0x5cc76a, _0x29f45b, _0x3672f6) {
          return _0x214fc0.apply(this, arguments)
        }
      }
      return module
    }
  }
  function createExtensionWrapper(_0x59aa07 = {}) {
    return {
      ..._0x59aa07,
      activate: async function (_0x33744d) {
        try {
          _0x59aa07.activate &&
            typeof _0x59aa07.activate === 'function' &&
            (await _0x59aa07.activate(_0x33744d),
            console.log(
              '[AugmentInterceptor] Original activate function executed'
            ))
          console.log(
            '[AugmentInterceptor] Extension activation completed successfully'
          )
        } catch (_0x4e9581) {
          console.error(
            '[AugmentInterceptor] Extension activation failed:',
            _0x4e9581
          )
          throw _0x4e9581
        }
      },
      deactivate: function () {
        try {
          _0x59aa07.deactivate &&
            typeof _0x59aa07.deactivate === 'function' &&
            (_0x59aa07.deactivate(),
            console.log(
              '[AugmentInterceptor] Original deactivate function executed'
            ))
          console.log('[AugmentInterceptor] Extension deactivation completed')
        } catch (_0x334e8e) {
          console.error(
            '[AugmentInterceptor] Extension deactivation failed:',
            _0x334e8e
          )
        }
      },
    }
  }
  typeof module !== 'undefined' &&
    module.exports &&
    (module.exports = {
      processInterceptedRequest: processInterceptedRequest,
      FAKE_SESSION_ID: FAKE_SESSION_ID,
      FAKE_IDENTIFIERS: FAKE_IDENTIFIERS,
      initializeInterceptors: initializeInterceptors,
      isSessionId: isSessionId,
      updateFakeSessionId: updateFakeSessionId,
      getCurrentSessionId: getCurrentSessionId,
      spoofIoregOutput: spoofIoregOutput,
      spoofWindowsRegistryOutput: spoofWindowsRegistryOutput,
      spoofGitOutput: spoofGitOutput,
      createExtensionWrapper: createExtensionWrapper,
      wrapAsExtension: function (_0xbbf5d7) {
        return createExtensionWrapper(_0xbbf5d7)
      },
    })
  typeof global !== 'undefined' &&
    (global.AugmentInterceptor = {
      processInterceptedRequest: processInterceptedRequest,
      // 使用 getter 确保始终返回最新的 Session ID
      get FAKE_SESSION_ID() {
        return FAKE_SESSION_ID
      },
      FAKE_IDENTIFIERS: FAKE_IDENTIFIERS,
      initializeInterceptors: initializeInterceptors,
      updateFakeSessionId: updateFakeSessionId,
      getCurrentSessionId: getCurrentSessionId,
      createExtensionWrapper: createExtensionWrapper,
      wrapAsExtension: function (_0x16e97a) {
        return createExtensionWrapper(_0x16e97a)
      },
    })
})()
