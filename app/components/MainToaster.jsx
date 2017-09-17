// @flow
import React from 'react'
import { ipcRenderer } from 'electron'
import cx from 'classnames'
import { ProgressBar, Position, Toaster, Intent } from '@blueprintjs/core'

export const MainToaster = Toaster.create({
  position: Position.TOP,
})

export const showWarning = (message: string | Error) => {
  MainToaster.show({
    message: message.toString(),
    className: 'pt-intent-warning',
    intent: Intent.WARNING,
    iconName: 'warning-sign',
  })
}

export const showInfo = (message: string, timeout: number = 1000) => {
  MainToaster.show({
    message,
    timeout,
    className: 'pt-intent-success',
    intent: Intent.SUCCESS,
    iconName: 'tick',
  })
}

export const showDownloadedUpdateInfo = (version: string) => {
  MainToaster.show({
    action: {
      onClick: () => {
        ipcRenderer.send('sync', {type: 'perform-update'})
      },
      text: 'Quit & install',
    },
    message: `update to ${version} available`,
    timeout: 20 * 1000,
    className: 'pt-intent-primary',
    intent: Intent.PRIMARY,
    iconName: 'info-sign',
  })
}

let progressToast
const renderProgressToast = amount => ({
  className: 'pt-dark flex--center-h',
  iconName: 'download',
  message: (
    <ProgressBar
      className={cx('docs-toast-progress', { 'pt-no-stripes': amount >= 100 })}
      intent={amount < 100 ? Intent.PRIMARY : Intent.SUCCESS}
      value={amount / 100}
    />
  ),
  timeout: amount < 100 ? 0 : 2000,
})
export const downloadProgressInfo = (amount: number) => {
  if (progressToast) {
    MainToaster.update(progressToast, renderProgressToast(amount))
  } else {
    progressToast = MainToaster.show(renderProgressToast(amount))
  }
}
