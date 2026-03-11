class Obstacle {
    constructor(x, y, type = 'cone'){
        this.x = x;
        this.y = y;
        this.type = type;
        this._initType();

        this.solid =true;
        this.destructible = false;
        this.destroyed = false;

        this.health = this.maxHealth;

        this.rotation = randomFloat(0, Math.PI*2);

        this.id = uid();
    }

    _initType(){
        switch (this.type){
            case 'cone':
                this.width = 12;
                this.height = 12;
                this.color = '#ff8800';
                this.solid = false;
                this.destructible = true;
                this.maxHealth = 10;
                break;

            case 'barrier':
                this.width = 48;
                this.height = 12;
                this.color = '#ffff00';
                this.solid = true;
                this.destructible = true;
                this.maxHealth = 100;
                break;

            case 'barrel':
                this.width = 16;
                this.height = 16;
                this.color = '#884400';
                this.solid = false;
                this.destructible = true;
                this.maxHealth = 20;
                break;

            case 'trash':
                this.width = 14;
                this.height = 24;
                this.color = '#666666';
                this.solid = false;
                this.destructible = true;
                this.maxHealth = 5;
                break;

            case 'sign':
                this.width = 10;
                this.height = 24;
                this.color = '#ff3333';
                this.solid = false;
                this.destructible = true;
                this.maxHealth = 15;
                break;

            default:
                this.width = 16;
                this.height = 16;
                this.color = '#888888';
                this.solid = true;
                this.destructible = false;
                this.maxHealth = 50;
        }
    }

    update(dt){

    }

    render(ctx){
        if(this.destroyed) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        switch(this.type){
            case 'cone':
                this._renderCone(ctx);
                break;

            case 'barrier':
                this._renderBarrier(ctx);
                break;

            case 'barrel':
                this._renderBarrel(ctx);
                break;

            case 'trash':
                this._renderTrash(ctx);
                break;

            case 'sign':
                this._renderSign(ctx);
                break;

            default:
                this._renderDefault(ctx);
        }

        ctx.restore();
    }

    _renderCone(ctx){
        const w = this.width;
        const h = this.height;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(-w/2+1, h/2+1);
        ctx.lineTo(w/2+1, h/2+1);
        ctx.lineTo(1, -h/2+1);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#222222';
        ctx.fillRect(-w/2, h/2-2, w, 2);

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-w/2, h/2);
        ctx.lineTo(w/2, h/2);
        ctx.lineTo(0, -h/2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-w/4, h/4);
        ctx.lineTo(w/4, h/4);
        ctx.lineTo(w/6, 0);
        ctx.closePath();
        ctx.fill();
    }

    _renderBarrier(ctx){
        const w = this.width;
        const h = this.height;

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(-w/2+1, -h/2+1,w,h);

        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(-w/2, -h/2, w, h);

        ctx.fillStyle = '#ffffff';
        const stripeCount = 5;
        const stripeWidth = w/stripeCount/2;
        for(let i=0;i<stripeCount;i++){
            const x = -w/2+i*(w/stripeCount);
            ctx.fillRect(x, -h/2, stripeCount, h);
        }

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(-w/2, -h/2, w, h);
    }

    _renderBarrel(ctx){
        const r  = this.width/2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(1, 1, r, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI*2);
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI*2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, r*0.7, 0, Math.PI*2);
        ctx.stroke();
    }

    _renderTrash(ctx){
        const w = this.width;
        const h = this.height;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(-w/2+1, -h/2+1, w, h);

        ctx.fillStyle = this.color;
        ctx.fillRect(-w/2-1, -h/2, w, h);

        ctx.fillStyle = '#555555';
        ctx.fillRect(-w/2-1, -h/2-2, w+2, 3);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(-w/2, -h/2, w, h);
    }

    _renderSign(ctx){
        const w = this.width;
        const h = this.height;

        ctx.fillStyle = '#888888';
        ctx.fillRect(-2, 0, 4, h/2);

        ctx.fillStyle = this.color;
        ctx.fillRect(-w/2, -h/2, w, h/2);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-w/2, -h/2, w, h/2);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', 0, -h/4);
    }

    _renderDefault(ctx){
                const w = this.width;
        const h = this.height;

        ctx.fillStyle = this.color;
        ctx.fillRect(-w/2, -h/2, w, h);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(-w/2, -h/2, w, h);
    }

    takeDamage(amount){
        if(!this.destructible || this.destroyed) return;

        this.health -= amount;

        if(this.health <= 0){
            this.health = 0;
            this.destroyed = true;
            this.onDestroyed();
        }
    }

    onDestroyed(){
        console.log(`${this.type} destroyed`);
    }

    getRect(){
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            angle: this.rotation
        };
    }

    getBounds(){
        return {
            left: this.x - this.width/2,
            right: this.x + this.width/2,
            top: this.y - this.height/2,
            bottom: this.y + this.height/2
        };
    }

    contains(worldX, worldY){
        const bounds = this.getBounds();
        return worldX >= bounds.left && worldX <= bounds.right &&
               worldY >= bounds.top && worldY <= bounds.bottom;
    }

    distanceTo(x, y){
        return distance(this.x, this.y, x, y);
    }

    reset(){
        this.health = this.maxHealth;
        this.destroyed = false;
    }

    static createRandom(x, y){
        const types = ['cone', 'barrel', 'trash', 'sign'];
        const type = randomPick(types);
        return new Obstacle(x, y, type);
    }

    static createCone(x, y){
        return new Obstacle(x, y, 'cone');
    }

    static createBarrier(x,y){
        return new Obstacle(x, y, 'barrier');
    }

    static createBarrel(x, y){
        return new Obstacle(x, y, 'barrel');
    }

    static createTrash(x, y){
        return new Obstacle(x, y, 'trash');
    }

    static createSign(x, y){
        return new Obstacle(x, y, 'sign');
    }

    toString(){
        return `Obstacle(${this.type} at ${this.x}, ${this.y})`;
    }
}