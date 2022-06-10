import React, { useEffect } from "react";

export interface  ICircuitHeroProps {
    pipColour: string;
    trailColour: string;
    creationTimer: number;
    speed: number;
    pipHalflife: number;
    turnHalflife: number;
    trailLife: number;
    bifurcateHalflife: number;
    pipTickGenerationChance: number;
    creationBehaviour: 'move' | 'constant';
    generateRandomPips: boolean;
    randomMaxDensity: number;
    maxPips: number;
}

interface ILocation { 
    x: number;
    y: number;
}

interface IPip {
    direction: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    location: ILocation;
    path: IPath;
}

interface IPath {
    locations: ILocation[];
}

const sinPrecalc = [...Array(8).keys()].map((input) => Math.sin(input * Math.PI/4))

const cosPrecalc = [...Array(8).keys()].map((input) => Math.cos(input * Math.PI/4))

export function CircuitHero(props: ICircuitHeroProps) {

    const canvasRef = React.createRef();

    let canvasCtx: CanvasRenderingContext2D;

    const pips: IPip[] = [];

    let mouse_x: number, mouse_y: number;

    let generatePips: boolean = false;

    let previous: number;

    function randomPip (x:number , y: number): IPip {
        return {
            direction: Math.floor(Math.random()*8) as IPip['direction'],
            location: {
                x,
                y
            },
            path:{
                locations: [{
                    x,
                    y
                }, {
                    x,
                    y
                }]
            }
        }
    }

    function probabilityFromHalflifeAndElapsed(halflife: number, elapsed: number): boolean {
        return Math.random() > (Math.pow(0.5,(elapsed/halflife)))
    }

    function turnOnePlace(currentDirection: IPip['direction']) {
        if (Math.random() > 0.5) {
            return (currentDirection + 1) % 8 as IPip['direction']
        }
        return Math.abs((currentDirection) - 1) as IPip['direction']
    }

    function prunePips(elapsedTime: number) {
        for(let i = 0; i < pips.length; i++) {
            if (probabilityFromHalflifeAndElapsed(props.pipHalflife, elapsedTime)) {
                pips.splice(i,1);
            }
        }
    }

    function turnPips(elapsedTime: number) {
        for(let i = 0; i < pips.length; i++) {
            if (probabilityFromHalflifeAndElapsed(props.turnHalflife, elapsedTime)) {
                pips[i].direction = turnOnePlace(pips[i].direction)
                pips[i].path.locations.push({
                    x: pips[i].location.x,
                    y: pips[i].location.y,
                })
            }
        }
    }

    function bifurcate(elapsedTime: number) {
        const newPips: IPip[] = []
        for(let i = 0; i < pips.length; i++) {
            if(probabilityFromHalflifeAndElapsed(props.bifurcateHalflife, elapsedTime)) {
                const newPip: IPip = {
                    direction: turnOnePlace(pips[i].direction),
                    location: {
                        x: pips[i].location.x,
                        y: pips[i].location.y
                    },
                    path: {
                        locations: [
                            {
                                x: pips[i].location.x,
                                y: pips[i].location.y
                            },
                            {
                                x: pips[i].location.x,
                                y: pips[i].location.y
                            }
                        ]
                    }
                }
                newPips.push(newPip);
            }
        }
        pips.push(...newPips)
    }

    function evaluatePathDistance(distance: number, pip: IPip) {
        let pathLength = 0;
        let terminatingIndex = 0;
        let finalLocation: ILocation | undefined;
        for(let i = pip.path.locations.length -1; i > 0; i--) {
            let x = pip.path.locations[i].x - pip.path.locations[i-1].x
            let y = pip.path.locations[i].y - pip.path.locations[i-1].y
            let thisPathLength: number;
            if (x == 0) {
                thisPathLength = Math.abs(y)
            } else 
            if (y == 0) {
                thisPathLength = Math.abs(x);
            } else {
                thisPathLength = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
            }
            pathLength += thisPathLength;
            if (pathLength > distance){
                terminatingIndex = i
                const terminatingDistance = pathLength - distance;
                const scale = terminatingDistance / thisPathLength;
            }
            //console.log(`pathLength: ${pathLength}`)
        }
        if (terminatingIndex) pip.path.locations.splice(0, terminatingIndex);
        if(finalLocation) {
            pip.path.locations[0].x = finalLocation.x
            pip.path.locations[0].y = finalLocation.y
        }
        //console.log(pip.path.locations)
    }

    function movePips(elapsedTime: number) {
        for(let i = 0; i < pips.length; i++) {
            pips[i].location.x = pips[i].location.x + props.speed * elapsedTime * cosPrecalc[pips[i].direction]
            pips[i].location.y = pips[i].location.y + props.speed * elapsedTime * sinPrecalc[pips[i].direction]
            pips[i].path.locations[pips[i].path.locations.length - 1].x = pips[i].location.x
            pips[i].path.locations[pips[i].path.locations.length - 1].y = pips[i].location.y
            evaluatePathDistance(props.trailLife * props.speed, pips[i]);
        }
    }

    function animate(timestamp?: number) {

        const canvasElement = canvasRef.current as HTMLCanvasElement
        const rect = canvasElement.getBoundingClientRect();
        const elapsedTime = timestamp - previous;
        if(timestamp) {
            prunePips(elapsedTime)
            turnPips(elapsedTime)
            movePips(elapsedTime)
        }


        for(let i = 0; i < pips.length; i++) {
            if(pips[i].location.x > canvasElement.width
                || pips[i].location.x < 0
                || pips[i].location.y > canvasElement.height
                || pips[i].location.y < 0) pips.splice(i,1);
        }


        previous = timestamp;


        if (pips.length < props.maxPips) {
            if(elapsedTime) bifurcate(elapsedTime);
        }

        if (generatePips && pips.length < props.maxPips) {
            pips.push(randomPip(mouse_x, mouse_y))
        }

        if (props.generateRandomPips && pips.length < props.maxPips) {
            const newPips = Math.floor(Math.random() * props.randomMaxDensity)
            for(let i = 0; i < newPips; i++)
                pips.push(randomPip(Math.floor(Math.random() * rect.width), Math.floor(Math.random() * rect.height)));
        }

        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        for(let i = 0; i < pips.length; i++) {
            canvasCtx.beginPath();
            canvasCtx.strokeStyle = props.pipColour;
            canvasCtx.shadowColor = props.pipColour;
            canvasCtx.shadowBlur = 4
            canvasCtx.rect(pips[i].location.x, pips[i].location.y, 1, 1);
            canvasCtx.stroke();
            canvasCtx.beginPath();
            canvasCtx.strokeStyle = props.trailColour;
            canvasCtx.shadowBlur = 0
            canvasCtx.moveTo(pips[i].path.locations[0].x, pips[i].path.locations[0].y)
            for(let j = 1; j < pips[i].path.locations.length; j++) {
                canvasCtx.lineTo(pips[i].path.locations[j].x, pips[i].path.locations[j].y)
            }
            canvasCtx.stroke();
        }

        requestAnimationFrame(animate)
    }
    
    useEffect(() => {
        const canvasElement = canvasRef.current as HTMLCanvasElement

        canvasElement.addEventListener('mousemove', event => {
            const rect = canvasElement.getBoundingClientRect();
            mouse_x = event.clientX - rect.left
            mouse_y = event.clientY - rect.top
        })

        canvasElement.addEventListener('mouseenter', () => {
            generatePips = true
        })

        canvasElement.addEventListener('mouseleave', () => {
            generatePips = false
        })

        canvasCtx = canvasElement.getContext("2d");

        animate();
    })

    return <canvas ref={canvasRef}></canvas>
}