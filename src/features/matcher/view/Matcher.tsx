import './Matcher.css';

import {lazy, Suspense, useEffect, useRef} from "react";
import {GridStack} from "gridstack";
import { useAppDispatch, useAppSelector } from "../../../common/hooks.ts";
import { setPatternCode, setCode } from "../matcherSlice.ts";

import GridStackWrapper from "./components/GridStackWrapper.tsx";
import GridStackElement from "./components/GridStackElement.tsx";
import PDAStackComponent from "./components/StackComponent/PDAStackComponent.tsx";

const MatchController = lazy(() => import("./components/MatchController.tsx"));
const FileUploadComponent = lazy(() => import("./components/FileUploadComponent/FileUploadComponent.tsx"));
const CytoscapeComponent = lazy(() => import("./components/CytoscapeComponent/CytoscapeComponent.tsx"));

// Re-export types for backward compatibility
export type { MatchState, State } from "../matcherModels.ts";

function Matcher() {
    const dispatch = useAppDispatch();
    // Get state from Redux store
    const { patternCode, code, matchState } = useAppSelector((state) => state.matcher);

    const gridRef = useRef<GridStack | null>(null);

    // Load preloaded data from sessionStorage (set by compound page when opening in new tab)
    useEffect(() => {
        const preloadData = sessionStorage.getItem('matcher_preload');
        if (preloadData) {
            sessionStorage.removeItem('matcher_preload');
            const { patternCode, code } = JSON.parse(preloadData);
            if (patternCode) dispatch(setPatternCode(patternCode));
            if (code) dispatch(setCode(code));
        }
    }, [dispatch]);

    return (
    <>
      <div className="matcher-container">
        <GridStackWrapper ref={gridRef}>
            <GridStackElement x={0} y={0} w={6} h={2} min_w={3} min_h={2}>
                <Suspense fallback={<div>Loading...</div>}>
                    <FileUploadComponent name="pattern" pos={[0, 0]}/>
                </Suspense>
            </GridStackElement>

            <GridStackElement y={0} w={6} h={2} min_w={3} min_h={2}>
                <Suspense fallback={<div>Loading...</div>}>
                    <FileUploadComponent name="code" pos={matchState.codePos}/>
                </Suspense>
            </GridStackElement>

    
            <GridStackElement x={0} y={1} w={5} h={4} min_w={3} min_h={3}>
                <Suspense fallback={<div>Loading...</div>}>
                    <CytoscapeComponent name="pattern" code={patternCode} grid={gridRef.current || undefined} />
                </Suspense>
            </GridStackElement>


            <GridStackElement y={1} w={1} h={4} min_w={1} min_h={1}>
                <Suspense fallback={<div>Loading...</div>}>
                    <PDAStackComponent currentStack={matchState.currentStack} previousStack={matchState.previousStack}/>
                </Suspense>
            </GridStackElement>

            <GridStackElement y={1} w={6} h={4} min_w={3} min_h={3}>
                <Suspense fallback={<div>Loading...</div>}>
                    <CytoscapeComponent name="code" code={code} grid={gridRef.current || undefined} />
                </Suspense>
            </GridStackElement>

            <GridStackElement x={0} y={2} w={12} min_w={3}>
                <Suspense fallback={<div>Loading...</div>}>
                    <MatchController />
                </Suspense>
            </GridStackElement>
        </GridStackWrapper>
      </div>
    </>
  )
}

export default Matcher
