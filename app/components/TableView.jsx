// @flow
import fs from 'fs'
import React from 'react'
import cx from 'classnames'
import { keys, head } from 'ramda'
import { Dialog, Button } from '@blueprintjs/core'
import { connect } from 'react-redux'
import { remote } from 'electron'

import { getCSVString } from '../utils/csv'

class TableView extends React.PureComponent {
  render () {
    const { images, themeName, isOpen, onClose } = this.props
    const colNames = keys(head(images))
    const today = new Date().toLocaleDateString().replace(/\//g, '-')
    return (
      <Dialog
        className={cx(themeName, 'dialog--wide')}
        isOpen={isOpen}
        onClose={onClose}
        title='Data Table'
      >
        <div className='p-20'>
          <Button
            onClick={() => {
              const CSVString = getCSVString(colNames, images)
              remote.dialog.showSaveDialog(
                {defaultPath: `data-${today}.csv`},
                (filePath) => {
                  filePath && fs.writeFileSync(filePath, CSVString)
                }
              )
            }}
          >Export as CSV</Button>
          <div style={{overflow: 'scroll'}}>
            <table className='pt-table pt-striped pt-interactive mt-30'>
              <thead>
                <tr>
                  {colNames.map((columnName, i) => <th key={i}>{columnName}</th>)}
                </tr>
              </thead>
              <tbody>
                {images.map((image, i) => (
                  <tr key={i}>
                    {colNames.map((key, j) => <td key={j}>{image[key]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Dialog>
    )
  }
}

export default connect(state => ({
  themeName: state.layout.themeName,
}))(TableView)
