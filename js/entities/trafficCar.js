class TrafficCar extends Car {
    constructor(x, y) {
        super(x, y, TRAFFIC_CAR_WIDTH, TRAFFIC_CAR_HEIGHT);

        this.maxSpeed = randomFloat(TRAFFIC_MIN_SPEED, TRAFFIC_MAX_SPEED);
        this.targetSpeed = this.maxSpeed;
        this.accelerationForce = TRAFFIC_ACCELERATION;
        this.turnSpeed = TRAFFIC_TURN_SPEED;
        this.friction = TRAFFIC_FRICTION;

        this.color = this._randomColor();

        this.state = 'driving';
        this.targetAngle = this.angle;
        this.stuckTimer = 0;
        this.stuckThreshold = 3.0;

        this.waypoints = [];
        this.currentWaypointIndex = 0;
        this.waypointReachedDistance = 32;

        this.detectionRange = TRAFFIC_DETECTION_RANGE;
        this.safeDistance = TRAFFIC_SAFE_DISTANCE;
        this.carAhead = null;

        this.aggressiveness = randomFloat(0.5, 1.2);
        this.reactionTime = randomFloat(0.2, 0.5);
        this.reactionTimer = 0;

        this.type = 'traffic';
    }

    update(dt, map, otherCars) {
        if (this.destroyed) {
            this.stop();
            return;
        }

        this._updateAI(dt, map, otherCars);

        this.updateVelocity();
        this.updatePosition(dt);

        this._checkIfStuck(dt);
    }

    _updateAI(dt, map, otherCars) {
        this._detectObstacles(otherCars);

        this._followRoad(dt, map);

        this._avoidCollisions(dt);

        this._updateSpeed(dt);
    }

    _detectObstacles(otherCars) {
        this.carAhead = null;
        let closestDist = this.detectionRange;

        const front = this.getFront();
        const forwardAngle = this.angle;

        for (const car of otherCars) {
            if (car === this || car.destroyed) continue;

            const dist = distance(front.x, front.y, car.x, car.y);
            if (dist > this.detectionRange) continue;

            const angleToTarget = angleTo(this.x, this.y, car.x, car.y);
            const angleDifference = Math.abs(angleDiff(forwardAngle, angleToTarget));

            if (angleDifference < Math.PI / 2) {
                if (dist < closestDist) {
                    closestDist = dist;
                    this.carAhead = car;
                }
            }
        }
    }

    _followRoad(dt, map) {
        const lookAheadDist = 40;
        const checkX = this.x + Math.cos(this.angle) * lookAheadDist;
        const checkY = this.y + Math.sin(this.angle) * lookAheadDist;

        if (!map.isRoadAt(checkX, checkY)) {
            this._findRoad(map);
        }

        if (Math.random() < 0.02) {
            const randomSteer = randomFloat(-0.1, 0.1);
            this.angle += randomSteer * dt;
            this.angle = normalizeAngle(this.angle);
        }
    }

    _findRoad(map) {

        const turnAngles = [
            this.angle + Math.PI / 4,
            this.angle - Math.PI / 4,
            this.angle + Math.PI / 2,
            this.angle - Math.PI / 2,
        ];

        for (const testAngle of turnAngles) {
            const checkDist = 50;
            const checkX = this.x + Math.cos(testAngle) * checkDist;
            const checkY = this.y + Math.sin(testAngle) * checkDist;

            if (map.isRoadAt(checkX, checkY)) {
                this.targetAngle = testAngle;
                this._turnTowardsTarget(0.016);
                return;
            }
        }
    }

    _avoidCollisions(dt) {
        if (!this.carAhead) {
            this.state = 'driving';
            this.targetSpeed = this.maxSpeed;
            return;
        }

        const dist = this.distanceToCar(this.carAhead);
        const safetyDist = this.safeDistance * this.aggressiveness;

        if (dist < safetyDist) {
            this.state = 'stopping';
            this.targetSpeed = this.carAhead * 0.8;

            if (dist < TRAFFIC_STOP_DISTANCE) {
                this.targetSpeed = 0;
            }
        }
        else if (dist < safetyDist * 1.5) {
            this.state = 'driving';
            this.targetSpeed = this.carAhead.speed;
        }
        else {
            this.state = 'driving';
            this.targetSpeed = this.maxSpeed;
        }
    }

    _updateSpeed(dt) {
        const speedDiff = this.targetSpeed - this.speed;

        if (Math.abs(speedDiff) > 5) {
            if (speedDiff > 0) {
                this.accelerate(this.accelerationForce, dt);
            }
            else {
                this.brake(this.accelerationForce * 1.5, dt);
            }
        }
        else {
            this.applyFriction(dt);
        }

        this.speed = clamp(this.speed, 0, this.maxSpeed);
    }

    _turnTowardsTarget(dt) {
        const diff = angleDiff(this.angle, this.targetAngle);

        if (Math.abs(diff) > 0.01) {
            const turnAmount = clamp(diff, -this.turnSpeed * dt, this.turnSpeed * dt);
            this.angle += turnAmount;
            this.angle = normalizeAngle(thiss.angle);
        }
    }

    _checkIfStuck(st) {
        if (this.speed < MIN_SPEED_THRESHOLD * 2) {
            this.stuckTimer += dt;

            if (this.stuckTimer > this.stuckThreshold) {
                this._unstock();
                this.stuckTimer = 0;
            }
        }
        else {
            this.stuckTimer = 0;
        }
    }

    _unstock() {
        this.angle += randomFloat(-Math.PI / 4, Math.PI / 4);
        this.angle = normalizeAngle(this.angle);
        this.speed = this.maxSpeed * 0.5;
        this.updateVelocity();
    }

    _randomColor() {
        const colors = [
            '#4488ff', 
            '#ff4444', 
            '#44ff44', 
            '#ffff44', 
            '#ff8844', 
            '#8844ff', 
            '#44ffff', 
            '#ff44ff', 
            '#888888', 
            '#ffffff', 
            '#222222', 
        ];
        return randomPick(colors);
    }

    render(ctx){
        super.render(ctx);
        if(this.showDebug){
            this._renderDebugAI(ctx);
        }
    }

    _renderDebugAI(ctx){
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.detectionRange, 0, Math.PI*2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.safeDistance, 0, Math.PI*2);
        ctx.stroke();

        if(this.carAhead){
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.carAhead.x, this.carAhead.y);
            ctx.stroke();
        }

        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.state, this.x, this.y-this.height);

        ctx.restore();
    }

    setTargetSpeed(speed){
        this.targetSpeed = clamp(speed, 0, this.maxSpeed);
    }

    setWaypoints(waypoints){
        this.waypoints = waypoints;
        this.currentWaypointIndex = 0;
    }

    followWaypoints(dt){
        if(this.waypoints.length === 0) return;

        const waypoint = this.waypoints[this.currentWaypointIndex];
        const dist = distance(this.x, this.y, waypoint.x, waypoint.y);

        if(dist < this.waypointReachedDistance){
            this.currentWaypointIndex++;
            if(this.currentWaypointIndex >= this.waypoints.length){
            this.currentWaypointIndex = 0;
            }
        }
        else{
            this.targetAngle = angleTo(this.x, this.y, waypoint.x, waypoint.y);
            this._turnTowardsTarget(dt);
        }
    }

    respawn(x, y, angle){
        this.setPosition(x, y);
        this.setAngle(angle);
        this.reset();
        this.maxSpeed = randomFloat(TRAFFIC_MIN_SPEED, TRAFFIC_MAX_SPEED);
        this.targetSpeed = this.maxSpeed;
        this.color = this._randomColor();
    }

    reset(){
        super.reset();
        this.state = 'driving';
        this.targetAngle = this.angle;
        this.stuckTimer = 0;
        this.carAhead = null;
        this.waypoints = [];
        this.currentWaypointIndex = 0;
    }

    onDestroyed(){
        console.log('Traffic car destroyed!');
        
    }

    toString(){
        return `TrafficCar(${this.state}, ${this.getSpeedKmh()}km/h)`;
    }
}