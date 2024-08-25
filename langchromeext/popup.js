const fetch_btn = document.getElementById("fetch-btn");

fetch_btn.addEventListener("click", () => {
    console.log("Test 1");
    chrome.tabs.query( { active: true, currentWindow: true }, (tabs) => {
        console.log("Test 2");
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: getImg
        }, (promise) => { //promise array of InjectionResult fulfilled after getImg function, has property result
            let testdiv = document.getElementById("testdiv");
            const results = promise[0].result;
            console.log(promise);
            for (let i = 0; i < results.length; i ++){
                console.log("promise" + results[i]);
                let pp = document.createElement("p");
                pp.textContent = results[i];
                testdiv.appendChild(pp);
            };
        });
      });
      
})

const getImg = () => {
    function getAbsolutePosition(image) {
        const rect = image.getBoundingClientRect();
        const top = rect.top + document.documentElement.scrollTop;
        const left = rect.left + document.documentElement.scrollLeft;
        return {top : top, left: left};
    }
    
    function checkValidUrl(image) {
        let image_url;
        if (image.hasAttribute('data-src') && image.hasAttribute('src')){
            //lazy loading
            image_url = image.dataset.src;
        } else {
            image_url =image.src;
        };
        if (/(\.jpg|\.jpeg|blob:)/i.test(image_url)){
            return true;
        } else {
            return false;
        }
    }
    
    const imgs = document.getElementsByTagName('img');
    const img_url = [];
    for (let i = 0; i < imgs.length; i ++){
        const image = imgs[i];
        //check if image's url is good
        if (checkValidUrl(image)){
            //add a wrapper around image
            let parent = image.parentNode;
            let wrapper = document.createElement("div");
            wrapper.style.position = "relative";
            parent.replaceChild(wrapper, image);
            wrapper.appendChild(image);

            // append text relative to image wrapper
            let overlayed_text = document.createElement("div");
            overlayed_text.textContent = "Translating This Image";
            overlayed_text.style.position = "absolute";
            overlayed_text.style.background = "yellow";
            overlayed_text.style.border = "1px solid black";
            overlayed_text.style.padding = "10px";
            overlayed_text.style.zIndex = "9999";
            overlayed_text.style.top = "0px";
            overlayed_text.style.left = "0px";
            wrapper.appendChild(overlayed_text);
        }
    }
    // take all the images -> 
    const canvass = document.getElementsByTagName('canvas');
    for (let i = 0; i < canvass.length; i ++){
        // let link = document.createElement("a");
        // link.download = "image.png";
      
        canvass[i].toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            // link.href = url;
            // img_url.push(url);
            console.log(url);
            // link.click();    
            URL.revokeObjectURL(url);
        },'image/png');
    }
    console.log(img_url);  
    return img_url;
}


// https://github.com/Tshetrim/Image-To-Text-OCR-extension-for-ChatGPT?tab=readme-ov-file
// https://github.com/naptha/tesseract.js?tab=readme-ov-file#tesseractjs

//Tests:
// Current Set Up no issue:
// (1) https://alyasometimeshidesherfeelings.online/manga/chapter-10/?date=2024-08-06#google_vignette : scrape using .jpg
// (2) https://manhwatop.com/manga/the-script-shop-of-dream/chapter-33/ : scrape using .jpg + data-src (lazy loading) 
// (3) https://www.kuaikanmanhua.com/webs/comic-next/632873 : scrape using .jpg + data-src (lazy loading) 
// (4) https://rawkuma.com/tokidoki-bosotto-roshiago-de-dereru-tonari-no-alya-san-chapter-5/ : scrape using .jpg
// Problem (1): images are loaded internally only after click between 2 viewports only
// https://viewer.bookwalker.jp/03/28/viewer.html?cid=2ec19b01-6cb1-47b7-9524-8410512f11a4&cty=2

// Problem (2): each manga page are fixed to page number in URL e.g url/1, url/2:
// https://mangadex.org/chapter/17850723-7077-46ef-934f-5fccc7cbb654/1

// Problem (3): toBlob error, tainted canvas cannot be exported + pages only load after click
// https://tonarinoyj.jp/episode/2550689798814983672
// solution: autorefresh page upon error
//

// good sources
//https://github.com/kha-white/manga-ocr

// flow
// opencv.js or PixiJS -> perform ocr -> NLTK, compromise or fuzzysearch 
// storing ocr data -> chrome storage api

//tesseract: https://pyimagesearch.com/2017/07/10/using-tesseract-ocr-python/


//original getImg Function
// const getImg = () => {
//     console.log("Test 3: " + document.body);
//     const imgs = document.getElementsByTagName('img');
//     console.log(imgs);
//     const canvass = document.getElementsByTagName('canvas');
//     const img_url = [];
//     for (let i = 0; i < imgs.length; i ++){
//         const image = imgs[i];
//         let image_url;
//         if (image.hasAttribute('data-src') && image.hasAttribute('src')){
//             //lazy loading
//             console.log("lazy" + image.dataset.src );
//             image_url = image.dataset.src;
//         } else {
//             console.log("src" + image.src)
//             image_url =image.src;
//         };
//         if (/(\.jpg|\.jpeg|blob:)/i.test(image_url)){
//             img_url.push(image_url);
//         }
//     }
//     // take all the images -> 
//     for (let i = 0; i < canvass.length; i ++){
//         // let link = document.createElement("a");
//         // link.download = "image.png";
      
//         canvass[i].toBlob((blob) => {
//             const url = URL.createObjectURL(blob);
//             // link.href = url;
//             // img_url.push(url);
//             console.log(url);
//             // link.click();    
//             URL.revokeObjectURL(url);
//         },'image/png');
//     }
//     console.log(img_url);  
//     return img_url;
// }
