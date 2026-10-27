from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_route_returns_truthful_status() -> None:
    response = client.get('/health')
    assert response.status_code == 200
    payload = response.json()
    assert payload['service'] == 'NeuroAge API'
    assert payload['status'] in {'ok', 'degraded'}
    assert payload['checks']['database'] == 'not_configured'


def test_invalid_request_has_consistent_error_shape() -> None:
    response = client.post('/api/v1/mri/validate', json={'file_name': '', 'file_size_bytes': 0})
    assert response.status_code == 422
    payload = response.json()
    assert 'error' in payload
    assert payload['error']['code'] == 'validation_error'
    assert 'request_id' in payload['error']


def test_openapi_docs_load() -> None:
    response = client.get('/openapi.json')
    assert response.status_code == 200
    payload = response.json()
    assert payload['info']['title'] == 'NeuroAge API'
