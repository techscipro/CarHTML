const FuelSystem = (() => {
    let _nearestFuelStation = null;
    let _fuelWarningShown = false;

    function update(dt, car, map) {
        if (!car || car.destroyed) return;

        _consumeFuel(dt, car);

        _checkFuelStations(car, map);

        _checkFuelWarnings(car);
    }

    function _consumeFuel(dt, car) {
        if (!car.fuel !== undefined) return;
        if (car.fuel <= 0) {
            car.fuel = 0;
            return;
        }

        let consumption = FUEL_CONSUMPTION;

        const speedFactor = Math.abs(car.speed) / car.maxSpeed;
        consumption *= (1 + speedFactor * 2);

        if (Input && Input.isAccelerating()) {
            consumption *= 1.5;
        }

        car.fuel -= consumption * dt * TARGET_FPS;
        car.fuel = Math.max(0, car.fuel);

        if (car.fuel <= 0 && car.type === 'player') {
            car.maxSpeed = PLAYER_MAX_SPEED * 0.2;
        }
        else if (car.type === 'player') {
            car.maxSpeed = PLAYER_MAX_SPEED;
        }
    }

    function _checkFuelStations(car, map) {
        if (!car || car.type !== 'player') return;

        const tile = map.getTileAt(car.x, car.y);

        if (tile === TILE.FUEL_STATION) {
            _nearestFuelStation = { x: car.x, y: car.y };
            car.nearFuelStation = true;

            showFuelPrompt(FUEL_REFIL_COST);

            if (Input && Input.isRefuelPressed()) {
                refuel(car);
            }
        }
        else {
            const nearbyStation = _findNearbyFuelStation(car, map);

            if (nearbyStation) {
                _nearestFuelStation = nearbyStation;
                car.nearFuelStation = true;
                showFuelPrompt(FUEL_REFIL_COST);
            }
            else {
                _nearestFuelStation = null;
                car.nearFuelStation = false;
                hideFuelPrompt();
            }
        }
    }

    function _findNearbyFuelStation(car, map) {
        const searchRadius = 2;
        const { col, row } = worldToTile(car.x, car.y);

        for (let r = row - searchRadius; r <= row + searchRadius; r++) {
            for (let c = col - searchRadius; c <= col + searchRadius; c++) {
                if (!isTileInBounds(c, r)) continue;

                if (map.getTile(c, r) === TILE.FUEL_STATION) {
                    const pos = tileToWorld(c, r);
                    const dist = distance(car.x, car.y, pos.x, pos.y);

                    if (dist <= TILE_SIZE * 1.5) {
                        return pos;
                    }
                }
            }
        }
        return null;
    }

    function _checkFuelWarnings(car) {
        if (!car || car.type !== 'player') return;

        const fuelPercent = (car.fuel / car.maxFuel) * 100;

        if (fuelPercent <= FUEL_CRITICAL_LEVEL && !_fuelWarningShown) {
            showWarningToast('⛽ FUEL CRITICAL!');
            _fuelWarningShown = true;
        }
        else if (fuelPercent <= FUEL_WARNING_LEVEL && !_fuelWarningShown) {
            showToast('⛽ Fuel low - Find a fuel station', 3000, '#ffaa00');
            _fuelWarningShown = true;
        }

        else if (fuelPercent > FUEL_WARNING_LEVEL) {
            _fuelWarningShown = false;
        }
    }

    function refuel(car) {
        if (!car) return false;
        if (!car.nearFuelStation) {
            showToast('Not at a fuel station', 1500, '#ff4444');
            return false;
        }

        if (car.fuel >= car.maxFuel) {
            showToast('⛽ Tank already full!', 1500);
            return false;
        }

        if (car.money !== undefined && car.money < FUEL_REFIL_COST) {
            showToast(`Need $${FUEL_REFIL_COST} to refuel!`, 2000, '#ff4444');
            return false;
        }

        car.fuel = car.maxFuel;

        if (car.money !== undefined) {
            car.money -= FUEL_REFIL_COST;
        }

        showToast(`⛽ Refueled! -$${FUEL_REFIL_COST}`, 2000, '#44ff44');

        if (car.type === 'player') {
            car.maxSpeed = PLAYER_MAX_SPEED;
        }

        _fuelWarningShown = false;
        return true;
    }

    function addFuel(car, amount) {
        if (!car) return;

        car.fuel += amount;
        car.fuel = Math.min(car.fuel, car.maxFuel);

        showToast(`⛽ +${Math.floor(amount)} fuel`, 1500);
    }

    function getFuelPercent(car) {
        if (!car || car.fuel === undefined) return 100;
        return (car.fuel / car.maxFuel) * 100;
    }

    function isFuelLow(car) {
        return getFuelPercent(car) <= FUEL_WARNING_LEVEL;
    }

    function isFuelCritical(car) {
        return getFuelPercent(car) <= FUEL_CRITICAL_LEVEL;
    }

    function isOutOfFuel(car) {
        return car && car.fuel <= 0;
    }

    function getFuelColor(fuelPercent) {
        if (fuelPercent >= 60) return '#44ff44';
        if (fuelPercent >= 50) return '#ffff44';
        if (fuelPercent >= 15) return '#ff8844';
        return '#ff3333';
    }

    function getFuelStatus(car) {
        const percent = getFuelPercent(car);

        if (percent >= 80) return 'full';
        if (percent >= 50) return 'good';
        if (percent >= 30) return 'low';
        if (percent >= 10) return 'critical';
        return 'empty';
    }

    function getTimeUntilEmpty(car) {
        if (!car || car.fuel <= 0) return 0;

        const consumptionRate = FUEL_CONSUMPTION * TARGET_FPS;
        const timeSeconds = car.fuel / consumptionRate;

        return timeSeconds;
    }

    function getDistanceUntilEmpty(car) {
        if (!car) return 0;

        const timeSeconds = getTimeUntilEmpty(car);
        const avgSpeed = car.maxSpeed * 0.6;
        const distance = (avgSpeed * timeSeconds) / TARGET_FPS;

        return distance;
    }

    function getNearestFuelStation() {
        return _nearestFuelStation;
    }

    function reset() {
        _nearestFuelStation = null;
        _fuelWarningShown = false;
        hideFuelPrompt();
    }

    return {
        update,
        refuel,
        addFuel,
        getFuelPercent,
        isFuelLow,
        isFuelCritical,
        isOutOfFuel,
        getFuelColor,
        getFuelStatus,
        getTimeUntilEmpty,
        getDistanceUntilEmpty,
        getNearestFuelStation,
        reset,
    };
})();