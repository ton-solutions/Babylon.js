import { IsWindowObjectExist } from "./domManagement";
/**
 * A wrapper for the experimental compute pressure api which allows a callback to be called whenever certain thresholds are met.
 */
export class ComputePressureObserverWrapper {
    /**
     * A compute pressure observer will call this callback, whenever these thresholds are met.
     * @param callback The callback that is called whenever thresholds are met.
     * @param thresholds An object containing the thresholds used to decide what value to to return for each update property (average of start and end of a threshold boundary).
     */
    constructor(callback, thresholds) {
        if (ComputePressureObserverWrapper.IsAvailable) {
            this._observer = new window.ComputePressureObserver(callback, thresholds);
        }
    }
    /**
     * Returns true if ComputePressureObserver is available for use, false otherwise.
     */
    static get IsAvailable() {
        return IsWindowObjectExist() && "ComputePressureObserver" in window;
    }
    /**
     * Method that must be called to begin observing changes, and triggering callbacks.
     */
    observe() {
        var _a, _b;
        ((_a = this._observer) === null || _a === void 0 ? void 0 : _a.observe) && ((_b = this._observer) === null || _b === void 0 ? void 0 : _b.observe());
    }
    /**
     * Method that must be called to stop observing changes and triggering callbacks (cleanup function).
     */
    unobserve() {
        var _a, _b;
        ((_a = this._observer) === null || _a === void 0 ? void 0 : _a.unobserve) && ((_b = this._observer) === null || _b === void 0 ? void 0 : _b.unobserve());
    }
}
//# sourceMappingURL=computePressure.js.map