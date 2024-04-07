import axios from "axios";
import { SocksProxyAgent } from "socks-proxy-agent";

const main = async () => {
  console.log("hello tests");
  try {
    const httpsAgent = new SocksProxyAgent("socks://127.0.0.1:9050");
    const result = await axios({
      httpsAgent,
      method: "get",
      url: "https://api.ipify.org",
    });
    console.log(result.data);
  } catch (err) {
    console.log(err);
  }
};

main();
