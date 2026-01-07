import * as monaco from "monaco-editor";
import "./index.css";

type CountState = {
    jsLength: number,
    utf8Length: number,
};

type State = {
    countState: CountState
    model: monaco.editor.ITextModel,
    // On every onDidContentChange, we need to know what text was added or deleted, so we can
    // incrementally update our state.  onDidContentChange will tell you what text was added, but
    // not what was deleted; it just gives you the range.  To determine the deleted text, we
    // maintain a "shadow copy" of the entire ITextModel.  When onDidContentChange fires, we ask the
    // shadow copy what text was in the deleted range.
    shadowModel: monaco.editor.ITextModel,
};

let state: State | null = null;

const countDisplay = document.getElementById("count-display");
const updateCountDisplay = (monacoLength: number, countState: CountState): void => {
    const text = countState === null ? "no model loaded" : `Monaco length: ${monacoLength}, JS String#length: ${countState.jsLength}, UTF-8 length: ${countState.utf8Length}`;
    while (countDisplay.firstChild) {
        countDisplay.removeChild(countDisplay.firstChild);
    }
    countDisplay.appendChild(document.createTextNode(text));
};

const calculateUtf8Length = (text: string): number => {
    return new TextEncoder().encode(text).length;
};

const onDidChangeContent = (ev: monaco.editor.IModelContentChangedEvent): void => {
    console.log('onDidChangeContent');
    if (state === null) {
        console.warn("Got model.onDidChangeContent but state is null");
        return;
    }
    const {countState, model, shadowModel} = state;

    // Assuming this is O(1), so just call it every time.
    const monacoLength = model.getCharacterCountInRange(model.getFullModelRange());

    let lastOffsetStart = null;

    // Update 'jsStringLength' and 'utf8Length' incrementally by looking the changes.
    for (const change of ev.changes) {
        console.log(change);
        const deletedText = shadowModel.getValueInRange(change.range);
        if (deletedText.length !== 0) {
            console.log("deletedText", JSON.stringify(deletedText));
        }
        countState.jsLength -= deletedText.length;
        countState.jsLength += change.text.length;
        countState.utf8Length -= calculateUtf8Length(deletedText);
        countState.utf8Length += calculateUtf8Length(change.text);

        // Apply the change to the 'shadowModel', so that it stays in sync with 'model'.
        shadowModel.applyEdits([{
            range: monaco.Range.lift(change.range),
            text: change.text,
            // TODO: 'event.forceMoveMarker' is present when I console.log(event), but is not in the
            // TS type.  Maybe I need to cast 'event' to a more specific type?
        }]);
        // TODO: Am I applying the change correctly?  For example, if one change deletes some text,
        // does that require adjusting the offset of the other changes?  I tested this by selecting
        // text and dragging it, which generates two changes in a single event.  It appears that the
        // changes are ordered from highest offset to lowest, so applying the changes from first to
        // last should be safe.  Not sure if this is 100% reliable so let's check it here.
        if (lastOffsetStart !== null && lastOffsetStart <= (change.rangeOffset + change.rangeLength)) {
            throw new Error(`onDidChangeContent changes have non-decreasing rangeOffsets: ${JSON.stringify([lastOffsetStart, change.rangeOffset])}`);
        }
        lastOffsetStart = change.rangeOffset;
    }
    updateCountDisplay(monacoLength, countState);
};

const onDidChangeModel = (): void => {
    console.log('onDidChangeModel');
    const model = editor.getModel();
    if (model !== null) {
        const text = model.getValue();
        const shadowModel = monaco.editor.createModel(text);
        const countState = {
            jsLength: text.length,
            utf8Length: calculateUtf8Length(text),
        };
        const monacoLength = model.getCharacterCountInRange(model.getFullModelRange());
        updateCountDisplay(monacoLength, countState);
        model.onDidChangeContent(onDidChangeContent);
        state = {countState, model, shadowModel};
    } else {
        state = null;
    }
};

const editor = monaco.editor.create(document.getElementById("monaco-editor"), {
    value: "🚀",
});

editor.onDidChangeModel(onDidChangeModel);
onDidChangeModel();
