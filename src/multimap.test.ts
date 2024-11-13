import { test, expect } from "../test/test-util";
import {
    MultiMap,
    MultiMapAlpha,
    OrderAgnosticMultiMap,
    MultiWeakMap,
} from "./multimap"

test("MultiMap", () => {
    const mmap = new MultiMap<[number, number, number], number>();
    mmap.set(1,2,3,  4);
    mmap.set(3,1,4,  1);
    mmap.set(5,9,2,  6);
    mmap.set(5,3,5,  7);

    expect(mmap.size).toBe(4);
    expect(mmap.get(3,1,4)).toBe(1);
    expect(mmap.delete(5,9,2)).toBe(true);
    expect(mmap.delete(9,9,9)).toBe(false);
    expect(mmap.get(1,5,9)).toBe(undefined);
    expect(mmap.delete(3,1,4)).toBe(true);
    expect(mmap.get(3,1,4)).toBe(undefined);
    expect(mmap.set(3,1,4, 2)).toBe(2);
    expect(mmap.get(3,1,4)).toBe(2);
    expect(mmap.set(3,1,4, 3)).toBe(3);
    expect(mmap.get(3,1,4)).toBe(3);
    expect(mmap.has(5,3,5)).toBe(true);
    expect(mmap.has(3,1,4)).toBe(true);
    expect(mmap.has(5,9,2)).toBe(false);
    expect(mmap.size).toBe(3);
    expect([...mmap]).toBe([[[1,2,3],4],[[5,3,5],7],[[3,1,4],3]])
});

test("MultiMapAlpha", () => {
    // It should have the same API as MultiMap
    const mmap = new MultiMapAlpha<[number, number, number], number>();
    mmap.set(1,2,3,  4);
    mmap.set(3,1,4,  1);
    mmap.set(5,9,2,  6);
    mmap.set(5,3,5,  7);

    expect(mmap.size).toBe(4);
    expect(mmap.get(3,1,4)).toBe(1);
    expect(mmap.delete(5,9,2)).toBe(true);
    expect(mmap.delete(9,9,9)).toBe(false);
    expect(mmap.get(1,5,9)).toBe(undefined);
    expect(mmap.delete(3,1,4)).toBe(true);
    expect(mmap.get(3,1,4)).toBe(undefined);
    expect(mmap.set(3,1,4, 2)).toBe(2);
    expect(mmap.get(3,1,4)).toBe(2);
    expect(mmap.set(3,1,4, 3)).toBe(3);
    expect(mmap.get(3,1,4)).toBe(3);
    expect(mmap.has(5,3,5)).toBe(true);
    expect(mmap.has(3,1,4)).toBe(true);
    expect(mmap.has(5,9,2)).toBe(false);
    expect(mmap.size).toBe(3);
    expect([...mmap]).toBe([[[1,2,3],4],[[5,3,5],7],[[3,1,4],3]])
});

test("OrderAgnosticMultiMap -- Order strict test", () => {
    // At the ground level, it should have the same API as MultiMap
    const mmap = new OrderAgnosticMultiMap<[number, number, number], number>();
    mmap.set(1,2,3,  4);
    mmap.set(3,1,4,  1);
    mmap.set(5,9,2,  6);
    mmap.set(5,3,5,  7);

    expect(mmap.size).toBe(4);
    expect(mmap.get(3,1,4)).toBe(1);
    expect(mmap.delete(5,9,2)).toBe(true);
    expect(mmap.delete(9,9,9)).toBe(false);
    expect(mmap.get(1,5,9)).toBe(undefined);
    expect(mmap.delete(3,1,4)).toBe(true);
    expect(mmap.get(3,1,4)).toBe(undefined);
    expect(mmap.set(3,1,4, 2)).toBe(2);
    expect(mmap.get(3,1,4)).toBe(2);
    expect(mmap.set(3,1,4, 3)).toBe(3);
    expect(mmap.get(3,1,4)).toBe(3);
    expect(mmap.has(5,3,5)).toBe(true);
    expect(mmap.has(3,1,4)).toBe(true);
    expect(mmap.has(5,9,2)).toBe(false);
    expect(mmap.size).toBe(3);
    // Note that iterator output contains a tally map, instead of a plain array
    // this is because the order is suposed to be ignored, and the same key
    // could be used for index multiple times
    expect([...mmap].map(([tally, value])=>{
        return [[...tally].sort((a,b)=>a[0] - b[0]), value];
    })).toBe([[[[1,1],[2,1],[3,1]],4],[[[3,1],[5,2]],7],[[[1,1],[3,1],[4,1]],3]])
});

test("OrderAgnosticMultiMap -- Order agnostic test", () => {
    // This test mixes up some of the indices, other than that, it functions in the
    // same way as the other tests
    const mmap = new OrderAgnosticMultiMap<[number, number, number], number>();
    mmap.set(1,2,3,  4);
    mmap.set(3,1,4,  1);
    mmap.set(5,9,2,  6);
    mmap.set(5,3,5,  7);

    expect(mmap.size).toBe(4);
    expect(mmap.get(3,4,1)).toBe(1);
    expect(mmap.delete(5,9,2)).toBe(true);
    expect(mmap.delete(9,9,9)).toBe(false);
    expect(mmap.get(5,1,9)).toBe(undefined);
    expect(mmap.delete(3,1,4)).toBe(true);
    expect(mmap.get(3,1,4)).toBe(undefined);
    expect(mmap.set(3,1,4, 2)).toBe(2);
    expect(mmap.get(3,4,1)).toBe(2);
    expect(mmap.get(4,1,3)).toBe(2);
    expect(mmap.set(3,1,4, 3)).toBe(3);
    expect(mmap.get(3,1,4)).toBe(3);
    expect(mmap.has(3,5,5)).toBe(true);
    expect(mmap.has(1,4,3)).toBe(true);
    expect(mmap.has(9,2,5)).toBe(false);
    expect(mmap.size).toBe(3);
    // Note that iterator output contains a tally map, instead of a plain array
    // this is because the order is suposed to be ignored, and the same key
    // could be used for index multiple times
    expect([...mmap].map(([tally, value])=>{
        return [[...tally].sort((a,b)=>a[0] - b[0]), value];
    })).toBe([[[[1,1],[2,1],[3,1]],4],[[[3,1],[5,2]],7],[[[1,1],[3,1],[4,1]],3]])
});

test("MultiWeakMap", () => {
    // At the ground level, it should have the same API as MultiMap
    const mmap = new OrderAgnosticMultiMap<[number, number, number], number>();
    mmap.set(1,2,3,  4);
    mmap.set(3,1,4,  1);
    mmap.set(5,9,2,  6);
    mmap.set(5,3,5,  7);

    expect(mmap.get(3,1,4)).toBe(1);
    expect(mmap.set(3,1,4, 2)).toBe(2);
    expect(mmap.get(3,1,4)).toBe(2);
    expect(mmap.has(5,3,5)).toBe(true);
    expect(mmap.has(3,1,4)).toBe(true);
    expect(mmap.has(9,9,9)).toBe(false);
});