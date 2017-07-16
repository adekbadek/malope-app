// @flow
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import styles from './Home.sass'

export default class Home extends Component {
  render () {
    return (
      <div className='ph3 ph5-ns'>
        <div className={styles.container} data-tid='container'>
          <h2>Image Tagger</h2>
          <Link to='/counter'>to Counter</Link>
        </div>
      </div>
    )
  }
}
