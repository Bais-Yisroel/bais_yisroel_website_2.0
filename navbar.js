/**
 * Mobile Navigation Toggle Script
 * Handles hamburger menu toggle and dropdown functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;
    
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    body.appendChild(overlay);
    
    // Toggle mobile menu
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            const isActive = navMenu.classList.contains('active');
            
            if (isActive) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        // Close menu when clicking overlay
        overlay.addEventListener('click', closeMenu);
    }
    
    function openMenu() {
        if (navMenu) {
            navMenu.classList.add('active');
        }
        if (menuToggle) {
            menuToggle.classList.add('active');
            menuToggle.innerHTML = '✕';
        }
        overlay.classList.add('active');
        body.style.overflow = 'hidden';
    }
    
    function closeMenu() {
        if (navMenu) {
            navMenu.classList.remove('active');
        }
        if (menuToggle) {
            menuToggle.classList.remove('active');
            menuToggle.innerHTML = '☰';
        }
        overlay.classList.remove('active');
        body.style.overflow = '';
        
        // Close all dropdowns when closing menu
        document.querySelectorAll('.dropdown-menu').forEach(function(dropdown) {
            dropdown.classList.remove('show');
        });
        document.querySelectorAll('.nav-item.dropdown').forEach(function(item) {
            item.classList.remove('open');
        });
    }
    
    // Handle dropdown toggles on mobile
    const dropdownTriggers = document.querySelectorAll('.nav-button-dropdown');
    
    dropdownTriggers.forEach(function(trigger) {
        trigger.addEventListener('click', function(e) {
            // Toggle on both mobile AND for education dropdown on desktop
            const isMobile = window.innerWidth <= 768;
            const isEducationTrigger = this.classList.contains('nav-button-education');
            
            if (isMobile || isEducationTrigger) {
                const dropdown = this.closest('.nav-item.dropdown');
                const dropdownMenu = dropdown.querySelector('.dropdown-menu');
                const isOpen = dropdown.classList.contains('open');
                
                // Close all other dropdowns
                document.querySelectorAll('.nav-item.dropdown').forEach(function(item) {
                    if (item !== dropdown) {
                        item.classList.remove('open');
                        const menu = item.querySelector('.dropdown-menu');
                        if (menu) {
                            menu.classList.remove('show');
                        }
                    }
                });
                
                if (isOpen) {
                    dropdown.classList.remove('open');
                    if (dropdownMenu) {
                        dropdownMenu.classList.remove('show');
                    }
                } else {
                    dropdown.classList.add('open');
                    if (dropdownMenu) {
                        dropdownMenu.classList.add('show');
                    }
                }
                
                e.preventDefault();
            }
        });
    });
    
    // Close menu when clicking a nav link (except dropdown triggers)
    const navLinks = document.querySelectorAll('.nav-menu .nav-button:not(.nav-button-dropdown)');
    navLinks.forEach(function(link) {
        link.addEventListener('click', closeMenu);
    });
    
    // Handle back button functionality (if present)
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            // If menu is open, close it
            if (navMenu && navMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    }
    
    // Reset menu state on window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                closeMenu();
                // Reset dropdown styles on desktop
                document.querySelectorAll('.dropdown-menu').forEach(function(menu) {
                    menu.classList.remove('show');
                });
                document.querySelectorAll('.nav-item.dropdown').forEach(function(item) {
                    item.classList.remove('open');
                });
            }
        }, 100);
    });
});

