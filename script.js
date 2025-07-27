/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
let latestPrompt = null;

displayInitMessage();

const workerURL = 'https://loreal-chatbot-worker.theodore-anthony-reyes.workers.dev/';

// Chat message history is stored here
let messages = [
  {
    role: 'system',
    content: `You are a L'Oreal branded chatbot designed to help customers navigate L'Oreal's extensive
    product catalog and provide tailored recommendations based on client input. Provide responses in a
    fun, professional manner, using emojis when it enhances the response. Make responses easy to understand
    and do not go into excessive detail unless specifically asked to.

    Try to break apart long paragraphs into bullet points when necessary.
    
    Importantly, if user input is not related to beauty products, skincare, routines, recommendations, or beauty-related topics,
    then politely tell the user that you can not help them with that, but that you are ready to answer beauty-product-related
    questions or other questions regarding L'Oreal products. If user input not related to beauty products, then do not directly
    acknowledge whatever subject matter or content was entered in the user input.`
  }
];

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Adds user prompt to message history
  let prompt = userInput.value.trim();
  messages.push({role: 'user', content: prompt});
  
  // Removes init message
  removeInitMessage();

  // Displays prompt in chat box
  displayPrompt(prompt);

  // Clear input form 
  userInput.value = '';

  displayThinking();

  try {
    // Fetch request sent through CloudFlare worker
    const response = await fetch(workerURL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({messages: messages})
    });
    
    // Checks response status
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    const outputText = result.choices[0].message.content;
    messages.push({role: 'assistant', content: outputText});

    removeThinking();
    displayReply(outputText);

  } catch (error) {
    console.error(`ERROR: ${error}`);
    removeThinking();
    displayReply('Error occurred! Please try again later');
  }

});

// Takes reply text from API call and displays it inside chat window
function displayReply(text) {
  const replyDiv = document.createElement('div');
  const replyText = document.createElement('p');
  replyDiv.classList.add('reply-window');
  replyText.classList.add('reply-text');
  replyText.innerHTML = marked.parse(text);
  replyDiv.appendChild(replyText);
  chatWindow.appendChild(replyDiv);
  scrollUX();
}

// Takes prompt text and displays it inside chat window
function displayPrompt(text) {
  const promptDiv = document.createElement('div');
  latestPrompt = promptDiv;
  const promptText = document.createElement('p');
  promptDiv.classList.add('prompt-window');
  promptText.classList.add('prompt-text');
  promptText.textContent = text;
  promptDiv.appendChild(promptText);
  chatWindow.appendChild(promptDiv);
  scrollUX();
}

// Displays "Thinking..."
function displayThinking() {
  const thinkingDiv = document.createElement('div');
  const thinkingText = document.createElement('p');
  thinkingDiv.id = 'think-bubble'
  thinkingDiv.classList.add('reply-window');
  thinkingText.classList.add('reply-text');
  thinkingText.textContent = 'Thinking...';
  thinkingDiv.appendChild(thinkingText);
  chatWindow.appendChild(thinkingDiv);
  scrollUX();
}

// Removes the "Thinking..." text from chat box
function removeThinking() {
  let thinkBubble = document.getElementById('think-bubble').remove();
  if (thinkBubble)
    thinkBubble.remove();
}

// Displays initial message to user
function displayInitMessage() {
  chatWindow.textContent = ''; // Avoids odd spacing of init message
  const initMsgP = document.createElement('p');
  initMsgP.textContent = `👋 Hello! How can I help you today?`;
  initMsgP.classList.add('reply-text');
  initMsgP.id = 'init-text';
  chatWindow.appendChild(initMsgP);
}

// Removes initial message to user
function removeInitMessage() {
  let initBubble = document.getElementById('init-text');
  if (initBubble)
    initBubble.remove();
}

// Auto-scrolls the chat window down when next chat bubbles enter the window
function scrollUX() {
  setTimeout(() => {
    if (!latestPrompt) return;

    const containerTop = chatWindow.getBoundingClientRect().top;
    const elementTop = latestPrompt.getBoundingClientRect().top;

    const offset = elementTop - containerTop - 10;

    chatWindow.scrollTo({
      top: chatWindow.scrollTop + offset,
      behavior: 'smooth'
    });
  }, 0);
}