// transition.js — Extended premium "Neural Core" transition (~5.8s).
// Layers: ambient background particle field, HUD chrome, expanding
// node network with data-flow, cycling status log, percentage counter,
// and a final flash before redirect. Single canvas + light DOM text only.

(function () {
    const params = new URLSearchParams(window.location.search);
    const nextPage = params.get('next') || 'dashboard.html';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        setTimeout(() => { window.location.href = nextPage; }, 500);
        return;
    }

    const canvas = document.getElementById('networkCanvas');
    const ctx = canvas.getContext('2d');
    const messageEl = document.getElementById('transitionMessage');
    const subEl = document.getElementById('transitionSub');
    const percentEl = document.getElementById('hudPercent');
    const logEl = document.getElementById('hudLog');

    let width, height, dpr;
    function resize() {
        dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // ---- Theme colors ----
    const rootStyle = getComputedStyle(document.documentElement);
    const colorAccent = rootStyle.getPropertyValue('--accent-bright').trim() || '#c084fc';
    const colorAccentDim = rootStyle.getPropertyValue('--accent').trim() || '#8b5cf6';

    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const num = parseInt(hex, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }
    const accentRGB = hexToRgb(colorAccent);
    const accentDimRGB = hexToRgb(colorAccentDim);
    function rgba(rgb, alpha) { return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`; }

    // ---- Ambient background particle field (fills empty space) ----
    let bgParticleCount = width < 600 ? 60 : width < 1000 ? 110 : 170;
    const bgParticles = Array.from({ length: bgParticleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.3,
        speed: Math.random() * 0.18 + 0.03,
        drift: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.45 + 0.1,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.002 + 0.0008
    }));

    // Slow-drifting nebula-like glow blobs for extra background depth
    const nebulaBlobs = Array.from({ length: 3 }, (_, i) => ({
        baseX: (0.2 + i * 0.3) * width,
        baseY: (0.25 + (i % 2) * 0.5) * height,
        radius: Math.min(width, height) * (0.18 + i * 0.05),
        phase: i * 2
    }));
    function drawBackgroundField(elapsed) {
        // Nebula glow blobs — slow, large, drifting
        nebulaBlobs.forEach((b) => {
            const nx = b.baseX + Math.sin(elapsed * 0.00015 + b.phase) * 60;
            const ny = b.baseY + Math.cos(elapsed * 0.00012 + b.phase) * 40;
            const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, b.radius);
            grad.addColorStop(0, rgba(accentDimRGB, 0.05));
            grad.addColorStop(1, rgba(accentDimRGB, 0));
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(nx, ny, b.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Twinkling drifting star field
        bgParticles.forEach((p) => {
            p.y -= p.speed;
            p.x += Math.sin(elapsed * 0.0004 + p.drift) * 0.08;
            if (p.y < -5) { p.y = height + 5; p.x = Math.random() * width; }
            const twinkle = 0.5 + 0.5 * Math.sin(elapsed * p.twinkleSpeed + p.twinklePhase);
            ctx.beginPath();
            ctx.fillStyle = rgba(accentDimRGB, p.alpha * twinkle);
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // Faint scanning grid lines
        ctx.strokeStyle = rgba(accentDimRGB, 0.035);
        ctx.lineWidth = 1;
        const gridSize = 64;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        // Slow horizontal scan beam (moving up)
        const scanY = ((elapsed * 0.05) % (height + 200)) - 100;
        const scanGrad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
        scanGrad.addColorStop(0, rgba(accentRGB, 0));
        scanGrad.addColorStop(0.5, rgba(accentRGB, 0.05));
        scanGrad.addColorStop(1, rgba(accentRGB, 0));
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 40, width, 80);

        // Second scan beam, vertical, moving sideways, offset timing
        const scanX = ((elapsed * 0.035 + 400) % (width + 200)) - 100;
        const scanGrad2 = ctx.createLinearGradient(scanX - 30, 0, scanX + 30, 0);
        scanGrad2.addColorStop(0, rgba(accentRGB, 0));
        scanGrad2.addColorStop(0.5, rgba(accentRGB, 0.035));
        scanGrad2.addColorStop(1, rgba(accentRGB, 0));
        ctx.fillStyle = scanGrad2;
        ctx.fillRect(scanX - 30, 0, 60, height);
        ctx.fillRect(0, scanY - 40, width, 80);
    }

    // ---- Node network ----
    const ALL_LABELS = ['HABITS', 'XP', 'STREAK', 'LEVEL', 'BADGES', 'QUESTS', 'PROGRESS', 'CARD'];
    let nodeCount = 8;
    if (width < 900) nodeCount = 6;
    if (width < 600) nodeCount = 4;
    const labels = ALL_LABELS.slice(0, nodeCount);

    const centerX = () => width / 2;
    const centerY = () => height / 2;
    const orbitRadius = Math.min(width, height) * (width < 600 ? 0.24 : 0.28);

    const nodes = labels.map((label, i) => ({
        label,
        baseAngle: (i / labels.length) * Math.PI * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        syncedAt: T_TIMING_PLACEHOLDER(i)
    }));

    function T_TIMING_PLACEHOLDER(i) {
        return null; // set once timings are known, see below
    }

    const particles = [];

    // ---- Phase timings (ms) — total ~5800ms ----
    const T_TEXT_HOLD = 900;
    const T_CORE_GROW = 700;
    const T_NETWORK_FORM = 1000;
    const T_NETWORK_LIVE = 2400;
    const T_CONVERGE = 600;
    const T_FLASH = 200;
    const TOTAL = T_TEXT_HOLD + T_CORE_GROW + T_NETWORK_FORM + T_NETWORK_LIVE + T_CONVERGE + T_FLASH;

    const NETWORK_START = T_TEXT_HOLD + T_CORE_GROW;
    const LIVE_START = NETWORK_START + T_NETWORK_FORM;
    const CONVERGE_START = LIVE_START + T_NETWORK_LIVE;
    const FLASH_START = CONVERGE_START + T_CONVERGE;

    // Stagger each node's "sync" moment across the LIVE phase
    nodes.forEach((n, i) => {
        n.syncOffset = (i / nodes.length) * (T_NETWORK_LIVE * 0.6);
    });

    const STATUS_MESSAGES = [
        'Syncing player profile...',
        'Calibrating streak engine...',
        'Loading XP ledger...',
        'Rebuilding habit graph...',
        'Compiling achievements...',
        'Ascending your journey...'
    ];

    const LOG_LINES = [
        '> initializing neural link...',
        '> profile.link established',
        '> streak-engine.online',
        '> xp-ledger.synced',
        '> habit-graph.loaded',
        '> boss-battle.module ready',
        '> quest-cache.warming',
        '> badge-registry.indexed',
        '> leaderboard.ping ok',
        '> card-renderer.calibrated',
        '> progress-analytics.loaded',
        '> notes.sync complete',
        '> theme-engine.applied',
        '> achievements.compiled',
        '> encryption.verified',
        '> session.secure',
        '> welcome, ascender.'
    ];

    let lastStatusIndex = -1;
    let lastLogIndex = -1;

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function draw(elapsed) {
        ctx.clearRect(0, 0, width, height);
        drawBackgroundField(elapsed);

        const cx = centerX();
        const cy = centerY();

        let coreScale = 0, networkProgress = 0, convergeProgress = 0, flashProgress = 0;

        if (elapsed < T_TEXT_HOLD) {
            coreScale = 0;
        } else if (elapsed < NETWORK_START) {
            coreScale = easeInOutCubic((elapsed - T_TEXT_HOLD) / T_CORE_GROW);
        } else if (elapsed < LIVE_START) {
            coreScale = 1;
            networkProgress = easeInOutCubic((elapsed - NETWORK_START) / T_NETWORK_FORM);
        } else if (elapsed < CONVERGE_START) {
            coreScale = 1;
            networkProgress = 1;
        } else if (elapsed < FLASH_START) {
            coreScale = 1;
            networkProgress = 1;
            convergeProgress = easeInOutCubic((elapsed - CONVERGE_START) / T_CONVERGE);
        } else {
            coreScale = 1;
            networkProgress = 1;
            convergeProgress = 1;
            flashProgress = (elapsed - FLASH_START) / T_FLASH;
        }

        const rotation = elapsed * 0.00022;
        const breathZoom = 1 + Math.sin(elapsed * 0.0009) * 0.02; // subtle camera breathing

        const activeRadius = orbitRadius * (1 - convergeProgress) * breathZoom;
        const nodeAlpha = Math.min(1, networkProgress * 2) * (1 - convergeProgress);
        const inLiveWindow = elapsed >= LIVE_START;

        nodes.forEach((node, i) => {
            const angle = node.baseAngle + rotation;
            const r = activeRadius * networkProgress;
            const nx = cx + Math.cos(angle) * r;
            const ny = cy + Math.sin(angle) * r;
            node._x = nx; node._y = ny;

            if (networkProgress > 0) {
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(nx, ny);
                ctx.strokeStyle = rgba(accentDimRGB, 0.28 * nodeAlpha);
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            const nextNode = nodes[(i + 1) % nodes.length];
            if (nextNode && networkProgress > 0.3) {
                const nAngle = nextNode.baseAngle + rotation;
                const nnx = cx + Math.cos(nAngle) * r;
                const nny = cy + Math.sin(nAngle) * r;
                ctx.beginPath();
                ctx.moveTo(nx, ny);
                ctx.lineTo(nnx, nny);
                ctx.strokeStyle = rgba(accentRGB, 0.14 * nodeAlpha);
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            if (nodeAlpha > 0.01) {
                const isSynced = inLiveWindow && (elapsed - LIVE_START) > node.syncOffset;
                const pulse = 0.7 + 0.3 * Math.sin(elapsed * 0.004 + node.pulsePhase);
                const glowSize = (isSynced ? 18 : 14) * pulse;

                const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, glowSize);
                grad.addColorStop(0, rgba(accentRGB, (isSynced ? 1 : 0.75) * nodeAlpha));
                grad.addColorStop(1, rgba(accentRGB, 0));
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(nx, ny, glowSize, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.fillStyle = rgba(accentRGB, nodeAlpha);
                ctx.arc(nx, ny, 3, 0, Math.PI * 2);
                ctx.fill();

                ctx.font = "10px 'Rajdhani', sans-serif";
                ctx.fillStyle = rgba({ r: 255, g: 255, b: 255 }, 0.7 * nodeAlpha);
                ctx.textAlign = 'center';
                const labelOffset = ny < cy ? -20 : 26;
                ctx.fillText(node.label, nx, ny + labelOffset);

                if (isSynced) {
                    ctx.font = "8px 'Rajdhani', sans-serif";
                    ctx.fillStyle = rgba(accentRGB, 0.85 * nodeAlpha);
                    ctx.fillText('✓ SYNCED', nx, ny + labelOffset + (ny < cy ? -12 : 12));
                }
            }
        });

        if (inLiveWindow && convergeProgress === 0 && Math.random() < 0.06) {
            const n = nodes[Math.floor(Math.random() * nodes.length)];
            particles.push({ toX: n._x, toY: n._y, t: 0, reverse: Math.random() < 0.5 });
        }
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.t += 0.025;
            if (p.t >= 1) { particles.splice(i, 1); continue; }
            const t = p.reverse ? 1 - p.t : p.t;
            const px = cx + (p.toX - cx) * t;
            const py = cy + (p.toY - cy) * t;
            ctx.beginPath();
            ctx.fillStyle = rgba(accentRGB, 0.85 * (1 - p.t));
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Central core
        const coreRadius = (6 + 34 * coreScale + 14 * convergeProgress) * breathZoom;
        const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 2.6);
        coreGlow.addColorStop(0, rgba(accentRGB, 0.55 * (0.4 + coreScale * 0.6) + convergeProgress * 0.3));
        coreGlow.addColorStop(1, rgba(accentRGB, 0));
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, coreRadius * 2.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = rgba({ r: 255, g: 255, b: 255 }, 0.92);
        ctx.arc(cx, cy, Math.max(2, coreRadius * 0.35), 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = rgba(accentRGB, 0.75);
        ctx.lineWidth = 1.5;
        ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Second orbit ring for extra depth
        if (coreScale > 0.4) {
            ctx.beginPath();
            ctx.strokeStyle = rgba(accentRGB, 0.25 * coreScale * (1 - convergeProgress));
            ctx.lineWidth = 1;
            ctx.arc(cx, cy, coreRadius * 1.8, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Final flash — uses the active theme's accent color instead of plain white
        if (flashProgress > 0) {
            const flashAlpha = Math.min(1, flashProgress) * 0.9;
            // Blend toward white only slightly at the peak so it still reads as a "flash",
            // but stays clearly tinted with the theme color rather than pure white.
            const blended = {
                r: Math.round(accentRGB.r + (255 - accentRGB.r) * 0.35),
                g: Math.round(accentRGB.g + (255 - accentRGB.g) * 0.35),
                b: Math.round(accentRGB.b + (255 - accentRGB.b) * 0.35)
            };
            ctx.fillStyle = rgba(blended, flashAlpha);
            ctx.fillRect(0, 0, width, height);
        }
    }

    function updateText(elapsed) {
        if (elapsed < T_TEXT_HOLD) {
            messageEl.style.opacity = '1';
            subEl.style.opacity = '0';
        } else if (elapsed < NETWORK_START) {
            messageEl.style.opacity = '0';
        } else {
            const statusIndex = Math.min(
                STATUS_MESSAGES.length - 1,
                Math.floor(((elapsed - NETWORK_START) / (T_NETWORK_FORM + T_NETWORK_LIVE)) * STATUS_MESSAGES.length)
            );
            if (statusIndex !== lastStatusIndex) {
                lastStatusIndex = statusIndex;
                subEl.style.opacity = '0';
                setTimeout(() => {
                    subEl.textContent = STATUS_MESSAGES[statusIndex];
                    subEl.style.opacity = '0.75';
                }, 120);
            }

            const logIndex = Math.min(
                LOG_LINES.length - 1,
                Math.floor(((elapsed - NETWORK_START) / (TOTAL - NETWORK_START)) * LOG_LINES.length)
            );
            if (logIndex !== lastLogIndex) {
                lastLogIndex = logIndex;
                const line = document.createElement('div');
                line.className = 'hud-log-line';
                line.textContent = LOG_LINES[logIndex];
                logEl.appendChild(line);
                logEl.scrollTop = logEl.scrollHeight;
            }
        }

        if (elapsed >= CONVERGE_START) {
            subEl.style.opacity = '0';
        }

        const pct = Math.min(100, Math.round((elapsed / TOTAL) * 100));
        percentEl.textContent = pct.toString().padStart(2, '0') + '%';
    }

    let startTime = null, pausedAt = null, elapsedBeforePause = 0, rafId = null;

    function loop(now) {
        if (startTime === null) startTime = now;
        const elapsed = (now - startTime) - elapsedBeforePause;

        draw(elapsed);
        updateText(elapsed);

        if (elapsed >= TOTAL) {
            window.location.href = nextPage;
            return;
        }
        rafId = requestAnimationFrame(loop);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (rafId) cancelAnimationFrame(rafId);
            pausedAt = performance.now();
        } else if (pausedAt !== null) {
            const pauseDuration = performance.now() - pausedAt;
            startTime += pauseDuration;
            pausedAt = null;
            rafId = requestAnimationFrame(loop);
        }
    });

    rafId = requestAnimationFrame(loop);
})();