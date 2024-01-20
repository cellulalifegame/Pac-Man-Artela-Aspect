
import {
    allocate,
    entryPoint,
    execute,
    IAspectOperation,
    OperationInput,
    uint8ArrayToHex,
    stringToUint8Array,
    sys,
} from "@artela/aspect-libs";
import {IAspectBase} from "@artela/aspect-libs/types/aspect-interface";

/**
 * Please describe what functionality this aspect needs to implement.
 *
 * About the concept of Aspect @see [join-point](https://docs.artela.network/develop/core-concepts/join-point)
 * How to develop an Aspect  @see [Aspect Structure](https://docs.artela.network/develop/reference/aspect-lib/aspect-structure)
 */
class Aspect implements IAspectOperation, IAspectBase {

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
        return "hello " + params;
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
}

// 2.register aspect Instance
const aspect = new Aspect()
entryPoint.setAspect(aspect)

// 3.must export it
export { execute, allocate }

