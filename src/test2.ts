import fs from "fs";
import { file } from "jszip";
import { v4 } from "uuid";
import axios from "axios";
import { SocksProxyAgent } from "socks-proxy-agent";

const downloadImg = async (src: string): Promise<any> => {
  const wereToSave = `./tmp/test/${v4()}.png`;
  let stillExist: boolean;

  const httpsAgent = new SocksProxyAgent("socks://127.0.0.1:9050");
  try {
    const response = await axios({
      method: "GET",
      // httpsAgent,
      url: src,
      responseType: "stream", // Important: responseType 'stream' to handle large files
    });
    console.log("imag download", wereToSave);
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
    console.log("error while download the img", wereToSave, src, err.message);
  }
  return { wereToSave, stillExist };
};

downloadImg(
  "https://camo.fimfiction.net/3Jju_Z93NjG41u9-HmJGWbjUJA88XI9DQAWTA7KDhdg?url=http%3A%2F%2Fi.imgbox.com%2FR95yStgw.png",
);
