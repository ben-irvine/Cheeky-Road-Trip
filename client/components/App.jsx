import React from 'react'
import { HashRouter as Router, Route, Link } from 'react-router-dom'
import { connect } from 'react-redux'

import Login from './Login'
import Register from './Register'
import Nav from './Nav'
import { fetchAnimals } from '../actions/found'
import HomePage from './HomePage'
import { checkAuth } from '../actions/auth'


export class App extends React.Component {
  componentDidMount() {
    const confirmSuccess = () => { }
    this.props.dispatch(checkAuth(confirmSuccess))
    this.props.dispatch(fetchAnimals())
  }



  render() {
    const { auth } = this.props
    return (
      <Router>
        
        <div className="container has-text-centered">

          <div className="hero is-small is-primary">
            <div className="hero-body has-text-centered">
              <Link to='/' className="">
                <h1 className="title is-1">Lost and Found</h1>
              </Link>
              <Nav />
            </div>
          </div>

          <div className=''>
            {!auth.isAuthenticated &&
              <>
                <Route exact path="/" component={Login} />
              </>
            }
            {auth.isAuthenticated ? <HomePage /> : <></>}
            <Route path="/home" component={HomePage} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />

          </div>
        </div>
      </Router>
      
    )
  }
}

const mapStateToProps = ({auth, foundPets}) => {
  return {
    auth,
    foundPets
  }
}

export default connect(mapStateToProps)(App)
