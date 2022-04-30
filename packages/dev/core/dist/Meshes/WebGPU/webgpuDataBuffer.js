import { DataBuffer } from "../../Buffers/dataBuffer";
/** @hidden */
export class WebGPUDataBuffer extends DataBuffer {
    constructor(resource) {
        super();
        this._buffer = resource;
    }
    get underlyingResource() {
        return this._buffer;
    }
}
//# sourceMappingURL=webgpuDataBuffer.js.map