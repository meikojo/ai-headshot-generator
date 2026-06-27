import requests
from io import BytesIO

def test_post_api_replace_background_with_valid_image_and_prompt():
    base_url = "http://localhost:3000"
    endpoint = "/api/replace-background"
    url = base_url + endpoint
    timeout = 30

    # Use a small valid PNG image (1x1 pixel) for testing
    image_content = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc`\x00\x00"
        b"\x00\x02\x00\x01\xe2!\xbc\x33\x00\x00\x00\x00IEND\xaeB`\x82"
    )

    files = {
        "image": ("test.png", BytesIO(image_content), "image/png"),
    }
    data = {
        "prompt": "A sunny beach background"
    }

    try:
        response = requests.post(url, files=files, data=data, timeout=timeout)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    content_type = response.headers.get("Content-Type", "")
    assert content_type == "image/png", f"Expected Content-Type 'image/png' but got '{content_type}'"
    assert response.content, "Response content is empty"
    # Optional: check PNG file signature
    assert response.content.startswith(b"\x89PNG\r\n\x1a\n"), "Response content is not a valid PNG image"

test_post_api_replace_background_with_valid_image_and_prompt()