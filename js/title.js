// 动态标题（可配置离开/返回时的多条随机标题与时长）
(function () {
  var OriginTitle = document.title;
  var timer = null;
  var awayStart = 0;
  var thresholdMs = 120000; // 超过 120s 进入后续池

  // 前期池（离开至 120s 内，随机展示 1-5）
  var earlyPool = [
    { text: '偷偷玩会儿杀戮尖塔', ms: 10000 },
    { text: '你说得对，但是这就是奎桑提，HP 4700，护甲 329，魔抗 201的英雄。有不可阻挡，有护盾，还能过墙。有控制，甚至冷却时间只有1秒，只要15点蓝。转换姿态时甚至可以刷新W的cd，还有真实伤害。然后，护甲和魔抗提升后还能获得技能加速，缩短Q的cd，还缩短释放时间，然后还有攻击力。W就啊啊啊啊啊啊!!!', ms: 30000 },
    { text: '正在上厕所，别偷看！！！', ms: 5000 },
    { text: '连接断开...正在登录...艾尔登法环', ms: 10000 },
    { text: '页面摸鱼中...请勿打扰...', ms: 10000 },
    { text: '封印解除！开始吞噬内存！', ms: 10000 },
    { text: '警告！页面即将自毁...', ms: 10000 },
    { text: '检测到时空波动，请抓稳！', ms: 10000 }
  ];

  // 后续池（超过 120s 后，随机展示 6-11）
  var latePool = [
    { text: '你是不是外面有别的网站了？TAT', ms: 10000 },
    { text: '你去哪了？我好想你 QAQ', ms: 10000 },
    { text: '我不高兴了，你永远的失去我了！！！', ms: 10000 }
  ];

  // 回来时提示（随机展示一个，3s 后恢复原标题）
  var backPool = [
    '啊！你回来啦！（迅速切换回正经脸）',
    '咳咳，刚刚什么都没发生'
  ];
  var backHoldMs = 3000;

  var lastIndex = -1;
  function pickRandom(pool) {
    if (!pool || pool.length === 0) return { text: OriginTitle, ms: 5000 };
    var idx = Math.floor(Math.random() * pool.length);
    // 避免连续两次相同
    if (idx === lastIndex && pool.length > 1) idx = (idx + 1) % pool.length;
    lastIndex = idx;
    return pool[idx];
  }

  function scheduleNext() {
    if (!document.hidden) return; // 可见时不再调度
    var now = Date.now();
    var elapsed = now - awayStart; // 本次离开累计时间

    var pool = elapsed < thresholdMs ? earlyPool : latePool;
    var choice = pickRandom(pool);
    document.title = choice.text;

    var wait = choice.ms;
    // 若仍在前期池，且即将跨过阈值，则在阈值点强制切换到后续池
    if (elapsed < thresholdMs && elapsed + wait > thresholdMs) {
      wait = thresholdMs - elapsed;
    }

    clearTimeout(timer);
    timer = setTimeout(scheduleNext, Math.max(500, wait));
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      // 开始离开
      awayStart = Date.now();
      clearTimeout(timer);
      scheduleNext(); // 立即显示第一条并进入调度
    } else {
      // 回到页面
      clearTimeout(timer);
      var msg = backPool[Math.floor(Math.random() * backPool.length)];
      document.title = msg;
      setTimeout(function () {
        document.title = OriginTitle;
      }, backHoldMs);
    }
  });
})();