import { ChangeEvent, ReactElement, ReactNode, useEffect, useRef, useState } from "react"
import 'bootstrap/dist/css/bootstrap.css';
import CodeMirror from "@uiw/react-codemirror";
import cytoscape from "cytoscape";
import { CytoscapeType, generateCytoscape } from "../components/CytoscapeComponent/CytoscapeComponent.helper";
import { pytternExtension } from "../components/FileUploadComponent/custom_highlight/pytternSyntaxHighlighter";


interface Macro{
    name: string;
    code: string;
    transformations: {
        [name: string]: cytoscape.Core;
    };
    error?: string;
}

function Macros() {
    const [macro_list, set_macro_list] = useState<Macro[]>([])
    const [current_macro_name, set_current_macro_name] = useState<string>("")
    const [macro_list_html, set_macro_list_html] = useState<ReactElement[]>([])
    const [cy_list, set_cy_list] = useState<{[name: string]: cytoscape.Core}>({})
    const [options, setOptions] = useState<ReactNode[]>([]);
    const [sel_opt, select_option] = useState<string>("")

    const cyRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);

    const timeoutRef = useRef<number | null>(null);

    // On mount, load macros
    useEffect(() => {
        fetch("/api/loaded_macro", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })
        .then((response) => {
            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json()
        })
        .then((response) => {
            if(response.status !== "ok"){
                return
            }

            const new_macros = []
            for(let macro of response.macros){
                const new_macro: Macro = macro
                console.log(new_macro)
                for(let transf_name in new_macro.transformations){
                    console.log(new_macro.transformations[transf_name])
                    let transf = new_macro.transformations[transf_name]
                    // @ts-ignore -> we get a json format and transorm it to the right format
                    let cy = generateCytoscape(CytoscapeType.GRAPH, transf)
                    new_macro.transformations[transf_name] = cy
                }
                new_macros.push(new_macro)
            }
            set_macro_list(new_macros)
        })
    }, [])

    function validateMacro(macro_name: string, macro_code: string){
        fetch("/api/parse_macro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: macro_code}), // Send the code as JSON
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((response) => {
            if(response.status !== "ok"){
                const macro = macro_list.find((macro) => macro.name === macro_name)
                if(macro) macro.error = response.message
                return               
            }

            const new_macro: Macro = response.macro
            console.log(new_macro)
            for(let transf_name in new_macro.transformations){
                console.log(new_macro.transformations[transf_name])
                let transf = new_macro.transformations[transf_name]
                // @ts-ignore -> we get a json format and transorm it to the right format
                let cy = generateCytoscape(CytoscapeType.GRAPH, transf)
                new_macro.transformations[transf_name] = cy
            }
            const new_macro_list = macro_list.map((macro) => macro.name === macro_name?new_macro:macro)
            set_macro_list(new_macro_list)
            if(current_macro_name == macro_name){
                set_macro(new_macro.name)
            }
        })
    }

    function set_macro(macro_name: string){
        set_current_macro_name(macro_name)
        set_cy_list({})
        select_option("")
    }
    

    function importMacro(){
        const imported_macro = {
            name: "imported macro",
            code: "",
            transformations: {}
        }
        set_macro_list([...macro_list, imported_macro])
    }

    function addMacro(){
        const base_name = "Macro"
        let i = 1
        let name = base_name + i
        while(macro_list.some((macro) => macro.name == name)){
            i += 1
            name = base_name + i
        }
        const code = `?# DEFINE\n?${name}()\n\n?# 1\n# Add definition here`
        const new_macro = {
            name: name,
            code: code,
            transformations: {}
        }
        set_macro_list([...macro_list, new_macro])
    }

    const current_macro = macro_list.find((macro) => macro.name === current_macro_name)

    const handleCodeChange = (value: any) => {
        if(timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            if(current_macro){
                current_macro.code = value
                validateMacro(current_macro.name, value)
            }
        }, 500)
    }

    
    useEffect(() => {
        const new_macro_list_html = []
        for(let macro of macro_list){
            const selected = macro.name == current_macro_name ? "active" : ""
            const classes = "list-group-item list-group-item-action " + selected
            new_macro_list_html.push(
                <button 
                    type="button" 
                    className={classes}
                    onClick={() => set_current_macro_name(macro.name)}
                    key={macro.name}>
                    {macro.name} {macro.error ? <span>&#9888;</span> : ""}
                </button>
            )
        }
        set_macro_list_html(new_macro_list_html)
    }, [macro_list, current_macro_name])

    useEffect(() => {
        if(!current_macro) return
        set_cy_list(current_macro.transformations)
        const options: ReactNode[] = []

        let first = ""
        for(let transf_name in current_macro?.transformations){
            if(!first) first = transf_name
            options.push(<option value={transf_name}>{transf_name}</option>)
        }
        setOptions(options)
        select_option(first)
    }, [current_macro])

    useEffect(() => {
        if(!selectRef.current || !cyRef.current) return

        for (const transf_name in cy_list) {
            cy_list[transf_name].unmount()
        }
        
        if(sel_opt) {
            cy_list[sel_opt].mount(cyRef.current)
            cy_list[sel_opt].fit()
        }

        return () => {
            if(sel_opt) cy_list[sel_opt].unmount()
        }
    }, [sel_opt])

    function changeGraph(event: ChangeEvent<HTMLSelectElement>): void {
        const value = event.target.value;
        select_option(value)
    }

    function download() {
        if(!sel_opt) return
        const png = cy_list[sel_opt].png();
        const link = document.createElement('a');
        link.href = png;
        link.download = `${sel_opt}.png`;
        link.click();
    }

    const reset = () => {
        if(!sel_opt) return
        cy_list[sel_opt].fit()
    }

    return (
        <div className="row h-100">
            <div className="col">
                <div className="list-group">
                    {macro_list_html}
                </div>
                <div className="list-group m-2">
                    <button type="button" onClick={addMacro} key={"add"} className="btn btn-success m-1">
                        Add macro
                    </button>
                    <button type="button" onClick={importMacro} key={"import"} className="btn btn-success m-1">
                        Import Macro
                    </button>
                </div>
            </div>
            <div className="col h-100">
                <div className="vstack container-fluid h-50">
                    <CodeMirror 
                        value={current_macro?.code}
                        placeholder={"Write the macro here..."}
                        onChange={handleCodeChange}
                        extensions={[pytternExtension]}
                        height="100%"
                    />
                </div>  
                <div className="vstack container-fluid h-50 border">
                    <div className="input-group">
                        <select className="form-select" id={"select"} ref={selectRef} onChange={changeGraph}>
                            {options}
                        </select>
                        <button className="btn btn-primary ms-auto" onClick={reset}>Reset</button>
                        <button className="btn btn-primary" onClick={download}>Download</button>
                    </div>
                    <div id={"macro_repr"} ref={cyRef} className="p-2 h-100"></div>
                </div>
            </div>
        </div>
    )
}

export default Macros