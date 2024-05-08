import React, { Component } from 'react'
import { Upload, Divider, Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons';
import ReactQuill, { Quill } from 'react-quill';
import { ImageDrop } from 'quill-image-drop-module';
import 'react-quill/dist/quill.snow.css';
import lrz from 'lrz';
import SnowflakeId from "snowflake-id";
import PersonMessageHeader from './PersonMessageHeader/PersonMessageHeader'
import Dialogue from './Dialogue/Dialogue'
import { getToken } from '../../../../utils/request/auth'
import {baseUrl,post} from '../../../../utils/request/http'
import './PersonMessage.css'

const snowflake = new SnowflakeId({
    mid: 42,
    offset: (2019 - 1970) * 31536000 * 1000
});
Quill.register('modules/imageDrop', ImageDrop);

class PersonMessage extends Component {
    state = {
        myMessage: [],
        lastEditIndex: '',
        value: '',
        sendMessage: ''
    }
    modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
            ['link', 'image'],
            ['clean'],
        ],
        imageDrop: true,
        keyboard: {
            bindings: {
                enter: {
                    key: 13,
                    handler: (range, context) => {
                        // console.log('enter');
                        let ops = this.reactQuillRef.getEditor().getContents().ops
                        // console.log(ops)
                        this.setState({ sendMessage: ops }, () => {
                            this.addMessage();
                        })
                    }
                },
            }
        }
    }
    formats = ['bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'indent', 'link', 'image',]



    static getDerivedStateFromProps(nextProps, nextState) {//preState
        //TODO here should have a query based on id
        // console.log('nextProps',nextProps.location.state)//id,messageIcon
        const { messageIcon, color } = nextProps.location.state
        //TODO icon query
        let myState = nextState.myMessage
        myState.map((s) => {
            return (s.color = color, s.icon = messageIcon)
        })
        const myIcon = getToken('nickName')
        let m = []
        if (myState.length === 0) {
            return {
                myMessage: m
            }
        } else {
            return {
                myMessage: myState
            }
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.location.state.id === nextProps.location.state.id && nextState.myMessage.length === this.state.myMessage.length) {
            return false
        } else {
            this.setState({ value: '' })
            return true
        }
    }

    pickEmoji = (emoji, event) => {
        const { lastEditIndex } = this.state
        var range = lastEditIndex;
        let position = range ? range.index : 0;
        this.reactQuillRef.getEditor().insertText(position, emoji.native);
        this.reactQuillRef.focus()
        this.reactQuillRef.getEditor().setSelection(position + 2);
    }
    //convert base 64 to blob
    dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }
    //convert blob to file
    blobToFile(theBlob, fileName) {
        theBlob.lastModifiedDate = new Date();  // last modified date
        theBlob.name = fileName;                // file name
        return new File([theBlob], fileName, { type: theBlob.type, lastModified: Date.now() });
    }
    //function of add message
    addMessage = () => {
        const { myMessage, sendMessage } = this.state
        let value = sendMessage
        let length = value.length
        if (value.length !== 0) {
            if (!value[length - 1].insert.image) {
                if (value[length - 1].insert === '\n' || value[length - 1].insert === '\n\n') {
                    value = value.slice(0, -1)
                }
            }
            //delete \n\n or \n in the end
            for (let i = 0; i < value.length; i++) {
                if (!value[i].insert.image) {
                    let tt = value[i].insert
                    value[i].insert = tt.slice(0, tt.length - 1)
                }
            }
            if (value.length === 0) {
                message.info('The message cannot be empty, please enter your message');
            } else {
                //base64 to file
                let temp = value
                for (let i = 0; i < temp.length; i++) {
                    if (temp[i].insert.image) {
                        var id = snowflake.generate();
                        //if it is image, compress it
                        const file = this.blobToFile(this.dataURLtoBlob(temp[i].insert.image), id)
                        console.log("file",file)
                        //compress
                        lrz(file,{quality : 0.2,fieldName :file.name})
                            .then(function (rst) {
                                // if success
                                console.log(rst);
                            })
                            .catch(function (err) {
                                console.log("Compressed error",err)
                            })
                            .always(function () {
                               
                            });
                    }
                }
                
                let newArr = myMessage
                newArr = newArr.concat({ id: myMessage.length + 1, color: '"#00B853"', icon: 'gk', position: 'right', info: value })
                this.setState({ myMessage: newArr, value: '', sendMessage: '' })
                post('/api/handle_input', value).then(response => {
                    response.id = newArr.length + 1
                    console.log(response.id)
                    newArr = newArr.concat(response)
                    this.setState({ myMessage: newArr, value: '', sendMessage: '' })
                  }).catch(err => {
                    console.log(err);
                  });
            }

        } else {
            message.info('The message cannot be empty, please enter your message');
        }
        this.reactQuillRef.focus()
    }
    onKeyup = (e) => {
        if (e.keyCode === 13) {
            if (window.event.ctrlKey) {
                var range = this.reactQuillRef.getEditor().getSelection();
                let position = range ? range.index : 0;
                this.reactQuillRef.getEditor().insertText(position, "\n");
                this.reactQuillRef.focus()
                this.reactQuillRef.getEditor().setSelection(position + 1);
            }
        }
    }
    blur = () => {
        var range = this.reactQuillRef.getEditor().getSelection();
        this.setState({ lastEditIndex: range })
    };
    render() {
        const { value } = this.state
        const props = {
            name: 'file',
            action: baseUrl+'/api/handle_upload',
            headers: {
              authorization: 'authorization-text',
            },
            showUploadList:"false",
            onChange(info) {
              if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
              }
              if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
              } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
              }
            },
          };
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <div className='personMessage_padd'>
                    <PersonMessageHeader {...this.props.location.state} />
                </div>
                <div className='person_line_padd'><Divider /></div>
                <div className='personMessageMain'>
                    <Dialogue {...this.state.myMessage} />
                </div>
                <div className='person_line_padd'><Divider /></div>
                <div style={{ marginTop: "10px" }} className='uploader_area'>
                <Upload {...props} className='uploader' accept=".csv" action={baseUrl+'/api/upload_csv'}>
                    <Button icon={<UploadOutlined />}>Upload Table</Button>
                </Upload>
                <Upload {...props} className='uploader' accept=".pdf">
                    <Button icon={<UploadOutlined />}>Upload Report</Button>
                </Upload>
                <div className='person_line_padd'><Divider /></div>
                </div>
                <div style={{ 'marginRight': '5px' }} onBlurCapture={this.blur}>
                    <ReactQuill
                        className='personMessage_textArea'
                        modules={this.modules}
                        formats={this.formats}
                        onChange={this.handleChange}
                        value={value}
                        theme="snow"
                        onKeyUp={this.onKeyup}
                        ref={c => {
                            if (c) {
                                this.reactQuillRef = c;
                                c.focus()
                            }
                        }
                        }
                    />
                </div>
                <div style={{ padding: "0px 10px 10px 10px", 'float': 'right' }}>
                    <span style={{ marginRight: '15px', fontSize: '13px', 'color': '#BDBDBD', 'fontWeight': '300' }}>Press Enter to send message, Enter+Ctrl into next line</span>
                    <Button type="primary" size="middle" style={{ 'borderRadius': '5px' }} onClick={this.addMessage}>
                        Send
                    </Button>
                </div>
            </div>

        )
    }
}
export default PersonMessage
