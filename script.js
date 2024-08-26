// Canvasでやりゃよかった

class HSBWithControl {
    constructor(hc, sc, bc, ...targets) {
        // defaults
        this.h = `hue-rotate(0deg)`;
        this.s = `saturate(100%)`;
        this.b = `brightness(100%)`;
        this.hc = hc;
        this.sc = sc;
        this.bc = bc;
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
            target.style.filter = `${this.h} ${this.s} ${this.b}`;
        });
    }

    hue(value) {
        if (value < 0) value = 0;
        if (value > 360) value = value % 360;
        this.h = `hue-rotate(${value}deg)`;
        this.hc.value = value;
        this.update();
    }

    saturate(value) {
        this.s = `saturate(${value}%)`;
        this.sc.value = value;
        this.update();
    }

    brightness(value) {
        this.b = `brightness(${value}%)`;
        this.bc.value = value;
        this.update();
    }

    serialize() {
        return {
            h: this.hc.value,
            s: this.sc.value,
            b: this.bc.value,
        }
    }

    static deserialize(data) {
        const hsb = new HSBWithControl();
        hsb.hue(data.h);
        hsb.saturate(data.s);
        hsb.brightness(data.b);
        return hsb;
    }
}

const sukumizu = new HSBWithControl(
    document.getElementById('sukumizu-h'),
    document.getElementById('sukumizu-s'),
    document.getElementById('sukumizu-b'),
    document.getElementById('sukumizu'),
    document.getElementById('base-hi2-dodge'),
    document.getElementById('base-shadow-multiply'),
);

const eyes = new HSBWithControl(
    document.getElementById('eyes-h'),
    document.getElementById('eyes-s'),
    document.getElementById('eyes-b'),
    document.getElementById('eyes1'),
);

const harnessDevice = new HSBWithControl(
    document.getElementById('harness-device-h'),
    document.getElementById('harness-device-s'),
    document.getElementById('harness-device-b'),
    document.getElementById('harness3'),
);

const harnessBelt = new HSBWithControl(
    document.getElementById('harness-belt-h'),
    document.getElementById('harness-belt-s'),
    document.getElementById('harness-belt-b'),
    document.getElementById('harness0'),
);

const hair = new HSBWithControl(
    document.getElementById('hair-h'),
    document.getElementById('hair-s'),
    document.getElementById('hair-b'),
    document.getElementById('hair0'),
);

document.getElementById('eyes-g').addEventListener('input', (e) => {
    document.getElementById('eyes6').style.display = e.target.checked ? 'block' : 'none';
});

document.getElementById('eyes-enabled').addEventListener('input', (e) => {
    document.getElementById('eyes').style.display = e.target.checked ? 'block' : 'none';
})

document.getElementById('harness-enabled').addEventListener('input', (e) => {
    document.getElementById('harness').style.display = e.target.checked ? 'block' : 'none';
    document.getElementById('harness-belt-enabled').checked = e.target.checked;
});

document.getElementById('enable-biri').addEventListener('click', (e) => {
    document.getElementById('biribiri').style.display = 'block';
    document.getElementById('gun').style.display = 'none';
});

document.getElementById('enable-gun').addEventListener('click', (e) => {
    document.getElementById('biribiri').style.display = 'none';
    document.getElementById('gun').style.display = 'block';
});

document.getElementById('none').addEventListener('click', (e) => {
    document.getElementById('biribiri').style.display = 'none';
    document.getElementById('gun').style.display = 'none';
})

// Gaming Sukumizu
let count = 0;
const gamingEnabled = document.getElementById('sukumizu-g')
setInterval(() => {
    if (gamingEnabled.checked) {
        count += 1;
        sukumizu.hue(count);
    }
}, 1);

const getSerializedData = () => {
    return {
        sukumizu: sukumizu.serialize(),
        eyes: eyes.serialize(),
        harnessDevice: harnessDevice.serialize(),
        harnessBelt: harnessBelt.serialize(),
        hair: hair.serialize(),

        eyesEnabled: document.getElementById('eyes-enabled').checked,
        eyesG: document.getElementById('eyes-g').checked,
        harnessEnabled: document.getElementById('harness-enabled').checked,
        harnessBeltEnabled: document.getElementById('harness-belt-enabled').checked,

        biribiri: document.getElementById('biribiri').style.display === 'block',
        gun: document.getElementById('gun').style.display === 'block',
    }
}

const getCompressedData = () => {
    const data = getSerializedData();
    const values = Object.values(data).flatMap(item =>
        typeof item === 'object' ? Object.values(item) : item
    );

    // Convert boolean to 0 or 1
    const boolToNum = values.map(v => typeof v === 'boolean' ? (v ? 1 : 0) : v);

    // Convert to base64
    const str = boolToNum.join(',');
    const compressed = btoa(str);

    // Make URL safe
    return compressed.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const decompress = (compressed) => {
    // Restore padding if needed
    const padding = '='.repeat((4 - compressed.length % 4) % 4);
    const base64 = (compressed + padding).replace(/-/g, '+').replace(/_/g, '/');

    // Decode base64
    const str = atob(base64);
    const values = str.split(',').map(v => {
        if (v === '0') return false;
        if (v === '1') return true;
        return parseFloat(v);
    });

    // Reconstruct the original object structure
    return {
        sukumizu: { h: values[0], s: values[1], b: values[2] },
        eyes: { h: values[3], s: values[4], b: values[5] },
        harnessDevice: { h: values[6], s: values[7], b: values[8] },
        harnessBelt: { h: values[9], s: values[10], b: values[11] },
        hair: { h: values[12], s: values[13], b: values[14] },
        eyesEnabled: values[15],
        eyesG: values[16],
        harnessEnabled: values[17],
        harnessBeltEnabled: values[18],
        biribiri: values[19],
        gun: values[20]
    };
};

const init = () => {
    const url = new URL(window.location);
    const compressed = url.searchParams.get('c');
    let data = decompress(compressed);

    if (data) {
        sukumizu.hue(data.sukumizu.h);
        sukumizu.saturate(data.sukumizu.s);
        sukumizu.brightness(data.sukumizu.b);

        eyes.hue(data.eyes.h);
        eyes.saturate(data.eyes.s);
        eyes.brightness(data.eyes.b);

        harnessDevice.hue(data.harnessDevice.h);
        harnessDevice.saturate(data.harnessDevice.s);
        harnessDevice.brightness(data.harnessDevice.b);

        harnessBelt.hue(data.harnessBelt.h);
        harnessBelt.saturate(data.harnessBelt.s);
        harnessBelt.brightness(data.harnessBelt.b);

        hair.hue(data.hair.h);
        hair.saturate(data.hair.s);
        hair.brightness(data.hair.b);

        if (data.eyesEnabled) {
            document.getElementById('eyes-enabled').checked = true;
            document.getElementById('eyes').style.display = 'block';
        } else {
            document.getElementById('eyes-enabled').checked = false;
            document.getElementById('eyes').style.display = 'none';
        }

        if (data.eyesG) {
            document.getElementById('eyes-g').checked = true;
            document.getElementById('eyes6').style.display = 'block';
        } else {
            document.getElementById('eyes-g').checked = false;
            document.getElementById('eyes6').style.display = 'none';
        }

        if (data.harnessEnabled) {
            document.getElementById('harness-enabled').checked = true;
            document.getElementById('harness-belt-enabled').checked = true;
            document.getElementById('harness').style.display = 'block';
        } else {
            document.getElementById('harness-enabled').checked = false;
            document.getElementById('harness-belt-enabled').checked = false;
            document.getElementById('harness').style.display = 'none';
        }

        if (data.biribiri) {
            document.getElementById('biribiri').style.display = 'block';
        } else if (data.gun) {
            document.getElementById('gun').style.display = 'block';
        }
    }

    setInterval(() => {
        const compressed = getCompressedData();
        const url = new URL(window.location);
        url.searchParams.set('c', compressed);
        window.history.replaceState({}, '', url);
    }, 1000);
}

init();


