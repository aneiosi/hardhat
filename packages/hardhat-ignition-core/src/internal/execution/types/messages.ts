import type {
  CallExecutionResult,
  DeploymentExecutionResult,
  SendDataExecutionResult,
  StaticCallExecutionResult,
} from "./execution-result.js";
import type {
  ConcreteExecutionConfig,
  DeploymentExecutionStateFutureTypes,
} from "./execution-state.js";
import type {
  OnchainInteractionRequest,
  StaticCallRequest,
} from "./execution-strategy.js";
import type {
  RawStaticCallResult,
  Transaction,
  TransactionReceipt,
} from "./jsonrpc.js";
import type {
  FutureType,
  SolidityParameterType,
} from "../../../types/module.js";

export type JournalMessage =
  | DeploymentInitializeMessage
  | WipeExecutionStateMessage
  | DeploymentExecutionStateInitializeMessage
  | DeploymentExecutionStateCompleteMessage
  | CallExecutionStateInitializeMessage
  | CallExecutionStateCompleteMessage
  | StaticCallExecutionStateInitializeMessage
  | StaticCallExecutionStateCompleteMessage
  | SendDataExecutionStateInitializeMessage
  | SendDataExecutionStateCompleteMessage
  | ContractAtExecutionStateInitializeMessage
  | ReadEventArgExecutionStateInitializeMessage
  | EncodeFunctionCallExecutionStateInitializeMessage
  | NetworkInteractionRequestMessage
  | TransactionPrepareSendMessage
  | TransactionSendMessage
  | TransactionConfirmMessage
  | StaticCallCompleteMessage
  | OnchainInteractionBumpFeesMessage
  | OnchainInteractionDroppedMessage
  | OnchainInteractionReplacedByUserMessage
  | OnchainInteractionTimeoutMessage;

/**
 * NOTE:
 *
 * when adding/removing/changing any of these
 * be sure to update UiEventType accordingly
 */
export enum JournalMessageType {
  DEPLOYMENT_INITIALIZE = "DEPLOYMENT_INITIALIZE",
  RUN_START = "RUN_START",
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
}

export interface DeploymentInitializeMessage {
  type: JournalMessageType.DEPLOYMENT_INITIALIZE;
  chainId: number;
}

export interface DeploymentExecutionStateInitializeMessage {
  type: JournalMessageType.DEPLOYMENT_EXECUTION_STATE_INITIALIZE;
  futureId: string;
  futureType: DeploymentExecutionStateFutureTypes;
  strategy: string;
  strategyConfig: ConcreteExecutionConfig;
  dependencies: string[];
  artifactId: string;
  contractName: string;
  constructorArgs: SolidityParameterType[];
  libraries: Record<string, string>;
  value: bigint;
  from: string;
}

export interface DeploymentExecutionStateCompleteMessage {
  type: JournalMessageType.DEPLOYMENT_EXECUTION_STATE_COMPLETE;
  futureId: string;
  result: DeploymentExecutionResult;
}

export interface CallExecutionStateInitializeMessage {
  type: JournalMessageType.CALL_EXECUTION_STATE_INITIALIZE;
  futureId: string;
  strategy: string;
  strategyConfig: ConcreteExecutionConfig;
  dependencies: string[];
  artifactId: string;
  contractAddress: string;
  functionName: string;
  args: SolidityParameterType[];
  value: bigint;
  from: string;
}

export interface CallExecutionStateCompleteMessage {
  type: JournalMessageType.CALL_EXECUTION_STATE_COMPLETE;
  futureId: string;
  result: CallExecutionResult;
}

export interface StaticCallExecutionStateInitializeMessage {
  type: JournalMessageType.STATIC_CALL_EXECUTION_STATE_INITIALIZE;
  futureId: string;
  strategy: string;
  strategyConfig: ConcreteExecutionConfig;
  dependencies: string[];
  artifactId: string;
  contractAddress: string;
  functionName: string;
  nameOrIndex: string | number;
  args: SolidityParameterType[];
  from: string;
}

export interface StaticCallExecutionStateCompleteMessage {
  type: JournalMessageType.STATIC_CALL_EXECUTION_STATE_COMPLETE;
  futureId: string;
  result: StaticCallExecutionResult;
}

export interface SendDataExecutionStateInitializeMessage {
  type: JournalMessageType.SEND_DATA_EXECUTION_STATE_INITIALIZE;
  futureId: string;
  strategy: string;
  strategyConfig: ConcreteExecutionConfig;
  dependencies: string[];
  to: string;
  data: string;
  value: bigint;
  from: string;
}

export interface SendDataExecutionStateCompleteMessage {
  type: JournalMessageType.SEND_DATA_EXECUTION_STATE_COMPLETE;
  futureId: string;
  result: SendDataExecutionResult;
}

export interface ContractAtExecutionStateInitializeMessage {
  type: JournalMessageType.CONTRACT_AT_EXECUTION_STATE_INITIALIZE;
  futureType: FutureType.NAMED_ARTIFACT_CONTRACT_AT | FutureType.CONTRACT_AT;
  futureId: string;
  strategy: string;
  strategyConfig: ConcreteExecutionConfig;
  dependencies: string[];
  artifactId: string;
  contractName: string;
  contractAddress: string;
}

export interface ReadEventArgExecutionStateInitializeMessage {
  type: JournalMessageType.READ_EVENT_ARGUMENT_EXECUTION_STATE_INITIALIZE;
  futureId: string;
  strategy: string;
  strategyConfig: ConcreteExecutionConfig;
  dependencies: string[];
  artifactId: string;
  eventName: string;
  nameOrIndex: string | number;
  txToReadFrom: string;
  emitterAddress: string;
  eventIndex: number;
  result: SolidityParameterType;
}

export interface EncodeFunctionCallExecutionStateInitializeMessage {
  type: JournalMessageType.ENCODE_FUNCTION_CALL_EXECUTION_STATE_INITIALIZE;
  futureId: string;
  strategy: string;
  strategyConfig: ConcreteExecutionConfig;
  dependencies: string[];
  artifactId: string;
  functionName: string;
  args: SolidityParameterType[];
  result: string;
}

export interface NetworkInteractionRequestMessage {
  type: JournalMessageType.NETWORK_INTERACTION_REQUEST;
  futureId: string;
  networkInteraction:
    | OnchainInteractionRequest
    | Omit<Required<StaticCallRequest>, "result">;
}

export interface TransactionPrepareSendMessage {
  type: JournalMessageType.TRANSACTION_PREPARE_SEND;
  futureId: string;
  networkInteractionId: number;
  nonce: number;
}

export interface TransactionSendMessage {
  type: JournalMessageType.TRANSACTION_SEND;
  futureId: string;
  networkInteractionId: number;
  transaction: Transaction;
  nonce: number;
}

export interface TransactionConfirmMessage {
  type: JournalMessageType.TRANSACTION_CONFIRM;
  futureId: string;
  networkInteractionId: number;
  hash: string;
  receipt: TransactionReceipt;
}

export interface StaticCallCompleteMessage {
  type: JournalMessageType.STATIC_CALL_COMPLETE;
  futureId: string;
  networkInteractionId: number;
  result: RawStaticCallResult;
}

export interface OnchainInteractionBumpFeesMessage {
  type: JournalMessageType.ONCHAIN_INTERACTION_BUMP_FEES;
  futureId: string;
  networkInteractionId: number;
}

export interface OnchainInteractionDroppedMessage {
  type: JournalMessageType.ONCHAIN_INTERACTION_DROPPED;
  futureId: string;
  networkInteractionId: number;
}

export interface OnchainInteractionReplacedByUserMessage {
  type: JournalMessageType.ONCHAIN_INTERACTION_REPLACED_BY_USER;
  futureId: string;
  networkInteractionId: number;
}

export interface OnchainInteractionTimeoutMessage {
  type: JournalMessageType.ONCHAIN_INTERACTION_TIMEOUT;
  futureId: string;
  networkInteractionId: number;
}

export interface WipeExecutionStateMessage {
  type: JournalMessageType.WIPE_APPLY;
  futureId: string;
}
