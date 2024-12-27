import { objdiff, Diff } from "objdiff-iterator";

const BOLD = "\u001b[1m";
const BGRED = "\u001b[41;1m";
const BGGREEN = "\u001b[42;1m";
const RESET = "\u001b[0m";

const testContext = {
    currentTestName: "",
    caseCnt: 0,
};

export const test = function(name: string, fn: ()=>void){
    testContext.currentTestName = name;
    testContext.caseCnt = 0;
    console.log(`Running: ${BOLD}${name}${RESET}`);
    try{
        fn();
        console.log(`${BGGREEN}Pass${RESET}: ${testContext.caseCnt} cases tested`);
    }catch(err){
        if(err instanceof TestError){
            console.log(`${BGRED}Error${RESET}: ` + (err as Error).message);
        }else{
            console.log(`${BGRED}Error${RESET}: ` + (err as Error).message);
            console.error(err);
        }
    }
}

const toOrdinal = function(n: number){
    const lastDigit = n%10;
    const lastTenth = n%100;
    if(10 < lastTenth && lastTenth < 20) return n + "th";
    if(lastDigit === 0) return n + "st";
    if(lastDigit === 2) return n + "nd";
    if(lastDigit === 3) return n + "rd";
    return n + "th";
}

class TestError extends Error{}

class ComparisonError extends TestError{
    constructor(diff: Diff[]){
        let message = `${toOrdinal(testContext.caseCnt)} comparison at ${testContext.currentTestName} failed`;
        message += `\n${BOLD}Diff:${RESET}`
        for(let i = 0; i < Math.min(diff.length, 10); i++){
            message += `\n${JSON.stringify(diff[i])}`;
        }
        if(diff.length > 10){
            message += "\n..."
        }
        super(message);
    }
}

export const expect = function(val: any){
    return {
        toBe: (ref: any)=>{
            testContext.caseCnt++;
            const diff = [...objdiff(val,ref)];
            if(diff.length === 0){
                return;
            }else{
                throw new ComparisonError(diff);
            }
        }
    }
}