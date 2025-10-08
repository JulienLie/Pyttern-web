import cytoscape from "cytoscape";
import dagre, {DagreLayoutOptions} from "cytoscape-dagre";

cytoscape.use(dagre);

export enum CytoscapeType {
    TREE,
    GRAPH,
}

export interface CytoscapeData {
    content: CytoscapeTreeData | CytoscapeGraphData;
    id: string;
    type: CytoscapeType;
}

interface CytoscapeTreeData {
    name: string;
    children: CytoscapeTreeData[];
    id: string;
}

interface Transition {
    q: number;
    a: string;
    A: string;
    t: string[];
    q_prime: number;
    alpha: string;
}

interface CytoscapeGraphData {
    states: number[];
    input_symbols: string[];
    stack_symbols: string[];
    transitions: {[state: number]: Transition[]; }
}

function generate_cytoscape(){
    return cytoscape({
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#BBB',
                    'label': 'data(label)'
                }
            },
            {
                selector: 'node[symbol]',
                style: {
                    'label': 'data(symbol)',
                    'text-valign': 'center',
                }
            }
            ,{
                selector: 'node.merged',
                style: {
                    //'text-margin-y': '-10px', // adjusts the label positioning slightly up
                    'overlay-opacity': 0, // ensures no extra selection box around the node
                    'text-wrap': 'wrap', // to make sure it wraps if label is large
                    'text-rotation': 'none',
                    'text-valign': 'center',
                    'label': function(ele: { data: (arg0: string) => string; }) { return ele.data("label") + "\n\n+"; }
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                }
            },
            {
                selector: 'edge[label]',
                style: {
                    label: 'data(label)',
                }
            }
        ]
    })
}


export function generateCytoscape(cy_type: CytoscapeType, data: CytoscapeTreeData | CytoscapeGraphData) {
    switch (cy_type) {
        case CytoscapeType.TREE:
            return generateCytoscapeTree(data as CytoscapeTreeData)
        case CytoscapeType.GRAPH:
            return generateCytoscapeGraph(data as CytoscapeGraphData)
        default:
            console.error("Invalid Cytoscape type")
            throw new TypeError("Wrong type: " + cy_type)
    }
}

function generateCytoscapeGraph(data: CytoscapeGraphData) {
    console.log("Generating graph")
    const cy = generate_cytoscape()
    generatePatternGraph(data, cy)
    cy.layout({name: 'grid', padding: 5, avoidOverlapPadding:200}).run()
    const layout: DagreLayoutOptions = {
        name: 'dagre',
        fit: true,
        nodeDimensionsIncludeLabels: true,
        animate: false,
        rankDir: "LR",
        //nodeSep: 200,
        //rankSep: 200,
        avoidOverlap: true
    }
    /*const lt = cy.layout(layout)
    lt.run()*/
    for(let node of cy.nodes()){
        const eles = node.outgoers()
        if(eles.length > 3){
            const box = eles.boundingBox()
            const boundedLayout: DagreLayoutOptions = {
                ...layout,
                boundingBox: box
            }
            eles.layout(boundedLayout).run()
        }
    }
    return cy
}

function generateCytoscapeTree(data: CytoscapeTreeData) {
    const cy = generate_cytoscape()
    const layout: DagreLayoutOptions = {
        name: 'dagre',
        fit: true,
        nodeDimensionsIncludeLabels: true,
        animate: true
    }
    recursive_generation(data, cy)
    const lt = cy.layout(layout)
    setTimeout(() => lt.run(), 1)
    return cy
}

function recursive_generation(node: CytoscapeTreeData, cy: cytoscape.Core) {
    const new_elem = cy.add({
        group: 'nodes',
        data: {label: node.name.replace("Context", ""), id:node.id, merged: false},
        //grabbable: false
    })
    new_elem.on('click', function(){
        const isMerged = new_elem.data("merged")
        if (!isMerged) {
            new_elem.data("merged", true)
            new_elem.addClass("merged"); // Add class to display "+"
            const successors = new_elem.successors()
            successors.style({'display': 'none'})
            successors.data("merged", false)
        } else {
            new_elem.data("merged", false)
            new_elem.removeClass("merged"); // Remove class to hide "+"
            new_elem.successors().style({'display': 'element'})
        }
        const layout: DagreLayoutOptions = {
            name: 'dagre',
            padding: 5,
            fit: true,
            //nodeDimensionsIncludeLabels: true,
            //nodeSep: 50,
            animate: true
        }
        cy.layout(layout).run()
    })
    if("symbol" in node) new_elem.data("symbol", node.symbol)
    for(const child of node.children) {
        const child_elem = recursive_generation(child, cy)
        cy.add({
            group: 'edges',
            data: { source: new_elem.id(), target: child_elem.id()}
        })
    }
    return new_elem
}

function generatePatternGraph(data: CytoscapeGraphData, cy: cytoscape.Core) {
    for(const state of data.states){
        cy.add({
            group: 'nodes',
            data: {id: state.toString(), label: state.toString()},
        })
    }

    for(const state in data.transitions){
        const transitions = data.transitions[state]
        for(const transition of transitions){
            const pop = transition.A.length === 0 ? "ε" : `'${transition.A}'`
            const input = transition.a.length === 0 ? "ε" : transition.a.replace("Context", "")
            const push = transition.alpha.length === 0 ? "ε" : `'${transition.alpha}'`
            const label = `${pop}, ${input} -> ${push}`
            const elem = cy.add({
                group: 'edges',
                data: { source: transition.q.toString(), target: transition.q_prime.toString(), label: label}
            })
            elem.on('click', function(){
                console.log(transition)
            })
        }
    }
}
