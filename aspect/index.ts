import {
    allocate,
    entryPoint,
    execute,
    IAspectOperation,
    OperationInput,
    uint8ArrayToHex,
    hexToUint8Array,
    stringToUint8Array,
    sys,
} from "@artela/aspect-libs";
import {uint8ArrayToString} from "@artela/aspect-libs/common/helper/convert";

type Point = [number, number];
type MapType = number[][];
type Configs = {
    getIsObstacle?: (tileValue: number, x: number, y: number) => boolean;
    getCostFactor?: (tileValue: number, currentPoint: Point, parentPoint: Point | null) => number;
};
type Node = {
    value: number;
    g: number;
    h: number;
    f: number;
    x: number;
    y: number;
    point: Point;
    parent: Node | null;
};

const map: MapType = [
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
    [0, 0, 0, 0],
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
            return new Uint8Array(0);
        }
        if (op == "0003") {
            // ... implement your logic here
            return new Uint8Array(0);
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
    findPath(startPoint: Point, targetPoint: Point, map: MapType, configs?: Configs): Point[] {
        configs = configs || {};

        const getIsObstacle = configs.getIsObstacle || ((tileValue: number, x: number, y: number) => {
            return tileValue == 1;
        });

        const getCostFactor = configs.getCostFactor || ((tileValue: number, currentPoint: Point, parentPoint: Point | null) => {
            if (!parentPoint) {
                return 1;
            }
            return currentPoint[0] != parentPoint[0] && currentPoint[1] !== parentPoint[1] ? 1.4 : 1;
        });

        const row: number = map.length,
            col: number = map[0].length;
        const openList: Node[] = [],
            closeList: { [key: string]: Node } = {},
            nodes: { [key: string]: Node } = {};

        function nodeKey(point: Point): string {
            return `${point[0]},${point[1]}`;
        }

        function createNode(point: Point, parentNode: Node | null): Node | null {
            let key: string = nodeKey(point);
            if (nodes[key]) {
                return nodes[key];
            }
            let [x2, y2] = point;
            let tileValue: number = map[y2][x2];
            let isObstacle: boolean = getIsObstacle(tileValue, x2, y2);

            if (isObstacle) {
                return null;
            }

            let cost: number = getCostFactor(tileValue, point, parentNode ? parentNode.point : null);
            let g: number = parentNode ? (parentNode.g + cost) : 0;
            let h: number = Math.abs(targetPoint[0] - x2) + Math.abs(targetPoint[1] - y2);
            let f: number = g + h;

            const node: Node = {
                value: tileValue,
                g: g,
                h: h,
                f: f,
                x: x2,
                y: y2,
                point: point,
                parent: parentNode
            };

            nodes[key] = node;
            return node;
        }

        function getNeighbors(currentNode: Node): Node[] {
            let neighbors: Node[] = [];
            let directions: Point[] = [[1, 0], [0, 1], [-1, 0], [0, -1]];

            directions.forEach(d => {
                let newPoint: Point = [currentNode.x + d[0], currentNode.y + d[1]];
                if (newPoint[0] >= 0 && newPoint[0] < col && newPoint[1] >= 0 && newPoint[1] < row) {
                    let neighbor: Node | null = createNode(newPoint, currentNode);
                    if (neighbor && closeList[nodeKey(newPoint)] === undefined) {
                        neighbors.push(neighbor);
                    }
                }
            });

            return neighbors;
        }

        function reconstructPath(node: Node | null): Point[] {
            let path: Point[] = [];
            while (node) {
                path.unshift(node.point);
                node = node.parent;
            }
            return path;
        }

        let startNode: Node | null = createNode(startPoint, null);
        let endNode: Node| null = createNode(targetPoint, null);

        if (!startNode || !endNode) {
            return []; // If the start or end point is not reachable, return an empty array
        }

        openList.push(startNode);

        while (openList.length > 0) {
            // Sort the open list based on the F value and choose the node with the smallest F value to process
            openList.sort((a, b) => a.f - b.f);
            let currentNode: Node = openList.shift()!; // The exclamation mark (!) asserts that the value is non-null
            closeList[nodeKey(currentNode.point)] = currentNode;

            if (currentNode.x === targetPoint[0] && currentNode.y === targetPoint[1]) {
                return reconstructPath(currentNode);
            }

            let neighbors: Node[] = getNeighbors(currentNode);
            for (let i = 0; i < neighbors.length; i++) {
                let neighbor: Node = neighbors[i];
                let neighborKey: string = nodeKey(neighbor.point);

                if (closeList[neighborKey]) {
                    continue;
                }

                let tentative_gScore: number = currentNode.g + getCostFactor(neighbor.value, neighbor.point, currentNode.point);

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

        return []; // Return an empty array if no path is found
    }
}

// 2.register aspect Instance
const aspect = new Aspect();
entryPoint.setOperationAspect(aspect);

// 3.must export it
export {execute, allocate}

