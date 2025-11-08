import React, {useEffect, useRef, useState} from "react";
import 'bootstrap/dist/css/bootstrap.css';
import './FileUploadComponent.css';
import './custom_highlight/pytternHighlight.css'
import CodeMirror, { Compartment, EditorView } from "@uiw/react-codemirror";
import { pytternExtension } from "./custom_highlight/pytternSyntaxHighlighter.ts";
import { highlightRange } from "./custom_highlight/highlightRange.ts";
import { useAppDispatch, useAppSelector } from "../../../../../common/hooks.ts";
import { setPatternCode, setCode as setCodeAction } from "../../../matcherSlice.ts";
import { validateCode } from "../../../matcherThunks.ts";

interface FileUploadProps {
    name: string;
    pos: [number, number];
}

const highlightCompartment = new Compartment();

const FileUploadComponent: React.FC<FileUploadProps> = ({ name, pos }) => {
    const dispatch = useAppDispatch();
    
    // Get the code and validation errors from Redux
    const reduxCode = useAppSelector((state) => 
        name === "pattern" ? state.matcher.patternCode : state.matcher.code
    );
    
    const validationError = useAppSelector((state) => 
        name === "pattern" ? state.matcher.validationErrors.pattern : state.matcher.validationErrors.code
    );
    
    const [localCode, setLocalCode] = useState<string>(reduxCode);
    const [lang, setLang] = useState<string>("");

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const editorRef = useRef<EditorView | null>(null);

    // Sync local state with Redux state
    useEffect(() => {
        setLocalCode(reduxCode);
    }, [reduxCode]);

    // Validate code using Redux thunk
    useEffect(() => {
        if(localCode === "") return;
        
        const type = name === "pattern" ? "pattern" : "code";
        dispatch(validateCode({ code: localCode, lang, type }));
    }, [localCode, dispatch, name, lang]);

    const handleCodeChange = (value: any) => {
        if(timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            setLocalCode(value)
        }, 500)
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            const extension: string = file.name.split('.').pop() || "";
            setLang(extension);

            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setLocalCode(content); // Update the local code state with file content
            };
            reader.onerror = () => {
                alert("Failed to read the file. Please try again.");
            };

            reader.readAsText(file); // Read the file as text
        }
    };

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current!.dispatch({
                effects: highlightCompartment.reconfigure(highlightRange(pos[0], pos[1])),
            });
        }
      }, [pos]);

    const is_disabled = !localCode;

    const handleClear = (e: React.FormEvent) => {
        e.preventDefault();
        setLocalCode("");
        if (name === "pattern") {
            dispatch(setPatternCode(""));   
        } else {
            dispatch(setCodeAction(""));
        }
    };

    return (
        <div className="form-floating">
            <form className="row mb-3">
                <div className="col-auto">
                    <input
                        type="file"
                        className="form-control"
                        accept=".py,.pyt,.pyh,.java,.jat"
                        name="file"
                        id="file"
                        onChange={handleFileChange} // File selection handler
                        required
                    />
                </div>
            </form>
            <div className="row m-1">
                <p style={{color: "red"}}>{validationError}</p>
                <label htmlFor={name} style={{ height: "fit-content" }}>
                    {name}
                </label>
                <CodeMirror 
                    value={localCode}
                    onChange={handleCodeChange}
                    placeholder={name}
                    extensions={[pytternExtension, highlightCompartment.of(highlightRange(pos[0], pos[1]))]}
                    onCreateEditor={(view) => { editorRef.current = view; }}
                />
            </div>
            <form
                className="row p-4 mw-25"
                onSubmit={handleClear}
            >
                <input
                    type="submit"
                    value="Clear"
                    className="btn btn-danger"
                    disabled={is_disabled}
                />
            </form>
        </div>
    );
};

export default FileUploadComponent;
