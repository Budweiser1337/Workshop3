import requests

import requests

# Define ngrok URLs for each model
ngrok_urls = {
    'Model1': 'http://0.tcp.eu.ngrok.io:12912'
    # Add more models and their Ngrok URLs as needed
    # 'Model2' : 'http://<ngrok_url_model2>'
}


# Define model filename


# Initialize dictionary to store predictions
predictions = {}

# Send prediction requests to each model's API endpoint
for model_name, ngrok_url in ngrok_urls.items():
    # Construct prediction request URL
    prediction_url = f"{ngrok_url}/predict?features=2.0&features=male&features=28.0&features=0.0&features=0.0&features=13.0&features=S"
    
    # Send GET request to the prediction URL with features as parameters
    response = requests.get(prediction_url)
    
    # Extract prediction from response
    prediction = response.json()['prediction']
    
    # Store prediction
    predictions[model_name] = prediction

# Print collected predictions
for model_name, prediction in predictions.items():
    print(f"Prediction from {model_name}: {prediction}")





# # Send requests to each model server
# response_model1 = requests.post(model1_url, json=data)
# response_model2 = requests.post(model2_url, json=data)
# # Send requests to other model servers as needed

# # Collect predictions
# predictions_model1 = response_model1.json()
# predictions_model2 = response_model2.json()
# # Collect predictions from other model servers as needed

# # Aggregate predictions (e.g., average for regression or voting for classification)
# # Example aggregation for classification using voting
# def aggregate_predictions(predictions):
#     s=0
#     for model,pred in predictions:
#         s+=pred
#     aggregated_prediction = 1 if (pred) >= 1.5 else 0  # Voting
#     return aggregated_predictions

# aggregated_predictions = aggregate_predictions(predictions_model1, predictions_model2)
# # Aggregate predictions from other model servers as needed

# # Use aggregated predictions as needed
# print("Aggregated Predictions:", aggregated_predictions)