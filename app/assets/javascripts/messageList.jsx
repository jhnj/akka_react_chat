import React from 'react'

class MessageList extends React.Component {
    render() {
        const msgNodes = this.props.data.map((msg, i) => {
            return (
                <li className="right clearfix" key={i.toString()}>
                    <ChatMessage user={msg.user} message={msg.message} />
                </li>
            )
        })
        return (
            <ul className="message-list">
                {msgNodes}
            </ul>
        )
    }
}

class ChatMessage extends React.Component {
    render() {
        return (
            <div className="chat-body clearfix">
                <div className="header">
                    <strong className="primary-font">{this.props.user}</strong>
                    {/*<small className="text-muted pull-right">*/}
                    {/*<span className="glyphicon glyphicon-time"/>12 mins ago*/}
                    {/*</small>*/}
                </div>
                <p>
                    {this.props.message}
                </p>
            </div>
        )
    }
}


export default MessageList