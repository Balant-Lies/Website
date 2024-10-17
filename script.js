document.addEventListener('DOMContentLoaded', function() {
    const loadingPage = document.getElementById('loading-page');
    const mainContent = document.getElementById('main-content');
    const videos = [
        document.getElementById('video1'),
        document.getElementById('video2'),
        document.getElementById('video3'),
        document.getElementById('video4'),
        document.getElementById('designerVideo'),
        document.getElementById('video5')
    ];
    const audienceButtons = document.querySelectorAll('.audience-btn');
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    let currentVideoIndex = 0;
    let loopCount = 0;
    let pendingTransition = null;

    function playVideo(video) {
        video.style.display = 'block';
        video.currentTime = 0;
        video.play().catch(e => console.error("Video play failed:", e));
    }

    function hideVideo(video) {
        video.style.display = 'none';
        video.pause();
        video.currentTime = 0;
        video.style.opacity = 1; // Reset opacity
    }

    function getRandomLoopCount(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function preloadNextVideo(index) {
        const nextIndex = (index + 1) % 5;
        const nextVideo = videos[nextIndex];
        nextVideo.load();
        return new Promise(resolve => {
            nextVideo.oncanplaythrough = resolve;
        });
    }

    function crossfadeToDesignerVideo(fromVideo, toVideo) {
        fromVideo.style.opacity = 1;
        toVideo.style.opacity = 0;
        toVideo.style.display = 'block';
        toVideo.play().catch(e => console.error("Video play failed:", e));
    
        let opacity = 0;
        const fadeInterval = setInterval(() => {
            opacity += 0.1;
            fromVideo.style.opacity = 1 - opacity;
            toVideo.style.opacity = opacity;
            if (opacity >= 1) {
                clearInterval(fadeInterval);
                hideVideo(fromVideo);
                currentVideoIndex = 4; // Designer video index
                setupVideoEndListener();
            }
        }, 20); // Faster crossfade (20ms intervals)
    }
    
    async function instantTransition(newVideoIndex) {
        const currentVideo = videos[currentVideoIndex];
        const newVideo = videos[newVideoIndex];
    
        if (newVideoIndex === 4) {
            // Crossfade to designer video
            crossfadeToDesignerVideo(currentVideo, newVideo);
        } else {
            hideVideo(currentVideo);
            newVideo.style.opacity = 1;
            playVideo(newVideo);
            currentVideoIndex = newVideoIndex;
            loopCount = 0;
            setupVideoEndListener();
        }
        preloadNextVideo(currentVideoIndex);
    }
    
    function setupVideoEndListener() {
        const currentVideo = videos[currentVideoIndex];
    
        currentVideo.onended = async function() {
            if (currentVideoIndex === 4) {
                // Instant transition to video 5
                hideVideo(currentVideo);
                videos[5].currentTime = 0;
                videos[5].style.display = 'block';
                videos[5].loop = true;
                try {
                    await videos[5].play();
                    currentVideoIndex = 5;
                } catch (e) {
                    console.error("Video 5 play failed:", e);
                }
            } else if (pendingTransition !== null) {
                await instantTransition(pendingTransition);
                pendingTransition = null;
            } else if (currentVideoIndex === 0 || currentVideoIndex === 2) {
                const maxLoops = getRandomLoopCount(1, 2);
                loopCount++;
                if (loopCount < maxLoops) {
                    currentVideo.currentTime = 0;
                    currentVideo.play().catch(e => console.error("Video play failed:", e));
                } else {
                    await instantTransition((currentVideoIndex + 1) % 4);
                }
            } else {
                await instantTransition((currentVideoIndex + 1) % 4);
            }
        };
    }
    

    function setupVideoTransitions() {
        videos.forEach((video, index) => {
            video.loop = false;
            video.preload = 'auto';
            if (index !== 0) {
                video.style.display = 'none';
            }
        });
    }

    async function initializeVideos() {
        setupVideoTransitions();
        try {
            for (let i = 0; i < videos.length; i++) {
                await preloadNextVideo(i);
            }
            loadingPage.style.display = 'none';
            mainContent.style.display = 'block';
            playVideo(videos[0]);
            setupVideoEndListener();
        } catch (error) {
            console.error("Error initializing videos:", error);
            loadingPage.innerHTML = '<h1>Error loading videos. Please refresh the page.</h1>';
        }
    }

    function updateHeroContent(audienceType) {
        const title = document.getElementById('hero-title');
        const subtitle = document.getElementById('hero-subtitle');

        // Fade out current content
        title.classList.add('fade-out');
        subtitle.classList.add('fade-out');

        setTimeout(() => {
            // Update content
            switch (audienceType) {
                case 'everyone':
                    title.textContent = 'Creative Problem Solver';
                    subtitle.textContent = 'Innovative solutions for all';
                    break;
                case 'recruiters':
                    title.textContent = 'Product Designer';
                    subtitle.textContent = 'Motion graphics & Digital solutions';
                    break;
                case 'designers':
                    title.textContent = 'Design Enthusiast';
                    subtitle.textContent = 'Pushing boundaries in design';
                    break;
            }

            // Remove fade-out class and add fade-in
            title.classList.remove('fade-out');
            subtitle.classList.remove('fade-out');
            title.classList.add('fade-in');
            subtitle.classList.add('fade-in');

            // Remove fade-in class after animation completes
            setTimeout(() => {
                title.classList.remove('fade-in');
                subtitle.classList.remove('fade-in');
            }, 100);
        }, 100); // Wait for fade-out to complete
    }

    audienceButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Stop video 5 if it's playing
            if (currentVideoIndex === 5) {
                videos[5].pause();
                videos[5].loop = false;
            }

            audienceButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');

            const audienceType = this.dataset.audience;
            updateHeroContent(audienceType);
            const targetIndex = audienceType === 'designers' ? 4 : 0;

            if (currentVideoIndex === 4 || videos[currentVideoIndex].ended || currentVideoIndex === 5) {
                instantTransition(targetIndex);
            } else {
                pendingTransition = targetIndex;
            }
        });
    });


    // Hamburger menu functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Project hover effect
    const projectsContainer = document.querySelector('.projects-container');
    const projects = document.querySelectorAll('.project');
    const hoverElement = document.createElement('div');
    hoverElement.className = 'project-hover';
    const hoverContainer = document.createElement('div');
    hoverContainer.className = 'project-hover-container';
    const gifImage = document.createElement('img');
    hoverContainer.appendChild(gifImage);
    hoverElement.appendChild(hoverContainer);
    document.body.appendChild(hoverElement);

    projects.forEach(project => {
        const projectGifSrc = project.querySelector('.project-hover img').src;

        project.addEventListener('mouseenter', (e) => {
            gifImage.src = projectGifSrc;
            hoverElement.classList.add('active');
            updateHoverPosition(e);
        });

        project.addEventListener('mousemove', (e) => {
            updateHoverPosition(e);
        });

        project.addEventListener('mouseleave', () => {
            hoverElement.classList.remove('active');
        });
    });

    projectsContainer.addEventListener('mouseleave', () => {
        hoverElement.classList.remove('active');
    });

    function updateHoverPosition(e) {
        const offsetX = 100;
        const offsetY = -200;
        hoverElement.style.left = `${e.clientX + offsetX}px`;
        hoverElement.style.top = `${e.clientY + offsetY}px`;
    }
    const hireButtons = document.querySelectorAll('.hire-now');
    
    hireButtons.forEach(button => {
        button.addEventListener('click', function() {
            const email = 'harshmadhav2@gmail.com';
            const subject = 'Hire Inquiry';
            const body = "I'm interested in hiring you for a project.";
            
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            window.open(gmailUrl, '_blank');

        });
    });

    initializeVideos();
});
