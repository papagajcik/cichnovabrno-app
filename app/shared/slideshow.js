// shared/slideshow.js
// Slideshow manager pro TV obrazovky

class SlideshowManager {
    constructor(options = {}) {
        this.intervalMs = options.intervalMs || 8000;
        this.slides = [];
        this.currentIndex = 0;
        this.intervalId = null;
        this.isRunning = false;
        this.tvId = options.tvId || 'unknown';
    }

    registerSlide(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            this.slides.push({
                id: elementId,
                element: element,
                condition: null
            });
        }
        return this;
    }

    registerConditionalSlide(elementId, conditionFn) {
        const element = document.getElementById(elementId);
        if (element) {
            this.slides.push({
                id: elementId,
                element: element,
                condition: conditionFn
            });
        }
        return this;
    }

    getActiveSlides() {
        return this.slides.filter(slide => {
            if (slide.condition) {
                return slide.condition();
            }
            return true;
        });
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        
        // První aktivní slide
        const activeSlides = this.getActiveSlides();
        if (activeSlides.length > 0) {
            activeSlides[0].element.classList.add('active');
        }
        
        this.intervalId = setInterval(() => {
            if (window.state && window.state.mode !== 'standard') return;
            
            const activeSlides = this.getActiveSlides();
            if (activeSlides.length === 0) return;
            
            // Skryj aktuální slide
            activeSlides[this.currentIndex].element.classList.remove('active');
            
            // Posun na další
            this.currentIndex = (this.currentIndex + 1) % activeSlides.length;
            
            // Zobraz nový slide
            activeSlides[this.currentIndex].element.classList.add('active');
        }, this.intervalMs);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    }

    refresh() {
        // Znovu vyhodnotí podmínky a resetuje slideshow
        const activeSlides = this.getActiveSlides();
        if (activeSlides.length === 0) return;
        
        // Zkontroluj jestli je aktuální slide stále aktivní
        const currentSlide = activeSlides[this.currentIndex];
        if (!currentSlide || !currentSlide.element.classList.contains('active')) {
            // Pokud ne, najdi první aktivní a nastav ho
            this.currentIndex = 0;
            activeSlides.forEach((slide, idx) => {
                if (idx === 0) slide.element.classList.add('active');
                else slide.element.classList.remove('active');
            });
        }
    }

    goToSlide(index) {
        const activeSlides = this.getActiveSlides();
        if (index < 0 || index >= activeSlides.length) return;
        
        activeSlides[this.currentIndex].element.classList.remove('active');
        this.currentIndex = index;
        activeSlides[this.currentIndex].element.classList.add('active');
    }

    nextSlide() {
        const activeSlides = this.getActiveSlides();
        if (activeSlides.length === 0) return;
        
        activeSlides[this.currentIndex].element.classList.remove('active');
        this.currentIndex = (this.currentIndex + 1) % activeSlides.length;
        activeSlides[this.currentIndex].element.classList.add('active');
    }

    prevSlide() {
        const activeSlides = this.getActiveSlides();
        if (activeSlides.length === 0) return;
        
        activeSlides[this.currentIndex].element.classList.remove('active');
        this.currentIndex = (this.currentIndex - 1 + activeSlides.length) % activeSlides.length;
        activeSlides[this.currentIndex].element.classList.add('active');
    }
}

window.SlideshowManager = SlideshowManager;