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

class MessageBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {value: ''}

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(event) {
        this.setState({value: event.target.value})
    }

    handleSubmit(event) {
        event.preventDefault()
        this.props.sendMessage(this.state.value)
        this.setState( { value: '' } )
    }

    render() {

        return (

            <form onSubmit={this.handleSubmit} className="input-group" autoComplete="off">
                <input id="btn-input" type="text" className="form-control input-sm" placeholder="Type your message here..."
                       value={this.state.value} onChange={this.handleChange} autoFocus/>
                <span className="input-group-btn">
            <button className="btn btn-warning btn-sm" id="btn-chat" type="submit">
              Send</button>
          </span>
            </form>
        )
    }
}

export default MessageList