import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Health endpoint tests
def test_health_endpoint():
    response = requests.get(f"{BASE_URL}/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"

def test_root_endpoint():
    response = requests.get(f"{BASE_URL}/api/")
    assert response.status_code == 200

# Contact endpoint tests
def test_contact_post_valid():
    payload = {
        "name": "TEST_User",
        "email": "test@example.com",
        "service": "orderflow",
        "message": "TEST_message for testing purposes"
    }
    response = requests.post(f"{BASE_URL}/api/contact", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "TEST_User"
    assert data["email"] == "test@example.com"
    assert data["service"] == "orderflow"
    assert "id" in data
    assert "created_at" in data

def test_contact_post_missing_field():
    # Missing message field
    payload = {"name": "Test", "email": "test@example.com", "service": "orderflow"}
    response = requests.post(f"{BASE_URL}/api/contact", json=payload)
    assert response.status_code == 422

def test_contacts_get():
    response = requests.get(f"{BASE_URL}/api/contacts")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
