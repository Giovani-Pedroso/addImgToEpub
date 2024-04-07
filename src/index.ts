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

    //--------------- TEST BEGIN -----------------------------------
    // const fileName = "chapter-2.html";
    //
    // const contentObj = zip.file(fileName) as any;
    // let content = (await contentObj.async("text")) as string;
    // const infos = await downloadImgsFromHtml(fileName, content);
    //
    // // console.log(infos);
    // infos.forEach(async (info) => {
    //   if (info.alreadOnEbook) return;
    //   content = content.replace(info.imgOgSrc, info.imgLocalOnEbook);
    //   zip.file(
    //     `${info.imgLocalOnEbook}`,
    //     await fs.promises.readFile(`${info.imgLocalSrc}`),
    //   );
    // });
    // zip.file(fileName, content);
    //--------------- TEST END -----------------------------------

    // console.log(filesToEdit);
    //
    //---------------  PRODUCTON BEGIN-----------------------------------
    filesToEdit.forEach(async (file) => {
      const fileName = file;

      const contentObj = zip.file(fileName) as any;
      let content = (await contentObj.async("text")) as string;
      const infos = await downloadImgsFromHtml(fileName, content);

      // console.log(infos);
      infos.forEach(async (info) => {
        if (info.alreadOnEbook) return;
        content = content.replace(info.imgOgSrc, info.imgLocalOnEbook);
        zip.file(
          `${info.imgLocalOnEbook}`,
          await fs.promises.readFile(`${info.imgLocalSrc}`),
        );
      });
      zip.file(fileName, content);
      // const content = await contentObj.async("text");
      // downloadImgsFromHtml(content);
    });
    //---------------  PRODUCTON END -----------------------------------

    //beging fo the for loop
    //end fo the for loop
    await delay(30000);
    //save the updated file

    const updatedEpubData = await zip.generateAsync({ type: "nodebuffer" });
    const outputPath = "updated.epub";
    await fs.promises.writeFile(outputPath, updatedEpubData);
    console.log("done");
  } catch (err) {
    console.log(err);
  }
};

/*


    console.log();
    console.log(infos);
    //Save the imgs in a folder

    zip.file("./aaa.txt", "rtastars atrstsr");
  */

editEpub();
console.log("hello");
