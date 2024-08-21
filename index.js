function gel(id) {
  return document.getElementById(id);
}

async function connect() {
  showLoadingScreen();

  var username;
  var message;

  var piesocket = new PieSocket.default({
    clusterId: "free.blr2",
    apiKey: "Adfa5neh1Itih3stVA46TeRkqjj4XHFfbV8dZhEg",
    notifySelf: true,
    presence: true,
  });

  var channel;

  console.log("Connecting...");

  await piesocket.subscribe("chat-room").then(ch => {
    channel = ch;
  });

  console.log("Connected.");

  showMessageScreen();

  channel.listen("system:member_joined", function (data) {
    console.log(data.member.user + " joined.");

    channel.listen("new_message", function (data, meta) {
      if (data.sender && data.text) {
        console.log(data.sender + ": " + data.text);
        gel("chatLog").innerText = gel("chatLog").innerText +"\n"+ (data.sender + ": "+ data.text);
        gel("message").value = "";

        gel("chatLog").scrollTop = gel("chatLog").scrollHeight;
      }
    });
  });

  function sendMessage() {
    if(message == "") return;

    channel.publish("new_message", {
      sender: username,
      text: message
    });

    message = "";
  }

  gel("sendMessage").onclick = sendMessage;
  document.addEventListener('keyup', () => {
    username = gel("username").value;
    message = gel("message").value;
  });
}

function showLoadingScreen() {
  gel("connect").remove();
  gel("loadingScreen").style.visibility = "visible";
}

function showMessageScreen() {
  gel("loadingScreen").remove();
  gel("messageScreen").style.visibility = "visible";
}

gel("connect").onclick = connect;
