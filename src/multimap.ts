import {arreq} from "./arrutil";
import {rand32,shiftCombine32} from "./bitutil";
import {newMapTally,mapeq} from "./maputil";

export class MultiMap<Keys extends any[], Value>{
    private map = new Map<Keys[number], any>;
    protected own = Symbol();// unique value that doesn't collide
    size = 0;
    set(...args: [...Keys, Value]): Value{
        let val = args.pop() as Value;
        let lst = [...args] as Keys;
        let map = this.map;
        for(let k of lst){
            if(!map.has(k))map.set(k,new Map);
            map = map.get(k);
        }
        if(!map.has(this.own))this.size++;
		map.set(this.own,val);// to avoid collision between the same level
        return val;
    }
    get(...lst: Keys): Value | undefined{
        let map = this.map;
        for(let k of lst){
            if(!map.has(k))return undefined;
            map = map.get(k);
        }
        return map.get(this.own);
    }
    has(...lst: Keys): boolean{
        let map = this.map;
        for(let k of lst){
            if(!map.has(k))return false;
            map = map.get(k);
        }
        return map.has(this.own);
    }
    delete(...lst: Keys): boolean{
        let map = this.map;
        let maps = [[null,map]];
        for(let k of lst){
            if(!map.has(k))return false;
            map = map.get(k);
            maps.push([k,map]);
        }
        let ret = map.delete(this.own);
        for(let i = maps.length-1; i > 0; i--){
            if(maps[i]![1]!.size === 0){
                maps[i-1]![1]!.delete(maps[i][0]);
            }else{
                break;
            }
        }
		if(ret)this.size--;
        return ret;
    }
    
    *iterator(): Iterator<[Keys, Value]>{
        let keys = [];
        let own = this.own;
        const that = this;
        let traverse = function*(map: typeof that.map): Generator<[Keys, Value]>{
            for(let [key,val] of map){
                if(key === own){
                    yield [[...keys] as Keys, val as Value];
                }else{
                    keys.push(key);
                    yield* traverse(val);
                    keys.pop();
                }
            }
        }
        yield* traverse(this.map);
    }
    [Symbol.iterator](){
        return this.iterator();
    }
};


export class MultiMapAlpha<Keys extends any[], Value>{
    private hashes = new Map<any, number>;
    private uses = new Map;
    private contentMap = new Map<number, [Keys, Value][]>;
    size = 0;
    
    //sum of all hashes
    private createMush(lst: Keys): number{
        let {hashes} = this;
        let mush = 0;
        for(let obj of lst){
            let hash: number;
            if(hashes.has(obj)){
                hash = hashes.get(obj)!;
            }else{
                hash = rand32();
                hashes.set(obj,hash);
            }
            mush = shiftCombine32(mush,hash);
        }
        return mush;
    }
    
    private getMush(lst: Keys): [number, boolean]{//[mush,err]
        let {contentMap,hashes} = this;
        let mush = 0;
        for(let obj of lst){
            let hash: number;
            if(hashes.has(obj)){
                hash = hashes.get(obj)!;
            }else{
                return [0,true];
            }
            mush = shiftCombine32(mush,hash);
        }
        if(!contentMap.has(mush)){
            return [0,true];
        }
        return [mush,false];
    }
    
    private getBucket(lst: Keys): [Keys, Value][] | null{
        let [mush,err] = this.getMush(lst);
        if(err){
            return null;
        }
        return this.contentMap.get(mush) || null;
    }
    // Possibly unnecessary
    private incrementUses(lst: Keys){
        let {uses} = this;
        for(let obj of lst){
            if(uses.has(obj)){
                uses.set(obj,uses.get(obj)+1);
            }else{
                uses.set(obj,1);
            }
        }
    }
    
    private hasHashes(lst: Keys){
        let {hashes} = this;
        for(let obj of lst){
            if(!hashes.has(obj)){
                return false;
            }
        }
        return true;
    }
    // Gleichweis unnecessesary
    private decrementUses(lst: Keys){
        let {uses,hashes} = this;
        for(let obj of lst){
            if(uses.has(obj)){
                let cnt = uses.get(obj)-1;
                if(cnt === 0){
                    //deletion is important to prevent memory leak
                    uses.delete(obj);
                    hashes.delete(obj);
                }else{
                    uses.set(obj,cnt);
                }
            }else{
                throw new Error("trying to decrement cnt for object that DNE");
            }
        }
    }
    
    set(...args: [...Keys, Value]){
        let {contentMap} = this;
        let val = args.pop() as Value;
        const lst = args as unknown as Keys;
        let mush = this.createMush(lst);
        let bucket: [Keys, Value][];
        if(contentMap.has(mush)){
            bucket = contentMap.get(mush)!;
        }else{
            bucket = [];
            contentMap.set(mush,bucket);
        }
        for(let slot of bucket){
            let [lst1] = slot;
            if(arreq(lst,lst1)){
                slot[1] = val;
                return val;
            }
        }
        //if no match is found in the bucket
        this.size++;
		this.incrementUses(lst);
        bucket.push([lst,val]);
        return val;
    }
    
    get(...lst: Keys){
        let bucket = this.getBucket(lst);
        if(bucket === null){
            return undefined;
        }
        //find the match in the bucket
        for(let [lst1,val] of bucket){
            if(arreq(lst,lst1))return val;
        }
        return undefined;
    }
    
    has(...lst: Keys){
        let bucket = this.getBucket(lst);
        if(bucket === null){
            return false;
        }
        //find the match in the bucket
        for(let [lst1,val] of bucket){
            if(arreq(lst,lst1))return true;
        }
        return false;
    }
    
    delete(...lst: Keys){
        let {contentMap} = this;
        let [mush,err] = this.getMush(lst);
        if(err)return false;
        let bucket = contentMap.get(mush);
        if(!bucket)return false;
        //find the match in the bucket
        for(let i = 0; i < bucket.length; i++){
            let [lst1,val] = bucket[i];
            if(arreq(lst,lst1)){
                if(bucket.length === 1){
                    contentMap.delete(mush);
                }else{
                    bucket.splice(i,1);
                }
				this.size--;
                this.decrementUses(lst);
                return true;
            }
        }
        return false;
    }
    
    *iterator(){
        for(let [_,bucket] of this.contentMap){
            for(let pair of bucket){//pair == [tally,value]
                yield pair;
            }
        }
    }
    [Symbol.iterator](){
        return this.iterator();
    }
}





export class OrderAgnosticMultiMap<Keys extends any[], Value>{
    private hashes = new Map;
    private uses = new Map;
    private contentMap = new Map<number,[Map<Keys[number], number>, Value][]>;
    size = 0;

    //sum of all hashes
    private createMush(tally: Map<Keys[number], number>){
        let {hashes} = this;
        let mush = 0;
        for(let [obj,cnt] of tally){
            let hash;
            if(hashes.has(obj)){
                hash = hashes.get(obj);
            }else{
                hash = rand32();
                hashes.set(obj,hash);
            }
            mush ^= shiftCombine32(hash,cnt);
        }
        return mush;
    }
    
    private getMush(tally: Map<Keys[number], number>): [0, true] | [number, false]{//[mush,err]
        let {contentMap,hashes} = this;
        let mush = 0;
        for(let [obj,cnt] of tally){
            let hash;
            if(hashes.has(obj)){
                hash = hashes.get(obj);
            }else{
                return [0,true];
            }
            mush ^= shiftCombine32(hash,cnt);
        }
        if(!contentMap.has(mush)){
            return [0,true];
        }
        return [mush,false];
    }
    
    private getBucket(tally: Map<Keys[number], number>){
        let [mush,err] = this.getMush(tally);
        if(err){
            return null;
        }
        return this.contentMap.get(mush)!;
    }
    
    private incrementUses(tally: Map<Keys[number], number>){
        let {uses} = this;
        for(let [obj,cnt] of tally){
            if(uses.has(obj)){
                uses.set(obj,uses.get(obj)+1);
            }else{
                uses.set(obj,1);
            }
        }
    }
    
    private hasHashes(tally: Map<Keys[number], number>){
        let {hashes} = this;
        for(let [obj] of tally){
            if(!hashes.has(obj)){
                return false;
            }
        }
        return true;
    }
    
    private decrementUses(tally: Map<Keys[number], number>){
        let {uses,hashes} = this;
        for(let [obj,cnt] of tally){
            if(uses.has(obj)){
                let cnt = uses.get(obj)-1;
                if(cnt === 0){
                    //deletion is important to prevent memory leak
                    uses.delete(obj);
                    hashes.delete(obj);
                }else{
                    uses.set(obj,cnt);
                }
            }else{
                throw new Error("trying to decrement cnt for object that DNE");
            }
        }
    }
    
    set(...args: [...Keys, Value]){
        let {contentMap} = this;
        let lst = [...args] as unknown as Keys;
        let val = lst.pop() as Value;
        let tally = newMapTally(lst);
        let mush = this.createMush(tally);
        let bucket: [Map<Keys[number], number>, Value][];
        if(contentMap.has(mush)){
            bucket = contentMap.get(mush)!;
        }else{
            bucket = [];
            contentMap.set(mush,bucket);
        }
        for(let slot of bucket){
            let [tally1] = slot;
            if(mapeq(tally,tally1)){
                slot[1] = val;
                return val;
            }
        }
        //if no match is found in the bucket
        this.size++;
		this.incrementUses(tally);
        bucket.push([tally,val]);
        return val
    }
    
    get(...lst: Keys){
        let tally = newMapTally(lst);
        let bucket = this.getBucket(tally);
        if(bucket === null){
            return undefined;
        }
        //find the match in the bucket
        for(let [tally1,val] of bucket){
            if(mapeq(tally,tally1))return val;
        }
        return undefined;
    }
    
    has(...lst: Keys){
        let tally = newMapTally(lst);
        let bucket = this.getBucket(tally);
        if(bucket === null){
            return false;
        }
        //find the match in the bucket
        for(let [tally1,val] of bucket){
            if(mapeq(tally,tally1))return true;
        }
        return false;
    }
    
    delete(...lst: Keys){
        let {contentMap} = this;
        let tally = newMapTally(lst);
        let [mush,err] = this.getMush(tally);
        if(err)return false;
        let bucket = contentMap.get(mush)!;
        //find the match in the bucket
        for(let i = 0; i < bucket.length; i++){
            let [tally1,val] = bucket[i];
            if(mapeq(tally,tally1)){
                if(bucket.length === 1){
                    contentMap.delete(mush);
                }else{
                    bucket.splice(i,1);
                }
				this.size--;
                this.decrementUses(tally);
                return true;
            }
        }
        return false;
    }
    
    *iterator(){
        for(let [_,bucket] of this.contentMap){
            for(let pair of bucket){//pair == [tally,value]
                yield pair;
            }
        }
    }
    [Symbol.iterator](){
        return this.iterator();
    }
};

export class MultiWeakMap<Keys extends any[], Value> extends MultiMap<Keys, Value>{
    // @ts-ignore
    private map = new WeakMap<Keys[number], any>;
    // only implements set(), get(), and has()
    set(){
        let lst = [...arguments];
        let val = lst.pop();
        let map = this.map;
        for(let k of lst){
            if(!map.has(k))map.set(k,new WeakMap);
            map = map.get(k);
        }
        if(!map.has(this.own))this.size++;
		map.set(this.own,val);// to avoid collision between the same level
        return val;
    }
    // These methods from the parent class need to be disabled
    // @ts-ignore
    private delete(){
        throw new Error("Delete cannot be called on a MultiWeakMap")
    }

    private *iterator(): Iterator<[Keys, Value]>{
        throw new Error("Iterator cannot be called on a MultiWeakMap");
    }
    // @ts-ignore
    private [Symbol.iterator](){
        throw new Error("Symbol.iterator cannot be called on a MultiWeakMap");
    }
}