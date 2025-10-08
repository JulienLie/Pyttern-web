import "bootstrap/dist/css/bootstrap.css"
import {lazy, Suspense, useEffect, useRef, useState} from "react";
import {GridStack} from "gridstack";

import GridStackWrapper from "../components/GridStackWrapper.tsx";
import GridStackElement from "../components/GridStackElement.tsx";
import PDAStackComponent from "../components/StackComponent/PDAStackComponent.tsx";

const MatchController = lazy(() => import("../components/MatchController.tsx"));
const FileUploadComponent = lazy(() => import("../components/FileUploadComponent/FileUploadComponent.tsx"));
const CytoscapeComponent = lazy(() => import("../components/CytoscapeComponent/CytoscapeComponent.tsx"));


export interface MatchState {
    patternNode: string;
    codeNode: string;
    
}

export interface State {
    currentState: MatchState;
    matchedNodes: MatchState[];
    prevMatchedNodes: MatchState[];
    currentStack: string;
    previousStack: string;
    codePos: [number, number];
    //patternPos: [number, number];
}


function Matcher() {
    const [patternCode, setPatternCode] = useState<string>("");
    const [code, setCode] = useState<string>("");

    const defaultState: State = {
        currentState: {patternNode: "", codeNode: "-1"},
        matchedNodes: [],
        prevMatchedNodes: [],
        currentStack: "",
        previousStack: "",
        codePos: [0, 0],
        //patternPos: [0, 0],
    }

    const [state, setState] = useState<State>(defaultState);

    useEffect(() => {
        setState(defaultState);
    }, [patternCode, code]);

    const gridRef = useRef<GridStack | null>(null);

    return (
    <>
      <GridStackWrapper ref={gridRef}>
          <GridStackElement x={0} y={0} w={6} h={2} min_w={3} min_h={2}>
              <Suspense fallback={<div>Loading...</div>}>
                  <FileUploadComponent name="pattern" onCodeChange={setPatternCode} pos={[0, 0]}/>
              </Suspense>
          </GridStackElement>

          <GridStackElement y={0} w={6} h={2} min_w={3} min_h={2}>
              <Suspense fallback={<div>Loading...</div>}>
                  <FileUploadComponent name="code" onCodeChange={setCode} pos={state.codePos}/>
              </Suspense>
          </GridStackElement>

 
          <GridStackElement x={0} y={1} w={5} h={4} min_w={3} min_h={3}>
              <Suspense fallback={<div>Loading...</div>}>
                  <CytoscapeComponent name="pattern" code={patternCode} grid={gridRef.current || undefined}
                                      state={state} />
              </Suspense>
          </GridStackElement>


          <GridStackElement y={1} w={1} h={4} min_w={1} min_h={1}>
            <Suspense fallback={<div>Loading...</div>}>
                <PDAStackComponent currentStack={state.currentStack} previousStack={state.previousStack}/>
            </Suspense>
          </GridStackElement>

          <GridStackElement y={1} w={6} h={4} min_w={3} min_h={3}>
              <Suspense fallback={<div>Loading...</div>}>
                  <CytoscapeComponent name="code" code={code} grid={gridRef.current || undefined}
                                      state={state} />
              </Suspense>
          </GridStackElement>

          <GridStackElement x={0} y={2} w={12} min_w={3}>
              <Suspense fallback={<div>Loading...</div>}>
                  <MatchController code={code} pattern={patternCode} setState={setState}/>
              </Suspense>
          </GridStackElement>
      </GridStackWrapper>
    </>
  )
}

export default Matcher
