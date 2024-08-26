class ImageLayer {
    constructor(src, blendMode = 'source-over', isStatic = false) {
        this.image = new Image();
        this.image.src = src;
        this.blendMode = blendMode;
        this.visible = true;
        this.isStatic = isStatic;
    }

    applyFilter(filter) {
        this.image.style.filter = filter;
        return this;
    }

    draw(ctx) {
        if (this.visible) {
            ctx.filter = this.image.style.filter;
            ctx.globalCompositeOperation = this.blendMode;
            ctx.drawImage(this.image, 0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.filter = 'none';
        }
    }
}

class HSBVControl {
    constructor(parent, hc, sc, bc, ...targets) {
        this.parent = parent;
        // defaults
        this.h = `hue-rotate(0deg)`;
        this.s = `saturate(100%)`;
        this.b = `brightness(100%)`;
        this.targets = targets;

        hc.value = 0;
        hc.addEventListener('input', (e) => {
            this.h = `hue-rotate(${e.target.value}deg)`;
            this.update();
        });

        sc.value = 100;
        sc.addEventListener('input', (e) => {
            this.s = `saturate(${e.target.value}%)`;
            this.update();
        });

        bc.value = 100;
        bc.addEventListener('input', (e) => {
            this.b = `brightness(${e.target.value}%)`;
            this.update();
        });
    }

    update() {
        this.targets.forEach(target => {
            target.applyFilter(`${this.h} ${this.s} ${this.b}`);
        });

        this.parent.draw()
    }
}

class CanvasApp {
    constructor() {
        this.canvas = document.getElementById('mainCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.initLayers();
        this.loadImages().then(() => {
            this.draw();
        });

        this.eyesVisible = true;
        this.harnessVisible = true;
        this.biribiriVisible = false;
        this.gunVisible = false;

        document.getElementById('eyes-enabled').addEventListener('input', (e) => {
            this.eyesVisible = e.target.checked;
            this.draw();
        })

        document.getElementById('harness-enabled').addEventListener('input', (e) => {
            document.getElementById('harness-belt-enabled').checked = e.target.checked;
            this.harnessVisible = e.target.checked;
            this.draw();
        })

        document.getElementById('harness-belt-enabled').addEventListener('input', (e) => {
            this.layers.harness[1].visible = e.target.checked;
            this.draw();
        })

        document.getElementById('enable-biri').addEventListener('click', (e) => {
            this.biribiriVisible = e.target.checked;
            this.gunVisible = !e.target.checked;
            this.draw();
        })

        document.getElementById('enable-gun').addEventListener('click', (e) => {
            this.gunVisible = e.target.checked;
            this.biribiriVisible = !e.target.checked;
            this.draw();
        })

        document.getElementById('none').addEventListener('click', (e) => {
            this.biribiriVisible = false;
            this.gunVisible = false;
            this.draw();
        });
    }

    initLayers() {
        const sukumizuBase = new ImageLayer('img/sukumizu/base.webp');
        const sukumizuShadow = new ImageLayer('img/sukumizu/base-shadow-multiply.webp', 'multiply');
        const sukumizuBaseHi = new ImageLayer('img/sukumizu/base-hi2-dodge.webp', 'color-dodge');
        sukumizuBaseHi.applyFilter(`hue-rotate(0deg) saturate(100%) brightness(100%)`);

        new HSBVControl(
            this,
            document.getElementById('sukumizu-h'),
            document.getElementById('sukumizu-s'),
            document.getElementById('sukumizu-b'),
            sukumizuBase,
            sukumizuShadow,
            sukumizuBaseHi
        )

        const eyes = [
            new ImageLayer('img/eyes/0.webp', 'source-over'),
            new ImageLayer('img/eyes/1.webp', 'source-over'),
            new ImageLayer('img/eyes/2.webp', 'source-over'),
            new ImageLayer('img/eyes/3.webp', 'source-over'),
            new ImageLayer('img/eyes/4.webp', 'source-over'),
            new ImageLayer('img/eyes/5.webp', 'source-over'),
            new ImageLayer('img/eyes/6.webp', 'source-over'),
        ]

        new HSBVControl(
            this,
            document.getElementById('eyes-h'),
            document.getElementById('eyes-s'),
            document.getElementById('eyes-b'),
            eyes[1],
        );

        const harnessDevice = new ImageLayer('img/harness/3.webp', 'source-over');

        new HSBVControl(
            this,
            document.getElementById('harness-device-h'),
            document.getElementById('harness-device-s'),
            document.getElementById('harness-device-b'),
            harnessDevice,
        );

        const harnessBelt = new ImageLayer('img/harness/0.webp', 'source-over');
        new HSBVControl(
            this,
            document.getElementById('harness-belt-h'),
            document.getElementById('harness-belt-s'),
            document.getElementById('harness-belt-b'),
            harnessBelt,
        )

        const hair = new ImageLayer('img/hair/hair0.webp', 'source-over');
        new HSBVControl(
            this,
            document.getElementById('hair-h'),
            document.getElementById('hair-s'),
            document.getElementById('hair-b'),
            hair,
        )

        this.layers = {
            background: new ImageLayer('img/background.webp', 'source-over', true),
            characterBase: new ImageLayer('img/character-base.webp', 'source-over', true),
            sukumizu: [
                sukumizuBase,
                new ImageLayer('img/sukumizu/nakame.webp').applyFilter('opacity(0.1)'),
                new ImageLayer('img/sukumizu/base-hi-dodge.webp', 'color-dodge').applyFilter(`hue-rotate(0deg) saturate(100%) brightness(100%)`),
                sukumizuShadow,
                new ImageLayer('img/sukumizu/line.webp'),
                sukumizuBaseHi,
                new ImageLayer('img/sukumizu/tags.webp'),
            ],
            characterOutline: new ImageLayer('img/character-outline.webp', 'source-over'),
            eyes: eyes,
            hair: [
                hair,
                new ImageLayer('img/hair/hair1.webp', 'multiply'),
                new ImageLayer('img/hair/hair2.webp', 'source-over'),
            ],
            harness: [
                new ImageLayer('img/harness/harness-shadow.webp', 'multiply'),
                harnessBelt,
                new ImageLayer('img/harness/1.webp', 'overlay'),
                new ImageLayer('img/harness/2.webp', 'multiply'),
                harnessDevice,
                new ImageLayer('img/harness/4.webp', 'source-over'),
                new ImageLayer('img/harness/5.webp', 'multiply'),
                new ImageLayer('img/harness/outline.webp', 'source-over')
            ],
            biribiri: [
                new ImageLayer('img/biribiri/0.webp', ),
                new ImageLayer('img/biribiri/1.webp', 'hard-light')
            ],
            gun: new ImageLayer('img/gun/0.webp', 'source-over'),
        };
    }

    async loadImages() {
        const loadImage = layer => {
            return new Promise(resolve => {
                layer.image.onload = resolve;
            });
        };

        const allLayers = [
            this.layers.background,
            this.layers.characterBase,
            ...this.layers.sukumizu,
            this.layers.characterOutline,
            ...this.layers.harness,
            ...this.layers.eyes,
            ...this.layers.biribiri,
            ...this.layers.hair,
            this.layers.gun
        ];
        await Promise.all(allLayers.map(layer => loadImage(layer)));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.layers.background.draw(this.ctx);
        this.layers.characterBase.draw(this.ctx);
        this.layers.sukumizu.forEach(layer => layer.draw(this.ctx));
        this.layers.hair.forEach(layer => layer.draw(this.ctx));
        this.layers.characterOutline.draw(this.ctx);
        if (this.harnessVisible) {
            this.layers.harness.forEach(layer => layer.draw(this.ctx));
        }
        if (this.eyesVisible) {
            this.layers.eyes.forEach(layer => layer.draw(this.ctx));
        }
        if (this.biribiriVisible) {
            this.layers.biribiri.forEach(layer => layer.draw(this.ctx));
        }
        if (this.gunVisible) {
            this.layers.gun.draw(this.ctx);
        }
    }
}

const app = new CanvasApp();
