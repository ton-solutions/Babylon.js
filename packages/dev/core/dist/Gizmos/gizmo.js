import { Quaternion, Vector3, Matrix } from "../Maths/math.vector";
import { Mesh } from "../Meshes/mesh";
import { UtilityLayerRenderer } from "../Rendering/utilityLayerRenderer";
import { PointerEventTypes } from "../Events/pointerEvents";
import { Light } from "../Lights/light";
/**
 * Renders gizmos on top of an existing scene which provide controls for position, rotation, etc.
 */
export class Gizmo {
    /**
     * Creates a gizmo
     * @param gizmoLayer The utility layer the gizmo will be added to
     */
    constructor(
    /** The utility layer the gizmo will be added to */
    gizmoLayer = UtilityLayerRenderer.DefaultUtilityLayer) {
        this.gizmoLayer = gizmoLayer;
        this._attachedMesh = null;
        this._attachedNode = null;
        this._customRotationQuaternion = null;
        /**
         * Ratio for the scale of the gizmo (Default: 1)
         */
        this._scaleRatio = 1;
        /**
         * boolean updated by pointermove when a gizmo mesh is hovered
         */
        this._isHovered = false;
        /**
         * If a custom mesh has been set (Default: false)
         */
        this._customMeshSet = false;
        this._updateGizmoRotationToMatchAttachedMesh = true;
        /**
         * If set the gizmo's position will be updated to match the attached mesh each frame (Default: true)
         */
        this.updateGizmoPositionToMatchAttachedMesh = true;
        /**
         * When set, the gizmo will always appear the same size no matter where the camera is (default: true)
         */
        this.updateScale = true;
        this._interactionsEnabled = true;
        this._tempQuaternion = new Quaternion(0, 0, 0, 1);
        this._tempVector = new Vector3();
        this._tempVector2 = new Vector3();
        this._tempMatrix1 = new Matrix();
        this._tempMatrix2 = new Matrix();
        this._rightHandtoLeftHandMatrix = Matrix.RotationY(Math.PI);
        this._rootMesh = new Mesh("gizmoRootNode", gizmoLayer.utilityLayerScene);
        this._rootMesh.rotationQuaternion = Quaternion.Identity();
        this._beforeRenderObserver = this.gizmoLayer.utilityLayerScene.onBeforeRenderObservable.add(() => {
            this._update();
        });
    }
    /**
     * Ratio for the scale of the gizmo (Default: 1)
     */
    set scaleRatio(value) {
        this._scaleRatio = value;
    }
    get scaleRatio() {
        return this._scaleRatio;
    }
    /**
     * True when the mouse pointer is hovered a gizmo mesh
     */
    get isHovered() {
        return this._isHovered;
    }
    /**
     * Mesh that the gizmo will be attached to. (eg. on a drag gizmo the mesh that will be dragged)
     * * When set, interactions will be enabled
     */
    get attachedMesh() {
        return this._attachedMesh;
    }
    set attachedMesh(value) {
        this._attachedMesh = value;
        if (value) {
            this._attachedNode = value;
        }
        this._rootMesh.setEnabled(value ? true : false);
        this._attachedNodeChanged(value);
    }
    /**
     * Node that the gizmo will be attached to. (eg. on a drag gizmo the mesh, bone or NodeTransform that will be dragged)
     * * When set, interactions will be enabled
     */
    get attachedNode() {
        return this._attachedNode;
    }
    set attachedNode(value) {
        this._attachedNode = value;
        this._attachedMesh = null;
        this._rootMesh.setEnabled(value ? true : false);
        this._attachedNodeChanged(value);
    }
    /**
     * Disposes and replaces the current meshes in the gizmo with the specified mesh
     * @param mesh The mesh to replace the default mesh of the gizmo
     */
    setCustomMesh(mesh) {
        if (mesh.getScene() != this.gizmoLayer.utilityLayerScene) {
            throw "When setting a custom mesh on a gizmo, the custom meshes scene must be the same as the gizmos (eg. gizmo.gizmoLayer.utilityLayerScene)";
        }
        this._rootMesh.getChildMeshes().forEach((c) => {
            c.dispose();
        });
        mesh.parent = this._rootMesh;
        this._customMeshSet = true;
    }
    /**
     * If set the gizmo's rotation will be updated to match the attached mesh each frame (Default: true)
     */
    set updateGizmoRotationToMatchAttachedMesh(value) {
        this._updateGizmoRotationToMatchAttachedMesh = value;
    }
    get updateGizmoRotationToMatchAttachedMesh() {
        return this._updateGizmoRotationToMatchAttachedMesh;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _attachedNodeChanged(value) { }
    /**
     * posture that the gizmo will be display
     * When set null, default value will be used (Quaternion(0, 0, 0, 1))
     */
    get customRotationQuaternion() {
        return this._customRotationQuaternion;
    }
    set customRotationQuaternion(customRotationQuaternion) {
        this._customRotationQuaternion = customRotationQuaternion;
    }
    /**
     * Updates the gizmo to match the attached mesh's position/rotation
     */
    _update() {
        if (this.attachedNode) {
            let effectiveNode = this.attachedNode;
            if (this.attachedMesh) {
                effectiveNode = this.attachedMesh || this.attachedNode;
            }
            // Position
            if (this.updateGizmoPositionToMatchAttachedMesh) {
                const row = effectiveNode.getWorldMatrix().getRow(3);
                const position = row ? row.toVector3() : new Vector3(0, 0, 0);
                this._rootMesh.position.copyFrom(position);
            }
            // Rotation
            if (this.updateGizmoRotationToMatchAttachedMesh) {
                const transformNode = effectiveNode._isMesh ? effectiveNode : undefined;
                effectiveNode.getWorldMatrix().decompose(undefined, this._rootMesh.rotationQuaternion, undefined, Gizmo.PreserveScaling ? transformNode : undefined);
            }
            else {
                if (this._customRotationQuaternion) {
                    this._rootMesh.rotationQuaternion.copyFrom(this._customRotationQuaternion);
                }
                else {
                    this._rootMesh.rotationQuaternion.set(0, 0, 0, 1);
                }
            }
            // Scale
            if (this.updateScale) {
                const activeCamera = this.gizmoLayer.utilityLayerScene.activeCamera;
                let cameraPosition = activeCamera.globalPosition;
                if (activeCamera.devicePosition) {
                    cameraPosition = activeCamera.devicePosition;
                }
                this._rootMesh.position.subtractToRef(cameraPosition, this._tempVector);
                const dist = this._tempVector.length() * this.scaleRatio;
                this._rootMesh.scaling.set(dist, dist, dist);
                // Account for handedness, similar to Matrix.decompose
                if (effectiveNode._getWorldMatrixDeterminant() < 0 && !Gizmo.PreserveScaling) {
                    this._rootMesh.scaling.y *= -1;
                }
            }
            else {
                this._rootMesh.scaling.setAll(this.scaleRatio);
            }
        }
    }
    /**
     * Handle position/translation when using an attached node using pivot
     */
    _handlePivot() {
        const attachedNodeTransform = this._attachedNode;
        // check there is an active pivot for the TransformNode attached
        if (attachedNodeTransform.isUsingPivotMatrix && attachedNodeTransform.isUsingPivotMatrix() && attachedNodeTransform.position) {
            // When a TransformNode has an active pivot, even without parenting,
            // translation from the world matrix is different from TransformNode.position.
            // Pivot works like a virtual parent that's using the node orientation.
            // As the world matrix is transformed by the gizmo and then decomposed to TRS
            // its translation part must be set to the Node's position.
            attachedNodeTransform.getWorldMatrix().setTranslation(attachedNodeTransform.position);
        }
    }
    /**
     * computes the rotation/scaling/position of the transform once the Node world matrix has changed.
     */
    _matrixChanged() {
        if (!this._attachedNode) {
            return;
        }
        if (this._attachedNode._isCamera) {
            const camera = this._attachedNode;
            let worldMatrix;
            let worldMatrixUC;
            if (camera.parent) {
                const parentInv = this._tempMatrix2;
                camera.parent._worldMatrix.invertToRef(parentInv);
                this._attachedNode._worldMatrix.multiplyToRef(parentInv, this._tempMatrix1);
                worldMatrix = this._tempMatrix1;
            }
            else {
                worldMatrix = this._attachedNode._worldMatrix;
            }
            if (camera.getScene().useRightHandedSystem) {
                // avoid desync with RH matrix computation. Otherwise, rotation of PI around Y axis happens each frame resulting in axis flipped because worldMatrix is computed as inverse of viewMatrix.
                this._rightHandtoLeftHandMatrix.multiplyToRef(worldMatrix, this._tempMatrix2);
                worldMatrixUC = this._tempMatrix2;
            }
            else {
                worldMatrixUC = worldMatrix;
            }
            worldMatrixUC.decompose(this._tempVector2, this._tempQuaternion, this._tempVector);
            const inheritsTargetCamera = this._attachedNode.getClassName() === "FreeCamera" ||
                this._attachedNode.getClassName() === "FlyCamera" ||
                this._attachedNode.getClassName() === "ArcFollowCamera" ||
                this._attachedNode.getClassName() === "TargetCamera" ||
                this._attachedNode.getClassName() === "TouchCamera" ||
                this._attachedNode.getClassName() === "UniversalCamera";
            if (inheritsTargetCamera) {
                const targetCamera = this._attachedNode;
                targetCamera.rotation = this._tempQuaternion.toEulerAngles();
                if (targetCamera.rotationQuaternion) {
                    targetCamera.rotationQuaternion.copyFrom(this._tempQuaternion);
                    targetCamera.rotationQuaternion.normalize();
                }
            }
            camera.position.copyFrom(this._tempVector);
        }
        else if (this._attachedNode._isMesh ||
            this._attachedNode.getClassName() === "AbstractMesh" ||
            this._attachedNode.getClassName() === "TransformNode" ||
            this._attachedNode.getClassName() === "InstancedMesh") {
            const transform = this._attachedNode;
            if (transform.parent) {
                const parentInv = this._tempMatrix1;
                const localMat = this._tempMatrix2;
                transform.parent.getWorldMatrix().invertToRef(parentInv);
                this._attachedNode.getWorldMatrix().multiplyToRef(parentInv, localMat);
                localMat.decompose(this._tempVector, this._tempQuaternion, transform.position, Gizmo.PreserveScaling ? transform : undefined);
            }
            else {
                this._attachedNode._worldMatrix.decompose(this._tempVector, this._tempQuaternion, transform.position, Gizmo.PreserveScaling ? transform : undefined);
            }
            transform.scaling.copyFrom(this._tempVector);
            if (!transform.billboardMode) {
                if (transform.rotationQuaternion) {
                    transform.rotationQuaternion.copyFrom(this._tempQuaternion);
                    transform.rotationQuaternion.normalize();
                }
                else {
                    transform.rotation = this._tempQuaternion.toEulerAngles();
                }
            }
        }
        else if (this._attachedNode.getClassName() === "Bone") {
            const bone = this._attachedNode;
            const parent = bone.getParent();
            if (parent) {
                const invParent = this._tempMatrix1;
                const boneLocalMatrix = this._tempMatrix2;
                parent.getWorldMatrix().invertToRef(invParent);
                bone.getWorldMatrix().multiplyToRef(invParent, boneLocalMatrix);
                const lmat = bone.getLocalMatrix();
                lmat.copyFrom(boneLocalMatrix);
            }
            else {
                const lmat = bone.getLocalMatrix();
                lmat.copyFrom(bone.getWorldMatrix());
            }
            bone.markAsDirty();
        }
        else {
            const light = this._attachedNode;
            if (light.getTypeID) {
                const type = light.getTypeID();
                if (type === Light.LIGHTTYPEID_DIRECTIONALLIGHT || type === Light.LIGHTTYPEID_SPOTLIGHT || type === Light.LIGHTTYPEID_POINTLIGHT) {
                    const parent = light.parent;
                    if (parent) {
                        const invParent = this._tempMatrix1;
                        const nodeLocalMatrix = this._tempMatrix2;
                        parent.getWorldMatrix().invertToRef(invParent);
                        light.getWorldMatrix().multiplyToRef(invParent, nodeLocalMatrix);
                        nodeLocalMatrix.decompose(undefined, this._tempQuaternion, this._tempVector);
                    }
                    else {
                        this._attachedNode._worldMatrix.decompose(undefined, this._tempQuaternion, this._tempVector);
                    }
                    // setter doesn't copy values. Need a new Vector3
                    light.position = new Vector3(this._tempVector.x, this._tempVector.y, this._tempVector.z);
                    light.direction = new Vector3(light.direction.x, light.direction.y, light.direction.z);
                }
            }
        }
    }
    /**
     * refresh gizmo mesh material
     * @param gizmoMeshes
     * @param material material to apply
     */
    _setGizmoMeshMaterial(gizmoMeshes, material) {
        if (gizmoMeshes) {
            gizmoMeshes.forEach((m) => {
                m.material = material;
                if (m.color) {
                    m.color = material.diffuseColor;
                }
            });
        }
    }
    /**
     * Subscribes to pointer up, down, and hover events. Used for responsive gizmos.
     * @param gizmoLayer The utility layer the gizmo will be added to
     * @param gizmoAxisCache Gizmo axis definition used for reactive gizmo UI
     * @returns {Observer<PointerInfo>} pointerObserver
     */
    static GizmoAxisPointerObserver(gizmoLayer, gizmoAxisCache) {
        let dragging = false;
        const pointerObserver = gizmoLayer.utilityLayerScene.onPointerObservable.add((pointerInfo) => {
            var _a, _b;
            if (pointerInfo.pickInfo) {
                // On Hover Logic
                if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
                    if (dragging) {
                        return;
                    }
                    gizmoAxisCache.forEach((cache) => {
                        var _a, _b;
                        if (cache.colliderMeshes && cache.gizmoMeshes) {
                            const isHovered = ((_a = cache.colliderMeshes) === null || _a === void 0 ? void 0 : _a.indexOf((_b = pointerInfo === null || pointerInfo === void 0 ? void 0 : pointerInfo.pickInfo) === null || _b === void 0 ? void 0 : _b.pickedMesh)) != -1;
                            const material = cache.dragBehavior.enabled ? (isHovered || cache.active ? cache.hoverMaterial : cache.material) : cache.disableMaterial;
                            cache.gizmoMeshes.forEach((m) => {
                                m.material = material;
                                if (m.color) {
                                    m.color = material.diffuseColor;
                                }
                            });
                        }
                    });
                }
                // On Mouse Down
                if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
                    // If user Clicked Gizmo
                    if (gizmoAxisCache.has((_a = pointerInfo.pickInfo.pickedMesh) === null || _a === void 0 ? void 0 : _a.parent)) {
                        dragging = true;
                        const statusMap = gizmoAxisCache.get((_b = pointerInfo.pickInfo.pickedMesh) === null || _b === void 0 ? void 0 : _b.parent);
                        statusMap.active = true;
                        gizmoAxisCache.forEach((cache) => {
                            var _a, _b;
                            const isHovered = ((_a = cache.colliderMeshes) === null || _a === void 0 ? void 0 : _a.indexOf((_b = pointerInfo === null || pointerInfo === void 0 ? void 0 : pointerInfo.pickInfo) === null || _b === void 0 ? void 0 : _b.pickedMesh)) != -1;
                            const material = (isHovered || cache.active) && cache.dragBehavior.enabled ? cache.hoverMaterial : cache.disableMaterial;
                            cache.gizmoMeshes.forEach((m) => {
                                m.material = material;
                                if (m.color) {
                                    m.color = material.diffuseColor;
                                }
                            });
                        });
                    }
                }
                // On Mouse Up
                if (pointerInfo.type === PointerEventTypes.POINTERUP) {
                    gizmoAxisCache.forEach((cache) => {
                        cache.active = false;
                        dragging = false;
                        cache.gizmoMeshes.forEach((m) => {
                            m.material = cache.dragBehavior.enabled ? cache.material : cache.disableMaterial;
                            if (m.color) {
                                m.color = cache.material.diffuseColor;
                            }
                        });
                    });
                }
            }
        });
        return pointerObserver;
    }
    /**
     * Disposes of the gizmo
     */
    dispose() {
        this._rootMesh.dispose();
        if (this._beforeRenderObserver) {
            this.gizmoLayer.utilityLayerScene.onBeforeRenderObservable.remove(this._beforeRenderObserver);
        }
    }
}
/**
 * When enabled, any gizmo operation will perserve scaling sign. Default is off.
 * Only valid for TransformNode derived classes (Mesh, AbstractMesh, ...)
 */
Gizmo.PreserveScaling = false;
//# sourceMappingURL=gizmo.js.map