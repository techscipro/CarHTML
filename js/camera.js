const Camera = (() => {
    let _x = 0;
    let _y = 0;
    let _targetX = 0;
    let _targetY = 0;
    let _width = 0;
    let _height = 0;
    let _lerp = CAMERA_LERP;

    let _shakeIntensity = 0;
    let _shakeDuration = 0;
    let _shakeTimer = 0;
    let _shakeOffsetX = 0;
    let _shakeOffsetY = 0;

    function init(canvasWidth, canvasHeight) {
        _width = canvasWidth;
        _height = canvasHeight;
    }

    function update(dt, targetEntity) {
        _targetX = targetEntity.x - _width / 2;
        _targetY = targetEntity.y - _height / 2;

        _targetX = clamp(_targetX, 0, MAP_PIXEL_WIDTH - _width);
        _targetY = clamp(_targetY, 0, MAP_PIXEL_HEIGHT - _height);

        _x = lerp(_x, _targetX, _lerp);
        _y = lerp(_y, _targetY, _lerp);

        _updateShake(dt);
    }

    function _updateShake(dt) {
        if (_shakeTimer <= 0) {
            _shakeOffsetX = 0;
            _shakeOffsetY = 0;
            return;
        }

        _shakeTimer -= dt;
        const progress = _shakeTimer / _shakeDuration;
        const intensity = _shakeIntensity * progress;
        _shakeOffsetX = randomFloat(-intensity, intensity);
        _shakeOffsetY = randomFloat(-intensity, intensity);
    }

    /**
    * Trigger a camera shake
    * @param {number} intensity  max pixel offset
    * @param {number} duration   seconds
    */

    function shake(intensity, duration) {
        if (intensity >= _shakeIntensity || _shakeTimer <= 0) {
            _shakeIntensity = intensity;
            _shakeDuration = duration;
            _shakeTimer = duration;
        }
    }

    function shakeLight() { shake(3, 0.2) }
    function shakeMedium() { shake(7, 0.35); }
    function shakeHeavy() { shake(14, 0.5); }

    function worldToScreen(worldX, worldY) {
        return {
            x: worldX - _x + _shakeOffsetX,
            y: worldY - _y + _shakeOffsetY,
        };
    }

    function screenToWorld(screenX, screenY) {
        return {
            x: screenX + _x - _shakeOffsetX,
            y: screenY + _y - _shakeOffsetY,
        };
    }

    function apply(ctx) {
        ctx.save();
        ctx.translate(
            -Math.round(_x + _shakeOffsetX),
            -Math.round(_y + _shakeOffsetY)
        );
    }

    function restore(ctx) {
        ctx.restore();
    }

    function isVisible(worldX, worldY, w, h, margin = 64) {
        return worldX + w >= _x - margin &&
            worldX <= _x + _width + margin &&
            worldY + h >= _y - margin &&
            worldY <= _y + _height + margin;
    }

    function isPointVisible(worldX, worldY, margin = 64) {
        return worldX >= _x - margin &&
            worldX <= _x + _width + margin &&
            worldY >= _y - margin &&
            worldY <= _y + _height + margin;
    }

    function getVisibleTileRange(margin = 1) {
        const colStart = Math.max(0, Math.floor(_x / TILE_SIZE) - margin);
        const colEnd = Math.min(MAP_COLS, Math.ceil((_x + _width) / TILE_SIZE) + margin);
        const rowStart = Math.max(0, Math.floor(_y / TILE_SIZE) - margin);
        const rowEnd = Math.min(MAP_ROWS, Math.ceil((_y + _height) / TILE_SIZE) + margin);
        return { colStart, colEnd, rowStart, rowEnd };
    }

    function snapTo(worldX, worldY) {
        _x = clamp(worldX - _width / 2, 0, MAP_PIXEL_WIDTH - _width);
        _y = clamp(worldY - _height / 2, 0, MAP_PIXEL_HEIGHT - _height);
        _targetX = _x;
        _targetY = _y;
    }

    function getX() { return _x; }
    function getY() { return _y; }
    function getWidth() { return _width; }
    function getHeight() { return _height; }
    function getCenterX() { return _x + _width / 2; }
    function getCenterY() { return _y + _height / 2; }

    function setLerp(value) { _lerp = clamp(value, 0.01, 1); }

    return {
        init,
        update,
        apply,
        restore,
        shake,
        shakeLight,
        shakeMedium,
        shakeHeavy,
        snapTo,
        worldToScreen,
        screenToWorld,
        isVisible,
        isPointVisible,
        getVisibleTileRange,
        getX,
        getY,
        getWidth,
        getHeight,
        getCenterX,
        getCenterY,
        setLerp,
    };

})();