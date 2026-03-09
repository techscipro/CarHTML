const BuildingGenerator = (() => {
    let _buildings = [];

    function generate() {
        _buildings = [];
        _placeBuildings();
        _markBuildingTiles();
    }

    function _placeBuildings() {
        const attempts = 800;
        for (let i = 0; i < attempts; i++) {
            const col = randomInt(1, MAP_COLS - 4);
            const row = randomInt(1, MAP_ROWS - 4);

            const tile = TileManager.getTile(col, row);
            if (tile !== TILE.GRASS && tile !== TILE.SIDEWALK) continue;

            if (_hasRoadAt(col, row)) continue;

            const width = randomInt(2, 5);
            const height = randomInt(2, 5);

            if (!_canPlaceBuilding(col, row, width, height)) continue;

            if (_overlapsBuilding(col, row, width, height)) continue;

            const building = {
                col,
                row,
                width,
                height,
                x: col * TILE_SIZE,
                y: row * TILE_SIZE,
                pixelWidth: width * TILE_SIZE,
                pixelHeight: height * TILE_SIZE,
                color: _randomBuildingColor(),
                roofColor: _randomRoofColor(),
                type: 'building',
            };

            _buildings.push(building);

            for (let r = row; r < row + height; r++) {
                for (let c = col; c < col + width; c++) {
                    TileManager.setTile(c, r, TILE.BUILDING);
                }
            }
        }
    }

    function _hasRoadAt(col, row) {
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (TileManager.isRoad(c, r)) return true;
            }
        }
        return false;
    }

    function _canPlaceBuilding(col, row, width, height) {
        for (let r = row; r < row + height; r++) {
            for (let c = col; c < col + width; c++) {
                if (!isTileInBounds(c, r)) return false;
                const tile = TileManager.getTile(c, r);
                if (tile !== TILE.GRASS && tile !== TILE.SIDEWALK) return false;
            }
        }
        return true;
    }

    function _overlapsBuilding(col, row, width, height) {
        const margin = 1;
        for (const building of _buildings) {
            const bCol = building.col;
            const bRow = building.row;
            const bWidth = building.width;
            const bHeight = building.height;

            if (
                col < bCol + bWidth + margin &&
                col + width + margin > bCol &&
                row < bRow + bHeight + margin &&
                row + height + margin > bRow
            ) {
                return true;
            }
        }
        return false;
    }

    function _randomBuildingColor() {
        const colors = [
            '#445566',
            '#556677',
            '#665544',
            '#554466',
            '#667755',
            '#555555',
            '#666666',
        ];
        return randomPick(colors);
    }

    function _randomRoofColor() {
        const colors = [
            '#334455',
            '#443344',
            '#445533',
            '#333344',
            '#444444',
            '#555555',
        ];
        return randomPick(colors);
    }

    function _markBuildingTiles() {
        for(const building of _buildings) {
            for(let r = building.row; r<building.row+building.height; r++){
                for(let c=building.col; c<building.col+building.width; c++){
                    TileManager.setTile(c, r, TILE.BUILDING);
                }
            }
        }
    }

    function render(ctx){
        const { colStart, colEnd, rowStart, rowEnd } = Camera.getVisibleTileRange(2);

        for(const building of _buildings) {
            const { col, row, width, height } = building;

            if(col + width < colStart || col > colEnd) continue;
            if(row +  height < rowStart || row > rowEnd) continue;

            _renderBuilding(ctx, building);
        }
    }

    function _renderBuilding(ctx, building){
        const x = building.x;
        const y = building.y;
        const w = building.pixelWidth;
        const h = building.pixelHeight;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x, y, w, h);

        const roofHeight = 8;
        ctx.fillStyle = building.roofColor;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x+w/2, y-roofHeight);
        ctx.lineTo(x+w, y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);

        _renderWindows(ctx, x, y, w, h);
    }

    function _renderWindows(ctx, x, y, w, h){
        const windowSize = 6;
        const spacing = 12;
        const margin = 8;

        ctx.fillStyle = '#ffdd88';

        for(let wy = y+margin; wy<y+h-margin; wy += spacing){
            for(let wx = x+margin; wx<x+w-margin; wx += spacing){
                if(Math.random() < 0.6){
                    ctx.fillRect(wx, wy, windowSize, windowSize);
                }
                else{
                    ctx.fillStyle = '#334455';
                    ctx.fillRect(wx, wy, windowSize, windowSize);
                    ctx.fillStyle = '#ffdd88';
                }
            }
        }
    }

    function getBuildings() {
        return _buildings;
    }

    function getBuildingsAt(worldX, worldY) {
        for(const building of _buildings) {
            if(
                worldX >= building.x &&
                worldX <= building.x + building.pixelWidth &&
                worldY >= building.y &&
                worldY <= building.y + building.pixelHeight
            ){
                return building;
            }
        }
        return null;
    }

    function getNearbyBuildings(worldX, worldY, radius){
        const nearby = [];
        for(const building of _buildings){
            const centerX = building.x + building.pixelWidth/2;
            const centerY = building.y + building.pixelHeight/2;
            if(withinRadius(worldX, worldY, centerX, centerY, radius)){
                nearby.push(building);
            }
        }
        return nearby;
    }

    function clear() {
        _buildings = [];
    }
    function count(){
        return _buildings.length;
    }

    return {
        generate,
        render, getBuildings, getBuildingsAt,
        getNearbyBuildings,
        clear,
        count,
    };
})();