const Input = (() => {
    const _keys = {};
    const _pressed = {};
    const _released = {};

    const BINDINGS = {
        accelerate: ['KeyW', 'ArrowUp'],
        brake: ['KeyS', 'ArrowDown'],
        steerLeft: ['KeyA', 'ArrowLeft'],
        steerRight: ['KeyD', 'ArrowRight'],
        handbrake: ['Space'],
        horn: ['KeyH'],
        interact: ['KeyE'],
        refuel: ['KeyF'],
        pause: ['Escape'],
        map: ['KeyM'],
        debug: ['F3'],
    };

    function init() {
        window.addEventListener('keydown', _onKeyDown);
        window.addEventListener('keyup', _onKeyUp);
        window.addEventListener('blur', _onBlur);
    }

    function _onKeyDown(e) {
        if (_keys[e.code]) return;
        _keys[e.code] = true;
        _pressed[e.code] = true;

        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
    }

    function _onKeyUp(e) {
        _keys[e.code] = false;
        _released[e.code] = true;
    }

    function _onBlur() {
        for (const code in _keys) {
            _keys[code] = false;
        }
    }

    function flush() {
        for (const code in _pressed) delete _pressed[code];
        for (const code in _released) delete _released[code];
    }

    function isHeld(code) {
        return _keys[code] === true;
    }

    function isPressed(code) {
        return _pressed[code] === true;
    }

    function isReleased(code) {
        return _released[code] === true;
    }

    function isAccelerating() {
        return BINDINGS.accelerate.some(k => _keys[k]);
    }

    function isBraking() {
        return BINDINGS.brake.some(k => _keys[k]);
    }

    function isSteeringLeft() {
        return BINDINGS.steerLeft.some(k => _keys[k]);
    }

    function isSteeringRight() {
        return BINDINGS.steerRight.some(k => _keys[k]);
    }

    function isHandbrake() {
        return BINDINGS.handbrake.some(k => _keys[k]);
    }

    function isHornPressed() {
        return BINDINGS.horn.some(k => _pressed[k]);
    }

    function isInteractPressed() {
        return BINDINGS.interact.some(k => _pressed[k]);
    }

    function isRefuelPressed() {
        return BINDINGS.refuel.some(k => _pressed[k]);
    }

    function isPausePressed() {
        return BINDINGS.pause.some(k => _pressed[k]);
    }

    function isMapPressed() {
        return BINDINGS.map.some(k => _pressed[k]);
    }

    function isDebugPressed() {
        return BINDINGS.debug.some(k => _pressed[k]);
    }

    function getSteerAxis() {
        const left = isSteeringLeft() ? 1 : 0;
        const right = isSteeringRight() ? 1 : 0;
        return right - left;
    }

    function getThrottleAxis() {
        const accel = isAccelerating() ? 1 : 0;
        const brake = isBraking() ? 1 : 0;
        return accel - brake;
    }

    return {
        init,
        flush,
        isHeld,
        isPressed,
        isReleased,
        isAccelerating,
        isBraking,
        isSteeringLeft,
        isSteeringRight,
        isHandbrake,
        isHornPressed,
        isInteractPressed,
        isRefuelPressed,
        isPausePressed,
        isMapPressed,
        isDebugPressed,
        getSteerAxis,
        getThrottleAxis,
    };
})()