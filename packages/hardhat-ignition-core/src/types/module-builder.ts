import type { Abi, Artifact } from "./artifact.js";
import type {
  AccountRuntimeValue,
  AddressResolvableFuture,
  ArgumentType,
  CallableContractFuture,
  ContractAtFuture,
  ContractCallFuture,
  ContractDeploymentFuture,
  ContractFuture,
  EncodeFunctionCallFuture,
  Future,
  IgnitionModule,
  IgnitionModuleResult,
  LibraryDeploymentFuture,
  ModuleParameterRuntimeValue,
  ModuleParameterType,
  NamedArtifactContractAtFuture,
  NamedArtifactContractDeploymentFuture,
  NamedArtifactLibraryDeploymentFuture,
  ReadEventArgumentFuture,
  SendDataFuture,
  StaticCallFuture,
} from "./module.js";

/**
 * The options for a `contract` deployment.
 *
 * @beta
 */
export interface ContractOptions {
  /**
   * The future id.
   */
  id?: string;

  /**
   * The futures or Ignition modules to execute before this one.
   */
  after?: Array<Future | IgnitionModule>;

  /**
   * The libraries to link to the contract.
   */
  libraries?: Record<string, ContractFuture<string>>;

  /**
   * The value in wei to send with the transaction.
   */
  value?:
    | bigint
    | ModuleParameterRuntimeValue<bigint>
    | StaticCallFuture<string, string>
    | ReadEventArgumentFuture;

  /**
   * The account to send the transaction from.
   */
  from?: string | AccountRuntimeValue;
}

/**
 * The options for a `library` call.
 *
 * @beta
 */
export interface LibraryOptions {
  /**
   * The future id.
   */
  id?: string;

  /**
   * The futures or Ignition modules to execute before this one.
   */
  after?: Array<Future | IgnitionModule>;

  /**
   * The libraries to link to the contract.
   */
  libraries?: Record<string, ContractFuture<string>>;

  /**
   * The account to send the transaction from.
   */
  from?: string | AccountRuntimeValue;
}

/**
 * The options for a `call` call.
 *
 * @beta
 */
export interface CallOptions {
  /**
   * The future id.
   */
  id?: string;

  /**
   * The futures or Ignition modules to execute before this one.
   */
  after?: Array<Future | IgnitionModule>;

  /**
   * The value in wei to send with the transaction.
   */
  value?:
    | bigint
    | ModuleParameterRuntimeValue<bigint>
    | StaticCallFuture<string, string>
    | ReadEventArgumentFuture;

  /**
   * The account to send the transaction from.
   */
  from?: string | AccountRuntimeValue;
}

/**
 * The options for a `staticCall` call.
 *
 * @beta
 */
export interface StaticCallOptions {
  /**
   * The future id.
   */
  id?: string;

  /**
   * The futures or Ignition modules to execute before this one.
   */
  after?: Array<Future | IgnitionModule>;

  /**
   * The account to send the transaction from.
   */
  from?: string | AccountRuntimeValue;
}

/**
 * The options for an `encodeFunctionCall` call.
 *
 * @beta
 */
export interface EncodeFunctionCallOptions {
  /**
   * The future id.
   */
  id?: string;

  /**
   * The futures or Ignition modules to execute before this one.
   */
  after?: Array<Future | IgnitionModule>;
}

/**
 * The options for a `contractAt` call.
 *
 * @beta
 */
export interface ContractAtOptions {
  /**
   * The future id.
   */
  id?: string;

  /**
   * The futures or Ignition modules to execute before this one.
   */
  after?: Array<Future | IgnitionModule>;
}

/**
 * The options for a `readEventArgument` call.
 *
 * @beta
 */
export interface ReadEventArgumentOptions {
  /**
   * The future id.
   */
  id?: string;

  /**
   * The contract that emitted the event. If omitted the contract associated
   * with the future you are reading the event from will be used.
   */
  emitter?: ContractFuture<string>;

  /**
   * If multiple events with the same name were emitted by the contract, you can
   * choose which of those to read from by specifying its index (0-indexed).
   */
  eventIndex?: number;
}

/**
 * The options for a `send` call.
 *
 * @beta
 */
export interface SendDataOptions {
  /**
   * The futures or Ignition modules to execute before this one.
   */
  after?: Array<Future | IgnitionModule>;

  /**
   * The account to send the transaction from.
   */
  from?: string | AccountRuntimeValue;
}

/**
 * The build api for configuring a deployment within a module.
 *
 * @beta
 */
export interface IgnitionModuleBuilder {
  /**
   * Returns an account runtime value representing the
   * Hardhat account the underlying transactions for a
   * future will be sent from.
   *
   * @param accountIndex - The index of the account to return
   *
   * @example
   * ```
   * const owner = m.getAccount(1);
   * const myContract = m.contract("MyContract", { from: owner });
   * // can also be used anywhere an address is expected
   * m.send("sendToOwner", owner, { value: 100 });
   * ```
   */
  getAccount(accountIndex: number): AccountRuntimeValue;

  /**
   * A parameter whose value can be set at deployment.
   *
   * @param parameterName - The name of the parameter
   * @param defaultValue - The default value to use if the parameter is not
   * provided
   *
   * @example
   * ```
   * const amount = m.getParameter("amount", 100);
   * const myContract = m.contract("MyContract", { value: amount });
   * ```
   */
  getParameter<ParamTypeT extends ModuleParameterType = any>(
    parameterName: string,
    defaultValue?: ParamTypeT,
  ): ModuleParameterRuntimeValue<ParamTypeT>;

  /**
   * Deploy a contract.
   *
   * @param contractName - The name of the contract to deploy
   * @param args - The arguments to pass to the contract constructor
   * @param options - The options for the deployment
   *
   * @example
   * ```
   * const myContract = m.contract("MyContract", [], { value: 100 });
   * ```
   */
  contract<ContractNameT extends string>(
    contractName: ContractNameT,
    args?: ArgumentType[],
    options?: ContractOptions,
  ): NamedArtifactContractDeploymentFuture<ContractNameT>;

  /**
   * Deploy a contract.
   *
   * @param contractName - The name of the contract to deploy
   * @param artifact - The artifact of the contract to deploy
   * @param args - The arguments to pass to the contract constructor
   * @param options - The options for the deployment
   *
   * @example
   * ```
   * const myContract = m.contract("MyContract", [], { value: 100 });
   * ```
   */
  contract<const AbiT extends Abi>(
    contractName: string,
    artifact: Artifact<AbiT>,
    args?: ArgumentType[],
    options?: ContractOptions,
  ): ContractDeploymentFuture<AbiT>;

  /**
   * Deploy a library.
   *
   * @param libraryName - The name of the library to deploy
   * @param options - The options for the deployment
   *
   * @example
   * ```
   * const owner = m.getAccount(1);
   * const myLibrary = m.library("MyLibrary", { from: owner } );
   * ```
   */
  library<LibraryNameT extends string>(
    libraryName: LibraryNameT,
    options?: LibraryOptions,
  ): NamedArtifactLibraryDeploymentFuture<LibraryNameT>;

  /**
   * Deploy a library.
   *
   * @param libraryName - The name of the library to deploy
   * @param artifact - The artifact of the library to deploy
   * @param options - The options for the deployment
   *
   * @example
   * ```
   * const owner = m.getAccount(1);
   * const myLibrary = m.library(
   *   "MyLibrary",
   *   myLibraryArtifact,
   *   { from: owner }
   * );
   * ```
   */
  library<const AbiT extends Abi>(
    libraryName: string,
    artifact: Artifact<AbiT>,
    options?: LibraryOptions,
  ): LibraryDeploymentFuture<AbiT>;

  /**
   * Call a contract function.
   *
   * @param contractFuture - The contract to call
   * @param functionName - The name of the function to call
   * @param args - The arguments to pass to the function
   * @param options - The options for the call
   *
   * @example
   * ```
   * const myContract = m.contract("MyContract");
   * const myContractCall = m.call(myContract, "updateCounter", [100]);
   * ```
   */
  call<ContractNameT extends string, FunctionNameT extends string>(
    contractFuture: CallableContractFuture<ContractNameT>,
    functionName: FunctionNameT,
    args?: ArgumentType[],
    options?: CallOptions,
  ): ContractCallFuture<ContractNameT, FunctionNameT>;

  /**
   * Statically call a contract function and return the result.
   *
   * This allows you to read data from a contract without sending a transaction.
   * This is only supported for functions that are marked as `view` or `pure`,
   * or variables marked `public`.
   *
   * @param contractFuture - The contract to call
   * @param functionName - The name of the function to call
   * @param args - The arguments to pass to the function
   * @param nameOrIndex - The name or index of the return argument to read
   * @param options - The options for the call
   *
   * @example
   * ```
   * const myContract = m.contract("MyContract");
   * const counter = m.staticCall(
   *   myContract,
   *   "getCounterAndOwner",
   *   [],
   *   "counter"
   * );
   * ```
   */
  staticCall<ContractNameT extends string, FunctionNameT extends string>(
    contractFuture: CallableContractFuture<ContractNameT>,
    functionName: FunctionNameT,
    args?: ArgumentType[],
    nameOrIndex?: string | number,
    options?: StaticCallOptions,
  ): StaticCallFuture<ContractNameT, FunctionNameT>;

  /**
   * ABI encode a function call, including both the function's name and
   * the parameters it is being called with. This is useful when
   * sending a raw transaction to invoke a smart contract or
   * when invoking a smart contract proxied through an intermediary function.
   *
   * @param contractFuture - The contract that the ABI for encoding will be taken from
   * @param functionName - The name of the function
   * @param args - The arguments to pass to the function
   * @param options - The options for the call
   *
   * @example
   * ```
   * const myContract = m.contract("MyContract");
   * const data = m.encodeFunctionCall(myContract, "updateCounter", [100]);
   * m.send("callUpdateCounter", myContract, 0n, data);
   * ```
   */
  encodeFunctionCall<
    ContractNameT extends string,
    FunctionNameT extends string,
  >(
    contractFuture: CallableContractFuture<ContractNameT>,
    functionName: FunctionNameT,
    args?: ArgumentType[],
    options?: EncodeFunctionCallOptions,
  ): EncodeFunctionCallFuture<ContractNameT, FunctionNameT>;

  /**
   * Create a future for an existing deployed contract so that it can be
   * referenced in subsequent futures.
   *
   * The resulting future can be used anywhere a contract future or address
   * is expected.
   *
   * @param contractName - The name of the contract
   * @param address - The address of the contract
   * @param options - The options for the instance
   *
   * @example
   * ```
   * const myContract = m.contractAt("MyContract", "0x1234...");
   * ```
   */
  contractAt<ContractNameT extends string>(
    contractName: ContractNameT,
    address:
      | string
      | AddressResolvableFuture
      | ModuleParameterRuntimeValue<string>,
    options?: ContractAtOptions,
  ): NamedArtifactContractAtFuture<ContractNameT>;

  /**
   * Create a future for an existing deployed contract so that it can be
   * referenced in subsequent futures.
   *
   * The resulting future can be used anywhere a contract future or address is
   * expected.
   *
   * @param contractName - The name of the contract
   * @param artifact - The artifact of the contract
   * @param address - The address of the contract
   * @param options - The options for the instance
   *
   * @example
   * ```
   * const myContract = m.contractAt(
   *   "MyContract",
   *   myContractArtifact,
   *   "0x1234..."
   * );
   * ```
   */
  contractAt<const AbiT extends Abi>(
    contractName: string,
    artifact: Artifact<AbiT>,
    address:
      | string
      | AddressResolvableFuture
      | ModuleParameterRuntimeValue<string>,
    options?: ContractAtOptions,
  ): ContractAtFuture<AbiT>;

  /**
   * Read an event argument from a contract.
   *
   * The resulting value can be used wherever a value of the same type is
   * expected i.e. contract function arguments, `send` value, etc.
   *
   * @param futureToReadFrom - The future to read the event from
   * @param eventName - The name of the event
   * @param nameOrIndex - The name or index of the event argument to read
   * @param options - The options for the event
   *
   * @example
   * ```
   * const myContract = m.contract("MyContract");
   * // assuming the event is emitted by the constructor of MyContract
   * const owner = m.readEventArgument(myContract, "ContractCreated", "owner");
   *
   * // or, if the event is emitted during a function call:
   * const myContractCall = m.call(myContract, "updateCounter", [100]);
   * const counter = m.readEventArgument(
   *   myContractCall,
   *   "CounterUpdated",
   *   "counter",
   *   {
   *     emitter: myContract
   *   }
   * );
   * ```
   */
  readEventArgument(
    futureToReadFrom:
      | NamedArtifactContractDeploymentFuture<string>
      | ContractDeploymentFuture
      | SendDataFuture
      | ContractCallFuture<string, string>,
    eventName: string,
    nameOrIndex: string | number,
    options?: ReadEventArgumentOptions,
  ): ReadEventArgumentFuture;

  /**
   * Send an arbitrary transaction.
   *
   * Can be used to transfer ether and/or send raw data to an address.
   *
   * @param id - A custom id for the Future
   * @param to - The address to send the transaction to
   * @param value - The amount of wei to send
   * @param data - The data to send
   * @param options - The options for the transaction
   *
   * @example
   * ```
   * const myContract = m.contract("MyContract");
   * m.send("sendToMyContract", myContract, 100);
   *
   * // you can also send to an address directly
   * const owner = m.getAccount(1);
   * const otherAccount = m.getAccount(2);
   * m.send("sendToOwner", owner, 100, undefined, { from: otherAccount });
   * ```
   */
  send(
    id: string,
    to:
      | string
      | AddressResolvableFuture
      | ModuleParameterRuntimeValue<string>
      | AccountRuntimeValue,
    value?: bigint | ModuleParameterRuntimeValue<bigint>,
    data?: string | EncodeFunctionCallFuture<string, string>,
    options?: SendDataOptions,
  ): SendDataFuture;

  /**
   * Allows you to deploy then use the results of another module within this
   * module.
   *
   * @param ignitionSubmodule - The submodule to use
   *
   * @example
   * ```
   * const otherModule = buildModule("otherModule", (m) => {
   *  const myContract = m.contract("MyContract");
   *
   *  return { myContract };
   * });
   *
   * const mainModule = buildModule("mainModule", (m) => {
   *  const { myContract } = m.useModule(otherModule);
   *
   *  const myContractCall = m.call(myContract, "updateCounter", [100]);
   * });
   * ```
   */
  useModule<
    ModuleIdT extends string,
    ContractNameT extends string,
    IgnitionModuleResultsT extends IgnitionModuleResult<ContractNameT>,
  >(
    ignitionSubmodule: IgnitionModule<
      ModuleIdT,
      ContractNameT,
      IgnitionModuleResultsT
    >,
  ): IgnitionModuleResultsT;
}
