function gel(id) {
  return document.getElementById(id);
}

async function connect() {
  showLoadingScreen(); // Great, another loading screen. Let's waste some more of our life waiting.
  gel("username").value = localStorage.getItem("username") || "New User";
  let username = gel("username").value || "New User"; // Seriously, if they can't even come up with a name, I guess they're just "New User."

  var piesocket = new PieSocket.default({
    clusterId: "free.blr2", // I have no clue what "free.blr2" means, but here we are.
    apiKey: "Adfa5neh1Itih3stVA46TeRkqjj4XHFfbV8dZhEg", // Yay, another API key to leak in public code.
    notifySelf: true, // Because apparently, I need to notify myself that I exist.
    presence: true, // Sure, let’s keep track of who's present like we’re taking attendance in kindergarten.
  });

  console.log("Connecting..."); // Please work. Please work. Please work.

  let channel = await piesocket.subscribe("chat-room"); // Finally subscribed, like it’s a YouTube channel.
  console.log("Connected."); // Great, now the chaos begins.
  
  // Send a "new user joined" message when the user connects
  sendNewMessage(`${username} joined`); // Woohoo, they’ve arrived. Let’s throw a party.

  showMessageScreen(); // Time to actually show some content. Not that anyone cares.

  // Listen for new messages
  channel.listen("new_message", function (data) {
    if (data.sender && data.text) {
      console.log(data.sender + ": " + data.text); // Let’s log more stuff nobody will ever read.
      if (data.isJoinMessage) {
        gel("chatLog").innerText += `${data.text}\n`; // Ah, yes, another person joining the circus.
      } else {
        gel("chatLog").innerText += `${data.sender}: ${data.text}\n`; // Look, someone typed something. Groundbreaking.
      }
      gel("chatLog").scrollTop = gel("chatLog").scrollHeight; // And of course, we have to scroll down to the bottom because who reads the old stuff?
    }
  });

  function sendMessage() {
    let message = gel("message").value.trim(); // Strip those empty spaces because people can't type properly.
    if (message === "" || message.length > 300) return; // Why even try to send an empty message? Just don’t.

    channel.publish("new_message", {
      sender: username,
      text: message,
    });

    gel("message").value = ""; // Clear the input because who leaves messages hanging?
    localStorage.setItem("username", username); // Let’s store the username so we never have to ask again.
  }

  function sendNewMessage(message) {
    channel.publish("new_message", {
      sender: username,
      text: message,
      isJoinMessage: true, // Yeah, it’s a join message. We’re really doing this.
    });
  }

  // Send message on button click
  gel("sendMessage").onclick = sendMessage; // Let’s bind the send button like we have a choice.

  // Update username and message on keyup
  document.addEventListener('keyup', () => {
    username = gel("username").value.trim() || "New User"; // Update the username on every keystroke because apparently, that’s what life has come to.
  });
}

function showLoadingScreen() {
  gel("connect").remove(); // Rip out that connect button like it never mattered.
  gel("loadingScreen").style.visibility = "visible"; // Because loading screens are so fun to look at.
}

function showMessageScreen() {
  gel("loadingScreen").remove(); // Bye-bye, loading screen. Nobody liked you anyway.
  gel("messageScreen").style.visibility = "visible"; // Now let’s show the chat screen where the real madness begins.
}

// Connect on button click
gel("connect").onclick = connect; // Let’s see if anyone is brave enough to click this.
