import fs from "fs";
import { file } from "jszip";
import { v4 } from "uuid";
import axios from "axios";
import { SocksProxyAgent } from "socks-proxy-agent";

const TMP_IMG_FOLDER = "tmp/imgs";

type ImgInfo = {
  imgName: string;
  alreadOnEbook: boolean;
  stillExist: boolean;
  imgOgSrc: string;
  imgLocalSrc: string;
  paths: string[];
  imgLocalOnEbook: string;
};

const downloadImg = async (
  src: string,
  outDir: string,
  fileName: string,
): Promise<any> => {
  const wereToSave = `${outDir}/${fileName}`;
  let stillExist: boolean;

  const httpsAgent = new SocksProxyAgent("socks://127.0.0.1:9050");
  try {
    const response = await axios({
      method: "GET",
      // httpsAgent,
      url: src,
      responseType: "stream", // Important: responseType 'stream' to handle large files
    });
    console.log("imag download", outDir);
    // Create a writable stream and pipe the image data to the file

    // const writer = fs.createWriteStream(wereToSave);
    const writer = fs.createWriteStream(wereToSave);
    response.data.pipe(writer);

    stillExist = true;
    // Return a promise to handle success or error
    return new Promise((resolve, reject) => {
      writer.on("finish", resolve); // Resolve when writing is finished
      writer.on("error", reject); // Reject on error
    });
  } catch (err: any) {
    stillExist = false;
    console.log("error while download the img", wereToSave, src, err.message);
  }
  return { wereToSave, stillExist };
};

/*

  console.log(folderForImgs);
  if (!fs.existsSync(TMP_IMG_FOLDER)) {
    console.log("creating folder", TMP_IMG_FOLDER);
    fs.mkdir(folderForImgs, { recursive: true }, (err) => {
      if (err) {
        console.error("An error happende", err);
      }
      console.log("directory", TMP_IMG_FOLDER, "created");
    });
  }
  console.log("folder", folderForImgs, " alread exist");
  */

const downloadImgsFromHtml = async (fileName: string, content: string) => {
  //Create a temporary folder to store the images
  const folderForImgs = `./${TMP_IMG_FOLDER}/${fileName}`;
  // console.log(folderForImgs);
  try {
    await fs.promises.stat(folderForImgs);
    // console.log("folder", folderForImgs, " alread exist");
  } catch (err) {
    await fs.promises.mkdir(folderForImgs, { recursive: true });
    // console.log("directory", TMP_IMG_FOLDER, "created");
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
    let srcArry = matchSrc[0].slice(5, -1).split("=");
    let src = srcArry[srcArry.length - 1];
    src = decodeURIComponent(src);

    if (src.includes("imgur")) src = src.replace("jpg", "jpeg");

    console.log("decodeURI", src);
    // console.log(src);
    const fileExtension = tag.split(".").slice(-1)[0].split('"')[0];
    const imgName = `${v4()}.${fileExtension}`;

    //Download the imgs to a local folder
    // just for test

    const TEST_SRC = "https://picsum.photos/200/300";
    // console.log("folder to sade", folderForImgs);
    // console.log("img name", imgName);

    const localWheweWasSaved = `${folderForImgs}/${imgName}`;
    const imgLocalOnEbook = `${folderForImgs}/${imgName}`.slice(6);

    console.log("from getImg()", src);
    if (!src.includes("http")) {
      imgs.push({
        imgOgSrc: src,
        imgName: imgName,
        alreadOnEbook: true,
        stillExist: true,
        imgLocalOnEbook: imgLocalOnEbook,
        imgLocalSrc: localWheweWasSaved,
        paths: localWheweWasSaved.split("/"),
      });
    } else {
      const aaaa = await downloadImg(src, folderForImgs, imgName);
      imgs.push({
        imgOgSrc: src,
        imgName: imgName,
        alreadOnEbook: false,
        stillExist: aaaa.stillExist,
        imgLocalOnEbook: imgLocalOnEbook,
        imgLocalSrc: localWheweWasSaved,
        paths: localWheweWasSaved.split("/"),
      });
    }
  }

  return imgs;
};
export default downloadImgsFromHtml;
