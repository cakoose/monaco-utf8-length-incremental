import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

// Monaco needs to know how to create web workers for its language services.
// For this demo we only need the base editor worker (no language-specific features).
// Add json/css/html/ts workers here if you need syntax validation for those languages.

self.MonacoEnvironment = {
  getWorker(_: string, _label: string) {
    return new editorWorker();
  },
};
