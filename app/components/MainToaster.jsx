// @flow
import { Position, Toaster, Intent } from '@blueprintjs/core'

export const MainToaster = Toaster.create({
  position: Position.TOP,
})

export const showWarning = (message: string | error) => {
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
