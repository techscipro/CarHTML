const PhysicsEngine = (() => {
    function updatePlayer(player, traffic, map, dt) {
        const tile = worldToTile(player.x, player.y);
        const tileId = (isTileInBounds(tile.col, tile.row)) ? map.getTile(tile.col, tile.row) : TILE.GRASS;
        player.speed = Friction.applyAll(player.speed, tileId, dt);

        const grip = Friction.getGripFactor(tileId, player.handbrake);
        const v = Friction.applyLateralFriction(
            player.vx, player.vy, player.angle, grip, dt
        );
        player.vx = v.vx;
        player.vy = v.vy;

        integratePosition(player, dt);

        Collision.checkPlayer(player, traffic, map);

        _processCollisionEvents(player);

        player.speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
        player.offRoad = Friction.isOffRoad(player, map);

        player.skidding = Friction.isSkidding(player.vx, player.vy, player.angle);
    }

    function updateTraffic(traffic, map, dt) {
        for (const car of traffic) {
            const tile = worldToTile(car.x, car.y);
            const tileId = (isTileInBounds(tile.col, tile.row)) ? map.getTile(tile.col, tile.row) : TILE.GRASS;

            car.speed = Friction.applyAll(car.spped, tileId, dt);

            const grip = Friction.getGripFactor(tileId, false);
            const v = Friction.applyLateralFriction(
                car.vx, car.vy, car.angle, grip, dt
            )
            car.vx = v.vx;
            car.vy = v.vy;

            integratePosition(car, dt);
        }

        Collision.checkTraffic(traffic, map);
    }

    function integratePosition(entity, dt) {
        entity.x += entity.vx * dt;
        entity.y += entity.vy * dt;
    }

    function syncVelocity(entity) {
        entity.vx = Math.cos(entity.angle) * entity.speed;
        entity.vy = Math.sin(entity.angle) * entity.speed;
    }


    function syncSpeed(entity) {
        entity.speed = Math.sqrt(entity.vx * entity.vx + entity.vy * entity.vx);
    }

    function _processCollisionEvents(player) {
        const events = Collision.getEvents();

        for (const ev of events) {
            const damage = Collision.speedToDamage(ev.force);

            switch (ev.type) {
                case 'building':
                    if (damage > 0) {
                        player.takeDamage(damage);
                        _shakeForDamage(damage);
                    }
                    break;

                case 'car':
                    if (damage > 0) {
                        player.takeDamage(damage);
                        _shakeForDamage(damage);
                    }

                    if (ev.entityB && ev.entityB.takeDamage) {
                        ev.entityB.takeDamage(damage * 0.5);
                    }
                    break;

                case 'boundary':
                    if (damage > 0) {
                        player.takeDamage(Math.floor(damage * 0.5));
                        Camera.shakeLight();
                    }
                    break;

            }
        }
    }

    function _shakeForDamage(damage) {
        if (damage >= 25) Camera.shakeHeavy();
        else if (damage >= 12) Camera.shakeMedium();
        else Camera.shakeLight();
    }

    function applyImpulse(entity, angle, magnitude) {
        entity.vx += Math.cos(angle) * magnitude;
        entity.vy += Math.sin(angle) * magnitude;
        syncSpeed(entity);
    }

    function knockback(entity, fromX, fromY, magnitude) {
        const angle = angleTo(fromX, fromY, entity.x, entity.y);
        applyImpulse(entity, angle, magnitude);
    }

    function getDisplaySpeed(entity) {
        return formatSpeed(entity.speed);
    }

    function isStopped(entity, threshold = MIN_SPEED_THRESHOLD) {
        return entity.speed < threshold;
    }

    function clampSpeed(entity) {
        if (entity.speed > entity.maxSpeed) {
            entity.speed = entity.maxSpeed;
            syncVelocity(entity);
        }
    }

    return {
        updatePlayer,
        updateTraffic,
        integratePosition,
        syncVelocity,
        syncSpeed,
        applyImpulse,
        knockback,
        getDisplaySpeed,
        isStopped,
        clampSpeed,
    };
})