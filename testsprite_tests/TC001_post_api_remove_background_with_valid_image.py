import requests

def test_post_api_remove_background_with_valid_image():
    url = "http://localhost:3000/api/remove-background"
    image_path = "test_assets/valid_image.png"  # Path to a valid test PNG image file

    try:
        with open(image_path, "rb") as image_file:
            files = {"image": ("valid_image.png", image_file, "image/png")}
            response = requests.post(url, files=files, timeout=30)
        # Assert status code is 200
        assert response.status_code == 200, f"Expected status 200 but got {response.status_code}"
        # Assert content type is image/png
        content_type = response.headers.get("Content-Type", "")
        assert content_type == "image/png", f"Expected Content-Type 'image/png' but got '{content_type}'"
        # Assert response content is not empty
        assert response.content, "Response content is empty"
    except Exception as e:
        assert False, f"Request to remove background failed: {e}"

test_post_api_remove_background_with_valid_image()