/**
 * edit time:2023/11/26
 */
 import React, {Component} from "react";
 import {Route} from "react-router-dom";
 import { getToken } from "../request/auth";
 import { TOKEN } from "../constant";
 class FrontendAuth extends Component {
     
     render() {
        const {component, path} = this.props; 
        return (<Route path={path} component={component}></Route> ) 
     }
 }
 
 export default FrontendAuth;
 