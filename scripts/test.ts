import {promises as fs} from "fs";
import path from "path";

const src = "./src";

const BOLD = "\u001b[1m";
const BGRED = "\u001b[41;1m";
const BGGREEN = "\u001b[42;1m";
const YELLOW = "\u001b[33m";
const RESET = "\u001b[0m";

const processRecursive = async function(file){
    const stat = await fs.stat(file);
    if(stat.isDirectory()){
        const files = await fs.readdir(file);
        for(const child of files){
            await processRecursive(path.join(file, child));
        }
        return;
    }
    if(!file.endsWith(".test.ts")) return;
    console.log(`*********************************`)
    console.log(`${BOLD}Testing ${file}${RESET}`);
    console.log(`*********************************`)
    await import("../"+file)
    console.log(``);
    console.log(``);
}

processRecursive(src);
