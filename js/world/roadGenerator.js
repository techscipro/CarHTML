const RoadGenerator = (() => {
    const GRID_SIZE = 8;
    const MAIN_ROAD_SPACING = 16;
    const SIDE_ROAD_CHANCE = 0.6;

    function generate() {
        _clearAll();
        _generateMainRoads();
        _generateSideRoads();
        _generateIntersections();
        _placeFuelStations();
        _placeParks();
        _smoothRoads();
    }

    function _clearAll() {
        for (let row = 0; row < MAP_ROWS; row++) {
            for (let col = 0; col < MAP_COLS; col++) {
                TileManager.setTile(col, row, TILE.GRASS);
            }
        }
    }

    function _generateMainRoads() {
        for (let col = MAIN_ROAD_SPACING; col < MAP_COLS; col += MAIN_ROAD_SPACING) {
            for (let row = 0; row < MAP_ROWS; row++) {
                TileManager.setTile(col, row, TILE.ROAD_V);
            }
        }

        for (let row = MAIN_ROAD_SPACING; row < MAP_ROWS; row += MAIN_ROAD_SPACING) {
            for (let col = 0; col < MAP_COLS; col++) {
                TileManager.setTile(col, row, TILE.ROAD_H);
            }
        }
    }

    function _generateSideRoads() {
        for (let col = GRID_SIZE; col < MAP_COLS; col += GRID_SIZE) {
            if (col % MAIN_ROAD_SPACING === 0) continue;
            if (Math.random() > SIDE_ROAD_CHANCE) continue;

            for (let row = 0; row < MAP_ROWS; row++) {
                if (TileManager.getTile(col, row) === TILE.GRASS) {
                    TileManager.setTile(col, row, TILE.ROAD_V);
                }
            }
        }

        for (let row = GRID_SIZE; row < MAP_ROWS; row += GRID_SIZE) {
            if (row % MAIN_ROAD_SPACING === 0) continue;
            if (Math.random() > SIDE_ROAD_CHANCE) continue;

            for (let col = 0; col < MAP_COLS; col++) {
                if (TileManager.getTile(col, row) === TILE.GRASS) {
                    TileManager.setTile(col, row, TILE.ROAD_H);
                }
            }
        }
    }

    function _generateIntersections() {
        for (let row = 0; row < MAP_ROWS; row++) {
            for (let col = 0; col < MAP_COLS; col++) {
                const tile = TileManager.getTile(col, row);
                if (tile !== TILE.ROAD_H && tile !== TILE.ROAD_V) continue;

                const neighbors = TileManager.getRoadNeighbors(col, row);
                const newTile = _determineRoadTile(neighbors);
                TileManager.setTile(col, row, newTile);
            }
        }
    }

    function _determineRoadTile(neighbors) {
        const { north, south, east, west } = neighbors;
        const count = (north ? 1 : 0) + (south ? 1 : 0) + (east ? 1 : 0) + (west ? 1 : 0);

        if (north && south && east && west) {
            return TILE.ROAD_CROSS;
        }

        if (!north && south && east && west) return TILE.ROAD_T_N;
        if (north && !south && east && west) return TILE.ROAD_T_S;
        if (north && south && !east && west) return TILE.ROAD_T_E;
        if (north && south && east && !west) return TILE.ROAD_T_W;

        if (!north && south && east && west) return TILE.ROAD_BEND_NW;
        if (north && !south && east && west) return TILE.ROAD_BEND_NE;
        if (north && south && !east && west) return TILE.ROAD_BEND_SW;
        if (north && south && east && !west) return TILE.ROAD_BEND_NW;


        if (north || south) return TILE.ROAD_V;
        if (east || west) return TILE.ROAD_H;

        return TILE.ROAD_H;
    }

    function _placeFuelStations() {
        const stationCount = 8;
        let placed = 0;
        let attempts = 0;
        const maxAttempts = 200;

        while (placed < stationCount && attempts < maxAttempts) {
            attempts++;
            const col = randomInt(5, MAP_COLS - 5);
            const row = randomInt(5, MAP_ROWS - 5);

            const neighbors = TileManager.getRoadNeighbors(col, row);
            const hasRoadNeighbor = neighbors.north || neighbors.south || neighbors.east || neighbors.west;

            if (!hasRoadNeighbor) continue;
            if (TileManager.getTile(col, row) !== TILE.GRASS) continue;

            if (_isTooCloseToFuelStation(col, row, 15)) continue;

            TileManager.setTile(col, row, TILE.FUEL_STATION);
            placed++;
        }
    }

    function _isTooCloseToFuelStation(col, row, minDistance) {
        for (let r = row - minDistance; r <= row + minDistance; r++) {
            for (let c = col - minDistance; c <= col + minDistance; c++) {
                if (!isTileInBounds(c, r)) continue;
                if (TileManager.getTile(c, r) === TILE.FUEL_STATION) {
                    return true;
                }
            }
        }
        return false;
    }

    function _placeParks() {
        const parkCount = 12;
        let placed = 0;
        let attempts = 0;
        const maxAttempts = 300;

        while (placed < parkCount && attempts < maxAttempts) {
            attempts++;
            const col = randomInt(3, MAP_COLS - 3);
            const row = randomInt(3, MAP_ROWS - 3);

            if (TileManager.getTile(col, row) !== TILE.GRASS) continue;

            if (_hasRoadNearby(col, row, 2)) continue;

            const parkSize = randomInt(2, 4);
            if (_canPlacePark(col, row, parkSize)) {
                TileManager.fillRect(col, row, parkSize, parkSize, TILE.PARK);
                placed++;
            }
        }
    }

    function _canPlacePark(col, row, size) {
        for (let r = row; r < row + size; r++) {
            for (let c = col; c < col + size; c++) {
                if (!isTileInBounds(c, r)) return false;
                if (TileManager.getTile(c, r) !== TILE.GRASS) return false;
            }
        }
        return true;
    }

    function _hasRoadNearby(col, row, radius) {
        for (let r = row - radius; r < +row + radius; r++) {
            for (let c = col - radius; c <= col + radius; c++) {
                if (!isTileInBounds(c, r)) continue;
                if (TileManager.isRoad(c, r)) return true;
            }
        }
        return false;
    }

    function _smoothRoads() {
        for (let row = 0; row < MAP_ROWS; row++) {
            for (let col = 0; col < MAP_COLS; col++) {
                if (TileManager.getTile(col, row) !== TILE.GRASS) continue;

                const neighbors = TileManager.getRoadNeighbors(col, row);
                const hasRoadNeighbor = neighbors.north || neighbors.south || neighbors.east || neighbors.west;

                if (hasRoadNeighbor && Math.random() < 0.3) {
                    TileManager.setTile(col, row, TILE.SIDEWALK);
                }
            }
        }
    }

    function generateRandom() {
        _clearAll();
        _generateRandomRoads();
        _generateIntersections();
        _placeFuelStations();
        _placeParks();
        _smoothRoads();
    }

    function _generateRandomRoads() {
        const randomCount = randomInt(15, 25);

        for (let i = 0; i < roadCount; i++) {
            if (Math.random() < 0.5) {
                const col = randomInt(0, MAP_COLS);
                for (let row = 0; row < MAP_ROWS; row++) {
                    if (Math.random() < 0.9) {
                        TileManager.setTile(col, row, TILE.ROAD_V);
                    }
                }
            }
            else {
                const row = randomInt(0, MAP_ROWS);
                for (let col = 0; col < MAP_COLS; col++) {
                    if (Math.random() < 0.9) {
                        TileManager.setTile(col, row, TILE.ROAD_H);
                    }
                }
            }
        }

    }
    function generateCircular() {
        _clearAll();
        const centerCol = Math.floor(MAP_COLS / 2);
        const cneterRow = Math.floor(MAP_ROWS / 2);

        for (let radius = 8; radius < Math.min(MAP_COLS, MAP_ROWS) / 2; radius += 8) {
            _generateCircleRoad(centerCol, cneterRow, radius);
        }

        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
            _generateRadialRoad(centerCol, cneterRow, angle);
        }

        _generateIntersections();
        _placeFuelStations();
        _placeParks();


    }
    function _generateCircleRoad(centerCol, centerRow, radius) {
        const points = Math.floor(radius * 2 * Math.PI);
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const col = Math.floor(centerCol + Math.cos(angle) * radius);
            const row = Math.floor(centerRow + Math.sin(angle) * radius);
            if (isTileInBounds(col, row)) {
                TileManager.setTile(col, row, TILE.ROAD_H);
            }
        }
    }

    function _generateRadialRoad(centerCol, centerRow, angle) {
        const maxDist = Math.min(MAP_COLS, MAP_ROWS) / 2;
        for (let dist = 0; dist < maxDist; dist++) {
            const col = Math.floor(centerCol + Math.cos(angle) * dist);
            const row = Math.floor(centerRow + Math.sin(angle) * dist);
            if (isTileInBounds(col, row)) {
                TileManager.setTile(col, row, TILE.ROAD_V);
            }
        }
    }
    return {
        generate,
        generateRandom,
        generateCircular,
    }
})();