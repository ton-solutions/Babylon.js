import { Observable } from "../Misc/observable";
import type { IAnimatable } from "../Animations/animatable.interface";
import type { Nullable, FloatArray, IndicesArray } from "../types";
import type { Camera } from "../Cameras/camera";
import type { Scene } from "../scene";
import { Matrix, Vector3, Vector2 } from "../Maths/math.vector";
import type { Engine } from "../Engines/engine";
import { Node } from "../node";
import { VertexBuffer, Buffer } from "../Buffers/buffer";
import type { IGetSetVerticesData } from "./mesh.vertexData";
import { Geometry } from "./geometry";
import { AbstractMesh } from "./abstractMesh";
import { SubMesh } from "./subMesh";
import type { BoundingSphere } from "../Culling/boundingSphere";
import type { Effect } from "../Materials/effect";
import { Material } from "../Materials/material";
import type { Skeleton } from "../Bones/skeleton";
import { MeshLODLevel } from "./meshLODLevel";
import type { Path3D } from "../Maths/math.path";
import type { Plane } from "../Maths/math.plane";
import type { TransformNode } from "./transformNode";
declare type GoldbergMesh = import("./goldbergMesh").GoldbergMesh;
declare type InstancedMesh = import("./instancedMesh").InstancedMesh;
declare type IPhysicsEnabledObject = import("../Physics/physicsImpostor").IPhysicsEnabledObject;
declare type PhysicsImpostor = import("../Physics/physicsImpostor").PhysicsImpostor;
/**
 * @hidden
 **/
export declare class _CreationDataStorage {
    closePath?: boolean;
    closeArray?: boolean;
    idx: number[];
    dashSize: number;
    gapSize: number;
    path3D: Path3D;
    pathArray: Vector3[][];
    arc: number;
    radius: number;
    cap: number;
    tessellation: number;
}
/**
 * @hidden
 **/
declare class _InstanceDataStorage {
    visibleInstances: any;
    batchCache: _InstancesBatch;
    batchCacheReplacementModeInFrozenMode: _InstancesBatch;
    instancesBufferSize: number;
    instancesBuffer: Nullable<Buffer>;
    instancesPreviousBuffer: Nullable<Buffer>;
    instancesData: Float32Array;
    instancesPreviousData: Float32Array;
    overridenInstanceCount: number;
    isFrozen: boolean;
    previousBatch: Nullable<_InstancesBatch>;
    hardwareInstancedRendering: boolean;
    sideOrientation: number;
    manualUpdate: boolean;
    previousManualUpdate: boolean;
    previousRenderId: number;
    masterMeshPreviousWorldMatrix: Nullable<Matrix>;
}
/**
 * @hidden
 **/
export declare class _InstancesBatch {
    mustReturn: boolean;
    visibleInstances: Nullable<import("./instancedMesh").InstancedMesh[]>[];
    renderSelf: boolean[];
    hardwareInstancedRendering: boolean[];
}
/**
 * @hidden
 **/
declare class _ThinInstanceDataStorage {
    instancesCount: number;
    matrixBuffer: Nullable<Buffer>;
    previousMatrixBuffer: Nullable<Buffer>;
    matrixBufferSize: number;
    matrixData: Nullable<Float32Array>;
    previousMatrixData: Nullable<Float32Array>;
    boundingVectors: Array<Vector3>;
    worldMatrices: Nullable<Matrix[]>;
    masterMeshPreviousWorldMatrix: Nullable<Matrix>;
}
/**
 * Class used to represent renderable models
 */
export declare class Mesh extends AbstractMesh implements IGetSetVerticesData {
    /**
     * Mesh side orientation : usually the external or front surface
     */
    static readonly FRONTSIDE = 0;
    /**
     * Mesh side orientation : usually the internal or back surface
     */
    static readonly BACKSIDE = 1;
    /**
     * Mesh side orientation : both internal and external or front and back surfaces
     */
    static readonly DOUBLESIDE = 2;
    /**
     * Mesh side orientation : by default, `FRONTSIDE`
     */
    static readonly DEFAULTSIDE = 0;
    /**
     * Mesh cap setting : no cap
     */
    static readonly NO_CAP = 0;
    /**
     * Mesh cap setting : one cap at the beginning of the mesh
     */
    static readonly CAP_START = 1;
    /**
     * Mesh cap setting : one cap at the end of the mesh
     */
    static readonly CAP_END = 2;
    /**
     * Mesh cap setting : two caps, one at the beginning  and one at the end of the mesh
     */
    static readonly CAP_ALL = 3;
    /**
     * Mesh pattern setting : no flip or rotate
     */
    static readonly NO_FLIP = 0;
    /**
     * Mesh pattern setting : flip (reflect in y axis) alternate tiles on each row or column
     */
    static readonly FLIP_TILE = 1;
    /**
     * Mesh pattern setting : rotate (180degs) alternate tiles on each row or column
     */
    static readonly ROTATE_TILE = 2;
    /**
     * Mesh pattern setting : flip (reflect in y axis) all tiles on alternate rows
     */
    static readonly FLIP_ROW = 3;
    /**
     * Mesh pattern setting : rotate (180degs) all tiles on alternate rows
     */
    static readonly ROTATE_ROW = 4;
    /**
     * Mesh pattern setting : flip and rotate alternate tiles on each row or column
     */
    static readonly FLIP_N_ROTATE_TILE = 5;
    /**
     * Mesh pattern setting : rotate pattern and rotate
     */
    static readonly FLIP_N_ROTATE_ROW = 6;
    /**
     * Mesh tile positioning : part tiles same on left/right or top/bottom
     */
    static readonly CENTER = 0;
    /**
     * Mesh tile positioning : part tiles on left
     */
    static readonly LEFT = 1;
    /**
     * Mesh tile positioning : part tiles on right
     */
    static readonly RIGHT = 2;
    /**
     * Mesh tile positioning : part tiles on top
     */
    static readonly TOP = 3;
    /**
     * Mesh tile positioning : part tiles on bottom
     */
    static readonly BOTTOM = 4;
    /**
     * Indicates that the instanced meshes should be sorted from back to front before rendering if their material is transparent
     */
    static INSTANCEDMESH_SORT_TRANSPARENT: boolean;
    /**
     * Gets the default side orientation.
     * @param orientation the orientation to value to attempt to get
     * @returns the default orientation
     * @hidden
     */
    static _GetDefaultSideOrientation(orientation?: number): number;
    private _internalMeshDataInfo;
    /**
     * Determines if the LOD levels are intended to be calculated using screen coverage (surface area ratio) instead of distance
     */
    get useLODScreenCoverage(): boolean;
    set useLODScreenCoverage(value: boolean);
    /**
     * Will notify when the mesh is completely ready, including materials.
     * Observers added to this observable will be removed once triggered
     */
    onMeshReadyObservable: Observable<Mesh>;
    get computeBonesUsingShaders(): boolean;
    set computeBonesUsingShaders(value: boolean);
    /**
     * An event triggered before rendering the mesh
     */
    get onBeforeRenderObservable(): Observable<Mesh>;
    /**
     * An event triggered before binding the mesh
     */
    get onBeforeBindObservable(): Observable<Mesh>;
    /**
     * An event triggered after rendering the mesh
     */
    get onAfterRenderObservable(): Observable<Mesh>;
    /**
     * An event triggeredbetween rendering pass when using separateCullingPass = true
     */
    get onBetweenPassObservable(): Observable<SubMesh>;
    /**
     * An event triggered before drawing the mesh
     */
    get onBeforeDrawObservable(): Observable<Mesh>;
    private _onBeforeDrawObserver;
    /**
     * Sets a callback to call before drawing the mesh. It is recommended to use onBeforeDrawObservable instead
     */
    set onBeforeDraw(callback: () => void);
    get hasInstances(): boolean;
    get hasThinInstances(): boolean;
    /**
     * Gets the delay loading state of the mesh (when delay loading is turned on)
     * @see https://doc.babylonjs.com/how_to/using_the_incremental_loading_system
     */
    delayLoadState: number;
    /**
     * Gets the list of instances created from this mesh
     * it is not supposed to be modified manually.
     * Note also that the order of the InstancedMesh wihin the array is not significant and might change.
     * @see https://doc.babylonjs.com/how_to/how_to_use_instances
     */
    instances: import("./instancedMesh").InstancedMesh[];
    /**
     * Gets the file containing delay loading data for this mesh
     */
    delayLoadingFile: string;
    /** @hidden */
    _binaryInfo: any;
    /**
     * User defined function used to change how LOD level selection is done
     * @see https://doc.babylonjs.com/how_to/how_to_use_lod
     */
    onLODLevelSelection: (distance: number, mesh: Mesh, selectedLevel: Nullable<Mesh>) => void;
    /** @hidden */
    _creationDataStorage: Nullable<_CreationDataStorage>;
    /** @hidden */
    _geometry: Nullable<Geometry>;
    /** @hidden */
    _delayInfo: Array<string>;
    /** @hidden */
    _delayLoadingFunction: (any: any, mesh: Mesh) => void;
    /**
     * Gets or sets the forced number of instances to display.
     * If 0 (default value), the number of instances is not forced and depends on the draw type
     * (regular / instance / thin instances mesh)
     */
    get forcedInstanceCount(): number;
    set forcedInstanceCount(count: number);
    /** @hidden */
    _instanceDataStorage: _InstanceDataStorage;
    /** @hidden */
    _thinInstanceDataStorage: _ThinInstanceDataStorage;
    /** @hidden */
    _shouldGenerateFlatShading: boolean;
    /** @hidden */
    _originalBuilderSideOrientation: number;
    /**
     * Use this property to change the original side orientation defined at construction time
     */
    overrideMaterialSideOrientation: Nullable<number>;
    /**
     * Gets or sets a boolean indicating whether to render ignoring the active camera's max z setting. (false by default)
     * Note this will reduce performance when set to true.
     */
    ignoreCameraMaxZ: boolean;
    /**
     * Gets the source mesh (the one used to clone this one from)
     */
    get source(): Nullable<Mesh>;
    /**
     * Gets the list of clones of this mesh
     * The scene must have been constructed with useClonedMeshMap=true for this to work!
     * Note that useClonedMeshMap=true is the default setting
     */
    get cloneMeshMap(): Nullable<{
        [id: string]: Mesh | undefined;
    }>;
    /**
     * Gets or sets a boolean indicating that this mesh does not use index buffer
     */
    get isUnIndexed(): boolean;
    set isUnIndexed(value: boolean);
    /** Gets the array buffer used to store the instanced buffer used for instances' world matrices */
    get worldMatrixInstancedBuffer(): Float32Array;
    /** Gets the array buffer used to store the instanced buffer used for instances' previous world matrices */
    get previousWorldMatrixInstancedBuffer(): Float32Array;
    /** Gets or sets a boolean indicating that the update of the instance buffer of the world matrices is manual */
    get manualUpdateOfWorldMatrixInstancedBuffer(): boolean;
    set manualUpdateOfWorldMatrixInstancedBuffer(value: boolean);
    /** Gets or sets a boolean indicating that the update of the instance buffer of the world matrices is manual */
    get manualUpdateOfPreviousWorldMatrixInstancedBuffer(): boolean;
    set manualUpdateOfPreviousWorldMatrixInstancedBuffer(value: boolean);
    /**
     * @constructor
     * @param name The value used by scene.getMeshByName() to do a lookup.
     * @param scene The scene to add this mesh to.
     * @param parent The parent of this mesh, if it has one
     * @param source An optional Mesh from which geometry is shared, cloned.
     * @param doNotCloneChildren When cloning, skip cloning child meshes of source, default False.
     *                  When false, achieved by calling a clone(), also passing False.
     *                  This will make creation of children, recursive.
     * @param clonePhysicsImpostor When cloning, include cloning mesh physics impostor, default True.
     */
    constructor(name: string, scene?: Nullable<Scene>, parent?: Nullable<Node>, source?: Nullable<Mesh>, doNotCloneChildren?: boolean, clonePhysicsImpostor?: boolean);
    instantiateHierarchy(newParent?: Nullable<TransformNode>, options?: {
        doNotInstantiate: boolean;
    }, onNewNodeCreated?: (source: TransformNode, clone: TransformNode) => void): Nullable<TransformNode>;
    /**
     * Gets the class name
     * @returns the string "Mesh".
     */
    getClassName(): string;
    /** @hidden */
    get _isMesh(): boolean;
    /**
     * Returns a description of this mesh
     * @param fullDetails define if full details about this mesh must be used
     * @returns a descriptive string representing this mesh
     */
    toString(fullDetails?: boolean): string;
    /** @hidden */
    _unBindEffect(): void;
    /**
     * Gets a boolean indicating if this mesh has LOD
     */
    get hasLODLevels(): boolean;
    /**
     * Gets the list of MeshLODLevel associated with the current mesh
     * @returns an array of MeshLODLevel
     */
    getLODLevels(): MeshLODLevel[];
    private _sortLODLevels;
    /**
     * Add a mesh as LOD level triggered at the given distance.
     * @see https://doc.babylonjs.com/how_to/how_to_use_lod
     * @param distanceOrScreenCoverage Either distance from the center of the object to show this level or the screen coverage if `useScreenCoverage` is set to `true`.
     * If screen coverage, value is a fraction of the screen's total surface, between 0 and 1.
     * @param mesh The mesh to be added as LOD level (can be null)
     * @return This mesh (for chaining)
     */
    addLODLevel(distanceOrScreenCoverage: number, mesh: Nullable<Mesh>): Mesh;
    /**
     * Returns the LOD level mesh at the passed distance or null if not found.
     * @see https://doc.babylonjs.com/how_to/how_to_use_lod
     * @param distance The distance from the center of the object to show this level
     * @returns a Mesh or `null`
     */
    getLODLevelAtDistance(distance: number): Nullable<Mesh>;
    /**
     * Remove a mesh from the LOD array
     * @see https://doc.babylonjs.com/how_to/how_to_use_lod
     * @param mesh defines the mesh to be removed
     * @return This mesh (for chaining)
     */
    removeLODLevel(mesh: Mesh): Mesh;
    /**
     * Returns the registered LOD mesh distant from the parameter `camera` position if any, else returns the current mesh.
     * @see https://doc.babylonjs.com/how_to/how_to_use_lod
     * @param camera defines the camera to use to compute distance
     * @param boundingSphere defines a custom bounding sphere to use instead of the one from this mesh
     * @return This mesh (for chaining)
     */
    getLOD(camera: Camera, boundingSphere?: BoundingSphere): Nullable<AbstractMesh>;
    /**
     * Gets the mesh internal Geometry object
     */
    get geometry(): Nullable<Geometry>;
    /**
     * Returns the total number of vertices within the mesh geometry or zero if the mesh has no geometry.
     * @returns the total number of vertices
     */
    getTotalVertices(): number;
    /**
     * Returns the content of an associated vertex buffer
     * @param kind defines which buffer to read from (positions, indices, normals, etc). Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     * @param copyWhenShared defines a boolean indicating that if the mesh geometry is shared among some other meshes, the returned array is a copy of the internal one
     * @param forceCopy defines a boolean forcing the copy of the buffer no matter what the value of copyWhenShared is
     * @returns a FloatArray or null if the mesh has no geometry or no vertex buffer for this kind.
     */
    getVerticesData(kind: string, copyWhenShared?: boolean, forceCopy?: boolean): Nullable<FloatArray>;
    /**
     * Returns the mesh VertexBuffer object from the requested `kind`
     * @param kind defines which buffer to read from (positions, indices, normals, etc). Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.NormalKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     * @returns a FloatArray or null if the mesh has no vertex buffer for this kind.
     */
    getVertexBuffer(kind: string): Nullable<VertexBuffer>;
    /**
     * Tests if a specific vertex buffer is associated with this mesh
     * @param kind defines which buffer to check (positions, indices, normals, etc). Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.NormalKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     * @returns a boolean
     */
    isVerticesDataPresent(kind: string): boolean;
    /**
     * Returns a boolean defining if the vertex data for the requested `kind` is updatable.
     * @param kind defines which buffer to check (positions, indices, normals, etc). Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     * @returns a boolean
     */
    isVertexBufferUpdatable(kind: string): boolean;
    /**
     * Returns a string which contains the list of existing `kinds` of Vertex Data associated with this mesh.
     * @returns an array of strings
     */
    getVerticesDataKinds(): string[];
    /**
     * Returns a positive integer : the total number of indices in this mesh geometry.
     * @returns the numner of indices or zero if the mesh has no geometry.
     */
    getTotalIndices(): number;
    /**
     * Returns an array of integers or a typed array (Int32Array, Uint32Array, Uint16Array) populated with the mesh indices.
     * @param copyWhenShared If true (default false) and and if the mesh geometry is shared among some other meshes, the returned array is a copy of the internal one.
     * @param forceCopy defines a boolean indicating that the returned array must be cloned upon returning it
     * @returns the indices array or an empty array if the mesh has no geometry
     */
    getIndices(copyWhenShared?: boolean, forceCopy?: boolean): Nullable<IndicesArray>;
    get isBlocked(): boolean;
    /**
     * Determine if the current mesh is ready to be rendered
     * @param completeCheck defines if a complete check (including materials and lights) has to be done (false by default)
     * @param forceInstanceSupport will check if the mesh will be ready when used with instances (false by default)
     * @returns true if all associated assets are ready (material, textures, shaders)
     */
    isReady(completeCheck?: boolean, forceInstanceSupport?: boolean): boolean;
    /**
     * Gets a boolean indicating if the normals aren't to be recomputed on next mesh `positions` array update. This property is pertinent only for updatable parametric shapes.
     */
    get areNormalsFrozen(): boolean;
    /**
     * This function affects parametric shapes on vertex position update only : ribbons, tubes, etc. It has no effect at all on other shapes. It prevents the mesh normals from being recomputed on next `positions` array update.
     * @returns the current mesh
     */
    freezeNormals(): Mesh;
    /**
     * This function affects parametric shapes on vertex position update only : ribbons, tubes, etc. It has no effect at all on other shapes. It reactivates the mesh normals computation if it was previously frozen
     * @returns the current mesh
     */
    unfreezeNormals(): Mesh;
    /**
     * Sets a value overriding the instance count. Only applicable when custom instanced InterleavedVertexBuffer are used rather than InstancedMeshs
     */
    set overridenInstanceCount(count: number);
    /** @hidden */
    _preActivate(): Mesh;
    /**
     * @param renderId
     * @hidden
     */
    _preActivateForIntermediateRendering(renderId: number): Mesh;
    /**
     * @param instance
     * @param renderId
     * @hidden
     */
    _registerInstanceForRenderId(instance: InstancedMesh, renderId: number): Mesh;
    protected _afterComputeWorldMatrix(): void;
    /** @hidden */
    _postActivate(): void;
    /**
     * This method recomputes and sets a new BoundingInfo to the mesh unless it is locked.
     * This means the mesh underlying bounding box and sphere are recomputed.
     * @param applySkeleton defines whether to apply the skeleton before computing the bounding info
     * @param applyMorph  defines whether to apply the morph target before computing the bounding info
     * @returns the current mesh
     */
    refreshBoundingInfo(applySkeleton?: boolean, applyMorph?: boolean): Mesh;
    /**
     * @param force
     * @hidden
     */
    _createGlobalSubMesh(force: boolean): Nullable<SubMesh>;
    /**
     * This function will subdivide the mesh into multiple submeshes
     * @param count defines the expected number of submeshes
     */
    subdivide(count: number): void;
    /**
     * Copy a FloatArray into a specific associated vertex buffer
     * @param kind defines which buffer to write to (positions, indices, normals, etc). Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     * @param data defines the data source
     * @param updatable defines if the updated vertex buffer must be flagged as updatable
     * @param stride defines the data stride size (can be null)
     * @returns the current mesh
     */
    setVerticesData(kind: string, data: FloatArray, updatable?: boolean, stride?: number): AbstractMesh;
    /**
     * Delete a vertex buffer associated with this mesh
     * @param kind defines which buffer to delete (positions, indices, normals, etc). Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     */
    removeVerticesData(kind: string): void;
    /**
     * Flags an associated vertex buffer as updatable
     * @param kind defines which buffer to use (positions, indices, normals, etc). Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     * @param updatable defines if the updated vertex buffer must be flagged as updatable
     */
    markVerticesDataAsUpdatable(kind: string, updatable?: boolean): void;
    /**
     * Sets the mesh global Vertex Buffer
     * @param buffer defines the buffer to use
     * @param disposeExistingBuffer disposes the existing buffer, if any (default: true)
     * @returns the current mesh
     */
    setVerticesBuffer(buffer: VertexBuffer, disposeExistingBuffer?: boolean): Mesh;
    /**
     * Update a specific associated vertex buffer
     * @param kind defines which buffer to write to (positions, indices, normals, etc). Possible `kind` values :
     * - VertexBuffer.PositionKind
     * - VertexBuffer.UVKind
     * - VertexBuffer.UV2Kind
     * - VertexBuffer.UV3Kind
     * - VertexBuffer.UV4Kind
     * - VertexBuffer.UV5Kind
     * - VertexBuffer.UV6Kind
     * - VertexBuffer.ColorKind
     * - VertexBuffer.MatricesIndicesKind
     * - VertexBuffer.MatricesIndicesExtraKind
     * - VertexBuffer.MatricesWeightsKind
     * - VertexBuffer.MatricesWeightsExtraKind
     * @param data defines the data source
     * @param updateExtends defines if extends info of the mesh must be updated (can be null). This is mostly useful for "position" kind
     * @param makeItUnique defines if the geometry associated with the mesh must be cloned to make the change only for this mesh (and not all meshes associated with the same geometry)
     * @returns the current mesh
     */
    updateVerticesData(kind: string, data: FloatArray, updateExtends?: boolean, makeItUnique?: boolean): AbstractMesh;
    /**
     * This method updates the vertex positions of an updatable mesh according to the `positionFunction` returned values.
     * @see https://doc.babylonjs.com/how_to/how_to_dynamically_morph_a_mesh#other-shapes-updatemeshpositions
     * @param positionFunction is a simple JS function what is passed the mesh `positions` array. It doesn't need to return anything
     * @param computeNormals is a boolean (default true) to enable/disable the mesh normal recomputation after the vertex position update
     * @returns the current mesh
     */
    updateMeshPositions(positionFunction: (data: FloatArray) => void, computeNormals?: boolean): Mesh;
    /**
     * Creates a un-shared specific occurence of the geometry for the mesh.
     * @returns the current mesh
     */
    makeGeometryUnique(): Mesh;
    /**
     * Set the index buffer of this mesh
     * @param indices defines the source data
     * @param totalVertices defines the total number of vertices referenced by this index data (can be null)
     * @param updatable defines if the updated index buffer must be flagged as updatable (default is false)
     * @returns the current mesh
     */
    setIndices(indices: IndicesArray, totalVertices?: Nullable<number>, updatable?: boolean): AbstractMesh;
    /**
     * Update the current index buffer
     * @param indices defines the source data
     * @param offset defines the offset in the index buffer where to store the new data (can be null)
     * @param gpuMemoryOnly defines a boolean indicating that only the GPU memory must be updated leaving the CPU version of the indices unchanged (false by default)
     * @returns the current mesh
     */
    updateIndices(indices: IndicesArray, offset?: number, gpuMemoryOnly?: boolean): AbstractMesh;
    /**
     * Invert the geometry to move from a right handed system to a left handed one.
     * @returns the current mesh
     */
    toLeftHanded(): Mesh;
    /**
     * @param subMesh
     * @param effect
     * @param fillMode
     * @hidden
     */
    _bind(subMesh: SubMesh, effect: Effect, fillMode: number): Mesh;
    /**
     * @param subMesh
     * @param fillMode
     * @param instancesCount
     * @hidden
     */
    _draw(subMesh: SubMesh, fillMode: number, instancesCount?: number): Mesh;
    /**
     * Registers for this mesh a javascript function called just before the rendering process
     * @param func defines the function to call before rendering this mesh
     * @returns the current mesh
     */
    registerBeforeRender(func: (mesh: AbstractMesh) => void): Mesh;
    /**
     * Disposes a previously registered javascript function called before the rendering
     * @param func defines the function to remove
     * @returns the current mesh
     */
    unregisterBeforeRender(func: (mesh: AbstractMesh) => void): Mesh;
    /**
     * Registers for this mesh a javascript function called just after the rendering is complete
     * @param func defines the function to call after rendering this mesh
     * @returns the current mesh
     */
    registerAfterRender(func: (mesh: AbstractMesh) => void): Mesh;
    /**
     * Disposes a previously registered javascript function called after the rendering.
     * @param func defines the function to remove
     * @returns the current mesh
     */
    unregisterAfterRender(func: (mesh: AbstractMesh) => void): Mesh;
    /**
     * @param subMeshId
     * @param isReplacementMode
     * @hidden
     */
    _getInstancesRenderList(subMeshId: number, isReplacementMode?: boolean): _InstancesBatch;
    /**
     * @param subMesh
     * @param fillMode
     * @param batch
     * @param effect
     * @param engine
     * @hidden
     */
    _renderWithInstances(subMesh: SubMesh, fillMode: number, batch: _InstancesBatch, effect: Effect, engine: Engine): Mesh;
    /**
     * @param subMesh
     * @param fillMode
     * @param effect
     * @param engine
     * @hidden
     */
    _renderWithThinInstances(subMesh: SubMesh, fillMode: number, effect: Effect, engine: Engine): void;
    /**
     * @param visibleInstances
     * @param renderSelf
     * @hidden
     */
    _processInstancedBuffers(visibleInstances: InstancedMesh[], renderSelf: boolean): void;
    /**
     * @param renderingMesh
     * @param subMesh
     * @param effect
     * @param fillMode
     * @param batch
     * @param hardwareInstancedRendering
     * @param onBeforeDraw
     * @param effectiveMaterial
     * @hidden
     */
    _processRendering(renderingMesh: AbstractMesh, subMesh: SubMesh, effect: Effect, fillMode: number, batch: _InstancesBatch, hardwareInstancedRendering: boolean, onBeforeDraw: (isInstance: boolean, world: Matrix, effectiveMaterial?: Material) => void, effectiveMaterial?: Material): Mesh;
    /**
     * @param dispose
     * @hidden
     */
    _rebuild(dispose?: boolean): void;
    /** @hidden */
    _freeze(): void;
    /** @hidden */
    _unFreeze(): void;
    /**
     * Triggers the draw call for the mesh. Usually, you don't need to call this method by your own because the mesh rendering is handled by the scene rendering manager
     * @param subMesh defines the subMesh to render
     * @param enableAlphaMode defines if alpha mode can be changed
     * @param effectiveMeshReplacement defines an optional mesh used to provide info for the rendering
     * @returns the current mesh
     */
    render(subMesh: SubMesh, enableAlphaMode: boolean, effectiveMeshReplacement?: AbstractMesh): Mesh;
    private _onBeforeDraw;
    /**
     *   Renormalize the mesh and patch it up if there are no weights
     *   Similar to normalization by adding the weights compute the reciprocal and multiply all elements, this wil ensure that everything adds to 1.
     *   However in the case of zero weights then we set just a single influence to 1.
     *   We check in the function for extra's present and if so we use the normalizeSkinWeightsWithExtras rather than the FourWeights version.
     */
    cleanMatrixWeights(): void;
    private _normalizeSkinFourWeights;
    private _normalizeSkinWeightsAndExtra;
    /**
     * ValidateSkinning is used to determine that a mesh has valid skinning data along with skin metrics, if missing weights,
     * or not normalized it is returned as invalid mesh the string can be used for console logs, or on screen messages to let
     * the user know there was an issue with importing the mesh
     * @returns a validation object with skinned, valid and report string
     */
    validateSkinning(): {
        skinned: boolean;
        valid: boolean;
        report: string;
    };
    /** @hidden */
    _checkDelayState(): Mesh;
    private _queueLoad;
    /**
     * Returns `true` if the mesh is within the frustum defined by the passed array of planes.
     * A mesh is in the frustum if its bounding box intersects the frustum
     * @param frustumPlanes defines the frustum to test
     * @returns true if the mesh is in the frustum planes
     */
    isInFrustum(frustumPlanes: Plane[]): boolean;
    /**
     * Sets the mesh material by the material or multiMaterial `id` property
     * @param id is a string identifying the material or the multiMaterial
     * @returns the current mesh
     */
    setMaterialById(id: string): Mesh;
    /**
     * Returns as a new array populated with the mesh material and/or skeleton, if any.
     * @returns an array of IAnimatable
     */
    getAnimatables(): IAnimatable[];
    /**
     * Modifies the mesh geometry according to the passed transformation matrix.
     * This method returns nothing but it really modifies the mesh even if it's originally not set as updatable.
     * The mesh normals are modified using the same transformation.
     * Note that, under the hood, this method sets a new VertexBuffer each call.
     * @param transform defines the transform matrix to use
     * @see https://doc.babylonjs.com/resources/baking_transformations
     * @returns the current mesh
     */
    bakeTransformIntoVertices(transform: Matrix): Mesh;
    /**
     * Modifies the mesh geometry according to its own current World Matrix.
     * The mesh World Matrix is then reset.
     * This method returns nothing but really modifies the mesh even if it's originally not set as updatable.
     * Note that, under the hood, this method sets a new VertexBuffer each call.
     * @see https://doc.babylonjs.com/resources/baking_transformations
     * @param bakeIndependenlyOfChildren indicates whether to preserve all child nodes' World Matrix during baking
     * @returns the current mesh
     */
    bakeCurrentTransformIntoVertices(bakeIndependenlyOfChildren?: boolean): Mesh;
    /** @hidden */
    get _positions(): Nullable<Vector3[]>;
    /** @hidden */
    _resetPointsArrayCache(): Mesh;
    /** @hidden */
    _generatePointsArray(): boolean;
    /**
     * Returns a new Mesh object generated from the current mesh properties.
     * This method must not get confused with createInstance()
     * @param name is a string, the name given to the new mesh
     * @param newParent can be any Node object (default `null`)
     * @param doNotCloneChildren allows/denies the recursive cloning of the original mesh children if any (default `false`)
     * @param clonePhysicsImpostor allows/denies the cloning in the same time of the original mesh `body` used by the physics engine, if any (default `true`)
     * @returns a new mesh
     */
    clone(name?: string, newParent?: Nullable<Node>, doNotCloneChildren?: boolean, clonePhysicsImpostor?: boolean): Mesh;
    /**
     * Releases resources associated with this mesh.
     * @param doNotRecurse Set to true to not recurse into each children (recurse into each children by default)
     * @param disposeMaterialAndTextures Set to true to also dispose referenced materials and textures (false by default)
     */
    dispose(doNotRecurse?: boolean, disposeMaterialAndTextures?: boolean): void;
    /** @hidden */
    _disposeInstanceSpecificData(): void;
    /** @hidden */
    _disposeThinInstanceSpecificData(): void;
    /**
     * Modifies the mesh geometry according to a displacement map.
     * A displacement map is a colored image. Each pixel color value (actually a gradient computed from red, green, blue values) will give the displacement to apply to each mesh vertex.
     * The mesh must be set as updatable. Its internal geometry is directly modified, no new buffer are allocated.
     * @param url is a string, the URL from the image file is to be downloaded.
     * @param minHeight is the lower limit of the displacement.
     * @param maxHeight is the upper limit of the displacement.
     * @param onSuccess is an optional Javascript function to be called just after the mesh is modified. It is passed the modified mesh and must return nothing.
     * @param uvOffset is an optional vector2 used to offset UV.
     * @param uvScale is an optional vector2 used to scale UV.
     * @param forceUpdate defines whether or not to force an update of the generated buffers. This is useful to apply on a deserialized model for instance.
     * @returns the Mesh.
     */
    applyDisplacementMap(url: string, minHeight: number, maxHeight: number, onSuccess?: (mesh: Mesh) => void, uvOffset?: Vector2, uvScale?: Vector2, forceUpdate?: boolean): Mesh;
    /**
     * Modifies the mesh geometry according to a displacementMap buffer.
     * A displacement map is a colored image. Each pixel color value (actually a gradient computed from red, green, blue values) will give the displacement to apply to each mesh vertex.
     * The mesh must be set as updatable. Its internal geometry is directly modified, no new buffer are allocated.
     * @param buffer is a `Uint8Array` buffer containing series of `Uint8` lower than 255, the red, green, blue and alpha values of each successive pixel.
     * @param heightMapWidth is the width of the buffer image.
     * @param heightMapHeight is the height of the buffer image.
     * @param minHeight is the lower limit of the displacement.
     * @param maxHeight is the upper limit of the displacement.
     * @param uvOffset is an optional vector2 used to offset UV.
     * @param uvScale is an optional vector2 used to scale UV.
     * @param forceUpdate defines whether or not to force an update of the generated buffers. This is useful to apply on a deserialized model for instance.
     * @returns the Mesh.
     */
    applyDisplacementMapFromBuffer(buffer: Uint8Array, heightMapWidth: number, heightMapHeight: number, minHeight: number, maxHeight: number, uvOffset?: Vector2, uvScale?: Vector2, forceUpdate?: boolean): Mesh;
    /**
     * Modify the mesh to get a flat shading rendering.
     * This means each mesh facet will then have its own normals. Usually new vertices are added in the mesh geometry to get this result.
     * Warning : the mesh is really modified even if not set originally as updatable and, under the hood, a new VertexBuffer is allocated.
     * @returns current mesh
     */
    convertToFlatShadedMesh(): Mesh;
    /**
     * This method removes all the mesh indices and add new vertices (duplication) in order to unfold facets into buffers.
     * In other words, more vertices, no more indices and a single bigger VBO.
     * The mesh is really modified even if not set originally as updatable. Under the hood, a new VertexBuffer is allocated.
     * @returns current mesh
     */
    convertToUnIndexedMesh(): Mesh;
    /**
     * Inverses facet orientations.
     * Warning : the mesh is really modified even if not set originally as updatable. A new VertexBuffer is created under the hood each call.
     * @param flipNormals will also inverts the normals
     * @returns current mesh
     */
    flipFaces(flipNormals?: boolean): Mesh;
    /**
     * Increase the number of facets and hence vertices in a mesh
     * Vertex normals are interpolated from existing vertex normals
     * Warning : the mesh is really modified even if not set originally as updatable. A new VertexBuffer is created under the hood each call.
     * @param numberPerEdge the number of new vertices to add to each edge of a facet, optional default 1
     */
    increaseVertices(numberPerEdge: number): void;
    /**
     * Force adjacent facets to share vertices and remove any facets that have all vertices in a line
     * This will undo any application of covertToFlatShadedMesh
     * Warning : the mesh is really modified even if not set originally as updatable. A new VertexBuffer is created under the hood each call.
     */
    forceSharedVertices(): void;
    /**
     * @param name
     * @param mesh
     * @hidden
     */
    static _instancedMeshFactory(name: string, mesh: Mesh): InstancedMesh;
    /**
     * @param scene
     * @param physicObject
     * @param jsonObject
     * @hidden
     */
    static _PhysicsImpostorParser(scene: Scene, physicObject: IPhysicsEnabledObject, jsonObject: any): PhysicsImpostor;
    /**
     * Creates a new InstancedMesh object from the mesh model.
     * @see https://doc.babylonjs.com/how_to/how_to_use_instances
     * @param name defines the name of the new instance
     * @returns a new InstancedMesh
     */
    createInstance(name: string): InstancedMesh;
    /**
     * Synchronises all the mesh instance submeshes to the current mesh submeshes, if any.
     * After this call, all the mesh instances have the same submeshes than the current mesh.
     * @returns the current mesh
     */
    synchronizeInstances(): Mesh;
    /**
     * Optimization of the mesh's indices, in case a mesh has duplicated vertices.
     * The function will only reorder the indices and will not remove unused vertices to avoid problems with submeshes.
     * This should be used together with the simplification to avoid disappearing triangles.
     * @param successCallback an optional success callback to be called after the optimization finished.
     * @returns the current mesh
     */
    optimizeIndices(successCallback?: (mesh?: Mesh) => void): Mesh;
    /**
     * Serialize current mesh
     * @param serializationObject defines the object which will receive the serialization data
     */
    serialize(serializationObject: any): void;
    /** @hidden */
    _syncGeometryWithMorphTargetManager(): void;
    /**
     * @param parsedMesh
     * @param scene
     * @hidden
     */
    static _GroundMeshParser: (parsedMesh: any, scene: Scene) => Mesh;
    /**
     * @param parsedMesh
     * @param scene
     * @hidden
     */
    static _GoldbergMeshParser: (parsedMesh: any, scene: Scene) => GoldbergMesh;
    /**
     * @param parsedMesh
     * @param scene
     * @hidden
     */
    static _LinesMeshParser: (parsedMesh: any, scene: Scene) => Mesh;
    /**
     * Returns a new Mesh object parsed from the source provided.
     * @param parsedMesh is the source
     * @param scene defines the hosting scene
     * @param rootUrl is the root URL to prefix the `delayLoadingFile` property with
     * @returns a new Mesh
     */
    static Parse(parsedMesh: any, scene: Scene, rootUrl: string): Mesh;
    /**
     * Prepare internal position array for software CPU skinning
     * @returns original positions used for CPU skinning. Useful for integrating Morphing with skeletons in same mesh
     */
    setPositionsForCPUSkinning(): Nullable<Float32Array>;
    /**
     * Prepare internal normal array for software CPU skinning
     * @returns original normals used for CPU skinning. Useful for integrating Morphing with skeletons in same mesh.
     */
    setNormalsForCPUSkinning(): Nullable<Float32Array>;
    /**
     * Updates the vertex buffer by applying transformation from the bones
     * @param skeleton defines the skeleton to apply to current mesh
     * @returns the current mesh
     */
    applySkeleton(skeleton: Skeleton): Mesh;
    /**
     * Returns an object containing a min and max Vector3 which are the minimum and maximum vectors of each mesh bounding box from the passed array, in the world coordinates
     * @param meshes defines the list of meshes to scan
     * @returns an object `{min:` Vector3`, max:` Vector3`}`
     */
    static MinMax(meshes: AbstractMesh[]): {
        min: Vector3;
        max: Vector3;
    };
    /**
     * Returns the center of the `{min:` Vector3`, max:` Vector3`}` or the center of MinMax vector3 computed from a mesh array
     * @param meshesOrMinMaxVector could be an array of meshes or a `{min:` Vector3`, max:` Vector3`}` object
     * @returns a vector3
     */
    static Center(meshesOrMinMaxVector: {
        min: Vector3;
        max: Vector3;
    } | AbstractMesh[]): Vector3;
    /**
     * Merge the array of meshes into a single mesh for performance reasons.
     * @param meshes defines he vertices source.  They should all be of the same material.  Entries can empty
     * @param disposeSource when true (default), dispose of the vertices from the source meshes
     * @param allow32BitsIndices when the sum of the vertices > 64k, this must be set to true
     * @param meshSubclass when set, vertices inserted into this Mesh.  Meshes can then be merged into a Mesh sub-class.
     * @param subdivideWithSubMeshes when true (false default), subdivide mesh to his subMesh array with meshes source.
     * @param multiMultiMaterials when true (false default), subdivide mesh and accept multiple multi materials, ignores subdivideWithSubMeshes.
     * @returns a new mesh
     */
    static MergeMeshes(meshes: Array<Mesh>, disposeSource?: boolean, allow32BitsIndices?: boolean, meshSubclass?: Mesh, subdivideWithSubMeshes?: boolean, multiMultiMaterials?: boolean): Nullable<Mesh>;
    /**
     * Merge the array of meshes into a single mesh for performance reasons.
     * @param meshes defines he vertices source.  They should all be of the same material.  Entries can empty
     * @param disposeSource when true (default), dispose of the vertices from the source meshes
     * @param allow32BitsIndices when the sum of the vertices > 64k, this must be set to true
     * @param meshSubclass when set, vertices inserted into this Mesh.  Meshes can then be merged into a Mesh sub-class.
     * @param subdivideWithSubMeshes when true (false default), subdivide mesh to his subMesh array with meshes source.
     * @param multiMultiMaterials when true (false default), subdivide mesh and accept multiple multi materials, ignores subdivideWithSubMeshes.
     * @returns a new mesh
     */
    static MergeMeshesAsync(meshes: Array<Mesh>, disposeSource?: boolean, allow32BitsIndices?: boolean, meshSubclass?: Mesh, subdivideWithSubMeshes?: boolean, multiMultiMaterials?: boolean): Promise<any>;
    private static _MergeMeshesCoroutine;
    /**
     * @param instance
     * @hidden
     */
    addInstance(instance: InstancedMesh): void;
    /**
     * @param instance
     * @hidden
     */
    removeInstance(instance: InstancedMesh): void;
    /** @hidden */
    _shouldConvertRHS(): boolean;
}
export {};
