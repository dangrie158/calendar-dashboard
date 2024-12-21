const BASE_URL = "http://192.168.178.207:8000";

export const fetcher = async (url: RequestInfo, init?: RequestInit) => {
    const response = await fetch(`${BASE_URL}/${url}`, init);
    return await response.json();
};
