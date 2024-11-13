import { test, expect } from "../test/test-util";
import {
mapeq,
mapFromObj,
newMapTally,
mapcpy,
} from "./maputil"

test("mapeq and mapFromObj", () => {
    const map1 = mapFromObj({
        a: 1,
        b: 2,
        c: 3,
    });
    const map2 = new Map([
        ["a", 1],
        ["b", 2],
        ["c", 3],
    ])
    const map3 = mapFromObj({
        a: 1,
        b: 2,
        c: 3.3,
    });
    expect(mapeq(map1, map2)).toBe(true);
    expect(mapeq(map1, map3)).toBe(false);
    expect(mapeq(map1, map3, (a, b) => Math.floor(a) === Math.floor(b))).toBe(true);
});

test("newMapTally", () => {
    expect(newMapTally([3,1,4,1,5,9,2,6,5,3,5,8,9,7,9,3,2,3,8]))
    .toBe(new Map([
        [3, 4],
        [1, 2],
        [4, 1],
        [5, 3],
        [9, 3],
        [2, 2],
        [6, 1],
        [8, 2],
        [7, 1]
    ]))
});

test("mapcpy", () => {
    const map1 = mapFromObj({
        a: 1,
        b: 2,
        c: 3,
    });
    const map2 = mapcpy(map1);
    expect(mapeq(map1, map2)).toBe(true);
    expect(map1 === map2).toBe(false);
});