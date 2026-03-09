const Map = (() => {
    let _initialized = false;
    let _generationMode = 'grid';

    function init(mode = 'grid') {
        _generationMode = mode;
        TileManager.init();

        switch (_generationMode) {
            case 'random':
                RoadGenerator.generateRandom();
                break;
            case 'circular':
                RoadGenerator.generateCircular();
                break;
            case 'grid':
            default:
                RoadGenerator.generate();
                break;
        }

        BuildingGenerator.generate();

        _initialized = true;
    }

    function regenerate(mode) {
        if (mode) _generationMode = mode;
        TileManager.clear();
        BuildingGenerator.clear();
        init(_generationMode);
    }

    function getTile(col, row) {
        return TileManager.getTile(col, row);
    }

    function getTileAt(col, row) {
        return TileManager.getTileAt(worldX, worldY);
    }

    function isRoad(col, row) {
        return TileManager.isRoad(col, row);
    }

    function isRoadAt(worldX, worldY) {
        return TileManager.isRoadAt(worldX, worldY);
    }

    function isSolid(col, row) {
        return TileManager.isSolid(col, row);
    }

    function isSolidAt(worldX, worldY) {
        return TileManager.isSolidAt(worldX, worldY);
    }

    function getRandomRoadPosition() {
        return TileManager.getRandomRoadPosition();
    }

    function findNearestRoad(worldX, worldY, maxRadius = 10) {
        return TileManager.findNearestRoad(worldX, worldY, maxRadius);
    }

    function getBuildings() {
        return BuildingGenerator.getBuildings();
    }

    function getBuildingAt(worldX, worldY) {
        return BuildingGenerator.getNearbyBuildings(worldX, worldY);
    }

    function getNearbyBuildings(worldX, worldY, radius) {
        return BuildingGenerator.getNearbyBuildings(worldX, worldY, radius);
    }

    function render(ctx) {
        TileManager.render(ctx);
        BuildingGenerator.render(ctx);
    }

    function renderMinimap(ctx, width, height) {
        TileManager.renderMinimap(ctx, width, height);
    }

    function isInitialized() {
        return _initialized;
    }

    function getMode() {
        return _generationMode;
    }

    function getBuildingCount() {
        return BuildingGenerator.count();
    }

    return {
        init,
        regenerate,
        getTile,
        getTileAt,
        isRoad,
        isRoadAt,
        isSolid,
        isSolidAt,
        getRandomRoadPosition,
        findNearestRoad,
        getBuildings,
        getBuildingAt,
        getNearbyBuildings,
        render,
        renderMinimap,
        isInitialized,
        getMode,
        getBuildingCount,
    };
})();