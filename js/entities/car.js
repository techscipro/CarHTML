class Car {
    constructor(x, y, width, height){
        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.angle = 0;
        this.speed = 0;
        this.vx = 0;
        this.vy = 0;

        this.acceleration = 0;
        this.maxSpeed =200;
        this.turnSpeed = 2.0;
        this.friction = 0.92;

        this.handbrake = false;
        this.skidding = false;
        this.offRoad = false;

        this.color = COLOR.TRAFFIC_CAR;

        this.health = HEALTH_MAX;
        this.maxHealth = HEALTH_MAX;
        this.destroyed = false;

        this.collisionEnabled = true;

        this.type = 'car';
        this.id = uid();
    }

    update(dt){

    }

    render(ctx){
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(-this.width/2+2, -this.height/2+2, this.width, this.height);

        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.health);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);

        ctx.fillStyle = 'rgba(100, 150, 200, 0.4)';
        ctx.fillRect(-this.width/4, -this.height/3, this.width/2, this.height/4);

        ctx.fillStyle = '#ffff99';
        const headlightY = -this.height/2 -2;
        ctx.fillRect(-this.width/3, headlightY, 4, 3);
        ctx.fillRect(this.width/3-4, headlightY,4,3);

        ctx.restore();

        if(this.showDebug){
            this._renderDebug(ctx);
        }
    }

    _renderDebug(ctx){
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);

        ctx.strokeStyle = 'lime';
        ctx.beginPath();
        ctx.moveTo(0 ,0);
        ctx.lineTo(0, -this.height/2-10);
        ctx.stroke();

        ctx.restore();

        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x+this.vx*0.5, this.y+this.vy*0.5);
        ctx.stroke();
    }

    accelerate(force, dt){
        this.speed += force*dt;
        this.speed = clamp(this.speed, -this.maxSpeed*0.5, this.maxSpeed);
    }

    brake(force, dt){
        if(this.speed>0){
            this.speed -= force*dt;
            if(this.speed<0) this.speed = 0;
        }
        else if(this.speed < 0){
            this.speed += force*dt;
            if(this.speed > 0) this.speed = 0;
        }
    }

    turn(direction, dt){
        if(Math.abs(this.speed) > MIN_SPEED_THRESHOLD){
            const turnFactor = this.speed/this.maxSpeed;
            this.angle += direction*this.turnSpeed*turnFactor*dt;
            this.angle = normalizeAngle(this.angle);
        }
    }

    applyFriction(dt){
        this.speed *= Math.pow(this.friction, dt*TARGET_FPS);
        if(Math.abs(this.speed)< MIN_SPEED_THRESHOLD){
            this.speed = 0;
        }
    }

    updateVelocity(){
        this.vx = Math.cos(this.angle)*this.speed;
        this.vy = Math.sin(this.angle)*this.speed;
    }

    updatePosition(dt){
        this.x += this.vx*dt;
        this.y += this.vy*dt;
    }

    setPosition(x, y){
        this.x=x;
        this.y=y;
    }

    setAngle(angle){
        thiss.angle = normalizeAngle(angle);
    }

    setSpeed(speed){
        this.speed = speed;
        this.updateVelocity();
    }

    stop() {
        this.speed = 0;
        this.vx = 0;
        this.vy = 0;
    }

    takeDamage(amount){
        if(this.destroyed) return;

        this.health -= amount;
        this.health = clamp(this.health, 0, this.maxHealth);

        if(this.health <= 0){
            this.health = 0;
            this.destroyed = true;
            this.onDestroyed();
        }
    }

    repair(amount){
        this.health += amount;
        this.health = clamp(this.health, 0, this.maxHealth);
        if(this.health > 0){
            this.destroyed = false;
        }
    }

    onDestroyed(){

    }

    applyImpulse(ix, iy){
        this.vx += ix;
        this.vy += iy;
        this.speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
    }

    getRect(){
        return{
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            angle: this.angle
        };
    }

    getBounds(){
        const hw = this.width/2;
        const hh = this.height/2;
        return{
            left: this.x-hw,
            right: this.x+hw,
            top: this.y-hh,
            bottom: this.y+hh
        };
    }

    getCenter(){
        return { x: this.x, y: this.y };
    }

    getFront() {
        const dist = this.height/2;
        return{
            x: this.x + Math.cos(this.angle)*dist,
            y: this.y + Math.sin(this.angle)*dist,
        };
    }

    getBack() {
        const dist = this.height/2;
        return {
            x: this.x - Math.cos(this.angle)*dist,
            y: this.y - Math.sin(this.angle)*dist
        };
    }

    distanceTo(x, y){
        return distance(this.x, this.y, x, y);
    }

    distanceToCar(otherCar){
        return this.distanceTo(otherCar.x, otherCar.y);
    }

    angleTo(x, y){
        return this.angleTo(this.x, this.y, x, y);
    }

    angleToTarget(targetAngle){
        return angleDiff(this.angle, targetAngle);
    }

    isMoving() {
        return Math.abs(this.speed) > MIN_SPEED_THRESHOLD;
    }

    isStopped() {
        return !this.isMoving();
    }

    isReversing() {
        return this.speed < -MIN_SPEED_THRESHOLD;
    }

    getSpeedKmh() {
        return formatSpeed(Math.abs(this.speed));
    }

    getHealthPercent() {
        return (this.health/this.maxHealth)*100;
    }

    isDamaged() {
        return this.health<this.maxHealth;
    }

    isCriticallyDamaged() {
        return this.health <= this.maxHealth*0.3;
    }

    isDestroyed(){
        return this.destroyed;
    }

    clone(){
        const clone = new Car(this.x, this.y, this.width, this.height);
        clone.angle = this.angle;
        clone.speed = this.speed;
        clone.vx = this.vx;
        clone.vy = this.vy;
        clone.maxSpeed = this.maxSpeed;
        clone.acceleration = this.acceleration; 
        clone.turnSpeed = this.turnSpeed;
        clone.friction = this.friction;
        clone.color = this.color;
        clone.health = this.health;
        clone.maxHealth = this.maxHealth;
        return clone;
    }

    reset() {
        this.speed = 0;
        this.vx = 0;
        this.vy = 0;
        this.handbrake = false;
        this.skidding = 0;
        this.offRoad = false;
        this.health = this.maxHealth;
        this.destroyed = false;
    }

    toString() {
        return `Car(${this.x.toFixed(0)}, ${this.y.toFixed(0)}, ${this.getSpeedKmh()}km/h)`;
    }
}