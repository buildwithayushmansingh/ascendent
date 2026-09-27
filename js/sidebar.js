// =========================================================
// ASCENDENT SIDEBAR
// =========================================================

(function () {

    const currentPage =
        window.location.pathname
            .split('/')
            .pop() || 'dashboard.html';


    // Automatically activate current page
    document.querySelectorAll('.nav-tile[href]').forEach(link => {

        const href =
            link.getAttribute('href');

        if (href === currentPage) {
            link.classList.add('nav-active');
        } else {
            link.classList.remove('nav-active');
        }

    });


    // Load player HUD
    if (typeof getDemoUser !== 'function') {
        return;
    }

    const user = getDemoUser();

    const level =
        document.getElementById('sidebarLevel');

    const name =
        document.getElementById('sidebarPlayerName');

    const xpText =
        document.getElementById('sidebarXpText');

    const xpFill =
        document.getElementById('sidebarXpFill');

    const streak =
        document.getElementById('sidebarStreak');


    if (level) {
        level.textContent =
            `LVL ${user.level}`;
    }


    if (name) {
        name.textContent =
            (user.username || 'PLAYER')
                .toUpperCase();
    }


    if (xpText) {
        xpText.textContent =
            `${user.xp.toLocaleString()} / ${user.xpToNextLevel.toLocaleString()}`;
    }


    if (xpFill) {

        const percentage =
            Math.min(
                100,
                Math.round(
                    (user.xp / user.xpToNextLevel) * 100
                )
            );

        requestAnimationFrame(() => {
            xpFill.style.width =
                `${percentage}%`;
        });
    }


    if (streak) {
        streak.textContent =
            user.currentStreak;
    }


    // Apply uploaded profile image
    if (typeof applyAvatarImage === 'function') {
        applyAvatarImage('#sidebarAvatar');
    }

})();