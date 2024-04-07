const fs = require("fs/promises");
const fsOg = require("fs");
const { encode } = require("punycode");
const downloadImg = require("./downloadImg");

const createDirectory = async (chapterName, imgName) => {};

const srcTest = "https://picsum.photos/200/300";

const addImgToFile = async (filePath) => {
  console.log("on the add", filePath);
  let imgsToAdd = [];
  let file = await fs.readFile(filePath, "utf8");
  const [_, tmpFolder, chapterFolder] = filePath
    .replace(".html", "")
    .split("/");
  const folderToSaveImgs = `./${tmpFolder}/ImagesDownload/${chapterFolder}`;

  //Create a directori to save the images:
  if (!fsOg.existsSync(folderToSaveImgs)) {
    // Directory does not exist, so create it
    fsOg.mkdir(folderToSaveImgs, { recursive: true }, (err) => {
      if (err) {
        console.error(`Error creating ${folderToSaveImgs}`, err);
      } else {
        console.log(`Directory ${folderToSaveImgs} created successfully.`);
      }
    });
  }

  const regexImgs = /<img\b[^>]*>/gi;
  const regexSrc = /src="([^"]*)"/g;
  const imgTags = file.matchAll(regexImgs);
  for (const imgTag of imgTags) {
    const tag = imgTag[0];
    const src = tag.match(regexSrc)[0].slice(5, -1);
    // const fileName = src.split("/").slice(-1)[0];
    const fileName = `${uuid.v4()}.png`;

    console.log("from getImg()", src);
    if (src) downloadImg(src, fileName, folderToSaveImgs);
    // const imgName = src.split(".").slice(-2).join(".");
    imgsToAdd.push({
      imgOg: src,
      imgDownloaded: `${folderToSaveImgs}/${fileName}`,
    });
  }

  // console.log(imgsToAdd);
  //Replace the old sources with the new ones
  imgsToAdd.forEach((img) => {
    const x = img.imgDownloaded.replace("./tmpBooks/", "");
    file = file.replace(img.imgOg, x);
  });

  await fs.writeFile(`${filePath}`, file);
};
