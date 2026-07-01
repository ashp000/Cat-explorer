const API_KEY = process.env.NEXT_PUBLIC_CAT_API_KEY;
const BASE_URL = "https://api.thecatapi.com/v1";
const SUB_ID = "user-default"; // identificador fixo do usuário

export const PAGE_LIMIT = 12;

export async function fetchCats(page: number = 0, breedId?: string) {
  try {
    const params = new URLSearchParams({
      limit: String(PAGE_LIMIT),
      page: String(page),
      has_breeds: "1",
      ...(breedId && { breed_ids: breedId }),
    });

    const res = await fetch(`${BASE_URL}/images/search?${params}`, {
      headers: { "x-api-key": API_KEY! },
    });

    if (!res.ok) {
      console.error(`fetchCats falhou: status ${res.status} (${res.statusText})`);
      return [];
    }

    return res.json();
  } catch (err) {
    console.error("fetchCats erro de rede:", err);
    return [];
  }
}

export async function fetchBreeds() {
  try {
    const res = await fetch(`${BASE_URL}/breeds`, {
      headers: { "x-api-key": API_KEY! },
    });
    if (!res.ok) {
      console.error(`fetchBreeds falhou: status ${res.status}`);
      return [];
    }
    return res.json();
  } catch (err) {
    console.error("fetchBreeds erro de rede:", err);
    return [];
  }
}

export async function fetchFavorites() {
  try {
    const res = await fetch(`${BASE_URL}/favourites?sub_id=${SUB_ID}`, {
      headers: { "x-api-key": API_KEY! },
    });
    if (!res.ok) {
      console.error(`fetchFavorites falhou: status ${res.status}`);
      return [];
    }
    return res.json();
  } catch (err) {
    console.error("fetchFavorites erro de rede:", err);
    return [];
  }
}

export async function addFavorite(imageId: string) {
  try {
    const res = await fetch(`${BASE_URL}/favourites`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_id: imageId, sub_id: SUB_ID }),
    });
    return res.json();
  } catch {
    return {};
  }
}

export async function removeFavorite(favouriteId: number) {
  try {
    await fetch(`${BASE_URL}/favourites/${favouriteId}`, {
      method: "DELETE",
      headers: { "x-api-key": API_KEY! },
    });
  } catch {
    return;
  }
}