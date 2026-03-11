const Pathfinding = (() => {
    class Node {
        constructor(col, row) {
            this.col = col;
            this.row = row;
            this.g = 0;
            this.h = 0;
            this.f = 0;
            this.parent = null;
        }

        equals(other) {
            return this.col === other.col && this.row === other.row;
        }

        getKey() {
            return `${this.col}, ${this.row}`;
        }
    }

    function findPath(startX, startY, ednX, endY, map) {
        const start = worldToTile(startX, startY);
        const end = worldToTile(ednX, endY);

        if (!isTileInBounds(start.col, start.row) || !isTileInBounds(end.col, end.row)) {
            return null;
        }

        const startNode = new Node(start.col, start.row);
        const endNode = new Node(end.col, end.row);

        const openList = [startNode];
        const closedList = new Set();

        const maxIterations = 1000;
        let iterations = 0;

        while (openList.length > 0 && iterations < maxIterations) {
            iterations++;

            let currentIndex = 0;
            for (let i = 1; i < openList.length; i++) {
                if (openList[i].f < openList[currentIndex].f) {
                    currentIndex = i;
                }
            }

            const current = openList[currentIndex];

            if (current.equals(endNode)) {
                return _reconstructPath(current);
            }

            openList.splice(currentIndex, 1);
            closedList.add(current.getKey());

            const neighbors = _getNeighbors(current, map);

            for (const neighbor of neighbors) {
                if (closedList.has(neighbor.getKey())) continue;

                const tentativeG = current.g + 1;

                let neighborInOpen = openList.find(n => n.equals(neighbor));

                if (!neighborInOpen) {
                    neighborInOpen = neighbor;
                    openList.push(neighborInOpen);
                }
                else if (tentativeG >= neighborInOpen.g) {
                    continue;
                }

                neighborInOpen.parent = current;
                neighborInOpen.g = tentativeG;
                neighborInOpen.h = _heuristic(neighborInOpen, endNode);
                neighborInOpen.f = neighborInOpen.g + neighborInOpen.h;
            }
        }

        return null;
    }

    function _getNeighbors(node, map) {
        const neighbors = [];
        const directions = [
            { col: 0, row: -1 },
            { col: 1, row: 0 },
            { col: 0, row: 1 },
            { col: -1, row: 0 },
        ];

        for (const dir of directions) {
            const col = node.col + dir.col;
            const row = node.row + dir.row;

            if (!isTileInBounds(col, row)) continue;

            neighbors.push(new Node(col, row));
        }

        return neighbors;
    }

    function _heuristic(nodeA, nodeB) {
        return Math.abs(nodeA.col - nodeB.col) + Math.abs(nodeA.row - nodeB.row);
    }

    function _reconstructPath(endNode) {
        const path = [];
        let current = endNode;

        while (current !== null) {
            const worldPos = tileToWorld(current.col, current.row);
            path.unshift(worldPos);
            current = current.parent;
        }
        return path;
    }

    function findNearestRoad(worldX, worldY, map, maxRadius = 10) {
        const tile = worldToTile(worldX, worldY);

        if (map.isRoad(tile.col, tile.row)) {
            return tileToWorld(tile.col, tile.row);
        }

        for (let radius = 1; radius <= maxRadius; radius++) {
            for (let row = tile.row - radius; row <= tile.row + radius; row++) {
                for (let col = tile.col - radius; col <= tile.col + radius; col++) {
                    if (!isTileInBounds(col, row)) continue;

                    if (Math.abs(row - tile.row) !== radius && Math.abs(col - tile.col) !== radius) {
                        continue;
                    }

                    if (map.isRoad(col, row)) {
                        return tileToWorld(col, row);
                    }
                }
            }
        }

        return null;
    }

    function simplifyPath(path, threshold = 3) {
        if (!path || path.length <= 2) return path;

        const simplified = [path[0]];

        for (let i = 1; i < path.length - 1; i++) {
            if (i % threshold === 0) {
                simplified.push(path[i]);
            }
        }

        simplified.push(path[path.length - 1]);

        return simplified;
    }

    function getRandomPath(map, minLength = 5, maxLength = 15) {
        const startPos = map.getRandomRoadPosition();

        if (!startPos) return null;

        let endPos = null;
        let attempts = 0;
        const maxAttempts = 20;

        while (attempts < maxAttempts) {
            attempts++;
            endPos = map.getRandomRoadPosition();

            if (!endPos) continue;

            const dist = distance(startPos.x, startPos.y, endPos.x, endPos.y);
            const minDist = minLength * TILE_SIZE;
            const maxDist = maxLength * TILE_SIZE;

            if (dist >= minDist && dist <= maxDist) {
                break;
            }
        }

        if (!endPos) return null;

        const path = findPath(startPos.x, startPos.y, endPos.x, endPos.y, map);
        return path;
    }

    function getPointOnPath(path, distanceFromStart) {
        if (!path || path.length === 0) return null;
        if (distanceFromStart <= 0) return path[0];

        let accumulated = 0;

        for (let i = 1; i < path.length; i++) {
            const segmentLength = distance(
                path[i - 1].x, path[i - 1].y,
                path[i].x, path[i].y
            );

            if (accumulated + segmentLength >= distanceFromStart) {
                const t = (distanceFromStart - accumulated) / segmentLength;
                return {
                    x: lerp(path[i - 1].x, path[i].x, t),
                    y: lerp(path[i - 1].x, path[i].y, t)
                };
            }

            accumulated += segmentLength;
        }
        return path[path.length - 1];
    }

    function debugDrawPath(ctx, path, color = '#00ff00', lineWidth = 2) {
        if (!path || path.length < 2) return;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash([5, 5]);

        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);

        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = color;
        for (const point of path) {
            ctx.beginPath();
            ctx.arc(point.x, point, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    return {
        findPath,
        findNearestRoad,
        simplifyPath,
        getRandomPath,
        getPathLength,
        getPointOnPath,
        debugDrawPath,
    };
})();