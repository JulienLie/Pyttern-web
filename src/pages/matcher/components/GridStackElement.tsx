import React, {PropsWithChildren} from "react";
import 'bootstrap/dist/css/bootstrap.css';

interface GridStackElementProps {
    x?: number,
    y?: number,
    w?: number,
    h?: number,
    min_w?: number,
    min_h?: number
}

const GridStackElement: React.FC<PropsWithChildren<GridStackElementProps>> = ({
                                                                                  children,
                                                                                  x,
                                                                                  y,
                                                                                  w,
                                                                                  h,
                                                                                  min_w,
                                                                                  min_h}
) => {

    return (
        <div className="grid-stack-item border border-dark-subtle"
             gs-x={x} gs-y={y} gs-w={w} gs-h={h} gs-min-w={min_w} gs-min-h={min_h}>
            <div className="grid-stack-item-content">
                {children}
            </div>
        </div>
    )
}

export default GridStackElement;