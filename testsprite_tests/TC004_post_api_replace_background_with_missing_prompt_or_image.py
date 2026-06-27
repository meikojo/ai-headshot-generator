import requests
import io

BASE_URL = "http://localhost:3000"
ENDPOINT = "/api/replace-background"
TIMEOUT = 30

def test_post_api_replace_background_missing_prompt_or_image():
    """
    Test the POST /api/replace-background endpoint by sending requests missing
    either the image file or the prompt string. Verify that the response status
    is a 4xx error and the error message indicates required-field validation feedback.
    """

    # Helper to create a minimal dummy PNG image file in memory without PIL
    def create_dummy_image():
        # Minimal valid PNG image (1x1 red pixel)
        png_bytes = (
            b'\x89PNG\r\n\x1a\n'
            b'\x00\x00\x00\rIHDR'
            b'\x00\x00\x00\x01'  # Width: 1
            b'\x00\x00\x00\x01'  # Height: 1
            b'\x08'                # Bit depth: 8
            b'\x02'                # Color type: Truecolor
            b'\x00'                # Compression method
            b'\x00'                # Filter method
            b'\x00'                # Interlace method
            b'\x90wS\xde'
            b'\x00\x00\x00\x0cIDAT'
            b'\x08\xd7c\xf8\xcf\xc0\x00\x00\x04\x00\x01\xe2\x27\x26\x05\x9b'
            b'\x00\x00\x00\x00IEND\xaeB`\x82'
        )
        return io.BytesIO(png_bytes)

    headers = {
        # No auth required as per PRD
    }

    url = BASE_URL + ENDPOINT
    errors = []

    # Case 1: Missing image file, only prompt provided
    prompt_only_data = {
        'prompt': 'a beautiful beach background'
    }
    response1 = requests.post(url, data=prompt_only_data, headers=headers, timeout=TIMEOUT)
    try:
        assert 400 <= response1.status_code < 500, f"Expected 4xx status, got {response1.status_code}"
        resp_json = None
        try:
            resp_json = response1.json()
        except Exception:
            pass
        if resp_json:
            error_text = str(resp_json).lower()
            assert 'image' in error_text or 'required' in error_text, \
                f"Expected error message about missing 'image', got {resp_json}"
        else:
            # If no json body, check text content for validation message keywords
            text = response1.text.lower()
            assert 'image' in text or 'required' in text, \
                f"Expected error message about missing 'image', got response text: {response1.text}"
    except AssertionError as e:
        errors.append(f"Missing image file test failed: {str(e)}")

    # Case 2: Missing prompt field, only image provided
    dummy_image_file = create_dummy_image()
    files = {
        'image': ('test.png', dummy_image_file, 'image/png')
    }
    response2 = requests.post(url, files=files, headers=headers, timeout=TIMEOUT)
    try:
        assert 400 <= response2.status_code < 500, f"Expected 4xx status, got {response2.status_code}"
        resp_json = None
        try:
            resp_json = response2.json()
        except Exception:
            pass
        if resp_json:
            error_text = str(resp_json).lower()
            assert 'prompt' in error_text or 'required' in error_text, \
                f"Expected error message about missing 'prompt', got {resp_json}"
        else:
            text = response2.text.lower()
            assert 'prompt' in text or 'required' in text, \
                f"Expected error message about missing 'prompt', got response text: {response2.text}"
    except AssertionError as e:
        errors.append(f"Missing prompt test failed: {str(e)}")

    if errors:
        raise AssertionError(" ; ".join(errors))

test_post_api_replace_background_missing_prompt_or_image()
