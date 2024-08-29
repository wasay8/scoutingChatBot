## Requirements
1. Install the following Python packages:
```
pip install pypdf2 langchain python-dotenv faiss-cpu openai sentence_transformers flask flask_cors
```

2. Create a `.env` file in the root directory of the project and add the following environment variables:
```
OPENAI_API_KEY= # Your OpenAI API key
```


## How to run 

This project is synchronized with the version used when the video was recorded.

To run the front code, please enter
```
  npm install
  nom start
```

To connect to the backend, please edit the baseURL in src\utils\request\http.js

The temp back_end code is located in temp_back_end folder. It can produce text and image by AI.

To run the back code, open another terminal, under the temp_back_end folder and enter
```
  python hello.py
```
Make sure that it run on the same address as baseURL in src\utils\request\http.js


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**


Bootstrapped with: [Create React App](https://github.com/facebook/create-react-app)
