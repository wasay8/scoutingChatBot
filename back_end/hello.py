from flask import Flask, render_template, request, jsonify
from flask_cors import cross_origin
from flask_cors import CORS
from chatbox import ChatBot
import pandas as pd
import os

app = Flask(__name__)
app.dubug = True
CORS(app)

chatbot = ChatBot()
pdf_list = []
dir_path = r"./pdf_data"
file_list = os.listdir(dir_path)

for file in file_list:
    pdf_list.append(os.path.join(dir_path,file))

 
chatbot.updatebypdf(is_pdf=False)
chatbot.updatebypdf(pdf_list)   

@app.route("/")
def hello_world():
    return "<p>Hello,World!</p>"

@app.route("/api/handle_input",methods=['POST'])
def handle_user_input():
    question = request.json
    words = ""
    pictures = []
    picture_sign = False
    
    for item in question:
    	if type(item["insert"]) == str:
    	    words+=item["insert"]
    	else:
    	    pictures.append(item["insert"])
    if "image generation" in words.lower():
        picture_sign = True
        words = words.replace("Image generation","")
    id = 'id'
    color = 'color'
    icon = 'icon'
    position = 'position'
    info = 'info'
    insert = 'insert'
    print(words,pictures,picture_sign)
    words_answer = chatbot.conversation_chain({'question':words})['answer']
    # Words response
    content = { id: 1, color: "#00B853", icon: 'messageIcon', position: 'left', info: [{ insert: words_answer }]}
    if not pictures and not picture_sign:
        return jsonify(content)
    else:
        content[info][0][insert] = words_answer+"\n\nHere is picture reference\n\n" 
        image_url = chatbot.get_image(words)
        content[info].append({insert:{'image':image_url}})
        return jsonify(content)
    

@app.route("/api/handle_upload",methods=['POST'])
def handle_upload():
    pdf_docs = request.files['file']
    chatbot.updatebypdf([pdf_docs])
    print("here is upload function")
    return 'Success'
    
@app.route("/api/upload_csv",methods=['POST'])
def handle_upload_csv():
    csv_docs = request.files['file']
    df = pd.read_csv(csv_docs)
    df = df.dropna()
    columns = df.columns
    contents = "This is a document that documents all the players who have the potential to become college football players.\n"
    for idx, player in df.iterrows():
        for column in columns:
            tcon = player[column]
            contents += f"The {column} of the player is {tcon}, "
        contents += '.\n'
    chatbot.text_chunks += chatbot.split_text_into_chunks(str(contents))
    chatbot.vector_datastore = chatbot.create_vector_datastore(chatbot.text_chunks)
    chatbot.conversation_chain = chatbot.create_conversation_chain(chatbot.vector_datastore)
    print("CSV uploaded sucussful",contents)
    return 'Success'
    
if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000)

