/*
  点击生成文字“抛物运动”效果（Hexo Butterfly）
  在点击位置创建文字：先上抛，然后受重力加速度下落，超出视口或寿命结束后移除
*/
(() => {
  const SCRIPT_ID = 'click-show-text' // 主题注入的脚本标签 id（保持此 id 以读取 data-* 配置）
  const scriptEl = document.getElementById(SCRIPT_ID) // 通过它读取 data-text、data-fontsize、data-random、data-mobile
  if (!scriptEl) return

  // Read config from data attributes injected by Butterfly
  // 从 data-* 属性读取配置（与主题 _config.butterfly.yml->clickShowText 对应）
  const data = scriptEl.dataset || {}
  const mobileEnabled = String(data.mobile).toLowerCase() === 'true' // 是否在移动端启用
  const fontSize = data.fontsize || '15px' // 文字字号
  const isRandom = String(data.random).toLowerCase() === 'true' // 是否随机颜色
  const textList = (data.text || '').split(',').map(s => s.trim()).filter(Boolean) // 文本列表

  // Do not enable on mobile unless explicitly allowed
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) // 是否为移动端
  // 若禁止移动端且当前为移动端，则不启用
  if (isMobile && !mobileEnabled) return
  if (!textList.length) return

  let seqIndex = 0 // 顺序轮播时的当前索引

  // Utility: random color (pleasant pastel range)
  const randColor = () => {
    const h = Math.floor(Math.random() * 360)
    const s = 70 + Math.floor(Math.random() * 20) // 70% - 90%
    const l = 50 + Math.floor(Math.random() * 10) // 50% - 60%
    return `hsl(${h} ${s}% ${l}%)`
  }

  const activeParticles = new Set()

  const createParticle = (x, y, text) => {
    const el = document.createElement('span')
    el.textContent = text
    el.style.position = 'fixed'
    el.style.left = x + 'px'
    el.style.top = y + 'px'
    el.style.transform = 'translate(-50%, -50%) translateZ(0)' // 居中锚点 + 开启 GPU 加速
    el.style.fontSize = fontSize // 使用主题配置的字号
    el.style.fontWeight = '700'
    el.style.whiteSpace = 'pre'
    el.style.pointerEvents = 'none'
    el.style.userSelect = 'none'
    el.style.willChange = 'transform, opacity'
    el.style.zIndex = '99999'
    el.style.opacity = '1'
    el.style.color = isRandom ? randColor() : 'var(--theme-color, #49B1F5)' // 随机颜色或主题主色

    document.body.appendChild(el)

    // 设置速度
    const maxVx = 200 // 水平初速度范围
    const minVy = 300, maxVy = 600 // 竖直初速度范围（上抛初速度越大，抛得越高）
    const g = 2000 // 重力加速度

    const vx = (Math.random() * 2 - 1) * maxVx // 水平速度（随机向左或向右）
    const vy0 = - (minVy + Math.random() * (maxVy - minVy)) // 竖直初速度（负号表示向上）
    const rot = (Math.random() * 2 - 1) * 30 // 旋转角度（仅为更美观）

    const lifetime = 1.6 // 粒子存活时长（秒）
    let t = 0
    let last = performance.now()

    const particle = { el, x, y, vx, vy0, rot, t, last, lifetime }
    activeParticles.add(particle)

    const step = () => {
      if (!document.body.contains(el)) {
        activeParticles.delete(particle)
        return
      }
      const now = performance.now()
      const dt = Math.min(0.033, (now - last) / 1000) // 限制帧间隔，避免切换标签导致位移突变（最大约 33ms）
      last = now
      t += dt

      // Kinematics: y(t) = y0 + vy0 * t + 0.5 * g * t^2
      const nx = x + vx * t
      const ny = y + (vy0 * t + 0.5 * g * t * t)

      // Fade out towards end of life
      const lifeRatio = Math.min(1, t / lifetime)
      const opacity = 1 - lifeRatio

      el.style.opacity = opacity.toFixed(3)
      el.style.transform = `translate(-50%, -50%) translate(${nx - x}px, ${ny - y}px) rotate(${rot}deg)`

      // Remove when out of viewport or life ended
      const vh = window.innerHeight
      const vw = window.innerWidth
      const outOfView = ny < -50 || ny > vh + 50 || nx < -50 || nx > vw + 50
      if (t >= lifetime || opacity <= 0 || outOfView) {
        el.remove()
        activeParticles.delete(particle)
        return
      }
      requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }

  const pickText = () => {
    if (isRandom) return textList[Math.floor(Math.random() * textList.length)]
    const t = textList[seqIndex]
    seqIndex = (seqIndex + 1) % textList.length
    return t
  }

  // Attach once
  const onClick = (e) => {
    // Ignore right/middle clicks
    if (e.button !== 0) return
    const text = pickText()
    createParticle(e.clientX, e.clientY, text)
  }

  // Debounced resize cleanup (optional)
  const onVisibility = () => {
    if (document.hidden) {
      // Clean up off-screen particles when tab hidden
      for (const p of activeParticles) {
        p.el.remove()
      }
      activeParticles.clear()
    }
  }

  // Listen at capture phase to trigger early and avoid being blocked by other handlers
  window.addEventListener('click', onClick, true)
  document.addEventListener('visibilitychange', onVisibility)

  // Provide a small API for future control
  window.ClickThrowText = {
    dispose() {
      window.removeEventListener('click', onClick, true)
      document.removeEventListener('visibilitychange', onVisibility)
      for (const p of activeParticles) p.el.remove()
      activeParticles.clear()
    }
  }
})()