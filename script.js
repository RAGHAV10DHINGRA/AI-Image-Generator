const generateForm = document.querySelector(".generate-form");
const generateBtn = generateForm.querySelector(".generate-btn");
const imageGallery = document.querySelector(".image-gallery");

const OPENAI_API_KEY = "sk-proj-SdgU0rNqRaP5aECfnyrFT3BlbkFJMo5khmGVEzsAszMGg08e";
let isImageGenerating = false;

const updateImageCard = (imgDataArray) => {
  imgDataArray.forEach((imgObject, index) => {
    const imgCard = imageGallery.querySelectorAll(".img-card")[index];
    const imgElement = imgCard.querySelector("img");
    const downloadBtn = imgCard.querySelector(".download-btn");
    
    // Setting the image source to the AI-generated image data
    const aiGeneratedImage = `data:image/jpeg;base64,${imgObject.b64_json}`;
    imgElement.src = aiGeneratedImage;
    
    // When the image is loaded, remove the loading class and set download attributes
    imgElement.onload = () => {
      imgCard.classList.remove("loading");
      downloadBtn.setAttribute("href", aiGeneratedImage); //download attribute
      downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`); //download attribute
    }
  });
}

const generateAiImages = async (userPrompt, userImgQuantity) => {
  try {
    // Sending a request to the OpenAI API to generate images based on user inputs
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: userPrompt,
        n: userImgQuantity,
        size: "512x512",
        response_format: "b64_json"
      }),
    });

    // Throw an error message if the API response is unsuccessful
    if(!response.ok) throw new Error("Failed to generate AI images. Make sure your API key is valid.");

    const { data } = await response.json(); // Get data from the response
    updateImageCard([...data]); //showing ai generatede images on the image gallery
  } catch (error) {
    alert(error.message);
  } finally {
    generateBtn.removeAttribute("disabled"); 
    generateBtn.innerText = "Generate";
    isImageGenerating = false; //here waiting for one to submit
  }
}

const handleImageGeneration = (e) => {
  e.preventDefault();
  if(isImageGenerating) return;

  // Get user input and image quantity values
  const userPrompt = e.srcElement[0].value;
  const userImgQuantity = parseInt(e.srcElement[1].value);
  
  // Disable the generate button, update its text, and set the flag
  generateBtn.setAttribute("disabled", true);
  generateBtn.innerText = "Generating";
  isImageGenerating = true;
  
  // Creating HTML markup for image cards with loading state
  const imgCardMarkup = Array.from({ length: userImgQuantity }, () => 
      `<div class="img-card loading">
        <img src="images/loader.svg" alt="AI generated image">
        <a class="download-btn" href="#">
          <img src="images/download.svg" alt="download icon">
        </a>
      </div>`
  ).join("");

  imageGallery.innerHTML = imgCardMarkup; //inserting html markup into image gallery
  generateAiImages(userPrompt, userImgQuantity);
}

generateForm.addEventListener("submit", handleImageGeneration);