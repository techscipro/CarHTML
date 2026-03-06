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
    if(el) el.textCount = value;
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
    
}