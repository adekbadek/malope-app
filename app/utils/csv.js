import { parse } from 'csv'
import fs from 'fs'

export const parseCSVFile = (filePath: string, delimiter: string) => new Promise((resolve, reject) => {
  const fileContents = fs.readFileSync(filePath, 'utf8')
  parse(fileContents, {columns: true, relax_column_count: true, auto_parse: true, delimiter}, (err, table) => {
    err ? reject(err) : resolve(table)
  })
})

export const MOD = '%'
export const IMAGE_NAME_KEY = 'IT_IMAGE_NAME'
