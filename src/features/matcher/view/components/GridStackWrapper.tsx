import {PropsWithChildren, useEffect, useRef, useImperativeHandle, forwardRef, useState} from 'react';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';

// Create a forwarded ref for the GridStack instance
const GridStackWrapper = forwardRef<GridStack | null, PropsWithChildren>(({ children }, ref) => {
    const gridRef = useRef<HTMLDivElement>(null);

    const [grid, setGrid] = useState<GridStack>();



    useEffect(() => {
        if (!gridRef.current) return;

        // Initialize GridStack
        const g = GridStack.init({
            float: false,
            resizable: {
                handles: 's, se, e', // Allow resizing in all directions
            },
            disableResize: false,
        });

        setGrid(g);

        return () => {
            grid?.destroy(false); // Clean up GridStack
        };
    }, [grid]);

    useImperativeHandle<GridStack | undefined, GridStack | undefined>(ref, () => grid, [grid]); // Expose the GridStack instance


    return (
        <div ref={gridRef} className="grid-stack">
            {children}
        </div>
    );
});

export default GridStackWrapper;
