import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import '../scss/App.scss';
import Home from './Home';

export default class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <div className="container">
                    <Switch>
                        <Route exact path='/' component={Home} />
                        <Route render={() => <p>Not found</p>} />
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }
}