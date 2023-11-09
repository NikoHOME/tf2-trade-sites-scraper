import { ProgramMemory } from "./src/memory.js";

let programMemory = new ProgramMemory();

import { startPromt } from "./src/promt.js";

programMemory.prepareForScraping();


//import pkg_request from "request-x-ray";
//const {makeDriver} = pkg_request;



startPromt(programMemory);

//startScraping(programMemory)











