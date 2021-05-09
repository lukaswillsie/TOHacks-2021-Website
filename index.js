'use strict';

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

const e = React.createElement;

class Microphone extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: false
		};
		this.onClick = this.onClick.bind(this);
	}

	onClick() {
		this.setState({selected: true});
		startDictation(
			(text) => {
				this.setState({selected: false}); this.props.update(text);
			}
		);
	}

	render() {
		return (
			<i className="fas fa-microphone" onClick={this.onClick} id="microphone" style={{background: this.state.selected ? "#44E5FF" : "none"}}></i>
		);
	}
}

class Process extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			query: null,
			result: null
		}
		this.processText = this.processText.bind(this);
		this.processResult = this.processResult.bind(this);
	}

	processText(text) {
			this.setState({query: text, result: null});
			callBackend(text, this.processResult);
	}

	processResult(result) {
			this.setState({query: this.state.query, result: result});
	}

	render() {
		return [
		(
			<div id="search" key="0">
					<InputBar update={this.processText}/>
					<Microphone update={this.processText}/>
			</div>
		),
		(
			<div id="result" key="1">
				<ResultWindow query={this.state.query} result={this.state.result}/>
			</div>
		)
	];
	}
}

class InputBar extends React.Component {
	_handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.props.update(this.refs.inputBar.value);
    }
  }

	render() {
		return (
			<input type="text" placeholder="Enter a command" id="inputbar" ref="inputBar" onKeyDown={this._handleKeyDown}/>
		);
	}
}

class ResultWindow extends React.Component {
	constructor(props) {
			super(props);
			this.state = {
				queryPrinted: false
			}
	}

	componentDidUpdate(prevProps) {
		if(this.props.query !== prevProps.query && this.props.query) {
			this.setState({
				queryPrinted: false
			});
		}
	}

	render() {
		return (
			<div id="displayWindow">
				<div id="displayQuery">
					<span>~ </span><TypeOut text={this.props.query} done={() => this.setState({queryPrinted: true})}/>
					<br/>
					{this.state.queryPrinted ? <TypeOut text={this.props.result} done={() => {}}/> : <span></span>}
				</div>
			</div>
		);
	}
}

class TypeOut extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			length: 0
		}
		this.handleTick = this.handleTick.bind(this);
	}

	componentDidMount() {
		if(this.props.text) {
			this.handleTick();
		}
  }

	componentDidUpdate(prevProps) {
		if(this.props.text !== prevProps.text && this.props.text) {
			this.state.length = 0;
			this.handleTick();
		}
	}

	handleTick() {
		if(this.state.length == this.props.text.length) {
			this.props.done();
			return;
		}

		this.setState({
			length: this.state.length + 1
		});
		setTimeout(this.handleTick, 30);
	}

	render() {
		return (
			this.props.text ? <span>{this.props.text.substring(0,this.state.length).trim()}<span id="cursor"></span></span> : <span></span>
		);
	}
}

class ResultDisplay extends React.Component {
	render() {
		return (
			<div id="displayResult">
				<span>Result: </span><TypeOut text={this.props.result}/>
			</div>
		);
	}
}

function callBackend(text, callback) {
	fetch(`https://eastern-cosmos-313116.ue.r.appspot.com/ping?text=${text}`)
  .then(response => response.json())
  .then(data => callback(data.result));
}

function startDictation(callback) {
	if (window.hasOwnProperty('webkitSpeechRecognition')) {
			var recognition = new webkitSpeechRecognition();

			recognition.continuous = false;
			recognition.interimResults = false;
			recognition.lang = "en-US";
			recognition.start();

			recognition.onresult = function (e) {
				document.getElementById('inputbar').value = e.results[0][0].transcript;
				recognition.stop();
				callback(e.results[0][0].transcript);
			};

			recognition.onerror = function(e) {
				recognition.stop();
			}
	}
}

const domContainer = document.querySelector('#main_container');
ReactDOM.render(e(Process), domContainer);
//
// // Get the input field
// var input = document.getElementById("inputbar");
//
// // Execute a function when the user releases a key on the keyboard
// input.addEventListener("keyup", function(event) {
//   // Number 13 is the "Enter" key on the keyboard
//   if (event.keyCode === 13) {
//     // Cancel the default action, if needed
//     event.preventDefault();
//     // Trigger the button element with a click
//     callBackend(document.getElementById('inputbar').value, );
//   }
// });
