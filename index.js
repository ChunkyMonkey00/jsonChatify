var version = "1.0.6";
//code
function gel(id) {
  return document.getElementById(id);
}

const behaviorPattern = {
  lastMessageTime: null,
  suspiciousCount: 0,
  allowedSuspicious: 3 // How many weird behaviors before we assume it’s a bot
};

function detectBotBehavior() {
  const now = Date.now();
  if (behaviorPattern.lastMessageTime) {
    let timeDifference = now - behaviorPattern.lastMessageTime;

    // Check for very fast repetitive messages
    if (timeDifference < 600) { // Less than 300ms gap is pretty suspicious
      behaviorPattern.suspiciousCount++;
      if (behaviorPattern.suspiciousCount > behaviorPattern.allowedSuspicious) {
        console.warn("Suspicious behavior detected. Possible bot."); // Handle bot behavior here
        return true; // Return true if it’s likely a bot
      }
    } else {
      // If the time gap is reasonable, reset suspicion counter
      behaviorPattern.suspiciousCount = 0;
    }
  }
  behaviorPattern.lastMessageTime = now;
  return false;
}

const messageTracker = {
  recentMessages: [], // Store the last few messages
  maxRecentMessages: 5, // How many recent messages to track
  similarityThreshold: 0.8 // How similar is "too similar"? (1 = identical)
};

// Function to calculate Levenshtein distance (basic string similarity algorithm)
function calculateSimilarity(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]) + 1;
      }
    }
  }

  const distance = dp[m][n];
  const longestLength = Math.max(m, n);
  return 1 - distance / longestLength; // Return a similarity score between 0 and 1
}

function detectSimilarMessages(newMessage) {
  for (let oldMessage of messageTracker.recentMessages) {
    let similarity = calculateSimilarity(newMessage, oldMessage);
    if (similarity >= messageTracker.similarityThreshold) {
      console.warn("Message too similar to recent ones. Possible bot detected."); // Let’s throw some suspicion here.
      return true;
    }
  }

  // Update the recent messages list
  messageTracker.recentMessages.push(newMessage);
  if (messageTracker.recentMessages.length > messageTracker.maxRecentMessages) {
    messageTracker.recentMessages.shift(); // Remove the oldest message to maintain the cap
  }

  return false;
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

  channel.listen("member_left", function (data) {
    let who = data.member.user;
    if (who) {
      gel("chatLog").innerText += `${who} left\n`; // Back to living their own life. How pathetic.
    }
  });

  const messageLimits = {
    maxMessages: 3, // Limit per timeframe
    timeframe: 10 * 1000, // 10 seconds in milliseconds
    messageTimestamps: []
  };

  function sendMessage() {
    if (detectBotBehavior()) {
      return; // Don't send if bot behavior is detected
    }

    let message = gel("message").value.trim(); // Strip those empty spaces because people can't type properly.
    if (message === "" || message.length > 300) return; // Why even try to send an empty message? Just don’t.

    const now = Date.now();

    // Clean up old timestamps outside the timeframe
    messageLimits.messageTimestamps = messageLimits.messageTimestamps.filter(ts => now - ts < messageLimits.timeframe);

    if (messageLimits.messageTimestamps.length >= messageLimits.maxMessages) {
      console.warn("You're sending messages too fast. Slow down."); // Passive-aggressive rate limit warning
      return; // Prevent sending if limit is hit
    }

    messageLimits.messageTimestamps.push(now); // Log this message’s timestamp

    if (detectSimilarMessages(message)) {
    console.warn("Message blocked due to suspicious similarity."); // Block message if it's too similar
    return;
    }
    
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

function getVersion() {

let versionElement = gel("version");
versionElement.innerHTML = "Version: "+version;

fetch('https://raw.githubusercontent.com/ChunkyMonkey00/jsonChatify/main/versionHistory.txt')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Oh great, a fetch error: ${response.statusText}`);
    }
    return response.text();
  })
  .then(text => {
    text = text.trim();
    console.log("Server version: "+text);
    if(text != version) {
      gel("version").style.color = "red";
      versionElement.innerHTML += " (outdated)";
    }
  })
  .catch(error => console.error('Fetch failed, because of course it did:', error));
}

getVersion();
