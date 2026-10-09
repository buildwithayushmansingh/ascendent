// card-premium.js — richer FRONT card markup (load BEFORE card.js)

function buildFrontHTML(data, xpPercent, previewBadges, extraCount) {

    // last 7 days activity (real log if available, else sample)
    let week = [3, 2, 4, 1, 5, 4, 3];
    try {
        if (typeof getDemoUser === 'function') {
            const log = getDemoUser().activityLog || [];
            if (log.length) {
                const counts = Array(7).fill(0);
                const today = new Date(); today.setHours(0, 0, 0, 0);
                log.forEach(a => {
                    if (a.status !== 'completed') return;
                    const d = new Date(a.date); d.setHours(0, 0, 0, 0);
                    const diff = Math.round((today - d) / 86400000);
                    if (diff >= 0 && diff < 7) counts[6 - diff]++;
                });
                week = counts;
            }
        }
    } catch (e) { }

    const maxDay = Math.max(1, ...week);
    const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const todayIdx = (new Date().getDay() + 6) % 7;
    const weekHTML = week.map((v, i) => `
      <div class="wk-col">
        <div class="wk-bar ${i === 6 ? 'wk-today' : ''}"
             style="--h:${Math.max(12, Math.round(v / maxDay * 100))}%;--d:${300 + i * 60}ms"></div>
        <span>${dayNames[(todayIdx - 6 + i + 7) % 7]}</span>
      </div>`).join('');

    const xpLeft = Math.max(0, data.xpToNextLevel - data.xp);
    const chPct = Math.round(data.challengeCurrent / data.challengeTotal * 100);

    const bars = Array.from({ length: 26 }, (_, i) =>
        `<i style="height:${6 + ((i * 7 + 3) % 5) * 3}px"></i>`).join('');

    return `
  <div class="tilt-wrapper">

    <!-- decoration layers -->
    <div class="pc-orb pc-orb-1"></div>
    <div class="pc-orb pc-orb-2"></div>
    <div class="pc-grid"></div>
    <div class="pc-watermark">✦</div>

    <span class="card-sparkle" style="top:12%;left:18%;animation-delay:0s;"></span>
    <span class="card-sparkle" style="top:70%;left:82%;animation-delay:.8s;"></span>
    <span class="card-sparkle" style="top:40%;left:90%;animation-delay:1.6s;"></span>
    <span class="card-sparkle" style="top:85%;left:12%;animation-delay:1.1s;"></span>

    <div class="card-corner corner-tl"></div>
    <div class="card-corner corner-tr"></div>
    <div class="card-corner corner-bl"></div>
    <div class="card-corner corner-br"></div>

    <!-- TOP -->
    <div class="card-top-row">
      <span class="identity-label">✦ ASCENDENT PLAYER</span>
      <span class="tier-pill">${data.tier.toUpperCase()} TIER</span>
    </div>

    <!-- HERO -->
    <div class="card-identity-row pc-hero">
      <div class="pc-avatar-wrap">
        <div class="pc-ring"></div>
        <div class="card-avatar">${data.initials}</div>
        <div class="pc-lvl-hex"><b>${data.level}</b><small>LVL</small></div>
      </div>
      <div class="pc-hero-text">
        <div class="card-name">${data.name}</div>
        <div class="card-username">@${data.username}</div>
        <div class="card-title-pill">⚔ ${data.title}</div>
      </div>
    </div>

    <!-- XP -->
    <div class="pc-xp">
      <div class="pc-xp-head">
        <span class="card-level-num">LEVEL ${data.level}</span>
        <span class="card-level-next">${xpLeft.toLocaleString()} XP to Lv ${data.nextLevel}</span>
      </div>
      <div class="card-xp-bar-track">
        <div class="card-xp-bar-fill" id="frontXpFill" style="width:0%;" data-target="${xpPercent}"></div>
      </div>
      <div class="pc-xp-foot">
        <span>${data.xp.toLocaleString()} / ${data.xpToNextLevel.toLocaleString()} XP</span>
        <span>${xpPercent}%</span>
      </div>
    </div>

    <!-- STATS -->
    <div class="card-stats pc-stats">
      <div class="card-stat-tile stat-pop-in" style="animation-delay:0ms;">
        <div class="pc-stat-ico">🔥</div>
        <div class="stat-big">${data.currentStreak}</div>
        <div class="stat-small">Streak</div>
      </div>
      <div class="card-stat-tile stat-pop-in" style="animation-delay:80ms;">
        <div class="pc-stat-ico">🏆</div>
        <div class="stat-big">${data.longestStreak}</div>
        <div class="stat-small">Best</div>
      </div>
      <div class="card-stat-tile stat-pop-in" style="animation-delay:160ms;">
        <div class="pc-stat-ico">🎯</div>
        <div class="stat-big">${data.consistency}%</div>
        <div class="stat-small">Consistency</div>
      </div>
    </div>

    <!-- WEEK -->
    <div class="pc-week">
      <div class="pc-week-title"><span>LAST 7 DAYS</span><span>${week.reduce((a, b) => a + b, 0)} quests</span></div>
      <div class="pc-week-bars">${weekHTML}</div>
    </div>

    <!-- BADGES -->
    <div class="badge-preview-row">
      ${previewBadges.map((badge, index) => `
        <span class="badge-circle badge-pop-in" style="animation-delay:${240 + index * 70}ms;" title="${badge.name}">${badge.icon}</span>`).join('')}
      ${extraCount > 0 ? `<span class="badge-circle badge-more badge-pop-in">+${extraCount}</span>` : ''}
    </div>

    <!-- FOOTER -->
    <div class="pc-footer">
      <div class="pc-challenge">
        <div class="pc-ch-top"><span>30-DAY CHALLENGE</span><b>${data.challengeCurrent}/${data.challengeTotal}</b></div>
        <div class="pc-ch-track"><div class="pc-ch-fill" style="width:${chPct}%"></div></div>
      </div>
      <div class="pc-serial">
        <div class="pc-barcode">${bars}</div>
        <span>${data.cardId}</span>
      </div>
    </div>

  </div>`;
}