import React, { useEffect } from "react";
import { CircuitHero as CircuitHeroClass, type ICircuitHeroProps } from "../../src/CircuitHero";

export function CircuitHero(props: ICircuitHeroProps) {

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        const canvasElement = canvasRef.current as HTMLCanvasElement
        
        const circuitHero = new CircuitHeroClass(canvasElement, props);

        return () => circuitHero.stop();
    })

    return <canvas ref={canvasRef} width={props.width} height={props.height}></canvas>
}