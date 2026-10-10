/* 壁纸 URL 绝对化：CSS 拆分后公共样式位于 assets/，CSS 变量值中的相对 url() 会基于
   assets/ 解析导致壁纸 404。这里在写入变量前把相对路径解析为基于文档的绝对 URL，
   使 var() 引用不再受样式表位置影响（兼容 http:// 与 file:// 本地预览）。 */
function resolveAssetUrl(url) {
  if (!url) return url;
  if (/^(https?:)?\/\//i.test(url) || url.indexOf('data:') === 0 || url.indexOf('blob:') === 0) return url;
  try {
    return new URL(url, document.baseURI).href;
  } catch (e) {
    return url;
  }
}

function getInitial(name) {
  return name.charAt(0).toUpperCase();
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getColorFromName(name) {
  const colors = [
    'linear-gradient(135deg, #7c6df1, #9b8af5)',
    'linear-gradient(135deg, #e87a8d, #f09aa8)',
    'linear-gradient(135deg, #f0a050, #f5b878)',
    'linear-gradient(135deg, #4cb88a, #6fc8a5)',
    'linear-gradient(135deg, #a06ee8, #b890f0)',
    'linear-gradient(135deg, #e870a8, #f090c0)',
    'linear-gradient(135deg, #5099d4, #70b0e0)',
    'linear-gradient(135deg, #3db8a8, #5fc8ba)',
    'linear-gradient(135deg, #c4a050, #d4b870)',
    'linear-gradient(135deg, #8070e0, #9888f0)',
    'linear-gradient(135deg, #50c878, #70d898)',
    'linear-gradient(135deg, #e87070, #f09090)'
  ];
  const index = hashCode(name) % colors.length;
  return colors[index];
}
function renderCategories() {
  const tabsContainer = document.getElementById('categoryTabs');
  tabsContainer.innerHTML = '';

  if (!window.__KISSTR_INDEX__) {
  const homeBtn = document.createElement('button');
  homeBtn.className = 'tab-btn return-home-tab';
  homeBtn.textContent = '\u8FD4\u56DE\u9996\u9875';
  homeBtn.title = '\u8FD4\u56DE\u9996\u9875';
  homeBtn.addEventListener('click', (e) => {
    if (window.__SPA_NAV__) window.__SPA_NAV__('index.html');
    else window.location.href = 'index.html';
    e.currentTarget.blur();
  });
  tabsContainer.appendChild(homeBtn);
  }

  linksData.forEach((cat, index) => {
    if (cat.name === '索引' && !window.__KISSTR_INDEX__) return;
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (index === 0 ? ' active' : '');
    btn.textContent = cat.name;
    btn.dataset.category = cat.name;

    // 分类级彩蛋：连续点击标签页按钮 3 次触发
    if (cat.easterEggUrl) {
      btn.dataset.eggClicks = '0';
      btn.addEventListener('click', () => {
        const clicks = Number(btn.dataset.eggClicks || '0') + 1;
        btn.dataset.eggClicks = String(clicks);
        clearTimeout(btn._eggTimer);
        if (clicks >= 3) {
          btn.dataset.eggClicks = '0';
          window.open(cat.easterEggUrl, '_blank', 'noopener');
        } else {
          btn._eggTimer = setTimeout(() => {
            btn.dataset.eggClicks = '0';
          }, 900);
        }
      });
    }

    btn.addEventListener('click', (e) => { filterByCategory(cat.name); e.currentTarget.blur(); });
    tabsContainer.appendChild(btn);
  });

  const searchWrapper = document.createElement('div');
  searchWrapper.className = 'search-wrapper';
  searchWrapper.innerHTML = `
    <div class="search-inline" id="searchInline">
      <svg class="search-icon" viewBox="0 0 24 24">
        <path d="M10.8 4.5a6.3 6.3 0 1 0 3.96 11.2l3.42 3.42a1 1 0 0 0 1.42-1.42l-3.42-3.42A6.3 6.3 0 0 0 10.8 4.5zm0 2a4.3 4.3 0 1 1 0 8.6 4.3 4.3 0 0 1 0-8.6z"/>
      </svg>
      <input type="text" id="searchInput" placeholder="搜索...">
    </div>
  `;
  tabsContainer.appendChild(searchWrapper);
}

function openUrlInNewTab(url) {
  if (!url || url === '#') return;
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
}

function getIndexCardClickUrl(url) {
  if (!url || url === '#') return url || '';
  try {
    var parsed = new URL(url, window.location.href);
    if (parsed.hostname === 'kisstr.com' || parsed.hostname === 'www.kisstr.com') {
      return parsed.pathname.replace(/^\//, '') + parsed.search + parsed.hash;
    }
  } catch (err) {}
  return url;
}

function getIndexCardDragUrl(url) {
  if (!url || url === '#') return url || '';
  try {
    var parsed = new URL(url, window.location.href);
    if (parsed.hostname === 'kisstr.com' || parsed.hostname === 'www.kisstr.com') {
      return 'https://kisstr.com' + parsed.pathname + parsed.search + parsed.hash;
    }
  } catch (err) {
    if (/^[^:/?#]+\.html(?:[?#].*)?$/.test(url)) {
      return 'https://kisstr.com/' + url;
    }
  }
  if (/^[^:/?#]+\.html(?:[?#].*)?$/.test(url)) {
    return 'https://kisstr.com/' + url;
  }
  return url;
}
function prepareStealthLinkCard(card, url) {
  if (!card) return card;
  var clickUrl = getIndexCardClickUrl(url);
  var dragUrl = getIndexCardDragUrl(url);
  card.dataset.url = clickUrl || '';
  card.dataset.dragUrl = dragUrl || clickUrl || '';
  
  if (clickUrl && clickUrl !== '#') {
    card.setAttribute('href', clickUrl);
    card.setAttribute('target', '_blank');
    card.setAttribute('rel', 'noopener,noreferrer');
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
  } else {
    card.removeAttribute('href');
    card.removeAttribute('target');
    card.removeAttribute('rel');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-disabled', 'true');
    return card;
  }

  card.addEventListener('click', function(e) {
    // 仅拦截左键点击，让中键、右键、拖拽等原生行为正常工作
    if (e.button !== 0) return;
    // 如果按下了修饰键（Ctrl/Cmd/Shift/Alt），让浏览器原生处理
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    openUrlInNewTab(card.dataset.url);
    if (e.currentTarget && e.currentTarget.blur) e.currentTarget.blur();
  });

  card.addEventListener('auxclick', function(e) {
    if (e.button !== 1) return;
    e.preventDefault();
    openUrlInNewTab(card.dataset.url);
  });

  card.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    openUrlInNewTab(card.dataset.url);
  });

  // 自定义拖拽预览：仅显示名字和网址，不显示完整卡片
  card.addEventListener('dragstart', function(e) {
    var dragUrl = card.dataset.dragUrl || card.dataset.url || card.getAttribute('href') || '';
    if (dragUrl) {
      try {
        e.dataTransfer.setData('text/uri-list', dragUrl);
        e.dataTransfer.setData('text/plain', dragUrl);
      } catch(ex) {}
    }
    e.dataTransfer.effectAllowed = 'copyLink';

    var nameEl = card.querySelector('.link-name') || card.querySelector('.ai-card-name');
    var nameText = nameEl ? nameEl.textContent : '';
    var urlText = dragUrl.replace(/^https?:\/\//, '');

    var dragEl = document.createElement('div');
    dragEl.style.cssText = 'position:fixed;top:-9999px;left:-9999px;padding:8px 14px;background:#fff;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.15);font-size:14px;font-family:system-ui,-apple-system,sans-serif;z-index:-1;pointer-events:none;';
    var nameDiv = document.createElement('div');
    nameDiv.style.cssText = 'font-weight:600;color:#1a1a1a;margin-bottom:2px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    nameDiv.textContent = nameText;
    var urlDiv = document.createElement('div');
    urlDiv.style.cssText = 'color:#86868b;font-size:12px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    urlDiv.textContent = urlText;
    dragEl.appendChild(nameDiv);
    dragEl.appendChild(urlDiv);
    document.body.appendChild(dragEl);

    e.dataTransfer.setDragImage(dragEl, 10, 10);

    setTimeout(function() { if (dragEl.parentNode) dragEl.parentNode.removeChild(dragEl); }, 0);
  });

  return card;
}

function createLinkCard(link, catIndex, linkIndex, rank) {
  const cat = linksData[catIndex];

  // ===== 全球AI分类：渲染附件风格卡片 =====
  if (cat && cat.name === '全球 AI' && link._aiCompany) {
    return createAiCard(link, linkIndex);
  }

  const card = document.createElement('a');
  card.className = 'link-card';

  // 为音乐分类卡片添加标记，用于黑胶旋转
  if (cat && cat.subcategories) {
    const subcat = cat.subcategories.find(s => s.links && s.links.includes(link));
    if (subcat && subcat.name === '音乐') {
      card.classList.add('cat-music');
    }
  }

  prepareStealthLinkCard(card, link.url);

  const linkIcon = document.createElement('div');
  linkIcon.className = 'link-icon';
  linkIcon.textContent = getInitial(link.name);
  linkIcon.style.background = getColorFromName(link.name);

  const linkInfo = document.createElement('div');
  linkInfo.className = 'link-info';

  const linkName = document.createElement('div');
  linkName.className = 'link-name';
  linkName.textContent = rank ? rank + '. ' + link.name : link.name;

  const linkUrl = document.createElement('div');
  linkUrl.className = 'link-url';
  linkUrl.textContent = link.url.replace(/^https?:\/\//, '');

  const linkDesc = document.createElement('div');
  linkDesc.className = 'link-desc';
  linkDesc.textContent = link.description;

  linkInfo.appendChild(linkName);
  linkInfo.appendChild(linkUrl);
  if (link.description) {
    linkInfo.appendChild(linkDesc);
  }

  const arrow = document.createElement('div');
  arrow.className = 'link-arrow';
  arrow.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>';

  const inner = document.createElement('div');
  inner.className = 'link-card-inner';
  inner.appendChild(linkIcon);
  inner.appendChild(linkInfo);

  card.appendChild(inner);
  card.appendChild(arrow);

  return card;
}

// ===== 全球AI卡片渲染（与网站卡片统一特效） =====
function createAiCard(link, linkIndex) {
  const isClosed = !!link._aiCloseDate;
  const card = document.createElement('a');
  card.className = 'ai-link-card';

  if (isClosed || !link.url) {
    prepareStealthLinkCard(card, '');
  } else {
    prepareStealthLinkCard(card, link.url);
  }

  // 内容包裹层（用于3D translateZ）
  const inner = document.createElement('div');
  inner.className = 'ai-card-inner';

  // 顶部：名称 + 排名徽章
  const top = document.createElement('div');
  top.className = 'ai-card-top';

  const nameEl = document.createElement('div');
  nameEl.className = 'ai-card-name';
  nameEl.textContent = link.name;
  top.appendChild(nameEl);

  const rank = document.createElement('div');
  rank.className = 'ai-rank-badge';
  rank.textContent = (linkIndex + 1);
  top.appendChild(rank);

  inner.appendChild(top);

  // 公司
  const companyEl = document.createElement('div');
  companyEl.className = 'ai-card-company';
  companyEl.textContent = '🏢 ' + link._aiCompany;
  inner.appendChild(companyEl);

  // 描述（完整显示，不截断）
  const descEl = document.createElement('div');
  descEl.className = 'ai-card-desc';
  descEl.textContent = link.description;
  inner.appendChild(descEl);

  // 已停运原因
  if (isClosed && link._aiCloseReason) {
    const reasonEl = document.createElement('div');
    reasonEl.className = 'ai-card-close-reason';
    reasonEl.textContent = '停运原因：' + link._aiCloseReason;
    inner.appendChild(reasonEl);
  }

  // 标签
  if (link._aiTags && link._aiTags.length) {
    const tagsWrap = document.createElement('div');
    tagsWrap.className = 'ai-card-tags';
    link._aiTags.forEach(t => {
      const tag = document.createElement('span');
      let tagClass = 'ai-tag';
      if (t === '停运' || t.indexOf('停运') > -1) tagClass += ' closed';
      else if (t.indexOf('开源') > -1) tagClass += ' open-source';
      else if (t.indexOf('闭源') > -1) tagClass += ' closed-source';
      tag.className = tagClass;
      tag.textContent = t;
      tagsWrap.appendChild(tag);
    });
    // 已停运额外标签
    if (isClosed) {
      const closedTag = document.createElement('span');
      closedTag.className = 'ai-tag closed';
      closedTag.textContent = '停运 ' + link._aiCloseDate;
      tagsWrap.appendChild(closedTag);
    }
    inner.appendChild(tagsWrap);
  } else if (isClosed) {
    const tagsWrap = document.createElement('div');
    tagsWrap.className = 'ai-card-tags';
    const closedTag = document.createElement('span');
    closedTag.className = 'ai-tag closed';
    closedTag.textContent = '停运 ' + link._aiCloseDate;
    tagsWrap.appendChild(closedTag);
    inner.appendChild(tagsWrap);
  }

  // 底部：评分
  const bottom = document.createElement('div');
  bottom.className = 'ai-card-bottom';

  const scoreEl = document.createElement('span');
  scoreEl.className = 'ai-score';
  scoreEl.textContent = link._aiScore;
  bottom.appendChild(scoreEl);

  inner.appendChild(bottom);

  card.appendChild(inner);

  return card;
}

function filterLinks(links, filterText) {
  if (!filterText) return links;
  const lower = filterText.toLowerCase();
  return links.filter(link =>
    link.name.toLowerCase().includes(lower) ||
    link.url.toLowerCase().includes(lower) ||
    link.description.toLowerCase().includes(lower)
  );
}

let isFirstRender = true;

function renderLinks(filterText = '', category = 'all') {
  const main = document.getElementById('mainContent');
  if (!main) {
    console.error('mainContent 容器未找到');
    return;
  }
  main.innerHTML = '';

  if (!linksData || !linksData.length) {
    console.error('linksData 为空或未定义');
    main.innerHTML = '<div class="empty-message">暂无数据，请刷新页面</div>';
    return;
  }

  if (isFirstRender) {
    isFirstRender = false;
  }

  doRenderLinks(filterText, category);
}

function doRenderLinks(filterText, category) {
  const main = document.getElementById('mainContent');
  if (!main) return;
  main.innerHTML = '';

  let hasResults = false;

  linksData.forEach((cat, catIndex) => {
    if (category !== 'all' && cat.name !== category) return;

    const section = document.createElement('section');
    section.className = 'category-section';
    section.id = 'category-' + catIndex;

    const header = document.createElement('div');
    header.className = 'category-header';

    const icon = document.createElement('div');
    icon.className = 'category-icon';
    icon.style.background = cat.color;
    icon.textContent = cat.icon;

    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = cat.name;

    header.appendChild(icon);
    header.appendChild(title);
    section.appendChild(header);

    if (cat.subcategories) {
      cat.subcategories.forEach((subcat, subIndex) => {
        const filteredLinks = filterLinks(subcat.links, filterText);
        if (filteredLinks.length === 0) return;
        hasResults = true;

        const subcategory = document.createElement('div');
        subcategory.className = 'subcategory';

        const isMinimalLayout = document.body.classList.contains('layout-minimal');

        let globalRank = 0;
        const grid = document.createElement('div');
        grid.className = (cat.name === '全球 AI') ? 'ai-grid' : 'links-grid';

        if (isMinimalLayout && subcat.name && !subcat.hideTitle) {
          const titleCard = document.createElement('div');
          titleCard.className = 'link-card subcategory-title-card';
          titleCard.innerHTML = `
            <div class="link-card-inner">
              <div class="link-info">
                <div class="link-name">${subcat.name}</div>
                ${subcat.enName ? `<div class="link-url">${subcat.enName}</div>` : ''}
              </div>
            </div>
          `;
          if (subcat.easterEggUrl) {
            titleCard.style.cursor = 'pointer';
            titleCard.dataset.eggClicks = '0';
            titleCard.addEventListener('click', () => {
              const clicks = Number(titleCard.dataset.eggClicks || '0') + 1;
              titleCard.dataset.eggClicks = String(clicks);
              clearTimeout(titleCard._eggTimer);
              if (clicks >= 3) {
                titleCard.dataset.eggClicks = '0';
                window.open(subcat.easterEggUrl, '_blank', 'noopener');
              } else {
                titleCard._eggTimer = setTimeout(() => {
                  titleCard.dataset.eggClicks = '0';
                }, 900);
              }
            });
          }
          grid.appendChild(titleCard);
        }

        filteredLinks.forEach((link, linkIndex) => {
          const card = window.__KISSTR_RANKED__ ? createLinkCard(link, catIndex, linkIndex, ++globalRank) : createLinkCard(link, catIndex, subIndex * 10 + linkIndex);
          grid.appendChild(card);
        });

        subcategory.appendChild(grid);
        section.appendChild(subcategory);
      });
    } else {
      const filteredLinks = filterLinks(cat.links, filterText);
      if (filteredLinks.length === 0) return;
      hasResults = true;

      const grid = document.createElement('div');
      grid.className = 'links-grid';

      filteredLinks.forEach((link, linkIndex) => {
        const card = window.__KISSTR_RANKED__ ? createLinkCard(link, catIndex, linkIndex, linkIndex + 1) : createLinkCard(link, catIndex, linkIndex);
        grid.appendChild(card);
      });

      section.appendChild(grid);
    }

    if (hasResults || (cat.subcategories && cat.subcategories.some(s => filterLinks(s.links, filterText).length > 0)) || (!cat.subcategories && filterLinks(cat.links, filterText).length > 0)) {
      main.appendChild(section);
    }
  });

  if (!hasResults) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.innerHTML = `
      <div class="no-results-icon">🔍</div>
      <h3>没有找到相关结果</h3>
      <p>试试其他关键词吧</p>
    `;
    main.appendChild(noResults);
  }
}

let currentCategory = linksData[0].name;
let lastSelectedCategory = linksData[0].name;

function filterByCategory(category) {
  currentCategory = category;
  lastSelectedCategory = category;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
  const searchInput = document.getElementById('searchInput');
  const searchValue = searchInput ? searchInput.value : '';
  renderLinks(searchValue, category);
}

const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

// 第一布局（经典）使用7个主题，第二布局（杂志）不使用极光青、暮光橙、星空蓝
const themesGrid = ['dream', 'forest', 'deepsea', 'clay', 'aurora', 'sunset', 'starry', 'midnight', 'ink', 'twilight', 'ocean', 'mint', 'dawn', 'white'];
const themesMinimal = ['dream', 'forest', 'deepsea', 'clay', 'midnight', 'ink', 'twilight', 'ocean', 'mint', 'dawn', 'white'];
const themeNamesGrid = ['梦幻粉', '森林绿', '深海蓝', '暖陶土', '极光青', '暮光橙', '星空蓝', '深夜黑', 'Linear 黑', '晨曦紫', '海洋蓝', '薄荷青', '晨曦粉', '经典白'];
const themeNamesMinimal = ['梦幻粉', '森林绿', '深海蓝', '暖陶土', '深夜黑', 'Linear 黑', '晨曦紫', '海洋蓝', '薄荷青', '晨曦粉', '经典白'];

// 暗色主题列表（显示太阳图标）
const darkThemes = ['midnight', 'starry', 'sunset', 'aurora', 'dream', 'forest', 'deepsea', 'clay', 'ink'];

function getCurrentLayout() {
  return document.body.classList.contains('layout-minimal') ? 'minimal' : 'minimal';
}

function getThemes() {
  return getCurrentLayout() === 'minimal' ? themesMinimal : themesGrid;
}

function getThemeNames() {
  return getCurrentLayout() === 'minimal' ? themeNamesMinimal : themeNamesGrid;
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme_' + getCurrentLayout(), theme);

  const themes = getThemes();
  const themeNames = getThemeNames();
  const themeIndex = themes.indexOf(theme);

  const themeColors = {
    "white": "#f5f5f7",
    "dawn": "#fff5f5",
    "mint": "#f0fff5",
    "ocean": "#f0f8ff",
    "twilight": "#f5f0ff",
    "midnight": "#000212",
    "starry": "#0c0c1d",
    "sunset": "#2d1b0e",
    "aurora": "#1a2a3a",
    "dream": "#667eea",
    "forest": "#2d5f4e",
    "deepsea": "#1a4a6e",
    "clay": "#6b4a35",
    "ink": "#08090a"
  };
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');

  const currentLayout = getCurrentLayout();
  if (currentLayout === "minimal") {
    document.documentElement.style.backgroundColor = "#ffffff";
    if (metaThemeColor) metaThemeColor.setAttribute("content", "#ffffff");
  } else if (themeColors[theme]) {
    document.documentElement.style.backgroundColor = themeColors[theme];
    if (metaThemeColor) metaThemeColor.setAttribute("content", themeColors[theme]);
  }

  if (darkThemes.includes(theme)) {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  } else {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  }

  // 动态更新主题按钮提示
  if (themeIndex >= 0) {
    themeToggle.title = themeNames[themeIndex];
  }
}

function loadThemeForLayout(layout) {
  const themes = layout === 'minimal' ? themesMinimal : themesGrid;
  const savedTheme = localStorage.getItem('theme_' + layout);
  let theme = savedTheme;

  if (!theme) {
    theme = 'dream';
  }

  if (!themes.includes(theme)) {
    theme = 'dream';
  }

  setTheme(theme);
}

themeToggle.addEventListener('click', (e) => {
  const current = document.documentElement.getAttribute('data-theme') || 'dream';
  const themes = getThemes();
  const currentIndex = themes.indexOf(current);
  const nextTheme = themes[(currentIndex + 1) % themes.length];
  setTheme(nextTheme);
  const themeNames = getThemeNames();
  const themeIndex = themes.indexOf(nextTheme);
  e.currentTarget.blur();
});

// 渲染分类和搜索框
renderCategories();
// Logo 点击刷新页面
document.querySelector('.logo').addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
  window.location.reload();
  return false;
});


  // 隐藏按钮：切换隐私模式（链接变透明）
  const hideToggle = document.getElementById('hideToggle');
  if (hideToggle) {
    hideToggle.addEventListener('click', (e) => {
      document.body.classList.toggle('hide-mode');
      e.currentTarget.blur();
    });
  }

// 布局切换
const layoutToggle = document.getElementById('layoutToggle');
const layoutBtn = layoutToggle.querySelector('.layout-btn');

function setLayout(layout) {
  if (layout === 'grid') layout = 'clear';
  localStorage.setItem('layout', layout);
  document.body.classList.remove('layout-minimal', 'layout-clear');
  if (layout === 'clear') {
    document.body.classList.add('layout-minimal', 'layout-clear');
  } else {
    document.body.classList.add('layout-' + layout);
  }

  
  let isImageBackground = false;
  let savedBackgroundOption = null;
  try {
    const savedBackground = localStorage.getItem('kisstr_background_picker_selection_v1');
    savedBackgroundOption = savedBackground ? JSON.parse(savedBackground) : null;
    isImageBackground = !savedBackgroundOption || !!(savedBackgroundOption && savedBackgroundOption.type === 'image' && savedBackgroundOption.url);
  } catch (err) {
    savedBackgroundOption = null;
    isImageBackground = false;
  }
  if (isImageBackground) {
    let bgImageValue = '';
    if (savedBackgroundOption && savedBackgroundOption.url) {
      const bgUrl = String(savedBackgroundOption.url).replace('anime_wallpapers/', 'wallpapers/').replace('.jpg', '.webp');
      const overlay = layout === 'grid'
        ? ['rgba(18, 18, 36, 0.34)', 'rgba(18, 18, 36, 0.43)']
        : ['rgba(18, 18, 36, 0.42)', 'rgba(18, 18, 36, 0.52)'];
      bgImageValue = `linear-gradient(to bottom, ${overlay[0]}, ${overlay[1]}), url('${resolveAssetUrl(bgUrl)}')`;
    }
    document.body.classList.add('background-image-mode');
    if (bgImageValue) document.body.style.setProperty('--bg-image', bgImageValue);
    document.documentElement.classList.add('background-image-mode');
    if (bgImageValue) document.documentElement.style.setProperty('--bg-image', bgImageValue);
    document.documentElement.style.backgroundColor = '#121224';
  } else if (layout === 'minimal') {
    document.documentElement.style.backgroundColor = '#ffffff';
  } else {
    document.documentElement.style.backgroundColor = '#f5f5f7';
  }

  // 布局二 logo 显示英文艺术字体
  const logoText = document.getElementById('logoText');
  if (logoText) {
    logoText.textContent = window.__KISSTR_LOGO__ || '';
  }

  // 动态更新布局按钮提示
  if (layoutBtn) {
    if (layout === 'clear') {
      layoutBtn.title = '清晰布局';
    } else if (layout === 'minimal') {
      layoutBtn.title = '杂志布局';
    } else {
      layoutBtn.title = '清晰布局';
    }
  }

  if (!isImageBackground) {
    // 切换布局时不切换主题，保持当前主题不变
  } else if (themeToggle) {
    themeToggle.title = '\u56FE\u7247\u80CC\u666F';
  }

  // 切换布局时重新调整音乐律动 canvas 尺寸
  if (typeof mbResize === 'function') {
    setTimeout(mbResize, 50);
  }
  // 律动栏布局逻辑
  if (typeof mbStop === 'function') {
    setTimeout(() => {
      if (layout === 'grid') {
        musicBarBottom.classList.remove('active', 'idle');
        mbActive = false;
        mbIdle = false;
        if (mbRAF) { cancelAnimationFrame(mbRAF); mbRAF = null; }
        mbCtx2.setTransform(1, 0, 0, 1, 0, 0);
        mbCtx2.clearRect(0, 0, musicBarBottom.width, musicBarBottom.height);
        const dpr5 = window.devicePixelRatio || 1;
        mbCtx2.setTransform(dpr5, 0, 0, dpr5, 0, 0);
      } else {
        if (isPlaying && !mbClosed) {
          mbIdle = false;
          mbActive = true;
          musicBarBottom.classList.remove('idle');
          musicBarBottom.classList.add('active');
          mbResize();
          if (!mbRAF) mbDraw();
          mbResetAutoHide();
        } else if (!mbActive) {
          mbIdle = true;
          musicBarBottom.classList.add('idle');
          if (!mbRAF) mbDraw();
          mbResetAutoHide();
        }
      }
    }, 60);
  }

  const searchInput = document.getElementById('searchInput');
  const searchValue = searchInput ? searchInput.value : '';
  renderLinks(searchValue, currentCategory);
}

const layoutDefaultVersion = 'v143-magazine-default';
if (localStorage.getItem('layoutDefaultVersion') !== layoutDefaultVersion) {
  localStorage.setItem('layout', 'minimal');
  localStorage.setItem('layoutDefaultVersion', layoutDefaultVersion);
}
const savedLayout = localStorage.getItem('layout') || 'minimal';
setLayout(savedLayout);

layoutBtn.addEventListener('click', (e) => {
  const currentLayout = document.body.classList.contains('layout-clear') ? 'clear' : 'minimal';
  const newLayout = currentLayout === 'clear' ? 'minimal' : 'clear';
  setLayout(newLayout);
  e.currentTarget.blur();
});

const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

backToTop.addEventListener('click', (e) => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  e.currentTarget.blur();
});

// 音乐播放器
const lofiAudio = document.getElementById('lofiAudio');
const musicPlayer = document.getElementById('musicPlayer');
const musicPlay = document.getElementById('musicPlay');
const musicPlayIcon = document.getElementById('musicPlayIcon');
const musicPrev = document.getElementById('musicPrev');
const musicNext = document.getElementById('musicNext');
const musicName = document.getElementById('musicName');
const musicVolume = document.getElementById('musicVolume');

// 音乐源列表
const lofiStations = [
  // ===== 原有SomaFM电台（保留） =====
  { name: 'Chillhop慵懒', path: 'groovesalad-128-mp3' },
  { name: 'Lush氛围女声', path: 'lush-128-mp3' },
  { name: 'Chillhop经典', path: 'gsclassic-128-mp3' },
  { name: 'Ambient氛围', path: 'dronezone-128-mp3' },
  { name: 'DeepSpace深空', path: 'deepspaceone-128-mp3' },
  { name: 'SpaceStation空间站', path: 'spacestation-128-mp3' },
  { name: 'Beat深屋节拍', path: 'beatblender-128-mp3' },
  { name: 'Secret间谍风', path: 'secretagent-128-mp3' },
  // ===== 保留的https电台 =====
  { name: 'LofiGirl洛菲女孩', url: 'https://play.streamafrica.net/lofiradio' },
  { name: 'ChillhopMusic奇乐嘻哈', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
  // ===== SomaFM额外电台 =====
  { name: 'DefCon黑客防御', path: 'defcon-128-mp3' },
  { name: 'BootLiquor酒靴乡村', path: 'bootliquor-128-mp3' },
  { name: 'Covers翻唱精选', path: 'covers-128-mp3' },
  { name: 'MissionControl任务控制', path: 'missioncontrol-128-mp3' },
  { name: 'SonicUniverse音速宇宙', path: 'sonicuniverse-128-mp3' },
  { name: 'TheTrip迷幻旅程', path: 'thetrip-128-mp3' },
  { name: 'Underground80s地下80年代', path: 'u80s-128-mp3' },
  // ===== SomaFM筛选可用 =====
  { name: 'Digitalis洋地黄迷幻', url: 'https://ice5.somafm.com/digitalis-128-mp3' },
  { name: 'SevenInchSoul七寸灵魂', url: 'https://ice5.somafm.com/7soul-128-mp3' },
  { name: 'Vaporwaves蒸汽波', url: 'https://ice5.somafm.com/vaporwaves-128-mp3' },
  { name: 'BossaBeyond波萨诺瓦', url: 'https://ice5.somafm.com/bossa-128-mp3' },
  { name: 'TikiTime提基时光', url: 'https://ice5.somafm.com/tikitime-128-mp3' },
  // ===== 爵士、氛围、电子 =====
  { name: 'FluxFM流动奇乐', url: 'https://streams.fluxfm.de/Chillhop/mp3-128' },
  { name: 'HotmixMotown热混音城', url: 'https://streaming.hotmixradio.fr/hotmix-motown-en-mp3' },
  // ===== 复古、世界音乐、轻音乐 =====
  { name: 'OuiFM法国独立', url: 'https://ouifm.ice.infomaniak.ch/ouifm-high.mp3' },
  { name: 'HotmixMovies热混影视', url: 'https://streaming.hotmixradio.fr/hotmix-movies-en-mp3' },
  // ===== SomaFM追加 =====
  { name: 'Fluid流体碎拍', url: 'https://ice5.somafm.com/fluid-128-mp3' },
  { name: 'SuburbsOfGoa果阿郊区', url: 'https://ice5.somafm.com/suburbsofgoa-128-mp3' },
  { name: 'ThistleRadio蓟花民谣', url: 'https://ice5.somafm.com/thistle-128-mp3' },
  // ===== Ambient/Chillout =====
  { name: 'SmoothChill平滑放松', url: 'https://streams.fluxfm.de/SmoothChill/mp3-128' },
  // ===== 古典音乐 =====
  { name: 'ClassicFM经典调频', url: 'https://icecast.thisisdax.com/ClassicFMMP3' },
  // ===== 电子音乐 =====
  { name: 'FriskyDeep欢跃深度', url: 'https://stream.friskyradio.com/frisky_deep.mp3' },
  // ===== 摇滚/爵士/综合 =====
  { name: 'FIPRadio自由电台', url: 'https://icecast.radiofrance.fr/fip-high.mp3' },
  // ===== 电台清单新增（2026-09，共 131 个） =====
  { name: 'IndiePop独立流行', path: 'indiepop-128-mp3' },
  { name: 'MetalDetector金属探测', path: 'metal-128-mp3' },
  { name: 'BlackRock黑岩', path: 'brfm-128-mp3' },
  { name: 'PopTron流行电子', path: 'poptron-128-mp3' },
  { name: 'SF1033旧金山地下', path: 'sf1033-128-mp3' },
  { name: 'Cliqhop智能舞曲', path: 'cliqhop-128-mp3' },
  { name: 'DubStepBeyond低音回响', path: 'dubstep-128-mp3' },
  { name: 'TheInSound复古欧陆', path: 'insound-128-mp3' },
  { name: 'N5MD现代实验', path: 'n5md-128-mp3' },
  { name: 'Doomed暗黑氛围', path: 'doomed-128-mp3' },
  { name: 'Chillits露营氛围', path: 'chillits-128-mp3' },
  { name: 'SomaFM特别节目', path: 'specials-128-mp3' },
  { name: 'SomaFM现场', path: 'live-128-mp3' },
  { name: 'TheDarkZone深暗氛围', path: 'darkzone-128-mp3' },
  { name: 'REYFM洛菲', url: 'https://listen.reyfm.de/lofi_64kbps.mp3' },
  { name: 'Chillofi卡洛佐', url: 'https://streams.dez.ovh/listen/chillofi/radio.mp3' },
  { name: 'BigFM2000s年代', url: 'https://stream.bigfm.de/2000er/mp3-128/stream.bigfm.de/' },
  { name: 'BigFM嘻哈', url: 'https://stream.bigfm.de/hiphop/aac-128/stream.bigfm.de/' },
  { name: 'RadioParadise主频道', url: 'https://stream-tx3.radioparadise.com/mp3-192' },
  { name: 'RadioParadise世界音乐', url: 'https://stream.radioparadise.com/world-192' },
  { name: 'KUSC古典', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KUSCMP128.mp3' },
  { name: 'WNYC纽约公共', url: 'https://fm939.wnyc.org/wnycfm' },
  { name: 'WQXR古典', url: 'https://stream.wqxr.org/wqxr' },
  { name: 'WXPN独立摇滚', url: 'https://wxpnhi.xpn.org/xpnhi' },
  { name: 'KNKX爵士公共', url: 'https://knkx-live-a.edge.audiocdn.com/6284_128k' },
  { name: 'Jazz24爵士', url: 'https://knkx-live-a.edge.audiocdn.com/6285_128k' },
  { name: 'WCPE古典', url: 'https://audio-mp3.ibiblio.org/wcpe.mp3' },
  { name: 'WDAV古典', url: 'https://audio-mp3.ibiblio.org/wdav-112k' },
  { name: 'SmoothUK英国舒缓', url: 'https://media-ice.musicradio.com/SmoothUKMP3' },
  { name: 'NPORadio2荷兰二台', url: 'https://icecast.omroep.nl/radio2-bb-mp3' },
  { name: 'NPO3FM荷兰三台', url: 'https://icecast.omroep.nl/3fm-bb-mp3' },
  { name: 'NPOKlassiek荷兰古典', url: 'https://icecast.omroep.nl/radio4-bb-mp3' },
  { name: 'NPORadio5荷兰五台', url: 'https://icecast.omroep.nl/radio5-bb-mp3' },
  { name: 'KINK另类摇滚', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KINKAAC.aac' },
  { name: 'Sublime灵魂爵士', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SUBLIME.mp3' },
  { name: 'StudioBrussel布鲁塞尔', url: 'https://icecast.vrtcdn.be/stubru-high.mp3' },
  { name: 'TSFJazz爵士', url: 'https://tsfjazz.ice.infomaniak.ch/tsfjazz-high.mp3' },
  { name: 'JazzRadioFrance法国爵士', url: 'https://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3' },
  { name: 'RadioMeuh梅乌', url: 'https://radiomeuh.ice.infomaniak.ch/radiomeuh-128.mp3' },
  { name: 'FGRadio电子', url: 'https://radiofg.impek.com/fg.mp3' },
  { name: 'NostalgieFrance怀旧', url: 'https://scdn.nrjaudio.fm/fr/30001/mp3_128.mp3' },
  { name: 'DeutschlandfunkKultur文化', url: 'https://st01.sslstream.dlf.de/dlf/01/128/mp3/stream.mp3' },
  { name: 'FluxFM另类', url: 'https://streams.fluxfm.de/FluxFM/mp3-128' },
  { name: 'FluxFM80年代', url: 'https://streams.fluxfm.de/80s/mp3-128' },
  { name: 'FluxFMX频道', url: 'https://streams.fluxfm.de/FluxFMX/mp3-128' },
  { name: 'FluxFM柏林', url: 'https://streams.fluxfm.de/berlin/mp3-128' },
  { name: 'RadioEins柏林一台', url: 'https://radioeins.de/livemp3' },
  { name: 'RadioSwissJazz瑞士爵士', url: 'https://stream.srg-ssr.ch/m/rsj/mp3_128' },
  { name: 'RadioSwissClassic瑞士古典', url: 'https://stream.srg-ssr.ch/m/rsc_de/mp3_128' },
  { name: 'RadioSwissClassic2瑞士古典二台', url: 'https://stream.srg-ssr.ch/m/rsc_it/mp3_128' },
  { name: 'RadioSwissPop瑞士流行', url: 'https://stream.srg-ssr.ch/m/rsp/mp3_128' },
  { name: 'Klara古典艺术台', url: 'https://icecast.vrtcdn.be/klara-high.mp3' },
  { name: 'VRTRadio1一台', url: 'https://icecast.vrtcdn.be/radio1-high.mp3' },
  { name: 'NPORadio1Music音乐台', url: 'https://icecast.omroep.nl/radio1-bb-mp3' },
  { name: '80s80s德国八十年代', url: 'https://streams.80s80s.de/web/mp3-192/streams.80s80s.de/' },
  { name: 'BigFMLoFiFocus专注', url: 'https://stream.bigfm.de/lofifocus/mp3-128/stream.bigfm.de/' },
  { name: 'BigFMSunsetLounge日落酒廊', url: 'https://stream.bigfm.de/sunsetlounge/mp3-128/stream.bigfm.de/' },
  { name: 'BigFMReggaeVibes雷鬼', url: 'https://stream.bigfm.de/reggaevibes/aac-128/stream.bigfm.de/' },
  { name: 'FluxFMChillhopAAC奇乐嘻哈', url: 'https://channels.fluxfm.de/chillhop/externalembedflxhp/stream.aac' },
  { name: 'KEXP西雅图独立音乐', url: 'https://kexp.streamguys1.com/kexp160.aac' },
  { name: 'NIALoFi洛菲', url: 'https://radio.nia.nc/radio/8020/lofi-hq-stream.aac' },
  { name: 'CapitalChill伦敦舒缓', url: 'https://media-ice.musicradio.com/CapitalChillMP3' },
  { name: 'RadioParadise舒缓', url: 'https://stream.radioparadise.com/mellow-128' },
  { name: 'RadioParadise摇滚', url: 'https://stream.radioparadise.com/rock-192' },
  { name: 'RadioParadise320AAC高音质', url: 'https://stream.radioparadise.com/aac-320' },
  { name: 'RadioParadise128AAC', url: 'https://stream.radioparadise.com/aac-128' },
  { name: 'RadioRipley里普利摇滚', url: 'https://radioripley.fr:8000/live' },
  { name: 'Synphaera星界氛围', path: 'synphaera-128-mp3' },
  { name: 'LeftCoast70s西岸七十年代', path: 'seventies-128-mp3' },
  { name: 'DroneZone2氛围二台', path: 'dz2-128-mp3' },
  { name: 'FolkForward民谣前行', path: 'folkfwd-128-mp3' },
  { name: 'IllinoisStreetLounge伊利诺伊酒廊', path: 'illstreet-128-mp3' },
  { name: 'GrooveSalad256高音质', path: 'groovesalad-256-mp3' },
  { name: 'Underground80s256高音质', path: 'u80s-256-mp3' },
  { name: 'LeftCoast70s320高音质', path: 'seventies-320-mp3' },
  { name: 'SpaceStation320高音质', path: 'spacestation-320-mp3' },
  { name: 'BossaBeyond256高音质', path: 'bossa-256-mp3' },
  { name: 'Digitalis256高音质', path: 'digitalis-256-mp3' },
  { name: 'DEFCON256高音质', path: 'defcon-256-mp3' },
  { name: 'WFUV福特汉姆大学台', url: 'https://music.wfuv.org/music-hi' },
  { name: 'KUT奥斯汀公共电台', url: 'https://streams.kut.org/5020_192.mp3' },
  { name: 'WRSU罗格斯大学台', url: 'https://wrsu-libstrm.radioca.st/stream' },
  { name: 'KUAF爵士台', url: 'https://war.streamguys1.com:7031/kuaf3' },
  { name: 'RadioCalico卡利可', url: 'https://radio3.radio-calico.com:8443/calico' },
  { name: '威尼斯古典一台', url: 'https://uk2.streamingpulse.com/ssl/vcr1' },
  { name: '威尼斯古典二台', url: 'https://uk2.streamingpulse.com/ssl/vcr2' },
  { name: 'SmoothJazzHouse深屋爵士', url: 'https://smoothjazz.cdnstream1.com/2586_320.mp3' },
  { name: 'SmoothJazzGlobal环球爵士', url: 'https://smoothjazz.cdnstream1.com/2585_320.mp3' },
  { name: 'RadioSwissPopAAC瑞士流行', url: 'https://livestreaming-node-4.srg-ssr.ch/srgssr/rsp/aac/96' },
  { name: 'RadioSwissClassicAAC瑞士古典', url: 'https://livestreaming-node-2.srg-ssr.ch/srgssr/rsc_de/aac/96' },
  { name: 'RadioSwissJazzAAC瑞士爵士', url: 'https://livestreaming-node-4.srg-ssr.ch/srgssr/rsj/aac/96' },
  { name: 'VRTMNM舞曲台', url: 'https://icecast.vrtcdn.be/mnm-high.mp3' },
  { name: 'VRTRadioBene', url: 'https://icecast.vrtcdn.be/radiobene-high.mp3' },
  { name: 'VRTStuBru永恒金曲', url: 'https://icecast.vrtcdn.be/stubru_tijdloze-high.mp3' },
  { name: 'VRTStuBruUNTZ电子', url: 'https://icecast.vrtcdn.be/stubru_untz-high.mp3' },
  { name: 'KUAF阿肯色公共电台', url: 'https://war.streamguys1.com:7031/kuaf2' },
  { name: 'VRTMNM劲歌台', url: 'https://icecast.vrtcdn.be/mnm_hits-high.mp3' },
  { name: 'VRTStuBru重吉他', url: 'https://icecast.vrtcdn.be/stubru_bruut-high.mp3' },
  { name: 'VRTStuBru零零年代', url: 'https://icecast.vrtcdn.be/stubru_dejarennul-high.mp3' },
  { name: 'Guldkanalen七十年代', url: 'https://stream.dbmedia.se/gk70talMP3' },
  { name: 'Guldkanalen八十年代', url: 'https://stream.dbmedia.se/gk80talMP3' },
  { name: 'Guldkanalen九十年代', url: 'https://stream.dbmedia.se/gk90talMP3' },
  { name: 'PulsRadio舞曲', url: 'https://icecast.pulsradio.com:80/puls80HD.mp3' },
  { name: 'PulsRadio迷幻', url: 'https://icecast.pulsradio.com:80/pulstranceHD.mp3' },
  { name: 'PulsRadio酒廊', url: 'https://icecast.pulsradio.com/relaxHD.mp3' },
  { name: 'NTS慢焦点', url: 'https://stream-relay-geo.ntslive.net/stream' },
  { name: 'FriskyRadio自由电子', url: 'https://stream.friskyradio.com/frisky_mp3_hi' },
  { name: 'PeacedPiano宁静钢琴', url: 'https://peacefulpiano.stream.publicradio.org/peacefulpiano.aac' },
  { name: 'WhisperingSoloPiano低语独奏钢琴', url: 'https://pianosolo.streamguys1.com/live' },
  { name: 'MPRRelax明尼苏达舒缓', url: 'https://relax.stream.publicradio.org/relax.aac' },
  { name: 'MPRGuitarFavorites吉他精选', url: 'https://favorites.stream.publicradio.org/guitar.aac' },
  { name: 'EpicLounge钢琴爵士酒廊', url: 'https://stream.epic-lounge.com/piano-jazz-bar' },
  { name: 'VermontPublicClassical佛蒙特古典', url: 'https://vprclassical.streamguys1.com/vprclassical128.mp3' },
  { name: 'KODA休斯顿古典', url: 'https://stream.revma.ihrhls.com/zc2017' },
  { name: 'KlassikRadio新古典', url: 'https://stream.klassikradio.de/newclassics/mp3-192/stream.klassikradio.de/' },
  { name: 'KlassikRadio电影配乐', url: 'https://stream.klassikradio.de/movie/mp3-192/stream.klassikradio.de/' },
  { name: 'KlassikRadio古典梦境', url: 'https://stream.klassikradio.de/dreams/mp3-192/stream.klassikradio.de/' },
  { name: 'KlassikRadio歌剧', url: 'https://stream.klassikradio.de/opera/mp3-192/stream.klassikradio.de/' },
  { name: 'KlassikRadio摇滚遇上古典', url: 'https://stream.klassikradio.de/rockmeetsclassic/mp3-192/stream.klassikradio.de/' },
  { name: 'KlassikRadio巴西风情', url: 'https://stream.klassikradio.de/brazil/mp3-192/stream.klassikradio.de/' },
  { name: 'KlassikRadio顺滑爵士', url: 'https://stream.klassikradio.de/smooth/mp3-192/stream.klassikradio.de/' },
  { name: 'KlassikRadio古典摇滚', url: 'https://stream.klassikradio.de/klassikrock/mp3-192/stream.klassikradio.de/' },
  { name: 'KlassikRadio纯威尔第', url: 'https://stream.klassikradio.de/pureverdi/mp3-192/stream.klassikradio.de/' },
  { name: 'KlassikRadio酒廊', url: 'https://stream.klassikradio.de/lounge/mp3-192/stream.klassikradio.de/' },
  { name: 'KlassikRadio纯钢琴', url: 'https://stream.klassikradio.de/piano/mp3-192/stream.klassikradio.de/' },
  { name: 'KlassikRadio巴洛克', url: 'https://stream.klassikradio.de/barock/mp3-192/stream.klassikradio.de/' },
  { name: 'KlassikRadio酒廊节拍', url: 'https://stream.klassikradio.de/loungebeat/mp3-192/stream.klassikradio.de/' },
  { name: 'KlassikRadio合唱', url: 'https://stream.klassikradio.de/chor/mp3-192/stream.klassikradio.de/' },
  { name: 'KlassikRadio让米歇尔雅尔', url: 'https://stream.klassikradio.de/jeanmicheljarre/mp3-192/stream.klassikradio.de/' },
  { name: 'KlassikRadio纯巴赫', url: 'https://stream.klassikradio.de/purebach/mp3-192/stream.klassikradio.de/' },
  { name: 'KlassikRadio纯贝多芬', url: 'https://stream.klassikradio.de/purebeethoven/mp3-192/stream.klassikradio.de/' },

];

let currentStation = 0;
let currentStationSource = 0;
let isPlaying = false;

lofiAudio.volume = 0.5;
musicName.textContent = lofiStations[0].name;
musicName.title = lofiStations[0].name;

// 音量控制
musicVolume.addEventListener('input', () => {
  lofiAudio.volume = musicVolume.value / 100;
});

// ===== 电台控制变量 =====
let isChangingStation = false;
let stationRetryCount = 0;
let stationUnlockTimer = null;
let playbackWatchTimer = null;
const stationHosts = ['ice5', 'ice1', 'ice2', 'ice4', 'ice6'];
const MAX_RETRIES = lofiStations.length * stationHosts.length;

function getStationUrl(station, sourceIndex = 0) {
  if (station.url) return station.url;
  const host = stationHosts[sourceIndex % stationHosts.length];
  return `https://${host}.somafm.com/${station.path}`;
}

// ===== 播放按钮图标更新 =====
function updatePlayButton(playing) {
  if (playing) {
    musicPlayIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    musicPlay.classList.add('playing');
  } else {
    musicPlayIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    musicPlay.classList.remove('playing');
  }
}

// ===== 加载电台 =====
function loadStation(index, sourceIndex = 0) {
  const station = lofiStations[index];
  currentStationSource = sourceIndex % stationHosts.length;
  musicName.textContent = station.name;
  musicName.title = station.name;
  lofiAudio.preload = 'none';
  lofiAudio.crossOrigin = 'anonymous';
  lofiAudio.src = getStationUrl(station, currentStationSource);
  lofiAudio.load();
}

// ===== 播放音频（处理 AbortError）=====
function playAudio() {
  clearTimeout(playbackWatchTimer);
  return lofiAudio.play().then(() => {
    playbackWatchTimer = setTimeout(() => {
      if (isPlaying && !lofiAudio.paused && lofiAudio.currentTime < 0.5) {
        console.warn('电台连接超时，尝试备用音源');
        tryNextStationSource();
      }
    }, 4500);
  }).catch(e => {
    // AbortError 是正常的（快速切台时旧播放被中止），不需要重试
    if (e.name === 'AbortError') {
      stationRetryCount = 0;
      return;
    }
    throw e;
  });
}

function stopRadioPlayback() {
  clearTimeout(playbackWatchTimer);
  isPlaying = false;
  updatePlayButton(false);
  mbStop();
  stationRetryCount = 0;
}

function tryNextStationSource() {
  if (!isPlaying) return;
  stationRetryCount++;
  if (stationRetryCount >= MAX_RETRIES) {
    stopRadioPlayback();
    musicName.textContent = '电台暂不可用';
    musicName.title = '电台暂不可用，请稍后再试';
    return;
  }

  currentStationSource += 1;
  if (currentStationSource >= stationHosts.length) {
    currentStationSource = 0;
    currentStation = (currentStation + 1) % lofiStations.length;
  }
  loadStation(currentStation, currentStationSource);
  playAudio().catch(e => {
    console.warn('备用音源播放失败:', e.message);
    setTimeout(tryNextStationSource, 250);
  });
}

// ===== 音频错误监听 =====
lofiAudio.addEventListener('error', (e) => {
  console.warn('音频加载失败:', e);
  if (isPlaying && !isChangingStation) tryNextStationSource();
});


lofiAudio.addEventListener('playing', () => {
  stationRetryCount = 0;
  clearTimeout(playbackWatchTimer);
});

lofiAudio.addEventListener('stalled', () => {
  if (isPlaying) {
    clearTimeout(playbackWatchTimer);
    playbackWatchTimer = setTimeout(tryNextStationSource, 2500);
  }
});

// ===== 播放/暂停 =====
function togglePlay() {
  if (isPlaying) {
    // 暂停
    lofiAudio.pause();
    stopRadioPlayback();
  } else {
    // 播放：重新加载当前电台确保正确
    isPlaying = true;
    updatePlayButton(true);
    mbClosed = false;
    mbStart();
    stationRetryCount = 0;
    loadStation(currentStation, currentStationSource);
    playAudio().catch(e => {
      console.warn('播放失败:', e.message);
      tryNextStationSource();
    });
  }


  // 更新电台列表高亮
  if (typeof updateStationListHighlight === 'function') {
    updateStationListHighlight();
  }}

musicPlay.addEventListener('click', function(e) {
  togglePlay();
  e.currentTarget.blur();
});

// ===== 切换电台 =====
function changeStation(direction) {
  if (isChangingStation) return;
  isChangingStation = true;

  currentStation = (currentStation + direction + lofiStations.length) % lofiStations.length;
  currentStationSource = 0;
  stationRetryCount = 0;
  loadStation(currentStation, currentStationSource);

  // Click station switch to start playback; if already playing, keep playing the new station
  isPlaying = true;
  updatePlayButton(true);
  mbClosed = false;
  mbStart();

  playAudio().catch(e => {
    console.warn('切换电台播放失败:', e.message);
    clearTimeout(stationUnlockTimer);
    isChangingStation = false;
    setTimeout(tryNextStationSource, 250);
  });

  // Unlock after 600ms
  clearTimeout(stationUnlockTimer);
  stationUnlockTimer = setTimeout(() => {
    isChangingStation = false;
  }, 600);

  // 更新电台列表高亮
  if (typeof updateStationListHighlight === 'function') {
    updateStationListHighlight();
  }
}

musicPrev.addEventListener('click', (e) => { changeStation(-1); e.currentTarget.blur(); });
musicNext.addEventListener('click', (e) => { changeStation(1); e.currentTarget.blur(); });

// ===== 电台快速选择列表 =====
const musicListBtn = document.getElementById('musicList');
const stationListPanel = document.getElementById('stationListPanel');
const stationListContent = document.getElementById('stationListContent');
const stationListClose = document.getElementById('stationListClose');

function renderStationList() {
  if (!stationListContent) return;
  stationListContent.innerHTML = '';
  lofiStations.forEach((station, index) => {
    const item = document.createElement('div');
    item.className = 'station-item';
    if (index === currentStation) {
      item.classList.add('active');
      if (isPlaying) item.classList.add('playing');
    }
    item.innerHTML = `
      <span class="station-item-index">${index + 1}</span>
      <span class="station-item-name">${station.name}</span>
      <svg class="station-item-playing" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    `;
    item.addEventListener('click', () => {
      if (index !== currentStation) {
        currentStation = index;
        currentStationSource = 0;
        stationRetryCount = 0;
        loadStation(currentStation, currentStationSource);
        isPlaying = true;
        updatePlayButton(true);
        mbClosed = false;
        mbStart();
        playAudio().catch(e => {
          console.warn('电台列表切换播放失败:', e.message);
        });
      }
      // 点击电台后不关闭列表，只更新高亮
      renderStationList();
    });
    stationListContent.appendChild(item);
  });
}

function showStationList() {
  if (!stationListPanel) return;
  renderStationList();
  stationListPanel.classList.add('show');
}

function hideStationList() {
  if (!stationListPanel) return;
  stationListPanel.classList.remove('show');
}

function toggleStationList() {
  if (!stationListPanel) return;
  if (stationListPanel.classList.contains('show')) {
    hideStationList();
  } else {
    showStationList();
  }
}

if (musicListBtn) {
  musicListBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleStationList();
    e.currentTarget.blur();
  });
}

if (stationListClose) {
  stationListClose.addEventListener('click', (e) => {
    e.stopPropagation();
    hideStationList();
  });
}

if (stationListPanel) {
  stationListPanel.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

document.addEventListener('click', (e) => {
  if (stationListPanel && stationListPanel.classList.contains('show')) {
    if (!stationListPanel.contains(e.target) && !musicListBtn.contains(e.target)) {
      hideStationList();
    }
  }
});

// 更新电台列表高亮（在切换电台和播放状态变化时调用）
function updateStationListHighlight() {
  if (!stationListContent || !stationListPanel.classList.contains('show')) return;
  renderStationList();
}

renderLinks('', currentCategory);

// 搜索框展开/收起交互
const searchInline = document.getElementById('searchInline');
const searchInputEl = document.getElementById('searchInput');

if (searchInline && searchInputEl) {
  const searchWrapperEl = searchInline.closest('.search-wrapper');
  const categoryTabsEl = document.getElementById('categoryTabs');
  const setSearchExpanded = (expanded) => {
    searchInline.classList.toggle('expanded', expanded);
    if (searchWrapperEl) searchWrapperEl.classList.toggle('search-expanded', expanded);
    if (categoryTabsEl) categoryTabsEl.classList.toggle('search-expanded', expanded);
    document.body.classList.toggle('search-expanded', expanded);
  };

  searchInline.addEventListener('click', (e) => {
    if (!searchInline.classList.contains('expanded')) {
      setSearchExpanded(true);
      setTimeout(() => searchInputEl.focus(), 200);
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchInline.contains(e.target)) {
      if (!searchInputEl.value) {
        setSearchExpanded(false);
      }
    }
  });

  searchInputEl.addEventListener('input', (e) => {
    const searchValue = e.target.value;
    if (searchValue) {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      renderLinks(searchValue, 'all');
    } else {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === lastSelectedCategory);
      });
      renderLinks('', lastSelectedCategory);
    }
  });

  searchInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInputEl.value = '';
      setSearchExpanded(false);
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === lastSelectedCategory);
      });
      renderLinks('', lastSelectedCategory);
    }
  });

  searchInputEl.addEventListener('focus', () => {
    setSearchExpanded(true);
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.focus();
    }
  }

  if (e.key === 'm' || e.key === 'M') {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (musicPlay) {
        togglePlay();
      }
    }
  }

  if (e.key === 'n' || e.key === 'N') {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (musicNext) {
        changeStation(1);
      }
    }
  }

  if (e.key === 'p' || e.key === 'P') {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (musicPrev) {
        changeStation(-1);
      }
    }
  }

  if (e.key === 't' || e.key === 'T') {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (themeToggle) {
        themeToggle.click();
      }
    }
  }

  if (e.key === 'g' || e.key === 'G') {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      layoutBtn.click();
    }
  }

  if (e.key === 'b' || e.key === 'B') {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
});

// ========== 卡片聚光灯 + 3D视差倾斜（事件委托，零额外内存） ==========
const mainContentEl = document.getElementById('mainContent');

// ========== 随机文学金句（墨痕浸润过渡） ==========


const quoteTextEl = document.getElementById('quoteText');
if (quoteTextEl) {
  const randomQuote = literaryQuotes[Math.floor(Math.random() * literaryQuotes.length)];
  setTimeout(() => {
    quoteTextEl.textContent = randomQuote;
    quoteTextEl.classList.add('shown');
  }, 600);
}

// ========== 黄昏渐变时间滤镜 ==========
function checkSunset() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeValue = hours + minutes / 60;
  const sunsetStart = 17.5;  // 17:30
  const sunsetEnd = 19.0;    // 19:00

  if (timeValue >= sunsetStart && timeValue < sunsetEnd) {
    document.body.classList.add('sunset-mode');
  } else {
    document.body.classList.remove('sunset-mode');
  }
}

checkSunset();
setInterval(checkSunset, 60000); // 每分钟检查一次

// ========== 3D 视差倾斜 ==========
if (mainContentEl) {
  mainContentEl.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.link-card, .ai-link-card, .subcategory-title-card');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 聚光灯坐标
    card.style.setProperty('--x', x + 'px');
    card.style.setProperty('--y', y + 'px');

    // 3D 倾斜（最大 ±6 度，非常轻微）
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 6;
    const rotateX = -((y - centerY) / centerY) * 6;

    card.classList.add('tilt-active');
    card.style.setProperty('--rx', rotateX.toFixed(1) + 'deg');
    card.style.setProperty('--ry', rotateY.toFixed(1) + 'deg');
  });

  // 鼠标离开卡片时移除倾斜
  mainContentEl.addEventListener('mouseleave', () => {
    mainContentEl.querySelectorAll('.tilt-active').forEach(card => {
      card.classList.remove('tilt-active');
    });
  });

  // 也监听 mouseout 逐个卡片清理
  mainContentEl.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.link-card, .ai-link-card, .subcategory-title-card');
    if (card && !card.contains(e.relatedTarget)) {
      card.classList.remove('tilt-active');
    }
  });
}

// ========== 骨架屏 + Bento Grid 渲染 ==========
function renderSkeleton(main, count) {
  const grid = document.createElement('div');
  grid.className = 'links-grid';
  grid.id = 'skeletonGrid';
  for (let i = 0; i < count; i++) {
    const skel = document.createElement('div');
    skel.className = 'skeleton-card';
    skel.innerHTML = `
      <div class="skeleton-line icon"></div>
      <div class="skeleton-line title"></div>
      <div class="skeleton-line url"></div>
    `;
    grid.appendChild(skel);
  }
  main.appendChild(grid);
}

// ========== 音乐律动栏 ==========
const musicFxBtn = document.getElementById('musicFxBtn');
const musicFxClose = document.getElementById('musicFxClose');
const musicBarBottom = document.getElementById('musicBarBottom');
const mbCtx2 = musicBarBottom.getContext('2d');
const mbCtx = mbCtx2; // 兼容旧代码，指向底部canvas
let mbW = 0, mbH = 28;
let mbEffect = 0;
let mbRAF = null;
let mbTime = 0;
let mbActive = false;
let mbIdle = false;

// 所有效果（合并）
const mbEffectNames = [
  '8','1','2','3','4','5','6','7','9',
  'N1','N3','N6','N13','N22','N4'
];

// 效果显示名称
const mbEffectDisplay = {
  '1':'三层正弦波','2':'丝带飘动','3':'蝴蝶振翅','4':'花瓣展开','5':'气泡上升','6':'雨滴','7':'海浪涌动','8':'羽毛轻拮','9':'等高线',
  'N1':'瀑布流','N3':'潮汐涨落','N4':'星座连线','N6':'弹力绳','N13':'极光丝带','N22':'光纤束'
};

const mbEffectStorageKey = 'kisstr_music_bar_effect_v1';
(function initSavedMusicEffect() {
  const savedEffect = localStorage.getItem(mbEffectStorageKey);
  const savedIndex = Number.parseInt(savedEffect, 10);
  if (Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < mbEffectNames.length) {
    mbEffect = savedIndex;
    return;
  }
  mbEffect = Math.floor(Math.random() * mbEffectNames.length);
})();

function mbResize() {
  const dpr = window.devicePixelRatio || 1;
  mbW = window.innerWidth;
  musicBarBottom.width = mbW * dpr;
  musicBarBottom.height = mbH * dpr;
  mbCtx2.setTransform(dpr, 0, 0, dpr, 0, 0);
}
mbResize();
window.addEventListener('resize', mbResize);

// 模拟律动数据
function mbRhythm(t) {
  return 0.4 + 0.25 * Math.sin(t * 0.0028) + 0.15 * Math.sin(t * 0.006) + 0.1 * Math.sin(t * 0.011);
}

// 粒子池（复用，避免 GC）
let mbParticles = [];
let mbConstellation = null;
function mbSpawnParticle(x, y, vx, vy, life, size) {
  mbParticles.push({ x, y, vx, vy, life, maxLife: life, size });
}
function mbUpdateParticles(w, h) {
  for (let i = mbParticles.length - 1; i >= 0; i--) {
    const p = mbParticles[i];
    p.x += p.vx; p.y += p.vy; p.life -= 1;
    if (p.life <= 0 || p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
      mbParticles.splice(i, 1);
    }
  }
}
function mbDrawParticles(color, boost) {
  boost = boost || 1;
  for (const p of mbParticles) {
    const a = Math.min(1, (p.life / p.maxLife) * boost);
    mbCtx.fillStyle = `rgba(${color},${a})`;
    mbCtx.beginPath();
    mbCtx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
    mbCtx.fill();
  }
}

function mbDraw() {
  if (!mbActive && !mbIdle) return;
  mbTime += 16;
  const w = mbW, h = mbH, t = mbTime;
  let r = mbActive ? mbRhythm(t) : (0.12 + 0.04 * Math.sin(t * 0.001));
  mbCtx.clearRect(0, 0, w, h);

  const idx = mbEffectNames[mbEffect];
  const cx = w / 2, cy = h / 2;

  // 颜色随主题
  const curTheme = document.documentElement.getAttribute('data-theme') || '';
  const isImageBackground = document.body.classList.contains('background-image-mode');
  const isDark = isImageBackground || curTheme === 'midnight' || curTheme === 'dream' || curTheme === 'starry' || curTheme === 'sunset' || curTheme === 'aurora' || curTheme === 'forest' || curTheme === 'deepsea' || curTheme === 'clay' || curTheme === 'ink';
  const baseColor = isDark ? '255,255,255' : '29,29,31';
  // 暗色主题和图片背景亮度增益，让白色律动更明显
  if (isDark) r = Math.min(1, r * 1.8);

  // 辅助：画一条曲线
  function drawCurve(fn, alpha, lw) {
    mbCtx.strokeStyle = `rgba(${baseColor},${alpha * r})`;
    mbCtx.lineWidth = lw || 1.5;
    mbCtx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const y = fn(x);
      if (x === 0) mbCtx.moveTo(x, y);
      else mbCtx.lineTo(x, y);
    }
    mbCtx.stroke();
  }

  try {
  switch (idx) {
    // ========== 保留的 6 种 ==========
    case '1': {
      // 三层正弦波
      drawCurve(x => cy + Math.sin((x + t*0.06)*0.018) * (h*0.38) * r, 0.55, 1.5);
      drawCurve(x => cy + Math.sin((x + t*0.04)*0.012 + Math.PI/3) * (h*0.28) * r, 0.35, 1.5);
      drawCurve(x => cy + Math.sin((x + t*0.08)*0.025 + Math.PI/2) * (h*0.18) * r, 0.25, 1.5);
      break;
    }
    case '2': {
      // 丝带飘动
      for (let i = 0; i < 5; i++) {
        const phase = i * 0.4;
        drawCurve(x => cy + Math.sin((x + t*0.05)*0.015 + phase) * (h*0.35) * r * (1 - i*0.12), 0.45 - i*0.07, 1.2);
      }
      break;
    }
    case '3': {
      // 蝴蝶振翅
      drawCurve(x => {
        const u = (x / w) * Math.PI * 4;
        const flap = Math.sin(t * 0.006);
        return cy + Math.sin(u) * Math.exp(-Math.abs(Math.sin(u))*0.5) * (h*0.4) * r * flap;
      }, 0.55, 1.5);
      drawCurve(x => {
        const u = (x / w) * Math.PI * 4;
        const flap = Math.sin(t * 0.006);
        return cy - Math.sin(u) * Math.exp(-Math.abs(Math.sin(u))*0.5) * (h*0.4) * r * flap;
      }, 0.35, 1.5);
      break;
    }
    case '4': {
      // 花瓣展开
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + t * 0.001;
        drawCurve(x => {
          const u = (x / w) * Math.PI * 2;
          return cy + Math.sin(u * 2 + angle) * Math.cos(u + t*0.003) * (h*0.38) * r;
        }, 0.3, 1.2);
      }
      break;
    }
    case '5': {
      // 气泡上升
      if (mbTime % 120 < 16) {
        mbSpawnParticle(Math.random()*w, h, (Math.random()-0.5)*0.3, -0.4-Math.random()*0.6, 50+Math.random()*30, 1+Math.random()*1.5);
      }
      mbUpdateParticles(w, h);
      mbDrawParticles(baseColor, isDark ? 1.8 : 1);
      break;
    }
    case '6': {
      // 雨滴
      if (mbTime % 50 < 16) {
        for (let i = 0; i < 2; i++) {
          mbSpawnParticle(Math.random()*w, 0, 0, 1.5+Math.random()*1, 18+Math.random()*8, 0.6);
        }
      }
      mbUpdateParticles(w, h);
      mbDrawParticles(baseColor, isDark ? 1.8 : 1);
      break;
    }

    // ========== 新增 10 种 ==========
    case '7': {
      // 海浪涌动（曲线 + 填充）
      drawCurve(x => cy + Math.sin((x + t*0.05)*0.014) * (h*0.35) * r, 0.5, 1.5);
      // 下方填充
      mbCtx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = cy + Math.sin((x + t*0.05)*0.014) * (h*0.35) * r;
        if (x === 0) mbCtx.moveTo(x, y);
        else mbCtx.lineTo(x, y);
      }
      mbCtx.lineTo(w, h); mbCtx.lineTo(0, h); mbCtx.closePath();
      const grad = mbCtx.createLinearGradient(0, cy, 0, h);
      grad.addColorStop(0, `rgba(${baseColor},${0.15 * r})`);
      grad.addColorStop(1, `rgba(${baseColor},0)`);
      mbCtx.fillStyle = grad;
      mbCtx.fill();
      break;
    }
    case '8': {
      // 羽毛轻拂
      for (let i = 0; i < 4; i++) {
        const offset = i * 0.6;
        drawCurve(x => {
          const env = Math.exp(-Math.abs((x - cx) / (w * 0.3)) * 2);
          return cy + Math.sin((x + t*0.04)*0.03 + offset) * env * (h*0.4) * r;
        }, 0.4 - i*0.07, 1.2);
      }
      break;
    }
    case '9': {
      // 等高线
      for (let i = 0; i < 5; i++) {
        const amp = (i + 1) * 0.08;
        drawCurve(x => {
          const n = Math.sin(x*0.01 + t*0.005 + i*0.5) + Math.sin(x*0.03 + t*0.003 + i) * 0.5;
          return cy + n * (h * amp) * r;
        }, 0.3 - i*0.04, 1);
      }
      break;
    }

    // ========== 新增创意效果（第二个按钮） ==========
    case 'N1': {
      // 瀑布流（保留）
      const cols = 40;
      const cw = w / cols;
      for (let i = 0; i < cols; i++) {
        const flow = ((t * 0.003 + i * 0.17) % 1);
        const len = 8;
        for (let j = 0; j < len; j++) {
          const y = (flow * h + j * 3) % h;
          const alpha = (1 - j / len) * 0.4 * r;
          mbCtx.fillStyle = `rgba(${baseColor},${alpha})`;
          mbCtx.fillRect(i * cw, y, cw * 0.5, 2);
        }
      }
      break;
    }
    case 'N3': {
      // 潮汐涨落（保留）
      const tideLevel = Math.sin(t * 0.001) * h * 0.2 + h * 0.5;
      drawCurve(x => {
        return tideLevel + Math.sin((x + t * 0.05) * 0.01) * (h * 0.08) * r;
      }, 0.5, 1.5);
      mbCtx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = tideLevel + Math.sin((x + t * 0.05) * 0.01) * (h * 0.08) * r;
        if (x === 0) mbCtx.moveTo(x, y);
        else mbCtx.lineTo(x, y);
      }
      mbCtx.lineTo(w, h); mbCtx.lineTo(0, h); mbCtx.closePath();
      const tideGrad = mbCtx.createLinearGradient(0, tideLevel, 0, h);
      tideGrad.addColorStop(0, `rgba(${baseColor},${0.12 * r})`);
      tideGrad.addColorStop(1, `rgba(${baseColor},0)`);
      mbCtx.fillStyle = tideGrad;
      mbCtx.fill();
      for (let i = 0; i < 15; i++) {
        const fx = ((i * 67.3 + t * 0.03) % w);
        const fy = tideLevel + Math.sin((fx + t * 0.05) * 0.01) * (h * 0.08) * r;
        mbCtx.fillStyle = `rgba(${baseColor},${0.3 * r})`;
        mbCtx.beginPath();
        mbCtx.arc(fx, fy, 0.8, 0, Math.PI * 2);
        mbCtx.fill();
      }
      break;
    }
    case 'N4': {
      // 星座连线
      if (!mbConstellation) {
        mbConstellation = [];
        for (let i = 0; i < 18; i++) {
          mbConstellation.push({ x: Math.random() * w, y: Math.random() * h, phase: Math.random() * Math.PI * 2 });
        }
      }
      for (let i = 0; i < mbConstellation.length; i++) {
        const s = mbConstellation[i];
        const twinkle = Math.sin(t * 0.005 + s.phase) * 0.5 + 0.5;
        mbCtx.fillStyle = `rgba(${baseColor},${twinkle * 0.6 * r})`;
        mbCtx.beginPath();
        mbCtx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
        mbCtx.fill();
        for (let j = i + 1; j < mbConstellation.length; j++) {
          const s2 = mbConstellation[j];
          const dx = s.x - s2.x, dy = s.y - s2.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < w * 0.12) {
            mbCtx.strokeStyle = `rgba(${baseColor},${(1 - dist / (w * 0.12)) * 0.15 * r})`;
            mbCtx.lineWidth = 0.4;
            mbCtx.beginPath();
            mbCtx.moveTo(s.x, s.y);
            mbCtx.lineTo(s2.x, s2.y);
            mbCtx.stroke();
          }
        }
      }
      break;
    }
    case 'N6': {
      // 弹力绳
      const numPoints = 30;
      const anchorY = h * 0.2;
      const dipY = h * 0.8;
      const bounce = Math.sin(t * 0.005) * 0.3 + 0.7;
      mbCtx.strokeStyle = `rgba(${baseColor},${0.5 * r})`;
      mbCtx.lineWidth = 1.5;
      mbCtx.beginPath();
      for (let i = 0; i <= numPoints; i++) {
        const x = (i / numPoints) * w;
        const wave = Math.sin((i / numPoints) * Math.PI);
        const y = anchorY + (dipY - anchorY) * wave * bounce * r + Math.sin(t * 0.01 + i * 0.3) * 1.5;
        if (i === 0) mbCtx.moveTo(x, y);
        else mbCtx.lineTo(x, y);
      }
      mbCtx.stroke();
      mbCtx.fillStyle = `rgba(${baseColor},${0.6 * r})`;
      mbCtx.beginPath();
      mbCtx.arc(0, anchorY, 2, 0, Math.PI * 2);
      mbCtx.arc(w, anchorY, 2, 0, Math.PI * 2);
      mbCtx.fill();
      break;
    }
    case 'N13': {
      // 极光丝带
      for (let i = 0; i < 4; i++) {
        const layerR = 0.15 + i * 0.05;
        drawCurve(x => {
          const baseY = cy + (i - 1.5) * h * 0.08;
          const wave1 = Math.sin(x * 0.008 + t * 0.003 + i) * h * layerR;
          const wave2 = Math.sin(x * 0.02 + t * 0.005 + i * 2) * h * 0.04;
          return baseY + (wave1 + wave2) * r;
        }, 0.35 - i * 0.05, 2 - i * 0.3);
      }
      break;
    }
    case 'N22': {
      // 光纤束
      const numFibers = 12;
      for (let i = 0; i < numFibers; i++) {
        const baseY = (i / numFibers) * h;
        const phase = i * 0.4;
        mbCtx.strokeStyle = `rgba(${baseColor},${0.3 * r})`;
        mbCtx.lineWidth = 0.8;
        mbCtx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const wave = Math.sin(x * 0.01 + t * 0.003 + phase) * 3 * r;
          const y = baseY + wave;
          if (x === 0) mbCtx.moveTo(x, y);
          else mbCtx.lineTo(x, y);
        }
        mbCtx.stroke();
        const pulseX = ((t * 0.05 + i * 20) % w);
        const py = baseY + Math.sin(pulseX * 0.01 + t * 0.003 + phase) * 3 * r;
        mbCtx.fillStyle = `rgba(${baseColor},${0.6 * r})`;
        mbCtx.beginPath();
        mbCtx.arc(pulseX, py, 1.5, 0, Math.PI * 2);
        mbCtx.fill();
      }
      break;
    }
  }
  } catch(e) {}

  mbRAF = requestAnimationFrame(mbDraw);
}

function mbStart() {
  mbActive = true;
  mbIdle = false;
  const isMinimal = document.body.classList.contains('layout-minimal');
  if (isMinimal) {
    musicBarBottom.classList.remove('idle');
    musicBarBottom.classList.add('active');
  } else {
    musicBarBottom.classList.remove('active', 'idle');
  }
  mbResize();
  if (!mbRAF) mbDraw();
  mbUpdateTitles();
  mbResetAutoHide();
}

function mbStop() {
  mbActive = false;
  const isMinimal = document.body.classList.contains('layout-minimal');
  if (isMinimal) {
    mbIdle = true;
    musicBarBottom.classList.remove('active');
    musicBarBottom.classList.add('idle');
    mbParticles = [];
    if (!mbRAF) mbDraw();
    mbResetAutoHide();
  } else {
    mbIdle = false;
    musicBarBottom.classList.remove('active', 'idle');
    if (mbRAF) { cancelAnimationFrame(mbRAF); mbRAF = null; }
    mbCtx2.setTransform(1, 0, 0, 1, 0, 0);
    mbCtx2.clearRect(0, 0, musicBarBottom.width, musicBarBottom.height);
    const dpr3 = window.devicePixelRatio || 1;
    mbCtx2.setTransform(dpr3, 0, 0, dpr3, 0, 0);
  }
}

function mbUpdateTitles() {
  const id1 = mbEffectNames[mbEffect];
  const name1 = mbEffectDisplay[id1] || id1;
  musicFxBtn.title = `${mbEffect + 1}. ${name1}`;
}

// 切换效果
musicFxBtn.addEventListener('click', (e) => {
  mbEffect = (mbEffect + 1) % mbEffectNames.length;
  localStorage.setItem(mbEffectStorageKey, String(mbEffect));
  mbParticles = [];
  mbUpdateTitles();
  mbResetAutoHide();
  if (!isPlaying) {
    togglePlay();
  } else {
    mbClosed = false;
    mbStart();
  }
  e.currentTarget.blur();
});

// 关闭按钮：停止律动动画
let mbClosed = false;
musicFxClose.addEventListener('click', (e) => {
  mbClosed = true;
  mbActive = false;
  mbIdle = false;
  musicBarBottom.classList.remove('active', 'idle');
  if (mbHideTimer) clearTimeout(mbHideTimer);
  musicFxBtn.classList.add('auto-hidden');
  musicFxClose.classList.add('auto-hidden');
  if (mbRAF) { cancelAnimationFrame(mbRAF); mbRAF = null; }
  mbCtx2.setTransform(1, 0, 0, 1, 0, 0);
  mbCtx2.clearRect(0, 0, musicBarBottom.width, musicBarBottom.height);
  const dpr4 = window.devicePixelRatio || 1;
  mbCtx2.setTransform(dpr4, 0, 0, dpr4, 0, 0);
  e.currentTarget.blur();
});

// 5秒无操作自动隐藏切换按钮
let mbHideTimer = null;
let mbPointerInside = false;

function mbShowControls() {
  musicFxBtn.classList.remove('auto-hidden');
  musicFxClose.classList.remove('auto-hidden');
  musicFxBtn.classList.add('visible');
  musicFxClose.classList.add('visible');
}

function mbHideControls() {
  musicFxBtn.classList.remove('visible');
  musicFxClose.classList.remove('visible');
  musicFxBtn.classList.add('auto-hidden');
  musicFxClose.classList.add('auto-hidden');
}

function mbResetAutoHide() {
  if (mbPointerInside) {
    mbShowControls();
    if (mbHideTimer) clearTimeout(mbHideTimer);
  } else {
    mbHideControls();
  }
}

const musicBarContainer = document.querySelector('.music-bar-bottom-container');
if (musicBarContainer) {
  function mbRevealControls() {
    mbPointerInside = true;
    mbShowControls();
    if (mbHideTimer) clearTimeout(mbHideTimer);
  }

  function mbScheduleControlsHide(delay = 2000) {
    mbPointerInside = false;
    if (mbHideTimer) clearTimeout(mbHideTimer);
    mbHideTimer = setTimeout(() => {
      if (!mbPointerInside) {
        mbHideControls();
      }
    }, delay);
  }

  musicBarContainer.addEventListener('mouseenter', () => {
    if (mbClosed || mbActive || mbIdle) {
      mbRevealControls();
    }
  });
  musicBarContainer.addEventListener('mouseleave', () => {
    if (mbClosed || mbActive || mbIdle) {
      mbScheduleControlsHide(2000);
    }
  });
  musicBarContainer.addEventListener('touchstart', () => {
    if (mbClosed || mbActive || mbIdle) {
      mbRevealControls();
      mbScheduleControlsHide(2000);
    }
  }, { passive: true });
}

// observe musicPlay playing class
const mbObserver = new MutationObserver(() => {
  if (musicPlay.classList.contains('playing')) {
    mbStart();
  } else {
    mbStop();
  }
});
mbObserver.observe(musicPlay, { attributes: true, attributeFilter: ['class'] });

// ========== 背景选择器 ==========
// === 背景选择器：纯色/渐变 + WebP 壁纸，按需创建预览 ===
(function() {
  const storageKey = 'kisstr_background_picker_selection_v1';
  
  

  /* reorder: 精选背景 → 风景 → 人物 */
  

  let modalBuilt = false;
  let selectedId = null;
  let fadeTimer = null;
  let backgroundFadeTimer = null;

  function ensureThemeFadeOverlay() {
    let overlay = document.getElementById('themeFadeOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'themeFadeOverlay';
      overlay.className = 'theme-fade-overlay';
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function runThemeFade(changeFn, enabled = true) {
    if (fadeTimer) {
      clearTimeout(fadeTimer);
      fadeTimer = null;
    }
    if (!enabled) {
      changeFn();
      return;
    }
    const overlay = ensureThemeFadeOverlay();
    overlay.classList.remove('active');
    requestAnimationFrame(() => {
      overlay.classList.add('active');
      setTimeout(() => {
        changeFn();
        requestAnimationFrame(() => {
          overlay.classList.remove('active');
        });
      }, 90);
      fadeTimer = setTimeout(() => {
        overlay.classList.remove('active');
        fadeTimer = null;
      }, 620);
    });
  }

  function ensureBackgroundFadeLayer() {
    let layer = document.getElementById('backgroundFadeLayer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'backgroundFadeLayer';
      layer.className = 'bg-layer-fade';
      const bgLayer = document.querySelector('.bg-layer');
      if (bgLayer && bgLayer.parentNode) {
        bgLayer.parentNode.insertBefore(layer, bgLayer.nextSibling);
      } else {
        document.body.appendChild(layer);
      }
    }
    return layer;
  }

  function fadeFromCurrentImageBackground(changeFn, enabled = true) {
    if (backgroundFadeTimer) {
      clearTimeout(backgroundFadeTimer);
      backgroundFadeTimer = null;
    }
    if (!enabled) {
      changeFn();
      return;
    }

    const currentLayer = document.querySelector('.bg-layer');
    const fadeLayer = ensureBackgroundFadeLayer();
    const currentStyle = currentLayer ? getComputedStyle(currentLayer) : null;
    const currentImage = currentStyle ? currentStyle.backgroundImage : '';
    const hasCurrentImage = currentImage && currentImage !== 'none';

    if (hasCurrentImage) {
      fadeLayer.style.backgroundImage = currentImage;
      fadeLayer.style.backgroundSize = currentStyle.backgroundSize;
      fadeLayer.style.backgroundPosition = currentStyle.backgroundPosition;
      fadeLayer.style.backgroundRepeat = currentStyle.backgroundRepeat;
      fadeLayer.classList.add('visible');
    }

    changeFn();

    if (hasCurrentImage) {
      requestAnimationFrame(() => {
        fadeLayer.classList.remove('visible');
      });
      backgroundFadeTimer = setTimeout(() => {
        fadeLayer.style.backgroundImage = '';
        backgroundFadeTimer = null;
      }, 680);
    }
  }

  function getImageOverlay() {
    return ['rgba(18, 18, 36, 0.42)', 'rgba(18, 18, 36, 0.52)'];
  }

  function syncImageBackgroundChrome(bgImageValue) {
    document.documentElement.classList.add('background-image-mode');
    document.documentElement.classList.add('cards-stabilizing');
    setTimeout(() => document.documentElement.classList.remove('cards-stabilizing'), 1400);    document.documentElement.style.backgroundColor = '#121224';
    if (bgImageValue) {
      document.documentElement.style.setProperty('--bg-image', bgImageValue);
    }
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#121224');
    if (themeToggle) themeToggle.title = '\u56FE\u7247\u80CC\u666F';
  }

  function paintImageBackground(url) {
    if (!url) return;
    url = url.replace('anime_wallpapers/', 'wallpapers/');
    url = url.replace('.jpg', '.webp');
    const overlay = getImageOverlay();
    document.body.classList.add('background-image-mode');
    const bgImageValue = `linear-gradient(to bottom, ${overlay[0]}, ${overlay[1]}), url('${resolveAssetUrl(url)}')`;
    document.documentElement.style.setProperty('--bg-image', bgImageValue);
    document.body.style.setProperty('--bg-image', bgImageValue);
    syncImageBackgroundChrome(bgImageValue);
  }

  function markActive(id) {
    selectedId = id;
    document.querySelectorAll('.background-card').forEach(card => {
      card.classList.toggle('active', card.dataset.bgId === id);
    });
    const strip = document.getElementById('backgroundStrip');
    if (strip) {
      const grayScrollbarIds = ['theme-white', 'theme-dawn', 'theme-mint', 'theme-ocean', 'theme-twilight'];
      strip.classList.toggle('gray-scrollbar', grayScrollbarIds.indexOf(id) >= 0);
    }
  }

  function scrollCardToCenter(card) {
    if (!card) return;
    var strip = document.getElementById('backgroundStrip');
    if (!strip) return;
    var stripRect = strip.getBoundingClientRect();
    var cardRect = card.getBoundingClientRect();
    var target = strip.scrollLeft + (cardRect.left - stripRect.left) - (stripRect.width / 2) + (cardRect.width / 2);
    strip.scrollTo({ left: target, behavior: 'smooth' });
  }

  function normalizeBackgroundOption(option) {
    if (!option) return option;
    const normalized = { ...option };
    if (normalized.url) {
      normalized.url = normalized.url.replace('anime_wallpapers/', 'wallpapers/').replace('.jpg', '.webp');
    }
    if (normalized.thumb) {
      normalized.thumb = normalized.thumb.replace('anime_wallpapers/', 'wallpapers/').replace('.jpg', '.webp');
    }
    return normalized;
  }

  function saveSelection(option) {
    option = normalizeBackgroundOption(option);
    localStorage.setItem(storageKey, JSON.stringify(option));
  }

  function setThemeBackground(option, shouldSave = true) {
    runThemeFade(() => {
      fadeFromCurrentImageBackground(() => {
        document.body.classList.remove('background-image-mode');
        document.documentElement.classList.remove('background-image-mode');
        document.body.style.backgroundImage = '';
        document.body.style.backgroundAttachment = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundRepeat = '';
        document.body.style.removeProperty('--bg-image');
        document.documentElement.style.removeProperty('--bg-image');
        if (typeof setTheme === 'function') {
          setTheme(option.theme);
        } else {
          document.documentElement.setAttribute('data-theme', option.theme);
        }
        if (shouldSave) saveSelection(option);
        markActive(option.id);
      }, shouldSave);
    }, shouldSave);
  }

  function setImageBackground(option, shouldSave = true, preload = true) {
    option = normalizeBackgroundOption(option);
    const loading = document.getElementById('backgroundLoading');
    const apply = (url) => {
      if (url) option.url = url;
      runThemeFade(() => {
        fadeFromCurrentImageBackground(() => {
          document.body.classList.add('background-image-mode');
          paintImageBackground(option.url);
          if (shouldSave) saveSelection(option);
          markActive(option.id);
          if (loading) loading.classList.remove('show');
        }, shouldSave);
      }, shouldSave);
    };

    if (!preload) {
      apply(option.url);
      return;
    }

    if (loading) loading.classList.add('show');
    const candidates = [];
    [option.url, encodeURI(option.url || ''), option.thumb, encodeURI(option.thumb || '')].forEach(url => {
      if (url && candidates.indexOf(url) < 0) candidates.push(url);
    });
    let index = 0;
    const tryLoad = () => {
      const url = candidates[index];
      if (!url) {
        if (loading) loading.classList.remove('show');
        console.warn('背景预加载失败，已直接应用原路径：', option.url);
        apply(option.url);
        return;
      }
      const img = new Image();
      img.onload = () => apply(url);
      img.onerror = () => {
        index += 1;
        tryLoad();
      };
      img.src = url;
    };
    tryLoad();
  }

  function applySelection(option, shouldSave = true, preload = true) {
    if (!option) return;
    if (option.type === 'theme') setThemeBackground(option, shouldSave);
    if (option.type === 'image') setImageBackground(option, shouldSave, preload);
  }

  function createThemeCard(option) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'background-card';
    btn.dataset.bgId = option.id;
    btn.title = option.name;
    btn.setAttribute('aria-label', option.name);
    btn.innerHTML = `
      <div class="background-card-preview" style="background:${option.preview}"></div>
    `;
    btn.addEventListener('click', () => {
      applySelection(option, true, true);
      scrollCardToCenter(btn);
    });
    return btn;
  }

  function createImageCard(option) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'background-card';
    btn.dataset.bgId = option.id;
    btn.title = option.name;
    btn.setAttribute('aria-label', option.name);
    btn.innerHTML = `
      <img src="${option.thumb}" alt="" loading="lazy" decoding="async">
    `;
    btn.addEventListener('click', () => {
      applySelection(option, true, true);
      scrollCardToCenter(btn);
    });
    return btn;
  }

  function buildModal() {
    if (modalBuilt) return;
    modalBuilt = true;

    const modal = document.createElement('div');
    modal.id = 'backgroundModal';
    modal.className = 'background-modal';
    modal.innerHTML = `
      <div class="background-modal-panel" role="dialog" aria-modal="true" aria-label="背景选择器">
        <div class="background-modal-content">
          <div class="background-strip" id="backgroundStrip"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const strip = modal.querySelector('#backgroundStrip');
    /* 2026-10-03 按用户要求：隐藏所有非壁纸主题（pureBackgrounds 数据保留，仅不渲染，方便日后恢复） */
    // pureBackgrounds.forEach(option => strip.appendChild(createThemeCard(option)));
    imageBackgrounds.forEach(option => strip.appendChild(createImageCard(option)));

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    modal.addEventListener('touchstart', (event) => {
      if (event.target === modal) {
        closeModal();
        event.preventDefault();
      }
    }, { passive: false });

    /* mouse drag scrolling on the strip */
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let dragMoved = false;

    strip.addEventListener('mousedown', (e) => {
      isDown = true;
      dragMoved = false;
      strip.classList.add('dragging');
      startX = e.pageX - strip.offsetLeft;
      scrollLeft = strip.scrollLeft;
    });

    strip.addEventListener('mouseleave', () => {
      isDown = false;
      strip.classList.remove('dragging');
    });

    strip.addEventListener('mouseup', () => {
      isDown = false;
      strip.classList.remove('dragging');
    });

    strip.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - strip.offsetLeft;
      const walk = x - startX;
      if (Math.abs(walk) > 4) dragMoved = true;
      strip.scrollLeft = scrollLeft - walk;
    });

    /* 手机触摸拖动：让主题/背景选择条在移动端可直接左右滑动 */
    strip.addEventListener('touchstart', (e) => {
      if (!e.touches || e.touches.length !== 1) return;
      isDown = true;
      dragMoved = false;
      strip.classList.add('dragging');
      startX = e.touches[0].pageX - strip.offsetLeft;
      scrollLeft = strip.scrollLeft;
    }, { passive: true });

    strip.addEventListener('touchmove', (e) => {
      if (!isDown || !e.touches || e.touches.length !== 1) return;
      const x = e.touches[0].pageX - strip.offsetLeft;
      const walk = x - startX;
      if (Math.abs(walk) > 4) dragMoved = true;
      strip.scrollLeft = scrollLeft - walk;
    }, { passive: true });

    strip.addEventListener('touchend', () => {
      isDown = false;
      strip.classList.remove('dragging');
    }, { passive: true });

    strip.addEventListener('touchcancel', () => {
      isDown = false;
      strip.classList.remove('dragging');
    }, { passive: true });

    /* prevent click after drag */
    strip.addEventListener('click', (e) => {
      if (dragMoved) {
        e.preventDefault();
        e.stopPropagation();
        dragMoved = false;
      }
    }, true);

    markActive(selectedId);
  }

  function openModal() {
    buildModal();
    positionBackgroundPicker();
    const modal = document.getElementById('backgroundModal');
    modal.classList.toggle('open');
    if (themeToggle) {
      themeToggle.classList.toggle('background-picker-open', modal.classList.contains('open'));
    }
    /* scroll active card to center */
    var activeCard = document.querySelector('.background-card.active');
    if (activeCard) {
      setTimeout(function() { scrollCardToCenter(activeCard); }, 80);
    }
  }

  function closeModal() {
    const modal = document.getElementById('backgroundModal');
    if (modal) modal.classList.remove('open');
    if (themeToggle) themeToggle.classList.remove('background-picker-open');
  }

  function positionBackgroundPicker() {
    const modal = document.getElementById('backgroundModal');
    if (!modal || !themeToggle) return;
    const rect = themeToggle.getBoundingClientRect();
    const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0, 360);
    const width = Math.max(336, Math.min(920, viewportWidth - 24));
    const panel = modal.querySelector('.background-modal-panel');
    if (panel) panel.style.width = `${width}px`;
    const layoutOffset = 0;
    modal.style.setProperty('--bg-picker-top', `${rect.bottom + 18 + layoutOffset}px`);
  }

  function createTrigger() {
    const oldTrigger = document.getElementById('backgroundPickerTrigger');
    if (oldTrigger) oldTrigger.remove();

    const loading = document.createElement('div');
    loading.id = 'backgroundLoading';
    loading.className = 'background-loading';
    loading.textContent = '背景加载中…';
    document.body.appendChild(loading);
  }

  function restoreSelection() {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const option = JSON.parse(saved);
        var normalized = normalizeBackgroundOption(option);
        /* 验证保存的背景是否仍存在于当前列表中 */
        var found = imageBackgrounds.find(function(o) { return o.id === normalized.id || o.url === normalized.url; });
        if (!found) {
          found = pureBackgrounds.find(function(o) { return o.id === normalized.id || o.theme === normalized.theme; });
        }
        if (found) {
          applySelection(found, false, false);
          return;
        }
        /* 旧引用不存在，清除并使用随机默认 */
        localStorage.removeItem(storageKey);
      } catch (err) {
        localStorage.removeItem(storageKey);
      }
    }
    /* 没有用户选择时，默认从「荷 / 墨 / 锦 / 庭 / 契」中随机一张；用户手动选择后仍按保存值恢复 */
    var defaultImageIds = ['荷', '墨', '锦', '庭', '契'];
    var defaultPool = imageBackgrounds.filter(function(o) { return defaultImageIds.indexOf(o.id) !== -1; });
    if (defaultPool.length > 0) {
      applySelection(defaultPool[Math.floor(Math.random() * defaultPool.length)], false, false);
    } else if (imageBackgrounds.length > 0) {
      applySelection(imageBackgrounds[0], false, false);
    } else {
      applySelection(pureBackgrounds[0], false, false);
    }
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });

  if (themeToggle) {
    themeToggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openModal();
    }, true);
  }

  createTrigger();
  restoreSelection();
})();
// ========== 背景选择器结束 ==========

