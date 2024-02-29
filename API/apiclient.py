
import requests
import numpy as np

# Function to select model and get predictions
def select_models(model_filename):
    # URL for model selection
    select_model_url = 'http://127.0.0.1:5000/select_model'
    headers = {
    'Content-Type': 'application/json'
}

    # JSON payload for selecting the model
    payload = {'model': model_filename}

    # Send a POST request to select the model
    response = requests.post(select_model_url, json=payload,headers=headers)
    
    # Check if model selection was successful
    if response.status_code != 200:
        print('Error selecting model:', response.json())
    else :
        print('Model selected:', response.json())
        
        

    # # URL for prediction
    # predict_url = 'http://127.0.0.1:5000/predict'

    # # Parameters for prediction request
    # params = {'features': input_features,'model': model_filename}
    
    # # Send a GET request with input features for prediction
    # response = requests.get(predict_url, params=params)
    
    # # Check if prediction request was successful
    # if response.status_code == 200:
    #     # prediction = response.json()['prediction']
    #     print('Prediction:', response.json())
    #     print('URL:', response.url)
    # else:
    #     print('Error getting prediction:', response.json())


model_filename = 'RandomForest.pkl'
# input_features = np.array([[2.0, 'male', 28.0,0.0, 0.0, 13.0, 'S']])
# get_predictions(model_filename, input_features)
select_models(model_filename)
