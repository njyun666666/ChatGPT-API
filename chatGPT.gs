// chatgpt token
const token = "token";

// LINE Messenging API Token
const CHANNEL_ACCESS_TOKEN = "token";

const cmdMapping = {
  ai: "text",
  img: "image",
};

function test() {
  const newText = LanguageApp.translate("寶可夢", "", "en");
  console.log(newText);
}

function doPost(e) {
  let replyToken;
  let reply_message; // reply_messgae 為要回傳給 LINE 伺服器的內容，JSON 格式，詳情可看 LINE 官方 API 說明

  logWrite({
    level: LogLevelEnum.DEBUG,
    method: doPost.name,
    desc: "Line e",
    postData: JSON.stringify(e),
    message: "",
  });

  try {
    // 以 JSON 格式解析 User 端傳來的 e 資料
    const msg = JSON.parse(e.postData.contents);

    logWrite({
      level: LogLevelEnum.DEBUG,
      method: doPost.name,
      desc: "Line postData.contents",
      postData: JSON.stringify(msg),
      message: "",
    });

    console.log(`Line msg: ${JSON.stringify(msg)}`);

    // 從接收到的訊息中取出 replyToken 和發送的訊息文字，詳情請看 LINE 官方 API 說明文件

    const eventType = msg.events[0].type;

    if (eventType !== "message") {
      return;
    }

    replyToken = msg.events[0].replyToken; // 回覆的 token
    const userMessage = msg.events[0].message.text; // 抓取使用者傳的訊息內容
    const user_id = msg.events[0].source.userId; // 抓取使用者的 ID，等等用來查詢使用者的名稱
    const event_type = msg.events[0].source.type; // 分辨是個人聊天室還是群組，等等會用到

    const cmdMessage = getCmdMessage(userMessage);

    if (!cmdMessage) {
      return;
    }

    switch (cmdMessage.type) {
      case "text":
        reply_message = callAPI_chat(cmdMessage.content);
        break;

      case "image":
        reply_message = callAPI_image(cmdMessage.content);
        break;
    }
  } catch (error) {
    reply_message = [
      {
        type: "text",
        text: String(error),
      },
    ];

    logWrite({
      level: LogLevelEnum.ERROR,
      method: doPost.name,
      desc: "exception",
      postData: "",
      message: error,
    });
  }

  console.log("reply_message", reply_message);
  callLineAPI(replyToken, reply_message);
}

function callLineAPI(replyToken, reply_message) {
  if (!replyToken) {
    logWrite({
      level: LogLevelEnum.ERROR,
      method: callLineAPI.name,
      desc: "replyToken is null",
      postData: "",
      message: error,
    });

    return;
  }

  try {
    const payload = JSON.stringify({
      replyToken: replyToken,
      messages: reply_message,
    });

    logWrite({
      level: LogLevelEnum.DEBUG,
      method: callLineAPI.name,
      desc: "Line api payload",
      postData: payload,
      message: "",
    });

    //回傳 JSON 給 LINE 並傳送給使用者
    const url = "https://api.line.me/v2/bot/message/reply";
    const apiResponse = UrlFetchApp.fetch(url, {
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: "Bearer " + CHANNEL_ACCESS_TOKEN,
      },
      method: "post",
      payload: payload,
      muteHttpExceptions: true,
    });

    const json = JSON.parse(apiResponse.getContentText());

    logWrite({
      level: LogLevelEnum.DEBUG,
      method: callLineAPI.name,
      desc: "Line api response",
      postData: "",
      message: apiResponse.getContentText(),
    });

    if (apiResponse.getResponseCode() !== 200) {
      throw new Error(json.message);
    }
  } catch (error) {
    logWrite({
      level: LogLevelEnum.ERROR,
      method: callLineAPI.name,
      desc: "exception",
      postData: "",
      message: error,
    });
  }
}

function getCmdMessage(userMessage) {
  const regex = /^!([.\S]+)\s(.+)/gs;
  const result = regex.exec(userMessage);

  if (!result) {
    return;
  }

  const cmd = cmdMapping[result[1].trim().toLowerCase()];

  if (!cmd) {
    return;
  }

  return {
    type: cmd,
    content: result[2],
  };
}

function callAPI_chat(content) {
  let result;
  const url = "https://api.openai.com/v1/chat/completions";

  try {
    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: content,
        },
      ],
    };

    logWrite({
      level: LogLevelEnum.DEBUG,
      method: callAPI_chat.name,
      desc: "chat request payload",
      postData: JSON.stringify(payload),
      message: "",
    });

    const response = UrlFetchApp.fetch(url, {
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      method: "post",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    logWrite({
      level: LogLevelEnum.DEBUG,
      method: callAPI_chat.name,
      desc: "chat response ",
      postData: response.getContentText(),
      message: "",
    });

    const json = JSON.parse(response.getContentText());

    if (response.getResponseCode() === 200) {
      result = [
        {
          type: "text",
          text: json.choices[0]["message"]["content"],
        },
      ];
    } else {
      console.log(json.error.message);
      throw new Error(json.error.message);
    }
  } catch (error) {
    console.log(error);

    logWrite({
      level: LogLevelEnum.ERROR,
      method: callAPI_chat.name,
      desc: "exception",
      postData: "",
      message: error,
    });

    throw new Error(error);
  }

  console.log(result);
  return result;
}

function callAPI_image(content) {
  let result;
  const url = "https://api.openai.com/v1/images/generations";

  try {
    const payload = {
      prompt: LanguageApp.translate(content, "", "en"),
      n: 1,
      size: "512x512",
    };

    logWrite({
      level: LogLevelEnum.DEBUG,
      method: callAPI_image.name,
      desc: "image request payload",
      postData: JSON.stringify(payload),
      message: "",
    });

    const response = UrlFetchApp.fetch(url, {
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
      method: "post",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    logWrite({
      level: LogLevelEnum.DEBUG,
      method: callAPI_image.name,
      desc: "image response",
      postData: response.getContentText(),
      message: "",
    });

    const json = JSON.parse(response.getContentText());
    console.log("getResponseCode", response.getResponseCode());
    console.log(json);

    if (response.getResponseCode() === 200) {
      result = [];

      json.data.forEach((imgUrl) => {
        result.push({
          type: "image",
          originalContentUrl: imgUrl.url,
          previewImageUrl: imgUrl.url,
        });
      });

      // const imgUrl = json.data[0]["url"];
    } else {
      console.log(json.error.message);
      throw new Error(json.error.message);
    }
  } catch (error) {
    console.log(error);

    logWrite({
      level: LogLevelEnum.ERROR,
      method: callAPI_image.name,
      desc: "exception",
      postData: "",
      message: error,
    });

    throw new Error(error);
  }

  console.log(result);
  return result;
}
