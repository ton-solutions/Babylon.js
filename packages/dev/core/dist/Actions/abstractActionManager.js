import { Constants } from "../Engines/constants";
/**
 * Abstract class used to decouple action Manager from scene and meshes.
 * Do not instantiate.
 * @see https://doc.babylonjs.com/how_to/how_to_use_actions
 */
export class AbstractActionManager {
    constructor() {
        /** Gets the cursor to use when hovering items */
        this.hoverCursor = "";
        /** Gets the list of actions */
        this.actions = new Array();
        /**
         * Gets or sets a boolean indicating that the manager is recursive meaning that it can trigger action from children
         */
        this.isRecursive = false;
    }
    /**
     * Does exist one action manager with at least one trigger
     **/
    static get HasTriggers() {
        for (const t in AbstractActionManager.Triggers) {
            if (Object.prototype.hasOwnProperty.call(AbstractActionManager.Triggers, t)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Does exist one action manager with at least one pick trigger
     **/
    static get HasPickTriggers() {
        for (const t in AbstractActionManager.Triggers) {
            if (Object.prototype.hasOwnProperty.call(AbstractActionManager.Triggers, t)) {
                const tAsInt = parseInt(t);
                if (tAsInt >= Constants.ACTION_OnPickTrigger && tAsInt <= Constants.ACTION_OnPickUpTrigger) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Does exist one action manager that handles actions of a given trigger
     * @param trigger defines the trigger to be tested
     * @return a boolean indicating whether the trigger is handled by at least one action manager
     **/
    static HasSpecificTrigger(trigger) {
        for (const t in AbstractActionManager.Triggers) {
            if (Object.prototype.hasOwnProperty.call(AbstractActionManager.Triggers, t)) {
                const tAsInt = parseInt(t);
                if (tAsInt === trigger) {
                    return true;
                }
            }
        }
        return false;
    }
}
/** Gets the list of active triggers */
AbstractActionManager.Triggers = {};
//# sourceMappingURL=abstractActionManager.js.map