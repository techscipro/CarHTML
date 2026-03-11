class PlayerCar extends Car {
    constructor(x, y){
        super(x, y, PLAYER_WIDTH, PLAYER_HEIGHT);

        this.maxSpeed = PLAYER_MAX_SPEED;
        this.accelerationForce = PLAYER_ACCELERATION;
        this.brakeForce = PLAYER_BRAKE_FORCE;
        this.turnSpeed = PLAYER_STEER_SPEED;
        this.friction = PLAYER_FRICTION;

        this.color = COLOR.PLAYER_CAR;

        this.fuel = FUEL_MAX;
        this.maxFuel = FUEL_MAX;

        this.distanceTraveled = 0;
        this.money = 0;
        this.score = 0;

        this.upgrades = {
            engine: 0,
            tires: 0,
            turbo: 0,
            armor: 0,
        };

        this.nearFuelStation = false;
        this.fuelStationPosition = null;

        this.type = 'player';
    }

    update(dt, map){
        if(this.destroyed){
            this.stop();
            return;
        }

        this._handleInput(dt);

        this.updateVelocity();

        this._consumeFuel(dt);

        const prevX = this.x;
        const prevY = this.y;

        this.updatePosition(dt);

        const dx = this.x - prevX;
        const dy = this.y - prevY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        this.distanceTraveled += dist;

        this._checkFuelStations(map);
    }

    _handleInput(dt){
        if(Input.isAccelerating()){
            this.accelerate(this.accelerationForce, dt);
        }

        if(Input.isBraking()){
            if(this.speed > 0){
                this.brake(this.brakeForce, dt);
            }
            else{
                this.accelerate(-this.accelerationForce*0.6, dt);
            }
        }

        const steerAxis = Input.getSteerAxis();
        if(steerAxis !== 0){
            this.turn(steerAxis, dt);
        }

        this.handbrake = Input.isHandbrake();

        if(Input.isHornPressed()){
            this._honk();
        }
        if(!Input.isAccelerating() && !Input.isBraking()){
            this.applyFriction(dt);
        }
    }

    _consumeFuel(dt){
        if(this.fuel <=0){
            this.fuel = 0;
            this.maxSpeed = PLAYER_MAX_SPEED*0.3;
            return;
        }

        const consumption = FUEL_CONSUMPTION*(1+Math.abs(this.speed)/this.maxSpeed);
        this.fuel -= consumption*dt*TARGET_FPS;
        this.fuel = clamp(this.fuel, 0, this.maxFuel);
    }

    _checkFuelStations(map){
        const tile = map.getTileAt(this.x, this.y);

        if(tile === TILE.FUEL_STATION){
            this.nearFuelStation = true;
            this.fuelStationPosition = { x: this.x, y: this.y };

            if(Input.isRefuelPressed()){
                this.refuel();
            }
        }
        else{
            this.nearFuelStation = false;
            this.fuelStationPosition = null;
        }
    }

    refuel(){
        if(!this.nearFuelStation) return false;
        if(this.fuel >= this.maxFuel) return false;
        if(this.money < FUEL_REFIL_COST) return false;

        this.fuel = this.maxFuel;
        this.money -= FUEL_REFIL_COST;

        showToast(`Refueled! -$${FUEL_REFIL_COST}`, 1500);

        return true;
    }

    _honk() {
        console.log('Honk!!');
    }

    render(ctx){
        if(this.skidding && this.isMoving()){
            this._renderSkidMarks(ctx);
        }

        super.render(ctx);

        if(this.fuel < FUEL_WARNING_LEVEL && this.fuel > 0){
            this._renderFuelWarning(ctx);
        }

        if(this.health < HEALTH_WARNING_LEVEL && this.health > 0){
            this._renderHealthWarning(ctx);
        }
    }

    _renderSkidMarks(ctx){
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 3;

        const backPos = this.getBack();

        const leftX = backPos.x + Math.cos(this.angle + Math.PI/2)*(this.width*0.3);
        const leftY = backPos.y + Math.sin(this.angle + Math.PI/2)*(this.width*0.3);

        const rightX = backPos.x + Math.cos(this.angle - Math.PI/2)*(this.width*0.3);
        const rightY = backPos.y + Math.sin(this.angle - Math.PI/2)*(this.width*0.3);

        ctx.beginPath();
        ctx.moveTo(leftX, leftY);
        ctx.lineTo(leftX - Math.cos(this.angle)*10, leftY-Math.sin(this.angle)*10);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rightX, rightY);
        ctx.lineTo(rightX - Math.cos(this.angle)*10, rightY - Math.sin(this.angle)*10);
        ctx.stroke();
        ctx.restore();
    }

    _renderFuelWarning(ctx){
        ctx.save();
        ctx.translate(this.x, this.y-this.height);

        const blink = Math.floor(Date.now()/300)%2 === 0;
        if(blink){
            ctx.fillStyle = '#ffaa00';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⛽', 0, 0);
        }

        ctx.restore();
    }

    _renderHealthWarning(ctx){
        ctx.save();
        ctx.translate(this.x, this.y - this.height-20);

        const blink = Math.floor(Date.now()/400)%2 === 0;
        if(blink){
            ctx.fillStyle = '#ff3333';
            ctx.font = '16px Arial';
            ctx.textAlign = this.getCenter;
            ctx.fillText('⚠️', 0, 0);
        }

        ctx.restore();
    }

    applyUpgrade(upgradeType, level){
        if(!this.upgrades.hasOwnProperty(upgradeType)) return;

        this.upgrades[upgradeType] = level;
        this._recalculateStats();
    }

    _recalculateStats() {
        let accelBonus = 0;
        let speedBonus = 0;
        let steerBonus = 0;
        let damageReduction = 0;

        const engineLevel = this.upgrades.engine;
        accelBonus += engineLevel * UPGRADE_EFFECTS.engine.accelerationBonus;
        speedBonus += engineLevel * UPGRADE_EFFECTS.engine.maxSpeedBonus;

        const tiresLevel = thiss.upgrades.tires;
        steerBonus += tiresLevel * UPGRADE_EFFECTS.tires.steerBonus;

        const turboLevel = this.upgrades.turbo;
        speedBonus += turboLevel*UPGRADE_EFFECTS.turbo.maxSpeedBonus;
        accelBonus += turboLevel*UPGRADE_EFFECTS.turbo.accelerationBonus;

        const armorLevel = this.upgrades.armor;
        damageReduction = armorLevel*UPGRADE_EFFECTS.armor.damageReduction;

        this.accelerationForce = PLAYER_ACCELERATION + accelBonus;
        this.maxSpeed = PLAYER_MAX_SPEED + speedBonus;
        this.turnSpeed = PLAYER_STEER_SPEED + steerBonus;
        this.damageReduction = damageReduction;
    }

    takeDamage(amount){
        if(this.damageReduction){
            amount *= (1-this.damageReduction);
        }

        super.takeDamage(amount);

        if(amount > 20){
            Camera.shakeHeavy();
        }
        else if(amount > 10){
            Camera.shakeMedium();
        }
        else if(amount > 5){
            Camera.shakeLight();
        }
    }

    addMoney(amount){
        this.money += amount;
        showMoneyToast(amount);
    }

    spendMoney(amount){
        if(this.money < amount) return false;
        this.money -= amount;
        return true;
    }

    addScore(points){
        this.score += points;
        showScoreToast(points);
    }

    getFuelPercent(){
        return (this.fuel/this.maxFuel)*100;
    }

    isFuelLow(){
        return this.fuel < FUEL_WARNING_LEVEL;
    }

    isFuelCritical(){
        return this.fuel < FUEL_CRITICAL_LEVEL;
    }

    isOutOfFuel(){
        return this.fuel <= 0;
    }

    reset(){
        super.reset();
        this.fuel = this.maxFuel;
        this.distanceTraveled = 0;
        this.nearFuelStation = false;
        this.fuelStationPosition = null;
    }

    onDestroyed(){
        console.log('Player car destroyed!');
        Camera.shakeHeavy();
        showToast('Car destroyed!', 3000, '#ff3333');
    }

    getStats(){
        return{
            position: {x: this.x, y: this.y},
            speed: this.getSpeedKmh(),
            health: this.getHealthPercent(),
            fuel: this.getFuelPercent(),
            money: this.money,
            score: this.score,
            distance: Math.floor(this.distanceTraveled),
            upgrades: { ...this.upgrades }
        };
    }

    toString() {
        return `Player(${this.getSpeedKmh()}km/h), ${this.getFuelPercent().toFixed(0)}% fuel, $${this.money}`;
    }
}