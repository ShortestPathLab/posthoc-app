// monaco-editor 0.55 removed the TypeScript language service from the
// `monaco.languages.typescript` namespace (it is now a `{ deprecated: true }`
// stub). The runtime API was relocated to this contribution module, which ships
// no type declarations of its own — declare the parts we use here so the
// completion/hover/diagnostics providers in `register.ts`/`createFile.ts` type-check.
declare module "monaco-editor/esm/vs/language/typescript/monaco.contribution" {
  import type { Uri } from "monaco-editor";

  export interface CompletionEntry {
    name: string;
    sortText: string;
    kind: string;
  }

  export interface CompletionInfo {
    entries: CompletionEntry[];
  }

  export interface SymbolDisplayPart {
    text: string;
  }

  export interface QuickInfo {
    displayParts?: SymbolDisplayPart[];
    documentation?: SymbolDisplayPart[];
  }

  export interface Diagnostic {
    messageText: string;
    code: number;
    start?: number;
    length?: number;
  }

  export interface TypeScriptWorker {
    getCompletionsAtPosition(
      fileName: string,
      position: number,
    ): Promise<CompletionInfo | undefined>;
    getQuickInfoAtPosition(fileName: string, position: number): Promise<QuickInfo | undefined>;
    getSyntacticDiagnostics(fileName: string): Promise<Diagnostic[]>;
    getSemanticDiagnostics(fileName: string): Promise<Diagnostic[]>;
    getSuggestionDiagnostics(fileName: string): Promise<Diagnostic[]>;
  }

  export const getTypeScriptWorker: () => Promise<(...uris: Uri[]) => Promise<TypeScriptWorker>>;

  export const typescriptDefaults: {
    setCompilerOptions(options: Record<string, unknown>): void;
    getCompilerOptions(): Record<string, unknown>;
  };
}
