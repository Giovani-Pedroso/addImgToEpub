import fs from "fs";
import { file } from "jszip";
import { v4 } from "uuid";
import axios from "axios";

const TMP_IMG_FOLDER = "./tmp/imgs";

type ImgInfo = {
  imgName: string;
  imgOgSrc: string;
  imgLocalSrc: string;
  paths: string[];
  imgLocalOnEbook: string;
};

const downloadImg = async (
  src: string,
  outDir: string,
  fileName: string,
): Promise<string> => {
  const wereToSave = `${outDir}/${fileName}`;
  // console.log(wereToSave);
  try {
    const response = await axios({
      method: "GET",
      url: src,
      responseType: "stream", // Important: responseType 'stream' to handle large files
    });

    // Create a writable stream and pipe the image data to the file

    // const writer = fs.createWriteStream(wereToSave);
    const writer = fs.createWriteStream(wereToSave);
    response.data.pipe(writer);

    // Return a promise to handle success or error
    return new Promise((resolve, reject) => {
      writer.on("finish", resolve); // Resolve when writing is finished
      writer.on("error", reject); // Reject on error
    });
  } catch (err: any) {
    console.log(err.message);
  }
  return wereToSave;
};

const downloadImgsFromHtml = async (fileName: string, content: string) => {
  //Create a temporary folder to store the images
  const folderForImgs = `./${TMP_IMG_FOLDER}/${fileName}`;

  if (!fs.existsSync(TMP_IMG_FOLDER)) {
    fs.mkdir(folderForImgs, { recursive: true }, (err) => {
      if (err) {
        console.error("An error happende", err);
      }
    });
  }

  //Find all images tags on the html
  const regexImgsTags = /<img\b[^>]*>/gi;
  const imgTags = content.matchAll(regexImgsTags);

  var imgs: ImgInfo[] = [];
  for (const imgTag of imgTags) {
    const tag = imgTag[0];

    //Get the source of the img
    const regexSrc = /src="([^"]*)"/g;
    const matchSrc = tag.match(regexSrc) as string[];
    const src = matchSrc[0].slice(5, -1);
    // console.log(src);
    const fileExtension = tag.split(".").slice(-1)[0].split('"')[0];
    const imgName = `${v4()}.${fileExtension}`;

    //Download the imgs to a local folder
    // just for test

    const TEST_SRC = "https://picsum.photos/200/300";
    // console.log("folder to sade", folderForImgs);
    // console.log("img name", imgName);

    const localWheweWasSaved = `${folderForImgs}/${imgName}`;
    const imgLocalOnEbook = `${folderForImgs}/${imgName}`.slice(8);
    await downloadImg(TEST_SRC, folderForImgs, imgName);

    imgs.push({
      imgOgSrc: src,
      imgName: imgName,
      imgLocalOnEbook: imgLocalOnEbook,
      imgLocalSrc: localWheweWasSaved.slice(3),
      paths: localWheweWasSaved.split("/"),
    });
  }

  return imgs;
};
export default downloadImgsFromHtml;
