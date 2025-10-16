import React, {ChangeEventHandler, ReactNode, useEffect, useRef, useState} from "react";
import 'bootstrap/dist/css/bootstrap.css';
import {GridItemHTMLElement, GridStack, GridStackNode} from "gridstack";
import {CytoscapeType, generateCytoscape} from "./CytoscapeComponent.helper.ts";
import {Core} from "cytoscape";
import { MatchState, State } from "../../pages/Matcher.tsx";

interface CytoscapeComponentsProps {
    name: string,
    code?: string,
    grid?: GridStack,
    state: State,
}

interface CytoscapeOption {
    cy: Core;
    label: string;
}

const CytoscapeComponent: React.FC<CytoscapeComponentsProps> = ({name, code, grid, state}) => {
    const follow_name = "follow_" + name;
    const cy_name = name + "-cy";

    const cyRef = useRef<HTMLDivElement>(null);
    const [cys, setCys] = useState<CytoscapeOption[]>([]);
    const [options, setOptions] = useState<ReactNode[]>([]);

    const gridRefDiv = useRef<HTMLDivElement>(null);
    const controlRef = useRef<HTMLDivElement>(null);
    const followRef = useRef<HTMLInputElement>(null);
    grid?.on('change', function (_: Event, items: GridStackNode[]) {
        items.forEach((item) => {
            if (item.el) resize(item.el);
        })
    });

    window.addEventListener('resize', function(_) {
        if(!grid) return
        for(let gridItem of grid.getGridItems()){
            if(!gridItem) continue
            if (gridItem instanceof HTMLElement)
                resize(gridItem)
        }
    }, true);

    function resize(item: GridItemHTMLElement) {
        if (item.contains(gridRefDiv.current)) {
            const div = cyRef.current
            const ctrl = controlRef.current
            if (div && ctrl && item) {
                const rect = item.getBoundingClientRect();
                const ctrl_rect = ctrl.getBoundingClientRect();
                const to_remove = ctrl_rect.height + 25;
                div.style.width = (rect.width - 20) + "px";
                div.style.height = (rect.height - to_remove) + "px";
            }
        }
    }

    function download() {
        cys.forEach((cyOption) => {
            const png = cyOption.cy.png();
            const link = document.createElement('a');
            link.href = png;
            link.download = `${cyOption.label}.png`;
            link.click();
        });
    }

    // Disable gridstack interactions when interacting with the Cytoscape container
    useEffect(() => {
        const handleMouseDown = () => grid?.disable();
        const handleMouseUp = () => grid?.enable();
        const element = cyRef.current;
        element?.addEventListener("mousedown", handleMouseDown);
        element?.addEventListener("mouseup", handleMouseUp);

        grid?.getGridItems().forEach(resize);

        return () => {
            element?.removeEventListener("mousedown", handleMouseDown);
            element?.removeEventListener("mouseup", handleMouseUp);
        };
    }, [grid]);


    useEffect(() => {
        const options = [];
        for (let i = 0; i < cys.length; i++) {
            const cy = cys[i];
            options.push(<option value={cy.label} key={cy.label + "_" + i}>{cy.label}</option>)
            if (cyRef.current && i == 0) {
                cy.cy.mount(cyRef.current)
                cy.cy.fit()
            }
        }
        setOptions(options);

        return () => {
            for (const cy of cys) {
                cy.cy.unmount()
            }
        }
    }, [cys]);

    // POST request to the server when the `code` changes
    useEffect(() => {
        if (code) {
            fetch('/api/' + name, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({code}), // Send the code as JSON
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data.status === "error") {
                        throw new Error(data.message);
                    }
                    return data;
                })
                .then((data) => {
                    const new_cys = [];
                    for (const element in data.graph) {
                        const type: CytoscapeType = CytoscapeType[element as keyof typeof CytoscapeType];
                        const cy = generateCytoscape(type, data.graph[element]);
                        new_cys.push({
                            cy,
                            label: element
                        });
                    }
                    setCys(new_cys);
                })
                .catch((error) => {
                    console.error("Error sending code to the server:", error);
                });
        }
    }, [code, name]);

    useEffect(() => {
        const node: string = state.currentState[name + "Node" as keyof MatchState];
        for (const cy of cys) {
            const cytoscape = cy.cy;
            cytoscape.nodes().style({'background-color': '#BBB'});

            for(const node of state.prevMatchedNodes){
                cytoscape.nodes(`[id = "${node[name + "Node" as keyof MatchState]}"]`).style({'background-color': '#ff0000'});
            }

            for(const node of state.matchedNodes){
                cytoscape.nodes(`[id = "${node[name + "Node" as keyof MatchState]}"]`).style({'background-color': '#008'});
            }

            cytoscape.nodes(`[id = "${node}"]`).style({'background-color': '#080'});
            if (followRef.current && followRef.current.checked) {
                const anim = cy.cy.animation({
                    center: {eles: cy.cy.nodes(`[id = "${node}"]`)},
                    duration: 200,
                })
                if(anim.play) anim.play()
            }
        }
    }, [state, name, cys, state.prevMatchedNodes, state.matchedNodes]);

    const changeGraph: ChangeEventHandler<HTMLSelectElement> = (event) => {
        for (const cy of cys) {
            cy.cy.unmount()
        }
        const value = event.target.value;
        for (const cy of cys) {
            if (cyRef.current && cy.label === value) {
                cy.cy.mount(cyRef.current)
                cy.cy.fit()
            }
        }
    }

    const reset = () => {
        for (const cy of cys) {
            cy.cy.fit()
        }
    }

    return (
        <div className="vstack container-fluid" ref={gridRefDiv}>
            <div className="input-group" ref={controlRef}>
                <label className="input-group-text">
                    Follow <input type="checkbox" className="form-check-input" id={follow_name} ref={followRef}/>
                </label>
                <select className="form-select" id={name + "-select"} onChange={changeGraph}>
                    {options}
                </select>
                <button className="btn btn-primary ms-auto" onClick={reset}>Reset</button>
                <button className="btn btn-primary" onClick={download}>Download</button>
            </div>
            <div id={cy_name} ref={cyRef} className="p-2"></div>
        </div>
    );
};

export default CytoscapeComponent;
