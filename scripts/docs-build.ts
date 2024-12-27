import { promises as fs } from "fs";
import path from "path";
import { arrSplit } from "../src/arrutil";

const scan = async function(file){
    const stat = await fs.stat(file);
    if(stat.isDirectory()){
        const files = await fs.readdir(file);
        for(const child of files){
            await scan(path.join(file, child));
        }
        return;
    }
    if(file.endsWith("d.ts")){
        const content = (await fs.readFile(file)).toString();
        const items = arrSplit(content.split("\n"), line=>line.trim().startsWith("export"), true);
        console.log(items);
    }
}

scan("./lib");