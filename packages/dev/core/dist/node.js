import { __decorate } from "tslib";
import { Matrix, Vector3 } from "./Maths/math.vector";
import { serialize } from "./Misc/decorators";
import { Observable } from "./Misc/observable";
import { EngineStore } from "./Engines/engineStore";
import { _WarnImport } from "./Misc/devTools";
/** @hidden */
class _InternalNodeDataInfo {
    constructor() {
        this._doNotSerialize = false;
        this._isDisposed = false;
        this._sceneRootNodesIndex = -1;
        this._isEnabled = true;
        this._isParentEnabled = true;
        this._isReady = true;
        this._onEnabledStateChangedObservable = new Observable();
        this._onClonedObservable = new Observable();
    }
}
/**
 * Node is the basic class for all scene objects (Mesh, Light, Camera.)
 */
export class Node {
    /**
     * Creates a new Node
     * @param name the name and id to be given to this node
     * @param scene the scene this node will be added to
     */
    constructor(name, scene = null) {
        this._isDirty = false;
        this._nodeDataStorage = new _InternalNodeDataInfo();
        /**
         * Gets or sets a string used to store user defined state for the node
         */
        this.state = "";
        /**
         * Gets or sets an object used to store user defined information for the node
         */
        this.metadata = null;
        /**
         * For internal use only. Please do not use.
         */
        this.reservedDataStore = null;
        /** @hidden */
        this._parentContainer = null;
        /**
         * Gets a list of Animations associated with the node
         */
        this.animations = new Array();
        this._ranges = {};
        /**
         * Callback raised when the node is ready to be used
         */
        this.onReady = null;
        /** @hidden */
        this._currentRenderId = -1;
        this._parentUpdateId = -1;
        /** @hidden */
        this._childUpdateId = -1;
        /** @hidden */
        this._waitingParentId = null;
        /** @hidden */
        this._cache = {};
        this._parentNode = null;
        /** @hidden */
        this._children = null;
        /** @hidden */
        this._worldMatrix = Matrix.Identity();
        /** @hidden */
        this._worldMatrixDeterminant = 0;
        /** @hidden */
        this._worldMatrixDeterminantIsDirty = true;
        this._animationPropertiesOverride = null;
        /** @hidden */
        this._isNode = true;
        /**
         * An event triggered when the mesh is disposed
         */
        this.onDisposeObservable = new Observable();
        this._onDisposeObserver = null;
        // Behaviors
        this._behaviors = new Array();
        this.name = name;
        this.id = name;
        this._scene = (scene || EngineStore.LastCreatedScene);
        this.uniqueId = this._scene.getUniqueId();
        this._initCache();
    }
    /**
     * Add a new node constructor
     * @param type defines the type name of the node to construct
     * @param constructorFunc defines the constructor function
     */
    static AddNodeConstructor(type, constructorFunc) {
        this._NodeConstructors[type] = constructorFunc;
    }
    /**
     * Returns a node constructor based on type name
     * @param type defines the type name
     * @param name defines the new node name
     * @param scene defines the hosting scene
     * @param options defines optional options to transmit to constructors
     * @returns the new constructor or null
     */
    static Construct(type, name, scene, options) {
        const constructorFunc = this._NodeConstructors[type];
        if (!constructorFunc) {
            return null;
        }
        return constructorFunc(name, scene, options);
    }
    /**
     * Gets or sets a boolean used to define if the node must be serialized
     */
    get doNotSerialize() {
        if (this._nodeDataStorage._doNotSerialize) {
            return true;
        }
        if (this._parentNode) {
            return this._parentNode.doNotSerialize;
        }
        return false;
    }
    set doNotSerialize(value) {
        this._nodeDataStorage._doNotSerialize = value;
    }
    /**
     * Gets a boolean indicating if the node has been disposed
     * @returns true if the node was disposed
     */
    isDisposed() {
        return this._nodeDataStorage._isDisposed;
    }
    /**
     * Gets or sets the parent of the node (without keeping the current position in the scene)
     * @see https://doc.babylonjs.com/how_to/parenting
     */
    set parent(parent) {
        if (this._parentNode === parent) {
            return;
        }
        const previousParentNode = this._parentNode;
        // Remove self from list of children of parent
        if (this._parentNode && this._parentNode._children !== undefined && this._parentNode._children !== null) {
            const index = this._parentNode._children.indexOf(this);
            if (index !== -1) {
                this._parentNode._children.splice(index, 1);
            }
            if (!parent && !this._nodeDataStorage._isDisposed) {
                this._addToSceneRootNodes();
            }
        }
        // Store new parent
        this._parentNode = parent;
        // Add as child to new parent
        if (this._parentNode) {
            if (this._parentNode._children === undefined || this._parentNode._children === null) {
                this._parentNode._children = new Array();
            }
            this._parentNode._children.push(this);
            if (!previousParentNode) {
                this._removeFromSceneRootNodes();
            }
        }
        // Enabled state
        this._syncParentEnabledState();
    }
    get parent() {
        return this._parentNode;
    }
    /** @hidden */
    _addToSceneRootNodes() {
        if (this._nodeDataStorage._sceneRootNodesIndex === -1) {
            this._nodeDataStorage._sceneRootNodesIndex = this._scene.rootNodes.length;
            this._scene.rootNodes.push(this);
        }
    }
    /** @hidden */
    _removeFromSceneRootNodes() {
        if (this._nodeDataStorage._sceneRootNodesIndex !== -1) {
            const rootNodes = this._scene.rootNodes;
            const lastIdx = rootNodes.length - 1;
            rootNodes[this._nodeDataStorage._sceneRootNodesIndex] = rootNodes[lastIdx];
            rootNodes[this._nodeDataStorage._sceneRootNodesIndex]._nodeDataStorage._sceneRootNodesIndex = this._nodeDataStorage._sceneRootNodesIndex;
            this._scene.rootNodes.pop();
            this._nodeDataStorage._sceneRootNodesIndex = -1;
        }
    }
    /**
     * Gets or sets the animation properties override
     */
    get animationPropertiesOverride() {
        if (!this._animationPropertiesOverride) {
            return this._scene.animationPropertiesOverride;
        }
        return this._animationPropertiesOverride;
    }
    set animationPropertiesOverride(value) {
        this._animationPropertiesOverride = value;
    }
    /**
     * Gets a string identifying the name of the class
     * @returns "Node" string
     */
    getClassName() {
        return "Node";
    }
    /**
     * Sets a callback that will be raised when the node will be disposed
     */
    set onDispose(callback) {
        if (this._onDisposeObserver) {
            this.onDisposeObservable.remove(this._onDisposeObserver);
        }
        this._onDisposeObserver = this.onDisposeObservable.add(callback);
    }
    /**
     * An event triggered when the enabled state of the node changes
     */
    get onEnabledStateChangedObservable() {
        return this._nodeDataStorage._onEnabledStateChangedObservable;
    }
    /**
     * An event triggered when the node is cloned
     */
    get onClonedObservable() {
        return this._nodeDataStorage._onClonedObservable;
    }
    /**
     * Gets the scene of the node
     * @returns a scene
     */
    getScene() {
        return this._scene;
    }
    /**
     * Gets the engine of the node
     * @returns a Engine
     */
    getEngine() {
        return this._scene.getEngine();
    }
    /**
     * Attach a behavior to the node
     * @see https://doc.babylonjs.com/features/behaviour
     * @param behavior defines the behavior to attach
     * @param attachImmediately defines that the behavior must be attached even if the scene is still loading
     * @returns the current Node
     */
    addBehavior(behavior, attachImmediately = false) {
        const index = this._behaviors.indexOf(behavior);
        if (index !== -1) {
            return this;
        }
        behavior.init();
        if (this._scene.isLoading && !attachImmediately) {
            // We defer the attach when the scene will be loaded
            this._scene.onDataLoadedObservable.addOnce(() => {
                behavior.attach(this);
            });
        }
        else {
            behavior.attach(this);
        }
        this._behaviors.push(behavior);
        return this;
    }
    /**
     * Remove an attached behavior
     * @see https://doc.babylonjs.com/features/behaviour
     * @param behavior defines the behavior to attach
     * @returns the current Node
     */
    removeBehavior(behavior) {
        const index = this._behaviors.indexOf(behavior);
        if (index === -1) {
            return this;
        }
        this._behaviors[index].detach();
        this._behaviors.splice(index, 1);
        return this;
    }
    /**
     * Gets the list of attached behaviors
     * @see https://doc.babylonjs.com/features/behaviour
     */
    get behaviors() {
        return this._behaviors;
    }
    /**
     * Gets an attached behavior by name
     * @param name defines the name of the behavior to look for
     * @see https://doc.babylonjs.com/features/behaviour
     * @returns null if behavior was not found else the requested behavior
     */
    getBehaviorByName(name) {
        for (const behavior of this._behaviors) {
            if (behavior.name === name) {
                return behavior;
            }
        }
        return null;
    }
    /**
     * Returns the latest update of the World matrix
     * @returns a Matrix
     */
    getWorldMatrix() {
        if (this._currentRenderId !== this._scene.getRenderId()) {
            this.computeWorldMatrix();
        }
        return this._worldMatrix;
    }
    /** @hidden */
    _getWorldMatrixDeterminant() {
        if (this._worldMatrixDeterminantIsDirty) {
            this._worldMatrixDeterminantIsDirty = false;
            this._worldMatrixDeterminant = this._worldMatrix.determinant();
        }
        return this._worldMatrixDeterminant;
    }
    /**
     * Returns directly the latest state of the mesh World matrix.
     * A Matrix is returned.
     */
    get worldMatrixFromCache() {
        return this._worldMatrix;
    }
    // override it in derived class if you add new variables to the cache
    // and call the parent class method
    /** @hidden */
    _initCache() {
        this._cache = {};
        this._cache.parent = undefined;
    }
    /**
     * @param force
     * @hidden
     */
    updateCache(force) {
        if (!force && this.isSynchronized()) {
            return;
        }
        this._cache.parent = this.parent;
        this._updateCache();
    }
    /**
     * @param trigger
     * @param initialCall
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _getActionManagerForTrigger(trigger, initialCall = true) {
        if (!this.parent) {
            return null;
        }
        return this.parent._getActionManagerForTrigger(trigger, false);
    }
    // override it in derived class if you add new variables to the cache
    // and call the parent class method if !ignoreParentClass
    /**
     * @param ignoreParentClass
     * @hidden
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _updateCache(ignoreParentClass) { }
    // override it in derived class if you add new variables to the cache
    /** @hidden */
    _isSynchronized() {
        return true;
    }
    /** @hidden */
    _markSyncedWithParent() {
        if (this._parentNode) {
            this._parentUpdateId = this._parentNode._childUpdateId;
        }
    }
    /** @hidden */
    isSynchronizedWithParent() {
        if (!this._parentNode) {
            return true;
        }
        if (this._parentNode._isDirty || this._parentUpdateId !== this._parentNode._childUpdateId) {
            return false;
        }
        return this._parentNode.isSynchronized();
    }
    /** @hidden */
    isSynchronized() {
        if (this._cache.parent !== this._parentNode) {
            this._cache.parent = this._parentNode;
            return false;
        }
        if (this._parentNode && !this.isSynchronizedWithParent()) {
            return false;
        }
        return this._isSynchronized();
    }
    /**
     * Is this node ready to be used/rendered
     * @param completeCheck defines if a complete check (including materials and lights) has to be done (false by default)
     * @return true if the node is ready
     */
    isReady(completeCheck = false) {
        return this._nodeDataStorage._isReady;
    }
    /**
     * Flag the  node as dirty (Forcing it to update everything)
     * @param property helps children apply precise "dirtyfication"
     * @returns this node
     */
    markAsDirty(property) {
        this._currentRenderId = Number.MAX_VALUE;
        this._isDirty = true;
        return this;
    }
    /**
     * Is this node enabled?
     * If the node has a parent, all ancestors will be checked and false will be returned if any are false (not enabled), otherwise will return true
     * @param checkAncestors indicates if this method should check the ancestors. The default is to check the ancestors. If set to false, the method will return the value of this node without checking ancestors
     * @return whether this node (and its parent) is enabled
     */
    isEnabled(checkAncestors = true) {
        if (checkAncestors === false) {
            return this._nodeDataStorage._isEnabled;
        }
        if (!this._nodeDataStorage._isEnabled) {
            return false;
        }
        return this._nodeDataStorage._isParentEnabled;
    }
    /** @hidden */
    _syncParentEnabledState() {
        this._nodeDataStorage._isParentEnabled = this._parentNode ? this._parentNode.isEnabled() : true;
        if (this._children) {
            this._children.forEach((c) => {
                c._syncParentEnabledState(); // Force children to update accordingly
            });
        }
    }
    /**
     * Set the enabled state of this node
     * @param value defines the new enabled state
     */
    setEnabled(value) {
        if (this._nodeDataStorage._isEnabled === value) {
            return;
        }
        this._nodeDataStorage._isEnabled = value;
        this._nodeDataStorage._onEnabledStateChangedObservable.notifyObservers(value);
        this._syncParentEnabledState();
    }
    /**
     * Is this node a descendant of the given node?
     * The function will iterate up the hierarchy until the ancestor was found or no more parents defined
     * @param ancestor defines the parent node to inspect
     * @returns a boolean indicating if this node is a descendant of the given node
     */
    isDescendantOf(ancestor) {
        if (this.parent) {
            if (this.parent === ancestor) {
                return true;
            }
            return this.parent.isDescendantOf(ancestor);
        }
        return false;
    }
    /**
     * @param results
     * @param directDescendantsOnly
     * @param predicate
     * @hidden
     */
    _getDescendants(results, directDescendantsOnly = false, predicate) {
        if (!this._children) {
            return;
        }
        for (let index = 0; index < this._children.length; index++) {
            const item = this._children[index];
            if (!predicate || predicate(item)) {
                results.push(item);
            }
            if (!directDescendantsOnly) {
                item._getDescendants(results, false, predicate);
            }
        }
    }
    /**
     * Will return all nodes that have this node as ascendant
     * @param directDescendantsOnly defines if true only direct descendants of 'this' will be considered, if false direct and also indirect (children of children, an so on in a recursive manner) descendants of 'this' will be considered
     * @param predicate defines an optional predicate that will be called on every evaluated child, the predicate must return true for a given child to be part of the result, otherwise it will be ignored
     * @return all children nodes of all types
     */
    getDescendants(directDescendantsOnly, predicate) {
        const results = new Array();
        this._getDescendants(results, directDescendantsOnly, predicate);
        return results;
    }
    /**
     * Get all child-meshes of this node
     * @param directDescendantsOnly defines if true only direct descendants of 'this' will be considered, if false direct and also indirect (children of children, an so on in a recursive manner) descendants of 'this' will be considered (Default: false)
     * @param predicate defines an optional predicate that will be called on every evaluated child, the predicate must return true for a given child to be part of the result, otherwise it will be ignored
     * @returns an array of AbstractMesh
     */
    getChildMeshes(directDescendantsOnly, predicate) {
        const results = [];
        this._getDescendants(results, directDescendantsOnly, (node) => {
            return (!predicate || predicate(node)) && node.cullingStrategy !== undefined;
        });
        return results;
    }
    /**
     * Get all direct children of this node
     * @param predicate defines an optional predicate that will be called on every evaluated child, the predicate must return true for a given child to be part of the result, otherwise it will be ignored
     * @param directDescendantsOnly defines if true only direct descendants of 'this' will be considered, if false direct and also indirect (children of children, an so on in a recursive manner) descendants of 'this' will be considered (Default: true)
     * @returns an array of Node
     */
    getChildren(predicate, directDescendantsOnly = true) {
        return this.getDescendants(directDescendantsOnly, predicate);
    }
    /**
     * @param state
     * @hidden
     */
    _setReady(state) {
        if (state === this._nodeDataStorage._isReady) {
            return;
        }
        if (!state) {
            this._nodeDataStorage._isReady = false;
            return;
        }
        if (this.onReady) {
            this.onReady(this);
        }
        this._nodeDataStorage._isReady = true;
    }
    /**
     * Get an animation by name
     * @param name defines the name of the animation to look for
     * @returns null if not found else the requested animation
     */
    getAnimationByName(name) {
        for (let i = 0; i < this.animations.length; i++) {
            const animation = this.animations[i];
            if (animation.name === name) {
                return animation;
            }
        }
        return null;
    }
    /**
     * Creates an animation range for this node
     * @param name defines the name of the range
     * @param from defines the starting key
     * @param to defines the end key
     */
    createAnimationRange(name, from, to) {
        // check name not already in use
        if (!this._ranges[name]) {
            this._ranges[name] = Node._AnimationRangeFactory(name, from, to);
            for (let i = 0, nAnimations = this.animations.length; i < nAnimations; i++) {
                if (this.animations[i]) {
                    this.animations[i].createRange(name, from, to);
                }
            }
        }
    }
    /**
     * Delete a specific animation range
     * @param name defines the name of the range to delete
     * @param deleteFrames defines if animation frames from the range must be deleted as well
     */
    deleteAnimationRange(name, deleteFrames = true) {
        for (let i = 0, nAnimations = this.animations.length; i < nAnimations; i++) {
            if (this.animations[i]) {
                this.animations[i].deleteRange(name, deleteFrames);
            }
        }
        this._ranges[name] = null; // said much faster than 'delete this._range[name]'
    }
    /**
     * Get an animation range by name
     * @param name defines the name of the animation range to look for
     * @returns null if not found else the requested animation range
     */
    getAnimationRange(name) {
        return this._ranges[name] || null;
    }
    /**
     * Gets the list of all animation ranges defined on this node
     * @returns an array
     */
    getAnimationRanges() {
        const animationRanges = [];
        let name;
        for (name in this._ranges) {
            animationRanges.push(this._ranges[name]);
        }
        return animationRanges;
    }
    /**
     * Will start the animation sequence
     * @param name defines the range frames for animation sequence
     * @param loop defines if the animation should loop (false by default)
     * @param speedRatio defines the speed factor in which to run the animation (1 by default)
     * @param onAnimationEnd defines a function to be executed when the animation ended (undefined by default)
     * @returns the object created for this animation. If range does not exist, it will return null
     */
    beginAnimation(name, loop, speedRatio, onAnimationEnd) {
        const range = this.getAnimationRange(name);
        if (!range) {
            return null;
        }
        return this._scene.beginAnimation(this, range.from, range.to, loop, speedRatio, onAnimationEnd);
    }
    /**
     * Serialize animation ranges into a JSON compatible object
     * @returns serialization object
     */
    serializeAnimationRanges() {
        const serializationRanges = [];
        for (const name in this._ranges) {
            const localRange = this._ranges[name];
            if (!localRange) {
                continue;
            }
            const range = {};
            range.name = name;
            range.from = localRange.from;
            range.to = localRange.to;
            serializationRanges.push(range);
        }
        return serializationRanges;
    }
    /**
     * Computes the world matrix of the node
     * @param force defines if the cache version should be invalidated forcing the world matrix to be created from scratch
     * @returns the world matrix
     */
    computeWorldMatrix(force) {
        if (!this._worldMatrix) {
            this._worldMatrix = Matrix.Identity();
        }
        return this._worldMatrix;
    }
    /**
     * Releases resources associated with this node.
     * @param doNotRecurse Set to true to not recurse into each children (recurse into each children by default)
     * @param disposeMaterialAndTextures Set to true to also dispose referenced materials and textures (false by default)
     */
    dispose(doNotRecurse, disposeMaterialAndTextures = false) {
        this._nodeDataStorage._isDisposed = true;
        if (!doNotRecurse) {
            const nodes = this.getDescendants(true);
            for (const node of nodes) {
                node.dispose(doNotRecurse, disposeMaterialAndTextures);
            }
        }
        if (!this.parent) {
            this._removeFromSceneRootNodes();
        }
        else {
            this.parent = null;
        }
        // Callback
        this.onDisposeObservable.notifyObservers(this);
        this.onDisposeObservable.clear();
        this.onEnabledStateChangedObservable.clear();
        this.onClonedObservable.clear();
        // Behaviors
        for (const behavior of this._behaviors) {
            behavior.detach();
        }
        this._behaviors = [];
        this.metadata = null;
    }
    /**
     * Parse animation range data from a serialization object and store them into a given node
     * @param node defines where to store the animation ranges
     * @param parsedNode defines the serialization object to read data from
     * @param scene defines the hosting scene
     */
    static ParseAnimationRanges(node, parsedNode, scene) {
        if (parsedNode.ranges) {
            for (let index = 0; index < parsedNode.ranges.length; index++) {
                const data = parsedNode.ranges[index];
                node.createAnimationRange(data.name, data.from, data.to);
            }
        }
    }
    /**
     * Return the minimum and maximum world vectors of the entire hierarchy under current node
     * @param includeDescendants Include bounding info from descendants as well (true by default)
     * @param predicate defines a callback function that can be customize to filter what meshes should be included in the list used to compute the bounding vectors
     * @returns the new bounding vectors
     */
    getHierarchyBoundingVectors(includeDescendants = true, predicate = null) {
        // Ensures that all world matrix will be recomputed.
        this.getScene().incrementRenderId();
        this.computeWorldMatrix(true);
        let min;
        let max;
        const thisAbstractMesh = this;
        if (thisAbstractMesh.getBoundingInfo && thisAbstractMesh.subMeshes) {
            // If this is an abstract mesh get its bounding info
            const boundingInfo = thisAbstractMesh.getBoundingInfo();
            min = boundingInfo.boundingBox.minimumWorld.clone();
            max = boundingInfo.boundingBox.maximumWorld.clone();
        }
        else {
            min = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            max = new Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        }
        if (includeDescendants) {
            const descendants = this.getDescendants(false);
            for (const descendant of descendants) {
                const childMesh = descendant;
                childMesh.computeWorldMatrix(true);
                // Filters meshes based on custom predicate function.
                if (predicate && !predicate(childMesh)) {
                    continue;
                }
                //make sure we have the needed params to get mix and max
                if (!childMesh.getBoundingInfo || childMesh.getTotalVertices() === 0) {
                    continue;
                }
                const childBoundingInfo = childMesh.getBoundingInfo();
                const boundingBox = childBoundingInfo.boundingBox;
                const minBox = boundingBox.minimumWorld;
                const maxBox = boundingBox.maximumWorld;
                Vector3.CheckExtends(minBox, min, max);
                Vector3.CheckExtends(maxBox, min, max);
            }
        }
        return {
            min: min,
            max: max,
        };
    }
}
/**
 * @param name
 * @param from
 * @param to
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
Node._AnimationRangeFactory = (name, from, to) => {
    throw _WarnImport("AnimationRange");
};
Node._NodeConstructors = {};
__decorate([
    serialize()
], Node.prototype, "name", void 0);
__decorate([
    serialize()
], Node.prototype, "id", void 0);
__decorate([
    serialize()
], Node.prototype, "uniqueId", void 0);
__decorate([
    serialize()
], Node.prototype, "state", void 0);
__decorate([
    serialize()
], Node.prototype, "metadata", void 0);
//# sourceMappingURL=node.js.map