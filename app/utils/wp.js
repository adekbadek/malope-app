import base64 from 'base-64'
import fs from 'fs'
import blobUtil from 'blob-util'
import { path } from 'ramda'

import { createTableFromObject } from './helpers'

export const ajaxer = (
  {username, password},
  url,
  blob = null,
  body = null,
  imageName = '',
  method = 'GET'
) => new Promise((resolve, reject) => {
  const headers = new Headers()

  headers.append('Authorization', `Basic ${base64.encode(`${username}:${password}`)}`)
  if (blob) {
    headers.append('Content-Disposition', `attachment; filename="imagejo.jpg"`)
    headers.append('Content-Type', `application/x-www-form-urlencoded`)
  }
  if (body) {
    headers.append('Content-Type', `application/json`)
  }

  fetch(url.replace(/([^:])(\/\/+)/g, '$1/'), {
    method,
    headers,
    ...body && {body},
    ...blob && {body: blob},
  })
    .then(res => res.json())
    .then(resolve)
    .catch(reject)
})

const addMedia = (creds, {path, name}) => new Promise((resolve, reject) => {
  blobUtil.binaryStringToBlob(fs.readFileSync(path).toString('binary'))
    .then(blob => {
      ajaxer(
        creds,
        `${creds.endpoint}/media`,
        blob,
        null,
        name,
        'POST',
      )
        .then(resolve)
        .catch(reject)
    })
    .catch(reject)
})

const createPostWithFeaturedImage = (creds, image, featuredImageId) => {
  const data = path(['data', 'fields'], image)
  return ajaxer(
    creds,
    `${creds.endpoint}/posts`,
    null,
    JSON.stringify({
      title: data.Title || data.title || image.name,
      featured_media: featuredImageId,
      content: data ? createTableFromObject(data) : '',
      status: 'publish'
    }),
    null,
    'POST',
  )
}

export const createPostFromImage = (creds, image) => new Promise((resolve, reject) => {
  addMedia(creds, image)
    .then(({id}) => {
      createPostWithFeaturedImage(creds, image, id)
        .then(resolve)
        .catch(reject)
    })
    .catch(reject)
})
