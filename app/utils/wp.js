import base64 from 'base-64'
import fs from 'fs'
import blobUtil from 'blob-util'
import { path, without, find } from 'ramda'

import { createTableFromObject } from './helpers'

export const ajaxer = (
  {username, password, endpoint},
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

  fetch(`${endpoint}/${url}`.replace(/([^:])(\/\/+)/g, '$1/'), {
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
        '/media',
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

const getTags = (creds) => ajaxer(creds, '/tags')

const createPostWithFeaturedImage = (creds, image, featuredImageId, tagIds) => {
  const data = path(['data', 'fields'], image)
  return ajaxer(
    creds,
    '/posts',
    null,
    JSON.stringify({
      title: data.Title || data.title || image.name,
      featured_media: featuredImageId,
      content: data ? createTableFromObject(data) : '',
      tags: tagIds,
      status: 'publish'
    }),
    null,
    'POST',
  )
}

const createTag = creds => name => ajaxer(creds, '/tags', null, JSON.stringify({name}), null, 'POST')

const getTagIds = (creds, image) => new Promise((resolve, reject) => {
  const imageTags = path(['data', 'tags'], image)
  if (imageTags && imageTags.length > 0) {
    getTags(creds)
      .then(tags => {
        const foundTags = tags.filter(({name, id}) => find(tag => tag === name, imageTags))
        const notFoundInWP = without(foundTags.map(v => v.name), imageTags)

        const tagIdsToAdd = foundTags.map(v => v.id)

        if (notFoundInWP.length > 0) {
          Promise.all(notFoundInWP.map(createTag(creds)))
            .then(res => {
              const allTagsToAdd = [...tagIdsToAdd, ...res.map(v => v.id)]
              resolve(allTagsToAdd)
            })
            .catch(reject)
        } else {
          resolve(tagIdsToAdd)
        }
      })
      .catch(reject)
  } else {
    resolve([])
  }
})

export const createPostFromImage = (creds, image) => new Promise((resolve, reject) => {
  getTagIds(creds, image)
    .then(tagIds => {
      addMedia(creds, image)
        .then(({id}) => {
          createPostWithFeaturedImage(creds, image, id, tagIds)
            .then(resolve)
            .catch(reject)
        })
        .catch(reject)
    })
    .catch(reject)
})
