import sys, os
sys.path.insert(0, r'e:\SmartPaddyAdvisor\backend')
from app.service.prediction_service import get_prediction_results

sample = {"temperature":28.0, "soil_ph":6.5, "rainfall":120.0, "field_area":0.5, "humidity":75.0}
print('Calling get_prediction_results with sample:', sample)
res = get_prediction_results(sample)
print('RESULT:', res)
