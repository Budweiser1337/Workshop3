import requests
from sklearn import datasets
import json


# Define ngrok URLs for each model
ngrok_urls = {
    'Model1': 'http://4.tcp.eu.ngrok.io:14365',
    
    'Model2' : 'http://0.tcp.eu.ngrok.io:12913'
}


# # Collect predictions from each model server
# Initialize dictionary to store predictions
predictions = {}

# Send 1DARRAY prediction requests to each model's API endpoint
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



# Weights for each model 
weights = {model_name: 1.0 for model_name in ngrok_urls.keys()}

# Make the prediction with the meta-model's predictions weights
s=0
for model,pred in predictions.items():
    s+=(weights[model] * pred)/sum(weights.values())
       
aggregated_prediction = 1 if (s) >= 1 else 0 
print(f"Consensus Prediction : {aggregated_prediction}") 




## Accuracy for each models  


# X,y= datasets.fetch_openml(name='titanic',version=1,as_frame=True,return_X_y=True)
# X=X.drop(['ticket','home.dest','name','body','cabin','boat'],axis=1)
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
# from sklearn.model_selection import train_test_split
# from sklearn import metrics
# Send 2DARRAY prediction requests to each model's API endpoint
# for model_name, ngrok_url in ngrok_urls.items():
#     # Construct prediction request URL
#     prediction_url = f"{ngrok_url}/predict"
#     params={'features':X_test}
#     # Send GET request to the prediction URL with features as parameters
#     response = requests.get(prediction_url, params=params)
    
#     # Extract prediction from response
#     prediction = response.json()['prediction']
    
#     # Store prediction
#     predictions[model_name] = prediction    
#     accuracy=metrics.accuracy_score(y_test, prediction)
#     print(f"Accuracy of {model_name} : {accuracy}")



# # proof-of-stake consensus mechanism with a slashing protocol
# Initialize JSON database
database = {
    'models': {}
}

# Function to register a new model
def register_model(model_id, initial_deposit):
    database['models'][model_id] = {
        'balance': initial_deposit,
        'weight': 1.0  # Initial weight
    }

# Function to penalize a model (slash its balance)
def slash_balance(model_id, penalty):
    if model_id in database['models']:
        database['models'][model_id]['balance'] -= penalty
        if database['models'][model_id]['balance'] < 0:
            database['models'][model_id]['balance'] = 0  # Ensure balance doesn't go negative

# Function to update model weight based on balance
def update_weight(model_id):
    if model_id in database['models']:
        balance = database['models'][model_id]['balance']
        total_balance = sum(model_data['balance'] for model_data in database['models'].values())
        if total_balance > 0:
            database['models'][model_id]['weight'] = balance / total_balance

# Example usage
register_model('Model1', initial_deposit=1000)
register_model('Model2', initial_deposit=1000)

# Example: Penalize Model1 with a slashing of 200 euros
slash_balance('Model1', penalty=200)

# Update weights based on balances
update_weight('Model1')
update_weight('Model2')

# Save database to JSON file
with open('database.json', 'w') as f:
    json.dump(database, f)