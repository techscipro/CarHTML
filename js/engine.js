const Engine = (() => {
    const STATE = {
        LOADING: 'loading',
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameover',
    };

    let _state = STATE.LOADING;
    let _prevState = null;
    let _running = false;
    let _rafId = null;

    let _lastTime = 0;
    let _dt = 0;
    let _elapsed = 0;
    let _frameCount = 0;

    let _fps = 0;
    let _fpsTimer = 0;
    let _fpsFrames = 0;

    let _canvas = 0;
    let _ctx = 0;

    let _game = 0;

    function init(game) {
        _game = game;
        _canvas = document.getElementById(DOM.CANVAS);
        _ctx = _canvas.getContext('2d');

        _resizeCanvas();
        window.addEventListener('resize', _resizeCanvas);

        Camera.init(_canvas.width, _canvas.height);
        Input.init();
    }

    function _resizeCanvas() {
        _canvas.width = window.innerWidth;
        _canvas.height = window.innerHeight;
        if (camera) Camera.init(_canvas.width, _canvas.height);
    }

    function start() {
        if (_running) return;
        _running = true;
        _lastTime = performance.now();
        _rafId = requestAnimationFrame(_loop);
    }

    function stop() {
        _running = false;
        if (_rafId !== null) {
            cancelAnimationFrame(_rafId);
            _rafId = null;
        }
    }

    function _loop(timestamp) {
        if (!_running) return;

        _dt = Math.min((timestamp - _lastTime) / 1000, 0.1);
        _lastTime = timestamp;
        _elapsed += _dt;
        _frameCount++;

        _fpsTimer += _dt;
        _fpsFrames += 1;
        if (_fpsTimer >= 1.0) {
            _fps = _fpsFrames;
            _fpsFrames = 0;
            _fpsTimer = 0;
        }

        _update(_dt);
        _render();
        Input.flush();

        _rafId = requestAnimationFrame(_loop);
    }

    function _update(dt) {
        if (_state === STATE.PLAYING && Input.isPausePressed()) {
            setState(STATE.PAUSED);
            showOverlay(DOM.PAUSE_MENU);
            return;
        }
        if (_state === STATE.PAUSED && Input.isPausePressed()) {
            setState(STATE.PLAYING);
            hideOverlay(DOM.PAUSE_MENU);
            return;
        }

        if (_state !== STATE.PLAYING) return;

        _game.update(dt);
    }

    function _render() {
        const ctx = _ctx;
        const w = _canvas.width;
        const h = _canvas.height;

        ctx.clearRect(0, 0, w, h);

        if (_state === STATE.PLAYING || _state === STATE.PAUSED) {
            _game.render(ctx);
        }

        if (_debugMode) _drawDebug(ctx);
    }

    let _debugMode = false;

    function _drawDebug(ctx) {
        ctx.save();
        ctx.font = '12px monospace';
        ctx.fillStyle = '#00ff88';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const lines = [
            `FPS:   ${_fps}`,
            `DT:    ${(_dt * 1000).toFixed(2)}ms`,
            `State: ${_state}`,
            `Frame: ${_frameCount}`,
            `Time:  ${_elapsed.toFixed(1)}s`,
            `Cam:   ${Camera.getX().toFixed(0)}, ${Camera.getY().toFixed(0)}`,
        ];

        lines.forEach((line, i) => {
            ctx.fillText(line, 8, 8 + i * 16);
        });
        ctx.restore();
    }

    function toggleDebug() {
        _debugMode = !_debugMode;
    }

    function setState(newState) {
        if (newState === _state) return;
        _prevState = _state;
        _state = newState;
        _onStateChange(_prevState, newState);
    }

    function _onStateChange(from, to) {
        switch (to) {
            case STATE.PLAYING:
                showScreen(DOM.GAME_CONTAINER);
                hideAllOverlays();
                break;

            case STATE.PAUSED:
                showOverlay(DOM.PAUSE_MENU);
                break;

            case STATE.MENU:
                showScreen(DOM.MAIN_MENU);
                hideAllOverlays();
                break;

            case STATE.GAME_OVER:
                showOverlay(DOM.GAME_OVER);
                break;

            case STATE.LOADING:
                showScreen(DOM.LOADING_SCREEN);
                break;
        }
    }

    function getState() { return _state; }
    function isPlaying() { return _state === STATE.PLAYING; }
    function isPaused() { return _state === STATE.PAUSED; }
    function isGameOver() { return _state === STATE.GAME_OVER; }

    function getCanvas() { return _canvas; }
    function getCtx() { return _ctx; }
    function getDt() { return _dt; }
    function getFps() { return _fps; }
    function getElapsed() { return _elapsed; }
    function getFrame() { return _frameCount; }

    return {
        STATE,
        init,
        start,
        stop,
        setState,
        getState,
        isPlaying,
        isPaused,
        isGameOver,
        toggleDebug,
        getCanvas,
        getCtx,
        getDt,
        getFps,
        getElapsed,
        getFrame,
    };

})();