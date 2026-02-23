/**
 * Navbar System
 * Handles:
 * - Mobile hamburger toggle
 * - Overlay behavior
 * - Universal dropdown system (mobile + desktop)
 */

document.addEventListener('DOMContentLoaded', function () {

    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;

    /* ================= OVERLAY SETUP ================= */

    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    body.appendChild(overlay);

    /* ================= MOBILE MENU ================= */

    function openMenu() {
        navMenu?.classList.add('active');
        menuToggle?.classList.add('active');
        overlay.classList.add('active');
        body.style.overflow = 'hidden';

        if (menuToggle) menuToggle.innerHTML = '✕';
    }

    function closeMenu() {
        navMenu?.classList.remove('active');
        menuToggle?.classList.remove('active');
        overlay.classList.remove('active');
        body.style.overflow = '';

        if (menuToggle) menuToggle.innerHTML = '☰';

        closeAllDropdowns();
    }

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            navMenu.classList.contains('active') ? closeMenu() : openMenu();
        });

        overlay.addEventListener('click', closeMenu);
    }

    /* ================= UNIVERSAL DROPDOWN SYSTEM ================= */

    const dropdownTriggers = document.querySelectorAll('.nav-button-dropdown');

    function closeAllDropdowns() {
        document.querySelectorAll('.nav-item.dropdown').forEach(item => {
            item.classList.remove('open');

            const menu = item.querySelector('.dropdown-menu');
            if (menu) menu.classList.remove('show');

            const button = item.querySelector('.nav-button-dropdown');
            if (button) button.classList.remove('active');
        });
    }

    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();

            const dropdownItem = this.closest('.nav-item.dropdown');
            const dropdownMenu = dropdownItem?.querySelector('.dropdown-menu');
            const isOpen = dropdownItem?.classList.contains('open');

            closeAllDropdowns();

            if (!isOpen && dropdownItem && dropdownMenu) {
                dropdownItem.classList.add('open');
                dropdownMenu.classList.add('show');
                this.classList.add('active');
            }
        });
    });

    /* ================= CLOSE ON OUTSIDE CLICK ================= */

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.nav-item.dropdown') &&
            !e.target.closest('#menu-toggle')) {
            closeAllDropdowns();
        }
    });

    /* ================= CLOSE MENU ON LINK CLICK ================= */

    const navLinks = document.querySelectorAll(
        '.nav-menu .nav-button:not(.nav-button-dropdown)'
    );

    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    /* ================= RESET ON RESIZE ================= */

    let resizeTimer;

    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(function () {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        }, 100);
    });

});
