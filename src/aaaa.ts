import JSZip from "jszip";
import fs from "fs";
import downloadImgsFromHtml from "./downloadImgFromHtml";

const EBOOK_PATH = "./books/fractured-sunlight.epub";
const zip = new JSZip();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const editEpub = async () => {
  try {
    const epubData = await fs.promises.readFile(EBOOK_PATH);
    const zip = await JSZip.loadAsync(epubData);
    const files = zip.files;
    const filesToEdit: string[] = [];
    for (const file in files) {
      if (file.includes("html")) filesToEdit.push(file);
    }

    //beging fo the for loop
    const fileName = "chapter-2.html";
    const contentObj = zip.file(fileName) as any;

    let content = (await contentObj.async("text")) as string;
    const infos = await downloadImgsFromHtml(fileName, content);
    console.log();
    console.log(infos);
    //Save the imgs in a folder

    infos.forEach(async (info) => {
      content = content.replace(info.imgOgSrc, info.imgLocalOnEbook);
      // console.log(info.imgLocalSrc);
      const img = await fs.promises.readFile(`./${info.imgLocalSrc}`);
      // console.log(info.paths[3], info.paths[4]);
      // zip.file("./tse.png", img);
      // zip.file("./bbbbb.txt", "rtastars atrstsr");
      zip.file(
        `${info.imgLocalOnEbook}`,
        await fs.promises.readFile(`.${info.imgLocalSrc}`),
      );
      // console.log("img zip", x);
    });
    zip.file(fileName, content);
    zip.file("./aaa.txt", "rtastars atrstsr");
    //end fo the for loop
    await delay(6000);
    //save the updated file
    const updatedEpubData = await zip.generateAsync({ type: "nodebuffer" });
    const outputPath = "updated.epub";
    await fs.promises.writeFile(outputPath, updatedEpubData);
    console.log("done");

    // console.log(filesToEdit);
    // filesToEdit.forEach(async (file) => {
    //   const contentObj = zip.file(file) as any;
    //   const content = await contentObj.async("text");
    //   downloadImgsFromHtml(content);
    // });
    // const cha2 = zip.file("chapter-2.html");

    // console.log(cha2);
  } catch (err) {
    console.log(err);
  }
};

editEpub();
console.log("hello");
