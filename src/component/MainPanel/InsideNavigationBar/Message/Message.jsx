import React, { Component } from 'react'
import PubSub from 'pubsub-js'
import MessageItem from './MessageItem/MessageItem'

class Message extends Component {
    state = { messages: [], parentClick: 0 }
    componentDidMount() {
        //need a request here
        let m = [
            { id: 0, name: "AI scout", messageIcon: 'icon-morentouxiang', lastMessage: '', color: '#00B853' , team:'', myTime:'09:30'},
            { id: 1, name: "Team group chat", messageIcon: 'icon-shuyi_qunliao', lastMessage: 'Welcome Jack!~', color: '#0089FF',team:'Belongs to xx high school football',myTime:'11-14' }
        ]
        this.setState({ messages: m })
    }
    deleteTodo = (id, isClick) => {
        let copy = this.state.messages
        let copydArr = copy.filter((x) => x.id !== id);
        let check = 0;
        let length = copydArr.length
        if (isClick === true) {
            //Selected delete
            if (length > 0) {
                for (let i = id + 1; i <= copydArr[length - 1].id; i++) {
                    let temp = copydArr.filter(x => x.id === i);
                    if (temp.length > 0) {
                        check = temp[0].id
                        break
                    } else {
                        if (copydArr.length > 0) {
                            check = copydArr[0].id
                        }
                    }
                }
                this.setState({ messages: copydArr }, () => {
                    PubSub.publish('messageItem', { id: check })
                })
            } else {
                this.setState({ messages: copydArr })
            }
        } else {
            this.setState({ messages: copydArr })
        }

    }
    render() {
        return (
            <div>
                {
                    this.state.messages.map((m) => {
                        return <MessageItem key={m.id} {...m} deleteTodo={this.deleteTodo} parentClick={this.state.parentClick} />
                    })
                }
            </div>
        )
    }
}
export default Message