document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Animación de Campo 3D Intro---
    const introCanvas = document.getElementById('intro-canvas');
    const introCtx = introCanvas.getContext('2d');
    let introWidth, introHeight, centerX, centerY;

    function resizeIntro() {
        introWidth = window.innerWidth;
        introHeight = window.innerHeight;
        introCanvas.width = introWidth;
        introCanvas.height = introHeight;
        centerX = introWidth / 2;
        centerY = introHeight / 2;
    }
    window.addEventListener('resize', resizeIntro);
    resizeIntro();

    //Crea un lienzo fuera de pantalla para que el girasol se renderice rápido
    const flowerCanvas = document.createElement('canvas');
    flowerCanvas.width = 200;
    flowerCanvas.height = 400;
    const fctx = flowerCanvas.getContext('2d');
    
    //Dibuja el tallo
    fctx.beginPath();
    fctx.moveTo(100, 100);
    fctx.lineTo(100, 400); //Directo hacia abajo
    fctx.strokeStyle = '#2e7d32'; //Verde oscuro para contrastar con el césped de fondo
    fctx.lineWidth = 14;
    fctx.stroke();

    //Draw leaves
    //Hoja izquierda
    fctx.beginPath();
    fctx.moveTo(100, 250);
    fctx.quadraticCurveTo(40, 200, 20, 240);
    fctx.quadraticCurveTo(50, 280, 100, 250);
    fctx.fillStyle = '#2e7d32'; //Combina con verde oscuro
    fctx.fill();

    //Hoja derecha
    fctx.beginPath();
    fctx.moveTo(100, 320);
    fctx.quadraticCurveTo(160, 270, 180, 310);
    fctx.quadraticCurveTo(150, 350, 100, 320);
    fctx.fill();
    
    //Dibuja pétalos
    fctx.translate(100, 100);
    const numPetals = 20;
    //Pétalos traseros (anaranjados)
    for (let i = 0; i < numPetals; i++) {
        fctx.save();
        fctx.rotate((i * Math.PI * 2) / numPetals);
        fctx.beginPath();
        fctx.moveTo(0, -20);
        fctx.quadraticCurveTo(15, -60, 0, -80);
        fctx.quadraticCurveTo(-15, -60, 0, -20);
        fctx.fillStyle = '#f57f17';
        fctx.fill();
        fctx.restore();
    }
    //Pétalos delanteros (amarillos)
    for (let i = 0; i < numPetals; i++) {
        fctx.save();
        fctx.rotate((i * Math.PI * 2) / numPetals + (Math.PI / numPetals));
        fctx.beginPath();
        fctx.moveTo(0, -20);
        fctx.quadraticCurveTo(12, -50, 0, -70);
        fctx.quadraticCurveTo(-12, -50, 0, -20);
        fctx.fillStyle = '#fbc02d';
        fctx.fill();
        fctx.restore();
    }
    
    //Dibuja el centro
    fctx.beginPath();
    fctx.arc(0, 0, 35, 0, Math.PI * 2);
    fctx.fillStyle = '#4e342e';
    fctx.fill();
    //Cuadrícula/puntos para el centro
    fctx.fillStyle = '#3e2723';
    for (let r = 5; r < 35; r += 6) {
        let numDots = Math.floor(r * 2);
        for (let j = 0; j < numDots; j++) {
            let angle = (j * Math.PI * 2) / numDots;
            fctx.beginPath();
            fctx.arc(r * Math.cos(angle), r * Math.sin(angle), 1.5, 0, Math.PI*2);
            fctx.fill();
        }
    }

    //Variables del motor 3D
    const flowers3D = [];
    const numFlowers3D = 150;
    const focalLength = 300;
    const flyingSpeed = 12;
    let isIntroRunning = true;

    for (let i = 0; i < numFlowers3D; i++) {
        flowers3D.push({
            x: (Math.random() - 0.5) * 4000,
            y: -150 + Math.random() * 250,  //Lo suficientemente alto para alcanzar el cielo, pero equilibrado
            z: Math.random() * 3000,
            scale: 1.0 + Math.random() * 1.0 // Reducido de enorme a solo grande
        });
    }

    function animateIntro() {
        if (!isIntroRunning) return;
        
        introCtx.clearRect(0, 0, introWidth, introHeight);
        
        // Mueve las flores hacia la cámara.
        flowers3D.forEach(f => {
            f.z -= flyingSpeed;
            if (f.z <= 10) {
                f.z += 3000; // recycle to the back
                f.x = (Math.random() - 0.5) * 4000;
            }
        });
        
        //Ordenar por Z para dibujar de atrás hacia adelante (algoritmo del pintor)
        flowers3D.sort((a, b) => b.z - a.z);
        
        flowers3D.forEach(f => {
            if (f.z > 0) {
                const scale = focalLength / f.z;
                const projectedX = centerX + f.x * scale;
                // Add some sway based on x and z
                const sway = Math.sin(Date.now() * 0.002 + f.x) * 20 * scale;
                // Move them down slightly to form a field
                const projectedY = centerY + f.y * scale + (introHeight * 0.2); 
                
                const drawWidth = 200 * scale * f.scale;
                const drawHeight = 400 * scale * f.scale;
                
                // Aparecer desde lejos, desaparecer muy cerca
                let alpha = 1;
                if (f.z > 2500) alpha = (3000 - f.z) / 500;
                else if (f.z < 200) alpha = f.z / 200;
                
                introCtx.globalAlpha = Math.max(0, Math.min(1, alpha));
                introCtx.drawImage(
                    flowerCanvas, 
                    projectedX - drawWidth/2 + sway, 
                    projectedY - drawHeight * 0.3, 
                    drawWidth, 
                    drawHeight
                );
            }
        });
        
        requestAnimationFrame(animateIntro);
    }
    animateIntro();

    //--- 1b. Gestión de la secuencia de introducción ---
    let introTimeout;

    function endIntroSequence() {
        const introContainer = document.getElementById('intro-container');
        introContainer.style.opacity = '0';
        
        const mainUI = document.getElementById('main-ui');
        mainUI.classList.add('visible');
        document.body.classList.add('show-ui');

        setTimeout(() => {
            isIntroRunning = false;
            introContainer.style.display = 'none';
        }, 2000); //Esperar a que se desvanezca
    }

    function startIntroSequence() {
        const introContainer = document.getElementById('intro-container');
        const mainUI = document.getElementById('main-ui');
        
        //Ocultar la interfaz y reiniciar la luna
        mainUI.classList.remove('visible');
        document.body.classList.remove('show-ui');
        
        //Mostrar el campo de nuevo
        introContainer.style.display = 'block';
        void introContainer.offsetWidth; // Force reflow
        introContainer.style.opacity = '1';

        //Asegúrate de que el bucle de animación se esté ejecutando.
        if (!isIntroRunning) {
            isIntroRunning = true;
            animateIntro();
        }

        //Configura el temporizador para finalizar la introducción.
        clearTimeout(introTimeout);
        introTimeout = setTimeout(endIntroSequence, 6000);
    }

    // Start initial intro
    introTimeout = setTimeout(endIntroSequence, 6000);



    // --- 2. Theme Toggle ---
    const themeSwitch = document.getElementById('theme-switch');
    const toggleText = document.querySelector('.toggle-text');
    
    themeSwitch.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('night');
            toggleText.textContent = 'Cambiar a Día';
        } else {
            document.body.classList.remove('night');
            toggleText.textContent = 'Cambiar a Noche';
        }
        
        // Redraw realistic grass immediately for the new theme
        drawRealisticGrass();
    });

    // --- 3. Modal and Replay Logic ---
    const btnCard = document.getElementById('btn-card');
    const modal = document.getElementById('card-modal');
    const closeBtn = document.getElementById('close-modal');
    const btnReplay = document.getElementById('btn-replay');

    if (btnReplay) {
        btnReplay.addEventListener('click', startIntroSequence);
    }

    btnCard.addEventListener('click', () => {
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });



    // --- 4. Generate Highly Elaborate SVG Bouquet ---
    const bouquetContainer = document.getElementById('bouquet');

    const defs = `
        <defs>
            <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#3e2723" />
                <stop offset="60%" stop-color="#4e342e" />
                <stop offset="100%" stop-color="#1a0a05" />
            </radialGradient>
            <linearGradient id="petalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#fff176" />
                <stop offset="50%" stop-color="#fbc02d" />
                <stop offset="100%" stop-color="#e65100" />
            </linearGradient>
            <linearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fff8e1" />
                <stop offset="50%" stop-color="#d7ccc8" />
                <stop offset="100%" stop-color="#a1887f" />
            </linearGradient>
            <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#81c784" />
                <stop offset="50%" stop-color="#388e3c" />
                <stop offset="100%" stop-color="#1b5e20" />
            </linearGradient>
        </defs>
    `;

    function createPremiumSunflower(x, y, scale, rotation = 0) {
        return `
        <g transform="translate(${x}, ${y}) scale(${scale}) rotate(${rotation})">
            <!-- Layers of detailed petals -->
            ${Array.from({length: 30}).map((_, i) => {
                const angle = i * 12;
                return `<path d="M 0 -10 Q 15 -45 0 -65 Q -15 -45 0 -10" fill="url(#petalGrad)" transform="rotate(${angle})" stroke="#e65100" stroke-width="0.3"/>`;
            }).join('')}
            ${Array.from({length: 30}).map((_, i) => {
                const angle = i * 12 + 6;
                return `<path d="M 0 -10 Q 10 -40 0 -55 Q -10 -40 0 -10" fill="#ffca28" transform="rotate(${angle})" stroke="#f57f17" stroke-width="0.3"/>`;
            }).join('')}
            <!-- Detailed Center -->
            <circle cx="0" cy="0" r="22" fill="url(#centerGrad)"/>
            <!-- Fibonacci Seeds -->
            ${Array.from({length: 80}).map((_, i) => {
                const r = Math.sqrt(i) * 2.2;
                const theta = i * 2.39996; // Golden angle
                const cx = r * Math.cos(theta);
                const cy = r * Math.sin(theta);
                return `<circle cx="${cx}" cy="${cy}" r="1.3" fill="#ffb300" opacity="0.8"/>`;
            }).join('')}
        </g>`;
    }

    function createFoliage(x, y, scale, rotation) {
        return `
        <g transform="translate(${x}, ${y}) scale(${scale}) rotate(${rotation})">
            <path d="M 0 0 Q 20 -40 10 -100" stroke="#33691e" stroke-width="4" fill="none"/>
            ${Array.from({length: 10}).map((_, i) => {
                const py = -10 - i * 9;
                return `
                <ellipse cx="6" cy="${py}" rx="10" ry="4" fill="#558b2f" transform="rotate(35, 0, ${py})"/>
                <ellipse cx="-6" cy="${py}" rx="10" ry="4" fill="#558b2f" transform="rotate(-35, 0, ${py})"/>
                `;
            }).join('')}
        </g>`;
    }

    const bouquetSVG = `
    <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
        ${defs}
        <!-- Back Foliage -->
        ${createFoliage(160, 220, 1.3, -35)}
        ${createFoliage(240, 220, 1.3, 35)}
        ${createFoliage(100, 260, 1.1, -55)}
        ${createFoliage(300, 260, 1.1, 55)}
        ${createFoliage(200, 200, 1.4, 0)}
        
        <!-- Back Wrapping Paper -->
        <path d="M 120 300 L 20 120 Q 200 40 380 120 L 280 300 Z" fill="url(#paperGrad)" opacity="0.8"/>
        
        <!-- Sunflowers Array (10 flowers) -->
        ${createPremiumSunflower(120, 180, 0.8, -15)}
        ${createPremiumSunflower(200, 150, 0.85, 0)}
        ${createPremiumSunflower(280, 180, 0.8, 15)}
        
        ${createPremiumSunflower(90, 240, 0.9, -25)}
        ${createPremiumSunflower(160, 210, 0.95, -10)}
        ${createPremiumSunflower(240, 210, 0.95, 10)}
        ${createPremiumSunflower(310, 240, 0.9, 25)}
        
        ${createPremiumSunflower(140, 280, 1.1, -5)}
        ${createPremiumSunflower(200, 275, 1.2, 0)}
        ${createPremiumSunflower(260, 280, 1.1, 5)}
        
        <!-- Front Wrapping Paper -->
        <path d="M 180 490 L 40 260 Q 200 240 360 260 L 220 490 Z" fill="url(#paperGrad)"/>
        
        <!-- Paper Folds/Details -->
        <path d="M 180 490 L 110 260" stroke="#8d6e63" stroke-width="2.5" opacity="0.6"/>
        <path d="M 220 490 L 290 260" stroke="#8d6e63" stroke-width="2.5" opacity="0.6"/>
        <path d="M 40 260 L 110 290 L 180 490" fill="rgba(0,0,0,0.15)"/>
        <path d="M 360 260 L 290 290 L 220 490" fill="rgba(0,0,0,0.15)"/>
        
        <!-- Extravagant Ribbon -->
        <path d="M 130 380 Q 200 400 270 380" stroke="url(#ribbonGrad)" stroke-width="30" fill="none" stroke-linecap="round"/>
        <!-- Bows -->
        <path d="M 200 390 C 120 330, 80 420, 200 390" fill="url(#ribbonGrad)"/>
        <path d="M 200 390 C 280 330, 320 420, 200 390" fill="url(#ribbonGrad)"/>
        <!-- Center knot -->
        <circle cx="200" cy="390" r="18" fill="#1b5e20"/>
        <!-- Long Tails -->
        <path d="M 195 390 Q 160 460 130 500" stroke="url(#ribbonGrad)" stroke-width="22" fill="none" stroke-linecap="round"/>
        <path d="M 205 390 Q 240 460 270 500" stroke="url(#ribbonGrad)" stroke-width="22" fill="none" stroke-linecap="round"/>
    </svg>`;
    bouquetContainer.innerHTML = bouquetSVG;
    // --- 5. Realistic Background Grass Generation ---
    function drawRealisticGrass() {
        const field = document.getElementById('field');
        if(!field) return;
        const width = window.innerWidth;
        const height = window.innerHeight * 0.5;
        
        const grassCanvas = document.createElement('canvas');
        grassCanvas.width = width;
        grassCanvas.height = height;
        const gctx = grassCanvas.getContext('2d');
        
        const isNight = document.body.classList.contains('night');
        
        // Background gradient
        const grad = gctx.createLinearGradient(0, 0, 0, height);
        if (isNight) {
            grad.addColorStop(0, '#08122c');
            grad.addColorStop(1, '#020512');
        } else {
            grad.addColorStop(0, '#8BC34A');
            grad.addColorStop(1, '#558B2F');
        }
        gctx.fillStyle = grad;
        gctx.fillRect(0, 0, width, height);
        
        // Draw thousands of individual grass blades
        const numBlades = Math.floor(width * 20); // dense grass
        for (let i = 0; i < numBlades; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height; 
            
            const bladeHeight = 10 + Math.random() * 25 + (y / height) * 15;
            const curve = (Math.random() - 0.5) * 15;
            
            gctx.beginPath();
            gctx.moveTo(x, y);
            gctx.quadraticCurveTo(x + curve/2, y - bladeHeight/2, x + curve, y - bladeHeight);
            
            if (isNight) {
                const lightness = 10 + Math.random() * 15;
                gctx.strokeStyle = `hsl(220, 50%, ${lightness}%)`;
            } else {
                const hue = 75 + Math.random() * 25;
                const lightness = 30 + Math.random() * 25;
                gctx.strokeStyle = `hsl(${hue}, 60%, ${lightness}%)`;
            }
            gctx.lineWidth = 1 + Math.random() * 1.5;
            gctx.stroke();
        }
        
        field.style.backgroundImage = `url(${grassCanvas.toDataURL()})`;
        field.style.backgroundSize = 'cover';
    }
    
    // Draw initial grass and redraw on resize
    drawRealisticGrass();
    window.addEventListener('resize', drawRealisticGrass);

    // --- 6. Petal Rain Animation ---
    const canvas = document.getElementById('petal-canvas');
    const ctx = canvas.getContext('2d');
    const btnPetals = document.getElementById('btn-petals');
    
    let canvasWidth, canvasHeight;
    let petals = [];
    let animationId;
    let isRaining = false;

    function resizePetalCanvas() {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    }
    window.addEventListener('resize', resizePetalCanvas);
    resizePetalCanvas();

    class Petal {
        constructor() {
            this.x = Math.random() * canvasWidth;
            this.y = -20 - Math.random() * 50;
            this.size = Math.random() * 8 + 6;
            this.speedY = Math.random() * 2 + 1;
            this.speedX = Math.random() * 2 - 1;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 2 - 1;
            const colors = ['#FFD54F', '#FFCA28', '#FFC107', '#FFB300'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.rotation += this.rotationSpeed;
            this.x += Math.sin(this.y / 50) * 0.5;
            if (this.y > canvasHeight + 20) {
                this.y = -20;
                this.x = Math.random() * canvasWidth;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(this.size, -this.size, 0, -this.size * 2);
            ctx.quadraticCurveTo(-this.size, -this.size, 0, 0);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }
    }

    function animatePetals() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        petals.forEach(petal => {
            petal.update();
            petal.draw();
        });
        animationId = requestAnimationFrame(animatePetals);
    }

    btnPetals.addEventListener('click', () => {
        if (!isRaining) {
            isRaining = true;
            for (let i = 0; i < 100; i++) {
                setTimeout(() => {
                    petals.push(new Petal());
                }, Math.random() * 2000);
            }
            animatePetals();
            btnPetals.innerHTML = '<span class="icon">✨</span> Detener lluvia';
        } else {
            isRaining = false;
            cancelAnimationFrame(animationId);
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            petals = [];
            btnPetals.innerHTML = '<span class="icon">✨</span> Lluvia de pétalos';
        }
    });
});
