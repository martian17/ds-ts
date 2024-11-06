export const newarr = function(n: number){
    let arr = [];
    for(let i = 0; i < n; i++){
        arr.push(0);
    }
    return arr;
};

export const arrcpy = function<T>(arr: T[]): T[]{
    let arr1 = [];
    for(let val of arr){
        arr1.push(val);
    }
    return arr1;
};

export const arrcpyDepth = function<T extends Array<any>>(arr: T, n: number): T{
    if(n === 1){
        return arrcpy(arr) as T;
    }else{
        return arr.map(a=>arrcpyDepth(a,n-1)) as T;
    }
};

export const range = function(a: number, b?: number){
    if(b === undefined){
        b = a;
        a = 0;
    }
    let arr = [];
    if(a < b){
        for(let i = a; i < b; i++){
            arr.push(i);
        }
    }else{
        for(let i = a; i > b; i--){
            arr.push(i);
        }
    }
    return arr;
};

export const arreq = function(a: any[], b: any[], cb: (a: any, b: any) => boolean): boolean{
    if(a.length !== b.length){
        return false;
    }
    if(!cb){
        for(let i = 0; i < a.length; i++){
            if(a[i] !== b[i])return false;
        }
    }else{
        for(let i = 0; i < a.length; i++){
            if(!cb(a[i],b[i]))return false;
        }
    }
    return true;
};

export const arrSplit = function<T extends Array<any>>(arr: T, comp: any, inclusive: boolean): T[]{
    let res = [];
    let top = [];
    for(let val of arr){
        if(val === comp){
            if(inclusive)top.push(val);
            res.push(top);
            top = [];
        }else{
            top.push(val);
        }
    }
    res.push(top);
    return res as T[];
};

export const arrLoopBack = function*<T>(arr: T[]): Generator<T>{
    for(let i = arr.length-1; i >= 0; i--){
        yield arr[i];
    }
};

export const peek = function<T>(arr: T[]): T{
    return arr[arr.length-1];
}
