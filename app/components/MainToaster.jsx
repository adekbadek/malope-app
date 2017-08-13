// @flow
import { Position, Toaster, Intent } from '@blueprintjs/core'

export const MainToaster = Toaster.create({
  position: Position.TOP,
})

export const showWarning = (message: string) => {
  MainToaster.show({
    message,
    className: 'pt-intent-warning',
    intent: Intent.WARNING,
    iconName: 'warning-sign',
  })
}

export const showInfo = (message: string) => {
  MainToaster.show({
    message,
    timeout: 1000,
    className: 'pt-intent-success',
    intent: Intent.SUCCESS,
    iconName: 'tick',
  })
}
