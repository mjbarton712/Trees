export function chooseStrandGeneric(rand) {
    let nextYear = "";
    //first one: kinda realistic quaking aspen/red maple-like trees
    // experiment: X;   F-->FF and X --> F+[-F-XF-X][+FF][-XF[+X]][++F-X]
    if (rand < .1)
        nextYear += "F[LX[V]][^X[V]]F[RX[V]][&X[V]]FX";
    else if (rand < .2)
        nextYear += "F[LX[V]][&X[V]]F[RX[V]][^X[V]]FX";
    else if (rand < .3)
        nextYear += "F[L^X[V]][&X[V]][RX[V]][^X[V]]F[RX[V]][L&X[V]][&X[V]][^X[V]]FX";
    else if (rand < .4)
        nextYear += "F[L&X[V]][&X[V]][R^X[V]][^X[V]]F[LX[V]]L[&X[V]]R[^X[V]]FX";
    else if (rand < .5)
        nextYear += "F[LX[V]][&LX[V]][R&X[V]][^LX[V]]F[RX[V]][L^X[V]][&X[V]][^X[V]]FX";
    else if (rand < .6)
        nextYear += "F[LX[V]][&X[V]][RX[V]]F[RX[V]][L^X[V]][&X[V]][^X[V]]FX";
    else if (rand < .7)
        nextYear += "F[LX[V]][&X[V]][RX[V]][^X[V]]F[RX[V]][LX[V]][&X[V]][^X[V]]FX";
    else if (rand < .8)
        nextYear += "F[RX[V]][L&X[V]][^X[V]]F[RX[V]]L[L^X[V]]R[&X[V]]FX";
    else if (rand < .9)
        nextYear += "F[LX[V]]R[&X[V]][RX[V]][^LLX[V]]F[RX[V]][L&X[V]][&X[V]][^RX[V]]FX";
    else
        nextYear += "F[LX[V]][&X[V]][RX[V]][^X[V]]F[RX[V]][LX[V]][&X[V]][^X[V]]FX";
    return nextYear;
}
export function chooseStrandFunky(rand) {
    //not doing anything with rand yet^
    let nextYear = "F";
    let branches = ["[LX[V]]", "[RX[V]]", "[&X[V]]", "[^X[V]]", "[L^X[V]]", "[L&X[V]]", "[R&X[V]]", "[R^X[V]]",
        "[FLX[V]]", "[FRX[V]]", "[F&X[V]]", "[F^X[V]]", "[FL^X[V]]", "[FL&X[V]]", "[FR&X[V]]", "[FR^X[V]]"];
    let random;
    for (let i = 0; i < 7; i++) {
        random = Math.floor(Math.random() * branches.length);
        nextYear += branches[random];
        branches.splice(random, 1);
    }
    nextYear += "FX";
    return nextYear;
}
export function chooseStrandCurvy(rand) {
    let nextYear = "";
    nextYear += "FFF[LLLLLLLLF&&&&&XRFRR^^^F[V]]F[RRRRFRRRXLFLLF[V]][LLLLLL^^F^^^^XRR&F[V]]F[&&&&&&F&&&&RRX^^F[V]]F[RR^^^F^^^^X&&F[V]]F[L&&F&&X^RF[V]]FX";
    return nextYear;
}
//# sourceMappingURL=treestrands.js.map