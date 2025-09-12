// Photo Management System
// Array containing all photo filenames in assets/images folder
const photoList = [
    "new-photo-top.jpg",
    "ica-drinking.jpg",
    "WhatsApp Image 2025-08-11 at 14.24.21_d50c4272.jpg",
    "WhatsApp Image 2025-08-12 at 00.50.35_978194b6.jpg",
    "bayuganteng.jpg",
    "beachseal.jpg",
    "forbeach1.jpg",
    "icacayangku - Copy.jpg",
    "icacayangku.jpg",
    "icadanbayu.jpg",
    "kita.jpg",
    "sayangku cantik.jpg",
    "widihcantikbanget.jpg",
    "wow.jpg",
    "wowcantik banget.jpg",
    "yoyo.jpg"
];

// Function to get total photo count
function getPhotoCount() {
    return photoList.length;
}

// Function to update photo count display
function updatePhotoCount() {
    const photoCountElement = document.getElementById('photoCount');
    const photoCountHomeElement = document.getElementById('photoCountHome');
    
    const count = getPhotoCount();
    
    if (photoCountElement) {
        // Animate the counter for about page
        animatePhotoCount(photoCountElement, 0, count, 1500);
    }
    
    if (photoCountHomeElement) {
        // Animate the counter for home page
        animatePhotoCount(photoCountHomeElement, 0, count, 1500);
    }
}

// Function to animate photo count
function animatePhotoCount(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Function to get all photo paths (useful for gallery)
function getAllPhotoPaths() {
    return photoList.map(photo => `assets/images/${photo}`);
}

// Function to add new photo to the list
function addPhoto(filename) {
    if (!photoList.includes(filename)) {
        photoList.push(filename);
        updatePhotoCount();
        return true;
    }
    return false;
}

// Function to remove photo from the list
function removePhoto(filename) {
    const index = photoList.indexOf(filename);
    if (index > -1) {
        photoList.splice(index, 1);
        updatePhotoCount();
        return true;
    }
    return false;
}

// Function to validate if image exists
function validateImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => reject(false);
        img.src = src;
    });
}

// Function to get valid photos only
async function getValidPhotos() {
    const validPhotos = [];
    for (const photo of photoList) {
        try {
            await validateImage(`assets/images/${photo}`);
            validPhotos.push(photo);
        } catch (error) {
            console.warn(`Photo not found: ${photo}`);
        }
    }
    return validPhotos;
}

// Function to create lazy loading observer
function createLazyLoadObserver() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        return imageObserver;
    }
    return null;
}

// Enhanced image loading with lazy loading support
function loadImageWithLazyLoading(src, alt, className, observer) {
    const img = document.createElement('img');
    
    if (observer) {
        img.dataset.src = src;
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect fill="%23f0f0f0" width="300" height="200"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999"%3ELoading...%3C/text%3E%3C/svg%3E';
        img.className = `${className} lazy`;
        observer.observe(img);
    } else {
        img.src = src;
        img.className = className;
    }
    
    img.alt = alt;
    img.onerror = function() {
        console.error('Image failed to load:', this.src);
        this.style.display = 'none';
        if (this.parentElement) {
            this.parentElement.style.opacity = '0.5';
        }
    };
    
    return img;
}

// Initialize photo count when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updatePhotoCount();
});
