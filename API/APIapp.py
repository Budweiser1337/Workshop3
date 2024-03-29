from flask import Flask, request, jsonify
# from sklearn.preprocessing import StandardScaler, OrdinalEncoder
import os
import pandas as pd
import numpy as np
import joblib

app = Flask(__name__)

models_directory = '../Models/'
  # Dictionary to store loaded models
# numerical_scaler = StandardScaler()
# categorical_encoder = OrdinalEncoder()

@app.route('/select_model', methods=['POST', 'GET'])
def select_model():
    try:
        # Get the model filename from the request
        model_filename = request.json.get('model')
        
        # Check if the model filename is provided
        if not model_filename:
            raise ValueError("Model filename not provided.")
        
        # Load the selected model if not already loaded
        
        model_path = os.path.join(models_directory, model_filename)
        global loaded_models
        loaded_models = joblib.load(model_path)
        
        return jsonify({'message': f'Model {model_filename} selected successfully.'})
    
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['GET','POST'])

def predict():
    try:
        # Extract features adapted for the selected from the URL parameters and adapt for the se
        model_path = os.path.join(models_directory,'RandomForest.pkl')
        a=joblib.load(model_path)
        
        features = request.args.getlist('features')
        features=np.array([features])
        if type(loaded_models) == type(a):
            columns = ['pclass','sex',	'age',	'sibsp','parch','fare',	'embarked']
            features=pd.DataFrame(features, columns=columns)
        else:
            columns = ['sex',	'age',	'fare',	'embarked']
            features=pd.DataFrame(features, columns=columns)
        



        # Preprocess features
        # features=np.array(features)
        
        # # Check if features are provided
        # if not features:
        #     raise ValueError("Features not provided in the URL.")

        # Get the selected model
        # selected_model_filename = request.args.get('model')
        # if selected_model_filename not in loaded_models:
        #     raise ValueError("Model not selected or loaded. Please select a model using /select_model endpoint.")
        model = loaded_models

        # Make the prediction with the model
        prediction = model.predict(features)

        # Return the prediction to the client
        return jsonify({'prediction': int(prediction[0])})
    except ValueError as ve:

        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def home():
    return 'Hello, this is the home page!'

if __name__ == '__main__':
    app.run(port=5000, debug=True)
