from fastapi.testclient import TestClient
from main import app

# បង្កើត Test Client ពី FastAPI App របស់យើង
client = TestClient(app)

# Test ទី 1: ពិនិត្យមើល Root Endpoint (ដើរឬអត់?)
def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Coffee Shop API Running"}

# Test ទី 2: ពិនិត្យមើល Database Connection
def test_db_check():
    response = client.get("/db-check")
    assert response.status_code == 200
    assert response.json()["status"] == "success"

# Test ទី 3: សាកល្បងហៅ API ដែលមិនតម្រូវឲ្យមាន Token (ឧ. Get Categories)
# កែប្រែ Test ទី 3 នេះ
def test_read_categories_without_token():
    response = client.get("/categories/")
    # ប្តូរពី 200 ទៅ 401 ព្រោះ API នេះត្រូវបានការពារដោយសុវត្ថិភាព (តម្រូវឲ្យមាន Token)
    assert response.status_code == 401

# Test ទី 4: សាកល្បង Login ជាមួយគណនីខុស (ត្រូវតែចេញ Error 401)
def test_login_wrong_credentials():
    response = client.post(
        "/auth/login",
        data={"username": "wrong_user", "password": "wrong_password"}
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Incorrect username or password"}