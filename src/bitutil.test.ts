import { test, expect } from "../scripts/test-util";
import {
    int32ToBitString,
    showBits,
    rand32,
    shiftCombine32,
} from "./bitutil";

test("int32ToBitString", () => {
    expect(int32ToBitString(555)).toBe("00000000000000000000001000101011");
});

test("showBits", () => {
    expect(showBits(555)).toBe(undefined);
});

test("rand32", () => {
    let n = 0;
    for(let i = 0; i < 1000; i++){
        n |= rand32();
    }
    expect(int32ToBitString(n)).toBe("11111111111111111111111111111111");
    n = -1;
    for(let i = 0; i < 1000; i++){
        n &= rand32();
    }
    expect(int32ToBitString(n)).toBe("00000000000000000000000000000000");
});

test("shiftCombine32", () => {
    expect(shiftCombine32(13278148912, 234758239)).toBe(-1924715337)
});