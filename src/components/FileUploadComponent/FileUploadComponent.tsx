import React, {useEffect, useRef, useState} from "react";
import 'bootstrap/dist/css/bootstrap.css';
import './FileUploadComponent.css';
import './custom_highlight/pytternHighlight.css'
import CodeMirror, { Compartment, EditorView } from "@uiw/react-codemirror";
import { pytternExtension } from "./custom_highlight/pytternSyntaxHighlighter";
import { highlightRange } from "./custom_highlight/highlightRange";

interface FileUploadProps {
    name: string;
    onCodeChange?: (code: string) => void;
    pos: [number, number];
}

const highlightCompartment = new Compartment();

const FileUploadComponent: React.FC<FileUploadProps> = ({ name, onCodeChange, pos }) => {
    const [code, setCode] = useState<string>(""); // State for the code content
    const [errortxt, setErrortxt] = useState<string>("");
    const [lang, setLang] = useState<string>("");

    const timeoutRef = useRef<number | null>(null);
    const editorRef = useRef<EditorView | null>(null);

    useEffect(() => {
        if(code === "") return
        fetch('/api/validate', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: code, lang: lang}), // Send the code as JSON
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if(data.status === "ok"){
                    setErrortxt("")
                    if (onCodeChange) onCodeChange(code)
                    return
                }

                const infos = data.message
                if (typeof infos === "string") {
                    setErrortxt(infos)
                    return
                }
                else{
                    setErrortxt(`Error at line ${infos.line}:${infos.column} - ${infos.msg}`)
                }
            })
    }, [code, onCodeChange, lang]);

    const handleCodeChange = (value: any) => {
        if(timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            setCode(value)
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
                setCode(content); // Update the code state with file content
            };
            reader.onerror = () => {
                alert("Failed to read the file. Please try again.");
            };

            reader.readAsText(file); // Read the file as text
        }
    };

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.dispatch({
                effects: highlightCompartment.reconfigure(highlightRange(pos[0], pos[1])),
            });
        }
      }, [pos]);

    console.log(pos)

    const is_disabled = !code;

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
                <p style={{color: "red"}}>{errortxt}</p>
                <label htmlFor={name} style={{ height: "fit-content" }}>
                    {name}
                </label>
                <CodeMirror 
                    value={code}
                    onChange={handleCodeChange}
                    placeholder={name}
                    extensions={[pytternExtension, highlightCompartment.of(highlightRange(pos[0], pos[1]))]}
                    onCreateEditor={(view) => { editorRef.current = view; }}
                />
            </div>
            <form
                className="row p-4 mw-25"
                onSubmit={() => setCode("")}
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
