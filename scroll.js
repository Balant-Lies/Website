document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.querySelector('.project-sidebar');
    const sections = document.querySelectorAll('section');
    const sidebarLinks = sidebar.querySelectorAll('a');
    const fadeElements = document.querySelectorAll('.fade-in');

    function checkScroll() {
        const triggerBottom = window.innerHeight / 5 * 4;

        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < triggerBottom) {
                element.classList.add('visible');
            }
        });

        if (window.scrollY > window.innerHeight) {
            sidebar.classList.add('visible');
        } else {
            sidebar.classList.remove('visible');
        }

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - window.innerHeight / 2 &&
                window.scrollY < sectionTop + sectionHeight - window.innerHeight / 2) {
                const correspondingLink = sidebar.querySelector(`a[href="#${section.id}"]`);
                if (correspondingLink) {
                    const subMenu = correspondingLink.nextElementSibling;
                    if (subMenu && subMenu.tagName === 'UL') {
                        subMenu.classList.add('active');
                    }
                }
            } else {
                const correspondingLink = sidebar.querySelector(`a[href="#${section.id}"]`);
                if (correspondingLink) {
                    const subMenu = correspondingLink.nextElementSibling;
                    if (subMenu && subMenu.tagName === 'UL') {
                        subMenu.classList.remove('active');
                    }
                }
            }
        });
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            window.scrollTo({
                top: targetSection.offsetTop - 60,
                behavior: 'smooth'
            });
        });
    });

    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Initial check
});
