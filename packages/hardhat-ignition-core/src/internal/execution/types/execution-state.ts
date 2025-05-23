import type {
  CallExecutionResult,
  DeploymentExecutionResult,
  SendDataExecutionResult,
  StaticCallExecutionResult,
} from "./execution-result.js";
import type { NetworkInteraction, StaticCall } from "./network-interaction.js";
import type {
  FutureType,
  SolidityParameterType,
} from "../../../types/module.js";

/**
 * An execution state is used to keep track of the execution of a future.
 */
export type ExecutionState =
  | DeploymentExecutionState
  | CallExecutionState
  | StaticCallExecutionState
  | EncodeFunctionCallExecutionState
  | ContractAtExecutionState
  | ReadEventArgumentExecutionState
  | SendDataExecutionState;

/**
 * The different status that the execution can be at.
 */
export enum ExecutionStatus {
  STARTED = "STARATED",
  TIMEOUT = "TIMEOUT",
  SUCCESS = "SUCCESS",
  HELD = "HELD",
  FAILED = "FAILED",
}

/**
 * The different kinds of execution states.
 */
export enum ExecutionSateType {
  DEPLOYMENT_EXECUTION_STATE = "DEPLOYMENT_EXECUTION_STATE",
  CALL_EXECUTION_STATE = "CALL_EXECUTION_STATE",
  STATIC_CALL_EXECUTION_STATE = "STATIC_CALL_EXECUTION_STATE",
  ENCODE_FUNCTION_CALL_EXECUTION_STATE = "ENCODE_FUNCTION_CALL_EXECUTION_STATE",
  CONTRACT_AT_EXECUTION_STATE = "CONTRACT_AT_EXECUTION_STATE",
  READ_EVENT_ARGUMENT_EXECUTION_STATE = "READ_EVENT_ARGUMENT_EXECUTION_STATE",
  SEND_DATA_EXECUTION_STATE = "SEND_DATA_EXECUTION_STATE",
}

/**
 * The Strategy configuration that the user has provided in the run
 * the future is started. Used to reconcile the future on subsequent runs.
 */
export type ConcreteExecutionConfig = Record<string, number | string>;

/**
 * The base interface for all execution states.
 *
 * Its id must match the id of the future that it belongs to.
 */
interface BaseExecutionState<
  ExecutionStateT extends ExecutionSateType,
  FutureTypeT extends FutureType,
> {
  id: string;
  type: ExecutionStateT;
  futureType: FutureTypeT;
  strategy: string; // For example, "basic" | "create2". This needs to be string if we want custom ones.
  strategyConfig: ConcreteExecutionConfig;
  status: ExecutionStatus;
  dependencies: Set<string>;
}

/** The future types that can be used with a DeploymentExecutionState */
export type DeploymentExecutionStateFutureTypes =
  | FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT
  | FutureType.CONTRACT_DEPLOYMENT
  | FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT
  | FutureType.LIBRARY_DEPLOYMENT;

/**
 * The execution state used for the different kinds of futures
 * that deploy contracts.
 */
export interface DeploymentExecutionState
  extends BaseExecutionState<
    ExecutionSateType.DEPLOYMENT_EXECUTION_STATE,
    DeploymentExecutionStateFutureTypes
  > {
  artifactId: string;
  contractName: string;
  constructorArgs: SolidityParameterType[];
  libraries: Record<string, string>;
  value: bigint;
  from: string;
  networkInteractions: NetworkInteraction[];
  result?: DeploymentExecutionResult;
}

/**
 * An execution state used for the future that performs on-chain calls to contracts.
 */
export interface CallExecutionState
  extends BaseExecutionState<
    ExecutionSateType.CALL_EXECUTION_STATE,
    FutureType.CONTRACT_CALL
  > {
  artifactId: string;
  contractAddress: string;
  functionName: string;
  args: SolidityParameterType[];
  value: bigint;
  from: string;
  networkInteractions: NetworkInteraction[];
  result?: CallExecutionResult;
}

/**
 * An execution state used for the future that performs static calls to contracts.
 *
 * Static calls' network interactions are limited to `StaticCall`. They cannot
 * perform any on-chain interaction.
 */
export interface StaticCallExecutionState
  extends BaseExecutionState<
    ExecutionSateType.STATIC_CALL_EXECUTION_STATE,
    FutureType.STATIC_CALL
  > {
  artifactId: string;
  contractAddress: string;
  functionName: string;
  args: SolidityParameterType[];
  nameOrIndex: string | number;
  from: string;
  networkInteractions: StaticCall[];
  result?: StaticCallExecutionResult;
}

/**
 * An execution state that tracks the execution of an encode function call future.
 *
 * Encode function call execution states are only stored for reconciliation purposes
 * and don't actually lead to any network interaction.
 *
 * Their execution is immediately completed.
 */
export interface EncodeFunctionCallExecutionState
  extends BaseExecutionState<
    ExecutionSateType.ENCODE_FUNCTION_CALL_EXECUTION_STATE,
    FutureType.ENCODE_FUNCTION_CALL
  > {
  artifactId: string;
  functionName: string;
  args: SolidityParameterType[];
  result: string;
}

/**
 * An execution state that tracks the execution of an arbitrary send data future.
 */
export interface SendDataExecutionState
  extends BaseExecutionState<
    ExecutionSateType.SEND_DATA_EXECUTION_STATE,
    FutureType.SEND_DATA
  > {
  to: string;
  data: string;
  value: bigint;
  from: string;
  networkInteractions: NetworkInteraction[];
  result?: SendDataExecutionResult;
}

/**
 * An execution state that tracks the execution of a contract at future.
 *
 * Contract at execution states are only stored for reconciliation purposes
 * and don't actually lead to any network interaction.
 *
 * Their execution is immediately completed.
 */
export interface ContractAtExecutionState
  extends BaseExecutionState<
    ExecutionSateType.CONTRACT_AT_EXECUTION_STATE,
    FutureType.NAMED_ARTIFACT_CONTRACT_AT | FutureType.CONTRACT_AT
  > {
  artifactId: string;
  contractName: string;
  contractAddress: string;
}

/**
 * An execution state that tracks the execution of a read event argument future.
 *
 * Read event argument execution states are only stored for reconciliation
 * purposes and don't actually lead to any network interaction.
 */
export interface ReadEventArgumentExecutionState
  extends BaseExecutionState<
    ExecutionSateType.READ_EVENT_ARGUMENT_EXECUTION_STATE,
    FutureType.READ_EVENT_ARGUMENT
  > {
  artifactId: string;
  eventName: string;
  nameOrIndex: string | number;
  txToReadFrom: string;
  emitterAddress: string;
  eventIndex: number;
  result: SolidityParameterType;
}
