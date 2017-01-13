import  React from 'react'

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

export default MessageBox