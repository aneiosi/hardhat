import type { Artifact, BuildInfo } from "../../types/artifact.js";
import type { JournalMessage } from "../execution/types/messages.js";

/**
 * Read and write to the deployment storage.
 *
 * @beta
 */
export interface DeploymentLoader {
  recordToJournal(message: JournalMessage): Promise<void>;
  readFromJournal(): AsyncGenerator<JournalMessage>;
  loadArtifact(artifactId: string): Promise<Artifact>;
  storeUserProvidedArtifact(
    futureId: string,
    artifact: Artifact,
  ): Promise<void>;
  storeNamedArtifact(
    futureId: string,
    contractName: string,
    artifact: Artifact,
  ): Promise<void>;
  storeBuildInfo(futureId: string, buildInfo: BuildInfo): Promise<void>;
  recordDeployedAddress(
    futureId: string,
    contractAddress: string,
  ): Promise<void>;
}
