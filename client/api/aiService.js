import axios from "axios";

export async function sendClothingImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post("http://localhost:8080/api/clothing/analyze", formData);
  return response.data;
}

export async function getSuggestions(wardrobe, targetItem) {
  const response = await axios.post("http://localhost:8080/api/clothing/suggest", {
    wardrobe,
    targetItem,
  });
  return response.data;
}

export async function getOutfitSuggestionsFromDB(userId) {
    const response = await axios.get("http://localhost:8080/api/clothes/suggest-outfit-from-db", {
        headers: {
      "x-user-id": userId
    }
  });
  return response.data;
}

export async function analyzeImageFromAI(file) {
    const formData = new FormData();
    formData.append("file", file);
  
    const response = await axios.post("http://localhost:8080/api/clothes/analyze", formData);
    return response.data;
  }