const TrafficAI = (() => {
    let _cars = [];
    let _maxCars = TRAFFIC_CAR_COUNT;
    let _spawnTimer = 0;
    let _spawnInterval = 2.0;

    function init(map) {
        _cars = [];
        _spawnInitialTraffic(map);
    }

    function _spawnInitialTraffic(map) {
        const spawnCount = Math.floor(_maxCars * 0.7);

        for (let i = 0; i < spawnCount; i++) {
            _spawnCar(map);
        }
    }

    function _spawnCar(map) {
        if (_cars.length >= _maxCars) return null;

        const pos = map.getRandomRoadPosition();
        if (!pos) return null;

        const car = new TrafficAI(pos.x, pos.y);
        car.angle = randomFloat(0, Math.PI * 2);
        car.speed = randomFloat(TRAFFIC_MIN_SPEED * 0.5, TRAFFIC_MAX_SPEED * 0.5);

        _cars.push(car);
        return car;
    }

    function update(dt, map, player) {

        _spawnTimer += dt;
        if (_spawnTimer >= _spawnInterval && _cars.length < _maxCars) {
            _spawnCar(map);
            _spawnTimer = 0;
        }

        for (let i = _cars.length - 1; i >= 0; i--) {
            const car = _cars[i];

            if (car.destroyed) {
                _cars.splice(i, 1);
                continue;
            }

            if (player) {
                const dist = car.distaceTo(player.x, player.y);
                if (dist > 2000) {
                    _cars.splice(i, 1);
                    continue;
                }
            }

            const otherCars = _cars.filter(c => c !== car);
            if (player) otherCars.push(player);

            car.update(dt, map, otherCars);
        }
    }

    function render(ctx) {
        for (const car of _cars) {
            if (!car.destroyed) {
                car.render(ctx);
            }
        }
    }

    function getCars() {
        return _cars;
    }

    function getCarCount() {
        return _cars.length;
    }

    function getNearby(x, y, radius) {
        return _cars.filter(car => {
            return !car.destroyed && car.distaceTo(x, y) <= radius;
        });
    }

    function getClosest(x, y) {
        let closest = null;
        let minDist = Infinity;

        for (const car of _cars) {
            if (car.destroyed) continue;
            const dist = car.distaceTo(x, y);
            if (dist < minDist) {
                minDist = dist;
                closest = car;
            }
        }

        return closest;
    }

    function clear() {
        _cars = [];
        _spawnTimer = 0;
    }

    function setMaxCars(count) {
        _maxCars = clamp(count, 0, 100);
    }

    function setSpawnInterval(seconds) {
        _spawnInterval = Math.max(0.5, seconds);
    }

    function removeCar(car) {
        const index = _cars.indexOf(car);
        if (index !== -1) {
            _cars.splice(index, 1);
        }
    }

    function respawnCar(car, map) {
        const pos = map.getRandomRoadPosition();
        if (pos) {
            car.respawn(pos.x, pos.y, randomFloat(0, Math.PI * 2));
        }
    }

    return {
        init,
        update,
        render,
        getCars,
        getCarCount,
        getNearby,
        getClosest,
        clear,
        setMaxCars,
        setSpawnInterval,
        removeCar,
        respawnCar,
    };
})();