// Shared application types (e.g., base use case interface)

export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}
