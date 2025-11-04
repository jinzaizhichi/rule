/**
 * Clash for Windows Mixin JS
 * 专为「富途牛牛」强制走香港节点
 * 策略组：🇭🇰 富途牛牛
 */

function main(config) {
  const LOG = (msg) => console.log(`[富途牛牛覆写] ${msg}`);

  try {
    // ==================== 1. 富途牛牛域名列表 ====================
    const FUTU_DOMAINS = [
      // 主域名
      'futu.com', 'futunn.com', 'futuhk.com',
      'futu5.com', 'futuniuni.com',
      'futunnopen.com', 'futusec.com',

      // API / WebSocket
      'openapi.futunn.com',
      'openapi.futu.com',
      'quotes.futu.com',
      'quotes.futunn.com',
      'stream.futu.com',
      'stream.futunn.com',

      // 其他常见
      'futunncdn.com', 'futuweb.com', 'moomoo.com'
    ];

    // ==================== 2. 自动收集香港节点 ====================
    const proxies = config.proxies || [];
    const hkNodes = proxies
      .filter(p => {
        const n = p.name.toLowerCase();
        return n.includes('港') || n.includes('hk') || n.includes('hong') || n.includes('hkg');
      })
      .map(p => p.name);

    if (hkNodes.length === 0) {
      LOG('未检测到香港节点，跳过创建策略组');
      return config;
    }

    LOG(`检测到 ${hkNodes.length} 个香港节点：${hkNodes.join(', ')}`);

    // ==================== 3. 创建或更新策略组 ====================
    const GROUP_NAME = '🇭🇰 富途牛牛';
    const GROUP_TYPE = 'select'; // 可改为 url-test 自动测速

    if (!config['proxy-groups']) config['proxy-groups'] = [];

    let futuGroup = config['proxy-groups'].find(g => g.name === GROUP_NAME);
    if (!futuGroup) {
      futuGroup = {
        name: GROUP_NAME,
        type: GROUP_TYPE,
        proxies: hkNodes,
        icon: 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/Hong%20Kong.png' // 可选图标
      };
      config['proxy-groups'].unshift(futuGroup); // 插入最前
      LOG(`创建策略组：${GROUP_NAME}`);
    } else {
      futuGroup.proxies = [...new Set([...futuGroup.proxies, ...hkNodes])];
      LOG(`更新策略组：${GROUP_NAME}，共 ${futuGroup.proxies.length} 个节点`);
    }

    // ==================== 4. 插入高优先级规则（最前面）===================
    const newRules = [];

    // 精确匹配域名后缀
    FUTU_DOMAINS.forEach(domain => {
      newRules.push(`DOMAIN-SUFFIX,${domain},${GROUP_NAME}`);
    });

    // 模糊匹配（防漏网）
    newRules.push(`DOMAIN-KEYWORD,futu,${GROUP_NAME}`);
    newRules.push(`DOMAIN-KEYWORD,moomoo,${GROUP_NAME}`);

    // 插入到规则最前面（优先匹配）
    newRules.forEach(rule => {
      if (!config.rules.some(r => r === rule)) {
        config.rules.unshift(rule);
      }
    });

    LOG(`插入 ${newRules.length} 条富途牛牛专用规则`);

  } catch (err) {
    console.error('[富途牛牛覆写错误]', err);
  }

  return config;
}
