function $(id){
    return document.getElementById(id);
}

function showEl(id){
    const el = $(id);
    if(el) el.classList.remove('hidden');
}

function hideEl(id){
    const el = $(id);
    if(el) el.classList.add('hidden');
}

function showScreen(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'))
    const el = $(id);
    if(el) el.classList.add('active');
}

function showOverlay(id){
    const el = $(id);
    if(el) el.classList.remove('hidden');
}

function hideOverlay(id){
    const el = $(id);
    if(el) el.classList.add('hidden');
}

function hideAllOverlays(){
    document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
}

function setText(id, value){
    const el = $(id);
    if(el) el.textContent = value;
}

function setWidth(id, percent){
    const el = $(id);
    if(el) el.style.width = clamp(percent, 0, 100) + '%';
}

function addClass(id, cls){
    const el = $(id);
    if(el) el.classList.add(cls);
}

function removeClass(id, cls){
    const el = $(id);
    if(el) el.classList.remove(cls);
}

function toggleClass(id, cls, force){
    const el = $(id);
    if(el) el.classList.toggle(cls, force);
}

let _toastTimer = null;

/**
 * Show a temporary toast message
 * @param {string} message
 * @param {number} duration  ms to display (default 2000)
 * @param {string} color     optional CSS color for the text
 */

function showToast(message, duration=2000, color='#ffffff'){
    const el = $(DOM.TOAST);
    if(!el) return;

    el.textContent = message;
    el.style.color = color;
    el.classList.remove('hidden');
    el.classList.add('show');

    if(_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.classList.add('hidden'), 320);
    }, duration);
}

function showScoreToast(points){
    showToast(`+${points} pts`, 1400, '#f5a623');
}

function showMoneyToast(amount){
    showToast(`+$${amount}`, 1800, '#44ffcc');
}

function showWarningToast(message){
    showToast(message, 2500, '#ff4444');
}

function setLoadingProgress(percent, status = ''){
    setWidth(DOM.LOADING_BAR, percent);
    if(status) setText(DOM.LOADING_STATUS, status);
}

function showFuelPrompt(cost){
    setText('fuel-cost', cost);
    showEl(DOM.FUEL_PROMPT);
}

function hideFuelPrompt() {
    hideEl(DOM.FUEL_PROMPT);
}

function showPassengerPrompt() {
    showEl(DOM.PASSENGER_PROMPT);
}

function hidePassengerPrompt() {
    hideEl(DOM.PASSENGER_PROMPT);
}

const SAVE_KEY = 'citydriver_save';

const DEFAULT_SAVE = {
    money: 0,
    score:0,
    upgrades: {
        engine: 0,
        tires: 0,
        turbo: 0,
        armor: 0,
    },
    missionsCompleted: 0,
    totalDistance: 0,
    settings: {
        masterVolume: AUDIO_MASTER_VOLUME,
        sfxVolume: AUDIO_SFX_VOLUME,
        musicVolume: AUDIO_MUSIC_VOLUME,
    },
};

function saveGame(data){
    try{
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch(e){
        console.warn('CityDriver: failed to save game', e);
    }
}

function loadGame() {
    try{
        const raw = localStorage.getItem(SAVE_KEY);
        if(!raw) return deepClone(DEFAULT_SAVE);
        return Object.assign(deepClone(DEFAULT_SAVE), JSON.parse(raw));
    } catch(e){
        console.warn('CityDriver: failed to load save, resetting', e);
        return deepClone(DEFAULT_SAVE);
    }
}

function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
}

function hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

function deepClone(obj){
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Linearly interpolate between two hex colors
 * @param {string} hex1  e.g. '#ff0000'
 * @param {string} hex2
 * @param {number} t     0–1
 */

function lerpColor(hex1, hex2, t){
    const a = hexToRgb(hex1);
    const b = hexToRgb(hex2);
    const r = Math.round(lerp(a.r, b.r, t));
    const g = Math.round(lerp(a.g, b.g, t));
    const bl = Math.round(lerp(a.b, b.b, t));
    return `rgb(${r},${g},${bl})`;
}

function hexToRgb(hex){
    const n = parseInt(hex.replace('#' , ''), 16);
    return {
        r: (n>>16) & 255,
        g: (n>>8) & 255,
        b:n & 255,
    };
}

function rgbaString(r, g, b, a){
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function percentColor(pct){
    if(pct>60) return lerpColor('#44ff44', '#ffff00', (100-pct)/40);
    if(pct>30) return lerpColor('#ffff00', '#ff8800', (60-pct)/30);
    return lerpColor('#ff8800', '#ff2200', (30-pct)/30);
}

function roundRect(ctx, x, y, w, h, r){
    r = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.lineTo(x+w-r, y);
    ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x+w,y+h-r);
    ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x+r,y+h);
    ctx.arcTo(x, y+h,x,y+h-r,r);
    ctx.lineTo(x,y+r);
    ctx.arcTo(x,y,x+r,y,r);
    ctx.closePath();
}

function drawRoundRect(ctx, x,y,w,h,r,fill,stroke,lineWidth=1){
    roundRect(ctx, x, y, w, h, r);
    if(fill) { ctx.fillStyle = fill; ctx.fill(); }
    if(stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke();}
}

function drawTextCentered(ctx, text, x, y, font, color){
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
}

function drawArrow(ctx, x, y, angle, size, color){
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size*0.6, size*0.7);
    ctx.lineTo(0, size*0.2);
    ctx.lineTo(-size*0.6, size*0.7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

class Timer{
    constructor(duration){
        this.duration = duration;
        this.remaining = duration;
        this.running = false;
        this.done = false;
    }

    start() {
        this.remaining = this.duration;
        this.running = true;
        this.done = false;
    }

    pause() { this.running = false; }
    resume() { this.running =true; }
    reset() { this.start(); }

    update(dt){
        if(!this.running || this.done) return;
        this.remaining -= dt;
        if(this.remaining <=0){
            this.remaining = 0;
            this.running = false;
            this.done = true;
        }
    }

    get progress() {
        return 1-this.remaining/this.duration;
    }

    get progressLeft() {
        return this.remaining/this.duration;
    }

    toString() {
        const s = Math.ceil(this.remaining);
        if(s>=60) {
            const m = Math.floor(s/60);
            return `${m}:${String(s%60).padStart(2, '0')}`;
        }
        return `${s}s`;
    }
}

class ObjectPool{
    constructor(factory, reset, initialSize=10){
        this._factory = factory;
        this._reset = reset;
        this._pool = [];
        for(let i=0;i<initialSize;i++){
            this._pool.push(factory());
        }
    }

    get() {
        const obj = this._pool.length > 0 ? this._pool.pop() : this._factory();
        this._reset(obj);
        return obj;
    }

    release(obj){
        this._pool.push(obj);
    }

    get size() { return this._pool.length; }
}


function formatMoney(amount){
    return '$' + Math.floor(amount).toLocaleString();
}

function formatSpeed(pixelsPerSec) {
    return Math.round(pixelsPerSec*0.5);
}

function throttle(fn, limit){
    let last = 0;
    return function (...args){
        const now = Date.now();
        if(now-last >= limit){
            last = now;
            fn.apply(this, args);
        }
    };
}

function randomPick(arr){
    return arr[Math.floor(Math.random()*arr.length)];
}

function shuffleArray(arr){
    for(let i = arr.length-1;i>0;i--){
        const j=randomInt(0,i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

let _uidCounter = 0;
function uid() {
    return ++_uidCounter;
}