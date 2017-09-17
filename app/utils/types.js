// @flow

export type Image = {
  name: string,
  id: string,
  path: string,
  data: any,
  metadata?: any
};

export type MainMessage = {
  type: string,
  payload: {
    info?: string
  }
};
