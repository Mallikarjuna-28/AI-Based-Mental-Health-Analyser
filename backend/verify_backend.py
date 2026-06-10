import sys
import os
from datetime import datetime

# Set path to include parent directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from fastapi.testclient import TestClient
    from app.main import app
except ImportError as e:
    print(f"Import Error: {e}. Please ensure fastapi is installed.")
    sys.exit(1)

client = TestClient(app)

def run_tests():
    print("==================================================")
    print("STARTING BACKEND API INTEGRATION TESTS")
    print("==================================================")

    # 1. Test Root Endpoint
    print("\n1. Testing Root Status Endpoint...")
    res_root = client.get("/")
    assert res_root.status_code == 200, f"Expected 200, got {res_root.status_code}"
    print("SUCCESS:", res_root.json())

    # Generate unique email for registration test
    test_email = f"test_{int(datetime.utcnow().timestamp())}@academic.com"
    test_password = "securepassword123"

    # 2. Test Registration Endpoint
    print("\n2. Testing User Registration...")
    reg_payload = {
        "name": "Academic Tester",
        "email": test_email,
        "password": test_password
      }
    res_reg = client.post("/api/v1/users/register", json=reg_payload)
    assert res_reg.status_code == 201, f"Expected 201, got {res_reg.status_code}"
    reg_data = res_reg.json()
    assert "token" in reg_data, "Auth token not returned"
    print("SUCCESS: Registered User:", reg_data["user"]["name"])
    
    token = reg_data["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Test Profile Retrieval
    print("\n3. Testing Profile Retrieval...")
    res_profile = client.get("/api/v1/users/me", headers=headers)
    assert res_profile.status_code == 200, f"Expected 200, got {res_profile.status_code}"
    print("SUCCESS: Profile Retrieved:", res_profile.json())

    # 4. Test Text Analysis Endpoint
    print("\n4. Testing Natural Language Text Sentiment...")
    text_payload = {"text": "I feel extremely happy, peaceful, and excited today!"}
    res_text = client.post("/api/v1/analysis/text", json=text_payload, headers=headers)
    assert res_text.status_code == 200, f"Expected 200, got {res_text.status_code}"
    text_data = res_text.json()
    assert text_data["sentiment"] == "Positive", f"Expected Positive, got {text_data['sentiment']}"
    print("SUCCESS: Text Sentiment:", text_data["sentiment"], "Stress Score:", text_data["stress_score"])

    # 5. Test Questionnaire Endpoint
    print("\n5. Testing Psychological Questionnaire Assessment...")
    quest_payload = {
        "sleep_quality": 8,
        "anxiety_level": 3,
        "stress_level": 2,
        "mood_score": 8,
        "energy_level": 9,
        "motivation_level": 9
    }
    res_quest = client.post("/api/v1/analysis/questionnaire", json=quest_payload, headers=headers)
    assert res_quest.status_code == 200, f"Expected 200, got {res_quest.status_code}"
    quest_data = res_quest.json()
    assert quest_data["risk_category"] == "Low Risk", f"Expected Low Risk, got {quest_data['risk_category']}"
    print("SUCCESS: Wellness score:", quest_data["wellness_score"], "Risk Category:", quest_data["risk_category"])

    # 6. Test Report Fusion Compiler
    print("\n6. Testing Report Fusion Generator...")
    res_report = client.post("/api/v1/reports/generate", headers=headers)
    assert res_report.status_code == 200, f"Expected 200, got {res_report.status_code}"
    report_data = res_report.json()
    assert "overall_wellness_score" in report_data, "overall_wellness_score missing from fusion output"
    print("SUCCESS: Report Compiled!")
    print("Wellness Score:", report_data["overall_wellness_score"])
    print("Stress level:", report_data["stress_level"])
    print("Suggested Activities:", report_data["suggested_activities"])

    # 7. Test Exporting Report to CSV
    print("\n7. Testing CSV Export...")
    report_id = report_data.get("id") or report_data.get("_id")
    res_csv = client.get(f"/api/v1/reports/{report_id}/csv", headers=headers)
    assert res_csv.status_code == 200, f"Expected 200, got {res_csv.status_code}"
    assert "text/csv" in res_csv.headers["content-type"], "Expected CSV stream content header"
    print("SUCCESS: CSV Download verified. Content size:", len(res_csv.content))

    print("\n==================================================")
    print("ALL API INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
