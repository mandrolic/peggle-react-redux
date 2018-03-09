import * as model from './model';
import { Vector2 } from '../vector2/vector2';
import Bounds from './bounds';

function initialPeg(x: number, y: number): model.Peg {
    return {
        position: new Vector2(x, y)
        , radius: 6
        , hitCount: 0
        , pegType: 'Normal'
        , scoreLastHit: 0
        , scoreDisplayTimeLeft: 0.0
    };
}

var seed = 1;

function random(): number {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function range(count: number): number[] {
    return [...Array(count).keys()];
}

function hLineOffPegs(count: number, spacing: number): model.Peg[] {
    return range(count)
        .map(x => x * spacing)
        .map(x => initialPeg(x, 0));
}

function circlePegs(x: number, y: number, radius: number, count: number): model.Peg[] {
    
    let radiansPerPeg = 2 * Math.PI / count;    
    let pegArray = [...Array(count).keys()];

    let pegs = pegArray
        .map((_, i) => i * radiansPerPeg)
        .map(angle => ({ x : x + (Math.cos(angle) * radius), y: y + (Math.sin(angle) * radius)}))
        .map(({x: p, y: q}) => initialPeg(p, q));
    
    return pegs;
}

function sideWalls(): model.VerticalWall[] {
    return [{ upperBound: 0, lowerBound: Bounds.gameY, hPos: 0, width: 4 }
        , { upperBound: 0, lowerBound: Bounds.gameY, hPos: Bounds.gameX - 4, width: 4 }
    ];
}

function addPegX(offset: number, peg: model.Peg) {
    return { ...peg, position: new Vector2(peg.position.x + offset, peg.position.y) };
}

function addPegY(offset: number, peg: model.Peg) {
    return { ...peg, position: new Vector2(peg.position.x, peg.position.y + offset) };
}

function setRed(p: model.Peg): model.Peg {
    return { ...p, pegType: 'Red' };
}

function setRedIf(t: boolean, peg: model.Peg) {
    return t ? setRed(peg) : peg;
}

let makeRedIfEven = (p: model.Peg, i: number) => setRedIf(i % 2 === 0, p);

function staggeredLevel(): model.LevelDef {

    let lineOfPegs = hLineOffPegs(8, 50);

    return {
        walls: sideWalls(),
        pegs: [
            ...lineOfPegs.map(p => addPegX(50, p)).map(p => addPegY(150, p)),
            ...lineOfPegs.map(p => addPegX(70, p)).map(p => addPegY(200, p)).map(setRed),
            ...lineOfPegs.map(p => addPegX(50, p)).map(p => addPegY(250, p)),
            ...lineOfPegs.map(p => addPegX(70, p)).map(p => addPegY(300, p)).map(setRed),
            ...lineOfPegs.map(p => addPegX(50, p)).map(p => addPegY(350, p))
        ]
    };
}

function circleMultiBallLevel():  model.LevelDef {
    return { 
        walls: sideWalls(),
        pegs: [ 
                ...circlePegs((Bounds.gameX / 2), 200.0,  75.0, 16).map(makeRedIfEven),
                { ...initialPeg(Bounds.gameX / 2,  200), pegType: 'MultiBall' },
                ...hLineOffPegs(9, 40).map(p => addPegX(80, p)).map(p => addPegY(320, p)),
                ...hLineOffPegs(8, 40).map(p => addPegX(100, p)).map(p => addPegY(360, p)).map(setRed),
                ...hLineOffPegs(9, 40).map(p => addPegX(80, p)).map(p => addPegY(400, p)),
                ]
        };
    }

function bewbsLevel():  model.LevelDef {
    return { 
        walls: sideWalls(),
        pegs: [ 
                    ...circlePegs(150, 200.0,  75.0, 16).map(makeRedIfEven),
                    ...circlePegs(350, 200.0,  75.0, 16).map(makeRedIfEven),
                    { ...initialPeg(150,  200), pegType: 'MultiBall' },
                    { ...initialPeg(350,  200), pegType: 'MultiBall' }
                    ]
            };
}

function centerPegs(pegs: model.Peg[]): model.Peg[] {
    
    let foo = pegs.map(p => p.position.x).sort((a, b) => a - b);
    let  offset = foo.length === 0 ? 0 : (foo[foo.length - 1] - foo[0]) / 2;
    
    return pegs.map(p => addPegX((Bounds.gameX / 2 - offset), p));
}

function randomRedPegs(pegs: model.Peg[]): model.Peg[] {
   return pegs.map((p, pos) => setRedIf(random() < 0.3, p));
}

function pyramidLevel(): model.LevelDef {
    
    const spacing = 50;

    let rowFunc = (row: number) => hLineOffPegs(row, spacing).map(p => addPegY(row * spacing + 50, p));

    let pegs = range(7)
            .map(rowFunc)
            .map(centerPegs)
            .map(randomRedPegs);

    return {
        walls: sideWalls(),
        pegs:  pegs.reduce((a, c) => [...a, ...c], [])
    };
}

let initLevel = staggeredLevel();
let remainingLevels = [ pyramidLevel(), circleMultiBallLevel(), bewbsLevel() ];

export  { initLevel, remainingLevels} ;