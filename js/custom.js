(function () {
  // 右侧添加五个菜单
  function addCustomMenus() {
    const nav = document.querySelector('#nav .menus')
    if (!nav) return

    const customMenus = [
      { name: '首页', url: '/', icon: 'fas fa-home' },
      { name: '归档', url: '/archives/', icon: 'fas fa-archive' },
      { name: '标签', url: '/tags/', icon: 'fas fa-tags' },
      { name: '分类', url: '/categories/', icon: 'fas fa-folder-open' },
      { name: '关于', url: '/about/', icon: 'fas fa-heart' }
    ]

    const menuContainer = document.createElement('div')
    menuContainer.className = 'custom-right-menus'
    menuContainer.style.cssText = 'display: flex; gap: 8px; margin-left: 16px;'

    customMenus.forEach(menu => {
      const menuItem = document.createElement('a')
      menuItem.href = menu.url
      menuItem.className = 'menu-item'
      menuItem.innerHTML = `<i class="${menu.icon}"></i> ${menu.name}`
      menuItem.style.cssText = 'text-decoration: none; font-size: 14px; white-space: nowrap;'
      menuContainer.appendChild(menuItem)
    })

    nav.appendChild(menuContainer)
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn)
    } else {
      fn()
    }
  }

  function applyUI() {
    // 1) 添加右侧菜单
    addCustomMenus()

    // 2) 首页标题样式设置
    const title = document.querySelector('#site-title')
    if (title) {
      // 添加艺术字体类
      title.classList.add('custom-title-art')
      // 强制让标题容器按内容宽度居中
      title.style.display = 'block'
      title.style.marginLeft = 'auto'
      title.style.marginRight = 'auto'
      title.style.width = 'max-content'
      title.style.textAlign = 'center'
    }

    // 3) 确保左上角站点名称没有任何动画效果（按用户要求）
    const blogInfo = document.querySelector('#blog-info .site-name') || document.querySelector('.site-name')
    if (blogInfo) {
      // 移除所有可能的动画类
      blogInfo.className = blogInfo.className.replace(/burning-reveal|burning-spark|play/g, '').trim()
    }
  }

  onReady(applyUI)
  // 兼容Butterfly的PJAX（如果启用）
  window.addEventListener('pjax:complete', applyUI)
})()