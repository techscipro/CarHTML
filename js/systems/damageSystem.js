const DamgageSystem = (() => {
    function calculateCollisionDamage(speed, collisionType = 'normal') {
        const baseSpeed = Math.abs(speed);

        let damage = 0;

        if (baseSpeed > 200) {
            damage = DAMAGE_PER_COLLISION * 2.5;
        }
        else if (baseSpeed > 150) {
            damage = DAMAGE_PER_COLLISION * 2.0;
        }
        else if (baseSpeed > 50) {
            damage = DAMAGE_PER_COLLISION * 1.0;
        }
        else {
            damage = DAMAGE_PER_COLLISION * 0.5;
        }

        damage += baseSpeed * DAMAGE_SPEED_FACTOR;

        switch (collisionType) {
            case 'building':
                damage *= 1.5;
                break;

            case 'car':
                damage *= 1.2;
                break;

            case 'obstacle':
                damage *= 0.8;
                break;

            case 'boundary':
                damage *= 1.0;
                break;
        }

        return Math.max(1, Math.floor(damage));
    }

    function applyDamage(entity, amount, source = 'collision') {
        if (!entity || entity.destroyed) return 0;

        const actualDamage = Math.floor(amount);

        entity.takeDamage(actualDamage);

        _createDamageFeedback(entity, actualDamage, source);

        return actualDamage;
    }

    function _createDamageFeedback(entity, damage, source) {
        if (entity.type === 'player') {
            if (damage >= 30) {
                Camera.shakeHeavy();
            }
            else if (damage >= 15) {
                Camera.shakeMedium();
            }
            else if (damage >= 5) {
                Camera.shakeLight();
            }
        }

        if (damage > 0) {
            console.log(`${entity.type} took ${damage} damage from ${source}`);
        }
    }

    function processCarBuildingCollision(car, building, speed) {
        const damage = calculateCollisionDamage(speed, 'building');
        return applyDamage(car, damage, 'building');
    }

    function processCarCarCollision(car1, car2) {
        const relativeSpeed = Math.abs(car1.speed - car2.speed);
        const damage = calculateCollisionDamage(relativeSpeed, 'car');

        const damage1 = applyDamage(car1, damage, 'car');
        const damage2 = applyDamage(car2, damage * 0.7, 'car');

        return { damage1, damage2 };
    }

    function processCarObstacleCollision(car, obstacle, speed) {
        const damage = calculateCollisionDamage(speed, 'obstacle');
        const carDamage = applyDamage(car, damage * 0.5, 'obstacle');

        if (obstacle.destructible) {
            obstacle.takeDamage(damage * 2);
        }

        return carDamage;
    }

    function processMapBoundaryCollision(car) {
        const damage = DAMAGE_PER_COLLISION * 0.5;
        return applyDamage(car, damage, 'boundary');
    }

    function canRepair(car, cost) {
        if (!car || car.health >= car.maxHealth) return false;
        if (car.money !== undefined && car.money < cost) return false;
        return true;
    }

    function repairCar(car, amount, cost = 0) {
        if (!car) return false;

        if (cost > 0 && car.money !== undefined) {
            if (car.money < cost) return false;
            car.money -= cost;
        }

        const healAmount = Math.min(amount, car.maxHealth - car.health);
        car.repair(healAmount);

        showToast(`Repaired +${Math.floor(healAmount)} HP`, 1500);

        return true;
    }

    function getRepairCost(car) {
        if (!car) return 0;
        const damageTaken = car.maxHealth - car.health;
        return Math.floor(damageTaken * REPAIR_COST_PER_HP);
    }

    function getDamageLevel(healthPercent) {
        if (healthPercent >= 80) return 'minimal';
        if (healthPercent >= 60) return 'light';
        if (healthPercent >= 40) return 'moderate';
        if (healthPercent >= 20) return 'heavy';
        if (healthPercent > 0) return 'critical';
        return 'destroyed';
    }


    function getDamageColor(healthPercent) {
        if (healthPercent >= 80) return '#44ff44';
        if (healthPercent >= 60) return '#88ff44';
        if (healthPercent >= 40) return '#ffff44';
        if (healthPercent >= 20) return '#ff8844';
        return '#ff3333';
    }

    function isCarCritical(car) {
        if (!car) return false;
        return car.health <= car.maxHealth * 0.2;
    }

    function isCarDestroyed(car) {
        if (!car) return true;
        return car.health <= 0 || car.destroyed;
    }

    return {
        calculateCollisionDamage,
        applyDamage,
        processCarBuildingCollision,
        processCarCarCollision,
        processCarObstacleCollision,
        processMapBoundaryCollision,
        canRepair,
        repairCar,
        getRepairCost,
        getDamageLevel,
        getDamageColor,
        isCarCritical,
        isCarDestroyed,
    };
})();