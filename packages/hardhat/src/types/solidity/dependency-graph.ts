import type { ResolvedFile } from "./resolved-file.js";

/**
 * A Solidity dependency graph.
 */
export interface DependencyGraph {
  /**
   * Gets a map of public source names to root files.
   */
  getRoots(): ReadonlyMap<string, ResolvedFile>;

  /**
   * Returns an iterable with all the files.
   */
  getAllFiles(): Iterable<ResolvedFile>;

  /**
   * Returns true if the graph contains the given file.
   */
  hasFile(file: ResolvedFile): boolean;

  /**
   * Returns the set of dependencies of the given file.
   *
   * @param file The file to get the dependencies of. It must be present in the
   * graph.
   */
  getDependencies(file: ResolvedFile): ReadonlySet<ResolvedFile>;

  /**
   * Returns a file by its source name, if present.
   *
   * @param sourceName The source name of the file.
   * @returns The file, if present. If found, `file.sourceName` is equal to
   * `sourceName`.
   */
  getFileBySourceName(sourceName: string): ResolvedFile | undefined;

  /**
   * Returns a subgraph of the graph, containing only the given root files and
   * their transitive dependencies.
   *
   * @param rootPublicSourceNames The public source names of the roots of the
   * subgraph. They must be present in the graph.
   */
  getSubgraph(...rootPublicSourceNames: string[]): DependencyGraph;

  /**
   * A method to merge two dependency graphs. The resulting graph will have all
   * the files of both graphs, with all the dependencies of the files in both
   * graphs, and the roots of both graphs as root.
   *
   * @param other The other DependencyGraph to merge with, which must have been
   * created with the same Resolver.
   */
  merge(other: DependencyGraph): DependencyGraph;
}
