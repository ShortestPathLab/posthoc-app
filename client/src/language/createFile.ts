import type { default as Monaco, editor } from "monaco-editor";

export function createFile(
  monaco: typeof Monaco,
  model: editor.ITextModel,
  id: string,
  contents: string,
  extension: string = ".ts"
) {
  const uri = monaco.Uri.file(`${model.uri.path}-${id}${extension}`);
  (
    monaco.editor.getModel(uri) ??
    monaco.editor.createModel("", "typescript", uri)
  ).setValue(contents);
  return uri;
}

export async function getInstance(
  monaco: typeof Monaco,
  model: editor.ITextModel,
  id: string,
  contents: string
) {
  const uri = createFile(monaco, model, id, contents);
  const worker = await (
    await monaco.languages.typescript.getTypeScriptWorker()
  )(uri);
  return {
    uri,
    worker,
    dispose: () => monaco.editor.getModel(uri)?.setValue?.(""),
  };
}
