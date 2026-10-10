/* Kisstr 站内无刷新导航（SPA 模式）
 * 拦截站内 .html 链接 → fetch 目标页 → 提取数据 → 就地重渲染，
 * 不整页刷新、不开新窗（音乐播放不断）。
 * 站外第三方链接保持新窗口打开。
 * 注：file:// 协议下浏览器禁止 fetch 本地文件，自动降级为整页跳转；
 * 本地预览请用 http://127.0.0.1:8017 或部署后体验。
 */
(function () {
  // ---- file:// 降级：只确保站外链接新窗口 ----
  if (location.protocol === 'file:') {
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (/^https?:\/\//i.test(href) && !a.getAttribute('target')) {
        a.setAttribute('target', '_blank');
      }
    }, true);
    return;
  }

  // ---- 提取目标页 ----
  function extractPage(html) {
    var d = { linksData: null, title: '', h1: '', logo: '', ranked: false, index: false, bodyHtml: '', extraStyle: '' };
    var m;
    m = /<title>([\s\S]*?)<\/title>/.exec(html); d.title = m ? m[1].trim() : '';
    m = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html); d.h1 = m ? m[1].trim() : '';
    m = /(?:const|var|let)\s+linksData\s*=\s*(\[[\s\S]*?\]);/.exec(html);
    if (m) { try { d.linksData = JSON.parse(m[1]); } catch (e) { d.linksData = null; } }
    m = /__KISSTR_LOGO__\s*=\s*'([^']*)'/.exec(html); d.logo = m ? m[1] : '';
    d.ranked = /__KISSTR_RANKED__\s*=\s*true/.test(html);
    d.index = /__KISSTR_INDEX__\s*=\s*true/.test(html);
    var st = html.match(/<style>[\s\S]*?<\/style>/g) || [];
    d.extraStyle = st.map(function (x) { return x.replace(/<\/?style>/g, ''); }).join('\n');
    if (!d.linksData) {
      m = /<body[^>]*>([\s\S]*?)<\/body>/.exec(html);
      if (m) d.bodyHtml = m[1].replace(/<a href="index\.html"[\s\S]*?<\/a>/, '').trim();
    }
    return d;
  }

  // ---- 应用目标页 ----
  function applyPage(d) {
    if (d.title) document.title = d.title;
    var heroH1 = document.querySelector('.hero h1');
    if (heroH1) heroH1.textContent = d.h1 || '';
    window.__KISSTR_LOGO__ = d.logo;
    var logoEl = document.getElementById('logoText');
    if (logoEl) logoEl.textContent = d.logo;
    window.__KISSTR_RANKED__ = d.ranked;
    window.__KISSTR_INDEX__ = d.index;
    var si = document.getElementById('searchInput');
    if (si) si.value = '';

    // 目标页独立样式（如 disclaimer 的内联样式）
    var styleEl = document.getElementById('kisstrSpaStyle');
    if (d.extraStyle) {
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'kisstrSpaStyle';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = d.extraStyle;
    } else if (styleEl) {
      styleEl.textContent = '';
    }

    var tabs = document.getElementById('categoryTabs');
    var main = document.getElementById('mainContent');
    var quoteEl = document.getElementById('quoteText');

    if (d.linksData) {
      linksData = d.linksData;
      currentCategory = linksData[0] ? linksData[0].name : 'all';
      lastSelectedCategory = currentCategory;
      renderCategories();
      renderLinks('', currentCategory);
      if (quoteEl && typeof literaryQuotes !== 'undefined' && literaryQuotes && literaryQuotes.length) {
        quoteEl.textContent = literaryQuotes[Math.floor(Math.random() * literaryQuotes.length)];
        quoteEl.classList.add('shown');
      }
    } else if (d.bodyHtml) {
      if (tabs) tabs.innerHTML = '';
      if (main) main.innerHTML = d.bodyHtml;
      if (quoteEl) { quoteEl.textContent = ''; quoteEl.classList.remove('shown'); }
    }

    // 关闭可能打开的弹层
    var modal = document.getElementById('backgroundModal');
    if (modal && modal.classList.contains('show')) modal.classList.remove('show');
    var panel = document.getElementById('stationListPanel');
    if (panel && panel.classList.contains('show')) panel.classList.remove('show');

    window.scrollTo(0, 0);
  }

  // ---- 加载目标页 ----
  function navTo(href) {
    fetch(href, { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error('load failed'); return r.text(); })
      .then(function (html) {
        var d = extractPage(html);
        applyPage(d);
        history.pushState({ kisstr: href }, '', href);
      })
      .catch(function () { window.location.href = href; });
  }

  // ---- 站内链接判定 ----
  // 例外：ai_projects / pinokio-audit 为独立应用页（自有渲染与模态框体系），
  // 页内嵌入会破坏其交互，保持整页跳转。
  var EXCLUDE_SPA = /(^|\/)(ai_projects|pinokio-audit)\.html$/i;
  function isInternalHref(href) {
    if (!href) return false;
    if (/^javascript:/i.test(href) || /^(data|blob|mailto|tel):/i.test(href)) return false;
    if (EXCLUDE_SPA.test(href.split('#')[0].split('?')[0])) return false;
    if (/^https?:\/\//i.test(href)) {
      try {
        var u = new URL(href);
        if (u.hostname === location.hostname && /\.html$/.test(u.pathname) && !EXCLUDE_SPA.test(u.pathname)) return true;
      } catch (e) {}
      return false;
    }
    var clean = href.split('#')[0].split('?')[0];
    return /\.html$/.test(clean);
  }

  // ---- 点击拦截（捕获阶段，统一处理） ----
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (!isInternalHref(href)) return;
    if (e.defaultPrevented) return;
    if (a.target === '_blank') { a.removeAttribute('target'); }
    e.preventDefault();
    navTo(href);
  }, true);

  // ---- 浏览器后退/前进 ----
  window.addEventListener('popstate', function (e) {
    var h = e.state && e.state.kisstr;
    if (h) navTo(h);
    else window.location.reload();
  });

  window.__SPA_NAV__ = navTo;
})();
