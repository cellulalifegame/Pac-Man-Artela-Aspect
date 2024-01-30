import {
    allocate,
    entryPoint,
    execute,
    IAspectOperation,
    OperationInput,
    uint8ArrayToHex,
    hexToUint8Array,
    uint8ArrayToString,
    stringToUint8Array,
    sys,
} from "@artela/aspect-libs";

class Point {
    x: i32;
    y: i32;

    constructor(x: i32, y: i32) {
        this.x = x;
        this.y = y;
    }
}

type MapType = i32[][];

class Configs {
    getIsObstacle: ((tileValue: i32, x: i32, y: i32) => bool) | null;
    getCostFactor: ((tileValue: i32, currentPoint: Point, parentPoint: Point | null) => f64) | null;

    constructor(getIsObstacle: ((tileValue: i32, x: i32, y: i32) => bool) | null, getCostFactor: ((tileValue: i32, currentPoint: Point, parentPoint: Point | null) => f64) | null) {
        this.getIsObstacle = getIsObstacle;
        this.getCostFactor = getCostFactor;
    }
}

class Node {
    value: i32;
    g: i32;
    h: i32;
    f: i32;
    x: i32;
    y: i32;
    point: Point;
    parent: Node | null;

    constructor(value: i32, g: i32, h: i32, f: i32, x: i32, y: i32, point: Point, parent: Node | null) {
        this.value = value;
        this.g = g;
        this.h = h;
        this.f = f;
        this.x = x;
        this.y = y;
        this.point = point;
        this.parent = parent;
    }
}

const map: MapType = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
];
/**
 * Please describe what functionality this aspect needs to implement.
 *
 * About the concept of Aspect @see [join-point](https://docs.artela.network/develop/core-concepts/join-point)
 * How to develop an Aspect  @see [Aspect Structure](https://docs.artela.network/develop/reference/aspect-lib/aspect-structure)
 */
class Aspect implements IAspectOperation {

    /**
     * isOwner is the governance account implemented by the Aspect, when any of the governance operation
     * (including upgrade, config, destroy) is made, isOwner method will be invoked to check
     * against the initiator's account to make sure it has the permission.
     *
     * @param sender address of the transaction
     * @return true if check success, false if check fail
     */
    isOwner(sender: Uint8Array): bool {
        return false;
    }

    /**
     * operation is the main entry point of the Aspect. Currently, it is just a bytes in bytes out method,
     * so you need to decode the input and encode the output by yourself. But it is up to you how you want to design
     * the input and output.
     * The following boilerplate just decode the input in the following manner:
     * [op code | params]
     * op code is 2 bytes, params is the rest of the bytes.
     *
     * @param input
     */
    operation(input: OperationInput): Uint8Array {
        // callData encode rule
        // * 2 bytes: op code
        //      op codes lists:
        //           0x0001 | method 1
        //           0x0002 | method 2
        //           0x0003 | method 3
        //
        // * variable-length bytes: params
        //      encode rule of params is defined by each method
        const callData = uint8ArrayToHex(input.callData);
        const op = this.parseOP(callData);
        const params = this.parsePrams(callData);

        if (op == "0001") {
            // ... implement your logic here
            const greetings = this.hello(params);
            return stringToUint8Array(greetings);
        }
        if (op == "0002") {
            // ... implement your logic here
            let initPosition: Point | null = null
            let ghostPosition: Point | null = null
            const userList: Point[][] = []
            const ghostList: Point[][] = []
            let coordinate: Point = new Point(7,7)
            let currentMap: MapType = this.cloneMap(map)
            for (let i = 0; i < 50; i++) {
                let furthestCoordinates: Point = this.getOppositeCorner(coordinate.x, coordinate.y);
                const userStep: Point[] = this.findPath(initPosition instanceof Point ? initPosition : coordinate,furthestCoordinates, currentMap, new Configs(null, null));
                if (userStep.length) {
                    initPosition = userStep[0]
                }
                userList.push(userStep)
                const ghostStep: Point[] = this.findPath(ghostPosition instanceof Point ? ghostPosition : new Point(7, 1),userStep.length ? userStep[0] : coordinate, currentMap, new Configs(null, null));
                if (ghostStep.length) {
                    ghostPosition = ghostStep[0]
                    coordinate.x = ghostStep[0].x
                    coordinate.y = ghostStep[0].y
                }
                ghostList.push(ghostStep)
                if (ghostStep[0].x === userStep[0].x && ghostStep[0].y === userStep[0].y) {
                    break
                }
            }
            const userArray: Point[] = userList.flat()
            const ghostArray: Point[] = ghostList.flat()
            const userStr: string = this.pointsToString(userArray);
            const ghostStr: string = this.pointsToString(ghostArray);
            const result: string = userStr + '---------' + ghostStr
            return stringToUint8Array(result);
        }
        if (op == "0003") {
            // ... implement your logic here
            const currentMap: MapType = this.cloneMap(map)
            const result: string = currentMap.join(", ")
            return stringToUint8Array(result);
        }

        // ... add more if you have more operations
        sys.revert("unknown op");
        return new Uint8Array(0);
    }

    hello(params: string): string {
        return "hello " + uint8ArrayToString(hexToUint8Array(params));
    }

    parseOP(callData: string): string {
        if (callData.startsWith('0x')) {
            return callData.substring(2, 6);
        } else {
            return callData.substring(0, 4);
        }
    }

    parsePrams(callData: string): string {
        if (callData.startsWith('0x')) {
            return callData.substring(6, callData.length);
        } else {
            return callData.substring(4, callData.length);
        }
    }

    findPath(startPoint: Point, targetPoint: Point, map: MapType, configs: Configs): Point[] {
        let row: i32 = map.length;
        let col: i32 = map[0].length;
        let openList: Node[] = [];
        let closeList: Map<string, Node> = new Map<string, Node>();
        let nodes: Map<string, Node> = new Map<string, Node>();
        let startNode: Node | null = this.createNode(startPoint, null, nodes, map, configs, targetPoint);
        let endNode: Node | null = this.createNode(targetPoint, null, nodes, map, configs, targetPoint);

        if (startNode === null || endNode === null) {
            return [];
        }

        openList.push(startNode);

        while (openList.length > 0) {
            openList.sort((a, b) => a.f - b.f);
            let currentNode: Node = openList.shift() as Node;

            let currentNodeKey = this.nodeKey(currentNode.point);
            closeList.set(currentNodeKey, currentNode);

            if (currentNode.x === targetPoint.x && currentNode.y === targetPoint.y) {
                return this.reconstructPath(currentNode);
            }

            let neighbors: Node[] = this.getNeighbors(currentNode, nodes, map, configs, row, col, closeList);
            for (let i: i32 = 0; i < neighbors.length; i++) {
                let neighbor: Node = neighbors[i];
                let neighborKey: string = this.nodeKey(neighbor.point);

                if (closeList.has(neighborKey)) {
                    continue;
                }

                let tentative_gScore: i32 = <i32>(currentNode.g + this.getCostFactor(neighbor.value, neighbor.point, currentNode.point, configs));
                if (!openList.includes(neighbor) || tentative_gScore < neighbor.g) {
                    neighbor.parent = currentNode;
                    neighbor.g = tentative_gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                    if (!openList.includes(neighbor)) {
                        openList.push(neighbor);
                    }
                }
            }
        }

        return [];
    }

    private nodeKey(point: Point): string {
        return `${point.x},${point.y}`;
    }
    private createNode(point: Point, parentNode: Node | null, nodes: Map<string, Node>, map: MapType, configs: Configs, targetPoint: Point): Node | null {
        let key: string = this.nodeKey(point);
        if (nodes.has(key)) {
            return nodes.get(key);
        }
        let x2: i32 = point.x;
        let y2: i32 = point.y;
        let tileValue: i32 = map[y2][x2];
        let isObstacle: bool = this.getIsObstacle(tileValue, x2, y2, configs);

        if (isObstacle) {
            return null;
        }

        let cost: f64 = this.getCostFactor(tileValue, point, parentNode ? parentNode.point : null, configs);
        let g: i32 = parentNode ? <i32>(parentNode.g + cost) : 0;
        let h: i32 = <i32>(Math.abs(targetPoint.x - x2) + Math.abs(targetPoint.y - y2));
        let f: i32 = g + h;

        let node: Node = new Node(tileValue, g, h, f, x2, y2, point, parentNode);
        nodes.set(key, node);
        return node;
    }

    private getNeighbors(currentNode: Node, nodes: Map<string, Node>, map: MapType, configs: Configs, row: i32, col: i32, closeList: Map<string, Node>): Node[] {
        let neighbors: Node[] = [];
        let directions: Point[] = [new Point(1, 0), new Point(0, 1), new Point(-1, 0), new Point(0, -1)];

        for (let i: i32 = 0; i < directions.length; i++) {
            let d: Point = directions[i];
            let newPoint: Point = new Point(currentNode.x + d.x, currentNode.y + d.y);
            if (newPoint.x >= 0 && newPoint.x < col && newPoint.y >= 0 && newPoint.y < row) {
                let neighbor: Node | null = this.createNode(newPoint, currentNode, nodes, map, configs, newPoint);
                if (neighbor && !closeList.has(this.nodeKey(newPoint))) {
                    neighbors.push(neighbor);
                }
            }
        }

        return neighbors;
    }

    private reconstructPath(node: Node | null): Point[] {
        let path: Point[] = [];
        while (node !== null) {
            path.unshift(node.point);
            node = node.parent;
        }
        if (path.length > 1) {
            path = [path[1]]
        }
        return path;
    }

    private getIsObstacle(tileValue: i32, x: i32, y: i32, configs: Configs): bool {
        if (configs.getIsObstacle !== null) {
            return configs.getIsObstacle(tileValue, x, y);
        }
        return tileValue == 1;
    }

    private getCostFactor(tileValue: i32, currentPoint: Point, parentPoint: Point | null, configs: Configs): f64 {
        if (configs.getCostFactor !== null) {
            return configs.getCostFactor(tileValue, currentPoint, parentPoint);
        }
        if (!parentPoint) {
            return 1.0;
        }
        return currentPoint.x != parentPoint.x && currentPoint.y !== parentPoint.y ? 1.4 : 1.0;
    }

    private pointsToString(points: Point[]): string {
        let result: string[] = [];
        for (let i = 0, k = points.length; i < k; ++i) {
            result.push(`Point { x: ${points[i].x}, y: ${points[i].y} }`);
        }
        return result.join(", ");
    }
    public getOppositeCorner(x: i32, y: i32): Point {
        if (x < 1 || x > 7 || y < 1 || y > 7) {
            throw new Error("Coordinates are out of the valid game area range.");
        }

        let oppositeX: i32 = x <= 4 ? 7 : 1;
        let oppositeY: i32 = y <= 4 ? 7 : 1;

        return new Point(oppositeX, oppositeY);
    }
    private cloneMap(originalMap: MapType): MapType {
        let clonedMap: MapType = new Array<i32[]>(originalMap.length);
        for (let i = 0; i < originalMap.length; ++i) {
            clonedMap[i] = new Array<i32>(originalMap[i].length);
            for (let j = 0; j < originalMap[i].length; ++j) {
                clonedMap[i][j] = originalMap[i][j];
            }
        }
        return clonedMap;
    }
}

// 2.register aspect Instance
const aspect = new Aspect();
entryPoint.setOperationAspect(aspect);

// 3.must export it
export {execute, allocate}

