import Xray from 'x-ray';



import { checkForEssentialFiles } from './file.js';

import { Prompt, Bar } from './promt.js';

import * as req from "request-x-ray";

const makeDriver = req.default;
const cookie = "cf_clearance=r8zv6eAt7dK.ONcJPngkU.KTU1cRhimoqBo4VwaM3z0-1699538390-0-1-db383275.3bba728a.133b37ab-0.2.1699538390; __stripe_mid=30c75d2e-d342-4430-9e9f-3165dd79f6e0b0fc61; scraptf=rf5bib08ti03g003ddhq07kmc2; ncmp.domain=scrap.tf; ncmp=CPz10AAPz10AADyvHAENDaCgAP_AAH_AACiQgoNV_H__bX9v8X7_6ft0eY1f9_j77uQxBhfJs-4F3LvW_JwX32E7NF36tq4KmRoEu3ZBIUNtHJnUTVmxaogVrzHsak2cpTNKJ-BkkHMRe2dYCF5vm4tjeQKZ5_p_d3f52T_9_dv-39zz3913v3d9f-_1-Pjde5_9H_v_fRfb-_If9_7-_8v8_t_rk2_eT1__9evv__--________9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARBQar-P_-2v7f4v3_0_bo8xq_7_H33chiDC-TZ9wLuXet-TgvvsJ2aLv1bVwVMjQJduyCQobaOTOomrNi1RArXmPY1Js5SmaUT8DJIOYi9s6wELzfNxbG8gUzz_T-7u_zsn_7-7f9v7nnv7rvfu76_9_r8fG69z_6P_f--i-39-Q_7_39_5f5_b_XJt-8nr__69ff__99________6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAA.YAAAAAAAAAAA; ncmp-cc=:";

const scrapOptions = {
	method: "GET", 						//Set HTTP method
	jar: true, 							//Enable cookies
	headers: {							//Set headers
		"User-Agent": "Firefox/48.0",
        "Cookie": cookie,
	}
}

const backpackOptions = {
	method: "GET", 			
    jar: true, 	
    headers: {							
		"User-Agent": "Firefox/48.0",
    }
}



export class ProgramMemory {
    constructor() {
        this.backpackLinksList = [];
        this.scrapLinksList = [];
        this.scrapingOutput = [];
        this.scrapingItemCounter;
        this.currentLink;
        this.debug = false;
        this.keyPrice = 0;
        
        this.xray = new Xray();


        this.scrapDriver = makeDriver(scrapOptions)

        this.backpackDriver = makeDriver(backpackOptions)

        this.progressBar = Bar; 
        this.prompt = Prompt;
    }

    decrementCounter() {
        this.scrapingItemCounter -= 1;
        this.progressBar.increment();
    }

    prepareForScraping() {
        checkForEssentialFiles();
    }

}