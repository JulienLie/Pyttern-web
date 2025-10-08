import React, {ReactNode} from "react";
import 'bootstrap/dist/css/bootstrap.css';

interface PDAStackProps {
    currentStack: string;
    previousStack: string;
}

const PDAStackComponent: React.FC<PDAStackProps> = ({ currentStack, previousStack }) => {
    const stackElement: ReactNode[] = []
    for(let i = 0; i < currentStack.length; i++){
        const c = currentStack[i]
        let color = "bg-primary-subtle"
        if(i >= previousStack.length){
            color = "bg-success-subtle"
        }


        stackElement.push(<div className={`border text-center ${color}`}>{c}</div>)
    }

    for(let i = currentStack.length; i < previousStack.length; i++){
        const c = previousStack[i]
        stackElement.push(<div className="border text-center bg-danger-subtle opacity-50">{c}</div>)
    }

    return (
        <div className="vstack gap-1">
            <div className="border border-primary text-center bg-primary text-light">
                Stack
            </div>
            {stackElement}
        </div>
    );
};

export default PDAStackComponent;
