import React, {ChangeEventHandler, ReactElement, useEffect} from "react";
import { useAppDispatch, useAppSelector } from "../../../../common/hooks.ts";
import { setStep as setStepAction } from "../../matcherSlice.ts";
import { startMatch, fetchStepData } from "../../matcherThunks.ts";

const MatchController: React.FC = () => {
    const dispatch = useAppDispatch();
    
    const { 
        code,
        patternCode,
        hasStarted,
        step,
        maxStep,
        matchStates: matchStateNumbers,
        isLoading,
    } = useAppSelector((state) => state.matcher);
    
    const canStart = code !== "" && patternCode !== "";
    const [matchStates, setMatchStates] = React.useState<ReactElement[]>([]);

    const numberInputRef = React.useRef<HTMLInputElement>(null);
    const rangeInputRef = React.useRef<HTMLInputElement>(null);

    // Create match state options when matchStateNumbers changes
    useEffect(() => {
        const matchListValue = matchStateNumbers.map((i) => (
            <option key={i} value={i}/>
        ));
        setMatchStates(matchListValue);
    }, [matchStateNumbers]);

    // Handle start match button click
    const handleStartMatch = () => {
        console.log("Start match");
        dispatch(startMatch());
    };

    // Fetch step data when step changes and match has started
    useEffect(() => {
        if (!hasStarted) return;
        
        console.log("Getting step", step);
        dispatch(fetchStepData(step));

        // Update input values
        if (numberInputRef.current) {
            numberInputRef.current.value = "" + step;
        }
        if (rangeInputRef.current) {
            rangeInputRef.current.value = "" + step;
        }
    }, [dispatch, step, hasStarted]);

    const prevStep = () => {
        if (step > 0) dispatch(setStepAction(step - 1));
    }

    const nextStep = () => {
        if (step < maxStep) dispatch(setStepAction(step + 1));
    }

    const onNumberChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        const target = event.target;
        const value = target.value;
        console.log("Changing step", value);
        dispatch(setStepAction(parseInt(value)));
    }

    return (
        <div className="row">
            <button className="btn-primary btn ctrl col-1 mx-2" id="first"
                    disabled={!hasStarted} onClick={() => dispatch(setStepAction(0))}>First
            </button>
            <button className="btn-primary btn ctrl col-1 mx-2" id="prev"
                    disabled={!hasStarted} onClick={prevStep}>Prev
            </button>
            <button className="btn btn-primary ctrl col-1 mx-2" id="start"
                    disabled={!canStart || isLoading} onClick={handleStartMatch}>
                {isLoading ? 'Starting...' : 'Start'}
            </button>
            <label className="col-1 mx-2">
                <input
                    className="form-control ctrl"
                    type="number"
                    defaultValue="0"
                    id="step"
                    max={maxStep}
                    min="0"
                    disabled={!hasStarted}
                    onChange={onNumberChange}
                    ref={numberInputRef}
                />
            </label>
            <label className="col-5 mx-2">
                <input
                    className="w-100 ctrl"
                    type="range"
                    defaultValue="0"
                    id="range"
                    list="matches"
                    max={maxStep}
                    min="0"
                    disabled={!hasStarted}
                    onChange={onNumberChange}
                    ref={rangeInputRef}
                />
                <datalist id="matches">
                    {matchStates}
                </datalist>
            </label>
            <button className="btn-primary btn ctrl col-1 mx-2" id="next"
                    disabled={!hasStarted} onClick={nextStep}>Next
            </button>
            <button className="btn-primary btn ctrl col-1 mx-2" id="last"
                    disabled={!hasStarted} onClick={() => dispatch(setStepAction(maxStep))}>Last
            </button>
        </div>
    );
}

export default MatchController;