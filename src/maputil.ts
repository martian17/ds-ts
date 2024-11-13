export const mapeq = function<T1, T2>(a: Map<any, T1>, b: Map<any, T2>, cb?: (a: T1, b: T2)=>boolean): boolean{
    if(a.size !== b.size){
        return false;
    }
    if(!cb){
        for(let [key,val1] of a){
            if(!b.has(key))return false;
            let val2 = b.get(key);
            if(val1 !== val2)return false;
        }
    }else{
        for(let [key,val1] of a){
            if(!b.has(key))return false;
            let val2 = b.get(key)!;
            if(!cb(val1,val2))return false;
        }
    }
    return true;
};

export const mapFromObj = function<T>(obj: {[key: string]: T}): Map<string, T>{
    let map = new Map;
    for(let key in obj){
        map.set(key,obj[key]);
    }
    return map;
};

export const mapFromEntries = function <T extends [unknown, unknown]>(arr: T[]): Map<T[0], T[1]> {
    let map = new Map;
    for(let [key,val] of arr){
        map.set(key,val);
    }
    return map;
};

export const newMapTally = function<T>(lst: T[]): Map<T, number>{
    let map = new Map;
    for(let val of lst){
        if(!map.has(val)){
            map.set(val,1);
        }else{
            map.set(val,map.get(val)+1);
        }
    }
    return map;
};

export const mapcpy = function<T extends Map<any, any>>(map : T): T{
    let map1 = new Map;
    for(let [key,val] of map){
        map1.set(key,val);
    }
    return map1 as T;
};
