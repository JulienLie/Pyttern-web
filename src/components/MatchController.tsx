import React, {ChangeEventHandler, MouseEventHandler, ReactElement, useEffect} from "react";
import { MatchState, State } from "../pages/Matcher";

interface MatchControllerProps {
    code?: string,
    pattern?: string,
    setState: (value: (((prevState: State) => State) | State)) => void,
}

const MatchController: React.FC<MatchControllerProps> = ({
                                                             code,
                                                             pattern,
                                                             setState
                                                         }: MatchControllerProps) => {
    const [hasStarted, setHasStarted] = React.useState<boolean>(false);
    const [step, setStep] = React.useState<number>(0);
    const [canStart, setCanStart] = React.useState<boolean>(false);
    const [maxStep, setMaxStep] = React.useState<number>(0);
    const [matchStates, setMatchStates] = React.useState<ReactElement[]>([]);

    const numberInputRef = React.useRef<HTMLInputElement>(null);
    const rangeInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        setCanStart(code !== "" && pattern !== "");
        setStep(0)
    }, [code, pattern]);

    const startMatch: MouseEventHandler<HTMLButtonElement> = () => {
        console.log("Start match");

        fetch('/api/match', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({code, pattern}), // Send the code as JSON
        })
            .then((response) => {
                if (!response.ok) {
                    setHasStarted(false);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (data.status === "error") {
                    setHasStarted(false);
                    throw new Error(data.message);
                }
                setHasStarted(true);
                setMaxStep(data.n_steps);
                setState({
                    currentState: {patternNode: data.state[0], codeNode: data.state[1]},
                    matchedNodes: [],
                    prevMatchedNodes: [],
                    currentStack: "",
                    previousStack: "",
                    codePos: [0, 0]
                });

                const matchStatesNumber = data.match_states;
                const matchListValue = [];
                for (const i of matchStatesNumber) {
                    matchListValue.push(<option key={i} value={i}/>);
                }
                setMatchStates(matchListValue);
            })


        return () => {
            setHasStarted(false);
            setMaxStep(0);
        }
    }

    useEffect(() => {
        console.log("Getting step", step);
        fetch('/api/step', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({step}), // Send the code as JSON
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
                if (numberInputRef.current) {
                    numberInputRef.current.value = "" + step;
                }
                if (rangeInputRef.current) {
                    rangeInputRef.current.value = "" + step;
                }

                const matchedNodes: MatchState[] = [];
                for (const match of data.current_matchings) {
                    matchedNodes.push({patternNode: match[0], codeNode: match[1]});
                }

                const prevMatchedNodes: MatchState[] = [];
                for (const match of data.previous_matchings) {
                    prevMatchedNodes.push({patternNode: match[0], codeNode: match[1]});
                }

                const code_pos = data.code_pos;
                code_pos[1] += 1;

                setState({
                    currentState: {patternNode: data.state[0], codeNode: data.state[1]},
                    matchedNodes: matchedNodes,
                    prevMatchedNodes: prevMatchedNodes,
                    currentStack: data.current_stack,
                    previousStack: data.previous_stack,
                    codePos: code_pos
                })

                console.log("Code pos", code_pos);
            })

    }, [setState, step]);

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    }

    const nextStep = () => {
        if (step < maxStep) setStep(step + 1);
    }

    const onNumberChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        const target = event.target;
        const value = target.value;
        console.log("Changing step", value);
        setStep(parseInt(value));
    }

    return (
        <div className="row">
            <button className="btn-primary btn ctrl col-1 mx-2" id="first"
                    disabled={!hasStarted} onClick={() => setStep(0)}>First
            </button>
            <button className="btn-primary btn ctrl col-1 mx-2" id="prev"
                    disabled={!hasStarted} onClick={prevStep}>Prev
            </button>
            <button className="btn btn-primary ctrl col-1 mx-2" id="start"
                    disabled={!canStart} onClick={startMatch}>Start
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
                    disabled={!hasStarted} onClick={() => setStep(maxStep)}>Last
            </button>
        </div>
    );
}

export default MatchController;