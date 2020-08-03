import React, { Component } from "react";
import ReactDOM from "react-dom";
import App from "../app";

const y = 6;
function Welcome(props) {
  return (
    <h1>
      Hello , {props.name} , {y}
    </h1>
  );
}
class Controller extends Component {
  sayHello(props) {
    alert(y);
  }

  render() {
    return (
      // <div>
      //  <Welcome name="Berke" />
      //  <Welcome name="Abc" />
      // //<button onClick={this.sayHello}>Hello All</button>
      //  </div>
      <div></div>
    );
  }
}

export default Controller;
