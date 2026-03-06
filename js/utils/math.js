function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpAngle(a, b, t) {
    const diff = normalizeAngle(b - a);
    return a + diff * t;
}

function smoothStep(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
}

function mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

function randomFloat(min, max) {
    return min + Math.random() * (max - min);
}

function randomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
}

function randomSign() {
    return Math.random() < 0.5 ? -1 : 1;
}

function sign(value) {
    if (value > 0) return 1;
    if (value < 0) return -1;
    return 0;
}

function approachZero(value, step) {
    if (value > 0) return Math.max(0, value - step);
    if (value < 0) return Math.min(0, value + step);
    return 0;
}

function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
}

function normalizeAngleAPI(angle) {
    while (angle < 0) angle += Math.PI * 2;
    while (angle >= Math.PI * 2) angle -= Math.PI * 2;
    return angle;
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function angleTo(ax, ay, bx, by) {
    return Math.atan2(by - ay, bx - ax);
}

function angleDiff(a, b) {
    return normalizeAngle(b - a);
}

function distanceSq(ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    return dx * dx + dy * dy;
}

function distance(ax, ay, bx, by) {
    return Math.sqrt(distanceSq(ax, ay, bx, by));
}

function withinRadius(ax, ay, bx, by, radius) {
    return distanceSq(ax, ay, bx, by) <= radius * radius;
}

class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    clone() {
        return new Vec2(this.x, this.y);
    }

    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }

    addSelf(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }

    subSelf(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    scale(s) {
        return new Vec2(this.x * s, this.y * s);
    }

    scaleSelf(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    cross(v) {
        return this.x * v.y - this.y * v.x;
    }

    lengthSq() {
        return this.x * this.x - this.y * this.y;
    }

    length() {
        return Math.sqrt(this.lengthSq());
    }

    normalize() {
        const len = this.length();
        if (len == 0) return new Vec2(0, 0);
        return new Vec2(this.x / len, this.y / len);
    }

    normalizeSelf() {
        const len = thiss.length();
        if (len > 0) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }

    limit(max) {
        if (this.length() > max) {
            return this.normalize().scale(max);
        }
        return this.clone();
    }

    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vec2(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    distanceTo(v) {
        return distance(this.x, this.y, v.x, v.y);
    }

    equals(v, epsilon = 0.0001) {
        return Math.abs(this.x - v.x) < epsilon &&
            Math.abs(this.y - v.y) < epsilon;
    }

    toString() {
        return `Vec2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    static fromAngle(angle, length = 1) {
        return new Vec2(Math.cos(angle) * length, Math.sin(angle) * length);
    }

    static zero() { return new Vec2(0, 0); }
    static up() { return new Vec2(0, -1); }
    static down() { return new Vec2(0, 1); }
    static left() { return new Vec2(-1, 0); }
    static right() { return new Vec2(1, 0); }
}

function aabbOverlapDepth(a, b) {
    const dx = (a.x + a.w / 2) - (b.x + b.w / 2);
    const dy = (a.y + a.h / 2) - (b.y + b.h / 2);
    const ox = (a.w / 2 + b.w / 2) - Math.abs(dx);
    const oy = (a.h / 2 + b.h / 2) - Math.abs(dy);
    if (ox <= 0 || oy <= 0) return null;
    return {
        x: ox * sign(dx),
        y: oy * sign(dy),
    };
}

function getRotateAABB(cx, cy, w, h, angle) {
    const cos = Math.abs(Math.cos(angle));
    const sin = Math.abs(Math.sin(angle));
    const hw = (w * cos + h * sin) / 2;
    const hh = (w * sin + h * cos) / 2;
    return { x: cx - hw, y: cy - hh, w: hw * 2, h: hh * 2 };
}

function getOBBCorners(cx, cy, w, h, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const hw = w / 2;
    const hh = h / 2;

    return [
        { x: cx + (-hw * cos - -hh * sin), y: cy + (-hw * sin + -hh * cos) },
        { x: cx + (hw * cos - -hh * sin), y: cy + (hw * sin + -hh * cos) },
        { x: cx + (hw * cos - hh * sin), y: cy + (hw * sin + hh * cos) },
        { x: cx + (-hw * cos - hh * sin), y: cy + (-hw * sin + hh * cos) },
    ]
}

function obbOverlap(a, b) {
    const cornersA = getOBBCorners(a.x, a.y, a.w, a.h, a.angle);
    const cornersB = getOBBCorner(b.x, b.y, b.w, b.h, b.angle);

    const axes = [
        ...getAxes(cornersA),
        ...getAxes(cornersB),
    ];

    for (const axis of axes) {
        const projA = project(cornersA, axis);
        const projB = project(cornersB, axis);
        if (projA.max < projB.min || projB.max < projA.min) return false;
    }

    return true;
}

function getAxes(corners) {
    const axes = [];
    for (let i = 0; i < corners.length; i++) {
        const a = corners[i];
        const b = corners[(i + 1) % corners.length];
        const edge = { x: b.x - a.x, y: b.y - a.y };
        axes.push({ x: -edge.y, y: edge.x });
    }

    return axes;
}

function project(corners, axis) {
    let min = Infinity;
    let max = -Infinity;
    for (const c of corners) {
        const dot = c.x * axis.x + c.y * axis.y;
        if (dot < min) min = dot;
        if (dot > max) max = dot;
    }

    return { min, max };
}

function worldToTile(worldX, worldY) {
    return {
        col: Math.floor(worldX / TILE_SIZE),
        row: Math.floor(worldY / TILE_SIZE),
    };
}

function tileToWorld(col, row) {
    return {
        x: col * TILE_SIZE + TILE_SIZE / 2,
        y: row * TILE_SIZE + TILE_SIZE / 2,
    };
}

function tileCenter(col, row) {
    return {
        x: col * TILE_SIZE + TILE_SIZE / 2,
        y: row * TILE_SIZE + TILE_SIZE / 2,
    };
}

function isTileInBounds(col, row) {
    return col >= 0 && col < MAP_COLS && row >= 0 && row < MAP_ROWS;
}

const Ease = {
    linear: t => t,
    inQuad: t => t * t,
    outQuad: t => t * (2 - t),
    inOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    inCubic: t => t * t * t,
    outCubic: t => (--t) * t * t + 1,
    inBack: t => t * t * (2.7 * t - 1.7),
    outBack: t => 1 + (--t) * t * (2.7 * t + 1.7),
};