import { test, expect } from "../test/test-util";
import {
    newarr,
    arrcpy,
    arrcpyDepth,
    range,
    arreq,
    arrSplit,
    arrLoopBack,
    peek,
} from "./arrutil";

test("newarr", () => {
    const arr = newarr(5);
    expect(arr.length).toBe(5);
    expect(arr).toBe([0,0,0,0,0]);
});

test("arrcpy", () => {
    const arr = [1,2,[1,2,3],["1","2","3","4"]];
    const cpy = arrcpy(arr);
    expect(cpy).toBe(arr);
    expect(arr === cpy).toBe(false);
    expect(arr[1] === cpy[1]).toBe(true);
});

test("arrcpyDepth", () => {
    const arr = [1,2,[[[[[1]]]],2,3],["1","2","3","4"]];
    const cpy = arrcpyDepth(arr,3);
    expect(cpy).toBe(arr);
    expect(arr === cpy).toBe(false);
    expect(arr[2] === cpy[2]).toBe(false);
    expect((arr as any)[2][0] === (cpy as any)[2][0]).toBe(false);
    expect((arr as any)[2][0][0] === (cpy as any)[2][0][0]).toBe(true);
});

test("range", () => {
    expect(range(5)).toBe([0,1,2,3,4]);
    expect(range(5,8)).toBe([5,6,7]);
    expect(range(5,2)).toBe([5,4,3]);
});

test("arreq", () => {
    expect(arreq([1,2,3],[1,2,3])).toBe(true);
    expect(arreq([1,2,4],[1,2,3])).toBe(false);
    expect(arreq([1,2,3,4],[1,2,3])).toBe(false);
    expect(arreq([1.1,2.2,3.3],[1,2,3], (a, b)=>{
        return Math.floor(a) === Math.floor(b);
    })).toBe(true);
    expect(arreq([1.1,2.2,4.3],[1,2,3], (a, b)=>{
        return Math.floor(a) === Math.floor(b);
    })).toBe(false);
});

test("arrSplit", () => {
    expect(arrSplit(["a","b","c",",","w","q","e","d",",","a","d","c"],","))
    .toBe([["a","b","c"],["w","q","e","d"],["a","d","c"]])
    expect(arrSplit(["a","b","c",",","w","q","e","d",",","a","d","c"],",", true))
    .toBe([["a","b","c",","],["w","q","e","d",","],["a","d","c"]])
});

test("arrLoopBack", () => {
    expect([...arrLoopBack([1,2,3])]).toBe([3,2,1]);
});

test("peek", () => {
    const arr = [1,2,3];
    expect(peek(arr)).toBe(3);
});

