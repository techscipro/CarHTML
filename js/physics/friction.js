const Friction = (() => {
    const SURFACE = {
        road: 0.980,
        sidewalk: 0.920,
        grass: 0.820,
        gravel: 0.860,
        water: 0.700,
        fuel_station: 0.975,
        park: 0.830,
        default: 0.900,
    };


    function getSurfaceForTile(tileId) {
        switch (tileId) {
            case TILE.ROAD_H:
            case TILE.ROAD_V:
            case TILE.ROAD_CROSS:
            case TILE.ROAD_T_N:
            case TILE.ROAD_T_S:
            case TILE.ROAD_T_E:
            case TILE.ROAD_T_W:
            case TILE.ROAD_BEND_NE:
            case TILE.ROAD_BEND_NW:
            case TILE.ROAD_BEND_SE:
                return 'road';
            case TILE.ROAD_BEND_SW:
            case TILE.SIDEWALK:
                return 'sidewalk';
            case TILE.GRASS:
                return 'grass';
            case TILE.FUEL_STATION:
                return 'fuel_station';
            case TILE.PARK:
                return 'park';
            case TILE.WATER:
                return 'water';
            default:
                return 'default';
        }
    }


    function getMultiplier(tileId) {
        const surface = getSurfaceForTile(tileId);
        return SURFACE[surface] ?? SURFACE.default;
    }

    function getEntityFriction(entity, map) {
        const tile = worldToTile(entity.x, entity.y);
        if (!isTileInBounds(tile.col, tile.row)) return SURFACE.default;
        const tileId = map.getTile(tile.col, tile.row);
        return getMultiplier(tileId);
    }

    function isOffRoad(entity, map) {
        const tile = worldToTile(entity.x, entity.y);
        if (!isTileInBounds(tile.col, tile.row)) return true;
        const tileId = map.getTile(tile.col, tile.row);
        return !DRIVEABLE_TILES.has(tileId);
    }

    function applyToSpeed(speed, multiplier, dt) {
        const frameFriction = Math.pow(multiplier, dt * TARGET_FPS);
        return speed * frameFriction;
    }

    function applyAirDrag(speed, dt) {
        const drag = 0.5 * 0.0003 * speed * speed;
        return Math.max(0, speed - drag * dt);
    }

    function applyAll(speed, tileId, dt) {
        const mult = getMultiplier(tileId);
        speed = applyToSpeed(speed, mult, dt);
        speed = applyAirDrag(speed, dt);
        if (speed < MIN_SPEED_THRESHOLD) speed = 0;
        return speed;
    }

    function applyLateralFriction(vx, vy, angle, gripFactor, dt) {
        const fwdX = Math.cos(angle);
        const fwdY = Math.sin(angle);

        const rightX = -fwdY;
        const rightY = fwdX;

        const fwdSpeed = vx * fwdX + vy * fwdY;
        const lateralSpeed = vx * rightX + vy * rightY;

        const grip = Math.pow(gripFactor, dt * TARGET_FPS);
        const newLateral = lateralSpeed * grip;

        return {
            vx: fwdX * fwdSpeed + rightX * newLateral,
            vy: fwdY * fwdSpeed + rightY * newLateral,
        };
    }

    function getGripFactor(tileId, handbrake) {
        const surface = getSurfaceForTile(tileId);
        if (handbrake) return 0.55;
        switch (surface) {
            case 'road': return 0.92;
            case 'fuel_station': return 0.92;
            case 'sidewalk': return 0.80;
            case 'grass': return 0.70;
            case 'gravel': return 0.72;
            case 'park': return 0.68;
            case 'water': return 0.50;
            default: return 0.75;
        }
    }

    function isSkidding(vx, vy, angle, threshold = 30) {
        const rightX = -Math.sin(angle);
        const rightY = Math.cos(angle);
        const lateralSpeed = Math.abs(vx * rightX + vy * rightY);
        return lateralSpeed > threshold;
    }

    return {
        SURFACE,
        getSurfaceForTile,
        getMultiplier,
        getEntityFriction,
        isOffRoad,
        applyToSpeed,
        applyAirDrag,
        applyAll,
        applyLateralFriction,
        getGripFactor,
        isSkidding,
    };
})();