import httpx

BASE = "https://fetchrelay.com/api"


def call(key, path, body=None):
    if not isinstance(key, str) or not key.startswith("fr_"):
        raise ValueError("Enter a FetchRelay API key without the Bearer prefix.")
    try:
        response = httpx.request(
            "GET" if body is None else "POST", BASE + path,
            headers={"Authorization": "Bearer " + key, "X-FetchRelay-Integration": "dify"},
            json=body, timeout=40, follow_redirects=False,
        )
    except httpx.HTTPError:
        raise ValueError("FetchRelay could not be reached. Check usage before retrying.") from None
    if response.status_code >= 300:
        raise ValueError(f"FetchRelay returned HTTP {response.status_code}. Check your key, allowance, and target page.")
    try:
        result = response.json()
    except ValueError:
        raise ValueError("FetchRelay returned an invalid response.") from None
    if result.get("success") is not True:
        raise ValueError("FetchRelay did not complete this request successfully.")
    return result
