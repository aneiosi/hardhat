import type { DeploymentResult } from "./deploy.js";

/**
 * Events emitted by the execution engine to allow tracking
 * progress of a deploy.
 *
 * @beta
 */
export type ExecutionEvent =
  | DeploymentInitializeEvent
  | WipeApplyEvent
  | DeploymentExecutionStateInitializeEvent
  | DeploymentExecutionStateCompleteEvent
  | CallExecutionStateInitializeEvent
  | CallExecutionStateCompleteEvent
  | StaticCallExecutionStateInitializeEvent
  | StaticCallExecutionStateCompleteEvent
  | SendDataExecutionStateInitializeEvent
  | SendDataExecutionStateCompleteEvent
  | ContractAtExecutionStateInitializeEvent
  | ReadEventArgExecutionStateInitializeEvent
  | EncodeFunctionCallExecutionStateInitializeEvent
  | NetworkInteractionRequestEvent
  | TransactionPrepareSendEvent
  | TransactionSendEvent
  | TransactionConfirmEvent
  | StaticCallCompleteEvent
  | OnchainInteractionBumpFeesEvent
  | OnchainInteractionDroppedEvent
  | OnchainInteractionReplacedByUserEvent
  | OnchainInteractionTimeoutEvent
  | BatchInitializeEvent
  | DeploymentStartEvent
  | ReconciliationWarningsEvent
  | BeginNextBatchEvent
  | SetModuleIdEvent
  | SetStrategyEvent;

/**
 * The types of diagnostic events emitted during a deploy.
 *
 * @beta
 */
export enum ExecutionEventType {
  WIPE_APPLY = "WIPE_APPLY",
  DEPLOYMENT_EXECUTION_STATE_INITIALIZE = "DEPLOYMENT_EXECUTION_STATE_INITIALIZE",
  DEPLOYMENT_EXECUTION_STATE_COMPLETE = "DEPLOYMENT_EXECUTION_STATE_COMPLETE",
  CALL_EXECUTION_STATE_INITIALIZE = "CALL_EXECUTION_STATE_INITIALIZE",
  CALL_EXECUTION_STATE_COMPLETE = "CALL_EXECUTION_STATE_COMPLETE",
  STATIC_CALL_EXECUTION_STATE_INITIALIZE = "STATIC_CALL_EXECUTION_STATE_INITIALIZE",
  STATIC_CALL_EXECUTION_STATE_COMPLETE = "STATIC_CALL_EXECUTION_STATE_COMPLETE",
  SEND_DATA_EXECUTION_STATE_INITIALIZE = "SEND_DATA_EXECUTION_STATE_INITIALIZE",
  SEND_DATA_EXECUTION_STATE_COMPLETE = "SEND_DATA_EXECUTION_STATE_COMPLETE",
  CONTRACT_AT_EXECUTION_STATE_INITIALIZE = "CONTRACT_AT_EXECUTION_STATE_INITIALIZE",
  READ_EVENT_ARGUMENT_EXECUTION_STATE_INITIALIZE = "READ_EVENT_ARGUMENT_EXECUTION_STATE_INITIALIZE",
  ENCODE_FUNCTION_CALL_EXECUTION_STATE_INITIALIZE = "ENCODE_FUNCTION_CALL_EXECUTION_STATE_INITIALIZE",
  NETWORK_INTERACTION_REQUEST = "NETWORK_INTERACTION_REQUEST",
  TRANSACTION_PREPARE_SEND = "TRANSACTION_PREPARE_SEND",
  TRANSACTION_SEND = "TRANSACTION_SEND",
  TRANSACTION_CONFIRM = "TRANSACTION_CONFIRM",
  STATIC_CALL_COMPLETE = "STATIC_CALL_COMPLETE",
  ONCHAIN_INTERACTION_BUMP_FEES = "ONCHAIN_INTERACTION_BUMP_FEES",
  ONCHAIN_INTERACTION_DROPPED = "ONCHAIN_INTERACTION_DROPPED",
  ONCHAIN_INTERACTION_REPLACED_BY_USER = "ONCHAIN_INTERACTION_REPLACED_BY_USER",
  ONCHAIN_INTERACTION_TIMEOUT = "ONCHAIN_INTERACTION_TIMEOUT",
  DEPLOYMENT_START = "DEPLOYMENT_START",
  DEPLOYMENT_INITIALIZE = "DEPLOYMENT_INITIALIZE",
  RECONCILIATION_WARNINGS = "RECONCILIATION_WARNINGS",
  BATCH_INITIALIZE = "BATCH_INITIALIZE",
  RUN_START = "RUN_START",
  BEGIN_NEXT_BATCH = "BEGIN_NEXT_BATCH",
  DEPLOYMENT_COMPLETE = "DEPLOYMENT_COMPLETE",
  SET_MODULE_ID = "SET_MODULE_ID",
  SET_STRATEGY = "SET_STRATEGY",
}

/**
 * An event indicating that a deployment has started.
 *
 * @beta
 */
export interface DeploymentStartEvent {
  type: ExecutionEventType.DEPLOYMENT_START;
  moduleName: string;
  deploymentDir: string | undefined;
  isResumed: boolean;
  maxFeeBumps: number;
  disableFeeBumping: boolean;
}

/**
 * An event indicating a new deployment has been initialized.
 *
 * @beta
 */
export interface DeploymentInitializeEvent {
  type: ExecutionEventType.DEPLOYMENT_INITIALIZE;
  chainId: number;
}

/**
 * An event indicating that batches have been generated for a deployment run.
 *
 * @beta
 */
export interface BatchInitializeEvent {
  type: ExecutionEventType.BATCH_INITIALIZE;
  batches: string[][];
}

/**
 * An event indicating that the deployment is commenencing an execution run.
 *
 * @beta
 */
export interface RunStartEvent {
  type: ExecutionEventType.RUN_START;
}

/**
 * An event indicating that the execution engine has moved onto
 * the next batch.
 *
 * @beta
 */
export interface BeginNextBatchEvent {
  type: ExecutionEventType.BEGIN_NEXT_BATCH;
}

/**
 * An event indicating that a deployment has started.
 *
 * @beta
 */
export interface DeploymentCompleteEvent {
  type: ExecutionEventType.DEPLOYMENT_COMPLETE;
  result: DeploymentResult;
}

/**
 * An event indicating that a deployment has reconciliation warnings.
 *
 * @beta
 */
export interface ReconciliationWarningsEvent {
  type: ExecutionEventType.RECONCILIATION_WARNINGS;
  warnings: string[];
}

/**
 * An event indicating a future that deploys a contract
 * or library has started execution.
 *
 * @beta
 */
export interface DeploymentExecutionStateInitializeEvent {
  type: ExecutionEventType.DEPLOYMENT_EXECUTION_STATE_INITIALIZE;
  futureId: string;
}

/**
 * An event indicating that a future that deploys a contract
 * or library has completed execution.
 *
 * @beta
 */
export interface DeploymentExecutionStateCompleteEvent {
  type: ExecutionEventType.DEPLOYMENT_EXECUTION_STATE_COMPLETE;
  futureId: string;
  result: ExecutionEventResult;
}

/**
 * An event indicating a future that calls a function onchain
 * via transactions has started execution.
 *
 * @beta
 */
export interface CallExecutionStateInitializeEvent {
  type: ExecutionEventType.CALL_EXECUTION_STATE_INITIALIZE;
  futureId: string;
}

/**
 * An event indicating a future that calls a function onchain
 * via transactions has completed execution.
 *
 * @beta
 */
export interface CallExecutionStateCompleteEvent {
  type: ExecutionEventType.CALL_EXECUTION_STATE_COMPLETE;
  futureId: string;
  result: ExecutionEventResult;
}

/**
 * An event indicating that a future that makes a static call
 * has started execution.
 *
 * @beta
 */
export interface StaticCallExecutionStateInitializeEvent {
  type: ExecutionEventType.STATIC_CALL_EXECUTION_STATE_INITIALIZE;
  futureId: string;
}

/**
 * An event indicating that a future that makes a static call
 * has completed execution.
 *
 * @beta
 */
export interface StaticCallExecutionStateCompleteEvent {
  type: ExecutionEventType.STATIC_CALL_EXECUTION_STATE_COMPLETE;
  futureId: string;
  result: ExecutionEventResult;
}

/**
 * An event indicationing that a future that sends data or eth to a contract
 * has started execution.
 *
 * @beta
 */
export interface SendDataExecutionStateInitializeEvent {
  type: ExecutionEventType.SEND_DATA_EXECUTION_STATE_INITIALIZE;
  futureId: string;
}

/**
 * An event indicationing that a future that sends data or eth to a contract
 * has completed execution.
 *
 * @beta
 */
export interface SendDataExecutionStateCompleteEvent {
  type: ExecutionEventType.SEND_DATA_EXECUTION_STATE_COMPLETE;
  futureId: string;
  result: ExecutionEventResult;
}

/**
 * An event indicating that a future that represents an existing contract
 * has been initialized, there is no complete event as it initializes
 * as complete.
 *
 * @beta
 */
export interface ContractAtExecutionStateInitializeEvent {
  type: ExecutionEventType.CONTRACT_AT_EXECUTION_STATE_INITIALIZE;
  futureId: string;
}

/**
 * An event indicating that a future that represents resolving an event
 * from a previous futures onchain interaction, there is no complete event
 * as it initializes as complete.
 *
 * @beta
 */
export interface ReadEventArgExecutionStateInitializeEvent {
  type: ExecutionEventType.READ_EVENT_ARGUMENT_EXECUTION_STATE_INITIALIZE;
  futureId: string;
  result: ExecutionEventSuccess;
}

/**
 * An event indicating that a future that represents encoding a function
 * call has been initialized, there is no complete event as it initializes
 * as complete.
 *
 * @beta
 */
export interface EncodeFunctionCallExecutionStateInitializeEvent {
  type: ExecutionEventType.ENCODE_FUNCTION_CALL_EXECUTION_STATE_INITIALIZE;
  futureId: string;
  result: ExecutionEventSuccess;
}

/**
 * An event indicating the user has clear the previous execution of a future.
 *
 * @beta
 */
export interface WipeApplyEvent {
  type: ExecutionEventType.WIPE_APPLY;
  futureId: string;
}

/**
 * An event indicating that a future has requested a network interaction,
 * either a transaction or a static call query.
 *
 * @beta
 */
export interface NetworkInteractionRequestEvent {
  type: ExecutionEventType.NETWORK_INTERACTION_REQUEST;
  networkInteractionType: ExecutionEventNetworkInteractionType;
  futureId: string;
}

/**
 * An event indicating that a transaction is about to be sent to the network.
 *
 * @beta
 */
export interface TransactionPrepareSendEvent {
  type: ExecutionEventType.TRANSACTION_PREPARE_SEND;
  futureId: string;
}

/**
 * An event indicating that a transaction has been sent to the network.
 *
 * @beta
 */
export interface TransactionSendEvent {
  type: ExecutionEventType.TRANSACTION_SEND;
  futureId: string;
  hash: string;
}

/**
 * An event indicating has been detected as confirmed on-chain.
 *
 * @beta
 */
export interface TransactionConfirmEvent {
  type: ExecutionEventType.TRANSACTION_CONFIRM;
  futureId: string;
  hash: string;
}

/**
 * An event indicating that a static call has been successfully run
 * against the chain.
 *
 * @beta
 */
export interface StaticCallCompleteEvent {
  type: ExecutionEventType.STATIC_CALL_COMPLETE;
  futureId: string;
}

/**
 * An event indicating that a future's onchain interaction has had
 * its its latest transaction fee bumped.
 *
 * @beta
 */
export interface OnchainInteractionBumpFeesEvent {
  type: ExecutionEventType.ONCHAIN_INTERACTION_BUMP_FEES;
  futureId: string;
}

/**
 * An event indicating that a future's onchain interaction has
 * had its transaction dropped and will be resent.
 *
 * @beta
 */
export interface OnchainInteractionDroppedEvent {
  type: ExecutionEventType.ONCHAIN_INTERACTION_DROPPED;
  futureId: string;
}

/**
 * An event indicating that a future's onchain interaction has
 * been replaced by a transaction from the user.
 *
 * @beta
 */
export interface OnchainInteractionReplacedByUserEvent {
  type: ExecutionEventType.ONCHAIN_INTERACTION_REPLACED_BY_USER;
  futureId: string;
}

/**
 * An event indicating that a future's onchain interaction has
 * timed out.
 *
 * @beta
 */
export interface OnchainInteractionTimeoutEvent {
  type: ExecutionEventType.ONCHAIN_INTERACTION_TIMEOUT;
  futureId: string;
}

/**
 * An event indicating the current moduleId being validated.
 *
 * @beta
 */
export interface SetModuleIdEvent {
  type: ExecutionEventType.SET_MODULE_ID;
  moduleName: string;
}

/**
 * An event indicating the type of strategy being used.
 *
 * @beta
 */
export interface SetStrategyEvent {
  type: ExecutionEventType.SET_STRATEGY;
  strategy: string;
}

/**
 * The types of network interactions that can be requested by a future.
 *
 * @beta
 */
export enum ExecutionEventNetworkInteractionType {
  ONCHAIN_INTERACTION = "ONCHAIN_INTERACTION",
  STATIC_CALL = "STATIC_CALL",
}

/**
 * The status of a future's completed execution.
 *
 * @beta
 */
export enum ExecutionEventResultType {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
  HELD = "HELD",
}

/**
 * The result of a future's completed execution.
 *
 * @beta
 */
export type ExecutionEventResult =
  | ExecutionEventSuccess
  | ExecutionEventError
  | ExecutionEventHeld;

/**
 * A successful result of a future's execution.
 *
 * @beta
 */
export interface ExecutionEventSuccess {
  type: ExecutionEventResultType.SUCCESS;
  result?: string;
}

/**
 * An errored result of a future's execution.
 *
 * @beta
 */
export interface ExecutionEventError {
  type: ExecutionEventResultType.ERROR;
  error: string;
}

/**
 * A hold result of a future's execution.
 *
 * @beta
 */
export interface ExecutionEventHeld {
  type: ExecutionEventResultType.HELD;
  heldId: number;
  reason: string;
}

/**
 * A mapping of execution event types to their corresponding event.
 *
 * @beta
 */
export interface ExecutionEventTypeMap {
  [ExecutionEventType.WIPE_APPLY]: WipeApplyEvent;
  [ExecutionEventType.DEPLOYMENT_EXECUTION_STATE_INITIALIZE]: DeploymentExecutionStateInitializeEvent;
  [ExecutionEventType.DEPLOYMENT_EXECUTION_STATE_COMPLETE]: DeploymentExecutionStateCompleteEvent;
  [ExecutionEventType.CALL_EXECUTION_STATE_INITIALIZE]: CallExecutionStateInitializeEvent;
  [ExecutionEventType.CALL_EXECUTION_STATE_COMPLETE]: CallExecutionStateCompleteEvent;
  [ExecutionEventType.STATIC_CALL_EXECUTION_STATE_INITIALIZE]: StaticCallExecutionStateInitializeEvent;
  [ExecutionEventType.STATIC_CALL_EXECUTION_STATE_COMPLETE]: StaticCallExecutionStateCompleteEvent;
  [ExecutionEventType.SEND_DATA_EXECUTION_STATE_INITIALIZE]: SendDataExecutionStateInitializeEvent;
  [ExecutionEventType.SEND_DATA_EXECUTION_STATE_COMPLETE]: SendDataExecutionStateCompleteEvent;
  [ExecutionEventType.CONTRACT_AT_EXECUTION_STATE_INITIALIZE]: ContractAtExecutionStateInitializeEvent;
  [ExecutionEventType.READ_EVENT_ARGUMENT_EXECUTION_STATE_INITIALIZE]: ReadEventArgExecutionStateInitializeEvent;
  [ExecutionEventType.ENCODE_FUNCTION_CALL_EXECUTION_STATE_INITIALIZE]: EncodeFunctionCallExecutionStateInitializeEvent;
  [ExecutionEventType.NETWORK_INTERACTION_REQUEST]: NetworkInteractionRequestEvent;
  [ExecutionEventType.TRANSACTION_PREPARE_SEND]: TransactionPrepareSendEvent;
  [ExecutionEventType.TRANSACTION_SEND]: TransactionSendEvent;
  [ExecutionEventType.TRANSACTION_CONFIRM]: TransactionConfirmEvent;
  [ExecutionEventType.STATIC_CALL_COMPLETE]: StaticCallCompleteEvent;
  [ExecutionEventType.ONCHAIN_INTERACTION_BUMP_FEES]: OnchainInteractionBumpFeesEvent;
  [ExecutionEventType.ONCHAIN_INTERACTION_DROPPED]: OnchainInteractionDroppedEvent;
  [ExecutionEventType.ONCHAIN_INTERACTION_REPLACED_BY_USER]: OnchainInteractionReplacedByUserEvent;
  [ExecutionEventType.ONCHAIN_INTERACTION_TIMEOUT]: OnchainInteractionTimeoutEvent;
  [ExecutionEventType.DEPLOYMENT_START]: DeploymentStartEvent;
  [ExecutionEventType.DEPLOYMENT_INITIALIZE]: DeploymentInitializeEvent;
  [ExecutionEventType.RECONCILIATION_WARNINGS]: ReconciliationWarningsEvent;
  [ExecutionEventType.BATCH_INITIALIZE]: BatchInitializeEvent;
  [ExecutionEventType.RUN_START]: RunStartEvent;
  [ExecutionEventType.BEGIN_NEXT_BATCH]: BeginNextBatchEvent;
  [ExecutionEventType.DEPLOYMENT_COMPLETE]: DeploymentCompleteEvent;
  [ExecutionEventType.SET_MODULE_ID]: SetModuleIdEvent;
  [ExecutionEventType.SET_STRATEGY]: SetStrategyEvent;
}

/**
 * A utility type for mapping enum values to function names
 *
 * @beta
 */
export type SnakeToCamelCase<S extends string> =
  S extends `${infer T}_${infer U}`
    ? `${Lowercase<T>}${Capitalize<SnakeToCamelCase<Lowercase<U>>>}`
    : S;

/**
 * A listener for execution events.
 *
 * @beta
 */
export type ExecutionEventListener = {
  [eventType in ExecutionEventType as SnakeToCamelCase<eventType>]: (
    event: ExecutionEventTypeMap[eventType],
  ) => void;
};
