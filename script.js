// AURA - Interaction Logic

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Sticky Transparent Navbar Logic
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Run once on load in case user is already scrolled down
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    }

    // 2. Intersection Observer for Fade-in Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the 'appear' class to trigger CSS transition
                entry.target.classList.add('appear');
                // Stop observing once animated to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements with animation classes
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // 3. Scroll-linked Pizza Rolling Animation
    const rollingPizza = document.getElementById('rolling-pizza');
    if (rollingPizza) {
        window.addEventListener('scroll', () => {
            // Calculate rotation based on scroll position. 
            // 0.3 defines the speed at which it rotates relative to scroll distance
            const rotationDegree = window.scrollY * 0.3; 
            rollingPizza.style.transform = `rotate(${rotationDegree}deg)`;
        });
    }

    // 4. Live Booking Form Submission Logic
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = bookingForm.querySelector('button[type="submit"]');
            const msg = document.getElementById('booking-msg');
            
            btn.innerText = "Processing...";
            btn.disabled = true;

            const payload = {
                name: document.getElementById('b-name').value,
                email: document.getElementById('b-email').value,
                date: document.getElementById('b-date').value,
                time: document.getElementById('b-time').value,
                requests: document.getElementById('b-req').value
            };

            try {
                // Pointing to our new local Node backend
                const res = await fetch('http://localhost:3000/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                    msg.style.color = "green";
                    msg.innerText = "Reservation Received. We will see you soon!";
                    bookingForm.reset();
                } else {
                    msg.style.color = "#d9534f";
                    msg.innerText = "Error: Could not process booking.";
                }
            } catch (err) {
                // Fallback for when the Node backend isn't running
                msg.style.color = "#d9534f";
                msg.innerText = "Network Error: Is the backend server running on port 3000?";
                console.error("Booking failed:", err);
            } finally {
                msg.style.display = "block";
                btn.innerText = "Confirm Reservation";
                btn.disabled = false;
            }
        });
    }

});
