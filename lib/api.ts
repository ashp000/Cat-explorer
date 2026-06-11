const API_KEY = process.env.NEXT_PUBLIC_CAT_API_KEY;
const BASE_URL = "https://api.thecatapi.com/v1";

export async function fetchCats(page: number = 0, breedId?: string) {
  const params = new URLSearchParams({
    limit: "12",
    page: String(page),
    has_breeds: "1",
    ...(breedId && { breed_ids: breedId }),
  });

  const res = await fetch(`${BASE_URL}/images/search?${params}`, {
    headers: { "x-api-key": API_KEY! },
  });

  return res.json();
}

export async function fetchBreeds() {
  const res = await fetch(`${BASE_URL}/breeds`, {
    headers: { "x-api-key": API_KEY! },
  });

  return res.json();
}

export async function fetchFavorites() {
  try {
    const res = await fetch(`${BASE_URL}/favourites`, {
      headers: { "x-api-key": API_KEY! },
    });
    return res.json();
  } catch {
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
      body: JSON.stringify({ image_id: imageId }),
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