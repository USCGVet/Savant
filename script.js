document.addEventListener('DOMContentLoaded', (event) => {
    const toggle = document.getElementById('buttonChaseToggle');
    const button = document.getElementById('metamaskButton');
    const beam = document.querySelector('.beam');
    document.body.style.cursor = 'none';

     // Create the laser dot element
     const laserDot = document.createElement('div');
     laserDot.classList.add('laser-dot');
     document.body.appendChild(laserDot);

    let isChasing = true;
    let animationInterval;

    function changeBeamAnimation() {
        if (!toggle.checked) {
            beam.style.animation = 'none';
            beam.classList.add('disabled');
            return;
        }

        beam.classList.remove('disabled');
        
        const direction = Math.random() < 0.5 ? 'Clockwise' : 'CounterClockwise';
        const duration = Math.random() * 3.69; // Between 1 and 4 seconds
        
        beam.style.animation = `rotate${direction} ${duration}s linear infinite`;
        
        // Schedule next change
        clearTimeout(animationInterval);
        animationInterval = setTimeout(changeBeamAnimation, Math.random() * 1000 + 200); // Change every 2-5 seconds
    }

    // Set toggle to checked and start animation on page load
    toggle.checked = true;
    changeBeamAnimation();

   
    // Set initial position
    let buttonX = window.innerWidth - button.offsetWidth - 210; // 180px from right edge
    let buttonY = 20; // 20px from top

    function updateButtonPosition() {
        button.style.position = 'fixed';
        button.style.left = `${buttonX}px`;
        button.style.top = `${buttonY}px`;
        button.style.transition = 'none'; // Ensure instant movement
    }

    function teleportButton() {
        // Generate new random position
        buttonX = Math.random() * (window.innerWidth - button.offsetWidth);
        buttonY = Math.random() * (window.innerHeight - button.offsetHeight);
        updateButtonPosition();
    }

    // enable chasing on page load 
    updateButtonPosition();

    
 
     // Update laser dot position     
     document.addEventListener('mousemove', (e) => {
        if (isChasing) {
            laserDot.style.left = `${e.clientX}px`;
            laserDot.style.top = `${e.clientY}px`;
        }
     });
     

     // Hide laser dot when mouse leaves the window     
     document.addEventListener('mouseout', () => {
        if (isChasing) {
            laserDot.classList.add('hidden');
        }
     });
    

     // Show laser dot when mouse enters the window     
     document.addEventListener('mouseover', () => {
        if (isChasing) {
            laserDot.classList.remove('hidden');
        }
     });
    

     function updateCursorStyle(hide) {
        if (hide) {
            document.documentElement.style.cursor = 'none !important';
            document.body.style.cursor = 'none !important';
        } else {
            document.documentElement.style.cursor = 'default';
            document.body.style.cursor = 'default';
        }
    }

    // Set initial cursor state
    updateCursorStyle(isChasing);


     toggle.addEventListener('change', (e) => {
        isChasing = e.target.checked;
        if (!isChasing) {
            // Disable laser dot and show normal cursor
            laserDot.classList.add('hidden');
            document.body.style.cursor = 'default';

            updateCursorStyle(false);

            // Reset button to initial position when turned off
            buttonX = window.innerWidth - button.offsetWidth - 210;
            buttonY = 20;
            updateButtonPosition();

            // Stop beam animation
            clearTimeout(animationInterval);
            beam.style.animation = 'none';
            beam.classList.add('disabled');
        } else {
            // Enable laser dot and hide normal cursor
            laserDot.classList.remove('hidden');
            document.body.style.cursor = 'none';

            updateCursorStyle(true);

            // Restart beam animation
            changeBeamAnimation();
            // Teleport button to a new position
            teleportButton();
        }
    });

   

    document.addEventListener('mousemove', (e) => {
        if (!isChasing) return;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const buttonRect = button.getBoundingClientRect();
        const safetyMargin = 50; // 100px safety zone

        // Check if mouse is within the safety zone
        if (mouseX >= buttonRect.left - safetyMargin &&
            mouseX <= buttonRect.right + safetyMargin &&
            mouseY >= buttonRect.top - safetyMargin &&
            mouseY <= buttonRect.bottom + safetyMargin) {
            teleportButton();
        }
    });

    // Handle window resizing
    window.addEventListener('resize', () => {
        if (!isChasing) {
            buttonX = window.innerWidth - button.offsetWidth - 210;
            buttonY = 20;
            updateButtonPosition();
        } else {
            teleportButton();
        }
    });
});