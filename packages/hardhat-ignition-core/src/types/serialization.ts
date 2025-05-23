import type { Artifact } from "./artifact.js";
import type { FutureType } from "./module.js";

/**
 * A serialized bigint.
 *
 * @beta
 */
export interface SerializedBigInt {
  _kind: "bigint";
  value: string;
}

/**
 * The serialized version of BaseArgumentType
 *
 * @beta
 */
export type SerializedBaseArgumentType =
  | number
  | SerializedBigInt
  | string
  | boolean
  | FutureToken
  | SerializedRuntimeValue;

/**
 * The serialized version of ArgumentType
 *
 * @beta
 */
export type SerializedArgumentType =
  | SerializedBaseArgumentType
  | SerializedArgumentType[]
  | { [field: string]: SerializedArgumentType };

/**
 * In serialized form a pointer to a future stored at the top level
 * within the module.
 *
 * @beta
 */
export interface FutureToken {
  futureId: string;
  _kind: "FutureToken";
}

/**
 * In serialized form a pointer to a module stored at the top level
 * within the deployment.
 *
 * @beta
 */
export interface ModuleToken {
  moduleId: string;
  _kind: "ModuleToken";
}

/**
 * The base of the different serialized futures.
 *
 * @beta
 */
export interface BaseSerializedFuture {
  id: string;
  type: FutureType;
  dependencies: Array<FutureToken | ModuleToken>;
  moduleId: string;
}

/**
 * The serialized version of the NamedContractDeploymentFuture.
 *
 * @beta
 */
export interface SerializedNamedContractDeploymentFuture
  extends BaseSerializedFuture {
  type: FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT;
  contractName: string;
  constructorArgs: SerializedArgumentType[];
  libraries: SerializedLibraries;
  value: SerializedBigInt | SerializedModuleParameterRuntimeValue | FutureToken;
  from: string | SerializedAccountRuntimeValue | undefined;
}

/**
 * The serialized version of the ArtifactContractDeploymentFuture.
 *
 * @beta
 */
export interface SerializedArtifactContractDeploymentFuture
  extends BaseSerializedFuture {
  type: FutureType.CONTRACT_DEPLOYMENT;
  contractName: string;
  constructorArgs: SerializedArgumentType[];
  artifact: Artifact;
  libraries: SerializedLibraries;
  value: SerializedBigInt | SerializedModuleParameterRuntimeValue | FutureToken;
  from: string | SerializedAccountRuntimeValue | undefined;
}

/**
 * The serialized version of the NamedLibraryDeploymentFuture.
 *
 * @beta
 */
export interface SerializedNamedLibraryDeploymentFuture
  extends BaseSerializedFuture {
  type: FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT;
  contractName: string;
  libraries: SerializedLibraries;
  from: string | SerializedAccountRuntimeValue | undefined;
}

/**
 * The serialized version of the ArtifactLibraryDeploymentFuture.
 *
 * @beta
 */
export interface SerializedArtifactLibraryDeploymentFuture
  extends BaseSerializedFuture {
  type: FutureType.LIBRARY_DEPLOYMENT;
  contractName: string;
  artifact: Artifact;
  libraries: SerializedLibraries;
  from: string | SerializedAccountRuntimeValue | undefined;
}

/**
 * The serialized version of NamedContractCallFuture.
 *
 * @beta
 */
export interface SerializedNamedContractCallFuture
  extends BaseSerializedFuture {
  type: FutureType.CONTRACT_CALL;
  functionName: string;
  contract: FutureToken;
  args: SerializedArgumentType[];
  value: SerializedBigInt | SerializedModuleParameterRuntimeValue | FutureToken;
  from: string | SerializedAccountRuntimeValue | undefined;
}

/**
 * The serialized version of NamedStaticCallFuture.
 *
 * @beta
 */
export interface SerializedNamedStaticCallFuture extends BaseSerializedFuture {
  type: FutureType.STATIC_CALL;
  functionName: string;
  contract: FutureToken;
  args: SerializedArgumentType[];
  nameOrIndex: string | number;
  from: string | SerializedAccountRuntimeValue | undefined;
}

/**
 * The serialized version of NamedEncodeFunctionCallFuture.
 *
 * @beta
 */
export interface SerializedNamedEncodeFunctionCallFuture
  extends BaseSerializedFuture {
  type: FutureType.ENCODE_FUNCTION_CALL;
  functionName: string;
  contract: FutureToken;
  args: SerializedArgumentType[];
}

/**
 * The serialized version of NamedContractAtFuture.
 *
 * @beta
 */
export interface SerializedNamedContractAtFuture extends BaseSerializedFuture {
  type: FutureType.NAMED_ARTIFACT_CONTRACT_AT;
  contractName: string;
  address: string | FutureToken | SerializedModuleParameterRuntimeValue;
}

/**
 * The serialized version of ArtifactContractAtFuture.
 *
 * @beta
 */
export interface SerializedArtifactContractAtFuture
  extends BaseSerializedFuture {
  type: FutureType.CONTRACT_AT;
  contractName: string;
  address: string | FutureToken | SerializedModuleParameterRuntimeValue;
  artifact: Artifact;
}

/**
 * The serialized version of ReadEventArgumentFuture.
 *
 * @beta
 */
export interface SerializedReadEventArgumentFuture
  extends BaseSerializedFuture {
  type: FutureType.READ_EVENT_ARGUMENT;
  futureToReadFrom: FutureToken;
  eventName: string;
  nameOrIndex: string | number;
  emitter: FutureToken;
  eventIndex: number;
}

/**
 * The serialized version of ReadEventArgumentFuture.
 *
 * @beta
 */
export interface SerializedSendDataFuture extends BaseSerializedFuture {
  type: FutureType.SEND_DATA;
  to:
    | string
    | FutureToken
    | SerializedModuleParameterRuntimeValue
    | SerializedAccountRuntimeValue;
  value: SerializedBigInt | SerializedModuleParameterRuntimeValue;
  data: string | FutureToken | undefined;
  from: string | SerializedAccountRuntimeValue | undefined;
}

/**
 * The srialized version of RuntimeValue.
 *
 * @beta
 */
export type SerializedRuntimeValue =
  | SerializedAccountRuntimeValue
  | SerializedModuleParameterRuntimeValue;

/**
 * The serialized version of AccountRuntimeValue.
 *
 * @beta
 */
export interface SerializedAccountRuntimeValue {
  _kind: "AccountRuntimeValue";
  accountIndex: number;
}

/**
 * The serialized version of ModuleParameterRuntimeValue.
 *
 * @beta
 */
export interface SerializedModuleParameterRuntimeValue {
  _kind: "ModuleParameterRuntimeValue";
  moduleId: string;
  name: string;
  defaultValue: string | undefined;
}

// Serialized Deployments

/**
 * The serialized version of an Ignition module and its submodules.
 *
 * @beta
 */
export interface SerializedIgnitionModule {
  startModule: string;
  modules: {
    [key: string]: SerializedModuleDescription;
  };
}

/**
 * A subpart of the `SerializedIgnitionModule` that describes one
 * module/submodule and its relations to futures and other submodule.
 *
 * @beta
 */
export interface SerializedModuleDescription {
  id: string;
  submodules: ModuleToken[];
  futures: SerializedFuture[];
  results: Array<[name: string, token: FutureToken]>;
}

/**
 * The serialized libraries, where each library
 * has been replaced by a token.
 *
 * @beta
 */
export type SerializedLibraries = Array<[name: string, token: FutureToken]>;

/**
 * The set of serialized future types
 *
 * @beta
 */
export type SerializedFuture =
  | SerializedNamedContractDeploymentFuture
  | SerializedArtifactContractDeploymentFuture
  | SerializedNamedLibraryDeploymentFuture
  | SerializedArtifactLibraryDeploymentFuture
  | SerializedNamedContractCallFuture
  | SerializedNamedStaticCallFuture
  | SerializedNamedEncodeFunctionCallFuture
  | SerializedNamedContractAtFuture
  | SerializedArtifactContractAtFuture
  | SerializedReadEventArgumentFuture
  | SerializedSendDataFuture;
