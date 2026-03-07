class CollisionDetector{
    constructor() {
        this.collisionPairs = [];
        this.debugMode = false;
    }

    checkAABB(rect1, rect2){
        return(
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    checkCircleCollision(circle1, circle2){
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        const minDistance = circle1.radius + circle2.radius;

        return distance < minDistance;
    }

    checkRotatedRectCollision(rect1, rect2){
        const corners1 = this.getRectCorners(rect1);
        const corners2 = this.getRectCorners(rect2);

        const axes = this.getAxes(corners1, corners2);

        for(let axis of axes) {
            const projection1 = this.projectOntoAxis(corners1, axis);
            const projection2 = this.projectOntoAxis(corners2, axis);

            if(!this.overlaps(projection1, projection2)){
                return false;
            }
        }
        return true;
    }

    getRectCorners(rect){
        const { x, y, width, height, angle } = rect;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const corners = [
            { x: -width/2, y: -height/2 },
            {x: width/2, y: -height/2 },
            { x: width/2, y: height/2 },
            { x: -width/2, y: height/2 }
        ];

        return corners.map(corner => ({
            x: x+corner.x*cos - corner.y*sin,
            y: y+corner.x*sin + corner.y*cos
        }));
    }

    getAxes(corners1, corners2){
        const axes = [];

        for(let i=0;i<corners1.length; i++){
            const p1 = corners1[i];
            const p2 = corners1[(i+1)%corners1.length];
            const edge = { x: p2.x - p1.x, y: p2.y-p1.y };
            const normal = { x: -edge.y, y: edge.x };
            axes.push(this.normalize(normal));
        }

        for(let i=0; i<2; i++){
            const p1 = corners2[i];
            const p2 = corners2[(i+1)%corners2.length];
            const edge = { x: p2.x-p1.x, y: p2.y-p1.y };
            const normal = { x: -edge.y, y: edge.x };
            axes.push(this.normalize(normal));
        }

        return axes;
    }

    normalize(vector){
        const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        return {
            x: vector.x / length,
            y: vector.y / length
        };
    }

    projectOntoAxis(corners, axis){
        let min = corners[0].x * axis.x + corners[0].y*axis.y;
        let max = min;

        for(let i=0;i<corners.length;i++){
            const projection = corners[i].x*axis.x + corners[i].y*axis.y;
            if(projection < min) min = projection;
            if(projection > max) max = projection;
        }

        return { min, max };
    }

    overlaps(proj1, proj2){
        return !(proj1.max < proj2.min || proj2.max < proj1.min);
    }

    checkCarBuildingCollision(car, building){
        const carRect = {
            x: car.x,
            y: car.y,
            width: car.width,
            height: car.height,
            angle: car.angle
        };

        const buildingRect = {
            x: building.x + building.width/2,
            y: building.y + building.height/2,
            width: building.width,
            height: building.height,
            angle: 0
        };

        return this.checkRotatedRectCollision(carRect, buildingRect);
    }

    checkCarCarCollision(car1, car2){
        const rect1 = {
            x: car1.x,
            y: car2.y,
            width: car1.width,
            height: car1.height,
            angle: car1.angle
        };

        const rec2 = {
            x: car2.x,
            y: car2.y,
            width: car2.width,
            height: car2.height,
            angle: car2.angle
        };

        return this.checkRotatedRectCollision(rect1, rec2);
    }

    checkMapBoundary(car, mapWidth, mapHeight) {
        const margin = 50;

        return {
            left: car.x - car.width/2 < margin,
            right: car.x + car.width/2 > mapWidth-margin,
            top: car.y - car.height/2 < margin,
            bottom: car.y + car.height/2 > mapHeight - margin
        };
    }

    resolveCarBuildingCollision(car, building){
        const dx = car.x - (building.x + building.width/2);
        const dy = car.y - (building.y + building.height/2);
        const distance = Math.sqrt(dx*dx + dy*dy);

        if(distance === 0) return;

        const nx = dx/distance;
        const ny = dy/distance;

        const relativeVelocity = car.velocity;
        const velocityAlogNormal = relativeVelocity*Math.cos(car.angle - Math.atan2(ny,nx));

        if(velocityAlogNormal > 0) return;

        const restitution = 0.3;

        const impulseScalar = -(1+restitution)*velocityAlogNormal;

        car.velocity *= (1-Math.abs(impulseScalar));

        const seperationDistance = 2;
        car.x += nx*seperationDistance;
        car.y += ny*seperationDistance;

        const damageAmount = Math.abs(velocityAlogNormal) * 2;
        if(car.takeDamage){
            car.takeDamage(damageAmount);
        }

        return {
            normal: { x: nx, y: ny },
            impulse: impulseScalar,
            damage: damageAmount
        };
    }

    resolveCarCarCollision(car1, car2){
        const dx = car2.x - car1.x;
        const dy = car2.y - car1.y;

        const distance = Math.sqrt(dx*dx + dy*dy);

        if(distance === 0) return;

        const nx = dx/distance;
        const ny = dy/distance;

        const relVelX = car2.vx - car1.vx;
        const relVelY = car2.vy - car1.vy;
        const velocityAlogNormal = relVelX*nx + relVelY*ny;

        if(velocityAlogNormal > 0) return;

        const restitution = 0.5;

        const impulseScalar = -(1+restitution) * velocityAlogNormal/2;

        const impulseX = impulseScalar*nx;
        const impulseY = impulseScalar*ny;

        if(car1.applyImpulse) {
            car1.applyImpulse(-impulseX, -impulseY);
        }

        if(car2.applyImpulse) {
            car2.applyImpulse(impulseX, impulseY);
        }

        const overlap = (car1.width + car2.width)/2 - distance;
        if(overlap > 0){
            const seperationX = nx*overlap/2;
            const seperationY = ny*overlap/2;

            car1.x -= seperationX;
            car1.y -= seperationY;
            car2.x += seperationX;
            car2.y += seperationY;
        }

        const damageAmount = Math.abs(velocityAlogNormal)*1.5;
        if(car1.takeDamage) car1.takeDamage(damageAmount);
        if(car2.takeDamage) car2.takeDamage(damageAmount);

        return {
            normal: { x: nx, y: ny },
            impulse: impulseScalar,
            damage: damageAmount
        };
    }

    resolveMapBoundaryCollision(car, mapWidth, mapHeight){
        const margin = 50;

        if(car.x - car.width/2 < margin){
            car.x = margin + car.width/2;
            car.velocity *= -0.3;
            if(car.takeDamage) car.takeDamage(5);
        }

        if(car.x + car.width/2 > mapWidth - margin) {
            car.x = mapWidth - margin - car.width/2;
            car.velocity *= -0.3;
            if(car.takeDamage) car.takeDamage(5);
        }

        if(car.y - car.height/2 < margin){
            car.y = margin + car.height/2;
            car.velocity *= -0.3;
            if(car.takeDamage) car.takeDamage(5);
        }

        if(car.y + car.height/2 > mapHeight-margin){
            car.y = mapHeight - margin - car.height/2;
            car.velocity *= -0.3;
            if(car.takeDamage) car.takeDamage(5);
        }
    }

    checkMultipleCollisions(car, objects){
        const collisions = [];

        for(let obj of objects){
            if(this.checkCarBuildingCollision(car, obj)) {
                collisions.push({
                    object: obj,
                    type: obj.type || 'obstacle'
                });
            }
        }
        return collisions;
    }

    getCollisionPoint(obj1, obj2) {
        return {
            x: (obj1.x + obj2.x) /2,
            y: (obj1.y + obj2.y) /2
        };
    }

    getCollisionForce(velocity1, velocity2){
        const v1 = Math.sqrt(velocity1.x ** 2 + velocity1.y ** 2);
        const v2 = Math.sqrt(velocity2.x ** 2 + velocity2.y ** 2);
        return Math.abs(v1 - v2);
    }

    debugDraw(ctx, object){
        if(!this.debugMode) return;

        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;

        if(object.angle !== undefined) {
            const corners = this.getRectCorners(object);
            ctx.beginPath();
            ctx.moveTo(corners[0].x, corners[0].y);
            for(let i=1;i<corners.length;i++){
                ctx.lineTo(corners[i].x, corners[i].y);
            }
            ctx.closePath();
            ctx.stroke();
        }
        else{
            ctx.strokeRect(object.x, object.y, object.width, object.height);
        }

        ctx.restore();
    }

    clear(){
        this.collisionPairs = [];
    }

    toggleDebug() {
        this.debugMode = !this.debugMode;
    }
}

if(typeof module !== 'undefined' && module.exports) {
    module.exports = CollisionDetector;
}