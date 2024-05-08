# -*- coding: utf-8 -*-
import pandas as pd
import numpy as np
from PyPDF2 import PdfReader
from langchain.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI
from langchain.chat_models import ChatOllama
from langchain.chains import ConversationalRetrievalChain
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings, OpenAIEmbeddings
import torch
from langchain.document_loaders.csv_loader import CSVLoader
from openai import OpenAI

with open(".env","r") as f:
    env_line = f.readlines()[0]
    t_api_key = env_line.split("=")[-1]

class ChatBot:

    def __init__(self):
        self.extracted_text = None
        self.text_chunks = None
        self.vector_datastore = None
        self.conversation_chain = None
    """# PDF Extraction"""
    
    def updatebypdf(self,paths=["Ads cookbook .pdf"],is_pdf=True):
        # PDF Extraction
        if is_pdf:
            self.extracted_text = self.extract_text_from_pdf_folder(paths)
        else:
            with open(r"generated_data/High_school_player_information.txt","r") as f:
                self.extracted_text = f.read()
            # loader = CSVLoader(file_path='download.csv')
            # self.extracted_text = loader.load()	
            print("TXT Extraction Completed")
        print("PDF Extraction Completed")
        # Text Chunk
        if not self.text_chunks:
            self.text_chunks = self.split_text_into_chunks(str(self.extracted_text))
        else:
            self.text_chunks += self.split_text_into_chunks(str(self.extracted_text))
        print("Text Chunk Completed")
        print(len(self.text_chunks))
        print(self.text_chunks[-1])


        # Vector _Datastore
        self.vector_datastore = self.create_vector_datastore(self.text_chunks)  # Assuming you have the text chunks
        print("Vectorizing Completed")
        # Conversation Chain
        self.conversation_chain = self.create_conversation_chain(self.vector_datastore)
	

    def get_image(self,prompt_str):
        client = OpenAI(api_key = t_api_key)
        response = client.images.generate(
            model="dall-e-2",
            prompt=prompt_str,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        image_url = response.data[0].url
        return image_url

    def extract_text_from_pdf_folder(self,pdf_docs):
        text = ""
        for pdf in pdf_docs:
            pdf_reader = PdfReader(pdf)
            for page in pdf_reader.pages:
                t = page.extract_text()
                t = t.replace("..","")
                text+=t
        return text


    """# Text Chunk"""
    def split_text_into_chunks(self,text_data):
        if isinstance(text_data, str):
            splitter = CharacterTextSplitter(separator="\n", chunk_size=500, chunk_overlap=100,length_function=len)
            chunks = splitter.split_text(text_data)
            return chunks
        else:
            raise ValueError("text_data should be a string")

    """# Vector DataStore"""


    def create_vector_datastore(self,text_chunks):
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2")
        vectorstore = FAISS.from_texts(texts=text_chunks, embedding=embeddings)
        return vectorstore



    def get_user_question(self):
        user_input = input("Question: ")
        if user_input.lower() != 'exit':
            user_input_2 = 100
            return user_input, user_input_2
        return user_input, 0

    def create_conversation_chain(self,vectorstore):
        llm = ChatOpenAI(openai_api_key=t_api_key,
            max_tokens=1000)
        """llm = ChatOllama(
                model="llama2:7b-chat",
                max_tokens=1000,
                )"""
        memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)
        conversation_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vectorstore.as_retriever(
                search_type="similarity", search_kwargs={"k": 4}),
            memory=memory,
            max_tokens_limit=4000
        )
        return conversation_chain

def main():
    chatbot = ChatBot()
    chatbot.updatebypdf(is_pdf=False)
    while True:
        user_question, max_length = chatbot.get_user_question()
        if user_question.lower() == 'exit':
            print("Exiting the program. Goodbye!")
            break
        response = chatbot.conversation_chain({'question': user_question})
        print("AI: ",response['answer'])
    # pdf_file.close()
if __name__ == "__main__":
    main()
