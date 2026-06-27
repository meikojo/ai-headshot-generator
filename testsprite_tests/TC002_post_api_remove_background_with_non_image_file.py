import requests

def test_post_api_remove_background_with_non_image_file():
    url = "http://localhost:3000/api/remove-background"
    # Prepare a non-image file content to upload
    files = {
        "image": ("test.txt", b"This is a test text file, not an image.", "text/plain")
    }
    headers = {}
    try:
        response = requests.post(url, files=files, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    # Assert that the status code is a 4xx client error
    assert 400 <= response.status_code < 500, f"Expected 4xx status code, got {response.status_code}"
    # Assert that response content indicates an upload type validation error
    try:
        res_json = response.json()
    except ValueError:
        # If response is not JSON, fail the test
        assert False, "Response is not JSON when expecting error details"
    error_message = res_json.get("error") or res_json.get("message") or ""
    assert "upload type validation" in error_message.lower() or "invalid file type" in error_message.lower(), \
        f"Error message does not indicate upload type validation error: {error_message}"

test_post_api_remove_background_with_non_image_file()